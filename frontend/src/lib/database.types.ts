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
      users: {
        Row: {
          id: string
          name: string
          email: string
          phone: string
          id_type: 'Healthcard' | 'GovID'
          urgency_level: 'low' | 'medium' | 'high'
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          email: string
          phone: string
          id_type: 'Healthcard' | 'GovID'
          urgency_level?: 'low' | 'medium' | 'high'
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string
          phone?: string
          id_type?: 'Healthcard' | 'GovID'
          urgency_level?: 'low' | 'medium' | 'high'
          created_at?: string
        }
      }
      clinics: {
        Row: {
          id: string
          name: string
          address: string
          latitude: number
          longitude: number
          current_wait: number
          capacity: number
          active_patients: number
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          address: string
          latitude: number
          longitude: number
          current_wait?: number
          capacity?: number
          active_patients?: number
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          address?: string
          latitude?: number
          longitude?: number
          current_wait?: number
          capacity?: number
          active_patients?: number
          created_at?: string
        }
      }
      appointments: {
        Row: {
          id: string
          user_id: string
          clinic_id: string
          status: 'queued' | 'notified' | 'confirmed' | 'cancelled' | 'completed'
          position: number
          symptoms: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          clinic_id: string
          status?: 'queued' | 'notified' | 'confirmed' | 'cancelled' | 'completed'
          position: number
          symptoms?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          clinic_id?: string
          status?: 'queued' | 'notified' | 'confirmed' | 'cancelled' | 'completed'
          position?: number
          symptoms?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}
