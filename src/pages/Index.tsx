
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Shield, Vote, Fingerprint, Lock } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const Index = () => {
  const navigate = useNavigate();
  const { isAuthenticated, currentUser } = useAuth();

  return (
    <Layout>
      {/* Hero Section */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-vote-light to-white">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-vote-primary to-vote-secondary bg-clip-text text-transparent">
            Secure. Transparent. Verifiable.
          </h1>
          <p className="text-lg md:text-xl text-gray-700 max-w-3xl mx-auto mb-12">
            Welcome to VoteSecure Campus, the secure digital voting platform for your college elections.
            Powered by blockchain technology and biometric authentication.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-12">
            {isAuthenticated ? (
              <>
                {!currentUser?.hasVoted ? (
                  <Button 
                    size="lg" 
                    onClick={() => navigate("/voting")}
                    className="bg-vote-primary hover:bg-vote-secondary text-white"
                  >
                    <Vote className="mr-2 h-5 w-5" />
                    Cast Your Vote
                  </Button>
                ) : (
                  <Button 
                    size="lg" 
                    onClick={() => navigate("/results")}
                    className="bg-vote-primary hover:bg-vote-secondary text-white"
                  >
                    View Election Results
                  </Button>
                )}
              </>
            ) : (
              <>
                <Button 
                  size="lg" 
                  onClick={() => navigate("/register")}
                  className="bg-vote-primary hover:bg-vote-secondary text-white"
                >
                  Register Now
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  onClick={() => navigate("/login")}
                  className="border-vote-primary text-vote-primary hover:bg-vote-primary hover:text-white"
                >
                  Login
                </Button>
              </>
            )}
          </div>
          
          <div className="relative w-full max-w-4xl mx-auto">
            <div className="bg-white rounded-xl shadow-xl overflow-hidden border border-gray-100">
              <img 
                src="/placeholder.svg" 
                alt="Voting Platform Interface"
                className="w-full h-auto"
              />
              <div className="absolute inset-0 bg-vote-primary bg-opacity-10 flex items-center justify-center">
                <div className="bg-white bg-opacity-90 p-6 rounded-lg max-w-md text-center">
                  <h3 className="text-xl font-bold text-vote-primary mb-2">
                    Demo Version
                  </h3>
                  <p className="text-gray-700">
                    You can explore the app using these demo accounts:
                  </p>
                  <div className="mt-3 text-left text-sm space-y-1">
                    <p><strong>Admin:</strong> admin@university.edu</p>
                    <p><strong>Student:</strong> student@university.edu</p>
                    <p><strong>Password:</strong> (any password will work)</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-vote-light">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">
            How It Works
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-vote-primary bg-opacity-10 mb-6">
                <Fingerprint className="h-8 w-8 text-vote-primary" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-vote-dark">Biometric Verification</h3>
              <p className="text-gray-600">
                Secure authentication using fingerprint technology ensures that only eligible students can vote, and each student votes only once.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-vote-primary bg-opacity-10 mb-6">
                <Lock className="h-8 w-8 text-vote-primary" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-vote-dark">Blockchain Powered</h3>
              <p className="text-gray-600">
                Every vote is recorded on an immutable blockchain, ensuring vote integrity and creating a transparent, tamper-proof record of the election.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-vote-primary bg-opacity-10 mb-6">
                <Shield className="h-8 w-8 text-vote-primary" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-vote-dark">Total Transparency</h3>
              <p className="text-gray-600">
                Real-time results are publicly available, and the entire voting process can be audited through our blockchain explorer.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-vote-dark text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Transform Campus Elections?
          </h2>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto mb-8">
            Join the digital voting revolution and experience the most secure, transparent, and efficient election process.
          </p>
          <Button 
            size="lg" 
            onClick={() => navigate(isAuthenticated ? "/voting" : "/register")}
            className="bg-vote-primary hover:bg-vote-secondary text-white"
          >
            {isAuthenticated ? "Go to Voting" : "Get Started Now"}
          </Button>
        </div>
      </section>
    </Layout>
  );
};

export default Index;
