"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Hospital, Package, CheckCircle, Clock, Download, Send } from 'lucide-react'
import { useToast } from "@/hooks/use-toast"
import { DownloadButtons } from "@/components/download-utils"

interface ReceivedShipment {
  id: string
  batchId: string
  drugName: string
  quantity: number
  fromDistributor: string
  receivedDate: string
  receivedBy: string
  blockchainTxId: string
  status: "received" | "verified" | "stocked"
}

interface DispensedRecord {
  id: string
  patientId: string
  patientName: string
  drugName: string
  batchId: string
  quantity: number
  dispensedDate: string
  dispensedBy: string
  blockchainTxId: string
  status: "dispensed"
}

export default function HospitalInterface() {
  const { toast } = useToast()
  const [receivedShipments, setReceivedShipments] = useState<ReceivedShipment[]>([
    {
      id: "1",
      batchId: "BATCH-1ldf2g-ABCDE",
      drugName: "Paracetamol 500mg",
      quantity: 500,
      fromDistributor: "Delhi Distribution Center",
      receivedDate: new Date("2024-01-05T10:30:00Z").toISOString(),
      receivedBy: "Dr. Sharma - Pharmacy Head",
      blockchainTxId: "TX-RECEIVED-1234567890",
      status: "stocked",
    },
    {
      id: "2",
      batchId: "BATCH-1ldf2h-XYZAB",
      drugName: "Amoxicillin 250mg",
      quantity: 300,
      fromDistributor: "Mumbai Distribution Hub",
      receivedDate: new Date("2024-01-06T14:15:00Z").toISOString(),
      receivedBy: "Nurse Priya - Inventory Manager",
      blockchainTxId: "TX-RECEIVED-1234567891",
      status: "verified",
    },
  ])

  const [dispensedRecords, setDispensedRecords] = useState<DispensedRecord[]>([
    {
      id: "1",
      patientId: "PAT001",
      patientName: "Rajesh Kumar",
      drugName: "Paracetamol 500mg",
      batchId: "BATCH-1ldf2g-ABCDE",
      quantity: 30,
      dispensedDate: new Date("2024-01-07T09:45:00Z").toISOString(),
      dispensedBy: "Pharmacist Amit",
      blockchainTxId: "TX-DISPENSED-1234567892",
      status: "dispensed",
    },
  ])

  const [newReceipt, setNewReceipt] = useState({
    batchId: "",
    drugName: "",
    quantity: 0,
    fromDistributor: "",
    receivedBy: "",
  })

  const [newDispensing, setNewDispensing] = useState({
    patientName: "",
    drugName: "",
    batchId: "",
    quantity: 0,
    dispensedBy: "",
  })

  const [isProcessing, setIsProcessing] = useState(false)

  const logAuditEvent = async (eventData: any) => {
    console.log("Hospital Audit Event:", eventData)
    await new Promise((resolve) => setTimeout(resolve, 500))
  }

  const handleReceiveShipment = async () => {
    if (!newReceipt.batchId || !newReceipt.drugName || newReceipt.quantity <= 0 || !newReceipt.fromDistributor) {
      toast({
        title: "Missing Information",
        description: "Please fill in all receipt details",
        variant: "destructive",
      })
      return
    }

    setIsProcessing(true)

    try {
      await new Promise((resolve) => setTimeout(resolve, 1500))

      const blockchainTxId = `TX-RECEIVED-${Date.now()}-${Math.random().toString(36).substr(2, 8)}`
      const receivedDate = new Date().toISOString()

      const newShipment: ReceivedShipment = {
        id: Date.now().toString(),
        batchId: newReceipt.batchId,
        drugName: newReceipt.drugName,
        quantity: newReceipt.quantity,
        fromDistributor: newReceipt.fromDistributor,
        receivedDate,
        receivedBy: newReceipt.receivedBy,
        blockchainTxId,
        status: "received",
      }

      setReceivedShipments((prev) => [newShipment, ...prev])

      await logAuditEvent({
        action: "Drug Shipment Received",
        actor: newReceipt.receivedBy,
        role: "Hospital Staff",
        location: "Hospital Pharmacy",
        batchId: newReceipt.batchId,
        drugName: newReceipt.drugName,
        blockchainTxId,
        status: "success",
        timestamp: receivedDate,
        details: `Received ${newReceipt.quantity} units from ${newReceipt.fromDistributor}`,
      })

      toast({
        title: "Shipment Received Successfully",
        description: `${newReceipt.quantity} units of ${newReceipt.drugName} received from ${newReceipt.fromDistributor}`,
      })

      setNewReceipt({
        batchId: "",
        drugName: "",
        quantity: 0,
        fromDistributor: "",
        receivedBy: "",
      })
    } catch (error) {
      toast({
        title: "Receipt Failed",
        description: "Please try again",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleDispenseToPatient = async () => {
    if (
      !newDispensing.patientName ||
      !newDispensing.drugName ||
      !newDispensing.batchId ||
      newDispensing.quantity <= 0
    ) {
      toast({
        title: "Missing Information",
        description: "Please fill in all dispensing details",
        variant: "destructive",
      })
      return
    }

    setIsProcessing(true)

    try {
      await new Promise((resolve) => setTimeout(resolve, 1500))

      const blockchainTxId = `TX-DISPENSED-${Date.now()}-${Math.random().toString(36).substr(2, 8)}`
      const dispensedDate = new Date().toISOString()

      const newRecord: DispensedRecord = {
        id: Date.now().toString(),
        patientId: `PAT${Date.now().toString().slice(-3)}`,
        patientName: newDispensing.patientName,
        drugName: newDispensing.drugName,
        batchId: newDispensing.batchId,
        quantity: newDispensing.quantity,
        dispensedDate,
        dispensedBy: newDispensing.dispensedBy,
        blockchainTxId,
        status: "dispensed",
      }

      setDispensedRecords((prev) => [newRecord, ...prev])

      await logAuditEvent({
        action: "Drug Dispensed to Patient",
        actor: newDispensing.dispensedBy,
        role: "Pharmacist",
        location: "Hospital Pharmacy",
        batchId: newDispensing.batchId,
        drugName: newDispensing.drugName,
        blockchainTxId,
        status: "success",
        timestamp: dispensedDate,
        details: `Dispensed ${newDispensing.quantity} units to patient ${newDispensing.patientName}`,
      })

      toast({
        title: "Drug Dispensed Successfully",
        description: `${newDispensing.quantity} units of ${newDispensing.drugName} dispensed to ${newDispensing.patientName}`,
      })

      setNewDispensing({
        patientName: "",
        drugName: "",
        batchId: "",
        quantity: 0,
        dispensedBy: "",
      })
    } catch (error) {
      toast({
        title: "Dispensing Failed",
        description: "Please try again",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "received":
        return <Badge className="bg-blue-500">Received</Badge>
      case "verified":
        return <Badge className="bg-yellow-500">Verified</Badge>
      case "stocked":
        return <Badge className="bg-green-500">Stocked</Badge>
      case "dispensed":
        return <Badge className="bg-purple-500">Dispensed</Badge>
      default:
        return <Badge variant="secondary">Unknown</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-r from-blue-50 to-green-50 border-[#007CC3] shadow-lg hover:shadow-xl transition-all duration-300">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-[#007CC3]">
            <Hospital className="h-5 w-5" />
            Hospital/Pharmacy Interface
          </CardTitle>
          <CardDescription>Manage drug receipts and patient dispensing</CardDescription>
        </CardHeader>
      </Card>

      <Tabs defaultValue="receive" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3 bg-[#007CC3]/10">
          <TabsTrigger value="receive" className="data-[state=active]:bg-[#007CC3] data-[state=active]:text-white">
            Receive Shipments
          </TabsTrigger>
          <TabsTrigger value="dispense" className="data-[state=active]:bg-[#007CC3] data-[state=active]:text-white">
            Dispense to Patients
          </TabsTrigger>
          <TabsTrigger value="records" className="data-[state=active]:bg-[#007CC3] data-[state=active]:text-white">
            Records
          </TabsTrigger>
        </TabsList>

        <TabsContent value="receive" className="space-y-4">
          <Card className="hover:shadow-lg transition-shadow duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="h-5 w-5 text-[#007CC3]" />
                Receive Drug Shipment
              </CardTitle>
              <CardDescription>Record receipt of drugs from distributors</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Batch ID</Label>
                  <Select
                    value={newReceipt.batchId}
                    onValueChange={(value) => setNewReceipt((prev) => ({ ...prev, batchId: value }))}
                  >
                    <SelectTrigger className="border-[#007CC3]/30 focus:border-[#007CC3]">
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
                  <Label>Drug Name</Label>
                  <Select
                    value={newReceipt.drugName}
                    onValueChange={(value) => setNewReceipt((prev) => ({ ...prev, drugName: value }))}
                  >
                    <SelectTrigger className="border-[#007CC3]/30 focus:border-[#007CC3]">
                      <SelectValue placeholder="Select drug" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Paracetamol 500mg">Paracetamol 500mg</SelectItem>
                      <SelectItem value="Amoxicillin 250mg">Amoxicillin 250mg</SelectItem>
                      <SelectItem value="Metformin 500mg">Metformin 500mg</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Quantity Received</Label>
                  <Input
                    type="number"
                    value={newReceipt.quantity}
                    onChange={(e) =>
                      setNewReceipt((prev) => ({ ...prev, quantity: Number.parseInt(e.target.value) || 0 }))
                    }
                    placeholder="Enter quantity"
                    className="border-[#007CC3]/30 focus:border-[#007CC3]"
                  />
                </div>

                <div className="space-y-2">
                  <Label>From Distributor</Label>
                  <Select
                    value={newReceipt.fromDistributor}
                    onValueChange={(value) => setNewReceipt((prev) => ({ ...prev, fromDistributor: value }))}
                  >
                    <SelectTrigger className="border-[#007CC3]/30 focus:border-[#007CC3]">
                      <SelectValue placeholder="Select distributor" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Delhi Distribution Center">Delhi Distribution Center</SelectItem>
                      <SelectItem value="Mumbai Distribution Hub">Mumbai Distribution Hub</SelectItem>
                      <SelectItem value="Chennai Regional Distributor">Chennai Regional Distributor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label>Received By</Label>
                  <Input
                    value={newReceipt.receivedBy}
                    onChange={(e) => setNewReceipt((prev) => ({ ...prev, receivedBy: e.target.value }))}
                    placeholder="Enter staff name and designation"
                    className="border-[#007CC3]/30 focus:border-[#007CC3]"
                  />
                </div>
              </div>

              <Button
                onClick={handleReceiveShipment}
                disabled={isProcessing}
                className="w-full bg-[#007CC3] hover:bg-[#3781C2] transition-colors duration-300"
              >
                {isProcessing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Recording Receipt...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    Record Shipment Receipt
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="dispense" className="space-y-4">
          <Card className="hover:shadow-lg transition-shadow duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Send className="h-5 w-5 text-[#007CC3]" />
                Dispense to Patient
              </CardTitle>
              <CardDescription>Record drug dispensing to verified patients</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Patient Name</Label>
                  <Input
                    value={newDispensing.patientName}
                    onChange={(e) => setNewDispensing((prev) => ({ ...prev, patientName: e.target.value }))}
                    placeholder="Enter patient name"
                    className="border-[#007CC3]/30 focus:border-[#007CC3]"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Drug Name</Label>
                  <Select
                    value={newDispensing.drugName}
                    onValueChange={(value) => setNewDispensing((prev) => ({ ...prev, drugName: value }))}
                  >
                    <SelectTrigger className="border-[#007CC3]/30 focus:border-[#007CC3]">
                      <SelectValue placeholder="Select drug" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Paracetamol 500mg">Paracetamol 500mg</SelectItem>
                      <SelectItem value="Amoxicillin 250mg">Amoxicillin 250mg</SelectItem>
                      <SelectItem value="Metformin 500mg">Metformin 500mg</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Batch ID</Label>
                  <Select
                    value={newDispensing.batchId}
                    onValueChange={(value) => setNewDispensing((prev) => ({ ...prev, batchId: value }))}
                  >
                    <SelectTrigger className="border-[#007CC3]/30 focus:border-[#007CC3]">
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
                    value={newDispensing.quantity}
                    onChange={(e) =>
                      setNewDispensing((prev) => ({ ...prev, quantity: Number.parseInt(e.target.value) || 0 }))
                    }
                    placeholder="Enter quantity"
                    className="border-[#007CC3]/30 focus:border-[#007CC3]"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label>Dispensed By</Label>
                  <Input
                    value={newDispensing.dispensedBy}
                    onChange={(e) => setNewDispensing((prev) => ({ ...prev, dispensedBy: e.target.value }))}
                    placeholder="Enter pharmacist name"
                    className="border-[#007CC3]/30 focus:border-[#007CC3]"
                  />
                </div>
              </div>

              <Button
                onClick={handleDispenseToPatient}
                disabled={isProcessing}
                className="w-full bg-[#007CC3] hover:bg-[#3781C2] transition-colors duration-300"
              >
                {isProcessing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Recording Dispensing...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Record Patient Dispensing
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="records" className="space-y-4">
          {/* Received Shipments */}
          <Card className="hover:shadow-lg transition-shadow duration-300">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Received Shipments</CardTitle>
                  <CardDescription>Drugs received from distributors</CardDescription>
                </div>
                <DownloadButtons
                  data={receivedShipments}
                  filename="received-shipments"
                  title="Received Shipments"
                  type="dispensary"
                />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {receivedShipments.map((shipment) => (
                  <div key={shipment.id} className="border rounded-lg p-4 space-y-3 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold">{shipment.drugName}</h3>
                        <p className="text-sm text-gray-600">From: {shipment.fromDistributor}</p>
                      </div>
                      {getStatusBadge(shipment.status)}
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Quantity:</span>
                        <p>{shipment.quantity} units</p>
                      </div>
                      <div>
                        <span className="font-medium">Batch ID:</span>
                        <p>{shipment.batchId}</p>
                      </div>
                      <div>
                        <span className="font-medium">Received By:</span>
                        <p>{shipment.receivedBy}</p>
                      </div>
                      <div>
                        <span className="font-medium">Date:</span>
                        <p>{new Date(shipment.receivedDate).toLocaleDateString()}</p>
                      </div>
                    </div>

                    <div className="bg-gray-50 p-3 rounded">
                      <div className="text-xs">
                        <span className="font-medium">Blockchain TX:</span> {shipment.blockchainTxId}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Dispensed Records */}
          <Card className="hover:shadow-lg transition-shadow duration-300">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Patient Dispensing Records</CardTitle>
                  <CardDescription>Drugs dispensed to patients</CardDescription>
                </div>
                <DownloadButtons
                  data={dispensedRecords}
                  filename="patient-dispensing"
                  title="Patient Dispensing Records"
                  type="dispensary"
                />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dispensedRecords.map((record) => (
                  <div key={record.id} className="border rounded-lg p-4 space-y-3 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold">{record.drugName}</h3>
                        <p className="text-sm text-gray-600">Patient: {record.patientName}</p>
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
                        <span className="font-medium">Dispensed By:</span>
                        <p>{record.dispensedBy}</p>
                      </div>
                      <div>
                        <span className="font-medium">Date:</span>
                        <p>{new Date(record.dispensedDate).toLocaleDateString()}</p>
                      </div>
                    </div>

                    <div className="bg-gray-50 p-3 rounded">
                      <div className="text-xs">
                        <span className="font-medium">Blockchain TX:</span> {record.blockchainTxId}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
