"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Shield, Building2, Hospital, Users, Eye, EyeOff } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import Image from "next/image"

interface UserData {
  email: string
  role: string
  orgName: string
  location: string
}

interface LoginPageProps {
  onLogin: (userData: UserData) => void
}

export default function LoginPage({ onLogin }: LoginPageProps) {
  const { toast } = useToast()
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    role: "",
    orgName: "",
    location: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.email || !formData.password || !formData.role) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    // Simple validation - password is "medchain" for all users
    if (formData.password !== "medchain") {
      toast({
        title: "Invalid Credentials",
        description: "Incorrect password. Use 'medchain' for demo.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      // Simulate authentication delay
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Auto-populate org name and location based on role
      let orgName = formData.orgName
      let location = formData.location

      if (!orgName) {
        switch (formData.role) {
          case "Manufacturer":
            orgName = "Sun Pharma Ltd"
            location = "Mumbai, Maharashtra"
            break
          case "Distributor":
            orgName = "Delhi Distribution Center"
            location = "Delhi, India"
            break
          case "Hospital/Pharmacy":
            orgName = "AIIMS Delhi"
            location = "New Delhi, India"
            break
          case "Patient":
            orgName = "Individual Patient"
            location = "Delhi, India"
            break
          case "Admin/Regulator":
            orgName = "Drug Controller General of India"
            location = "New Delhi, India"
            break
          default:
            orgName = "MedChain Organization"
            location = "India"
        }
      }

      const userData: UserData = {
        email: formData.email,
        role: formData.role,
        orgName,
        location,
      }

      onLogin(userData)

      toast({
        title: "Login Successful",
        description: `Welcome to MedChain, ${formData.role}!`,
      })
    } catch (error) {
      toast({
        title: "Login Failed",
        description: "Please try again",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "Manufacturer":
        return <Building2 className="h-5 w-5" />
      case "Distributor":
        return <Shield className="h-5 w-5" />
      case "Hospital/Pharmacy":
        return <Hospital className="h-5 w-5" />
      case "Patient":
        return <Users className="h-5 w-5" />
      case "Admin/Regulator":
        return <Shield className="h-5 w-5" />
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#007CC3] via-[#3781C2] to-blue-600 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Logo and Branding */}
        <div className="text-center mb-8">
          <div className="bg-white/10 backdrop-blur-sm p-4 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center hover:scale-110 transition-transform duration-300">
            <Image src="/logo.png" alt="MedChain Logo" width={60} height={60} className="rounded-lg" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2 hover:scale-105 transition-transform duration-300">
            MedChain
          </h1>
          <p className="text-blue-100 text-lg">Healthcare Supply Integrity Platform</p>
          <p className="text-blue-200 text-sm mt-2">Secure • Transparent • Traceable</p>
        </div>

        {/* Login Card */}
        <Card className="bg-white/95 backdrop-blur-sm shadow-2xl border-0 hover:shadow-3xl transition-all duration-300">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-[#007CC3]">Welcome Back</CardTitle>
            <CardDescription className="text-[#3781C2]">Sign in to access your MedChain dashboard</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-[#007CC3] font-medium">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                  placeholder="Enter your email"
                  className="border-[#007CC3]/30 focus:border-[#007CC3] transition-colors"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-[#007CC3] font-medium">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))}
                    placeholder="Enter password (use 'medchain')"
                    className="border-[#007CC3]/30 focus:border-[#007CC3] pr-10 transition-colors"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </Button>
                </div>
                <p className="text-xs text-gray-500">Demo password: medchain</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="role" className="text-[#007CC3] font-medium">
                  Role
                </Label>
                <Select
                  value={formData.role}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, role: value }))}
                >
                  <SelectTrigger className="border-[#007CC3]/30 focus:border-[#007CC3] transition-colors">
                    <SelectValue placeholder="Select your role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Manufacturer">
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4" />
                        Manufacturer
                      </div>
                    </SelectItem>
                    <SelectItem value="Distributor">
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4" />
                        Distributor
                      </div>
                    </SelectItem>
                    <SelectItem value="Hospital/Pharmacy">
                      <div className="flex items-center gap-2">
                        <Hospital className="h-4 w-4" />
                        Hospital/Pharmacy
                      </div>
                    </SelectItem>
                    <SelectItem value="Patient">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Patient
                      </div>
                    </SelectItem>
                    <SelectItem value="Admin/Regulator">
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4" />
                        Admin/Regulator
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formData.role && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="orgName" className="text-[#007CC3] font-medium">
                      Organization
                    </Label>
                    <Input
                      id="orgName"
                      value={formData.orgName}
                      onChange={(e) => setFormData((prev) => ({ ...prev, orgName: e.target.value }))}
                      placeholder="Auto-filled based on role"
                      className="border-[#007CC3]/30 focus:border-[#007CC3] transition-colors"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location" className="text-[#007CC3] font-medium">
                      Location
                    </Label>
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => setFormData((prev) => ({ ...prev, location: e.target.value }))}
                      placeholder="Auto-filled based on role"
                      className="border-[#007CC3]/30 focus:border-[#007CC3] transition-colors"
                    />
                  </div>
                </div>
              )}

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#007CC3] hover:bg-[#3781C2] text-white transition-all duration-300 transform hover:scale-105"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Signing In...
                  </>
                ) : (
                  <>
                    {formData.role && getRoleIcon(formData.role)}
                    <span className={formData.role ? "ml-2" : ""}>Sign In to MedChain</span>
                  </>
                )}
              </Button>
            </form>

            {/* Demo Info */}
            <div className="mt-6 p-4 bg-[#007CC3]/5 rounded-lg border border-[#007CC3]/20">
              <h4 className="font-medium text-[#007CC3] mb-2">Demo Information</h4>
              <div className="text-sm text-[#3781C2] space-y-1">
                <p>
                  • Password for all roles: <strong>medchain</strong>
                </p>
                <p>• Organization and location are auto-filled</p>
                <p>• Try different roles to explore features</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8 text-white/80">
          <p className="text-sm">Developed by Mavericks</p>
          <p className="text-xs">Infosys Global Hackathon 2025</p>
        </div>
      </div>
    </div>
  )
}
