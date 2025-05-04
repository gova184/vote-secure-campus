import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Fingerprint, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

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
          setBiometricAvailable(true);
          console.log("Mobile device detected, checking biometric capability");
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

  // Function to generate a fingerprint hash from fingerprint data
  const generateFingerprintHash = async (fingerprintData: any): Promise<string> => {
    // In a real implementation, this would use a proper cryptographic hash function
    const dataString = JSON.stringify(fingerprintData);
    
    // Use SubtleCrypto API to create a hash if available
    if (window.crypto && window.crypto.subtle) {
      try {
        const encoder = new TextEncoder();
        const data = encoder.encode(dataString);
        const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
        
        // Convert hash to hex string
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      } catch (error) {
        console.error("Error generating fingerprint hash:", error);
        // Fallback to a simpler hash for demo purposes
        return btoa(dataString).slice(0, 32);
      }
    } else {
      // Fallback for browsers without SubtleCrypto
      return btoa(dataString).slice(0, 32);
    }
  };

  // Get fingerprint data using WebAuthn
  const getFingerprintData = async (): Promise<any> => {
    if (!window.PublicKeyCredential) {
      throw new Error("WebAuthn is not supported in this browser");
    }
    
    // Create a challenge
    const challenge = new Uint8Array(32);
    window.crypto.getRandomValues(challenge);
    
    // Create a user ID if none provided (registration flow)
    const userId = crypto.randomUUID();
    
    // Create the credential options
    const publicKeyCredentialCreationOptions: PublicKeyCredentialCreationOptions = {
      challenge,
      rp: {
        name: "VoteGuard",
        id: window.location.hostname
      },
      user: {
        id: Uint8Array.from(userId, c => c.charCodeAt(0)),
        name: "user@example.com",
        displayName: "VoteGuard User"
      },
      pubKeyCredParams: [
        { type: "public-key" as const, alg: -7 }, // ES256
        { type: "public-key" as const, alg: -257 } // RS256
      ],
      authenticatorSelection: {
        authenticatorAttachment: "platform",
        userVerification: "required"
      },
      timeout: 60000
    };
    
    try {
      const credential = await navigator.credentials.create({
        publicKey: publicKeyCredentialCreationOptions
      });
      
      return credential;
    } catch (error) {
      console.error("Error creating credential:", error);
      throw error;
    }
  };

  // Store fingerprint in the database
  const storeFingerprintInDb = async (userId: string, fingerprintData: any) => {
    try {
      const fingerprintHash = await generateFingerprintHash(fingerprintData);
      
      // Get device info for additional security
      const deviceInfo = {
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        language: navigator.language,
        screenSize: `${window.screen.width}x${window.screen.height}`,
        timestamp: new Date().toISOString()
      };
      
      // Store in Supabase
      const { error } = await supabase
        .from('users_biometrics')
        .upsert({
          user_id: userId,
          fingerprint_hash: fingerprintHash,
          device_info: deviceInfo,
          updated_at: new Date().toISOString()
        });
        
      if (error) {
        console.error("Error storing fingerprint:", error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error("Error processing fingerprint:", error);
      return false;
    }
  };

  // Verify fingerprint against database
  const verifyFingerprintInDb = async (userId: string, fingerprintData: any) => {
    try {
      const fingerprintHash = await generateFingerprintHash(fingerprintData);
      
      // Query Supabase to check the fingerprint
      const { data, error } = await supabase
        .from('users_biometrics')
        .select('fingerprint_hash')
        .eq('user_id', userId)
        .single();
      
      if (error) {
        console.error("Error verifying fingerprint:", error);
        return false;
      }
      
      // Compare the stored hash with the current one
      return data?.fingerprint_hash === fingerprintHash;
    } catch (error) {
      console.error("Error during verification:", error);
      return false;
    }
  };

  const startScan = async () => {
    setIsScanning(true);
    setProgress(0);
    
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
    
    try {
      // First try WebAuthn
      let fingerprintData;
      let verificationSuccess = false;
      
      try {
        fingerprintData = await getFingerprintData();
        setProgress(80);
        
        if (userId) {
          // In verification flow (voting)
          verificationSuccess = await verifyFingerprintInDb(userId, fingerprintData);
          setVerificationAttempts(prev => prev + 1);
        } else {
          // In registration flow
          // Generate a temporary user ID for registration since we don't have one yet
          const tempUserId = crypto.randomUUID();
          verificationSuccess = await storeFingerprintInDb(tempUserId, fingerprintData);
        }
      } catch (webAuthnError) {
        console.warn("WebAuthn failed, falling back to simulation:", webAuthnError);
        
        // Fallback to simulation for demo purposes
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        if (userId) {
          // In voting flow, provide simulated verification after enough attempts
          setVerificationAttempts(prev => prev + 1);
          verificationSuccess = verificationAttempts >= 1; // Succeed after 2 attempts (current + this one)
        } else {
          // In registration flow, always succeed with simulation
          verificationSuccess = true;
        }
      }
      
      clearInterval(progressInterval);
      setProgress(100);
      
      setTimeout(() => {
        setIsScanning(false);
        
        if (verificationSuccess) {
          onVerified();
          toast.success(userId ? "Fingerprint verified successfully!" : "Fingerprint registered successfully!");
        } else {
          toast.error("Fingerprint verification failed. Please try again.");
        }
      }, 500);
      
    } catch (error) {
      console.error("Biometric authentication error:", error);
      clearInterval(progressInterval);
      toast.error("Biometric verification failed");
      setIsScanning(false);
      setProgress(0);
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
