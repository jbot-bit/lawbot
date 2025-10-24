import React from 'react';
import { Icon } from './Icon';

export const Header: React.FC = () => {
  return (
    <header className="bg-neutral-800 p-4 border-b border-neutral-700">
      <div className="container mx-auto flex items-center justify-center">
        <div className="flex items-center gap-3">
          <Icon name="balance" className="w-7 h-7 text-brand-accent" />
          <h1 className="text-xl sm:text-2xl font-bold text-white">Legal Buddy AI</h1>
        </div>
      </div>
    </header>
  );
};