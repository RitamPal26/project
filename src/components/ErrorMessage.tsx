import React from 'react';
import { AlertCircle } from 'lucide-react';

interface Props {
  message: string;
}

export default function ErrorMessage({ message }: Props) {
  return (
    <div className="flex items-center gap-2 text-red-400 bg-red-900/20 p-4 rounded-lg">
      <AlertCircle className="w-5 h-5" />
      <p>{message}</p>
    </div>
  );
}