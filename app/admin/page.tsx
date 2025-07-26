"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Check, X, Eye, MapPin, Phone, Mail, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { supabase, type Vendor } from "@/lib/supabase"
import { getCurrentUser } from "@/lib/auth"

interface VendorWithUser extends Vendor {
  users: {
    name: string
    email: string
    phone: string
  }
}

export default function AdminPage() {
  const [user, setUser] = useState<any>(null)
  const [pendingVendors, setPendingVendors] = useState<VendorWithUser[]>([])
  const [approvedVendors, setApprovedVendors] = useState<VendorWithUser[]>([])
  const [blockedVendors, setBlockedVendors] = useState<VendorWithUser[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    const checkAdminAndFetchData = async () => {
      try {
        const currentUser = await getCurrentUser()
        if (!currentUser || currentUser.role !== "admin") {
          router.push("/")
          return
        }
        setUser(currentUser)
        await fetchVendors()
      } catch (error) {
        console.error("Error:", error)
      } finally {
        setLoading(false)
      }
    }

    checkAdminAndFetchData()
  }, [router])

  const fetchVendors = async () => {
    try {
      const { data } = await supabase
        .from("vendors")
        .select(`
          *,
          users (
            name,
            email,
            phone
          )
        `)
        .order("created_at", { ascending: false })

      if (data) {
        setPendingVendors(data.filter((v) => v.status === "pending"))
        setApprovedVendors(data.filter((v) => v.status === "approved"))
        setBlockedVendors(data.filter((v) => v.status === "blocked"))
      }
    } catch (error) {
      console.error("Error fetching vendors:", error)
    }
  }

  const updateVendorStatus = async (vendorId: string, status: "approved" | "blocked") => {
    try {
      const { error } = await supabase
        .from("vendors")
        .update({ status, updated_at: new Date().toISOString() })
        .eq("id", vendorId)

      if (error) throw error

      toast({
        title: "Vendor status updated",
        description: `Vendor has been ${status}`,
      })

      await fetchVendors()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  const VendorCard = ({ vendor, showActions = true }: { vendor: VendorWithUser; showActions?: boolean }) => (
    <Card className="overflow-hidden">
      <div className="relative h-32 bg-gradient-to-r from-orange-400 to-red-400">
        {vendor.image_url && (
          <Image src={vendor.image_url || "/placeholder.svg"} alt={vendor.vendor_name} fill className="object-cover" />
        )}
        <div className="absolute top-3 right-3">
          <Badge
            variant={
              vendor.status === "approved" ? "default" : vendor.status === "pending" ? "secondary" : "destructive"
            }
          >
            {vendor.status}
          </Badge>
        </div>
      </div>
      <CardContent className="p-6">
        <div className="space-y-4">
          <div>
            <h3 className="font-bold text-lg">{vendor.vendor_name}</h3>
            <p className="text-muted-foreground text-sm line-clamp-2">
              {vendor.description || "No description provided"}
            </p>
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span>{vendor.users.email}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span>{vendor.users.phone || "No phone provided"}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span>{vendor.address || "No address provided"}</span>
            </div>
          </div>

          <div className="text-xs text-muted-foreground">
            Applied: {new Date(vendor.created_at).toLocaleDateString()}
          </div>

          {showActions && vendor.status === "pending" && (
            <div className="flex gap-2 pt-2">
              <Button size="sm" onClick={() => updateVendorStatus(vendor.id, "approved")} className="flex-1">
                <Check className="h-4 w-4 mr-1" />
                Approve
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => updateVendorStatus(vendor.id, "blocked")}
                className="flex-1"
              >
                <X className="h-4 w-4 mr-1" />
                Reject
              </Button>
            </div>
          )}

          {showActions && vendor.status === "approved" && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => updateVendorStatus(vendor.id, "blocked")}
              className="w-full"
            >
              <AlertTriangle className="h-4 w-4 mr-1" />
              Block Vendor
            </Button>
          )}

          {showActions && vendor.status === "blocked" && (
            <Button size="sm" onClick={() => updateVendorStatus(vendor.id, "approved")} className="w-full">
              <Check className="h-4 w-4 mr-1" />
              Unblock Vendor
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )

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
            <h1 className="text-3xl md:text-5xl font-bold mb-4">Admin Panel</h1>
            <p className="text-lg text-muted-foreground">Manage vendor applications and monitor platform activities</p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="pending" className="w-full">
          <TabsList className="grid w-full grid-cols-3 max-w-md">
            <TabsTrigger value="pending">Pending ({pendingVendors.length})</TabsTrigger>
            <TabsTrigger value="approved">Approved ({approvedVendors.length})</TabsTrigger>
            <TabsTrigger value="blocked">Blocked ({blockedVendors.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="mt-8">
            {pendingVendors.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <div className="h-24 w-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                    <Eye className="h-12 w-12 text-muted-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">No pending applications</h3>
                  <p className="text-muted-foreground">All vendor applications have been reviewed</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {pendingVendors.map((vendor) => (
                  <VendorCard key={vendor.id} vendor={vendor} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="approved" className="mt-8">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {approvedVendors.map((vendor) => (
                <VendorCard key={vendor.id} vendor={vendor} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="blocked" className="mt-8">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {blockedVendors.map((vendor) => (
                <VendorCard key={vendor.id} vendor={vendor} />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
