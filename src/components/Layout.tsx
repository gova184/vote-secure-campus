
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Shield, User, Vote } from "lucide-react";

interface LayoutProps {
  children: React.ReactNode;
  showNav?: boolean;
}

const Layout = ({ children, showNav = true }: LayoutProps) => {
  const navigate = useNavigate();
  const { isAuthenticated, currentUser, logout } = useAuth();

  return (
    <div className="min-h-screen bg-vote-light flex flex-col">
      {showNav && (
        <header className="bg-white shadow-md py-4">
          <div className="container mx-auto px-4 flex justify-between items-center">
            <div className="flex items-center space-x-2" onClick={() => navigate("/")} role="button">
              <Shield className="h-8 w-8 text-vote-primary" />
              <span className="text-2xl font-bold bg-gradient-to-r from-vote-primary to-vote-secondary bg-clip-text text-transparent">
                VoteSecure
              </span>
            </div>

            <nav className="hidden md:flex items-center space-x-8">
              <Button
                variant="link"
                onClick={() => navigate("/")}
                className="text-gray-700 hover:text-vote-primary"
              >
                Home
              </Button>
              
              {isAuthenticated && !currentUser?.hasVoted && (
                <Button
                  variant="link"
                  onClick={() => navigate("/voting")}
                  className="text-gray-700 hover:text-vote-primary"
                >
                  Vote
                </Button>
              )}
              
              <Button
                variant="link"
                onClick={() => navigate("/results")}
                className="text-gray-700 hover:text-vote-primary"
              >
                Results
              </Button>
              
              {isAuthenticated && currentUser?.isAdmin && (
                <Button
                  variant="link"
                  onClick={() => navigate("/admin")}
                  className="text-gray-700 hover:text-vote-primary"
                >
                  Admin
                </Button>
              )}
            </nav>

            <div className="flex items-center space-x-4">
              {isAuthenticated ? (
                <div className="flex items-center space-x-4">
                  <div className="hidden md:flex items-center space-x-2">
                    <User className="h-5 w-5 text-vote-primary" />
                    <span className="text-sm font-medium">{currentUser?.name}</span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      logout();
                      navigate("/");
                    }}
                    className="border-vote-primary text-vote-primary hover:bg-vote-primary hover:text-white"
                  >
                    Logout
                  </Button>
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate("/login")}
                    className="border-vote-primary text-vote-primary hover:bg-vote-primary hover:text-white"
                  >
                    Login
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => navigate("/register")}
                    className="bg-vote-primary hover:bg-vote-secondary text-white"
                  >
                    Register
                  </Button>
                </div>
              )}
            </div>
          </div>
        </header>
      )}

      <main className="flex-grow">{children}</main>

      <footer className="bg-vote-dark text-white py-6">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <Vote className="h-6 w-6 text-vote-accent" />
              <span className="text-xl font-bold">VoteSecure Campus</span>
            </div>
            <div className="text-sm text-gray-400">
              © {new Date().getFullYear()} VoteSecure. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
