"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Search, MapPin, Clock, Star, ArrowRight, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { supabase, type Vendor, type MenuItem } from "@/lib/supabase"
import { SearchBar } from "@/components/search-bar"
import { useCart } from "@/lib/cart-context"
import { useToast } from "@/hooks/use-toast"

export default function HomePage() {
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [featuredItems, setFeaturedItems] = useState<MenuItem[]>([])
  const [loading, setLoading] = useState(true)
  const { addItem } = useCart()
  const { toast } = useToast()

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch approved vendors
        const { data: vendorsData } = await supabase.from("vendors").select("*").eq("status", "approved").limit(6)

        // Fetch featured menu items
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
          .limit(8)

        setVendors(vendorsData || [])
        setFeaturedItems(menuData || [])
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleAddToCart = (item: MenuItem) => {
    const vendorInfo = (item as any).vendors
    addItem({
      id: item.id,
      name: item.name,
      price: item.price,
      vendor_id: item.vendor_id,
      vendor_name: vendorInfo?.vendor_name || "Unknown Vendor",
      image_url: item.image_url,
    })

    toast({
      title: "Added to cart!",
      description: `${item.name} has been added to your cart.`,
    })
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-orange-500 via-red-500 to-pink-600 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/10" />
        <div className="absolute inset-0 bg-[url('/placeholder.svg?height=800&width=1200')] opacity-5" />
        <div className="relative container mx-auto px-4 py-20 md:py-32">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-7xl font-bold mb-6 leading-tight">
              Taste Ghana,
              <br />
              <span className="bg-gradient-to-r from-yellow-300 to-orange-200 bg-clip-text text-transparent">
                Delivered Fresh
              </span>
            </h1>
            <p className="text-lg md:text-xl mb-12 text-white/90 max-w-2xl mx-auto">
              Discover authentic Ghanaian cuisine from local vendors, delivered to your doorstep
            </p>

            <div className="max-w-2xl mx-auto mb-12">
              <SearchBar className="w-full" />
            </div>

            <div className="flex flex-wrap justify-center gap-6 text-sm opacity-90">
              <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full backdrop-blur-sm">
                <MapPin className="h-4 w-4" />
                <span>Accra • Kumasi • Tamale</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full backdrop-blur-sm">
                <Clock className="h-4 w-4" />
                <span>30-45 min delivery</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Dishes */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Featured Dishes</h2>
            <p className="text-muted-foreground text-lg">Popular meals from our top vendors</p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <div className="h-48 bg-muted rounded-t-lg" />
                  <CardContent className="p-4">
                    <div className="h-4 bg-muted rounded mb-2" />
                    <div className="h-3 bg-muted rounded mb-4 w-2/3" />
                    <div className="h-6 bg-muted rounded w-1/3" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredItems.map((item) => (
                <Card key={item.id} className="group hover:shadow-lg transition-shadow">
                  <div className="relative h-48 overflow-hidden rounded-t-lg">
                    <Image
                      src={
                        item.image_url || `/placeholder.svg?height=200&width=300&query=${encodeURIComponent(item.name)}`
                      }
                      alt={item.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform"
                    />
                    <Badge className="absolute top-2 right-2 bg-green-500">Available</Badge>
                    <Button
                      size="icon"
                      className="absolute top-2 left-2 bg-white/90 hover:bg-white text-black"
                      onClick={() => handleAddToCart(item)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-lg mb-1">{item.name}</h3>
                    <p className="text-muted-foreground text-sm mb-2 line-clamp-2">{item.description}</p>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-lg text-orange-500">₵{item.price}</span>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>{item.prep_time || 30}min</span>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mb-3">by {(item as any).vendors?.vendor_name}</p>
                    <Button
                      className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold"
                      size="sm"
                      onClick={() => handleAddToCart(item)}
                    >
                      Add to Cart
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Popular Vendors */}
      <section className="py-16 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Popular Vendors</h2>
            <p className="text-muted-foreground text-lg">Trusted local food vendors in your area</p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <div className="h-32 bg-muted rounded-t-lg" />
                  <CardContent className="p-6">
                    <div className="h-6 bg-muted rounded mb-2" />
                    <div className="h-4 bg-muted rounded mb-4" />
                    <div className="h-4 bg-muted rounded w-1/2" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {vendors.map((vendor) => (
                <Card key={vendor.id} className="group hover:shadow-lg transition-shadow">
                  <div className="relative h-32 overflow-hidden rounded-t-lg bg-gradient-to-r from-orange-400 to-red-400">
                    <Image
                      src={
                        vendor.image_url ||
                        `/placeholder.svg?height=150&width=400&query=${encodeURIComponent(vendor.vendor_name + " restaurant") || "/placeholder.svg"}`
                      }
                      alt={vendor.vendor_name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-xl">{vendor.vendor_name}</h3>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm">4.5</span>
                      </div>
                    </div>
                    <p className="text-muted-foreground mb-4 line-clamp-2">{vendor.description}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        <span>{vendor.address}</span>
                      </div>
                      <Button className="bg-orange-500 hover:bg-orange-600 text-white font-semibold" size="sm" asChild>
                        <Link href={`/vendor/${vendor.id}`}>
                          View Menu
                          <ArrowRight className="h-3 w-3 ml-1" />
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          <div className="text-center mt-12">
            <Button size="lg" className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-8" asChild>
              <Link href="/vendors">
                View All Vendors
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How ChopNow Works</h2>
            <p className="text-muted-foreground text-lg">Get your favorite Ghanaian food in 3 simple steps</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="h-8 w-8 text-orange-500" />
              </div>
              <h3 className="text-xl font-semibold mb-2">1. Browse & Search</h3>
              <p className="text-muted-foreground">Discover local vendors and browse their delicious Ghanaian dishes</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🛒</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">2. Order & Pay</h3>
              <p className="text-muted-foreground">Add items to cart, customize your order, and pay securely</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🚚</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">3. Track & Enjoy</h3>
              <p className="text-muted-foreground">Track your order in real-time and enjoy fresh, hot food</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-orange-500 to-red-500 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to taste authentic Ghana?</h2>
          <p className="text-xl mb-8 text-white/90">Join thousands of food lovers ordering from ChopNow</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-white text-orange-500 hover:bg-gray-100 font-semibold px-8 py-3 text-lg"
              asChild
            >
              <Link href="/auth/signup">Get Started</Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="text-white border-2 border-white hover:bg-white hover:text-orange-500 bg-transparent font-semibold px-8 py-3 text-lg"
              asChild
            >
              <Link href="/vendors">Browse Vendors</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
