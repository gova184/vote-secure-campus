
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import Layout from "@/components/Layout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Check } from "lucide-react";
import { toast } from "sonner";

const Register = () => {
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [studentId, setStudentId] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  
  const { register, isLoading } = useAuth();
  const navigate = useNavigate();

  const validateForm = () => {
    if (!name || !email || !studentId || !password || !confirmPassword) {
      toast.error("Please fill out all fields");
      return false;
    }
    
    if (!email.includes('@')) {
      toast.error("Please enter a valid email address");
      return false;
    }
    
    if (password !== confirmPassword) {
      toast.error("Passwords don't match");
      return false;
    }
    
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    const success = await register({
      name,
      email,
      studentId,
      password
    });
    
    if (success) {
      navigate("/");
    }
  };

  return (
    <Layout>
      <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-vote-primary bg-opacity-10 flex items-center justify-center">
              <User className="h-6 w-6 text-vote-primary" />
            </div>
            <CardTitle className="text-2xl font-bold">Register for VoteSecure</CardTitle>
            <CardDescription>
              Create your account to participate in the election
            </CardDescription>
          </CardHeader>
          
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium text-gray-700">
                  Full Name
                </label>
                <Input
                  id="name"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoComplete="name"
                  className="w-full"
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-gray-700">
                  Academic Email
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your.name@university.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  className="w-full"
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="studentId" className="text-sm font-medium text-gray-700">
                  Student ID
                </label>
                <Input
                  id="studentId"
                  placeholder="S12345"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  className="w-full"
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium text-gray-700">
                  Password
                </label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                  className="w-full"
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
                  Confirm Password
                </label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  autoComplete="new-password"
                  className="w-full"
                />
              </div>
              
              <div className="flex items-center">
                <div className="h-5 w-5 rounded border border-vote-primary flex items-center justify-center mr-2 bg-vote-primary">
                  <Check className="h-3 w-3 text-white" />
                </div>
                <label htmlFor="terms" className="text-sm text-gray-500">
                  I agree to the <a href="#" className="text-vote-primary hover:text-vote-secondary">Terms of Service</a> and <a href="#" className="text-vote-primary hover:text-vote-secondary">Privacy Policy</a>
                </label>
              </div>
            </CardContent>
            
            <CardFooter className="flex flex-col space-y-4">
              <Button
                type="submit"
                className="w-full bg-vote-primary hover:bg-vote-secondary text-white"
                disabled={isLoading}
              >
                {isLoading ? "Creating Account..." : "Register"}
              </Button>
              
              <div className="text-sm text-center">
                Already have an account?{" "}
                <Link to="/login" className="font-medium text-vote-primary hover:text-vote-secondary">
                  Login instead
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
    </Layout>
  );
};

export default Register;
