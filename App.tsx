import React, { useState } from 'react';
import { Header } from './components/Header';
import { PrioritizationModule } from './components/PrioritizationModule';
import { DocumentSummarizer } from './components/DocumentSummarizer';
import { Chatbot } from './components/Chatbot';
import { AudioTranscriber } from './components/AudioTranscriber';
import { CaseBrain } from './components/CaseBrain';
import { Icon } from './components/Icon';
import { CaseContextProvider } from './contexts/CaseContext';
import { Tab } from './types';
import { StrategicPathways } from './components/StrategicPathways';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('brain');

  const renderContent = () => {
    switch (activeTab) {
      case 'brain':
        return <CaseBrain />;
      case 'strategy':
        return <StrategicPathways setActiveTab={setActiveTab} />;
      case 'prioritize':
        return <PrioritizationModule />;
      case 'summarize':
        return <DocumentSummarizer />;
      case 'chat':
        return <Chatbot />;
      case 'transcribe':
        return <AudioTranscriber />;
      default:
        return <CaseBrain />;
    }
  };

  const navItems: { id: Tab; label: string; icon: 'brain' | 'strategy' | 'list' | 'document' | 'chat' | 'microphone' }[] = [
    { id: 'brain', label: 'Case Brain', icon: 'brain' },
    { id: 'strategy', label: 'Strategy', icon: 'strategy' },
    { id: 'prioritize', label: 'Priority', icon: 'list' },
    { id: 'summarize', label: 'Analysis', icon: 'document' },
    { id: 'chat', label: 'Chat', icon: 'chat' },
    { id: 'transcribe', label: 'Transcribe', icon: 'microphone' },
  ];

  return (
    <CaseContextProvider>
      <div className="min-h-screen bg-neutral-900 font-sans flex flex-col h-[100dvh]">
        <Header />
        <main className="flex-grow overflow-y-auto p-2 sm:p-4 pb-24">
          <div className="bg-neutral-800 rounded-lg p-4 sm:p-6 h-full">
            {renderContent()}
          </div>
        </main>
        <nav className="fixed bottom-0 left-0 right-0 z-50 bg-neutral-800 border-t border-neutral-700">
          <div className="flex justify-around items-center py-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex flex-col items-center justify-center gap-1 p-2 rounded-lg transition-colors ${
                  activeTab === item.id
                    ? 'text-brand-accent'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                <Icon name={item.icon} className="w-6 h-6" />
                <span className="text-xs font-medium tracking-tight">{item.label}</span>
              </button>
            ))}
          </div>
        </nav>
      </div>
    </CaseContextProvider>
  );
};

export default App;