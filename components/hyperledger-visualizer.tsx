"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Database, Search, Eye, Hash, Link, Blocks } from 'lucide-react'
import { useToast } from "@/hooks/use-toast"

interface HyperledgerBlock {
  blockNumber: number
  blockHash: string
  timestamp: string
  transactionCount: number
  transactions: HyperledgerTransaction[]
  previousHash: string
  merkleRoot: string
  dataHash: string
}

interface HyperledgerTransaction {
  txId: string
  timestamp: string
  chaincode: string
  function: string
  args: string[]
  endorser: string
  creator: string
  payload: any
  validationCode: number
}

interface WorldStateEntry {
  key: string
  value: {
    batchId: string
    drugName: string
    manufacturer: string
    quantity: string
    timestamp: string
    status: "pending" | "waiting" | "success"
    currentLocation?: string
  }
}

export default function HyperledgerVisualizer() {
  const { toast } = useToast()
  const [blocks, setBlocks] = useState<HyperledgerBlock[]>([])
  const [worldState, setWorldState] = useState<WorldStateEntry[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedBlock, setSelectedBlock] = useState<HyperledgerBlock | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [filterType, setFilterType] = useState("all")

  // Generate SHA-256 like hash (simulated)
  const generateHash = (data: string): string => {
    let hash = 0
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(16).padStart(64, '0').substring(0, 64)
  }

  // Generate Merkle Root
  const generateMerkleRoot = (transactions: HyperledgerTransaction[]): string => {
    if (transactions.length === 0) return "0".repeat(64)
    const txHashes = transactions.map(tx => generateHash(tx.txId + tx.timestamp))
    return generateHash(txHashes.join(''))
  }

  // Simulate Hyperledger Fabric data with real blockchain structure
  useEffect(() => {
    generateBlockchainData()
  }, [])

  const generateBlockchainData = () => {
    const sampleBlocks: HyperledgerBlock[] = []
    const sampleWorldState: WorldStateEntry[] = []

    // Genesis Block (Block 0)
    const genesisBlock: HyperledgerBlock = {
      blockNumber: 0,
      blockHash: generateHash("genesis_block_medchain"),
      timestamp: "2024-01-01T00:00:00Z",
      transactionCount: 0,
      transactions: [],
      previousHash: "0".repeat(64),
      merkleRoot: "0".repeat(64),
      dataHash: generateHash("genesis_data"),
    }
    sampleBlocks.push(genesisBlock)

    // Generate subsequent blocks with real transactions
    for (let i = 1; i <= 5; i++) {
      const blockTimestamp = new Date(Date.now() - (5 - i) * 24 * 60 * 60 * 1000).toISOString()
      
      const transactions: HyperledgerTransaction[] = []

      // Create Drug Batch Transaction
      if (i === 1) {
        transactions.push({
          txId: `tx_${generateHash(`createBatch_${i}`).substring(0, 16)}`,
          timestamp: blockTimestamp,
          chaincode: "medchain-cc",
          function: "createDrugBatch",
          args: ["batch001", "Paracetamol", "Acme Pharma", "1000"],
          endorser: "peer0.manufacturer.medchain.com",
          creator: "manufacturer-admin",
          payload: {
            batchId: "batch001",
            drugName: "Paracetamol",
            manufacturer: "Acme Pharma",
            quantity: "1000",
            status: "pending"
          },
          validationCode: 0
        })

        // Add to world state
        sampleWorldState.push({
          key: "batch001",
          value: {
            batchId: "batch001",
            drugName: "Paracetamol",
            manufacturer: "Acme Pharma",
            quantity: "1000",
            timestamp: blockTimestamp,
            status: "pending",
            currentLocation: "Acme Pharma Manufacturing"
          }
        })
      }

      // Update Batch Status Transactions
      if (i === 2) {
        transactions.push({
          txId: `tx_${generateHash(`updateStatus_${i}`).substring(0, 16)}`,
          timestamp: blockTimestamp,
          chaincode: "medchain-cc",
          function: "updateBatchStatus",
          args: ["batch001", "waiting"],
          endorser: "peer0.distributor.medchain.com",
          creator: "distributor-admin",
          payload: {
            batchId: "batch001",
            status: "waiting",
            location: "Distribution Center"
          },
          validationCode: 0
        })

        // Update world state
        const existingEntry = sampleWorldState.find(entry => entry.key === "batch001")
        if (existingEntry) {
          existingEntry.value.status = "waiting"
          existingEntry.value.currentLocation = "Distribution Center"
          existingEntry.value.timestamp = blockTimestamp
        }
      }

      if (i === 3) {
        transactions.push({
          txId: `tx_${generateHash(`finalUpdate_${i}`).substring(0, 16)}`,
          timestamp: blockTimestamp,
          chaincode: "medchain-cc",
          function: "updateBatchStatus",
          args: ["batch001", "success"],
          endorser: "peer0.hospital.medchain.com",
          creator: "hospital-admin",
          payload: {
            batchId: "batch001",
            status: "success",
            location: "City Hospital"
          },
          validationCode: 0
        })

        // Update world state
        const existingEntry = sampleWorldState.find(entry => entry.key === "batch001")
        if (existingEntry) {
          existingEntry.value.status = "success"
          existingEntry.value.currentLocation = "City Hospital"
          existingEntry.value.timestamp = blockTimestamp
        }
      }

      // Create second batch
      if (i === 4) {
        transactions.push({
          txId: `tx_${generateHash(`createBatch2_${i}`).substring(0, 16)}`,
          timestamp: blockTimestamp,
          chaincode: "medchain-cc",
          function: "createDrugBatch",
          args: ["batch002", "Ibuprofen", "Beta Pharma", "500"],
          endorser: "peer0.manufacturer.medchain.com",
          creator: "manufacturer-admin",
          payload: {
            batchId: "batch002",
            drugName: "Ibuprofen",
            manufacturer: "Beta Pharma",
            quantity: "500",
            status: "pending"
          },
          validationCode: 0
        })

        sampleWorldState.push({
          key: "batch002",
          value: {
            batchId: "batch002",
            drugName: "Ibuprofen",
            manufacturer: "Beta Pharma",
            quantity: "500",
            timestamp: blockTimestamp,
            status: "pending",
            currentLocation: "Beta Pharma Manufacturing"
          }
        })
      }

      if (i === 5) {
        transactions.push({
          txId: `tx_${generateHash(`updateBatch2_${i}`).substring(0, 16)}`,
          timestamp: blockTimestamp,
          chaincode: "medchain-cc",
          function: "updateBatchStatus",
          args: ["batch002", "waiting"],
          endorser: "peer0.distributor.medchain.com",
          creator: "distributor-admin",
          payload: {
            batchId: "batch002",
            status: "waiting",
            location: "Regional Distribution Hub"
          },
          validationCode: 0
        })

        const existingEntry = sampleWorldState.find(entry => entry.key === "batch002")
        if (existingEntry) {
          existingEntry.value.status = "waiting"
          existingEntry.value.currentLocation = "Regional Distribution Hub"
          existingEntry.value.timestamp = blockTimestamp
        }
      }

      const merkleRoot = generateMerkleRoot(transactions)
      const dataHash = generateHash(JSON.stringify(transactions))
      const blockData = `${i}${blockTimestamp}${sampleBlocks[i-1].blockHash}${merkleRoot}`
      const blockHash = generateHash(blockData)

      sampleBlocks.push({
        blockNumber: i,
        blockHash,
        timestamp: blockTimestamp,
        transactionCount: transactions.length,
        transactions,
        previousHash: sampleBlocks[i-1].blockHash,
        merkleRoot,
        dataHash,
      })
    }

    setBlocks(sampleBlocks)
    setWorldState(sampleWorldState)
  }

  const searchBlocks = async () => {
    if (!searchTerm) {
      toast({
        title: "Enter Search Term",
        description: "Please enter a batch ID, transaction ID, or other search term",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const filteredBlocks = blocks.filter((block) =>
        block.transactions.some(
          (tx) =>
            tx.txId.includes(searchTerm) ||
            JSON.stringify(tx.payload).toLowerCase().includes(searchTerm.toLowerCase()) ||
            tx.args.some((arg) => arg.includes(searchTerm)),
        ),
      )

      if (filteredBlocks.length > 0) {
        setBlocks(filteredBlocks)
        toast({
          title: "Search Results Found",
          description: `Found ${filteredBlocks.length} blocks matching "${searchTerm}"`,
        })
      } else {
        toast({
          title: "No Results Found",
          description: `No blocks found matching "${searchTerm}"`,
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Search Failed",
        description: "Please try again",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const resetSearch = () => {
    setSearchTerm("")
    generateBlockchainData()
  }

  const getTransactionTypeColor = (func: string) => {
    switch (func) {
      case "createDrugBatch":
        return "bg-[#007CC3]"
      case "updateBatchStatus":
        return "bg-[#3781C2]"
      case "dispenseDrug":
        return "bg-purple-500"
      case "verifyPatient":
        return "bg-orange-500"
      default:
        return "bg-gray-500"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "success":
        return "bg-green-500"
      case "waiting":
        return "bg-orange-500"
      case "pending":
        return "bg-yellow-500"
      default:
        return "bg-gray-500"
    }
  }

  return (
    <div className="space-y-6">
      <Card className="border-[#007CC3]/20 bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-[#007CC3]">
            <Database className="h-5 w-5" />
            Hyperledger Fabric Blockchain Visualizer
          </CardTitle>
          <CardDescription className="text-[#3781C2]">
            Real-time view of immutable blockchain records and current world state
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search and Filter */}
          <div className="flex gap-4">
            <div className="flex-1">
              <Label htmlFor="search" className="text-[#007CC3]">Search Blockchain</Label>
              <div className="flex gap-2">
                <Input
                  id="search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by batch ID, transaction ID, or content..."
                  className="border-[#007CC3]/30 focus:border-[#007CC3]"
                />
                <Button 
                  onClick={searchBlocks} 
                  disabled={isLoading}
                  className="bg-[#007CC3] hover:bg-[#3781C2]"
                >
                  {isLoading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <Search className="h-4 w-4" />
                  )}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={resetSearch}
                  className="border-[#007CC3] text-[#007CC3] hover:bg-[#007CC3] hover:text-white"
                >
                  Reset
                </Button>
              </div>
            </div>
          </div>

          {/* Blockchain Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-[#007CC3]/10 p-4 rounded-lg text-center border border-[#007CC3]/20">
              <div className="text-2xl font-bold text-[#007CC3]">{blocks.length}</div>
              <div className="text-sm text-[#3781C2]">Total Blocks</div>
            </div>
            <div className="bg-[#3781C2]/10 p-4 rounded-lg text-center border border-[#3781C2]/20">
              <div className="text-2xl font-bold text-[#3781C2]">
                {blocks.reduce((sum, block) => sum + block.transactionCount, 0)}
              </div>
              <div className="text-sm text-[#3781C2]">Total Transactions</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg text-center border border-green-200">
              <div className="text-2xl font-bold text-green-600">100%</div>
              <div className="text-sm text-green-700">Data Integrity</div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg text-center border border-purple-200">
              <div className="text-2xl font-bold text-purple-600">{worldState.length}</div>
              <div className="text-sm text-purple-700">World State Keys</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="blockchain" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 bg-[#007CC3]/10">
          <TabsTrigger value="blockchain" className="data-[state=active]:bg-[#007CC3] data-[state=active]:text-white">
            🔗 Blockchain View (Immutable Blocks)
          </TabsTrigger>
          <TabsTrigger value="worldstate" className="data-[state=active]:bg-[#007CC3] data-[state=active]:text-white">
            🌍 World State View (Current Values)
          </TabsTrigger>
        </TabsList>

        <TabsContent value="blockchain" className="space-y-4">
          {/* Blockchain Visualization */}
          <Card className="border-[#007CC3]/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[#007CC3]">
                <Blocks className="h-5 w-5" />
                Immutable Blockchain Ledger
              </CardTitle>
              <CardDescription>Chain of cryptographically linked blocks</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {blocks.map((block, index) => (
                  <div
                    key={block.blockNumber}
                    className="border border-[#007CC3]/20 rounded-lg p-4 bg-gradient-to-r from-blue-50/50 to-indigo-50/50 hover:shadow-lg transition-all duration-300 cursor-pointer"
                    onClick={() => setSelectedBlock(block)}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-[#007CC3] text-white rounded-lg flex items-center justify-center font-bold text-lg">
                          {block.blockNumber}
                        </div>
                        <div>
                          <h3 className="font-semibold text-[#007CC3]">
                            {block.blockNumber === 0 ? "Genesis Block" : `Block #${block.blockNumber}`}
                          </h3>
                          <p className="text-sm text-[#3781C2]">
                            {block.transactionCount} transaction{block.transactionCount !== 1 ? 's' : ''}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-600">{new Date(block.timestamp).toLocaleString()}</div>
                        <Badge variant="outline" className="mt-1 border-[#007CC3] text-[#007CC3]">
                          <Hash className="h-3 w-3 mr-1" />
                          {block.blockHash.substring(0, 8)}...
                        </Badge>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-[#007CC3]">Block Hash:</span>
                        <p className="text-gray-600 font-mono text-xs break-all bg-gray-50 p-1 rounded">
                          {block.blockHash}
                        </p>
                      </div>
                      <div>
                        <span className="font-medium text-[#007CC3]">Previous Hash:</span>
                        <p className="text-gray-600 font-mono text-xs break-all bg-gray-50 p-1 rounded">
                          {block.previousHash}
                        </p>
                      </div>
                      <div>
                        <span className="font-medium text-[#007CC3]">Merkle Root:</span>
                        <p className="text-gray-600 font-mono text-xs break-all bg-gray-50 p-1 rounded">
                          {block.merkleRoot}
                        </p>
                      </div>
                      <div>
                        <span className="font-medium text-[#007CC3]">Data Hash:</span>
                        <p className="text-gray-600 font-mono text-xs break-all bg-gray-50 p-1 rounded">
                          {block.dataHash}
                        </p>
                      </div>
                    </div>

                    {block.transactions.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {block.transactions.map((tx, txIndex) => (
                          <Badge key={txIndex} className={`${getTransactionTypeColor(tx.function)} text-white`}>
                            {tx.function}
                          </Badge>
                        ))}
                      </div>
                    )}

                    {/* Chain Link Visualization */}
                    {index < blocks.length - 1 && (
                      <div className="flex justify-center mt-4">
                        <div className="flex items-center gap-2 text-[#007CC3]">
                          <Link className="h-4 w-4" />
                          <span className="text-xs">Cryptographically Linked</span>
                          <Link className="h-4 w-4" />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Transaction Details */}
          {selectedBlock && (
            <Card className="border-[#007CC3]/20">
              <CardHeader>
                <CardTitle className="text-[#007CC3]">
                  {selectedBlock.blockNumber === 0 ? "Genesis Block" : `Block #${selectedBlock.blockNumber}`} - Transaction Details
                </CardTitle>
                <CardDescription>Detailed view of all transactions in this block</CardDescription>
              </CardHeader>
              <CardContent>
                {selectedBlock.transactions.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Blocks className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Genesis block contains no transactions</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {selectedBlock.transactions.map((tx, index) => (
                      <div key={index} className="border border-[#007CC3]/20 rounded-lg p-4 space-y-3 bg-gradient-to-r from-blue-50/30 to-indigo-50/30">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Badge className={`${getTransactionTypeColor(tx.function)} text-white`}>
                              {tx.function}
                            </Badge>
                            <h4 className="font-semibold text-[#007CC3]">Transaction #{index + 1}</h4>
                          </div>
                          <div className="text-sm text-gray-600">{new Date(tx.timestamp).toLocaleString()}</div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="font-medium text-[#007CC3]">Transaction ID:</span>
                            <p className="text-gray-600 font-mono bg-gray-50 p-1 rounded">{tx.txId}</p>
                          </div>
                          <div>
                            <span className="font-medium text-[#007CC3]">Chaincode:</span>
                            <p className="text-gray-600">{tx.chaincode}</p>
                          </div>
                          <div>
                            <span className="font-medium text-[#007CC3]">Endorser:</span>
                            <p className="text-gray-600">{tx.endorser}</p>
                          </div>
                          <div>
                            <span className="font-medium text-[#007CC3]">Creator:</span>
                            <p className="text-gray-600">{tx.creator}</p>
                          </div>
                        </div>

                        <div>
                          <span className="font-medium text-[#007CC3]">Function Arguments:</span>
                          <div className="bg-gray-50 p-3 rounded mt-1 border border-[#007CC3]/10">
                            <pre className="text-xs text-gray-700">{JSON.stringify(tx.args, null, 2)}</pre>
                          </div>
                        </div>

                        <div>
                          <span className="font-medium text-[#007CC3]">Payload Data:</span>
                          <div className="bg-gray-50 p-3 rounded mt-1 border border-[#007CC3]/10">
                            <pre className="text-xs text-gray-700">{JSON.stringify(tx.payload, null, 2)}</pre>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 text-sm">
                          <span className="font-medium text-[#007CC3]">Validation Code:</span>
                          <Badge className={tx.validationCode === 0 ? "bg-green-500" : "bg-red-500"}>
                            {tx.validationCode === 0 ? "VALID" : "INVALID"}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="worldstate" className="space-y-4">
          {/* World State View */}
          <Card className="border-[#007CC3]/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[#007CC3]">
                <Database className="h-5 w-5" />
                Current World State (Key-Value Store)
              </CardTitle>
              <CardDescription>Latest values for all keys in the ledger</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {worldState.map((entry, index) => (
                  <div key={index} className="border border-[#007CC3]/20 rounded-lg p-4 bg-gradient-to-r from-blue-50/30 to-indigo-50/30">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className="border-[#007CC3] text-[#007CC3]">
                          Key: {entry.key}
                        </Badge>
                        <h4 className="font-semibold text-[#007CC3]">{entry.value.drugName}</h4>
                      </div>
                      <Badge className={`${getStatusColor(entry.value.status)} text-white`}>
                        {entry.value.status.toUpperCase()}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-[#007CC3]">Batch ID:</span>
                        <p className="text-[#3781C2]">{entry.value.batchId}</p>
                      </div>
                      <div>
                        <span className="font-medium text-[#007CC3]">Manufacturer:</span>
                        <p className="text-[#3781C2]">{entry.value.manufacturer}</p>
                      </div>
                      <div>
                        <span className="font-medium text-[#007CC3]">Quantity:</span>
                        <p className="text-[#3781C2]">{entry.value.quantity} units</p>
                      </div>
                      <div>
                        <span className="font-medium text-[#007CC3]">Current Location:</span>
                        <p className="text-[#3781C2]">{entry.value.currentLocation || "Unknown"}</p>
                      </div>
                      <div>
                        <span className="font-medium text-[#007CC3]">Last Updated:</span>
                        <p className="text-[#3781C2]">{new Date(entry.value.timestamp).toLocaleString()}</p>
                      </div>
                      <div>
                        <span className="font-medium text-[#007CC3]">Status:</span>
                        <p className="text-[#3781C2]">{entry.value.status}</p>
                      </div>
                    </div>

                    <div className="mt-3">
                      <span className="font-medium text-[#007CC3]">JSON Value:</span>
                      <div className="bg-gray-50 p-3 rounded mt-1 border border-[#007CC3]/10">
                        <pre className="text-xs text-gray-700">{JSON.stringify(entry.value, null, 2)}</pre>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Network Information */}
      <Card className="bg-gradient-to-r from-[#007CC3]/5 to-[#3781C2]/5 border-[#007CC3]/20">
        <CardHeader>
          <CardTitle className="text-[#007CC3]">Hyperledger Fabric Network Information</CardTitle>
          <CardDescription className="text-[#3781C2]">Current network status and configuration</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-lg border border-[#007CC3]/20">
              <h4 className="font-medium mb-2 text-[#007CC3]">Network Peers</h4>
              <ul className="text-sm text-[#3781C2] space-y-1">
                <li>• peer0.manufacturer.medchain.com</li>
                <li>• peer0.distributor.medchain.com</li>
                <li>• peer0.hospital.medchain.com</li>
                <li>• peer0.regulator.medchain.com</li>
              </ul>
            </div>

            <div className="bg-white p-4 rounded-lg border border-[#007CC3]/20">
              <h4 className="font-medium mb-2 text-[#007CC3]">Chaincode Deployed</h4>
              <ul className="text-sm text-[#3781C2] space-y-1">
                <li>• medchain-cc v1.0</li>
                <li>• patient-verification v1.0</li>
                <li>• audit-trail v1.0</li>
                <li>• inventory-management v1.0</li>
              </ul>
            </div>

            <div className="bg-white p-4 rounded-lg border border-[#007CC3]/20">
              <h4 className="font-medium mb-2 text-[#007CC3]">Consensus</h4>
              <ul className="text-sm text-[#3781C2] space-y-1">
                <li>• Algorithm: RAFT</li>
                <li>• Block Time: ~2 seconds</li>
                <li>• Endorsement Policy: 2 of 4</li>
                <li>• TLS Enabled: Yes</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
