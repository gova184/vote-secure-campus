
import React, { createContext, useState, useContext, useEffect } from 'react';
import { toast } from 'sonner';

interface Candidate {
  id: string;
  name: string;
  party: string;
  position: string;
  image: string;
  votes: number;
}

interface Block {
  id: string;
  timestamp: number;
  voter: string;
  candidate: string;
  previousHash: string;
  hash: string;
}

interface BlockchainContextType {
  candidates: Candidate[];
  blockchain: Block[];
  isLoading: boolean;
  castVote: (candidateId: string, voterId: string) => Promise<boolean>;
  getResults: () => Candidate[];
  addCandidate: (candidate: Omit<Candidate, 'id' | 'votes'>) => Promise<boolean>;
}

const BlockchainContext = createContext<BlockchainContextType | undefined>(undefined);

// Mock candidates for demo
const initialCandidates: Candidate[] = [
  {
    id: '1',
    name: 'Alex Johnson',
    party: 'Student Progress Party',
    position: 'Student Body President',
    image: '/placeholder.svg',
    votes: 42
  },
  {
    id: '2',
    name: 'Maria Rodriguez',
    party: 'Campus Forward Coalition',
    position: 'Student Body President',
    image: '/placeholder.svg',
    votes: 36
  },
  {
    id: '3',
    name: 'David Lee',
    party: 'Academic Excellence Union',
    position: 'Student Body President',
    image: '/placeholder.svg',
    votes: 28
  }
];

// Mock blockchain for demo
const initialBlockchain: Block[] = [
  {
    id: '0',
    timestamp: Date.now() - 86400000,
    voter: 'GENESIS',
    candidate: 'GENESIS',
    previousHash: '0',
    hash: '000000'
  }
];

// Simple hash function for demo
const hashBlock = (block: Omit<Block, 'hash'>): string => {
  const blockString = JSON.stringify(block);
  let hash = 0;
  for (let i = 0; i < blockString.length; i++) {
    const char = blockString.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return hash.toString(16).padStart(8, '0');
};

export const BlockchainProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [candidates, setCandidates] = useState<Candidate[]>(initialCandidates);
  const [blockchain, setBlockchain] = useState<Block[]>(initialBlockchain);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  useEffect(() => {
    // Load from localStorage if available
    const storedCandidates = localStorage.getItem('candidates');
    const storedBlockchain = localStorage.getItem('blockchain');
    
    if (storedCandidates) {
      setCandidates(JSON.parse(storedCandidates));
    }
    
    if (storedBlockchain) {
      setBlockchain(JSON.parse(storedBlockchain));
    }
  }, []);
  
  // Save to localStorage when state changes
  useEffect(() => {
    localStorage.setItem('candidates', JSON.stringify(candidates));
  }, [candidates]);
  
  useEffect(() => {
    localStorage.setItem('blockchain', JSON.stringify(blockchain));
  }, [blockchain]);

  const castVote = async (candidateId: string, voterId: string): Promise<boolean> => {
    setIsLoading(true);
    
    return new Promise((resolve) => {
      setTimeout(() => {
        try {
          // 1. Check if voter has already voted (in a real blockchain this would be validated by the consensus mechanism)
          if (blockchain.some(block => block.voter === voterId && block.voter !== 'GENESIS')) {
            toast.error('You have already voted!');
            setIsLoading(false);
            resolve(false);
            return;
          }
          
          // 2. Create a new block
          const previousBlock = blockchain[blockchain.length - 1];
          const newBlock: Omit<Block, 'hash'> = {
            id: blockchain.length.toString(),
            timestamp: Date.now(),
            voter: voterId,
            candidate: candidateId,
            previousHash: previousBlock.hash
          };
          
          // 3. Calculate block hash
          const hash = hashBlock(newBlock);
          
          // 4. Add block to chain
          const block: Block = {
            ...newBlock,
            hash
          };
          
          setBlockchain([...blockchain, block]);
          
          // 5. Update candidate votes
          setCandidates(candidates.map(candidate => 
            candidate.id === candidateId 
              ? { ...candidate, votes: candidate.votes + 1 }
              : candidate
          ));
          
          toast.success('Vote recorded on the blockchain!');
          setIsLoading(false);
          resolve(true);
        } catch (error) {
          console.error('Error casting vote:', error);
          toast.error('Failed to record your vote');
          setIsLoading(false);
          resolve(false);
        }
      }, 2000); // Simulate blockchain transaction time
    });
  };

  const getResults = (): Candidate[] => {
    return [...candidates].sort((a, b) => b.votes - a.votes);
  };

  const addCandidate = async (candidate: Omit<Candidate, 'id' | 'votes'>): Promise<boolean> => {
    setIsLoading(true);
    
    return new Promise((resolve) => {
      setTimeout(() => {
        try {
          const newCandidate: Candidate = {
            ...candidate,
            id: (candidates.length + 1).toString(),
            votes: 0
          };
          
          setCandidates([...candidates, newCandidate]);
          toast.success('Candidate added successfully!');
          setIsLoading(false);
          resolve(true);
        } catch (error) {
          console.error('Error adding candidate:', error);
          toast.error('Failed to add candidate');
          setIsLoading(false);
          resolve(false);
        }
      }, 1000);
    });
  };

  return (
    <BlockchainContext.Provider
      value={{
        candidates,
        blockchain,
        isLoading,
        castVote,
        getResults,
        addCandidate
      }}
    >
      {children}
    </BlockchainContext.Provider>
  );
};

export const useBlockchain = (): BlockchainContextType => {
  const context = useContext(BlockchainContext);
  if (context === undefined) {
    throw new Error('useBlockchain must be used within a BlockchainProvider');
  }
  return context;
};
