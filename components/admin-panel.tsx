"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Shield, Search, Eye, AlertTriangle, CheckCircle, Clock, MapPin, ArrowRight } from 'lucide-react'
import { useToast } from "@/hooks/use-toast"
import { DownloadButtons } from "@/components/download-utils"
import HyperledgerVisualizer from "@/components/hyperledger-visualizer"

interface AuditLog {
  id: string
  timestamp: string
  action: string
  actor: string
  role: string
  location: string
  batchId?: string
  drugName?: string
  blockchainTxId: string
  status: "success" | "pending" | "waiting"
  fromEntity?: string
  toEntity?: string
  details: string
  quantity?: number
}

interface DrugPath {
  id: string
  batchId: string
  drugName: string
  manufacturer: string
  currentLocation: string
  status: "in-transit" | "delivered" | "dispensed"
  path: {
    location: string
    timestamp: string
    handler: string
    role: string
    action: string
  }[]
}

export default function AdminPanel() {
  const { toast } = useToast()
  const [searchBatchId, setSearchBatchId] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [drugPath, setDrugPath] = useState<DrugPath | null>(null)

  // Filter and sort states
  const [auditFilter, setAuditFilter] = useState("all")
  const [auditSort, setAuditSort] = useState("timestamp")
  const [auditSearch, setAuditSearch] = useState("")

  // Enhanced audit logs with clear sender/receiver details and progressive timestamps
  const generateAuditLogs = (): AuditLog[] => {
    const baseDate = new Date("2024-01-01T08:00:00Z")

    return [
      {
        id: "1",
        timestamp: new Date(baseDate.getTime()).toISOString(),
        action: "Drug Batch Created",
        actor: "Sun Pharma Manufacturing Team",
        role: "Manufacturer",
        location: "Sun Pharma Facility, Mumbai",
        batchId: "BATCH-1ldf2g-ABCDE",
        drugName: "Paracetamol 500mg",
        blockchainTxId: "TX-CREATE-1234567890",
        status: "success",
        details: "New drug batch created with 1000 units. QR code generated and blockchain entry recorded.",
        quantity: 1000,
      },
      {
        id: "2",
        timestamp: new Date(baseDate.getTime() + 6 * 60 * 60 * 1000).toISOString(), // +6 hours
        action: "Drug Batch Dispatched",
        actor: "Sun Pharma Logistics Team",
        role: "Manufacturer",
        location: "Sun Pharma Facility, Mumbai",
        batchId: "BATCH-1ldf2g-ABCDE",
        drugName: "Paracetamol 500mg",
        blockchainTxId: "TX-DISPATCH-1234567891",
        status: "success",
        fromEntity: "Sun Pharma Manufacturing",
        toEntity: "Delhi Distribution Center",
        details: "Batch dispatched from manufacturer to distributor. 1000 units sent via logistics partner.",
        quantity: 1000,
      },
      {
        id: "3",
        timestamp: new Date(baseDate.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString(), // +2 days
        action: "Drug Batch Received",
        actor: "Delhi Distribution Center Staff",
        role: "Distributor",
        location: "Delhi Distribution Center",
        batchId: "BATCH-1ldf2g-ABCDE",
        drugName: "Paracetamol 500mg",
        blockchainTxId: "TX-RECEIVE-1234567892",
        status: "pending",
        fromEntity: "Sun Pharma Manufacturing",
        toEntity: "Delhi Distribution Center",
        details: "Batch received by distributor and verified. Awaiting dispatch to hospital. Status: PENDING (received but not yet sent).",
        quantity: 1000,
      },
      {
        id: "4",
        timestamp: new Date(baseDate.getTime() + 3 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000).toISOString(), // +3 days, +4 hours
        action: "Drug Batch Dispatched to Hospital",
        actor: "Delhi Distribution Center Manager",
        role: "Distributor",
        location: "Delhi Distribution Center",
        batchId: "BATCH-1ldf2g-ABCDE",
        drugName: "Paracetamol 500mg",
        blockchainTxId: "TX-HOSPITAL-DISPATCH-1234567893",
        status: "waiting",
        fromEntity: "Delhi Distribution Center",
        toEntity: "AIIMS Delhi",
        details: "Batch dispatched from distributor to hospital. 500 units sent. Status: WAITING (sent but not yet received by hospital).",
        quantity: 500,
      },
      {
        id: "5",
        timestamp: new Date(baseDate.getTime() + 4 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000).toISOString(), // +4 days, +2 hours
        action: "Drug Batch Received by Hospital",
        actor: "Dr. Sharma - AIIMS Delhi",
        role: "Hospital Staff",
        location: "AIIMS Delhi Pharmacy",
        batchId: "BATCH-1ldf2g-ABCDE",
        drugName: "Paracetamol 500mg",
        blockchainTxId: "TX-HOSPITAL-RECEIVE-1234567894",
        status: "success",
        fromEntity: "Delhi Distribution Center",
        toEntity: "AIIMS Delhi",
        details: "Batch successfully received by hospital pharmacy. 500 units verified and added to inventory.",
        quantity: 500,
      },
      {
        id: "6",
        timestamp: new Date(baseDate.getTime() + 5 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000).toISOString(), // +5 days, +3 hours
        action: "Patient Verification Completed",
        actor: "Dr. Sharma - AIIMS Delhi",
        role: "Hospital Staff",
        location: "AIIMS Delhi",
        blockchainTxId: "TX-PATIENT-VERIFY-1234567895",
        status: "success",
        details: "Patient identity verified using Aadhaar ID and admin passcode. Ready for drug dispensing.",
      },
      {
        id: "7",
        timestamp: new Date(baseDate.getTime() + 5 * 24 * 60 * 60 * 1000 + 5 * 60 * 60 * 1000).toISOString(), // +5 days, +5 hours
        action: "Drug Dispensed to Patient",
        actor: "Pharmacist - AIIMS Delhi",
        role: "Pharmacy Staff",
        location: "AIIMS Delhi Pharmacy Counter",
        batchId: "BATCH-1ldf2g-ABCDE",
        drugName: "Paracetamol 500mg",
        blockchainTxId: "TX-PATIENT-DISPENSE-1234567896",
        status: "success",
        fromEntity: "AIIMS Delhi Pharmacy",
        toEntity: "Patient: Rajesh Kumar",
        details: "30 units dispensed to verified patient. Final step in supply chain completed successfully.",
        quantity: 30,
      },
      {
        id: "8",
        timestamp: new Date(baseDate.getTime() + 6 * 24 * 60 * 60 * 1000).toISOString(), // +6 days
        action: "Low Stock Alert Generated",
        actor: "AI Monitoring System",
        role: "System",
        location: "Rural Health Center - Rajasthan",
        drugName: "Metformin 500mg",
        blockchainTxId: "TX-ALERT-1234567897",
        status: "pending",
        details: "Automated alert: Stock below rural priority threshold. Current: 25 units, Required: 80 units. Action needed.",
      },
    ]
  }

  const auditLogs = generateAuditLogs()

  // Sample drug paths with progressive timestamps
  const sampleDrugPaths: { [key: string]: DrugPath } = {
    "BATCH-1ldf2g-ABCDE": {
      id: "1",
      batchId: "BATCH-1ldf2g-ABCDE",
      drugName: "Paracetamol 500mg",
      manufacturer: "Sun Pharma",
      currentLocation: "AIIMS Delhi",
      status: "dispensed",
      path: [
        {
          location: "Sun Pharma Manufacturing - Mumbai",
          timestamp: "2024-01-01T08:00:00Z",
          handler: "Manufacturing Team",
          role: "Manufacturer",
          action: "Batch Created & QR Generated",
        },
        {
          location: "Sun Pharma Logistics - Mumbai",
          timestamp: "2024-01-01T14:00:00Z",
          handler: "Logistics Team",
          role: "Manufacturer",
          action: "Batch Dispatched to Distributor",
        },
        {
          location: "Delhi Distribution Center",
          timestamp: "2024-01-03T08:00:00Z",
          handler: "Distribution Staff",
          role: "Distributor",
          action: "Received from Manufacturer",
        },
        {
          location: "Delhi Distribution Center",
          timestamp: "2024-01-04T12:00:00Z",
          handler: "Distribution Manager",
          role: "Distributor",
          action: "Dispatched to Hospital",
        },
        {
          location: "AIIMS Delhi",
          timestamp: "2024-01-05T10:00:00Z",
          handler: "Dr. Sharma",
          role: "Hospital Staff",
          action: "Received & Stock Updated",
        },
        {
          location: "AIIMS Delhi - Pharmacy Counter",
          timestamp: "2024-01-06T13:00:00Z",
          handler: "Pharmacist",
          role: "Pharmacy",
          action: "Dispensed to Patient",
        },
      ],
    },
  }

  const searchDrugPath = async () => {
    if (!searchBatchId) {
      toast({
        title: "Missing Batch ID",
        description: "Please enter a batch ID to search",
        variant: "destructive",
      })
      return
    }

    setIsSearching(true)

    try {
      await new Promise((resolve) => setTimeout(resolve, 1500))

      const path = sampleDrugPaths[searchBatchId]

      if (path) {
        setDrugPath(path)
        toast({
          title: "Drug Path Found",
          description: `Tracking information for ${path.drugName} retrieved`,
        })
      } else {
        toast({
          title: "Batch Not Found",
          description: "No tracking information found for this batch ID",
          variant: "destructive",
        })
        setDrugPath(null)
      }
    } catch (error) {
      toast({
        title: "Search Failed",
        description: "Please try again",
        variant: "destructive",
      })
    } finally {
      setIsSearching(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-500" />
      case "waiting":
        return <AlertTriangle className="h-4 w-4 text-orange-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "in-transit":
        return "bg-blue-500"
      case "delivered":
        return "bg-green-500"
      case "dispensed":
        return "bg-purple-500"
      default:
        return "bg-gray-500"
    }
  }

  const getStatusExplanation = (status: string) => {
    switch (status) {
      case "success":
        return "Both sent and received operations completed successfully"
      case "pending":
        return "Received but not yet sent to next stage"
      case "waiting":
        return "Sent but not yet received by next party"
      default:
        return "Unknown status"
    }
  }

  // Filter and sort audit logs
  const filteredAndSortedAuditLogs = auditLogs
    .filter((log) => {
      if (auditFilter !== "all" && log.status !== auditFilter) return false
      if (
        auditSearch &&
        !Object.values(log).some((value) => value?.toString().toLowerCase().includes(auditSearch.toLowerCase()))
      )
        return false
      return true
    })
    .sort((a, b) => {
      switch (auditSort) {
        case "timestamp":
          return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        case "action":
          return a.action.localeCompare(b.action)
        case "status":
          return a.status.localeCompare(b.status)
        default:
          return 0
      }
    })

  return (
    <div className="space-y-6">
      <Card className="border-[#007CC3]/20 bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-[#007CC3]">
            <Shield className="h-5 w-5" />
            Admin/Regulator Panel
          </CardTitle>
          <CardDescription className="text-[#3781C2]">
            Monitor supply chain compliance, audit trails, and drug traceability with blockchain verification
          </CardDescription>
        </CardHeader>
      </Card>

      <Tabs defaultValue="tracking" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3 bg-[#007CC3]/10">
          <TabsTrigger value="tracking" className="data-[state=active]:bg-[#007CC3] data-[state=active]:text-white">Drug Tracking</TabsTrigger>
          <TabsTrigger value="audit" className="data-[state=active]:bg-[#007CC3] data-[state=active]:text-white">Audit Logs</TabsTrigger>
          <TabsTrigger value="hyperledger" className="data-[state=active]:bg-[#007CC3] data-[state=active]:text-white">Hyperledger Fabric</TabsTrigger>
        </TabsList>

        <TabsContent value="tracking" className="space-y-4">
          {/* Drug Path Search */}
          <Card className="border-[#007CC3]/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[#007CC3]">
                <Search className="h-5 w-5" />
                Drug Batch Tracking
              </CardTitle>
              <CardDescription>Track the complete journey of a drug batch from manufacturer to patient</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-1">
                  <Label htmlFor="batchId" className="text-[#007CC3]">Batch ID</Label>
                  <Input
                    id="batchId"
                    value={searchBatchId}
                    onChange={(e) => setSearchBatchId(e.target.value)}
                    placeholder="Enter batch ID (e.g., BATCH-1ldf2g-ABCDE)"
                    className="border-[#007CC3]/30 focus:border-[#007CC3]"
                  />
                </div>
                <div className="flex items-end">
                  <Button 
                    onClick={searchDrugPath} 
                    disabled={isSearching}
                    className="bg-[#007CC3] hover:bg-[#3781C2] transition-all duration-300"
                  >
                    {isSearching ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Searching...
                      </>
                    ) : (
                      <>
                        <Search className="h-4 w-4 mr-2" />
                        Track
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {/* Sample Batch IDs */}
              <div className="bg-[#007CC3]/5 p-4 rounded-lg border border-[#007CC3]/20">
                <h4 className="font-medium mb-2 text-[#007CC3]">Sample Batch IDs for Demo:</h4>
                <div className="flex flex-wrap gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setSearchBatchId("BATCH-1ldf2g-ABCDE")}
                    className="border-[#007CC3] text-[#007CC3] hover:bg-[#007CC3] hover:text-white"
                  >
                    BATCH-1ldf2g-ABCDE
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setSearchBatchId("BATCH-1ldf2h-XYZAB")}
                    className="border-[#007CC3] text-[#007CC3] hover:bg-[#007CC3] hover:text-white"
                  >
                    BATCH-1ldf2h-XYZAB
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Drug Path Results */}
          {drugPath && (
            <Card className="border-[#007CC3]/20">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-[#007CC3]">Drug Journey: {drugPath.drugName}</CardTitle>
                    <CardDescription>
                      Complete traceability from {drugPath.manufacturer} to current location
                    </CardDescription>
                  </div>
                  <DownloadButtons
                    data={drugPath}
                    filename={`drug-tracking-${drugPath.batchId}`}
                    title={`Drug Tracking: ${drugPath.drugName}`}
                    type="tracking"
                  />
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="text-center p-4 bg-[#007CC3]/5 rounded-lg border border-[#007CC3]/20">
                    <h3 className="font-semibold text-[#007CC3]">Batch ID</h3>
                    <p className="text-sm text-[#3781C2]">{drugPath.batchId}</p>
                  </div>
                  <div className="text-center p-4 bg-[#007CC3]/5 rounded-lg border border-[#007CC3]/20">
                    <h3 className="font-semibold text-[#007CC3]">Current Location</h3>
                    <p className="text-sm text-[#3781C2]">{drugPath.currentLocation}</p>
                  </div>
                  <div className="text-center p-4 bg-[#007CC3]/5 rounded-lg border border-[#007CC3]/20">
                    <h3 className="font-semibold text-[#007CC3]">Status</h3>
                    <Badge className={getStatusColor(drugPath.status)}>
                      {drugPath.status.charAt(0).toUpperCase() + drugPath.status.slice(1)}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold text-[#007CC3]">Supply Chain Journey:</h3>
                  {drugPath.path.map((step, index) => (
                    <div key={index} className="flex items-start gap-4 p-4 border border-[#007CC3]/20 rounded-lg bg-gradient-to-r from-blue-50/50 to-indigo-50/50 hover:shadow-md transition-all duration-300">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-[#007CC3] text-white rounded-full flex items-center justify-center font-bold text-sm">
                          {index + 1}
                        </div>
                      </div>
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-[#007CC3]">{step.action}</h4>
                          <Badge variant="outline" className="border-[#007CC3] text-[#007CC3]">{step.role}</Badge>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-[#3781C2]">
                          <MapPin className="h-3 w-3" />
                          {step.location}
                        </div>
                        <div className="text-sm text-gray-600">Handler: {step.handler}</div>
                        <div className="text-xs text-gray-500">{new Date(step.timestamp).toLocaleString()}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="audit" className="space-y-4">
          {/* Audit Logs with Enhanced Filters */}
          <Card className="border-[#007CC3]/20">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Eye className="h-5 w-5 text-[#007CC3]" />
                  <span className="text-[#007CC3]">Enhanced System Audit Logs</span>
                </div>
                <DownloadButtons
                  data={filteredAndSortedAuditLogs}
                  filename="medchain-audit-logs"
                  title="MedChain Audit Logs"
                  type="audit"
                />
              </CardTitle>
              <CardDescription className="text-[#3781C2]">
                Complete audit trail with clear sender/receiver details and blockchain verification
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Enhanced Filters and Search */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="space-y-2">
                  <Label className="text-[#007CC3]">Search Audit Logs</Label>
                  <Input
                    placeholder="Search by action, actor, location..."
                    value={auditSearch}
                    onChange={(e) => setAuditSearch(e.target.value)}
                    className="border-[#007CC3]/30 focus:border-[#007CC3]"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-[#007CC3]">Filter by Status</Label>
                  <Select value={auditFilter} onValueChange={setAuditFilter}>
                    <SelectTrigger className="border-[#007CC3]/30 focus:ring-[#007CC3]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="success">Success</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="waiting">Waiting</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-[#007CC3]">Sort by</Label>
                  <Select value={auditSort} onValueChange={setAuditSort}>
                    <SelectTrigger className="border-[#007CC3]/30 focus:ring-[#007CC3]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="timestamp">Timestamp</SelectItem>
                      <SelectItem value="action">Action</SelectItem>
                      <SelectItem value="status">Status</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-3">
                {filteredAndSortedAuditLogs.map((log) => (
                  <div key={log.id} className="border border-[#007CC3]/20 rounded-lg p-4 space-y-3 bg-gradient-to-r from-blue-50/30 to-indigo-50/30 hover:shadow-lg transition-all duration-300">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(log.status)}
                        <h3 className="font-medium text-[#007CC3]">{log.action}</h3>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-xs text-gray-500">{new Date(log.timestamp).toLocaleString()}</div>
                        <Badge
                          variant={
                            log.status === "success"
                              ? "default"
                              : log.status === "pending"
                                ? "secondary"
                                : "destructive"
                          }
                          className={
                            log.status === "success" 
                              ? "bg-green-500" 
                              : log.status === "pending" 
                                ? "bg-yellow-500" 
                                : "bg-orange-500"
                          }
                        >
                          {log.status.toUpperCase()}
                        </Badge>
                      </div>
                    </div>

                    {/* Enhanced Actor and Flow Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div className="space-y-2">
                        <div>
                          <span className="font-medium text-[#007CC3]">Actor:</span>
                          <p className="text-[#3781C2]">{log.actor}</p>
                        </div>
                        <div>
                          <span className="font-medium text-[#007CC3]">Role:</span>
                          <p className="text-[#3781C2]">{log.role}</p>
                        </div>
                        <div>
                          <span className="font-medium text-[#007CC3]">Location:</span>
                          <p className="text-[#3781C2]">{log.location}</p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        {log.fromEntity && log.toEntity && (
                          <div className="flex items-center gap-2 p-2 bg-white/50 rounded border border-[#007CC3]/10">
                            <span className="text-xs font-medium text-[#007CC3]">Flow:</span>
                            <span className="text-xs text-[#3781C2]">{log.fromEntity}</span>
                            <ArrowRight className="h-3 w-3 text-[#007CC3]" />
                            <span className="text-xs text-[#3781C2]">{log.toEntity}</span>
                          </div>
                        )}
                        {log.quantity && (
                          <div>
                            <span className="font-medium text-[#007CC3]">Quantity:</span>
                            <p className="text-[#3781C2]">{log.quantity} units</p>
                          </div>
                        )}
                        <div>
                          <span className="font-medium text-[#007CC3]">Status Explanation:</span>
                          <p className="text-xs text-gray-600">{getStatusExplanation(log.status)}</p>
                        </div>
                      </div>
                    </div>

                    {(log.batchId || log.drugName) && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        {log.drugName && (
                          <div>
                            <span className="font-medium text-[#007CC3]">Drug:</span>
                            <p className="text-[#3781C2]">{log.drugName}</p>
                          </div>
                        )}
                        {log.batchId && (
                          <div>
                            <span className="font-medium text-[#007CC3]">Batch ID:</span>
                            <p className="text-[#3781C2]">{log.batchId}</p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Detailed Description */}
                    <div className="bg-white/70 p-3 rounded border border-[#007CC3]/10">
                      <span className="font-medium text-[#007CC3] text-sm">Details:</span>
                      <p className="text-sm text-[#3781C2] mt-1">{log.details}</p>
                    </div>

                    <div className="bg-gray-50 p-2 rounded text-xs border border-[#007CC3]/10">
                      <span className="font-medium text-[#007CC3]">Blockchain TX:</span> 
                      <span className="text-[#3781C2] font-mono ml-1">{log.blockchainTxId}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Enhanced Status Legend */}
          <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-[#007CC3]/20">
            <CardHeader>
              <CardTitle className="text-[#007CC3]">Audit Status Legend</CardTitle>
              <CardDescription className="text-[#3781C2]">Understanding audit log status indicators and flow</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-lg border border-green-200">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <h4 className="font-medium text-green-700">SUCCESS</h4>
                  </div>
                  <p className="text-sm text-green-600">
                    Complete transaction: Both sent and received operations completed successfully. 
                    Clear sender → receiver flow documented.
                  </p>
                </div>

                <div className="bg-white p-4 rounded-lg border border-yellow-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="h-5 w-5 text-yellow-500" />
                    <h4 className="font-medium text-yellow-700">PENDING</h4>
                  </div>
                  <p className="text-sm text-yellow-600">
                    Received but not dispatched: Entity has received goods but hasn't sent them to the next stage yet.
                    Awaiting internal processing.
                  </p>
                </div>

                <div className="bg-white p-4 rounded-lg border border-orange-200">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="h-5 w-5 text-orange-500" />
                    <h4 className="font-medium text-orange-700">WAITING</h4>
                  </div>
                  <p className="text-sm text-orange-600">
                    Sent but not received: Goods dispatched by sender but not yet confirmed as received by recipient.
                    In transit or awaiting confirmation.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="hyperledger" className="space-y-4">
          <HyperledgerVisualizer />
        </TabsContent>
      </Tabs>
    </div>
  )
}
