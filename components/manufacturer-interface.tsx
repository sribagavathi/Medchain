"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { QrCode, Package, CheckCircle, AlertCircle, Send } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import QRCode from "@/components/qr-code"

interface DrugBatch {
  id: string
  name: string
  batchId: string
  manufacturer: string
  manufactureDate: string
  expiryDate: string
  quantity: number
  origin: string
  description: string
  qrCode: string
  qrCodeImage: string
  blockchainTxId: string
  status: "created" | "processing" | "completed" | "dispatched"
  dispatchDate?: string
  dispatchLocation?: string
  dispatchTxId?: string
}

// Manufacturer to Origin Location Mapping
const manufacturerLocationMap: { [key: string]: string[] } = {
  "Dr. Reddy's": ["Mumbai", "Chennai"],
  "Sun Pharma": ["Hyderabad", "Ahmedabad"],
  "Cipla Ltd": ["Goa", "Bangalore"],
  "Lupin Ltd": ["Pune", "Aurangabad"],
  "Aurobindo Pharma": ["Hyderabad", "Vizag"],
}

export default function ManufacturerInterface() {
  const { toast } = useToast()
  const [batches, setBatches] = useState<DrugBatch[]>([])
  const [isCreating, setIsCreating] = useState(false)
  const [isDispatching, setIsDispatching] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    batchId: "",
    manufacturer: "",
    manufactureDate: "",
    expiryDate: "",
    quantity: "",
    origin: "",
    description: "",
  })
  const [dispatchData, setDispatchData] = useState({
    batchId: "",
    dispatchLocation: "",
  })

  const generateBatchId = () => {
    const timestamp = Date.now().toString(36)
    const random = Math.random().toString(36).substr(2, 5)
    return `BATCH-${timestamp}-${random}`.toUpperCase()
  }

  const generateQRCode = (batchData: any) => {
    const qrData = {
      batchId: batchData.batchId,
      drugName: batchData.name,
      manufacturer: batchData.manufacturer,
      timestamp: new Date().toISOString(),
    }
    return `QR-${btoa(JSON.stringify(qrData))}`
  }

  const simulateBlockchainTransaction = async (batchData: any) => {
    await new Promise((resolve) => setTimeout(resolve, 2000))
    return `TX-${Date.now()}-${Math.random().toString(36).substr(2, 8)}`
  }

  const validateDates = (manufactureDate: string, expiryDate: string) => {
    if (!manufactureDate || !expiryDate) return true

    const mfgDate = new Date(manufactureDate)
    const expDate = new Date(expiryDate)

    return expDate > mfgDate
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (
      !formData.name ||
      !formData.manufacturer ||
      !formData.manufactureDate ||
      !formData.expiryDate ||
      !formData.quantity ||
      !formData.origin
    ) {
      toast({
        title: "Missing Required Fields",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    if (!validateDates(formData.manufactureDate, formData.expiryDate)) {
      toast({
        title: "Invalid Expiry Date",
        description: "Expiry date cannot be before manufacture date",
        variant: "destructive",
      })
      return
    }

    setIsCreating(true)

    try {
      const batchId = formData.batchId || generateBatchId()
      const qrCode = generateQRCode({ ...formData, batchId })

      const newBatch: DrugBatch = {
        id: Date.now().toString(),
        ...formData,
        batchId,
        quantity: Number.parseInt(formData.quantity),
        qrCode,
        qrCodeImage: "",
        blockchainTxId: "",
        status: "processing",
      }

      setBatches((prev) => [...prev, newBatch])

      const txId = await simulateBlockchainTransaction(newBatch)

      setBatches((prev) =>
        prev.map((batch) =>
          batch.id === newBatch.id ? { ...batch, blockchainTxId: txId, status: "completed" } : batch,
        ),
      )

      // Log to audit system
      await logAuditEvent({
        action: "Drug Batch Created",
        actor: formData.manufacturer,
        role: "Manufacturer",
        location: formData.origin,
        batchId,
        drugName: formData.name,
        blockchainTxId: txId,
        status: "success",
        timestamp: new Date(formData.manufactureDate).toISOString(),
      })

      toast({
        title: "Drug Batch Created Successfully",
        description: `Batch ${batchId} has been registered on the blockchain`,
      })

      setFormData({
        name: "",
        batchId: "",
        manufacturer: "",
        manufactureDate: "",
        expiryDate: "",
        quantity: "",
        origin: "",
        description: "",
      })
    } catch (error) {
      toast({
        title: "Error Creating Batch",
        description: "Please try again",
        variant: "destructive",
      })
    } finally {
      setIsCreating(false)
    }
  }

  const handleDispatch = async () => {
    if (!dispatchData.batchId || !dispatchData.dispatchLocation) {
      toast({
        title: "Missing Information",
        description: "Please select batch and dispatch location",
        variant: "destructive",
      })
      return
    }

    setIsDispatching(true)

    try {
      await new Promise((resolve) => setTimeout(resolve, 1500))

      const dispatchTxId = await simulateBlockchainTransaction({ action: "dispatch" })
      const batch = batches.find((b) => b.batchId === dispatchData.batchId)

      if (batch) {
        const dispatchDate = new Date(new Date(batch.manufactureDate).getTime() + 24 * 60 * 60 * 1000).toISOString()

        setBatches((prev) =>
          prev.map((batch) =>
            batch.batchId === dispatchData.batchId
              ? {
                  ...batch,
                  status: "dispatched",
                  dispatchDate,
                  dispatchLocation: dispatchData.dispatchLocation,
                  dispatchTxId,
                }
              : batch,
          ),
        )

        // Log dispatch event
        await logAuditEvent({
          action: "Drug Batch Dispatched",
          actor: batch.manufacturer,
          role: "Manufacturer",
          location: dispatchData.dispatchLocation,
          batchId: dispatchData.batchId,
          drugName: batch.name,
          blockchainTxId: dispatchTxId,
          status: "success",
          timestamp: dispatchDate,
        })

        toast({
          title: "Batch Dispatched Successfully",
          description: `Batch ${dispatchData.batchId} dispatched to ${dispatchData.dispatchLocation}`,
        })

        setDispatchData({ batchId: "", dispatchLocation: "" })
      }
    } catch (error) {
      toast({
        title: "Dispatch Failed",
        description: "Please try again",
        variant: "destructive",
      })
    } finally {
      setIsDispatching(false)
    }
  }

  const logAuditEvent = async (eventData: any) => {
    // This would normally send to your backend API
    console.log("Audit Event:", eventData)

    // Store in Hyperledger Fabric
    await storeInHyperledger(eventData)
  }

  const storeInHyperledger = async (data: any) => {
    // Simulate Hyperledger Fabric storage
    await new Promise((resolve) => setTimeout(resolve, 500))
    console.log("Stored in Hyperledger:", data)
  }

  const getAvailableOrigins = () => {
    if (!formData.manufacturer) return []
    return manufacturerLocationMap[formData.manufacturer] || []
  }

  const completedBatches = batches.filter((b) => b.status === "completed")

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Manufacturer Interface
          </CardTitle>
          <CardDescription>Create new drug batches and generate blockchain-secured QR codes</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Drug Name *</Label>
                <Select
                  value={formData.name}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, name: value }))}
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
                <Label htmlFor="batchId">Batch ID</Label>
                <div className="flex gap-2">
                  <Input
                    id="batchId"
                    value={formData.batchId}
                    onChange={(e) => setFormData((prev) => ({ ...prev, batchId: e.target.value }))}
                    placeholder="Auto-generated if empty"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setFormData((prev) => ({ ...prev, batchId: generateBatchId() }))}
                  >
                    Generate
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="manufacturer">Manufacturer *</Label>
                <Select
                  value={formData.manufacturer}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, manufacturer: value, origin: "" }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select manufacturer" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Dr. Reddy's">Dr. Reddy's</SelectItem>
                    <SelectItem value="Sun Pharma">Sun Pharma</SelectItem>
                    <SelectItem value="Cipla Ltd">Cipla Ltd</SelectItem>
                    <SelectItem value="Lupin Ltd">Lupin Ltd</SelectItem>
                    <SelectItem value="Aurobindo Pharma">Aurobindo Pharma</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="origin">Origin Location *</Label>
                <Select
                  value={formData.origin}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, origin: value }))}
                  disabled={!formData.manufacturer}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={formData.manufacturer ? "Select origin" : "Select manufacturer first"} />
                  </SelectTrigger>
                  <SelectContent>
                    {getAvailableOrigins().map((location) => (
                      <SelectItem key={location} value={location}>
                        {location}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="manufactureDate">Manufacture Date *</Label>
                <Input
                  id="manufactureDate"
                  type="date"
                  value={formData.manufactureDate}
                  onChange={(e) => setFormData((prev) => ({ ...prev, manufactureDate: e.target.value }))}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="expiryDate">Expiry Date *</Label>
                <Input
                  id="expiryDate"
                  type="date"
                  value={formData.expiryDate}
                  onChange={(e) => setFormData((prev) => ({ ...prev, expiryDate: e.target.value }))}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity (units) *</Label>
                <Input
                  id="quantity"
                  type="number"
                  value={formData.quantity}
                  onChange={(e) => setFormData((prev) => ({ ...prev, quantity: e.target.value }))}
                  placeholder="e.g., 1000"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="Additional batch information..."
                rows={3}
              />
            </div>

            <Button type="submit" disabled={isCreating} className="w-full">
              {isCreating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating Batch & Generating QR...
                </>
              ) : (
                <>
                  <QrCode className="h-4 w-4 mr-2" />
                  Create Batch & Generate QR Code
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Dispatch Section */}
      {completedBatches.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Send className="h-5 w-5" />
              Dispatch Batches
            </CardTitle>
            <CardDescription>Dispatch completed batches to distributors</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Select Batch to Dispatch</Label>
                <Select
                  value={dispatchData.batchId}
                  onValueChange={(value) => setDispatchData((prev) => ({ ...prev, batchId: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select batch" />
                  </SelectTrigger>
                  <SelectContent>
                    {completedBatches
                      .filter((b) => b.status === "completed")
                      .map((batch) => (
                        <SelectItem key={batch.id} value={batch.batchId}>
                          {batch.name} - {batch.batchId}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Dispatch Location</Label>
                <Select
                  value={dispatchData.dispatchLocation}
                  onValueChange={(value) => setDispatchData((prev) => ({ ...prev, dispatchLocation: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select destination" />
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

            <Button onClick={handleDispatch} disabled={isDispatching} className="w-full">
              {isDispatching ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Dispatching...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Dispatch Batch
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Created Batches */}
      {batches.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Created Batches</CardTitle>
            <CardDescription>Recently created drug batches with blockchain verification</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {batches.map((batch) => (
                <div key={batch.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">{batch.name}</h3>
                      <p className="text-sm text-gray-600">Batch ID: {batch.batchId}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {batch.status === "completed" ? (
                        <Badge variant="default" className="bg-green-500">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Ready to Dispatch
                        </Badge>
                      ) : batch.status === "dispatched" ? (
                        <Badge variant="default" className="bg-blue-500">
                          <Send className="h-3 w-3 mr-1" />
                          Dispatched
                        </Badge>
                      ) : (
                        <Badge variant="secondary">
                          <AlertCircle className="h-3 w-3 mr-1" />
                          Processing...
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Manufacturer:</span>
                      <p>{batch.manufacturer}</p>
                    </div>
                    <div>
                      <span className="font-medium">Quantity:</span>
                      <p>{batch.quantity} units</p>
                    </div>
                    <div>
                      <span className="font-medium">Origin:</span>
                      <p>{batch.origin}</p>
                    </div>
                    <div>
                      <span className="font-medium">Expiry:</span>
                      <p>{batch.expiryDate}</p>
                    </div>
                  </div>

                  {batch.status === "dispatched" && (
                    <div className="bg-blue-50 p-3 rounded">
                      <div className="text-sm space-y-1">
                        <p>
                          <span className="font-medium">Dispatched to:</span> {batch.dispatchLocation}
                        </p>
                        <p>
                          <span className="font-medium">Dispatch Date:</span>{" "}
                          {new Date(batch.dispatchDate!).toLocaleDateString()}
                        </p>
                        <p>
                          <span className="font-medium">Dispatch TX:</span> {batch.dispatchTxId}
                        </p>
                      </div>
                    </div>
                  )}

                  {(batch.status === "completed" || batch.status === "dispatched") && (
                    <div className="bg-gray-50 p-3 rounded">
                      <div className="flex items-start gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <QrCode className="h-4 w-4" />
                            <span className="font-medium">QR Code & Blockchain Details</span>
                          </div>
                          <div className="text-xs space-y-1">
                            <p>
                              <span className="font-medium">QR Data:</span> {batch.qrCode}
                            </p>
                            <p>
                              <span className="font-medium">Blockchain TX:</span> {batch.blockchainTxId}
                            </p>
                          </div>
                        </div>
                        <QRCode value={batch.qrCode} size={150} showDownload={true} />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
