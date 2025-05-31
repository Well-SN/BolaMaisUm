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
      players: {
        Row: {
          id: string
          created_at: string
          name: string
        }
        Insert: {
          id?: string
          created_at?: string
          name: string
        }
        Update: {
          id?: string
          created_at?: string
          name?: string
        }
      }
      teams: {
        Row: {
          id: string
          created_at: string
          name: string
          is_playing: boolean
        }
        Insert: {
          id?: string
          created_at?: string
          name: string
          is_playing?: boolean
        }
        Update: {
          id?: string
          created_at?: string
          name?: string
          is_playing?: boolean
        }
      }
      team_players: {
        Row: {
          team_id: string
          player_id: string
          created_at: string
        }
        Insert: {
          team_id: string
          player_id: string
          created_at?: string
        }
        Update: {
          team_id?: string
          player_id?: string
          created_at?: string
        }
      }
      current_game: {
        Row: {
          id: string
          team_a_id: string | null
          team_b_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          team_a_id?: string | null
          team_b_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          team_a_id?: string | null
          team_b_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}