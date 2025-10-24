import React, { useState } from 'react';
import { useCaseContext } from '../contexts/CaseContext';
import { Icon } from './Icon';

const USER_ADDED_SOURCE_ID = 'user-added-facts';

export const CaseBrain: React.FC = () => {
  const { factSources, addFact, deleteFact } = useCaseContext();
  const [newFact, setNewFact] = useState('');

  const handleAddFact = () => {
    if (newFact.trim()) {
      addFact(newFact.trim(), USER_ADDED_SOURCE_ID);
      setNewFact('');
    }
  };
  
  return (
    <div className="flex flex-col h-full">
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
          <Icon name="brain" className="text-brand-accent"/> Case Brain
        </h2>
        <p className="text-neutral-200">
          This is the AI's live knowledge base. Facts are grouped by their source. Add, edit, or remove facts to ensure the AI's context is always accurate.
        </p>
      </div>
      
      <div className="flex flex-col flex-grow min-h-0 bg-neutral-900 rounded-lg p-4">
        <div className="flex-grow overflow-y-auto pr-2 space-y-4">
            <h3 className="text-lg font-semibold text-neutral-100 mb-3">Current Case Knowledge:</h3>
            {factSources.filter(source => source.facts.length > 0).map(source => (
              <details key={source.id} className="bg-neutral-800 rounded-lg" open>
                <summary className="cursor-pointer p-3 font-semibold text-neutral-100 flex justify-between items-center">
                  {source.name}
                  <span className="text-xs font-mono px-2 py-1 bg-neutral-700 rounded">{source.facts.length} facts</span>
                </summary>
                <div className="p-3 border-t border-neutral-700">
                  <ul className="space-y-2">
                    {source.facts.map((fact) => (
                      <li 
                          key={fact.id} 
                          className="group flex items-start gap-3 p-2 bg-neutral-900 rounded-md"
                      >
                          <p className="flex-grow text-neutral-200">{fact.text}</p>
                          <button 
                              onClick={() => deleteFact(fact.id, source.id)}
                              className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 transition-opacity"
                              aria-label="Delete fact"
                          >
                              <Icon name="trash" className="w-5 h-5"/>
                          </button>
                      </li>
                    ))}
                  </ul>
                </div>
              </details>
            ))}
             {factSources.every(s => s.facts.length === 0) && (
                <p className="text-neutral-400 text-center py-4">No case facts loaded. Add a fact below or analyze a document.</p>
            )}
        </div>
        <div className="mt-4 pt-4 border-t border-neutral-700 flex items-center gap-3">
          <input
            type="text"
            value={newFact}
            onChange={(e) => setNewFact(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAddFact()}
            className="flex-grow p-3 bg-neutral-700 text-white rounded-md border border-neutral-600 focus:ring-2 focus:ring-brand-secondary focus:border-brand-secondary"
            placeholder="Add a new fact to 'Manually Added Facts'..."
          />
          <button
            onClick={handleAddFact}
            className="bg-brand-primary text-white font-bold py-3 px-6 rounded-md hover:bg-brand-secondary transition-colors"
          >
            Add Fact
          </button>
        </div>
      </div>
    </div>
  );
};