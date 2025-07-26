"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { ArrowRight, Star, Clock, MapPin, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { SearchBar } from "@/components/search-bar"
import { useCart } from "@/lib/cart-context"
import { toast } from "@/hooks/use-toast"
import { supabase } from "@/lib/supabase"

interface Vendor {
  id: string
  name: string
  description: string
  image: string
  rating: number
  delivery_time: string
  location: string
  cuisine_type: string
}

interface MenuItem {
  id: string
  name: string
  description: string
  price: number
  image: string
  vendor_id: string
  vendor_name: string
}

export default function HomePage() {
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [featuredItems, setFeaturedItems] = useState<MenuItem[]>([])
  const [loading, setLoading] = useState(true)
  const { addItem } = useCart()

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch vendors
        const { data: vendorsData } = await supabase.from("vendors").select("*").limit(6)

        // Fetch featured menu items
        const { data: menuData } = await supabase
          .from("menu_items")
          .select(`
            *,
            vendors (name)
          `)
          .limit(8)

        setVendors(vendorsData || [])
        setFeaturedItems(
          menuData?.map((item) => ({
            ...item,
            vendor_name: item.vendors?.name || "Unknown Vendor",
          })) || [],
        )
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleAddToCart = (item: MenuItem) => {
    addItem({
      id: item.id,
      name: item.name,
      price: item.price,
      image: item.image,
      vendor: item.vendor_name,
    })

    toast({
      title: "Added to cart",
      description: `${item.name} has been added to your cart`,
    })
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-orange-500 to-red-500 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Delicious Food <br />
              <span className="text-yellow-300">Delivered Fast</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-orange-100">
              Order your favorite Ghanaian dishes from local vendors and get them delivered right to your doorstep
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
              <Button size="lg" className="bg-white text-orange-600 hover:bg-orange-50 px-8 py-3">
                <Link href="/auth/signup" className="flex items-center">
                  Get Started
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-orange-600 px-8 py-3 bg-transparent"
              >
                <Link href="/vendors">Browse Vendors</Link>
              </Button>
            </div>
            <div className="max-w-md mx-auto">
              <SearchBar />
            </div>
          </div>
        </div>
      </section>

      {/* Featured Dishes */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Featured Dishes</h2>
            <p className="text-lg text-muted-foreground">Discover the most popular dishes from our vendors</p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <Card key={i} className="h-[400px]">
                  <div className="animate-pulse">
                    <div className="h-48 bg-muted rounded-t-lg"></div>
                    <CardContent className="p-4">
                      <div className="h-4 bg-muted rounded mb-2"></div>
                      <div className="h-3 bg-muted rounded mb-4"></div>
                      <div className="h-6 bg-muted rounded"></div>
                    </CardContent>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredItems.map((item) => (
                <Card
                  key={item.id}
                  className="h-[400px] flex flex-col overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <div className="relative h-48">
                    <Image src={item.image || "/placeholder.jpg"} alt={item.name} fill className="object-cover" />
                  </div>
                  <CardContent className="p-4 flex-1 flex flex-col">
                    <h3 className="font-semibold text-lg mb-2 line-clamp-1">{item.name}</h3>
                    <p className="text-sm text-muted-foreground mb-2 line-clamp-2 flex-1">{item.description}</p>
                    <p className="text-xs text-muted-foreground mb-3">{item.vendor_name}</p>
                    <div className="flex items-center justify-between mt-auto">
                      <span className="text-lg font-bold text-orange-600">₵{item.price.toFixed(2)}</span>
                      <Button
                        size="sm"
                        onClick={() => handleAddToCart(item)}
                        className="bg-orange-600 hover:bg-orange-700"
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add
                      </Button>
                    </div>
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
            <p className="text-lg text-muted-foreground">Trusted by thousands of customers</p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="h-[280px]">
                  <div className="animate-pulse">
                    <div className="h-32 bg-muted rounded-t-lg"></div>
                    <CardContent className="p-4">
                      <div className="h-4 bg-muted rounded mb-2"></div>
                      <div className="h-3 bg-muted rounded mb-4"></div>
                      <div className="h-6 bg-muted rounded"></div>
                    </CardContent>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {vendors.map((vendor) => (
                <Card
                  key={vendor.id}
                  className="h-[280px] flex flex-col overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <div className="relative h-32">
                    <Image src={vendor.image || "/placeholder.jpg"} alt={vendor.name} fill className="object-cover" />
                  </div>
                  <CardContent className="p-4 flex-1 flex flex-col">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-lg line-clamp-1">{vendor.name}</h3>
                      <Badge variant="secondary" className="ml-2">
                        <Star className="h-3 w-3 mr-1 fill-current" />
                        {vendor.rating}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2 flex-1">{vendor.description}</p>
                    <div className="space-y-1 text-xs text-muted-foreground mb-4">
                      <div className="flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {vendor.delivery_time}
                      </div>
                      <div className="flex items-center">
                        <MapPin className="h-3 w-3 mr-1" />
                        <span className="truncate">{vendor.location}</span>
                      </div>
                    </div>
                    <Button asChild className="w-full mt-auto bg-orange-600 hover:bg-orange-700">
                      <Link href={`/vendors/${vendor.id}`}>View Menu</Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          <div className="text-center mt-8">
            <Button asChild variant="outline" size="lg">
              <Link href="/vendors">
                View All Vendors
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-lg text-muted-foreground">Simple steps to get your food delivered</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-orange-600">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Choose Your Food</h3>
              <p className="text-muted-foreground">Browse through our wide selection of local vendors and dishes</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-orange-600">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Place Your Order</h3>
              <p className="text-muted-foreground">Add items to cart and checkout with secure payment</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-orange-600">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Get It Delivered</h3>
              <p className="text-muted-foreground">Track your order and enjoy fresh food at your doorstep</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
