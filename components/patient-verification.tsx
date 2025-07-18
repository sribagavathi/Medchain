"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Users, Shield, CheckCircle, AlertCircle, Phone, MapPin, Calendar } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { DownloadButtons } from "@/components/download-utils"

interface PatientData {
  name: string
  age: number
  aadhaarId: string
  phoneNumber: string
  location: string
  dob: string
  healthHistory: string[]
  medicinesPurchased: string[]
  isVerified: boolean
  lastVerified: string
}

export default function PatientVerification() {
  const { toast } = useToast()
  const [searchAadhaar, setSearchAadhaar] = useState("")
  const [adminPasscode, setAdminPasscode] = useState("")
  const [emergencyNumbers, setEmergencyNumbers] = useState<string[]>([])
  const [patientData, setPatientData] = useState<PatientData | null>(null)
  const [isVerifying, setIsVerifying] = useState(false)
  const [isSearching, setIsSearching] = useState(false)

  // Static Aadhaar ID for demo
  const DEMO_AADHAAR = "1234-5678-9012"
  const ADMIN_PASSCODE = "medchain123"

  // Generate random emergency numbers
  const generateEmergencyNumbers = () => {
    const numbers = []
    for (let i = 0; i < 3; i++) {
      const number = `+91-${Math.floor(Math.random() * 9000000000) + 1000000000}`
      numbers.push(number)
    }
    return numbers
  }

  const samplePatientData: PatientData = {
    name: "Rajesh Kumar",
    age: 45,
    aadhaarId: DEMO_AADHAAR,
    phoneNumber: "+91-9876543210",
    location: "Rural Health Center - Rajasthan",
    dob: "1979-03-15",
    healthHistory: [
      "Diabetes Type 2 (diagnosed 2018)",
      "Hypertension (controlled)",
      "Seasonal allergies",
      "Previous surgery: Appendectomy (2015)",
    ],
    medicinesPurchased: [
      "Metformin 500mg - 30 tablets (Jan 2024)",
      "Paracetamol 500mg - 20 tablets (Dec 2023)",
      "Amlodipine 5mg - 30 tablets (Jan 2024)",
      "Cetirizine 10mg - 10 tablets (Nov 2023)",
    ],
    isVerified: false,
    lastVerified: "",
  }

  const handleSearch = async () => {
    if (!searchAadhaar) {
      toast({
        title: "Missing Aadhaar ID",
        description: "Please enter an Aadhaar ID to search",
        variant: "destructive",
      })
      return
    }

    setIsSearching(true)

    try {
      await new Promise((resolve) => setTimeout(resolve, 1500))

      if (searchAadhaar === DEMO_AADHAAR) {
        setPatientData(samplePatientData)
        setEmergencyNumbers(generateEmergencyNumbers())
        toast({
          title: "Patient Found",
          description: "Patient data retrieved successfully",
        })
      } else {
        toast({
          title: "Patient Not Found",
          description: "No patient found with this Aadhaar ID",
          variant: "destructive",
        })
        setPatientData(null)
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

  const handleVerification = async () => {
    if (!patientData) {
      toast({
        title: "No Patient Data",
        description: "Please search for a patient first",
        variant: "destructive",
      })
      return
    }

    if (!adminPasscode) {
      toast({
        title: "Missing Admin Passcode",
        description: "Please enter the admin passcode",
        variant: "destructive",
      })
      return
    }

    if (adminPasscode !== ADMIN_PASSCODE) {
      toast({
        title: "Invalid Passcode",
        description: "Incorrect admin passcode",
        variant: "destructive",
      })
      return
    }

    setIsVerifying(true)

    try {
      await new Promise((resolve) => setTimeout(resolve, 2000))

      const updatedPatient = {
        ...patientData,
        isVerified: true,
        lastVerified: new Date().toISOString(),
      }

      setPatientData(updatedPatient)

      toast({
        title: "Patient Verified Successfully",
        description: "Patient is now authorized to receive medication",
      })

      setAdminPasscode("")
    } catch (error) {
      toast({
        title: "Verification Failed",
        description: "Please try again",
        variant: "destructive",
      })
    } finally {
      setIsVerifying(false)
    }
  }

  const resetVerification = () => {
    setSearchAadhaar("")
    setAdminPasscode("")
    setPatientData(null)
    setEmergencyNumbers([])
  }

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-r from-orange-50 to-red-50 border-[#007CC3] shadow-lg hover:shadow-xl transition-all duration-300">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-[#007CC3]">
            <Users className="h-5 w-5" />
            Patient Identity Verification
          </CardTitle>
          <CardDescription>
            Secure patient verification using Aadhaar ID and admin passcode for drug dispensing
          </CardDescription>
        </CardHeader>
      </Card>

      <Tabs defaultValue="search" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 bg-[#007CC3]/10">
          <TabsTrigger value="search" className="data-[state=active]:bg-[#007CC3] data-[state=active]:text-white">
            Patient Search
          </TabsTrigger>
          <TabsTrigger value="verify" className="data-[state=active]:bg-[#007CC3] data-[state=active]:text-white">
            Verification
          </TabsTrigger>
        </TabsList>

        <TabsContent value="search" className="space-y-4">
          <Card className="hover:shadow-lg transition-shadow duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-[#007CC3]" />
                Patient Search
              </CardTitle>
              <CardDescription>Search for patient using Aadhaar ID</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="aadhaar" className="text-[#007CC3]">
                  Aadhaar ID
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="aadhaar"
                    value={searchAadhaar}
                    onChange={(e) => setSearchAadhaar(e.target.value)}
                    placeholder="Enter 12-digit Aadhaar ID"
                    className="border-[#007CC3]/30 focus:border-[#007CC3]"
                  />
                  <Button
                    onClick={handleSearch}
                    disabled={isSearching}
                    className="bg-[#007CC3] hover:bg-[#3781C2] transition-colors duration-300"
                  >
                    {isSearching ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Searching...
                      </>
                    ) : (
                      "Search Patient"
                    )}
                  </Button>
                </div>
              </div>

              <div className="bg-[#007CC3]/5 p-4 rounded-lg border border-[#007CC3]/20">
                <h4 className="font-medium mb-2 text-[#007CC3]">Demo Aadhaar ID:</h4>
                <div className="flex items-center gap-2">
                  <code className="bg-white px-2 py-1 rounded text-[#007CC3] font-mono">{DEMO_AADHAAR}</code>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSearchAadhaar(DEMO_AADHAAR)}
                    className="border-[#007CC3] text-[#007CC3] hover:bg-[#007CC3] hover:text-white"
                  >
                    Use Demo ID
                  </Button>
                </div>
              </div>

              {/* Emergency Access */}
              <Card className="bg-red-50 border-red-200">
                <CardHeader>
                  <CardTitle className="text-red-700 text-lg">Emergency Access</CardTitle>
                  <CardDescription className="text-red-600">
                    For emergency situations when patient cannot provide Aadhaar
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    variant="outline"
                    onClick={() => setEmergencyNumbers(generateEmergencyNumbers())}
                    className="border-red-500 text-red-700 hover:bg-red-500 hover:text-white"
                  >
                    <Phone className="h-4 w-4 mr-2" />
                    Generate Emergency Contact Numbers
                  </Button>

                  {emergencyNumbers.length > 0 && (
                    <div className="mt-4 space-y-2">
                      <h4 className="font-medium text-red-700">Emergency Contact Numbers:</h4>
                      {emergencyNumbers.map((number, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm">
                          <Phone className="h-3 w-3 text-red-500" />
                          <span className="font-mono">{number}</span>
                        </div>
                      ))}
                      <p className="text-xs text-red-600 mt-2">These numbers change every time for security purposes</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="verify" className="space-y-4">
          {patientData ? (
            <>
              <Card className="hover:shadow-lg transition-shadow duration-300">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-[#007CC3]">Patient Information</CardTitle>
                      <CardDescription>Verify patient details before dispensing medication</CardDescription>
                    </div>
                    <DownloadButtons
                      data={patientData}
                      filename={`patient-${patientData.aadhaarId}`}
                      title="Patient Health Passport"
                      type="health"
                    />
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div>
                        <Label className="text-[#007CC3] font-medium">Full Name</Label>
                        <p className="text-lg font-semibold">{patientData.name}</p>
                      </div>
                      <div>
                        <Label className="text-[#007CC3] font-medium">Age</Label>
                        <p>{patientData.age} years</p>
                      </div>
                      <div>
                        <Label className="text-[#007CC3] font-medium">Aadhaar ID</Label>
                        <p className="font-mono">{patientData.aadhaarId}</p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <Label className="text-[#007CC3] font-medium">Phone Number</Label>
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-gray-500" />
                          <p>{patientData.phoneNumber}</p>
                        </div>
                      </div>
                      <div>
                        <Label className="text-[#007CC3] font-medium">Location</Label>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-gray-500" />
                          <p>{patientData.location}</p>
                        </div>
                      </div>
                      <div>
                        <Label className="text-[#007CC3] font-medium">Date of Birth</Label>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-500" />
                          <p>{patientData.dob}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-[#007CC3] font-medium">Health History</Label>
                      <div className="mt-2 space-y-1">
                        {patientData.healthHistory.map((history, index) => (
                          <div key={index} className="text-sm bg-gray-50 p-2 rounded">
                            {history}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <Label className="text-[#007CC3] font-medium">Recent Medicine Purchases</Label>
                      <div className="mt-2 space-y-1">
                        {patientData.medicinesPurchased.map((medicine, index) => (
                          <div key={index} className="text-sm bg-blue-50 p-2 rounded">
                            {medicine}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Verification Status */}
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      {patientData.isVerified ? (
                        <>
                          <CheckCircle className="h-5 w-5 text-green-500" />
                          <span className="font-medium text-green-700">Patient Verified</span>
                        </>
                      ) : (
                        <>
                          <AlertCircle className="h-5 w-5 text-orange-500" />
                          <span className="font-medium text-orange-700">Verification Required</span>
                        </>
                      )}
                    </div>
                    {patientData.isVerified && (
                      <Badge className="bg-green-500">
                        Verified: {new Date(patientData.lastVerified).toLocaleString()}
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>

              {!patientData.isVerified && (
                <Card className="border-orange-200 bg-orange-50 hover:shadow-lg transition-shadow duration-300">
                  <CardHeader>
                    <CardTitle className="text-orange-700">Admin Verification Required</CardTitle>
                    <CardDescription className="text-orange-600">
                      Enter admin passcode to verify patient for medication dispensing
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="passcode" className="text-orange-700">
                        Admin Passcode
                      </Label>
                      <Input
                        id="passcode"
                        type="password"
                        value={adminPasscode}
                        onChange={(e) => setAdminPasscode(e.target.value)}
                        placeholder="Enter admin passcode"
                        className="border-orange-300 focus:border-orange-500"
                      />
                      <p className="text-xs text-orange-600">Demo passcode: medchain123</p>
                    </div>

                    <Button
                      onClick={handleVerification}
                      disabled={isVerifying}
                      className="w-full bg-orange-600 hover:bg-orange-700 transition-colors duration-300"
                    >
                      {isVerifying ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Verifying Patient...
                        </>
                      ) : (
                        <>
                          <Shield className="h-4 w-4 mr-2" />
                          Verify Patient
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              )}
            </>
          ) : (
            <Card className="hover:shadow-lg transition-shadow duration-300">
              <CardContent className="text-center py-12">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-600 mb-2">No Patient Selected</h3>
                <p className="text-gray-500 mb-4">Please search for a patient first using their Aadhaar ID</p>
                <Button
                  variant="outline"
                  onClick={() => setSearchAadhaar(DEMO_AADHAAR)}
                  className="border-[#007CC3] text-[#007CC3] hover:bg-[#007CC3] hover:text-white"
                >
                  Use Demo Patient
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {patientData && (
        <div className="flex justify-center">
          <Button
            variant="outline"
            onClick={resetVerification}
            className="border-[#007CC3] text-[#007CC3] hover:bg-[#007CC3] hover:text-white transition-colors duration-300 bg-transparent"
          >
            Search New Patient
          </Button>
        </div>
      )}
    </div>
  )
}
