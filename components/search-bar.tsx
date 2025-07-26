"use client"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Search, MapPin, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useSearch } from "@/lib/search-context"

interface SearchBarProps {
  className?: string
  placeholder?: string
  showResults?: boolean
}

export function SearchBar({
  className,
  placeholder = "Search for jollof, waakye, banku...",
  showResults = true,
}: SearchBarProps) {
  const { searchQuery, setSearchQuery, searchResults, isSearching } = useSearch()
  const [showDropdown, setShowDropdown] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowDropdown(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleInputChange = (value: string) => {
    setSearchQuery(value)
    setShowDropdown(value.length > 0 && showResults)
  }

  const clearSearch = () => {
    setSearchQuery("")
    setShowDropdown(false)
  }

  const hasResults = searchResults.vendors.length > 0 || searchResults.menuItems.length > 0

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      <div className="relative">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
        <Input
          type="text"
          placeholder={placeholder}
          value={searchQuery}
          onChange={(e) => handleInputChange(e.target.value)}
          className="pl-12 pr-12 h-12 text-base bg-background border-2 border-border/50 focus:border-orange-500 rounded-full shadow-sm"
        />
        {searchQuery && (
          <Button
            variant="ghost"
            size="icon"
            onClick={clearSearch}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 rounded-full"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Search Results Dropdown */}
      {showDropdown && (
        <Card className="absolute top-full left-0 right-0 mt-2 z-50 max-h-96 overflow-y-auto shadow-lg">
          <CardContent className="p-0">
            {isSearching ? (
              <div className="p-4 text-center text-muted-foreground">
                <div className="animate-spin h-6 w-6 border-2 border-orange-500 border-t-transparent rounded-full mx-auto mb-2" />
                Searching...
              </div>
            ) : hasResults ? (
              <div className="divide-y">
                {/* Vendors */}
                {searchResults.vendors.length > 0 && (
                  <div className="p-4">
                    <h3 className="font-semibold text-sm text-muted-foreground mb-3">VENDORS</h3>
                    <div className="space-y-2">
                      {searchResults.vendors.map((vendor) => (
                        <Link
                          key={vendor.id}
                          href={`/vendor/${vendor.id}`}
                          onClick={() => setShowDropdown(false)}
                          className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted transition-colors"
                        >
                          <div className="h-10 w-10 rounded-lg bg-gradient-to-r from-orange-400 to-red-400 flex items-center justify-center">
                            <span className="text-white font-semibold text-sm">{vendor.vendor_name.charAt(0)}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">{vendor.vendor_name}</p>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <MapPin className="h-3 w-3" />
                              <span className="truncate">{vendor.address}</span>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* Menu Items */}
                {searchResults.menuItems.length > 0 && (
                  <div className="p-4">
                    <h3 className="font-semibold text-sm text-muted-foreground mb-3">DISHES</h3>
                    <div className="space-y-2">
                      {searchResults.menuItems.slice(0, 8).map((item) => (
                        <Link
                          key={item.id}
                          href={`/vendor/${item.vendor_id}`}
                          onClick={() => setShowDropdown(false)}
                          className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted transition-colors"
                        >
                          <div className="h-10 w-10 rounded-lg overflow-hidden bg-muted">
                            <Image
                              src={
                                item.image_url ||
                                `/placeholder.svg?height=40&width=40&query=${encodeURIComponent(item.name) || "/placeholder.svg"}`
                              }
                              alt={item.name}
                              width={40}
                              height={40}
                              className="object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">{item.name}</p>
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-muted-foreground truncate">
                                by {(item as any).vendors?.vendor_name}
                              </span>
                              <span className="text-sm font-semibold text-orange-500">₵{item.price}</span>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-4 text-center text-muted-foreground">
                <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No results found for "{searchQuery}"</p>
                <p className="text-xs mt-1">Try searching for vendors or dishes</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
