import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, Chat } from '@google/genai';
import { useCaseContext } from '../contexts/CaseContext';
import { ChatMessage } from '../types';
import { Icon } from './Icon';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

export const Chatbot: React.FC = () => {
  const { 
    caseSummary, 
    chatHistory, 
    setChatHistory, 
    chatSession, 
    setChatSession,
    chatSessionSummary,
    setChatSessionSummary
  } = useCaseContext();
  
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const initChat = async () => {
      setIsLoading(true);
      setChatHistory([{ role: 'model', text: 'System: My knowledge base is initializing with the latest case summary...' }]);

      const newChatSession = ai.chats.create({
        model: 'gemini-flash-lite-latest',
        config: {
          systemInstruction: `You are "Legal Buddy," an expert AI assistant specializing in the FCFCOA. You are advising Joshua Lees in the case Lees v Lees. You are logical, rational, and empathetic. 
          
          Your primary goal is to provide guidance that is compliant with FCFCOA rules and laws. You MUST ground your advice in the Family Law Act 1975 and FCFCOA court procedures. When relevant, you can refer to key concepts like 'the best interests of the child' (s 60CC), 'parental responsibility', and 'unacceptable risk of harm'.
          
          **CRITICAL CONTEXT: Lees v Lees (BRC8037/2024)**
          ${caseSummary}
          
          You MUST use this context to inform all your responses. Start the conversation by introducing yourself and asking how you can help.`,
        },
      });
      
      setChatSession(newChatSession);
      setChatSessionSummary(caseSummary);

      try {
          const response = await newChatSession.sendMessage({ message: '' });
          setChatHistory([{ role: 'model', text: response.text }]);
      } catch (error) {
          console.error("Error sending initial message to AI:", error);
          setChatHistory([{ role: 'model', text: 'Sorry, I encountered an error. Please try again.' }]);
      } finally {
          setIsLoading(false);
      }
    };
    
    // If there's no session, or if the current case summary is different
    // from the one used to create the existing session, then re-initialize.
    if (!chatSession || chatSessionSummary !== caseSummary) {
      initChat();
    }
  }, [caseSummary, chatSession, chatSessionSummary, setChatHistory, setChatSession, setChatSessionSummary]);
  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  const sendMessageToAI = async (message: string) => {
    if (!chatSession) {
      setChatHistory(prev => [...prev, {role: 'model', text: 'Error: Chat session is not active. Please wait or try refreshing.'}]);
      return;
    }

    setIsLoading(true);
    try {
      const response = await chatSession.sendMessage({ message });
      setChatHistory(prev => [...prev, { role: 'model', text: response.text }]);
    } catch (error) {
      console.error("Error sending message to AI:", error);
      setChatHistory(prev => [...prev, { role: 'model', text: 'Sorry, I encountered an error. Please try again.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = () => {
    if (input.trim() === '' || isLoading) return;
    const userMessage: ChatMessage = { role: 'user', text: input };
    setChatHistory(prev => [...prev, userMessage]);
    sendMessageToAI(input);
    setInput('');
  };

  return (
    <div className="flex flex-col h-full">
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2"><Icon name="chat" /> Legal Buddy Chat</h2>
        <p className="text-neutral-200">Ask questions about your case, FCFCOA procedures, or legal strategies.</p>
      </div>

      <div className="flex-grow bg-neutral-900 rounded-lg p-4 mb-4 overflow-y-auto flex flex-col gap-4">
        {chatHistory.map((msg, index) => (
          <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-xl p-3 rounded-lg ${msg.role === 'user' ? 'bg-brand-secondary text-white' : 'bg-neutral-700 text-neutral-100'}`}>
              <p className="whitespace-pre-wrap">{msg.text}</p>
            </div>
          </div>
        ))}
        {isLoading && messagesEndRef.current && (
            <div className="flex justify-start">
                <div className="max-w-xl p-3 rounded-lg bg-neutral-700 text-neutral-100">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-brand-accent rounded-full animate-pulse"></div>
                        <div className="w-2 h-2 bg-brand-accent rounded-full animate-pulse delay-75"></div>
                        <div className="w-2 h-2 bg-brand-accent rounded-full animate-pulse delay-150"></div>
                    </div>
                </div>
            </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="flex items-center gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          className="flex-grow p-3 bg-neutral-700 text-white rounded-md border border-neutral-600 focus:ring-2 focus:ring-brand-secondary focus:border-brand-secondary"
          placeholder="Ask your legal buddy..."
          disabled={isLoading}
        />
        <button onClick={handleSend} disabled={isLoading || !input.trim()} className="p-3 bg-brand-primary text-white rounded-md hover:bg-brand-secondary transition-colors disabled:bg-neutral-600">
          <Icon name="send" className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};