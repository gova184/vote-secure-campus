
import React, { useState } from "react";
import Layout from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Check, Vote } from "lucide-react";
import { useBlockchain } from "@/context/BlockchainContext";
import ResultsChart from "@/components/ResultsChart";
import CandidateCard from "@/components/CandidateCard";
import BlockchainExplorer from "@/components/BlockchainExplorer";

const Results = () => {
  const { getResults, blockchain } = useBlockchain();
  const [activeTab, setActiveTab] = useState<string>("results");
  
  const results = getResults();
  const totalVotes = results.reduce((sum, candidate) => sum + candidate.votes, 0);
  const winningCandidate = results[0];
  
  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-vote-dark">Election Results</h1>
            <p className="text-gray-600">Total votes cast: {totalVotes}</p>
          </div>
          
          <Card className="bg-vote-light border-none p-3">
            <div className="flex items-center space-x-2">
              <div className="h-3 w-3 rounded-full bg-green-500"></div>
              <span className="text-sm">Results are secured by blockchain technology</span>
            </div>
          </Card>
        </div>
        
        <Tabs defaultValue="results" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-2 mb-8">
            <TabsTrigger value="results">Results Dashboard</TabsTrigger>
            <TabsTrigger value="blockchain">Blockchain Explorer</TabsTrigger>
          </TabsList>
          
          <TabsContent value="results">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Vote Distribution</CardTitle>
                    <CardDescription>
                      Visual representation of votes received by each candidate
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent>
                    <ResultsChart candidates={results} />
                  </CardContent>
                </Card>
              </div>
              
              <div>
                {results.length > 0 && (
                  <Card className="h-full">
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Check className="h-5 w-5 text-green-500 mr-2" />
                        Leading Candidate
                      </CardTitle>
                      <CardDescription>
                        Currently leading with {winningCandidate.votes} votes
                      </CardDescription>
                    </CardHeader>
                    
                    <CardContent>
                      <CandidateCard
                        {...winningCandidate}
                        showVotes={true}
                      />
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
            
            <div className="mt-8">
              <Card>
                <CardHeader>
                  <CardTitle>All Candidates</CardTitle>
                  <CardDescription>
                    Detailed results for all candidates in this election
                  </CardDescription>
                </CardHeader>
                
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {results.map((candidate) => (
                      <CandidateCard
                        key={candidate.id}
                        {...candidate}
                        showVotes={true}
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="blockchain">
            <BlockchainExplorer />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Results;
