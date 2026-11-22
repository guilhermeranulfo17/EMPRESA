// Quantas pessoas já estão na lista da edição atual (para mostrar vagas restantes).
import { useEffect, useState } from "react";
import { API } from "@/lib/api";
import { EVENT } from "@/data/event";

let cache = null;

export function useVagas() {
  const [inscritos, setInscritos] = useState(cache);
  useEffect(() => {
    if (cache !== null || !EVENT.capacity) return;
    let vivo = true;
    fetch(`${API}/vagas`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (vivo && d && Number.isInteger(d.inscritos)) {
          cache = d.inscritos;
          setInscritos(d.inscritos);
        }
      })
      .catch(() => {});
    return () => {
      vivo = false;
    };
  }, []);

  const total = EVENT.capacity;
  if (!total || inscritos === null) return { total, inscritos: null, restantes: null };
  return { total, inscritos, restantes: Math.max(0, total - inscritos) };
}
