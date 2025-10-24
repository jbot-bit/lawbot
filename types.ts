export interface PrioritizedTask {
  priority: number;
  task: string;
  rationale: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export interface DocumentInfo {
  id: string;
  name: string;
  content: string;
}

export interface StrategyStep {
  step: number;
  action: string;
  description: string;
}

export interface StrategicPathway {
  title: string;
  description: string;
  steps: StrategyStep[];
  evidenceNeeded: string[];
  risks: string[];
}

export interface Fact {
  id: string;
  text: string;
}

export interface FactSource {
  id: string;
  name: string;
  facts: Fact[];
}


export type Tab = 'brain' | 'prioritize' | 'summarize' | 'chat' | 'transcribe' | 'strategy';