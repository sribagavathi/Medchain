"use client"

import { Button } from "@/components/ui/button"
import { Download, FileText } from "lucide-react"
import jsPDF from "jspdf"

interface DownloadButtonsProps {
  data: any[]
  filename: string
  title: string
  type: "audit" | "health" | "tracking" | "dispensary"
}

export function DownloadButtons({ data, filename, title, type }: DownloadButtonsProps) {
  const downloadCSV = () => {
    let csvContent = ""

    if (type === "audit") {
      csvContent = "Timestamp,Action,Actor,Role,Location,Batch ID,Drug Name,Blockchain TX,Status\n"
      data.forEach((item: any) => {
        csvContent += `${item.timestamp || ""},${item.action || ""},${item.actor || ""},${item.role || ""},${item.location || ""},${item.batchId || ""},${item.drugName || ""},${item.blockchainTxId || ""},${item.status || ""}\n`
      })
    } else if (type === "health") {
      csvContent = "Name,Age,Aadhaar ID,Phone,Location,DOB,Health History,Medicines Purchased\n"
      csvContent += `${data.name || ""},${data.age || ""},${data.aadhaarId || ""},${data.phoneNumber || ""},${data.location || ""},${data.dob || ""},"${data.healthHistory?.join("; ") || ""}","${data.medicinesPurchased?.join("; ") || ""}"\n`
    } else if (type === "tracking") {
      csvContent = "Batch ID,Drug Name,Manufacturer,Current Location,Status,Path Details\n"
      csvContent += `${data.batchId || ""},${data.drugName || ""},${data.manufacturer || ""},${data.currentLocation || ""},${data.status || ""},"${data.path?.map((p: any) => `${p.location} - ${p.action}`).join("; ") || ""}"\n`
    } else if (type === "dispensary") {
      csvContent = "Patient Name,Drug Name,Quantity,Batch ID,Location,Date,Distributor,Blockchain TX\n"
      data.forEach((item: any) => {
        csvContent += `${item.patientName || ""},${item.drugName || ""},${item.quantity || ""},${item.batchId || ""},${item.location || ""},${item.timestamp || ""},${item.distributorName || ""},${item.blockchainTxId || ""}\n`
      })
    }

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${filename}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const downloadPDF = () => {
    const pdf = new jsPDF()

    // Add title
    pdf.setFontSize(16)
    pdf.text(title, 20, 20)

    let yPosition = 40

    if (type === "audit") {
      pdf.setFontSize(12)
      data.forEach((item: any, index: number) => {
        if (yPosition > 250) {
          pdf.addPage()
          yPosition = 20
        }

        pdf.text(`${index + 1}. ${item.action || "N/A"}`, 20, yPosition)
        yPosition += 10
        pdf.text(`   Actor: ${item.actor || "N/A"} | Role: ${item.role || "N/A"}`, 20, yPosition)
        yPosition += 10
        pdf.text(`   Location: ${item.location || "N/A"} | Status: ${item.status || "N/A"}`, 20, yPosition)
        yPosition += 10
        pdf.text(`   Blockchain TX: ${item.blockchainTxId || "N/A"}`, 20, yPosition)
        yPosition += 15
      })
    } else if (type === "health") {
      pdf.setFontSize(12)
      pdf.text(`Name: ${data.name || "N/A"}`, 20, yPosition)
      yPosition += 10
      pdf.text(`Age: ${data.age || "N/A"} | DOB: ${data.dob || "N/A"}`, 20, yPosition)
      yPosition += 10
      pdf.text(`Aadhaar ID: ${data.aadhaarId || "N/A"}`, 20, yPosition)
      yPosition += 10
      pdf.text(`Phone: ${data.phoneNumber || "N/A"}`, 20, yPosition)
      yPosition += 10
      pdf.text(`Location: ${data.location || "N/A"}`, 20, yPosition)
      yPosition += 20

      pdf.text("Health History:", 20, yPosition)
      yPosition += 10
      data.healthHistory?.forEach((history: string) => {
        pdf.text(`• ${history}`, 25, yPosition)
        yPosition += 8
      })

      yPosition += 10
      pdf.text("Medicine Purchase History:", 20, yPosition)
      yPosition += 10
      data.medicinesPurchased?.forEach((medicine: string) => {
        pdf.text(`• ${medicine}`, 25, yPosition)
        yPosition += 8
      })
    } else if (type === "tracking") {
      pdf.setFontSize(12)
      pdf.text(`Batch ID: ${data.batchId || "N/A"}`, 20, yPosition)
      yPosition += 10
      pdf.text(`Drug: ${data.drugName || "N/A"} | Manufacturer: ${data.manufacturer || "N/A"}`, 20, yPosition)
      yPosition += 10
      pdf.text(`Current Location: ${data.currentLocation || "N/A"}`, 20, yPosition)
      yPosition += 10
      pdf.text(`Status: ${data.status || "N/A"}`, 20, yPosition)
      yPosition += 20

      pdf.text("Supply Chain Journey:", 20, yPosition)
      yPosition += 10
      data.path?.forEach((step: any, index: number) => {
        if (yPosition > 250) {
          pdf.addPage()
          yPosition = 20
        }
        pdf.text(`${index + 1}. ${step.action || "N/A"}`, 25, yPosition)
        yPosition += 8
        pdf.text(`   Location: ${step.location || "N/A"}`, 30, yPosition)
        yPosition += 8
        pdf.text(`   Handler: ${step.handler || "N/A"} (${step.role || "N/A"})`, 30, yPosition)
        yPosition += 12
      })
    } else if (type === "dispensary") {
      pdf.setFontSize(12)
      data.forEach((item: any, index: number) => {
        if (yPosition > 250) {
          pdf.addPage()
          yPosition = 20
        }

        pdf.text(`${index + 1}. ${item.drugName || "N/A"} - ${item.quantity || "N/A"} units`, 20, yPosition)
        yPosition += 10
        pdf.text(`   Patient: ${item.patientName || "N/A"}`, 20, yPosition)
        yPosition += 10
        pdf.text(
          `   Location: ${item.location || "N/A"} | Distributor: ${item.distributorName || "N/A"}`,
          20,
          yPosition,
        )
        yPosition += 10
        pdf.text(`   Date: ${new Date(item.timestamp || "").toLocaleDateString()}`, 20, yPosition)
        yPosition += 15
      })
    }

    pdf.save(`${filename}.pdf`)
  }

  return (
    <div className="flex gap-2">
      <Button variant="outline" size="sm" onClick={downloadCSV} className="bg-transparent">
        <FileText className="h-4 w-4 mr-2" />
        CSV
      </Button>
      <Button variant="outline" size="sm" onClick={downloadPDF} className="bg-transparent">
        <Download className="h-4 w-4 mr-2" />
        PDF
      </Button>
    </div>
  )
}
