"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { QrCode, Scan, MapPin, Clock, CheckCircle, Package, Download, Send } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { DownloadButtons } from "@/components/download-utils"

interface ScanRecord {
  id: string
  qrCode: string
  batchId: string
  drugName: string
  scanLocation: string
  scannerRole: string
  timestamp: string
  blockchainTxId: string
  status: "verified" | "invalid"
  actionType: "received" | "sent"
}

interface DispensingRecord {
  id: string
  patientId: string
  patientName: string
  drugName: string
  batchId: string
  quantity: number
  timestamp: string
  location: string
  blockchainTxId: string
  distributorName: string
  status: "sent" | "received" | "pending"
}

export default function DistributorInterface() {
  const { toast } = useToast()
  const [scanRecords, setScanRecords] = useState<ScanRecord[]>([])
  const [dispensingRecords, setDispensingRecords] = useState<DispensingRecord[]>([
    {
      id: "1",
      patientId: "PAT001",
      patientName: "Rajesh Kumar",
      drugName: "Paracetamol 500mg",
      batchId: "BATCH-1ldf2g-ABCDE",
      quantity: 30,
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
      location: "Rural Health Center - Rajasthan",
      blockchainTxId: "TX-DISPENSE-1234567894",
      distributorName: "Delhi Distribution Center",
      status: "received",
    },
    {
      id: "2",
      patientId: "PAT002",
      patientName: "Priya Sharma",
      drugName: "Amoxicillin 250mg",
      batchId: "BATCH-1ldf2h-XYZAB",
      quantity: 20,
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
      location: "AIIMS Delhi",
      blockchainTxId: "TX-DISPENSE-1234567895",
      distributorName: "Mumbai Distribution Hub",
      status: "sent",
    },
  ])
  const [isScanning, setIsScanning] = useState(false)
  const [isDispensing, setIsDispensing] = useState(false)
  const [scanData, setScanData] = useState({
    qrCode: "",
    location: "",
    role: "",
    actionType: "received" as "received" | "sent",
  })
  const [dispensingData, setDispensingData] = useState({
    drugName: "",
    batchId: "",
    quantity: 0,
    location: "",
    patientName: "",
    distributorName: "",
  })

  // Sample QR codes for demo
  const sampleQRCodes = [
    "QR-eyJiYXRjaElkIjoiQkFUQ0gtMWxkZjJnLUFCQ0RFIiwiZHJ1Z05hbWUiOiJQYXJhY2V0YW1vbCA1MDBtZyIsIm1hbnVmYWN0dXJlciI6IlN1biBQaGFybWEifQ==",
    "QR-eyJiYXRjaElkIjoiQkFUQ0gtMWxkZjJoLVhZWkFCIiwiZHJ1Z05hbWUiOiJBbW94aWNpbGxpbiAyNTBtZyIsIm1hbnVmYWN0dXJlciI6IkNpcGxhIEx0ZCJ9",
    "QR-eyJiYXRjaElkIjoiQkFUQ0gtMWxkZjJpLUVGR0hJIiwiZHJ1Z05hbWUiOiJNZXRmb3JtaW4gNTAwbWciLCJtYW51ZmFjdHVyZXIiOiJEci4gUmVkZHkncyJ9",
  ]

  const decodeQRCode = (qrCode: string) => {
    try {
      const base64Data = qrCode.replace("QR-", "")
      const decoded = JSON.parse(atob(base64Data))
      return decoded
    } catch (error) {
      return null
    }
  }

  const simulateBlockchainVerification = async (qrCode: string) => {
    await new Promise((resolve) => setTimeout(resolve, 1500))
    return `TX-SCAN-${Date.now()}-${Math.random().toString(36).substr(2, 8)}`
  }

  const logAuditEvent = async (eventData: any) => {
    console.log("Audit Event:", eventData)
    await storeInHyperledger(eventData)
  }

  const storeInHyperledger = async (data: any) => {
    await new Promise((resolve) => setTimeout(resolve, 500))
    console.log("Stored in Hyperledger:", data)
  }

  const handleScan = async () => {
    if (!scanData.qrCode || !scanData.location || !scanData.role) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields",
        variant: "destructive",
      })
      return
    }

    setIsScanning(true)

    try {
      const decodedData = decodeQRCode(scanData.qrCode)

      if (!decodedData) {
        toast({
          title: "Invalid QR Code",
          description: "The QR code could not be verified",
          variant: "destructive",
        })
        return
      }

      const blockchainTxId = await simulateBlockchainVerification(scanData.qrCode)

      // Calculate progressive timestamp
      const baseDate = new Date("2024-01-01")
      const dayOffset = scanRecords.length + 1
      const progressiveTimestamp = new Date(baseDate.getTime() + dayOffset * 24 * 60 * 60 * 1000).toISOString()

      const newScanRecord: ScanRecord = {
        id: Date.now().toString(),
        qrCode: scanData.qrCode,
        batchId: decodedData.batchId,
        drugName: decodedData.drugName,
        scanLocation: scanData.location,
        scannerRole: scanData.role,
        timestamp: progressiveTimestamp,
        blockchainTxId,
        status: "verified",
        actionType: scanData.actionType,
      }

      setScanRecords((prev) => [newScanRecord, ...prev])

      // Determine audit status
      let auditStatus = "success"
      if (scanData.actionType === "received") {
        auditStatus = "pending" // Received but not yet sent
      }

      await logAuditEvent({
        action: `Drug Batch ${scanData.actionType === "received" ? "Received" : "Sent"}`,
        actor: scanData.location,
        role: scanData.role,
        location: scanData.location,
        batchId: decodedData.batchId,
        drugName: decodedData.drugName,
        blockchainTxId,
        status: auditStatus,
        timestamp: progressiveTimestamp,
      })

      toast({
        title: `QR Code ${scanData.actionType === "received" ? "Received" : "Sent"} Successfully`,
        description: `${decodedData.drugName} ${scanData.actionType} at ${scanData.location}`,
      })

      setScanData({
        qrCode: "",
        location: "",
        role: "",
        actionType: "received",
      })
    } catch (error) {
      toast({
        title: "Scan Failed",
        description: "Please try again",
        variant: "destructive",
      })
    } finally {
      setIsScanning(false)
    }
  }

  const handleDispense = async () => {
    if (
      !dispensingData.drugName ||
      !dispensingData.batchId ||
      dispensingData.quantity <= 0 ||
      !dispensingData.location ||
      !dispensingData.patientName ||
      !dispensingData.distributorName
    ) {
      toast({
        title: "Missing Information",
        description: "Please fill in all dispensing details",
        variant: "destructive",
      })
      return
    }

    setIsDispensing(true)

    try {
      await new Promise((resolve) => setTimeout(resolve, 1500))

      const blockchainTxId = `TX-DISPENSE-${Date.now()}-${Math.random().toString(36).substr(2, 8)}`

      // Calculate progressive timestamp
      const baseDate = new Date("2024-01-01")
      const dayOffset = dispensingRecords.length + 3
      const progressiveTimestamp = new Date(baseDate.getTime() + dayOffset * 24 * 60 * 60 * 1000).toISOString()

      const newDispensingRecord: DispensingRecord = {
        id: Date.now().toString(),
        patientId: `PAT${Date.now().toString().slice(-3)}`,
        patientName: dispensingData.patientName,
        drugName: dispensingData.drugName,
        batchId: dispensingData.batchId,
        quantity: dispensingData.quantity,
        timestamp: progressiveTimestamp,
        location: dispensingData.location,
        blockchainTxId,
        distributorName: dispensingData.distributorName,
        status: "sent", // Initially sent, waiting for hospital confirmation
      }

      setDispensingRecords((prev) => [newDispensingRecord, ...prev])

      await logAuditEvent({
        action: "Drug Dispensed to Hospital",
        actor: dispensingData.distributorName,
        role: "Distributor",
        location: dispensingData.location,
        batchId: dispensingData.batchId,
        drugName: dispensingData.drugName,
        blockchainTxId,
        status: "waiting", // Sent but not received
        timestamp: progressiveTimestamp,
      })

      toast({
        title: "Drug Dispensed Successfully",
        description: `${dispensingData.quantity} units of ${dispensingData.drugName} sent to ${dispensingData.location}`,
      })

      setDispensingData({
        drugName: "",
        batchId: "",
        quantity: 0,
        location: "",
        patientName: "",
        distributorName: "",
      })
    } catch (error) {
      toast({
        title: "Dispensing Failed",
        description: "Please try again",
        variant: "destructive",
      })
    } finally {
      setIsDispensing(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "received":
        return <Badge className="bg-green-500">Received</Badge>
      case "sent":
        return <Badge className="bg-blue-500">Sent</Badge>
      case "pending":
        return <Badge className="bg-yellow-500">Pending</Badge>
      default:
        return <Badge variant="secondary">Unknown</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Scan className="h-5 w-5" />
            Distributor/Hospital QR Scanner
          </CardTitle>
          <CardDescription>Scan QR codes to track drug movement through the supply chain</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="qrCode">QR Code Data</Label>
              <Select
                value={scanData.qrCode}
                onValueChange={(value) => setScanData((prev) => ({ ...prev, qrCode: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select QR code to scan" />
                </SelectTrigger>
                <SelectContent>
                  {sampleQRCodes.map((qr, index) => {
                    const decoded = decodeQRCode(qr)
                    return (
                      <SelectItem key={index} value={qr}>
                        {decoded ? `${decoded.drugName} - ${decoded.batchId}` : `Sample QR ${index + 1}`}
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Current Location</Label>
              <Select
                value={scanData.location}
                onValueChange={(value) => setScanData((prev) => ({ ...prev, location: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Delhi Distribution Center">Delhi Distribution Center</SelectItem>
                  <SelectItem value="Mumbai Warehouse">Mumbai Warehouse</SelectItem>
                  <SelectItem value="AIIMS Delhi">AIIMS Delhi</SelectItem>
                  <SelectItem value="Apollo Hospital Chennai">Apollo Hospital Chennai</SelectItem>
                  <SelectItem value="Rural Health Center - Rajasthan">Rural Health Center - Rajasthan</SelectItem>
                  <SelectItem value="Primary Health Center - Bihar">Primary Health Center - Bihar</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Scanner Role</Label>
              <Select
                value={scanData.role}
                onValueChange={(value) => setScanData((prev) => ({ ...prev, role: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Distributor">Distributor</SelectItem>
                  <SelectItem value="Hospital Staff">Hospital Staff</SelectItem>
                  <SelectItem value="Pharmacy">Pharmacy</SelectItem>
                  <SelectItem value="Rural Health Worker">Rural Health Worker</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="actionType">Action Type</Label>
              <Select
                value={scanData.actionType}
                onValueChange={(value: "received" | "sent") => setScanData((prev) => ({ ...prev, actionType: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="received">Received</SelectItem>
                  <SelectItem value="sent">Sent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button onClick={handleScan} disabled={isScanning} className="w-full">
            {isScanning ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Verifying on Blockchain...
              </>
            ) : (
              <>
                <QrCode className="h-4 w-4 mr-2" />
                Record {scanData.actionType === "received" ? "Receipt" : "Dispatch"}
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Drug Dispensing */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Drug Dispensing to Pharmacies/Hospitals
          </CardTitle>
          <CardDescription>Record drug dispensing from distributor to healthcare facilities</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Drug Name</Label>
              <Select
                value={dispensingData.drugName}
                onValueChange={(value) => setDispensingData((prev) => ({ ...prev, drugName: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select drug" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Paracetamol 500mg">Paracetamol 500mg</SelectItem>
                  <SelectItem value="Amoxicillin 250mg">Amoxicillin 250mg</SelectItem>
                  <SelectItem value="Metformin 500mg">Metformin 500mg</SelectItem>
                  <SelectItem value="Aspirin 75mg">Aspirin 75mg</SelectItem>
                  <SelectItem value="Omeprazole 20mg">Omeprazole 20mg</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Batch ID</Label>
              <Select
                value={dispensingData.batchId}
                onValueChange={(value) => setDispensingData((prev) => ({ ...prev, batchId: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select batch" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BATCH-1ldf2g-ABCDE">BATCH-1ldf2g-ABCDE</SelectItem>
                  <SelectItem value="BATCH-1ldf2h-XYZAB">BATCH-1ldf2h-XYZAB</SelectItem>
                  <SelectItem value="BATCH-1ldf2i-EFGHI">BATCH-1ldf2i-EFGHI</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Quantity</Label>
              <Input
                type="number"
                value={dispensingData.quantity}
                onChange={(e) =>
                  setDispensingData((prev) => ({ ...prev, quantity: Number.parseInt(e.target.value) || 0 }))
                }
                placeholder="Enter quantity"
              />
            </div>

            <div className="space-y-2">
              <Label>Dispensing Location</Label>
              <Select
                value={dispensingData.location}
                onValueChange={(value) => setDispensingData((prev) => ({ ...prev, location: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="AIIMS Delhi">AIIMS Delhi</SelectItem>
                  <SelectItem value="Apollo Hospital Chennai">Apollo Hospital Chennai</SelectItem>
                  <SelectItem value="Rural Health Center - Rajasthan">Rural Health Center - Rajasthan</SelectItem>
                  <SelectItem value="Primary Health Center - Bihar">Primary Health Center - Bihar</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Patient/Facility Name</Label>
              <Input
                value={dispensingData.patientName}
                onChange={(e) => setDispensingData((prev) => ({ ...prev, patientName: e.target.value }))}
                placeholder="Enter patient or facility name"
              />
            </div>

            <div className="space-y-2">
              <Label>Distributor Name</Label>
              <Select
                value={dispensingData.distributorName}
                onValueChange={(value) => setDispensingData((prev) => ({ ...prev, distributorName: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select distributor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Delhi Distribution Center">Delhi Distribution Center</SelectItem>
                  <SelectItem value="Mumbai Distribution Hub">Mumbai Distribution Hub</SelectItem>
                  <SelectItem value="Chennai Regional Distributor">Chennai Regional Distributor</SelectItem>
                  <SelectItem value="Kolkata Distribution Network">Kolkata Distribution Network</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button onClick={handleDispense} disabled={isDispensing} className="w-full">
            {isDispensing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Recording on Blockchain...
              </>
            ) : (
              <>
                <Package className="h-4 w-4 mr-2" />
                Record Drug Dispensing
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Scan History */}
      {scanRecords.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Scan History</CardTitle>
            <CardDescription>Recent QR code scans and blockchain transactions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {scanRecords.map((record) => (
                <div key={record.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">{record.drugName}</h3>
                      <p className="text-sm text-gray-600">Batch: {record.batchId}</p>
                    </div>
                    <div className="flex gap-2">
                      <Badge variant="default" className="bg-green-500">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Verified
                      </Badge>
                      <Badge variant={record.actionType === "received" ? "default" : "secondary"}>
                        {record.actionType === "received" ? (
                          <Download className="h-3 w-3 mr-1" />
                        ) : (
                          <Send className="h-3 w-3 mr-1" />
                        )}
                        {record.actionType === "received" ? "Received" : "Sent"}
                      </Badge>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-gray-500" />
                      <div>
                        <span className="font-medium">Location:</span>
                        <p>{record.scanLocation}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gray-500" />
                      <div>
                        <span className="font-medium">Timestamp:</span>
                        <p>{new Date(record.timestamp).toLocaleString()}</p>
                      </div>
                    </div>
                    <div>
                      <span className="font-medium">Role:</span>
                      <p>{record.scannerRole}</p>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-3 rounded">
                    <div className="text-xs space-y-1">
                      <p>
                        <span className="font-medium">Blockchain TX:</span> {record.blockchainTxId}
                      </p>
                      <p>
                        <span className="font-medium">QR Code:</span> {record.qrCode.substring(0, 50)}...
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Dispensing History */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Dispensing History</CardTitle>
              <CardDescription>
                Recent drug dispensing records from distributors to healthcare facilities
              </CardDescription>
            </div>
            <DownloadButtons
              data={dispensingRecords}
              filename="drug-dispensing-records"
              title="Drug Dispensing Records"
              type="dispensary"
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {dispensingRecords.map((record) => (
              <div key={record.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">{record.drugName}</h3>
                    <p className="text-sm text-gray-600">Patient/Facility: {record.patientName}</p>
                  </div>
                  {getStatusBadge(record.status)}
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Quantity:</span>
                    <p>{record.quantity} units</p>
                  </div>
                  <div>
                    <span className="font-medium">Batch ID:</span>
                    <p>{record.batchId}</p>
                  </div>
                  <div>
                    <span className="font-medium">Location:</span>
                    <p>{record.location}</p>
                  </div>
                  <div>
                    <span className="font-medium">Date:</span>
                    <p>{new Date(record.timestamp).toLocaleDateString()}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Distributor:</span>
                    <p>{record.distributorName}</p>
                  </div>
                  <div>
                    <span className="font-medium">Patient ID:</span>
                    <p>{record.patientId}</p>
                  </div>
                </div>

                <div className="bg-gray-50 p-3 rounded">
                  <div className="text-xs space-y-1">
                    <p>
                      <span className="font-medium">Blockchain TX:</span> {record.blockchainTxId}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
