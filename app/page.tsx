"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Building2, Hospital, Users, Shield, BarChart3, QrCode } from "lucide-react"
import ManufacturerInterface from "@/components/manufacturer-interface"
import DistributorInterface from "@/components/distributor-interface"
import HospitalInterface from "@/components/hospital-interface"
import AIForecasting from "@/components/ai-forecasting"
import PatientVerification from "@/components/patient-verification"
import AdminPanel from "@/components/admin-panel"
import LoginPage from "@/components/login-page"
import { Toaster } from "@/components/ui/toaster"
import Image from "next/image"

interface UserData {
  email: string
  role: string
  orgName: string
  location: string
}

export default function MedChainMVP() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userData, setUserData] = useState<UserData | null>(null)
  const [activeRole, setActiveRole] = useState("manufacturer")

  const handleLogin = (data: UserData) => {
    setUserData(data)
    setIsLoggedIn(true)

    // Set active role based on user's role
    const roleMapping: { [key: string]: string } = {
      Manufacturer: "manufacturer",
      Distributor: "distributor",
      "Hospital/Pharmacy": "hospital",
      Patient: "patient",
      "Admin/Regulator": "admin",
    }
    setActiveRole(roleMapping[data.role] || "manufacturer")
  }

  const handleLogout = () => {
    setIsLoggedIn(false)
    setUserData(null)
    setActiveRole("manufacturer")
  }

  if (!isLoggedIn) {
    return <LoginPage onLogin={handleLogin} />
  }

  const roles = [
    {
      id: "manufacturer",
      name: "Manufacturer",
      icon: Building2,
      description: "Create drug batches and generate QR codes",
      color: "bg-[#007CC3]",
    },
    {
      id: "distributor",
      name: "Distributor",
      icon: QrCode,
      description: "Scan and track drug movement",
      color: "bg-[#3781C2]",
    },
    {
      id: "hospital",
      name: "Hospital/Pharmacy",
      icon: Hospital,
      description: "Receive shipments and dispense to patients",
      color: "bg-purple-500",
    },
    {
      id: "patient",
      name: "Patient Verification",
      icon: Users,
      description: "Verify patient identity for drug dispensing",
      color: "bg-orange-500",
    },
    {
      id: "forecasting",
      name: "AI Forecasting",
      icon: BarChart3,
      description: "Predict drug demand using AI",
      color: "bg-teal-500",
    },
    {
      id: "admin",
      name: "Admin/Regulator",
      icon: Shield,
      description: "Audit trails and compliance monitoring",
      color: "bg-red-500",
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 relative">
      <div className="container mx-auto p-6 pb-20">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="text-center flex-1">
            <h1 className="text-4xl font-bold text-[#007CC3] mb-2 hover:text-[#3781C2] transition-colors duration-300 hover:scale-105 transform">
              MedChain
            </h1>
            <p className="text-xl text-[#3781C2] mb-4">Healthcare Supply Integrity Platform</p>
            <div className="flex justify-center gap-2 flex-wrap">
              <Badge
                variant="secondary"
                className="bg-[#007CC3]/10 text-[#007CC3] border-[#007CC3]/20 hover:bg-[#007CC3]/20 transition-all duration-300 hover:scale-105"
              >
                Blockchain Tracking
              </Badge>
              <Badge
                variant="secondary"
                className="bg-[#007CC3]/10 text-[#007CC3] border-[#007CC3]/20 hover:bg-[#007CC3]/20 transition-all duration-300 hover:scale-105"
              >
                AI Forecasting
              </Badge>
              <Badge
                variant="secondary"
                className="bg-[#007CC3]/10 text-[#007CC3] border-[#007CC3]/20 hover:bg-[#007CC3]/20 transition-all duration-300 hover:scale-105"
              >
                Rural Priority
              </Badge>
              <Badge
                variant="secondary"
                className="bg-[#007CC3]/10 text-[#007CC3] border-[#007CC3]/20 hover:bg-[#007CC3]/20 transition-all duration-300 hover:scale-105"
              >
                Patient Verification
              </Badge>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-[#3781C2]">Welcome, {userData?.email}</p>
            <p className="text-xs text-gray-500">
              {userData?.role} • {userData?.orgName}
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="mt-2 bg-transparent border-[#007CC3] text-[#007CC3] hover:bg-[#007CC3] hover:text-white transition-all duration-300 hover:scale-105"
            >
              Logout
            </Button>
          </div>
        </div>

        {/* Role Selection */}
        <Card className="mb-6 border-[#007CC3]/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
          <CardHeader>
            <CardTitle className="text-[#007CC3]">Select Your Role</CardTitle>
            <CardDescription className="text-[#3781C2]">
              Choose your role in the supply chain to access relevant features
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {roles.map((role) => (
                <Button
                  key={role.id}
                  variant={activeRole === role.id ? "default" : "outline"}
                  className={`h-auto p-4 flex flex-col items-center gap-2 transition-all duration-300 transform hover:scale-105 ${
                    activeRole === role.id
                      ? `${role.color} text-white shadow-lg hover:shadow-xl`
                      : `border-[#007CC3]/30 text-[#007CC3] hover:bg-[#007CC3]/10 hover:border-[#007CC3]`
                  }`}
                  onClick={() => setActiveRole(role.id)}
                >
                  <role.icon className="h-6 w-6" />
                  <div className="text-center">
                    <div className="font-medium">{role.name}</div>
                    <div className="text-xs opacity-80">{role.description}</div>
                  </div>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Main Interface */}
        <div className="space-y-6">
          {activeRole === "manufacturer" && <ManufacturerInterface />}
          {activeRole === "distributor" && <DistributorInterface />}
          {activeRole === "hospital" && <HospitalInterface />}
          {activeRole === "patient" && <PatientVerification />}
          {activeRole === "forecasting" && <AIForecasting />}
          {activeRole === "admin" && <AdminPanel />}
        </div>

        {/* Demo Flow Instructions */}
        <Card className="mt-8 border-[#007CC3]/20 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader>
            <CardTitle className="text-[#007CC3]">Demo Flow</CardTitle>
            <CardDescription className="text-[#3781C2]">
              Follow this sequence to demonstrate the complete supply chain
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="flex items-center gap-3 p-3 bg-[#007CC3]/5 rounded-lg border border-[#007CC3]/20 hover:bg-[#007CC3]/10 transition-all duration-300 hover:scale-105">
                <div className="w-8 h-8 bg-[#007CC3] text-white rounded-full flex items-center justify-center font-bold">
                  1
                </div>
                <div>
                  <div className="font-medium text-[#007CC3]">Manufacturer</div>
                  <div className="text-sm text-[#3781C2]">Create drug batch & QR</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-[#3781C2]/5 rounded-lg border border-[#3781C2]/20 hover:bg-[#3781C2]/10 transition-all duration-300 hover:scale-105">
                <div className="w-8 h-8 bg-[#3781C2] text-white rounded-full flex items-center justify-center font-bold">
                  2
                </div>
                <div>
                  <div className="font-medium text-[#3781C2]">Distributor</div>
                  <div className="text-sm text-gray-600">Scan & track movement</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg border border-purple-200 hover:bg-purple-100 transition-all duration-300 hover:scale-105">
                <div className="w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center font-bold">
                  3
                </div>
                <div>
                  <div className="font-medium text-purple-700">Hospital</div>
                  <div className="text-sm text-purple-600">Receive & dispense</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg border border-orange-200 hover:bg-orange-100 transition-all duration-300 hover:scale-105">
                <div className="w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center font-bold">
                  4
                </div>
                <div>
                  <div className="font-medium text-orange-700">Patient</div>
                  <div className="text-sm text-orange-600">Verify & receive</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-teal-50 rounded-lg border border-teal-200 hover:bg-teal-100 transition-all duration-300 hover:scale-105">
                <div className="w-8 h-8 bg-teal-500 text-white rounded-full flex items-center justify-center font-bold">
                  5
                </div>
                <div>
                  <div className="font-medium text-teal-700">AI Forecast</div>
                  <div className="text-sm text-teal-600">Predict demand</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-red-50 rounded-lg border border-red-200 hover:bg-red-100 transition-all duration-300 hover:scale-105">
                <div className="w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center font-bold">
                  6
                </div>
                <div>
                  <div className="font-medium text-red-700">Admin</div>
                  <div className="text-sm text-red-600">Audit & compliance</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-[#007CC3] to-[#3781C2] text-white py-6 mt-12">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center gap-4 mb-4 md:mb-0">
              <Image
                src="/logo.png"
                alt="MedChain Logo"
                width={50}
                height={50}
                className="rounded-lg shadow-lg hover:scale-110 transition-transform duration-300"
              />
              <div>
                <h3 className="text-xl font-bold">MedChain</h3>
                <p className="text-blue-100">Healthcare Supply Integrity Platform</p>
              </div>
            </div>
            <div className="text-center md:text-right">
              <p className="text-lg font-semibold mb-1">Developed by Mavericks</p>
              <p className="text-blue-100">Infosys Global Hackathon 2025</p>
              <div className="mt-2 text-sm text-blue-200">
                Securing Healthcare • Empowering Communities • Building Trust
              </div>
            </div>
          </div>
          <div className="border-t border-blue-300 mt-4 pt-4 text-center text-blue-100 text-sm">
            © 2025 MedChain Mavericks. All rights reserved. | Blockchain-powered healthcare supply chain integrity.
          </div>
        </div>
      </footer>

      <Toaster />
    </div>
  )
}
