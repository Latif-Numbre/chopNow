"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { supabase, type Vendor, type MenuItem } from "./supabase"

interface SearchResult {
  vendors: Vendor[]
  menuItems: (MenuItem & { vendors: { vendor_name: string; address: string } })[]
}

interface SearchContextType {
  searchQuery: string
  setSearchQuery: (query: string) => void
  searchResults: SearchResult
  isSearching: boolean
  performSearch: (query: string) => Promise<void>
}

const SearchContext = createContext<SearchContextType | undefined>(undefined)

export function SearchProvider({ children }: { children: ReactNode }) {
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<SearchResult>({
    vendors: [],
    menuItems: [],
  })
  const [isSearching, setIsSearching] = useState(false)

  const performSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults({ vendors: [], menuItems: [] })
      return
    }

    setIsSearching(true)
    try {
      // Search vendors
      const { data: vendorsData } = await supabase
        .from("vendors")
        .select("*")
        .eq("status", "approved")
        .or(`vendor_name.ilike.%${query}%,description.ilike.%${query}%,address.ilike.%${query}%`)
        .limit(10)

      // Search menu items
      const { data: menuData } = await supabase
        .from("menu_items")
        .select(`
          *,
          vendors (
            vendor_name,
            address
          )
        `)
        .eq("available", true)
        .or(`name.ilike.%${query}%,description.ilike.%${query}%,category.ilike.%${query}%`)
        .limit(20)

      setSearchResults({
        vendors: vendorsData || [],
        menuItems: menuData || [],
      })
    } catch (error) {
      console.error("Search error:", error)
    } finally {
      setIsSearching(false)
    }
  }

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (searchQuery) {
        performSearch(searchQuery)
      } else {
        setSearchResults({ vendors: [], menuItems: [] })
      }
    }, 300)

    return () => clearTimeout(debounceTimer)
  }, [searchQuery])

  return (
    <SearchContext.Provider
      value={{
        searchQuery,
        setSearchQuery,
        searchResults,
        isSearching,
        performSearch,
      }}
    >
      {children}
    </SearchContext.Provider>
  )
}

export function useSearch() {
  const context = useContext(SearchContext)
  if (context === undefined) {
    throw new Error("useSearch must be used within a SearchProvider")
  }
  return context
}
