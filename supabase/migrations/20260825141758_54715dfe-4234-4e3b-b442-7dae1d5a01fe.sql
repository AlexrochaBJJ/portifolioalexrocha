ALTER TABLE public.flowchart_edges
  ADD COLUMN IF NOT EXISTS route_side text NOT NULL DEFAULT 'auto',
  ADD COLUMN IF NOT EXISTS lane_offset integer NOT NULL DEFAULT 0;