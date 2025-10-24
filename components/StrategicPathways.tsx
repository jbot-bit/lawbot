import React, { useState } from 'react';
import { useCaseContext } from '../contexts/CaseContext';
import { generateStrategicPathways } from '../services/geminiService';
import { Loader } from './Loader';
import { StrategicPathway, Tab } from '../types';
import { Icon } from './Icon';

interface StrategicPathwaysProps {
  setActiveTab: (tab: Tab) => void;
}

export const StrategicPathways: React.FC<StrategicPathwaysProps> = ({ setActiveTab }) => {
  const { caseSummary, setStrategyTasks } = useCaseContext();
  const [goal, setGoal] = useState('Obtain interim orders to place the children in my primary care due to the immediate risk of harm.');
  const [pathways, setPathways] = useState<StrategicPathway[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const handleGenerate = async () => {
    setIsLoading(true);
    setError(null);
    setPathways([]);
    setShowConfirmation(false);

    const prompt = `
      You are an elite legal strategist AI, specializing in high-conflict FCFCOA matters. Your client is Joshua Lees in Lees v Lees (BRC8037/2024). You are to act with the logic, foresight, and pragmatism of a top-tier Senior Counsel.

      **Case Context:**
      ${caseSummary}

      **Client's Overarching Goal:**
      ${goal}

      Based on the provided context and the client's goal, generate 2-3 distinct, actionable strategic pathways. Each pathway must be a complete, self-contained strategy that is legally sound and compliant with the FCFCOA Rules 2021. Each step should be a valid legal or procedural action. For each pathway, provide:

      1. A clear, concise title.
      2. A brief description of the strategy's core logic.
      3. A sequence of concrete, actionable steps.
      4. A list of key evidence required to support the strategy.
      5. An analysis of potential risks or counter-arguments from the opposing party.

      Return your response as a valid JSON array of objects. Do not include any text outside of the JSON array. Each object in the array must represent one strategic pathway and have the following keys: "title", "description", "steps" (an array of objects with "step", "action", "description"), "evidenceNeeded" (an array of strings), and "risks" (an array of strings).
    `;

    try {
      const response = await generateStrategicPathways(prompt);
      const parsedResponse = JSON.parse(response);
      if (Array.isArray(parsedResponse)) {
        setPathways(parsedResponse);
      } else {
        throw new Error("Invalid response format from AI.");
      }
    } catch (e) {
      console.error(e);
      setError("Failed to generate strategies. The AI may have returned an invalid format.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectStrategy = (pathway: StrategicPathway) => {
    const tasks = pathway.steps.map(step => step.action);
    setStrategyTasks(tasks);
    setShowConfirmation(true);
    setTimeout(() => setShowConfirmation(false), 4000);
    // Optional: navigate to prioritizer
    // setActiveTab('prioritize'); 
  };


  return (
    <div className="flex flex-col h-full">
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
          <Icon name="strategy" className="text-brand-accent"/> Strategy Builder
        </h2>
        <p className="text-neutral-200">Define your objective. The AI will analyze the case context and generate several strategic pathways to achieve your goal.</p>
      </div>

      <div className="flex flex-col gap-4 mb-6 p-4 bg-neutral-900 rounded-lg">
        <label htmlFor="goal" className="block text-lg font-medium text-neutral-100">My Primary Legal Goal Is To...</label>
        <textarea
          id="goal"
          value={goal}
          onChange={(e) => setGoal(e.target.value)}
          rows={3}
          className="w-full p-3 bg-neutral-700 text-white rounded-md border border-neutral-600 focus:ring-2 focus:ring-brand-secondary focus:border-brand-secondary"
          placeholder="e.g., Achieve 50/50 custody, Finalize property settlement..."
        />
        <button
          onClick={handleGenerate}
          disabled={isLoading}
          className="w-full md:w-auto self-start flex items-center justify-center gap-2 bg-brand-primary text-white font-bold py-3 px-6 rounded-md hover:bg-brand-secondary transition-colors disabled:bg-neutral-600 disabled:cursor-not-allowed"
        >
          <Icon name="brain" className="w-5 h-5" />
          {isLoading ? 'Generating Strategies...' : 'Generate Strategic Pathways'}
        </button>
      </div>

      <div className="flex-grow overflow-y-auto">
        {isLoading && <Loader message="Developing strategic options..." />}
        {error && <p className="text-red-400 text-center">{error}</p>}
        {!isLoading && pathways.length === 0 && !error && (
          <div className="text-center text-neutral-400 mt-8">
            <p>Your generated strategic pathways will appear here.</p>
          </div>
        )}
        {showConfirmation && (
          <div className="bg-green-800 border border-green-600 text-white p-3 rounded-md mb-4">
            Strategy selected! The action items have been sent to the Prioritizer module.
          </div>
        )}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {pathways.map((pathway, index) => (
            <div key={index} className="bg-neutral-800 rounded-lg p-5 flex flex-col border border-neutral-700 hover:border-brand-secondary transition-colors">
              <h3 className="text-xl font-bold text-brand-accent mb-2">{pathway.title}</h3>
              <p className="text-sm text-neutral-300 mb-4 flex-grow">{pathway.description}</p>
              
              <details className="mt-auto">
                <summary className="cursor-pointer text-brand-secondary hover:underline">View Full Strategy</summary>
                <div className="mt-4 space-y-4 text-sm">
                  <div>
                    <h4 className="font-semibold text-neutral-100">Actionable Steps:</h4>
                    <ul className="list-decimal list-inside mt-1 text-neutral-300 space-y-1">
                      {pathway.steps.map(step => <li key={step.step}><strong>{step.action}:</strong> {step.description}</li>)}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-neutral-100">Evidence Required:</h4>
                    <ul className="list-disc list-inside mt-1 text-neutral-300">
                      {pathway.evidenceNeeded.map((item, i) => <li key={i}>{item}</li>)}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-neutral-100">Risks & Counter-Arguments:</h4>
                    <ul className="list-disc list-inside mt-1 text-neutral-300">
                      {pathway.risks.map((item, i) => <li key={i}>{item}</li>)}
                    </ul>
                  </div>
                </div>
              </details>
              
              <button
                onClick={() => handleSelectStrategy(pathway)}
                className="w-full mt-4 bg-brand-secondary text-white font-bold py-2 px-4 rounded-md hover:opacity-90 transition-opacity"
              >
                Select this Strategy
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};