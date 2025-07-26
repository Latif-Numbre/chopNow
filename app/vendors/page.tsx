"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { MapPin, Star, Clock, Grid, List } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { SearchBar } from "@/components/search-bar"
import { supabase, type Vendor } from "@/lib/supabase"

export default function VendorsPage() {
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [sortBy, setSortBy] = useState("name")
  const [filterLocation, setFilterLocation] = useState("all")

  useEffect(() => {
    const fetchVendors = async () => {
      try {
        let query = supabase.from("vendors").select("*").eq("status", "approved")

        // Apply sorting
        if (sortBy === "name") {
          query = query.order("vendor_name")
        } else if (sortBy === "newest") {
          query = query.order("created_at", { ascending: false })
        }

        const { data } = await query

        setVendors(data || [])
      } catch (error) {
        console.error("Error fetching vendors:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchVendors()
  }, [sortBy])

  const filteredVendors = vendors.filter((vendor) => {
    if (filterLocation === "all") return true
    return vendor.address?.toLowerCase().includes(filterLocation.toLowerCase())
  })

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-gray-900 dark:to-gray-800 border-b">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-3xl md:text-5xl font-bold mb-4">Browse Vendors</h1>
            <p className="text-lg text-muted-foreground mb-8">
              Discover amazing local food vendors serving authentic Ghanaian cuisine
            </p>
            <div className="max-w-2xl mx-auto">
              <SearchBar placeholder="Search vendors or dishes..." />
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Filters and Controls */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex items-center gap-4 flex-1">
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Name (A-Z)</SelectItem>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="rating">Highest Rated</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterLocation} onValueChange={setFilterLocation}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Locations</SelectItem>
                <SelectItem value="accra">Accra</SelectItem>
                <SelectItem value="kumasi">Kumasi</SelectItem>
                <SelectItem value="tamale">Tamale</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === "grid" ? "default" : "outline"}
              size="icon"
              onClick={() => setViewMode("grid")}
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "outline"}
              size="icon"
              onClick={() => setViewMode("list")}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-muted-foreground">
            Showing {filteredVendors.length} vendor{filteredVendors.length !== 1 ? "s" : ""}
          </p>
        </div>

        {/* Vendors Grid/List */}
        {loading ? (
          <div
            className={`grid gap-6 ${viewMode === "grid" ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"}`}
          >
            {[...Array(9)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <div className="h-48 bg-muted rounded-t-lg" />
                <CardContent className="p-6">
                  <div className="h-6 bg-muted rounded mb-2" />
                  <div className="h-4 bg-muted rounded mb-4" />
                  <div className="h-4 bg-muted rounded w-1/2" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div
            className={`grid gap-6 ${viewMode === "grid" ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"}`}
          >
            {filteredVendors.map((vendor) => (
              <Card key={vendor.id} className="group hover:shadow-lg transition-all duration-300 overflow-hidden">
                <div className="relative h-48 overflow-hidden">
                  <Image
                    src={
                      vendor.image_url ||
                      `/placeholder.svg?height=200&width=400&query=${encodeURIComponent(vendor.vendor_name + " restaurant") || "/placeholder.svg"}`
                    }
                    alt={vendor.vendor_name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  <Badge className="absolute top-3 right-3 bg-green-500 text-white">Open</Badge>
                </div>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-bold text-xl group-hover:text-orange-500 transition-colors">
                      {vendor.vendor_name}
                    </h3>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-medium">4.5</span>
                    </div>
                  </div>

                  <p className="text-muted-foreground mb-4 line-clamp-2">
                    {vendor.description || "Delicious Ghanaian cuisine made with love"}
                  </p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span className="truncate">{vendor.address}</span>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>30-45 min</span>
                    </div>
                  </div>

                  <Button asChild className="w-full mt-4">
                    <Link href={`/vendor/${vendor.id}`}>View Menu</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {filteredVendors.length === 0 && !loading && (
          <div className="text-center py-12">
            <div className="h-24 w-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <MapPin className="h-12 w-12 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No vendors found</h3>
            <p className="text-muted-foreground">Try adjusting your filters or search terms</p>
          </div>
        )}
      </div>
    </div>
  )
}
