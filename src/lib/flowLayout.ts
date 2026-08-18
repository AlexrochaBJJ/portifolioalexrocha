export interface LayoutNodeInput {
  id: string;
  title: string;
  items?: string[] | null;
  node_type: string;
  sort_order?: number | null;
}

export interface LayoutEdgeInput {
  source_node_id: string;
  target_node_id: string;
}

export interface LayoutResult {
  positions: Record<string, { x: number; y: number }>;
  sizes: Record<string, { width: number; height: number }>;
  /** edges detected as loop-backs (target rank <= source rank) */
  backEdges: Set<string>;
}

const NODE_WIDTH = 230;
const H_GAP = 60;
const V_GAP = 90;
const BASE_HEIGHT = 64;
const ITEM_HEIGHT = 18;

const heightOf = (n: LayoutNodeInput) => {
  const items = n.items?.length ?? 0;
  const titleLines = Math.ceil(Math.max(n.title?.length ?? 0, 1) / 26);
  return BASE_HEIGHT + Math.max(titleLines - 1, 0) * 18 + items * ITEM_HEIGHT;
};

/**
 * Vertical (top-to-bottom) auto layout. Ranks come from the longest path from
 * any root; cycles are tolerated by ignoring edges that point back to an
 * already-visited ancestor.
 */
export const computeFlowLayout = (
  nodes: LayoutNodeInput[],
  edges: LayoutEdgeInput[],
): LayoutResult => {
  const byId = new Map(nodes.map((n) => [n.id, n]));
  const outgoing = new Map<string, string[]>();
  const indegree = new Map<string, number>();
  nodes.forEach((n) => {
    outgoing.set(n.id, []);
    indegree.set(n.id, 0);
  });
  edges.forEach((e) => {
    if (!byId.has(e.source_node_id) || !byId.has(e.target_node_id)) return;
    outgoing.get(e.source_node_id)!.push(e.target_node_id);
    indegree.set(e.target_node_id, (indegree.get(e.target_node_id) ?? 0) + 1);
  });

  const orderOf = (id: string) => byId.get(id)?.sort_order ?? 0;

  const rank = new Map<string, number>();
  const roots = nodes
    .filter(
      (n) => (indegree.get(n.id) ?? 0) === 0 || n.node_type === "start",
    )
    .map((n) => n.id);
  const seeds = roots.length > 0 ? roots : nodes.slice(0, 1).map((n) => n.id);

  // longest-path ranking with cycle protection
  const visit = (id: string, depth: number, stack: Set<string>) => {
    if (stack.has(id)) return;
    const current = rank.get(id);
    if (current !== undefined && current >= depth) return;
    rank.set(id, depth);
    stack.add(id);
    [...(outgoing.get(id) ?? [])]
      .sort((a, b) => orderOf(a) - orderOf(b))
      .forEach((next) => visit(next, depth + 1, stack));
    stack.delete(id);
  };
  seeds.forEach((id) => visit(id, 0, new Set()));
  // any node not reached (isolated / inside a cycle) gets its own rank
  nodes.forEach((n, i) => {
    if (!rank.has(n.id)) rank.set(n.id, i);
  });

  const levels = new Map<number, string[]>();
  nodes.forEach((n) => {
    const r = rank.get(n.id) ?? 0;
    if (!levels.has(r)) levels.set(r, []);
    levels.get(r)!.push(n.id);
  });

  const sortedLevels = [...levels.keys()].sort((a, b) => a - b);
  const positions: Record<string, { x: number; y: number }> = {};
  const sizes: Record<string, { width: number; height: number }> = {};

  let y = 0;
  sortedLevels.forEach((level) => {
    const ids = levels.get(level)!.sort((a, b) => orderOf(a) - orderOf(b));
    const totalWidth = ids.length * NODE_WIDTH + (ids.length - 1) * H_GAP;
    let x = -totalWidth / 2;
    let maxHeight = BASE_HEIGHT;
    ids.forEach((id) => {
      const node = byId.get(id)!;
      const height = heightOf(node);
      maxHeight = Math.max(maxHeight, height);
      positions[id] = { x, y };
      sizes[id] = { width: NODE_WIDTH, height };
      x += NODE_WIDTH + H_GAP;
    });
    y += maxHeight + V_GAP;
  });

  const backEdges = new Set<string>();
  edges.forEach((e) => {
    const from = rank.get(e.source_node_id);
    const to = rank.get(e.target_node_id);
    if (from !== undefined && to !== undefined && to <= from) {
      backEdges.add(`${e.source_node_id}->${e.target_node_id}`);
    }
  });

  return { positions, sizes, backEdges };
};

export const NODE_LAYOUT_WIDTH = NODE_WIDTH;
