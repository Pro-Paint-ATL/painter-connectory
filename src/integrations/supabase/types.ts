export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      bids: {
        Row: {
          amount: number
          created_at: string
          id: string
          job_id: string
          painter_id: string
          status: string
          updated_at: string
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          job_id: string
          painter_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          job_id?: string
          painter_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bids_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      booking_agreements: {
        Row: {
          agreement_date: string
          agreement_text: string
          booking_id: string
          created_at: string
          customer_agreed: boolean
          customer_signature: string
          id: string
          status: string
          updated_at: string
        }
        Insert: {
          agreement_date?: string
          agreement_text: string
          booking_id: string
          created_at?: string
          customer_agreed?: boolean
          customer_signature: string
          id?: string
          status?: string
          updated_at?: string
        }
        Update: {
          agreement_date?: string
          agreement_text?: string
          booking_id?: string
          created_at?: string
          customer_agreed?: boolean
          customer_signature?: string
          id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "booking_agreements_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      booking_payments: {
        Row: {
          amount: number
          booking_id: string
          created_at: string
          customer_id: string
          id: string
          painter_id: string
          payment_intent_id: string | null
          payment_method_id: string | null
          payment_type: string
          status: string
          updated_at: string | null
        }
        Insert: {
          amount: number
          booking_id: string
          created_at?: string
          customer_id: string
          id?: string
          painter_id: string
          payment_intent_id?: string | null
          payment_method_id?: string | null
          payment_type: string
          status?: string
          updated_at?: string | null
        }
        Update: {
          amount?: number
          booking_id?: string
          created_at?: string
          customer_id?: string
          id?: string
          painter_id?: string
          payment_intent_id?: string | null
          payment_method_id?: string | null
          payment_type?: string
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "booking_payments_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      bookings: {
        Row: {
          address: string
          created_at: string
          customer_id: string
          date: string
          deposit_amount: number
          id: string
          notes: string | null
          painter_id: string
          phone: string | null
          project_type: string
          status: string
          time: string
          total_amount: number
          updated_at: string | null
        }
        Insert: {
          address: string
          created_at?: string
          customer_id: string
          date: string
          deposit_amount: number
          id?: string
          notes?: string | null
          painter_id: string
          phone?: string | null
          project_type: string
          status?: string
          time: string
          total_amount: number
          updated_at?: string | null
        }
        Update: {
          address?: string
          created_at?: string
          customer_id?: string
          date?: string
          deposit_amount?: number
          id?: string
          notes?: string | null
          painter_id?: string
          phone?: string | null
          project_type?: string
          status?: string
          time?: string
          total_amount?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      jobs: {
        Row: {
          address: string
          budget_range: string | null
          city: string
          created_at: string
          customer_id: string
          description: string
          desired_start_date: string | null
          id: string
          images: string[]
          project_type: string
          square_footage: number | null
          state: string
          status: string
          title: string
          updated_at: string
          zip_code: string
        }
        Insert: {
          address: string
          budget_range?: string | null
          city: string
          created_at?: string
          customer_id: string
          description: string
          desired_start_date?: string | null
          id?: string
          images?: string[]
          project_type: string
          square_footage?: number | null
          state: string
          status?: string
          title: string
          updated_at?: string
          zip_code: string
        }
        Update: {
          address?: string
          budget_range?: string | null
          city?: string
          created_at?: string
          customer_id?: string
          description?: string
          desired_start_date?: string | null
          id?: string
          images?: string[]
          project_type?: string
          square_footage?: number | null
          state?: string
          status?: string
          title?: string
          updated_at?: string
          zip_code?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar: string | null
          company_info: Json | null
          created_at: string | null
          email: string | null
          id: string
          location: Json | null
          name: string | null
          role: string | null
          subscription: Json | null
        }
        Insert: {
          avatar?: string | null
          company_info?: Json | null
          created_at?: string | null
          email?: string | null
          id: string
          location?: Json | null
          name?: string | null
          role?: string | null
          subscription?: Json | null
        }
        Update: {
          avatar?: string | null
          company_info?: Json | null
          created_at?: string | null
          email?: string | null
          id?: string
          location?: Json | null
          name?: string | null
          role?: string | null
          subscription?: Json | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      set_secret: {
        Args: {
          name: string
          value: string
        }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
