"use client"

import { useState, useEffect } from "react"
import { MapPin, Navigation, Phone, Clock } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  getCurrentLocation,
  calculateDistance,
  formatDistance,
  getEstimatedDeliveryTime,
  type Location,
} from "@/lib/geolocation"
import { useToast } from "@/hooks/use-toast"

interface OrderMapProps {
  orderId: string
  vendorLocation?: Location
  deliveryAddress: string
  orderStatus: "preparing" | "ready" | "picked_up" | "en_route" | "delivered"
  driverPhone?: string
}

export function OrderMap({
  orderId,
  vendorLocation = { latitude: 5.6037, longitude: -0.187 }, // Default to Accra
  deliveryAddress,
  orderStatus,
  driverPhone,
}: OrderMapProps) {
  const [userLocation, setUserLocation] = useState<Location | null>(null)
  const [distance, setDistance] = useState<number | null>(null)
  const [estimatedTime, setEstimatedTime] = useState<number | null>(null)
  const [locationError, setLocationError] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    const getLocation = async () => {
      try {
        const location = await getCurrentLocation()
        setUserLocation(location)

        if (vendorLocation) {
          const dist = calculateDistance(
            location.latitude,
            location.longitude,
            vendorLocation.latitude,
            vendorLocation.longitude,
          )
          setDistance(dist)
          setEstimatedTime(getEstimatedDeliveryTime(dist))
        }
      } catch (error: any) {
        setLocationError(error.message)
        toast({
          title: "Location Error",
          description: "Unable to get your location. Using default estimates.",
          variant: "destructive",
        })
      }
    }

    getLocation()
  }, [vendorLocation, toast])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "preparing":
        return "bg-yellow-500"
      case "ready":
        return "bg-blue-500"
      case "picked_up":
        return "bg-purple-500"
      case "en_route":
        return "bg-orange-500"
      case "delivered":
        return "bg-green-500"
      default:
        return "bg-gray-500"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "preparing":
        return "Being Prepared"
      case "ready":
        return "Ready for Pickup"
      case "picked_up":
        return "Picked Up"
      case "en_route":
        return "On the Way"
      case "delivered":
        return "Delivered"
      default:
        return "Unknown"
    }
  }

  const handleCallDriver = () => {
    if (driverPhone) {
      window.open(`tel:${driverPhone}`, "_self")
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Order Tracking</span>
          <Badge className={getStatusColor(orderStatus)}>{getStatusText(orderStatus)}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Map Placeholder */}
        <div className="h-48 bg-muted rounded-lg flex items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-green-100 to-blue-100 dark:from-green-900 dark:to-blue-900" />
          <div className="relative z-10 text-center">
            <MapPin className="h-12 w-12 mx-auto mb-2 text-green-600" />
            <p className="text-sm text-muted-foreground">Live tracking map</p>
            <p className="text-xs text-muted-foreground">Order #{orderId.slice(-6)}</p>
          </div>

          {/* Simulated route line */}
          <div className="absolute top-1/4 left-1/4 w-1/2 h-0.5 bg-orange-500 transform rotate-45" />

          {/* Vendor marker */}
          <div className="absolute top-1/4 left-1/4 w-3 h-3 bg-blue-500 rounded-full border-2 border-white" />

          {/* User marker */}
          <div className="absolute bottom-1/4 right-1/4 w-3 h-3 bg-red-500 rounded-full border-2 border-white" />
        </div>

        {/* Location Info */}
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <MapPin className="h-5 w-5 text-blue-500 mt-0.5" />
            <div>
              <p className="font-medium text-sm">Vendor Location</p>
              <p className="text-xs text-muted-foreground">Restaurant preparing your order</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Navigation className="h-5 w-5 text-red-500 mt-0.5" />
            <div>
              <p className="font-medium text-sm">Delivery Address</p>
              <p className="text-xs text-muted-foreground">{deliveryAddress}</p>
            </div>
          </div>
        </div>

        {/* Distance and Time Info */}
        {distance && estimatedTime && (
          <div className="grid grid-cols-2 gap-4 p-3 bg-muted/50 rounded-lg">
            <div className="text-center">
              <p className="text-lg font-semibold">{formatDistance(distance)}</p>
              <p className="text-xs text-muted-foreground">Distance</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-semibold">{estimatedTime} min</p>
              <p className="text-xs text-muted-foreground">Est. Time</p>
            </div>
          </div>
        )}

        {/* Progress Steps */}
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${orderStatus === "preparing" ? "bg-yellow-500" : "bg-green-500"}`} />
            <span className="text-sm">Order confirmed & being prepared</span>
          </div>
          <div className="flex items-center gap-3">
            <div
              className={`w-3 h-3 rounded-full ${["ready", "picked_up", "en_route", "delivered"].includes(orderStatus) ? "bg-green-500" : "bg-gray-300"}`}
            />
            <span className="text-sm">Ready for pickup</span>
          </div>
          <div className="flex items-center gap-3">
            <div
              className={`w-3 h-3 rounded-full ${["picked_up", "en_route", "delivered"].includes(orderStatus) ? "bg-green-500" : "bg-gray-300"}`}
            />
            <span className="text-sm">Picked up by driver</span>
          </div>
          <div className="flex items-center gap-3">
            <div
              className={`w-3 h-3 rounded-full ${["en_route", "delivered"].includes(orderStatus) ? "bg-green-500" : "bg-gray-300"}`}
            />
            <span className="text-sm">On the way to you</span>
          </div>
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${orderStatus === "delivered" ? "bg-green-500" : "bg-gray-300"}`} />
            <span className="text-sm">Delivered</span>
          </div>
        </div>

        {/* Driver Contact */}
        {driverPhone && (orderStatus === "picked_up" || orderStatus === "en_route") && (
          <Button onClick={handleCallDriver} className="w-full bg-green-600 hover:bg-green-700">
            <Phone className="h-4 w-4 mr-2" />
            Call Driver
          </Button>
        )}

        {/* Location Error */}
        {locationError && (
          <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              <Clock className="h-4 w-4 inline mr-1" />
              Using estimated delivery times. Enable location for accurate tracking.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
