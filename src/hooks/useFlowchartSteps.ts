import { useMemo, useState } from "react";
import { toast } from "sonner";
import { useFlowchartDetail, type FlowNode } from "@/hooks/useContent";
import { useCrud } from "@/hooks/useCrud";
import type { Draft } from "@/components/admin/FlowchartStepForm";

export const useFlowchartSteps = (flowchartId: string) => {
  const { data, isLoading } = useFlowchartDetail(flowchartId);
  const nodeCrud = useCrud("flowchart_nodes", ["flowchart_detail", "flowchart"]);
  const edgeCrud = useCrud("flowchart_edges", ["flowchart_detail", "flowchart"]);
  const [saving, setSaving] = useState(false);

  const nodes = useMemo(() => data?.nodes ?? [], [data?.nodes]);
  const edges = useMemo(() => data?.edges ?? [], [data?.edges]);

  const incoming = (nodeId: string) => edges.filter((e) => e.target_node_id === nodeId);

  const itemsArray = (raw: string) =>
    raw
      .split("\n")
      .map((i) => i.replace(/^[-•*]\s*/, "").trim())
      .filter(Boolean);

  const syncEdges = async (nodeId: string, draft: Draft) => {
    const existing = incoming(nodeId);
    const label = draft.edgeLabel.trim() || null;
    for (const edge of existing) {
      if (!draft.prevIds.includes(edge.source_node_id)) {
        await edgeCrud.remove(edge.id, "");
      } else if ((edge.label ?? null) !== label) {
        await edgeCrud.silentUpdate(edge.id, { label });
      }
    }
    for (const prev of draft.prevIds) {
      if (!existing.some((e) => e.source_node_id === prev)) {
        await edgeCrud.insert(
          {
            flowchart_id: flowchartId,
            source_node_id: prev,
            target_node_id: nodeId,
            label,
          },
          "",
        );
      }
    }
  };

  /** Creates or updates a step. Pass editingId = null to create. */
  const saveStep = async (draft: Draft, editingId: string | null) => {
    if (!draft.title.trim()) {
      toast.error("Informe o título da etapa");
      return false;
    }
    setSaving(true);
    try {
      const payload = {
        title: draft.title.trim(),
        node_type: draft.node_type,
        items: itemsArray(draft.items),
        description: draft.description,
        owner: draft.owner || null,
        system: draft.system || null,
        notes: draft.notes || null,
      };
      if (editingId) {
        await nodeCrud.update(editingId, payload, "Etapa atualizada");
        await syncEdges(editingId, draft);
      } else {
        const created = await nodeCrud.insert(
          {
            ...payload,
            flowchart_id: flowchartId,
            sort_order: nodes.length + 1,
            position_x: 0,
            position_y: nodes.length * 140,
          },
          "Etapa adicionada",
        );
        if (created && typeof created !== "boolean") await syncEdges(created.id, draft);
      }
      return true;
    } finally {
      setSaving(false);
    }
  };

  const removeStep = async (node: FlowNode) => {
    for (const edge of edges.filter(
      (e) => e.source_node_id === node.id || e.target_node_id === node.id,
    )) {
      await edgeCrud.remove(edge.id, "");
    }
    await nodeCrud.remove(node.id, "Etapa removida");
  };

  const moveStep = async (index: number, direction: -1 | 1) => {
    const a = nodes[index];
    const b = nodes[index + direction];
    if (!a || !b) return;
    await nodeCrud.silentUpdate(a.id, { sort_order: b.sort_order });
    await nodeCrud.silentUpdate(b.id, { sort_order: a.sort_order });
  };

  return { nodes, edges, isLoading, saving, incoming, saveStep, removeStep, moveStep };
};
