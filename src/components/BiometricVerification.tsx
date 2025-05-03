
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Fingerprint, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface BiometricVerificationProps {
  onVerified: () => void;
  onCancel: () => void;
  userId?: string;
}

const BiometricVerification = ({ onVerified, onCancel, userId }: BiometricVerificationProps) => {
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [biometricAvailable, setBiometricAvailable] = useState<boolean | null>(null);
  const [verificationAttempts, setVerificationAttempts] = useState<number>(0);
  
  // Check if biometric authentication is available
  useEffect(() => {
    const checkBiometricAvailability = async () => {
      try {
        // Check if running in a mobile browser
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        
        if (isMobile) {
          // For mobile devices, we'll assume capabilities are available
          // as we'll use a native bridge or simulate for demo purposes
          setBiometricAvailable(true);
          console.log("Mobile device detected, assuming biometric capability");
        } else if (window.PublicKeyCredential && 
                 PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable) {
          const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
          setBiometricAvailable(available);
          
          if (!available) {
            console.log("Platform authenticator is not available on this device");
          }
        } else {
          setBiometricAvailable(false);
          console.log("WebAuthn is not supported in this browser");
        }
      } catch (error) {
        console.error("Error checking biometric availability:", error);
        setBiometricAvailable(false);
      }
    };
    
    checkBiometricAvailability();
  }, []);

  const verifyFingerprintInDb = async (userId: string, fingerprintData: any) => {
    // In a real app, this would be an API call to verify the fingerprint
    // For demo, we'll simulate checking against a database
    
    // Mock verification - in real world, this would verify the fingerprint data against stored value
    return new Promise<boolean>((resolve) => {
      setTimeout(() => {
        // For testing purposes, we'll allow a verification to succeed after 2 attempts
        if (verificationAttempts >= 2) {
          resolve(true);
        } else {
          resolve(false);
        }
      }, 800);
    });
  };

  const startScan = async () => {
    setIsScanning(true);
    setProgress(0);
    
    // Check if this is a mobile device
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    // For mobile devices, we'll use a simulated approach since WebAuthn might not be fully supported
    if (isMobile) {
      try {
        // Set up progress animation
        const progressInterval = setInterval(() => {
          setProgress(prev => {
            if (prev >= 100) {
              clearInterval(progressInterval);
              return 100;
            }
            return prev + 10;
          });
        }, 300);
        
        // Simulate the native fingerprint scan
        // In a real app, this would connect to the device's native fingerprint API
        
        // For demo purposes, after the progress reaches 100%, we'll simulate success
        setTimeout(() => {
          clearInterval(progressInterval);
          setProgress(100);
          
          // For demo: verification succeeds right away on mobile
          setTimeout(() => {
            setIsScanning(false);
            onVerified();
            toast.success(userId ? "Fingerprint verified successfully!" : "Fingerprint registered successfully!");
          }, 500);
        }, 3000);
      } catch (error) {
        console.error("Mobile biometric simulation error:", error);
        toast.error("Fingerprint verification failed. Please try again.");
        setIsScanning(false);
        setProgress(0);
      }
      
    } else {
      // Desktop WebAuthn approach
      try {
        // Set up progress animation
        const progressInterval = setInterval(() => {
          setProgress(prev => {
            if (prev >= 60) {
              clearInterval(progressInterval);
              return 60;
            }
            return prev + 10;
          });
        }, 300);
        
        // Create a challenge
        const challenge = new Uint8Array(32);
        window.crypto.getRandomValues(challenge);
        
        // Create the credential options
        const publicKeyCredentialRequestOptions = {
          challenge,
          timeout: 60000,
          userVerification: 'required' as UserVerificationRequirement,
          rpId: window.location.hostname
        };
        
        try {
          // Request the credential
          const assertion = await navigator.credentials.get({
            publicKey: publicKeyCredentialRequestOptions
          });
          
          // Clear the progress interval
          clearInterval(progressInterval);
          
          // We have the biometric verification from the device
          // Now we need to check if it matches the one in the database
          setProgress(80);
          
          let verificationSuccess = false;
          
          if (userId) {
            // In a real app, we would send the assertion to the server to verify
            verificationSuccess = await verifyFingerprintInDb(userId, assertion);
            setVerificationAttempts(prev => prev + 1);
          } else {
            // If no userId (registration flow), we assume it's a valid registration
            verificationSuccess = true;
          }
          
          setProgress(100);
          setTimeout(() => {
            setIsScanning(false);
            
            if (verificationSuccess) {
              onVerified();
              toast.success("Biometric verification successful!");
            } else {
              toast.error("Fingerprint verification failed. Please try again.");
            }
          }, 500);
        } catch (error) {
          // WebAuthn failed, fall back to simulation
          clearInterval(progressInterval);
          
          console.error("Biometric authentication error:", error);
          toast.info("Using simulated biometric verification for demo purposes");
          
          // Fallback to simulation
          const fallbackInterval = setInterval(() => {
            setProgress((prev) => {
              if (prev >= 100) {
                clearInterval(fallbackInterval);
                return 100;
              }
              return prev + 10;
            });
          }, 200);
          
          setTimeout(() => {
            setIsScanning(false);
            
            // For demo: after 2 attempts, verification succeeds
            if (userId) {
              // In voting flow, check verification attempts
              setVerificationAttempts(prev => prev + 1);
              if (verificationAttempts >= 2) {
                onVerified();
                toast.success("Fingerprint verified successfully!");
              } else {
                toast.error("Fingerprint verification failed. Please try again.");
              }
            } else {
              // In registration flow, verify succeeds
              onVerified();
              toast.success("Fingerprint registered successfully!");
            }
          }, 2000);
        }
        
      } catch (error) {
        console.error("Biometric authentication error:", error);
        toast.error("Biometric verification failed");
        setIsScanning(false);
        setProgress(0);
      }
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto border-0 shadow-lg overflow-hidden bg-gradient-to-br from-white to-vote-light">
      <CardHeader className="bg-white border-b">
        <CardTitle className="text-center text-vote-primary flex items-center justify-center">
          <Fingerprint className="mr-2 h-5 w-5 text-vote-primary" />
          Biometric Verification
        </CardTitle>
        <CardDescription className="text-center">
          {biometricAvailable === false 
            ? "Your device doesn't support biometric verification. This is a simulation."
            : userId ? "Place your finger on the sensor to verify your identity" : "Register your fingerprint for secure voting"}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="flex flex-col items-center p-8">
        <div 
          className={`w-36 h-36 rounded-full border-4 ${
            isScanning ? 'border-vote-primary animate-pulse-slow' : 'border-gray-300'
          } flex items-center justify-center mb-6 transition-all relative overflow-hidden`}
        >
          {isScanning && progress >= 100 && (
            <div className="absolute inset-0 bg-vote-primary bg-opacity-20 flex items-center justify-center">
              <CheckCircle2 className="h-12 w-12 text-vote-primary" />
            </div>
          )}
          
          {isScanning && progress < 100 && (
            <div className="absolute inset-0 bg-vote-accent bg-opacity-20 flex flex-col items-center justify-center">
              <span className="text-xs font-medium text-vote-primary mb-2">Scanning...</span>
              <div className="relative w-16 h-16">
                <div className="absolute top-0 left-0 w-full h-full border-4 border-vote-primary border-opacity-25 rounded-full"></div>
                <div 
                  className="absolute top-0 left-0 w-full h-full border-4 border-vote-primary rounded-full border-t-transparent"
                  style={{ 
                    transform: `rotate(${progress * 3.6}deg)`,
                    transition: 'transform 0.3s ease' 
                  }}
                ></div>
              </div>
            </div>
          )}
          
          <Fingerprint 
            className={`h-16 w-16 ${
              isScanning ? 'text-vote-primary' : 'text-gray-400'
            } transition-colors`} 
          />
        </div>
        
        {isScanning && (
          <div className="w-full max-w-xs mb-4">
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-vote-primary to-vote-secondary transition-all duration-300 rounded-full"
                style={{ width: `${progress}%` }} 
              />
            </div>
            <p className="text-sm text-center mt-2 text-gray-500">
              {progress < 80 ? 'Scanning...' : progress < 100 ? 'Verifying...' : 'Complete!'}
            </p>
          </div>
        )}
        
        {verificationAttempts > 0 && verificationAttempts < 3 && !isScanning && (
          <div className="flex items-center bg-red-50 text-red-700 p-3 rounded-lg mb-4">
            <AlertCircle className="h-5 w-5 mr-2 text-red-500" />
            <p className="text-sm">Verification failed. Please try again.</p>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="flex justify-center space-x-4 bg-white border-t p-4">
        {!isScanning ? (
          <>
            <Button 
              variant="outline" 
              onClick={onCancel}
              className="border-vote-primary text-vote-primary hover:bg-vote-primary hover:text-white"
            >
              Cancel
            </Button>
            <Button 
              onClick={startScan}
              className="bg-gradient-to-r from-vote-primary to-vote-secondary hover:opacity-90 text-white"
            >
              {userId ? "Verify Fingerprint" : "Register Fingerprint"}
            </Button>
          </>
        ) : (
          <Button 
            variant="outline" 
            onClick={() => {
              setIsScanning(false);
              toast.error("Scan cancelled");
            }}
            className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
          >
            Cancel Scan
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default BiometricVerification;
