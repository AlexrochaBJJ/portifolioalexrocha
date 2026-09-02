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
      career_experiences: {
        Row: {
          company: string
          created_at: string
          dashboard_categories: string[]
          description: string
          employment_type: string | null
          highlights: string[]
          id: string
          is_published: boolean
          location: string | null
          logo_url: string | null
          long_description: string
          period: string
          responsibilities: string[]
          results: string[]
          role_title: string
          sector: string | null
          short_summary: string
          slug: string
          sort_order: number
          tools: string[]
          updated_at: string
          webapp_categories: string[]
        }
        Insert: {
          company: string
          created_at?: string
          dashboard_categories?: string[]
          description?: string
          employment_type?: string | null
          highlights?: string[]
          id?: string
          is_published?: boolean
          location?: string | null
          logo_url?: string | null
          long_description?: string
          period?: string
          responsibilities?: string[]
          results?: string[]
          role_title: string
          sector?: string | null
          short_summary?: string
          slug: string
          sort_order?: number
          tools?: string[]
          updated_at?: string
          webapp_categories?: string[]
        }
        Update: {
          company?: string
          created_at?: string
          dashboard_categories?: string[]
          description?: string
          employment_type?: string | null
          highlights?: string[]
          id?: string
          is_published?: boolean
          location?: string | null
          logo_url?: string | null
          long_description?: string
          period?: string
          responsibilities?: string[]
          results?: string[]
          role_title?: string
          sector?: string | null
          short_summary?: string
          slug?: string
          sort_order?: number
          tools?: string[]
          updated_at?: string
          webapp_categories?: string[]
        }
        Relationships: []
      }
      contact_links: {
        Row: {
          created_at: string
          id: string
          kind: string
          label: string
          sort_order: number
          updated_at: string
          value: string
        }
        Insert: {
          created_at?: string
          id?: string
          kind?: string
          label: string
          sort_order?: number
          updated_at?: string
          value: string
        }
        Update: {
          created_at?: string
          id?: string
          kind?: string
          label?: string
          sort_order?: number
          updated_at?: string
          value?: string
        }
        Relationships: []
      }
      dashboards: {
        Row: {
          category: string
          cover_url: string | null
          created_at: string
          description: string
          embed_url: string
          html_code: string | null
          icon: string
          id: string
          is_published: boolean
          sort_order: number
          source_type: string
          title: string
          updated_at: string
        }
        Insert: {
          category?: string
          cover_url?: string | null
          created_at?: string
          description?: string
          embed_url?: string
          html_code?: string | null
          icon?: string
          id?: string
          is_published?: boolean
          sort_order?: number
          source_type?: string
          title: string
          updated_at?: string
        }
        Update: {
          category?: string
          cover_url?: string | null
          created_at?: string
          description?: string
          embed_url?: string
          html_code?: string | null
          icon?: string
          id?: string
          is_published?: boolean
          sort_order?: number
          source_type?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      experience_dashboards: {
        Row: {
          created_at: string
          dashboard_id: string
          experience_id: string
          id: string
          sort_order: number
        }
        Insert: {
          created_at?: string
          dashboard_id: string
          experience_id: string
          id?: string
          sort_order?: number
        }
        Update: {
          created_at?: string
          dashboard_id?: string
          experience_id?: string
          id?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "experience_dashboards_dashboard_id_fkey"
            columns: ["dashboard_id"]
            isOneToOne: false
            referencedRelation: "dashboards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "experience_dashboards_experience_id_fkey"
            columns: ["experience_id"]
            isOneToOne: false
            referencedRelation: "career_experiences"
            referencedColumns: ["id"]
          },
        ]
      }
      experience_highlights: {
        Row: {
          created_at: string
          experience_id: string
          highlight: string
          id: string
          impact: string
          is_featured: boolean
          sort_order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          experience_id: string
          highlight: string
          id?: string
          impact?: string
          is_featured?: boolean
          sort_order?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          experience_id?: string
          highlight?: string
          id?: string
          impact?: string
          is_featured?: boolean
          sort_order?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "experience_highlights_experience_id_fkey"
            columns: ["experience_id"]
            isOneToOne: false
            referencedRelation: "career_experiences"
            referencedColumns: ["id"]
          },
        ]
      }
      experience_web_projects: {
        Row: {
          created_at: string
          experience_id: string
          id: string
          sort_order: number
          web_project_id: string
        }
        Insert: {
          created_at?: string
          experience_id: string
          id?: string
          sort_order?: number
          web_project_id: string
        }
        Update: {
          created_at?: string
          experience_id?: string
          id?: string
          sort_order?: number
          web_project_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "experience_web_projects_experience_id_fkey"
            columns: ["experience_id"]
            isOneToOne: false
            referencedRelation: "career_experiences"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "experience_web_projects_web_project_id_fkey"
            columns: ["web_project_id"]
            isOneToOne: false
            referencedRelation: "web_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      flowchart_edges: {
        Row: {
          created_at: string
          flowchart_id: string
          id: string
          label: string | null
          lane_offset: number
          route_side: string
          source_node_id: string
          target_node_id: string
        }
        Insert: {
          created_at?: string
          flowchart_id: string
          id?: string
          label?: string | null
          lane_offset?: number
          route_side?: string
          source_node_id: string
          target_node_id: string
        }
        Update: {
          created_at?: string
          flowchart_id?: string
          id?: string
          label?: string | null
          lane_offset?: number
          route_side?: string
          source_node_id?: string
          target_node_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "flowchart_edges_flowchart_id_fkey"
            columns: ["flowchart_id"]
            isOneToOne: false
            referencedRelation: "flowcharts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "flowchart_edges_source_node_id_fkey"
            columns: ["source_node_id"]
            isOneToOne: false
            referencedRelation: "flowchart_nodes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "flowchart_edges_target_node_id_fkey"
            columns: ["target_node_id"]
            isOneToOne: false
            referencedRelation: "flowchart_nodes"
            referencedColumns: ["id"]
          },
        ]
      }
      flowchart_nodes: {
        Row: {
          created_at: string
          description: string
          flowchart_id: string
          id: string
          items: string[]
          node_type: string
          notes: string | null
          owner: string | null
          position_x: number
          position_y: number
          sort_order: number
          system: string | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string
          flowchart_id: string
          id?: string
          items?: string[]
          node_type?: string
          notes?: string | null
          owner?: string | null
          position_x?: number
          position_y?: number
          sort_order?: number
          system?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string
          flowchart_id?: string
          id?: string
          items?: string[]
          node_type?: string
          notes?: string | null
          owner?: string | null
          position_x?: number
          position_y?: number
          sort_order?: number
          system?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "flowchart_nodes_flowchart_id_fkey"
            columns: ["flowchart_id"]
            isOneToOne: false
            referencedRelation: "flowcharts"
            referencedColumns: ["id"]
          },
        ]
      }
      flowcharts: {
        Row: {
          context: string
          created_at: string
          experience_id: string | null
          id: string
          is_published: boolean
          slug: string
          sort_order: number
          summary: string
          tags: string[]
          title: string
          updated_at: string
        }
        Insert: {
          context?: string
          created_at?: string
          experience_id?: string | null
          id?: string
          is_published?: boolean
          slug: string
          sort_order?: number
          summary?: string
          tags?: string[]
          title: string
          updated_at?: string
        }
        Update: {
          context?: string
          created_at?: string
          experience_id?: string | null
          id?: string
          is_published?: boolean
          slug?: string
          sort_order?: number
          summary?: string
          tags?: string[]
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "flowcharts_experience_id_fkey"
            columns: ["experience_id"]
            isOneToOne: false
            referencedRelation: "career_experiences"
            referencedColumns: ["id"]
          },
        ]
      }
      profile_about: {
        Row: {
          bio: string
          created_at: string
          full_name: string
          headline: string
          id: string
          image_url: string | null
          summary: string
          updated_at: string
        }
        Insert: {
          bio?: string
          created_at?: string
          full_name?: string
          headline?: string
          id?: string
          image_url?: string | null
          summary?: string
          updated_at?: string
        }
        Update: {
          bio?: string
          created_at?: string
          full_name?: string
          headline?: string
          id?: string
          image_url?: string | null
          summary?: string
          updated_at?: string
        }
        Relationships: []
      }
      skills: {
        Row: {
          category: string
          created_at: string
          icon: string | null
          id: string
          is_featured: boolean
          name: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          category?: string
          created_at?: string
          icon?: string | null
          id?: string
          is_featured?: boolean
          name: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          icon?: string | null
          id?: string
          is_featured?: boolean
          name?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      web_projects: {
        Row: {
          category: string
          created_at: string
          description: string
          id: string
          is_published: boolean
          preview_url: string | null
          sort_order: number
          tags: string[]
          title: string
          updated_at: string
          url: string
        }
        Insert: {
          category?: string
          created_at?: string
          description?: string
          id?: string
          is_published?: boolean
          preview_url?: string | null
          sort_order?: number
          tags?: string[]
          title: string
          updated_at?: string
          url: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string
          id?: string
          is_published?: boolean
          preview_url?: string | null
          sort_order?: number
          tags?: string[]
          title?: string
          updated_at?: string
          url?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      claim_admin: { Args: never; Returns: boolean }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "user"],
    },
  },
} as const
