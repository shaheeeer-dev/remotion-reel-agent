import React from 'react';

export const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const getStyles = () => {
    switch (status) {
      case 'PUBLISHED':
      case 'APPROVED':
        return 'bg-[#34B1AA]/15 text-[#18857E] border-[#34B1AA]/40';
      case 'RENDERED':
      case 'NEEDS_REVIEW':
        return 'bg-[#E0B50F]/15 text-[#A68407] border-[#E0B50F]/40';
      case 'RENDERING':
      case 'RUNNING':
        return 'bg-[#FDEEE3] text-[#F29F67] border-[#F29F67]/40 animate-pulse';
      case 'SCRIPT_READY':
        return 'bg-[#3B8FF3]/15 text-[#2475D6] border-[#3B8FF3]/40';
      case 'FAILED':
      case 'FAILED_FINAL':
        return 'bg-rose-50 text-rose-600 border-rose-200';
      default:
        return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${getStyles()}`}
    >
      {status}
    </span>
  );
};

