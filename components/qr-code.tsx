"use client"

import { useRef } from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface QRCodeProps {
  value: string
  size?: number
  showDownload?: boolean
}

export default function QRCode({ value, size = 150, showDownload = false }: QRCodeProps) {
  const { toast } = useToast()
  const [isDownloading, setIsDownloading] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Generate a realistic QR code pattern based on the input value
  const generateQRPattern = (data: string, gridSize = 21) => {
    // Create a hash from the input data
    let hash = 0
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i)
      hash = (hash << 5) - hash + char
      hash = hash & hash // Convert to 32-bit integer
    }

    const pattern: boolean[][] = Array(gridSize)
      .fill(null)
      .map(() => Array(gridSize).fill(false))

    // Add finder patterns (corners)
    const addFinderPattern = (startX: number, startY: number) => {
      for (let i = 0; i < 7; i++) {
        for (let j = 0; j < 7; j++) {
          if (i === 0 || i === 6 || j === 0 || j === 6 || (i >= 2 && i <= 4 && j >= 2 && j <= 4)) {
            if (startX + i < gridSize && startY + j < gridSize) {
              pattern[startX + i][startY + j] = true
            }
          }
        }
      }
    }

    // Add finder patterns at corners
    addFinderPattern(0, 0) // Top-left
    addFinderPattern(0, gridSize - 7) // Top-right
    addFinderPattern(gridSize - 7, 0) // Bottom-left

    // Add timing patterns
    for (let i = 8; i < gridSize - 8; i++) {
      pattern[6][i] = i % 2 === 0
      pattern[i][6] = i % 2 === 0
    }

    // Fill data area with pseudo-random pattern based on hash
    for (let i = 0; i < gridSize; i++) {
      for (let j = 0; j < gridSize; j++) {
        // Skip finder patterns and timing patterns
        if ((i < 9 && j < 9) || (i < 9 && j >= gridSize - 8) || (i >= gridSize - 8 && j < 9) || i === 6 || j === 6) {
          continue
        }

        // Generate pseudo-random pattern
        const seed = hash + i * gridSize + j
        pattern[i][j] = (seed * 9301 + 49297) % 233280 < 116640
      }
    }

    return pattern
  }

  const pattern = generateQRPattern(value)
  const moduleSize = size / pattern.length

  useEffect(() => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Clear canvas with white background
    ctx.fillStyle = "#ffffff"
    ctx.fillRect(0, 0, size, size)

    // Draw QR pattern
    ctx.fillStyle = "#000000"
    for (let i = 0; i < pattern.length; i++) {
      for (let j = 0; j < pattern[i].length; j++) {
        if (pattern[i][j]) {
          ctx.fillRect(j * moduleSize, i * moduleSize, moduleSize, moduleSize)
        }
      }
    }
  }, [value, size])

  const downloadQR = async () => {
    setIsDownloading(true)
    try {
      // Create canvas
      const canvas = document.createElement("canvas")
      const ctx = canvas.getContext("2d")
      if (!ctx) throw new Error("Canvas not supported")

      canvas.width = size + 20 // Add padding
      canvas.height = size + 20

      // White background
      ctx.fillStyle = "#ffffff"
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Draw QR pattern
      ctx.fillStyle = "#000000"
      for (let i = 0; i < pattern.length; i++) {
        for (let j = 0; j < pattern[i].length; j++) {
          if (pattern[i][j]) {
            ctx.fillRect(10 + j * moduleSize, 10 + i * moduleSize, moduleSize, moduleSize)
          }
        }
      }

      // Download
      const link = document.createElement("a")
      link.download = `qr-code-${Date.now()}.png`
      link.href = canvas.toDataURL()
      link.click()

      toast({
        title: "QR Code Downloaded",
        description: "QR code saved successfully",
      })
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "Could not download QR code",
        variant: "destructive",
      })
    } finally {
      setIsDownloading(false)
    }
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className="bg-white p-2 rounded-lg border-2 border-gray-200 shadow-sm hover:shadow-md transition-shadow"
        style={{ width: size + 16, height: size + 16 }}
      >
        <canvas ref={canvasRef} width={size} height={size} className="block" />
      </div>

      {showDownload && (
        <Button
          variant="outline"
          size="sm"
          onClick={downloadQR}
          disabled={isDownloading}
          className="text-xs bg-transparent"
        >
          {isDownloading ? (
            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-gray-600 mr-1"></div>
          ) : (
            <Download className="h-3 w-3 mr-1" />
          )}
          Download
        </Button>
      )}
    </div>
  )
}
