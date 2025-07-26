"use client"

import { useState, useEffect } from "react"
import { Clock, MapPin, Phone, Star, ChevronRight } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ProtectedRoute } from "@/components/protected-route"
import { OrderMap } from "@/components/order-map"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/lib/auth"

interface Order {
  id: string
  created_at: string
  status: string
  total_amount: number
  delivery_address: string
  vendor_id: string
  order_items: any[]
  vendors?: {
    vendor_name: string
    phone: string
    address: string
  }
}

export default function OrdersPage() {
  const { user } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) return

      try {
        const { data } = await supabase
          .from("orders")
          .select(`
            *,
            vendors (
              vendor_name,
              phone,
              address
            ),
            order_items (
              quantity,
              price,
              menu_items (
                name,
                image_url
              )
            )
          `)
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })

        setOrders(data || [])
        if (data && data.length > 0) {
          // Set the first active order as selected
          const activeOrder = data.find((order) =>
            ["confirmed", "preparing", "ready", "picked_up", "en_route"].includes(order.status),
          )
          setSelectedOrder(activeOrder || data[0])
        }
      } catch (error) {
        console.error("Error fetching orders:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchOrders()
  }, [user])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-500"
      case "confirmed":
        return "bg-blue-500"
      case "preparing":
        return "bg-orange-500"
      case "ready":
        return "bg-purple-500"
      case "picked_up":
        return "bg-indigo-500"
      case "en_route":
        return "bg-green-500"
      case "delivered":
        return "bg-emerald-500"
      case "cancelled":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "pending":
        return "Pending"
      case "confirmed":
        return "Confirmed"
      case "preparing":
        return "Preparing"
      case "ready":
        return "Ready"
      case "picked_up":
        return "Picked Up"
      case "en_route":
        return "On the Way"
      case "delivered":
        return "Delivered"
      case "cancelled":
        return "Cancelled"
      default:
        return "Unknown"
    }
  }

  const activeOrders = orders.filter((order) =>
    ["pending", "confirmed", "preparing", "ready", "picked_up", "en_route"].includes(order.status),
  )

  const pastOrders = orders.filter((order) => ["delivered", "cancelled"].includes(order.status))

  const OrderCard = ({ order, onClick }: { order: Order; onClick?: () => void }) => (
    <Card
      className={`cursor-pointer transition-all hover:shadow-md ${
        selectedOrder?.id === order.id ? "ring-2 ring-orange-500" : ""
      }`}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="font-semibold">Order #{order.id.slice(-6)}</p>
            <p className="text-sm text-muted-foreground">{order.vendors?.vendor_name}</p>
          </div>
          <Badge className={getStatusColor(order.status)}>{getStatusText(order.status)}</Badge>
        </div>

        <div className="space-y-2 mb-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>{new Date(order.created_at).toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span className="truncate">{order.delivery_address}</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="font-semibold text-lg">₵{order.total_amount}</span>
          {onClick && <ChevronRight className="h-5 w-5 text-muted-foreground" />}
        </div>

        {/* Order Items Preview */}
        <div className="mt-3 pt-3 border-t">
          <p className="text-xs text-muted-foreground mb-1">{order.order_items?.length || 0} items</p>
          <div className="flex gap-1">
            {order.order_items?.slice(0, 3).map((item, index) => (
              <div key={index} className="text-xs bg-muted px-2 py-1 rounded">
                {item.quantity}x {item.menu_items?.name}
              </div>
            ))}
            {(order.order_items?.length || 0) > 3 && (
              <div className="text-xs bg-muted px-2 py-1 rounded">+{(order.order_items?.length || 0) - 3} more</div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-muted rounded w-1/4" />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-32 bg-muted rounded-lg" />
                ))}
              </div>
              <div className="h-96 bg-muted rounded-lg" />
            </div>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Your Orders</h1>
          <p className="text-muted-foreground">Track and manage your food orders</p>
        </div>

        {orders.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Clock className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">No orders yet</h3>
              <p className="text-muted-foreground mb-6">Start exploring our vendors and place your first order!</p>
              <Button asChild>
                <a href="/vendors">Browse Vendors</a>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Orders List */}
            <div>
              <Tabs defaultValue="active" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="active">Active Orders ({activeOrders.length})</TabsTrigger>
                  <TabsTrigger value="past">Past Orders ({pastOrders.length})</TabsTrigger>
                </TabsList>

                <TabsContent value="active" className="space-y-4 mt-4">
                  {activeOrders.length > 0 ? (
                    activeOrders.map((order) => (
                      <OrderCard key={order.id} order={order} onClick={() => setSelectedOrder(order)} />
                    ))
                  ) : (
                    <Card>
                      <CardContent className="text-center py-8">
                        <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">No active orders</p>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

                <TabsContent value="past" className="space-y-4 mt-4">
                  {pastOrders.length > 0 ? (
                    pastOrders.map((order) => (
                      <OrderCard key={order.id} order={order} onClick={() => setSelectedOrder(order)} />
                    ))
                  ) : (
                    <Card>
                      <CardContent className="text-center py-8">
                        <Star className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">No past orders</p>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>
              </Tabs>
            </div>

            {/* Order Details & Tracking */}
            <div className="space-y-6">
              {selectedOrder ? (
                <>
                  {/* Order Map */}
                  <OrderMap
                    orderId={selectedOrder.id}
                    deliveryAddress={selectedOrder.delivery_address}
                    orderStatus={selectedOrder.status as any}
                    driverPhone="+233123456789" // Mock driver phone
                  />

                  {/* Order Details */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span>Order Details</span>
                        <Badge className={getStatusColor(selectedOrder.status)}>
                          {getStatusText(selectedOrder.status)}
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <p className="font-semibold">{selectedOrder.vendors?.vendor_name}</p>
                        <p className="text-sm text-muted-foreground">{selectedOrder.vendors?.address}</p>
                      </div>

                      <div className="space-y-2">
                        <p className="font-medium">Items Ordered:</p>
                        {selectedOrder.order_items?.map((item, index) => (
                          <div key={index} className="flex justify-between items-center py-2 border-b last:border-b-0">
                            <div>
                              <p className="font-medium">{item.menu_items?.name}</p>
                              <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                            </div>
                            <p className="font-semibold">₵{(item.price * item.quantity).toFixed(2)}</p>
                          </div>
                        ))}
                      </div>

                      <div className="pt-2 border-t">
                        <div className="flex justify-between items-center">
                          <p className="font-semibold text-lg">Total</p>
                          <p className="font-bold text-lg">₵{selectedOrder.total_amount}</p>
                        </div>
                      </div>

                      {selectedOrder.vendors?.phone && (
                        <Button
                          variant="outline"
                          className="w-full bg-transparent"
                          onClick={() => window.open(`tel:${selectedOrder.vendors?.phone}`, "_self")}
                        >
                          <Phone className="h-4 w-4 mr-2" />
                          Call Restaurant
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                </>
              ) : (
                <Card>
                  <CardContent className="text-center py-12">
                    <MapPin className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">Select an order to view tracking details</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  )
}
