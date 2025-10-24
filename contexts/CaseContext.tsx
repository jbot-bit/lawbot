import React, { createContext, useState, useContext, ReactNode, useMemo } from 'react';
import { Chat } from '@google/genai';
import { DocumentInfo, ChatMessage, FactSource, Fact } from '../types';
import { CASE_CONTEXT_SUMMARY, PRELOADED_DOCUMENTS } from '../constants';

interface CaseContextType {
  caseSummary: string;
  factSources: FactSource[];
  documents: DocumentInfo[];
  chatHistory: ChatMessage[];
  chatSession: Chat | null;
  chatSessionSummary: string | null;
  strategyTasks: string[] | null;
  addFact: (factText: string, sourceId?: string) => void;
  deleteFact: (factId: string, sourceId: string) => void;
  addFactSource: (sourceName: string, facts: string[]) => void;
  setChatHistory: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  setChatSession: React.Dispatch<React.SetStateAction<Chat | null>>;
  setChatSessionSummary: React.Dispatch<React.SetStateAction<string | null>>;
  setStrategyTasks: React.Dispatch<React.SetStateAction<string[] | null>>;
}

const CaseContext = createContext<CaseContextType | undefined>(undefined);

const USER_ADDED_SOURCE_ID = 'user-added-facts';

// Parse the initial summary into the new FactSource structure
const initialFacts = CASE_CONTEXT_SUMMARY
  .split('\n')
  .map(fact => fact.trim())
  .filter(fact => fact.length > 0)
  .map((fact, index) => ({ id: `initial-${index}`, text: fact }));

const initialFactSources: FactSource[] = [
  {
    id: 'initial-case-summary',
    name: 'Initial Case Summary',
    facts: initialFacts,
  },
  {
    id: USER_ADDED_SOURCE_ID,
    name: 'Manually Added Facts',
    facts: [],
  }
];

export const CaseContextProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [factSources, setFactSources] = useState<FactSource[]>(initialFactSources);
  const [documents, setDocuments] = useState<DocumentInfo[]>(PRELOADED_DOCUMENTS);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [chatSession, setChatSession] = useState<Chat | null>(null);
  const [chatSessionSummary, setChatSessionSummary] = useState<string | null>(null);
  const [strategyTasks, setStrategyTasks] = useState<string[] | null>(null);

  const caseSummary = useMemo(() => {
    return factSources.flatMap(source => source.facts.map(fact => fact.text)).join('\n');
  }, [factSources]);

  const addFact = (factText: string, sourceId: string = USER_ADDED_SOURCE_ID) => {
    setFactSources(prevSources => {
      return prevSources.map(source => {
        if (source.id === sourceId) {
          const newFact: Fact = { id: `${sourceId}-${Date.now()}`, text: factText };
          return { ...source, facts: [...source.facts, newFact] };
        }
        return source;
      });
    });
  };
  
  const addFactSource = (sourceName: string, facts: string[]) => {
    const newSourceId = `source-${Date.now()}`;
    const newFacts: Fact[] = facts.map((fact, index) => ({
      id: `${newSourceId}-${index}`,
      text: fact,
    }));
    const newSource: FactSource = {
      id: newSourceId,
      name: sourceName,
      facts: newFacts,
    };
    setFactSources(prevSources => [...prevSources, newSource]);
  };

  const deleteFact = (factId: string, sourceId: string) => {
    setFactSources(prevSources => {
      return prevSources.map(source => {
        if (source.id === sourceId) {
          return { ...source, facts: source.facts.filter(fact => fact.id !== factId) };
        }
        return source;
      });
    });
  };

  return (
    <CaseContext.Provider value={{
      caseSummary,
      factSources,
      documents,
      addFact,
      deleteFact,
      addFactSource,
      chatHistory,
      setChatHistory,
      chatSession,
      setChatSession,
      chatSessionSummary,
      setChatSessionSummary,
      strategyTasks,
      setStrategyTasks
    }}>
      {children}
    </CaseContext.Provider>
  );
};

export const useCaseContext = () => {
  const context = useContext(CaseContext);
  if (context === undefined) {
    throw new Error('useCaseContext must be used within a CaseContextProvider');
  }
  return context;
};