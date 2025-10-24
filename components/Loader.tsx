import React from 'react';

export const Loader: React.FC<{ message?: string }> = ({ message = 'Analyzing...' }) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center text-neutral-200">
      <div className="w-12 h-12 border-4 border-brand-accent border-t-transparent rounded-full animate-spin"></div>
      <p className="mt-4 text-lg font-medium">{message}</p>
    </div>
  );
};
