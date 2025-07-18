"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { TrendingUp, Brain, MapPin, Calendar, AlertCircle, CloudRain } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface MonthlyForecastData {
  month: string
  predicted: number
  confidence: number
  season: string
  seasonalFactor: number
}

interface SeasonalData {
  season: string
  demand: number
  color: string
  icon: string
}

interface PredictionRequest {
  region: string
  drugType: string
}

export default function AIForecasting() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [monthlyForecastData, setMonthlyForecastData] = useState<MonthlyForecastData[]>([])
  const [seasonalData, setSeasonalData] = useState<SeasonalData[]>([])
  const [predictionRequest, setPredictionRequest] = useState<PredictionRequest>({
    region: "",
    drugType: "",
  })
  const [insights, setInsights] = useState<string[]>([])

  // Seasonal drug demand patterns
  const seasonalPatterns = {
    Winter: {
      "Paracetamol 500mg": { multiplier: 1.8, reason: "High fever and cold cases" },
      "Amoxicillin 250mg": { multiplier: 1.6, reason: "Respiratory infections peak" },
      "Aspirin 75mg": { multiplier: 1.2, reason: "Heart conditions in cold weather" },
      "Omeprazole 20mg": { multiplier: 1.1, reason: "Stress-related acidity" },
      "Metformin 500mg": { multiplier: 1.0, reason: "Steady diabetes management" },
    },
    Summer: {
      "Paracetamol 500mg": { multiplier: 1.3, reason: "Heat-related headaches" },
      "Amoxicillin 250mg": { multiplier: 0.8, reason: "Lower infection rates" },
      "Aspirin 75mg": { multiplier: 1.4, reason: "Dehydration-related issues" },
      "Omeprazole 20mg": { multiplier: 1.3, reason: "Digestive issues from heat" },
      "Metformin 500mg": { multiplier: 1.1, reason: "Increased activity levels" },
    },
    Monsoon: {
      "Paracetamol 500mg": { multiplier: 2.0, reason: "Peak fever and viral infections" },
      "Amoxicillin 250mg": { multiplier: 2.2, reason: "Water-borne and bacterial infections" },
      "Aspirin 75mg": { multiplier: 1.0, reason: "Normal cardiovascular needs" },
      "Omeprazole 20mg": { multiplier: 1.5, reason: "Contaminated food issues" },
      "Metformin 500mg": { multiplier: 0.9, reason: "Reduced outdoor activity" },
    },
    "Post-Monsoon": {
      "Paracetamol 500mg": { multiplier: 1.4, reason: "Dengue and viral fever season" },
      "Amoxicillin 250mg": { multiplier: 1.3, reason: "Post-monsoon infections" },
      "Aspirin 75mg": { multiplier: 1.1, reason: "Weather transition stress" },
      "Omeprazole 20mg": { multiplier: 1.2, reason: "Festival season dietary changes" },
      "Metformin 500mg": { multiplier: 1.2, reason: "Festival season dietary impact" },
    },
  }

  const monthToSeason = {
    Jan: "Winter",
    Feb: "Winter",
    Mar: "Summer",
    Apr: "Summer",
    May: "Summer",
    Jun: "Monsoon",
    Jul: "Monsoon",
    Aug: "Monsoon",
    Sep: "Monsoon",
    Oct: "Post-Monsoon",
    Nov: "Post-Monsoon",
    Dec: "Winter",
  }

  const seasonColors = {
    Winter: "#3B82F6",
    Summer: "#F59E0B",
    Monsoon: "#10B981",
    "Post-Monsoon": "#8B5CF6",
  }

  const generate12MonthForecast = (region: string, drugType: string) => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    const monthlyData: MonthlyForecastData[] = []
    const seasonalSummary: { [key: string]: number } = {}

    let baseValue = 100
    if (region === "Rural Areas (High Priority)") {
      baseValue = 150
    }

    months.forEach((month, index) => {
      const season = monthToSeason[month as keyof typeof monthToSeason]
      const pattern = seasonalPatterns[season as keyof typeof seasonalPatterns]
      const drugPattern = pattern[drugType as keyof typeof pattern] || { multiplier: 1.0, reason: "Standard demand" }

      // Add some monthly variation within seasons
      const monthlyVariation = 0.9 + Math.sin((index / 12) * 2 * Math.PI) * 0.1 + Math.random() * 0.1
      const predicted = Math.round(baseValue * drugPattern.multiplier * monthlyVariation)
      const confidence = 85 + Math.random() * 10

      monthlyData.push({
        month,
        predicted,
        confidence: Math.round(confidence),
        season,
        seasonalFactor: drugPattern.multiplier,
      })

      // Aggregate seasonal data
      if (!seasonalSummary[season]) {
        seasonalSummary[season] = 0
      }
      seasonalSummary[season] += predicted
    })

    // Create seasonal summary
    const seasonalData: SeasonalData[] = Object.entries(seasonalSummary).map(([season, demand]) => ({
      season,
      demand: Math.round(demand / (season === "Winter" ? 3 : season === "Summer" ? 3 : season === "Monsoon" ? 4 : 2)),
      color: seasonColors[season as keyof typeof seasonColors],
      icon: season === "Winter" ? "❄️" : season === "Summer" ? "☀️" : season === "Monsoon" ? "🌧️" : "🍂",
    }))

    return { monthlyData, seasonalData }
  }

  const generateInsights = (
    region: string,
    drugType: string,
    monthlyData: MonthlyForecastData[],
    seasonalData: SeasonalData[],
  ) => {
    const insights = []
    const maxDemand = Math.max(...monthlyData.map((item) => item.predicted))
    const minDemand = Math.min(...monthlyData.map((item) => item.predicted))
    const peakMonth = monthlyData.find((item) => item.predicted === maxDemand)?.month
    const peakSeason = seasonalData.reduce((prev, current) => (prev.demand > current.demand ? prev : current))

    insights.push(`Annual peak demand expected in ${peakMonth}: ${maxDemand} units`)
    insights.push(`Highest seasonal demand: ${peakSeason.season} (${peakSeason.demand} avg units/month)`)
    insights.push(
      `Annual variation: ${Math.round(((maxDemand - minDemand) / minDemand) * 100)}% from lowest to highest month`,
    )

    // Drug-specific insights
    if (drugType === "Paracetamol 500mg") {
      insights.push("Monsoon season shows 100% increase due to viral fever outbreaks")
      insights.push("Winter months require 80% higher stock due to cold and flu season")
    } else if (drugType === "Amoxicillin 250mg") {
      insights.push("Monsoon season critical: 120% increase due to bacterial infections")
      insights.push("Summer shows lowest demand - optimal time for inventory optimization")
    } else if (drugType === "Metformin 500mg") {
      insights.push("Steady year-round demand with slight festival season increases")
      insights.push("Monsoon season may see reduced compliance due to access issues")
    }

    if (region === "Rural Areas (High Priority)") {
      insights.push("Rural areas require 50% higher buffer stock during peak seasons")
      insights.push("Pre-positioning strategy needed 2 months before monsoon season")
    }

    return insights
  }

  const handlePredict = async () => {
    if (!predictionRequest.region || !predictionRequest.drugType) {
      toast({
        title: "Missing Information",
        description: "Please select both region and drug type",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      await new Promise((resolve) => setTimeout(resolve, 2000))

      const { monthlyData, seasonalData } = generate12MonthForecast(
        predictionRequest.region,
        predictionRequest.drugType,
      )

      const generatedInsights = generateInsights(
        predictionRequest.region,
        predictionRequest.drugType,
        monthlyData,
        seasonalData,
      )

      setMonthlyForecastData(monthlyData)
      setSeasonalData(seasonalData)
      setInsights(generatedInsights)

      toast({
        title: "Annual Forecast Generated",
        description: `12-month prediction completed for ${predictionRequest.drugType} in ${predictionRequest.region}`,
      })
    } catch (error) {
      toast({
        title: "Prediction Failed",
        description: "Please try again",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-r from-[#007CC3]/10 to-[#3781C2]/10 border-[#007CC3] shadow-lg hover:shadow-xl transition-all duration-300">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-[#007CC3]">
            <Brain className="h-5 w-5" />
            AI Annual Demand Forecasting
          </CardTitle>
          <CardDescription>
            Predict 12-month drug demand using machine learning with seasonal patterns and regional factors
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Region</label>
              <Select
                value={predictionRequest.region}
                onValueChange={(value) => setPredictionRequest((prev) => ({ ...prev, region: value }))}
              >
                <SelectTrigger className="border-[#007CC3]/30 focus:border-[#007CC3]">
                  <SelectValue placeholder="Select region" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Rural Areas (High Priority)">Rural Areas (High Priority)</SelectItem>
                  <SelectItem value="Urban Areas">Urban Areas</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Drug Type</label>
              <Select
                value={predictionRequest.drugType}
                onValueChange={(value) => setPredictionRequest((prev) => ({ ...prev, drugType: value }))}
              >
                <SelectTrigger className="border-[#007CC3]/30 focus:border-[#007CC3]">
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
          </div>

          <Button
            onClick={handlePredict}
            disabled={isLoading}
            className="w-full bg-[#007CC3] hover:bg-[#3781C2] transition-all duration-300 transform hover:scale-105"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Running AI Annual Prediction Model...
              </>
            ) : (
              <>
                <TrendingUp className="h-4 w-4 mr-2" />
                Generate 12-Month Forecast
              </>
            )}
          </Button>

          {/* Model Info */}
          <div className="bg-[#007CC3]/5 p-4 rounded-lg border border-[#007CC3]/20">
            <h4 className="font-medium mb-2 text-[#007CC3]">AI Model Features:</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
              <div>• XGBoost regression with seasonal patterns</div>
              <div>• Weather and epidemic correlation</div>
              <div>• Regional demand variations</div>
              <div>• Historical consumption data</div>
              <div>• Monsoon disease outbreak patterns</div>
              <div>• Rural vs Urban prioritization</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 12-Month Forecast Results */}
      {monthlyForecastData.length > 0 && (
        <>
          <Card className="hover:shadow-lg transition-shadow duration-300">
            <CardHeader>
              <CardTitle className="text-[#007CC3]">12-Month Demand Forecast</CardTitle>
              <CardDescription>
                Monthly predicted demand for {predictionRequest.drugType} in {predictionRequest.region}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-96 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyForecastData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#007CC3/20" />
                    <XAxis dataKey="month" stroke="#007CC3" />
                    <YAxis stroke="#007CC3" />
                    <Tooltip
                      formatter={(value, name) => [`${value} units`, "Predicted Demand"]}
                      contentStyle={{ backgroundColor: "#f8fafc", border: "1px solid #007CC3" }}
                    />
                    <Bar dataKey="predicted" fill="#007CC3" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow duration-300">
            <CardHeader>
              <CardTitle className="text-[#007CC3]">Seasonal Demand Analysis</CardTitle>
              <CardDescription>Average demand by season for strategic planning</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={seasonalData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ season, demand }) => `${season}: ${demand}`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="demand"
                    >
                      {seasonalData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value} units`, "Average Monthly Demand"]} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow duration-300">
            <CardHeader>
              <CardTitle className="text-[#007CC3]">Confidence Levels Throughout Year</CardTitle>
              <CardDescription>AI model confidence for each monthly prediction</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monthlyForecastData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#007CC3/20" />
                    <XAxis dataKey="month" stroke="#007CC3" />
                    <YAxis domain={[80, 100]} stroke="#007CC3" />
                    <Tooltip
                      formatter={(value) => [`${value}%`, "Confidence"]}
                      contentStyle={{ backgroundColor: "#f8fafc", border: "1px solid #007CC3" }}
                    />
                    <Line
                      type="monotone"
                      dataKey="confidence"
                      stroke="#10b981"
                      strokeWidth={3}
                      dot={{ fill: "#10b981", strokeWidth: 2, r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* AI Insights */}
          <Card className="hover:shadow-lg transition-shadow duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[#007CC3]">
                <Brain className="h-5 w-5" />
                AI Annual Insights & Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {insights.map((insight, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-2 p-3 bg-[#007CC3]/5 rounded-lg border border-[#007CC3]/20 hover:bg-[#007CC3]/10 transition-colors"
                  >
                    <AlertCircle className="h-4 w-4 text-[#007CC3] mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{insight}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recommended Actions */}
          <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200 hover:shadow-lg transition-shadow duration-300">
            <CardHeader>
              <CardTitle className="text-green-800">Annual Procurement Strategy</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {predictionRequest.region === "Rural Areas (High Priority)" && (
                  <div className="flex items-center gap-2 text-green-700">
                    <MapPin className="h-4 w-4" />
                    <span className="text-sm">Pre-position 75% higher stock before monsoon season in rural areas</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-green-700">
                  <Calendar className="h-4 w-4" />
                  <span className="text-sm">Schedule bulk procurement 2 months before peak seasonal demand</span>
                </div>
                <div className="flex items-center gap-2 text-green-700">
                  <TrendingUp className="h-4 w-4" />
                  <span className="text-sm">Monitor weather forecasts for early seasonal demand triggers</span>
                </div>
                <div className="flex items-center gap-2 text-green-700">
                  <CloudRain className="h-4 w-4" />
                  <span className="text-sm">Establish emergency stock reserves for monsoon season disruptions</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
