/**
 * Supabase Realtime — sincronização em tempo real entre usuários.
 *
 * Usa postgres_changes (CDC) para receber INSERT / UPDATE / DELETE
 * via WebSocket e atualizar o state local automaticamente.
 */
import { getSupabase } from "./supabase";
import type { RealtimeChannel } from "@supabase/supabase-js";

type EventType = "INSERT" | "UPDATE" | "DELETE";

type Handler = {
  table: string;
  event?: EventType | "*";
  filter?: string;                       // ex: "produto_ref=eq.REF001"
  onInsert?: (row: any) => void;
  onUpdate?: (row: any) => void;
  onDelete?: (old: any) => void;
};

/**
 * Cria um canal Realtime que escuta N tabelas.
 * Retorna uma função `unsubscribe` para limpeza no useEffect.
 *
 * Exemplo de uso:
 * ```
 * useEffect(() => {
 *   const unsub = subscribeRealtime("produtos-sync", [
 *     { table: "produtos", onInsert: r => …, onUpdate: r => …, onDelete: r => … },
 *   ]);
 *   return unsub;
 * }, []);
 * ```
 */
export function subscribeRealtime(channelName: string, handlers: Handler[]): () => void {
  const sb = getSupabase();
  let channel: RealtimeChannel = sb.channel(channelName);

  for (const h of handlers) {
    const ev = h.event || "*";
    const opts: any = { event: ev, schema: "public", table: h.table };
    if (h.filter) opts.filter = h.filter;

    channel = channel.on("postgres_changes" as any, opts, (payload: any) => {
      const { eventType, new: newRow, old: oldRow } = payload;
      if (eventType === "INSERT" && h.onInsert) h.onInsert(newRow);
      if (eventType === "UPDATE" && h.onUpdate) h.onUpdate(newRow);
      if (eventType === "DELETE" && h.onDelete) h.onDelete(oldRow);
    });
  }

  channel.subscribe();

  return () => {
    sb.removeChannel(channel);
  };
}
