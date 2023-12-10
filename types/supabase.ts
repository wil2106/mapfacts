export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      Fact: {
        Row: {
          angleD: number
          authorId: string
          createdAt: string
          id: number
          location: unknown
          radiusM: number
          text: string
        }
        Insert: {
          angleD: number
          authorId: string
          createdAt?: string
          id?: number
          location: unknown
          radiusM: number
          text: string
        }
        Update: {
          angleD?: number
          authorId?: string
          createdAt?: string
          id?: number
          location?: unknown
          radiusM?: number
          text?: string
        }
        Relationships: [
          {
            foreignKeyName: "Fact_authorId_fkey"
            columns: ["authorId"]
            isOneToOne: false
            referencedRelation: "User"
            referencedColumns: ["id"]
          }
        ]
      }
      Report: {
        Row: {
          authorId: string
          createdAt: string
          factId: number
          id: number
          reason: string | null
        }
        Insert: {
          authorId: string
          createdAt?: string
          factId: number
          id?: number
          reason?: string | null
        }
        Update: {
          authorId?: string
          createdAt?: string
          factId?: number
          id?: number
          reason?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "Report_authorId_fkey"
            columns: ["authorId"]
            isOneToOne: false
            referencedRelation: "User"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Report_factId_fkey"
            columns: ["factId"]
            isOneToOne: false
            referencedRelation: "Fact"
            referencedColumns: ["id"]
          }
        ]
      }
      User: {
        Row: {
          createdAt: string
          id: string
          lastLoginAt: string
          lastRadarNotificationAt: string | null
          pushToken: string | null
          radarCooldownS: number
          radarEnabled: boolean
          radarMinUpvotes: number
        }
        Insert: {
          createdAt?: string
          id: string
          lastLoginAt?: string
          lastRadarNotificationAt?: string | null
          pushToken?: string | null
          radarCooldownS?: number
          radarEnabled?: boolean
          radarMinUpvotes?: number
        }
        Update: {
          createdAt?: string
          id?: string
          lastLoginAt?: string
          lastRadarNotificationAt?: string | null
          pushToken?: string | null
          radarCooldownS?: number
          radarEnabled?: boolean
          radarMinUpvotes?: number
        }
        Relationships: []
      }
      Vote: {
        Row: {
          authorId: string
          createdAt: string
          factId: number
          id: number
          isUp: boolean
        }
        Insert: {
          authorId: string
          createdAt?: string
          factId: number
          id?: number
          isUp: boolean
        }
        Update: {
          authorId?: string
          createdAt?: string
          factId?: number
          id?: number
          isUp?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "Vote_authorId_fkey"
            columns: ["authorId"]
            isOneToOne: false
            referencedRelation: "User"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Vote_factId_fkey"
            columns: ["factId"]
            isOneToOne: false
            referencedRelation: "Fact"
            referencedColumns: ["id"]
          }
        ]
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

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (Database["public"]["Tables"] & Database["public"]["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (Database["public"]["Tables"] &
      Database["public"]["Views"])
  ? (Database["public"]["Tables"] &
      Database["public"]["Views"])[PublicTableNameOrOptions] extends {
      Row: infer R
    }
    ? R
    : never
  : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
  ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
      Insert: infer I
    }
    ? I
    : never
  : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
  ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
      Update: infer U
    }
    ? U
    : never
  : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof Database["public"]["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof Database["public"]["Enums"]
  ? Database["public"]["Enums"][PublicEnumNameOrOptions]
  : never
