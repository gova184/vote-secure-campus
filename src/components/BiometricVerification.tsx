
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Fingerprint } from "lucide-react";
import { toast } from "sonner";

interface BiometricVerificationProps {
  onVerified: () => void;
  onCancel: () => void;
}

const BiometricVerification = ({ onVerified, onCancel }: BiometricVerificationProps) => {
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [biometricAvailable, setBiometricAvailable] = useState<boolean | null>(null);
  
  // Check if biometric authentication is available
  useEffect(() => {
    const checkBiometricAvailability = async () => {
      try {
        if (window.PublicKeyCredential && 
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

  const startScan = async () => {
    setIsScanning(true);
    setProgress(0);
    
    // If real biometric authentication is available, use it
    if (biometricAvailable) {
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
        
        // Request the credential
        const assertion = await navigator.credentials.get({
          publicKey: publicKeyCredentialRequestOptions
        });
        
        // Clear the progress interval
        clearInterval(progressInterval);
        
        // If we got here, the authentication was successful
        setProgress(100);
        setTimeout(() => {
          setIsScanning(false);
          onVerified();
          toast.success("Biometric verification successful!");
        }, 500);
        
      } catch (error) {
        console.error("Biometric authentication error:", error);
        toast.error("Biometric verification failed");
        setIsScanning(false);
        setProgress(0);
      }
    } else {
      // Fall back to the simulation for devices without biometric hardware
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            setTimeout(() => {
              setIsScanning(false);
              onVerified();
              toast.success("Fingerprint verified successfully!");
            }, 500);
            return 100;
          }
          return prev + 10;
        });
      }, 300);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-center text-vote-primary">Biometric Verification</CardTitle>
        <CardDescription className="text-center">
          {biometricAvailable === false 
            ? "Your device doesn't support biometric verification. This is a simulation."
            : "Place your finger on the sensor to verify your identity"}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="flex flex-col items-center">
        <div 
          className={`w-32 h-32 rounded-full border-4 ${
            isScanning ? 'border-vote-primary animate-pulse-slow' : 'border-gray-300'
          } flex items-center justify-center mb-6 transition-all`}
        >
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
                className="h-full bg-vote-primary transition-all duration-300 rounded-full"
                style={{ width: `${progress}%` }} 
              />
            </div>
            <p className="text-sm text-center mt-2 text-gray-500">
              {progress < 100 ? 'Scanning...' : 'Verifying...'}
            </p>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="flex justify-center space-x-4">
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
              className="bg-vote-primary hover:bg-vote-secondary text-white"
            >
              Start Scan
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
