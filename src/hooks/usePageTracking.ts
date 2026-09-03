import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { track } from "@/lib/tracking";

/** Registra pageview a cada troca de rota e o tempo gasto na página anterior. */
const usePageTracking = () => {
  const { pathname } = useLocation();
  const startedAt = useRef<number>(Date.now());
  const previous = useRef<string | null>(null);

  useEffect(() => {
    const now = Date.now();
    if (previous.current) {
      track({
        event_type: "page_exit",
        path: previous.current,
        label: "Tempo na página",
        duration_ms: now - startedAt.current,
      });
    }
    previous.current = pathname;
    startedAt.current = now;
    track({ event_type: "pageview", path: pathname });
  }, [pathname]);

  useEffect(() => {
    const onLeave = () => {
      if (!previous.current) return;
      track({
        event_type: "page_exit",
        path: previous.current,
        label: "Saída do site",
        duration_ms: Date.now() - startedAt.current,
      });
    };
    window.addEventListener("pagehide", onLeave);
    return () => window.removeEventListener("pagehide", onLeave);
  }, []);
};

export default usePageTracking;
