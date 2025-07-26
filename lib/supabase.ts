import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types for our database
export interface User {
  id: string
  name: string
  email: string
  role: "user" | "vendor" | "admin"
  location?: any
  phone?: string
  created_at: string
  updated_at: string
}

export interface Vendor {
  id: string
  user_id: string
  vendor_name: string
  description?: string
  location?: any
  status: "pending" | "approved" | "blocked"
  image_url?: string
  phone?: string
  address?: string
  created_at: string
  updated_at: string
}

export interface MenuItem {
  id: string
  vendor_id: string
  name: string
  description?: string
  price: number
  image_url?: string
  available: boolean
  category?: string
  prep_time?: number
  created_at: string
  updated_at: string
}

export interface Order {
  id: string
  user_id: string
  vendor_id: string
  items: any[]
  total_price: number
  status: "pending" | "preparing" | "en_route" | "delivered" | "cancelled"
  delivery_address?: string
  delivery_location?: any
  notes?: string
  created_at: string
  updated_at: string
}

export interface Review {
  id: string
  user_id: string
  vendor_id: string
  order_id: string
  rating: number
  comment?: string
  created_at: string
}
