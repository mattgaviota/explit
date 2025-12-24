'use client';

import { useEffect } from 'react';
import { AlertCircle, CheckCircle2, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'error' | 'success' | 'info';
  message: string;
}

interface ToastProps {
  toasts: ToastMessage[];
  onRemove: (id: string) => void;
}

export default function Toast({ toasts, onRemove }: ToastProps) {
  return (
    <div className="fixed bottom-4 right-4 space-y-3 z-50 max-w-sm">
      {toasts.map((toast) => (
        <ToastItem
          key={toast.id}
          toast={toast}
          onRemove={onRemove}
        />
      ))}
    </div>
  );
}

function ToastItem({
  toast,
  onRemove,
}: {
  toast: ToastMessage;
  onRemove: (id: string) => void;
}) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onRemove(toast.id);
    }, 4000);

    return () => clearTimeout(timer);
  }, [toast.id, onRemove]);

  const bgColor = {
    error: 'bg-red-50 border-red-200',
    success: 'bg-emerald-50 border-emerald-200',
    info: 'bg-blue-50 border-blue-200',
  }[toast.type];

  const textColor = {
    error: 'text-red-800',
    success: 'text-emerald-800',
    info: 'text-blue-800',
  }[toast.type];

  const iconColor = {
    error: 'text-red-500',
    success: 'text-emerald-600',
    info: 'text-blue-500',
  }[toast.type];

  const Icon = {
    error: AlertCircle,
    success: CheckCircle2,
    info: AlertCircle,
  }[toast.type];

  return (
    <div
      className={`${bgColor} border rounded-lg p-4 flex items-start gap-3 shadow-lg animate-slide-in`}
    >
      <Icon className={`${iconColor} w-5 h-5 flex-shrink-0 mt-0.5`} />
      <p className={`${textColor} text-sm font-medium flex-1`}>
        {toast.message}
      </p>
      <button
        onClick={() => onRemove(toast.id)}
        className="text-slate-400 hover:text-slate-600 transition-colors flex-shrink-0"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
