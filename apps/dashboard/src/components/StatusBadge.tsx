import React from 'react';

export const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const getStyles = () => {
    switch (status) {
      case 'PUBLISHED':
        return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/40';
      case 'APPROVED':
        return 'bg-cyan-500/15 text-cyan-400 border-cyan-500/40';
      case 'RENDERED':
      case 'NEEDS_REVIEW':
        return 'bg-amber-500/15 text-amber-400 border-amber-500/40';
      case 'RENDERING':
      case 'RUNNING':
        return 'bg-blue-500/15 text-blue-400 border-blue-500/40 animate-pulse';
      case 'SCRIPT_READY':
        return 'bg-purple-500/15 text-purple-400 border-purple-500/40';
      case 'FAILED':
      case 'FAILED_FINAL':
        return 'bg-rose-500/15 text-rose-400 border-rose-500/40';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getStyles()}`}
    >
      {status}
    </span>
  );
};

