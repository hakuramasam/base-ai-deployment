import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { RealtimeChannel } from "@supabase/supabase-js";

type TableName = "task_delegations" | "agent_messages" | "payment_transactions";

interface UseRealtimeOptions<T> {
  table: TableName;
  onInsert?: (record: T) => void;
  onUpdate?: (record: T) => void;
  enabled?: boolean;
}

export function useRealtimeSubscription<T extends Record<string, unknown>>({
  table,
  onInsert,
  onUpdate,
  enabled = true,
}: UseRealtimeOptions<T>) {
  const channelRef = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    if (!enabled) return;

    const channel = supabase
      .channel(`realtime-${table}`)
      .on(
        "postgres_changes" as any,
        { event: "INSERT", schema: "public", table },
        (payload: any) => onInsert?.(payload.new as T)
      )
      .on(
        "postgres_changes" as any,
        { event: "UPDATE", schema: "public", table },
        (payload: any) => onUpdate?.(payload.new as T)
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
    };
  }, [table, enabled]); // intentionally stable deps — callbacks via ref not needed for simple use

  return channelRef;
}
