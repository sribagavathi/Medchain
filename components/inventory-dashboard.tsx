"use client"

import { useState, useEffect, Fragment } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { AlertTriangle, MapPin, Bell } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { DownloadButtons } from "@/components/download-utils"

interface InventoryItem {
  id: string
  drugName: string
  currentStock: number
  minThreshold: number
  maxCapacity: number
  location: string
  locationType: "urban" | "rural"
  lastUpdated: string
  expiryDate: string
  batchId: string
}

interface StockUpdate {
  drugName: string
  quantity: number
  operation: "add" | "remove"
  batchId: string
}

export default function InventoryDashboard() {
  const { toast } = useToast()

  /* ------------------------ 1. STATE ------------------------------------ */
  const [inventory, setInventory] = useState<InventoryItem[]>([
    {
      id: "1",
      drugName: "Paracetamol 500mg",
      currentStock: 45,
      minThreshold: 100,
      maxCapacity: 500,
      location: "Rural Health Center - Rajasthan",
      locationType: "rural",
      lastUpdated: "2024-01-05T09:00:00Z",
      expiryDate: "2025-06-15",
      batchId: "BATCH-1ldf2g-ABCDE",
    },
    {
      id: "2",
      drugName: "Amoxicillin 250mg",
      currentStock: 180,
      minThreshold: 50,
      maxCapacity: 300,
      location: "AIIMS Delhi",
      locationType: "urban",
      lastUpdated: "2024-01-06T14:30:00Z",
      expiryDate: "2025-08-20",
      batchId: "BATCH-1ldf2h-XYZAB",
    },
    {
      id: "3",
      drugName: "Metformin 500mg",
      currentStock: 25,
      minThreshold: 80,
      maxCapacity: 400,
      location: "Primary Health Center - Bihar",
      locationType: "rural",
      lastUpdated: "2024-01-07T11:15:00Z",
      expiryDate: "2025-12-10",
      batchId: "BATCH-1ldf2i-EFGHI",
    },
    {
      id: "4",
      drugName: "Aspirin 75mg",
      currentStock: 120,
      minThreshold: 60,
      maxCapacity: 250,
      location: "Apollo Hospital Chennai",
      locationType: "urban",
      lastUpdated: "2024-01-08T08:45:00Z",
      expiryDate: "2025-09-30",
      batchId: "BATCH-1ldf2j-KLMNO",
    },
  ])

  const [stockUpdate, setStockUpdate] = useState<StockUpdate>({
    drugName: "",
    quantity: 0,
    operation: "add",
    batchId: "",
  })

  const [alerts, setAlerts] = useState<string[]>([])

  /* --------- filter / search / sort controls ---------- */
  const [searchTerm, setSearchTerm] = useState("")
  const [locationFilter, setLocationFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [sortBy, setSortBy] = useState("drugName")

  /* ------------------------ 2. ALERT EFFECT ------------------------------ */
  useEffect(() => {
    const lowStockItems = inventory.filter((i) => i.currentStock < i.minThreshold)
    const msgs = lowStockItems.map(
      (i) => `Low stock alert: ${i.drugName} at ${i.location} (${i.currentStock}/${i.minThreshold})`,
    )
    setAlerts(msgs)
  }, [inventory])

  /* ------------------------ 3. HELPERS ----------------------------------- */
  const getStockStatus = (item: InventoryItem) => {
    const pct = (item.currentStock / item.maxCapacity) * 100
    if (item.currentStock < item.minThreshold) return { text: "Critical", color: "bg-red-500" }
    if (pct < 30) return { text: "Low", color: "bg-yellow-500" }
    if (pct > 80) return { text: "Good", color: "bg-green-500" }
    return { text: "Normal", color: "bg-blue-500" }
  }

  const filteredInventory = inventory
    .filter((item) => {
      if (locationFilter !== "all" && item.locationType !== locationFilter) return false
      if (statusFilter === "critical" && !(item.currentStock < item.minThreshold)) return false
      if (searchTerm && !item.drugName.toLowerCase().includes(searchTerm.toLowerCase())) return false
      return true
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "drugName":
          return a.drugName.localeCompare(b.drugName)
        case "stock":
          return b.currentStock - a.currentStock
        case "expiry":
          return new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime()
        default:
          return 0
      }
    })

  /* ------------------------ 4. STOCK UPDATE ------------------------------ */
  const handleStockUpdate = () => {
    if (!stockUpdate.drugName || stockUpdate.quantity <= 0) {
      toast({
        title: "Invalid input",
        description: "Select a drug and enter a valid quantity.",
        variant: "destructive",
      })
      return
    }

    setInventory((prev) =>
      prev.map((item) =>
        item.drugName === stockUpdate.drugName
          ? {
              ...item,
              currentStock:
                stockUpdate.operation === "add"
                  ? item.currentStock + stockUpdate.quantity
                  : Math.max(0, item.currentStock - stockUpdate.quantity),
              lastUpdated: new Date().toISOString(),
              batchId: stockUpdate.batchId || item.batchId,
            }
          : item,
      ),
    )

    toast({
      title: "Stock updated",
      description: `${stockUpdate.operation === "add" ? "Added" : "Removed"} ${
        stockUpdate.quantity
      } units of ${stockUpdate.drugName}.`,
    })

    setStockUpdate({ drugName: "", quantity: 0, operation: "add", batchId: "" })
  }

  /* ------------------------ 5. RENDER ------------------------------------ */
  return (
    <div className="space-y-6">
      {/* Stock Alerts */}
      {alerts.length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-700">
              <Bell className="h-5 w-5" />
              Stock Alerts ({alerts.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {alerts.map((msg, i) => (
              <div key={i} className="flex items-center gap-2 text-sm text-red-700">
                <AlertTriangle className="h-4 w-4" />
                {msg}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Inventory Filters</CardTitle>
          <CardDescription>Search, filter, sort & download current view</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="space-y-2">
            <Label>Search Drug</Label>
            <Input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="e.g. Paracetamol" />
          </div>
          {/* Location */}
          <div className="space-y-2">
            <Label>Location Type</Label>
            <Select value={locationFilter} onValueChange={setLocationFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="urban">Urban</SelectItem>
                <SelectItem value="rural">Rural</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {/* Status */}
          <div className="space-y-2">
            <Label>Status</Label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="critical">Critical Only</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {/* Sort */}
          <div className="space-y-2">
            <Label>Sort By</Label>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="drugName">Drug Name</SelectItem>
                <SelectItem value="stock">Stock Level</SelectItem>
                <SelectItem value="expiry">Expiry Date</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
        <CardContent>
          {/* Download current filtered view */}
          <DownloadButtons
            data={filteredInventory}
            filename="current-inventory-view"
            title="Current Inventory View"
            type="tracking"
          />
        </CardContent>
      </Card>

      {/* Inventory Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Current Inventory</CardTitle>
          <CardDescription>Real-time stock levels with rural priority thresholds</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredInventory.map((item) => {
              const status = getStockStatus(item)
              const pct = (item.currentStock / item.maxCapacity) * 100

              return (
                <Fragment key={item.id}>
                  <div className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold">{item.drugName}</h3>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <MapPin className="h-3 w-3" /> {item.location}
                          <Badge variant={item.locationType === "rural" ? "default" : "secondary"}>
                            {item.locationType === "rural" ? "Rural Priority" : "Urban"}
                          </Badge>
                        </div>
                      </div>
                      <Badge variant="outline" className={`${status.color} text-white`}>
                        {status.text}
                      </Badge>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Stock Level</span>
                        <span>
                          {item.currentStock} / {item.maxCapacity} units
                        </span>
                      </div>
                      <Progress value={pct} className="h-2" />
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>Min Threshold: {item.minThreshold}</span>
                        <span>Last Updated: {new Date(item.lastUpdated).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Batch ID:</span>
                        <p className="text-gray-600">{item.batchId}</p>
                      </div>
                      <div>
                        <span className="font-medium">Expiry Date:</span>
                        <p className="text-gray-600">{item.expiryDate}</p>
                      </div>
                    </div>

                    {item.currentStock < item.minThreshold && (
                      <div className="bg-red-50 border border-red-200 rounded p-2 flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                        <span className="text-red-700 text-sm">Urgent restock needed</span>
                      </div>
                    )}
                  </div>
                </Fragment>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
