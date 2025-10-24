import React, { useState, useEffect } from 'react';
import { useCaseContext } from '../contexts/CaseContext';
import { generatePrioritization } from '../services/geminiService';
import { Loader } from './Loader';
import { PrioritizedTask } from '../types';
import { Icon } from './Icon';

export const PrioritizationModule: React.FC = () => {
  const { caseSummary, strategyTasks, setStrategyTasks } = useCaseContext();
  const [tasks, setTasks] = useState('- File Application in a Proceeding for urgent interim hearing.\n- Gather new evidence (NDIS fraud, Evie\'s health report).\n- Draft affidavit highlighting mother\'s non-compliance.\n- Follow up with ICL about meeting the children.');
  const [goals, setGoals] = useState('Short-Term: Get new evidence of harm before the Court and seek an urgent interim hearing.\nMedium-Term: Argue for a significant change in circumstances to have children placed in my primary care.');
  const [prioritizedTasks, setPrioritizedTasks] = useState<PrioritizedTask[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (strategyTasks && strategyTasks.length > 0) {
      const newTasks = strategyTasks.join('\n');
      setTasks(prev => `${prev}\n\n//-- Tasks from Selected Strategy --//\n${newTasks}`);
      setStrategyTasks([]); // Clear after incorporating to prevent re-adding
    }
  }, [strategyTasks, setStrategyTasks]);

  const handlePrioritize = async () => {
    setIsLoading(true);
    setError(null);
    setPrioritizedTasks([]);

    const prompt = `
      You are an expert legal strategist specializing in the Australian Family Court (FCFCOA). 
      Your client is Joshua Lees in the case Lees v Lees (BRC8037/2024).
      You MUST act with the logic and rationality of a seasoned barrister. Your advice MUST be grounded in Australian law.

      **Case Context:**
      ${caseSummary}

      **Client's Stated Goals:**
      ${goals}

      **Client's Immediate Task List:**
      ${tasks}

      Based on all the provided information, your task is to prioritize the client's immediate tasks. Your prioritization MUST be guided by:
      1.  The Family Law Act 1975, with the child's best interests (s 60CC) as the paramount consideration.
      2.  The Federal Circuit and Family Court of Australia (Family Law) Rules 2021 for procedural correctness.
      3.  The FCFCOA Central Practice Direction for case management principles.
      4.  The immediate need to address any unacceptable risk of harm to the children.

      Return your response as a valid JSON array of objects. Each object must have the following keys:
      1. "priority": A number representing the rank (1 is the highest).
      2. "task": The task string from the user's input.
      3. "rationale": A concise, expert explanation for why the task is given that priority, citing case strategy and FCFCOA principles.
      
      Do not include any text outside of the JSON array.
    `;
    
    try {
      const response = await generatePrioritization(prompt);
      const parsedResponse = JSON.parse(response);
      if (Array.isArray(parsedResponse)) {
        setPrioritizedTasks(parsedResponse);
      } else {
        throw new Error("Invalid response format from AI.");
      }
    } catch (e) {
      console.error(e);
      setError("Failed to get prioritization. The AI may have returned an invalid format.");
    } finally {
      setIsLoading(false);
    }
  };

  const getPriorityVisuals = (priority: number): { bgColor: string; textColor: string; borderColor: string; label: string } => {
    switch (priority) {
      case 1:
        return { bgColor: 'bg-red-600', textColor: 'text-white', borderColor: 'border-red-600', label: 'CRITICAL' };
      case 2:
        return { bgColor: 'bg-orange-500', textColor: 'text-white', borderColor: 'border-orange-500', label: 'HIGH' };
      case 3:
        return { bgColor: 'bg-yellow-500', textColor: 'text-neutral-900', borderColor: 'border-yellow-500', label: 'MEDIUM' };
      default:
        return { bgColor: 'bg-brand-secondary', textColor: 'text-white', borderColor: 'border-brand-secondary', label: 'NORMAL' };
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2"><Icon name="list" /> Task Prioritizer</h2>
        <p className="text-neutral-200">Input your tasks and goals. The AI will rank them based on your case context and FCFCOA best practices.</p>
      </div>
      
      <div className="flex flex-col lg:flex-row gap-6 flex-grow min-h-0">
        <div className="lg:w-1/2 flex flex-col gap-4">
          <div>
            <label htmlFor="goals" className="block text-sm font-medium text-neutral-100 mb-2">Overarching Goals</label>
            <textarea
              id="goals"
              value={goals}
              onChange={(e) => setGoals(e.target.value)}
              rows={5}
              className="w-full p-3 bg-neutral-700 text-white rounded-md border border-neutral-600 focus:ring-2 focus:ring-brand-secondary focus:border-brand-secondary"
              placeholder="e.g., Achieve 50/50 custody, Finalize property settlement..."
            />
          </div>
          <div>
            <label htmlFor="tasks" className="block text-sm font-medium text-neutral-100 mb-2">Current Tasks</label>
            <textarea
              id="tasks"
              value={tasks}
              onChange={(e) => setTasks(e.target.value)}
              rows={8}
              className="w-full p-3 bg-neutral-700 text-white rounded-md border border-neutral-600 focus:ring-2 focus:ring-brand-secondary focus:border-brand-secondary"
              placeholder="List all your current legal tasks, one per line..."
            />
          </div>
          <button
            onClick={handlePrioritize}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 bg-brand-primary text-white font-bold py-3 px-4 rounded-md hover:bg-brand-secondary transition-colors disabled:bg-neutral-600 disabled:cursor-not-allowed"
          >
            <Icon name="brain" className="w-5 h-5" />
            {isLoading ? 'Analyzing...' : 'Prioritize with AI'}
          </button>
        </div>
        
        <div className="lg:w-1/2 bg-neutral-900 rounded-lg p-4 flex flex-col overflow-y-auto">
          <h3 className="text-xl font-bold text-white mb-4">Prioritized Action Plan</h3>
          {isLoading && <Loader message="Generating strategic priorities..." />}
          {error && <p className="text-red-400">{error}</p>}
          {!isLoading && prioritizedTasks.length === 0 && !error && (
            <div className="text-center text-neutral-400 mt-8">
              <p>Your prioritized tasks will appear here.</p>
            </div>
          )}
          <div className="space-y-4">
            {prioritizedTasks.map((item) => {
              const visuals = getPriorityVisuals(item.priority);
              return (
                <div key={item.priority} className={`bg-neutral-800 p-4 rounded-lg border-l-4 ${visuals.borderColor}`}>
                  <div className="flex items-start gap-4">
                    <span className={`flex-shrink-0 ${visuals.bgColor} ${visuals.textColor} rounded-full h-8 w-8 flex items-center justify-center font-bold text-lg`}>
                      {item.priority}
                    </span>
                    <div className="flex-grow">
                      <div className="flex items-center gap-3">
                        <h4 className="font-bold text-white flex-1">{item.task}</h4>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${visuals.bgColor} ${visuals.textColor}`}>
                          {visuals.label}
                        </span>
                      </div>
                      <p className="text-sm text-neutral-300 mt-1"><strong className="text-brand-accent">Rationale:</strong> {item.rationale}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};