"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Clock, MapPin, Phone, Star, Package, Truck, CheckCircle, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { supabase, type Order } from "@/lib/supabase"
import { getCurrentUser } from "@/lib/auth"

interface OrderWithVendor extends Order {
  vendors: {
    vendor_name: string
    address: string
    phone: string
  }
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<OrderWithVendor[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const fetchUserAndOrders = async () => {
      try {
        const currentUser = await getCurrentUser()
        if (!currentUser) {
          window.location.href = "/auth/signin"
          return
        }
        setUser(currentUser)

        const { data } = await supabase
          .from("orders")
          .select(`
            *,
            vendors (
              vendor_name,
              address,
              phone
            )
          `)
          .eq("user_id", currentUser.id)
          .order("created_at", { ascending: false })

        setOrders(data || [])
      } catch (error) {
        console.error("Error fetching orders:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchUserAndOrders()
  }, [])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4" />
      case "preparing":
        return <Package className="h-4 w-4" />
      case "en_route":
        return <Truck className="h-4 w-4" />
      case "delivered":
        return <CheckCircle className="h-4 w-4" />
      case "cancelled":
        return <XCircle className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
      case "preparing":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
      case "en_route":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
      case "delivered":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      case "cancelled":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
    }
  }

  const activeOrders = orders.filter((order) => !["delivered", "cancelled"].includes(order.status))
  const pastOrders = orders.filter((order) => ["delivered", "cancelled"].includes(order.status))

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-muted rounded w-1/4" />
            <div className="grid gap-6">
              {[...Array(3)].map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <div className="h-6 bg-muted rounded mb-4" />
                    <div className="h-4 bg-muted rounded mb-2" />
                    <div className="h-4 bg-muted rounded w-1/2" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-gray-900 dark:to-gray-800 border-b">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl md:text-5xl font-bold mb-4">My Orders</h1>
            <p className="text-lg text-muted-foreground">Track your current orders and view your order history</p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="active" className="w-full">
          <TabsList className="grid w-full grid-cols-2 max-w-md">
            <TabsTrigger value="active">Active Orders ({activeOrders.length})</TabsTrigger>
            <TabsTrigger value="history">Order History ({pastOrders.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="mt-8">
            {activeOrders.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <div className="h-24 w-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                    <Package className="h-12 w-12 text-muted-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">No active orders</h3>
                  <p className="text-muted-foreground mb-6">You don't have any active orders at the moment</p>
                  <Button asChild>
                    <Link href="/vendors">Browse Vendors</Link>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6">
                {activeOrders.map((order) => (
                  <Card key={order.id} className="overflow-hidden">
                    <CardHeader className="pb-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-lg">Order from {order.vendors.vendor_name}</CardTitle>
                          <p className="text-sm text-muted-foreground">
                            {new Date(order.created_at).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                        <Badge className={`${getStatusColor(order.status)} flex items-center gap-1`}>
                          {getStatusIcon(order.status)}
                          {order.status.replace("_", " ").toUpperCase()}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="font-semibold mb-3">Order Items</h4>
                          <div className="space-y-2">
                            {order.items.map((item: any, index: number) => (
                              <div key={index} className="flex justify-between items-center">
                                <span className="text-sm">
                                  {item.quantity}x {item.name}
                                </span>
                                <span className="text-sm font-medium">₵{item.price * item.quantity}</span>
                              </div>
                            ))}
                          </div>
                          <div className="border-t pt-2 mt-3">
                            <div className="flex justify-between items-center font-semibold">
                              <span>Total</span>
                              <span className="text-orange-500">₵{order.total_price}</span>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h4 className="font-semibold mb-3">Delivery Details</h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4 text-muted-foreground" />
                              <span>{order.delivery_address}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Phone className="h-4 w-4 text-muted-foreground" />
                              <span>{order.vendors.phone}</span>
                            </div>
                          </div>

                          {order.status === "en_route" && (
                            <Button className="w-full mt-4 bg-transparent" variant="outline">
                              Track Order
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="history" className="mt-8">
            {pastOrders.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <div className="h-24 w-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                    <Clock className="h-12 w-12 text-muted-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">No order history</h3>
                  <p className="text-muted-foreground mb-6">Your completed orders will appear here</p>
                  <Button asChild>
                    <Link href="/vendors">Place Your First Order</Link>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6">
                {pastOrders.map((order) => (
                  <Card key={order.id} className="overflow-hidden">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="font-semibold text-lg">{order.vendors.vendor_name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {new Date(order.created_at).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                          </p>
                        </div>
                        <div className="text-right">
                          <Badge className={`${getStatusColor(order.status)} mb-2`}>
                            {order.status.replace("_", " ").toUpperCase()}
                          </Badge>
                          <p className="font-semibold text-orange-500">₵{order.total_price}</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="text-sm text-muted-foreground">
                          {order.items.length} item{order.items.length !== 1 ? "s" : ""}
                        </div>
                        <div className="flex gap-2">
                          {order.status === "delivered" && (
                            <Button size="sm" variant="outline">
                              <Star className="h-4 w-4 mr-1" />
                              Rate Order
                            </Button>
                          )}
                          <Button size="sm" variant="outline">
                            Reorder
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
