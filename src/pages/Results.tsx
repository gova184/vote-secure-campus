
import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import Layout from "@/components/Layout";
import ResultsChart from "@/components/ResultsChart";
import BlockchainExplorer from "@/components/BlockchainExplorer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useBlockchain } from "@/context/BlockchainContext";
import { toast } from "sonner";

const Results = () => {
  const { getResults, getElection, setCurrentElection } = useBlockchain();
  const { electionId } = useParams<{ electionId?: string }>();
  
  useEffect(() => {
    if (electionId) {
      const election = getElection(electionId);
      if (election) {
        setCurrentElection(electionId);
      } else {
        toast.error("Election not found");
      }
    }
  }, [electionId, getElection, setCurrentElection]);
  
  const results = getResults(electionId);
  const election = electionId ? getElection(electionId) : undefined;

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl font-bold mb-2 text-vote-dark">
            {election ? election.title : "Election Results"}
          </h1>
          {election?.description && (
            <p className="text-gray-600 mb-8">{election.description}</p>
          )}
          
          <Tabs defaultValue="results" className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="results">Results</TabsTrigger>
              <TabsTrigger value="blockchain">Blockchain Explorer</TabsTrigger>
            </TabsList>
            
            <TabsContent value="results">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card>
                  <CardHeader>
                    <CardTitle>Vote Distribution</CardTitle>
                    <CardDescription>
                      Visual representation of votes received by each candidate
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResultsChart results={results} />
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Candidate Rankings</CardTitle>
                    <CardDescription>
                      Candidates ranked by number of votes received
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {results.map((candidate, index) => (
                        <div key={candidate.id} className="flex items-center">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-4 ${
                            index === 0 ? "bg-yellow-100 text-yellow-800 border-2 border-yellow-400" :
                            index === 1 ? "bg-gray-100 text-gray-800 border-2 border-gray-400" :
                            index === 2 ? "bg-amber-100 text-amber-800 border-2 border-amber-400" :
                            "bg-gray-100 text-gray-800"
                          }`}>
                            {index + 1}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-center mb-1">
                              <p className="font-medium truncate">{candidate.name}</p>
                              <span className="font-bold text-vote-primary">{candidate.votes} votes</span>
                            </div>
                            
                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                              <div 
                                className="bg-vote-primary h-2.5 rounded-full" 
                                style={{ 
                                  width: `${results[0].votes > 0 ? (candidate.votes / results[0].votes) * 100 : 0}%` 
                                }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="blockchain">
              <Card>
                <CardHeader>
                  <CardTitle>Blockchain Explorer</CardTitle>
                  <CardDescription>
                    Explore the immutable record of all votes in the blockchain
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <BlockchainExplorer />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
};

export default Results;
