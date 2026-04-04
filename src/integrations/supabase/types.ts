export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      a2a_messages: {
        Row: {
          created_at: string | null
          direction: string
          id: string
          message_type: string
          payload: Json
          recipient: string
          sender: string
        }
        Insert: {
          created_at?: string | null
          direction: string
          id: string
          message_type: string
          payload: Json
          recipient: string
          sender: string
        }
        Update: {
          created_at?: string | null
          direction?: string
          id?: string
          message_type?: string
          payload?: Json
          recipient?: string
          sender?: string
        }
        Relationships: []
      }
      agent_api_keys: {
        Row: {
          agent_id: string | null
          created_at: string | null
          id: string
          key_ciphertext: string
          key_kms_ref: string | null
          provider: string
          revoked_at: string | null
          scopes: string[] | null
        }
        Insert: {
          agent_id?: string | null
          created_at?: string | null
          id: string
          key_ciphertext: string
          key_kms_ref?: string | null
          provider: string
          revoked_at?: string | null
          scopes?: string[] | null
        }
        Update: {
          agent_id?: string | null
          created_at?: string | null
          id?: string
          key_ciphertext?: string
          key_kms_ref?: string | null
          provider?: string
          revoked_at?: string | null
          scopes?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "agent_api_keys_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
        ]
      }
      agent_mcp_connections: {
        Row: {
          agent_id: string | null
          auth_ref: string | null
          auth_type: string | null
          base_url: string | null
          id: string
          last_seen: string | null
          server_name: string | null
          status: string | null
        }
        Insert: {
          agent_id?: string | null
          auth_ref?: string | null
          auth_type?: string | null
          base_url?: string | null
          id: string
          last_seen?: string | null
          server_name?: string | null
          status?: string | null
        }
        Update: {
          agent_id?: string | null
          auth_ref?: string | null
          auth_type?: string | null
          base_url?: string | null
          id?: string
          last_seen?: string | null
          server_name?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "agent_mcp_connections_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
        ]
      }
      agent_messages: {
        Row: {
          content: string
          created_at: string
          from_agent_id: string
          id: string
          message_type: string
          metadata: Json | null
          status: string
          to_agent_id: string
        }
        Insert: {
          content: string
          created_at?: string
          from_agent_id: string
          id?: string
          message_type?: string
          metadata?: Json | null
          status?: string
          to_agent_id: string
        }
        Update: {
          content?: string
          created_at?: string
          from_agent_id?: string
          id?: string
          message_type?: string
          metadata?: Json | null
          status?: string
          to_agent_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "agent_messages_from_agent_id_fkey"
            columns: ["from_agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agent_messages_to_agent_id_fkey"
            columns: ["to_agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
        ]
      }
      agent_services: {
        Row: {
          active: boolean | null
          agent_id: string | null
          capabilities: Json | null
          created_at: string | null
          id: string
          price_usdc: number | null
          service_name: string
          sla_json: Json | null
        }
        Insert: {
          active?: boolean | null
          agent_id?: string | null
          capabilities?: Json | null
          created_at?: string | null
          id: string
          price_usdc?: number | null
          service_name: string
          sla_json?: Json | null
        }
        Update: {
          active?: boolean | null
          agent_id?: string | null
          capabilities?: Json | null
          created_at?: string | null
          id?: string
          price_usdc?: number | null
          service_name?: string
          sla_json?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "agent_services_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
        ]
      }
      agent_tools: {
        Row: {
          active: boolean | null
          agent_id: string | null
          created_at: string | null
          endpoint: string
          id: string
          price_usdc: number | null
          schema_json: Json | null
          tool_name: string
        }
        Insert: {
          active?: boolean | null
          agent_id?: string | null
          created_at?: string | null
          endpoint: string
          id: string
          price_usdc?: number | null
          schema_json?: Json | null
          tool_name: string
        }
        Update: {
          active?: boolean | null
          agent_id?: string | null
          created_at?: string | null
          endpoint?: string
          id?: string
          price_usdc?: number | null
          schema_json?: Json | null
          tool_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "agent_tools_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
        ]
      }
      agent_wallets: {
        Row: {
          address: string
          agent_id: string | null
          chain: string | null
          created_at: string | null
          id: string
          status: string | null
          type: string | null
        }
        Insert: {
          address: string
          agent_id?: string | null
          chain?: string | null
          created_at?: string | null
          id: string
          status?: string | null
          type?: string | null
        }
        Update: {
          address?: string
          agent_id?: string | null
          chain?: string | null
          created_at?: string | null
          id?: string
          status?: string | null
          type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "agent_wallets_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
        ]
      }
      agents: {
        Row: {
          agent_type: string
          chain_id: number
          created_at: string
          description: string | null
          display_name: string | null
          fid: number | null
          id: string
          is_active: boolean
          metadata: Json | null
          name: string
          price_per_call: number | null
          skills: string[] | null
          status: string | null
          updated_at: string
          wallet_address: string
        }
        Insert: {
          agent_type?: string
          chain_id?: number
          created_at?: string
          description?: string | null
          display_name?: string | null
          fid?: number | null
          id?: string
          is_active?: boolean
          metadata?: Json | null
          name: string
          price_per_call?: number | null
          skills?: string[] | null
          status?: string | null
          updated_at?: string
          wallet_address: string
        }
        Update: {
          agent_type?: string
          chain_id?: number
          created_at?: string
          description?: string | null
          display_name?: string | null
          fid?: number | null
          id?: string
          is_active?: boolean
          metadata?: Json | null
          name?: string
          price_per_call?: number | null
          skills?: string[] | null
          status?: string | null
          updated_at?: string
          wallet_address?: string
        }
        Relationships: []
      }
      api_calls: {
        Row: {
          caller_agent_id: string | null
          created_at: string | null
          id: string
          nonce: string | null
          price_usdc: number | null
          provider_agent_id: string | null
          service_id: string | null
          status: string | null
          tool_id: string | null
          updated_at: string | null
        }
        Insert: {
          caller_agent_id?: string | null
          created_at?: string | null
          id: string
          nonce?: string | null
          price_usdc?: number | null
          provider_agent_id?: string | null
          service_id?: string | null
          status?: string | null
          tool_id?: string | null
          updated_at?: string | null
        }
        Update: {
          caller_agent_id?: string | null
          created_at?: string | null
          id?: string
          nonce?: string | null
          price_usdc?: number | null
          provider_agent_id?: string | null
          service_id?: string | null
          status?: string | null
          tool_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "api_calls_caller_agent_id_fkey"
            columns: ["caller_agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "api_calls_provider_agent_id_fkey"
            columns: ["provider_agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "api_calls_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "agent_services"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "api_calls_tool_id_fkey"
            columns: ["tool_id"]
            isOneToOne: false
            referencedRelation: "agent_tools"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_receipts: {
        Row: {
          amount_usdc: number | null
          api_call_id: string | null
          block_number: number | null
          confirmed_at: string | null
          id: string
          payee_wallet: string | null
          payer_wallet: string | null
          tx_hash: string
        }
        Insert: {
          amount_usdc?: number | null
          api_call_id?: string | null
          block_number?: number | null
          confirmed_at?: string | null
          id: string
          payee_wallet?: string | null
          payer_wallet?: string | null
          tx_hash: string
        }
        Update: {
          amount_usdc?: number | null
          api_call_id?: string | null
          block_number?: number | null
          confirmed_at?: string | null
          id?: string
          payee_wallet?: string | null
          payer_wallet?: string | null
          tx_hash?: string
        }
        Relationships: []
      }
      payment_transactions: {
        Row: {
          amount: number
          chain_id: number
          created_at: string
          from_address: string
          id: string
          payment_type: string
          status: string
          task_delegation_id: string | null
          to_address: string
          token_address: string | null
          tx_hash: string | null
        }
        Insert: {
          amount: number
          chain_id?: number
          created_at?: string
          from_address: string
          id?: string
          payment_type?: string
          status?: string
          task_delegation_id?: string | null
          to_address: string
          token_address?: string | null
          tx_hash?: string | null
        }
        Update: {
          amount?: number
          chain_id?: number
          created_at?: string
          from_address?: string
          id?: string
          payment_type?: string
          status?: string
          task_delegation_id?: string | null
          to_address?: string
          token_address?: string | null
          tx_hash?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payment_transactions_task_delegation_id_fkey"
            columns: ["task_delegation_id"]
            isOneToOne: false
            referencedRelation: "task_delegations"
            referencedColumns: ["id"]
          },
        ]
      }
      reputation_events: {
        Row: {
          agent_id: string | null
          created_at: string | null
          delta: number | null
          id: number
          reason: string | null
          source: string | null
        }
        Insert: {
          agent_id?: string | null
          created_at?: string | null
          delta?: number | null
          id?: number
          reason?: string | null
          source?: string | null
        }
        Update: {
          agent_id?: string | null
          created_at?: string | null
          delta?: number | null
          id?: number
          reason?: string | null
          source?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reputation_events_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
        ]
      }
      risk_events: {
        Row: {
          chain: string
          created_at: string
          details: string | null
          event_type: string
          id: string
          rule_id: string | null
          score: number
          status: string
          wallet: string
        }
        Insert: {
          chain?: string
          created_at?: string
          details?: string | null
          event_type: string
          id?: string
          rule_id?: string | null
          score?: number
          status?: string
          wallet: string
        }
        Update: {
          chain?: string
          created_at?: string
          details?: string | null
          event_type?: string
          id?: string
          rule_id?: string | null
          score?: number
          status?: string
          wallet?: string
        }
        Relationships: [
          {
            foreignKeyName: "risk_events_rule_id_fkey"
            columns: ["rule_id"]
            isOneToOne: false
            referencedRelation: "risk_rules"
            referencedColumns: ["id"]
          },
        ]
      }
      risk_rules: {
        Row: {
          created_at: string
          description: string | null
          enabled: boolean
          id: string
          name: string
          param_label: string | null
          param_range_max: number | null
          param_range_min: number | null
          param_unit: string | null
          parameter: number | null
          severity: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          enabled?: boolean
          id: string
          name: string
          param_label?: string | null
          param_range_max?: number | null
          param_range_min?: number | null
          param_unit?: string | null
          parameter?: number | null
          severity?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          enabled?: boolean
          id?: string
          name?: string
          param_label?: string | null
          param_range_max?: number | null
          param_range_min?: number | null
          param_unit?: string | null
          parameter?: number | null
          severity?: string
          updated_at?: string
        }
        Relationships: []
      }
      service_requests: {
        Row: {
          api_call_id: string | null
          caller_agent_id: string | null
          created_at: string | null
          id: string
          provider_agent_id: string | null
          service_id: string | null
          status: string | null
        }
        Insert: {
          api_call_id?: string | null
          caller_agent_id?: string | null
          created_at?: string | null
          id: string
          provider_agent_id?: string | null
          service_id?: string | null
          status?: string | null
        }
        Update: {
          api_call_id?: string | null
          caller_agent_id?: string | null
          created_at?: string | null
          id?: string
          provider_agent_id?: string | null
          service_id?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "service_requests_caller_agent_id_fkey"
            columns: ["caller_agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_requests_provider_agent_id_fkey"
            columns: ["provider_agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_requests_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "agent_services"
            referencedColumns: ["id"]
          },
        ]
      }
      skills: {
        Row: {
          id: string
          installed_at: string | null
          name: string
          source: string
          version: string | null
        }
        Insert: {
          id: string
          installed_at?: string | null
          name: string
          source: string
          version?: string | null
        }
        Update: {
          id?: string
          installed_at?: string | null
          name?: string
          source?: string
          version?: string | null
        }
        Relationships: []
      }
      task_delegations: {
        Row: {
          chain_id: number
          completed_at: string | null
          created_at: string
          executor_agent_id: string | null
          id: string
          payment_amount: number | null
          payment_tx_hash: string | null
          requester_agent_id: string
          result: string | null
          status: string
          task_description: string
        }
        Insert: {
          chain_id?: number
          completed_at?: string | null
          created_at?: string
          executor_agent_id?: string | null
          id?: string
          payment_amount?: number | null
          payment_tx_hash?: string | null
          requester_agent_id: string
          result?: string | null
          status?: string
          task_description: string
        }
        Update: {
          chain_id?: number
          completed_at?: string | null
          created_at?: string
          executor_agent_id?: string | null
          id?: string
          payment_amount?: number | null
          payment_tx_hash?: string | null
          requester_agent_id?: string
          result?: string | null
          status?: string
          task_description?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_delegations_executor_agent_id_fkey"
            columns: ["executor_agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_delegations_requester_agent_id_fkey"
            columns: ["requester_agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
        ]
      }
      tool_runs: {
        Row: {
          created_at: string | null
          id: string
          input: Json
          output: Json | null
          status: string
          tool: string
        }
        Insert: {
          created_at?: string | null
          id: string
          input: Json
          output?: Json | null
          status: string
          tool: string
        }
        Update: {
          created_at?: string | null
          id?: string
          input?: Json
          output?: Json | null
          status?: string
          tool?: string
        }
        Relationships: []
      }
      tool_usage: {
        Row: {
          api_call_id: string | null
          caller_agent_id: string | null
          cost_usdc: number | null
          created_at: string | null
          id: string
          status: string | null
          tool_id: string | null
        }
        Insert: {
          api_call_id?: string | null
          caller_agent_id?: string | null
          cost_usdc?: number | null
          created_at?: string | null
          id: string
          status?: string | null
          tool_id?: string | null
        }
        Update: {
          api_call_id?: string | null
          caller_agent_id?: string | null
          cost_usdc?: number | null
          created_at?: string | null
          id?: string
          status?: string | null
          tool_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tool_usage_caller_agent_id_fkey"
            columns: ["caller_agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tool_usage_tool_id_fkey"
            columns: ["tool_id"]
            isOneToOne: false
            referencedRelation: "agent_tools"
            referencedColumns: ["id"]
          },
        ]
      }
      wallet_ledger: {
        Row: {
          agent_id: string | null
          amount_usdc: number
          api_call_id: string | null
          created_at: string | null
          direction: string
          id: number
          reason: string | null
          tx_hash: string | null
          wallet: string
        }
        Insert: {
          agent_id?: string | null
          amount_usdc: number
          api_call_id?: string | null
          created_at?: string | null
          direction: string
          id?: number
          reason?: string | null
          tx_hash?: string | null
          wallet: string
        }
        Update: {
          agent_id?: string | null
          amount_usdc?: number
          api_call_id?: string | null
          created_at?: string | null
          direction?: string
          id?: number
          reason?: string | null
          tx_hash?: string | null
          wallet?: string
        }
        Relationships: [
          {
            foreignKeyName: "wallet_ledger_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
        ]
      }
      x402_payments: {
        Row: {
          amount: string
          chain_id: number
          created_at: string | null
          id: string
          link: string
          token_address: string
          used_at: string | null
        }
        Insert: {
          amount: string
          chain_id: number
          created_at?: string | null
          id: string
          link: string
          token_address: string
          used_at?: string | null
        }
        Update: {
          amount?: string
          chain_id?: number
          created_at?: string | null
          id?: string
          link?: string
          token_address?: string
          used_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
