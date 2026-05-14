"use client";

import React from "react";
import { X, AlertCircle, HelpCircle } from "lucide-react";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "warning" | "info";
  isLoading?: boolean;
}

export const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "info",
  isLoading = false,
}: ConfirmModalProps) => {
  if (!isOpen) return null;

  const getVariantStyles = () => {
    switch (variant) {
      case "danger":
        return {
          icon: <AlertCircle className="w-8 h-8 text-red-500" />,
          bg: "bg-red-500/10",
          button: "bg-red-500 hover:bg-red-600 text-white",
        };
      case "warning":
        return {
          icon: <AlertCircle className="w-8 h-8 text-amber-500" />,
          bg: "bg-amber-500/10",
          button: "bg-amber-500 hover:bg-amber-600 text-white",
        };
      default:
        return {
          icon: <HelpCircle className="w-8 h-8 text-blue-500" />,
          bg: "bg-blue-500/10",
          button: "bg-zinc-900 dark:bg-white text-white dark:text-zinc-900",
        };
    }
  };

  const styles = getVariantStyles();

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-md bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-[2.5rem] p-8 shadow-2xl animate-in zoom-in-95 duration-200"
      >
        <div className="flex flex-col items-center text-center">
          <div className={`w-16 h-16 rounded-2xl ${styles.bg} flex items-center justify-center mb-6`}>
            {styles.icon}
          </div>
          
          <h2 className="text-2xl font-bold tracking-tight mb-3">{title}</h2>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm leading-relaxed mb-8">
            {message}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3 w-full">
            <button 
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 py-4 font-bold text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-2xl transition-all order-2 sm:order-1 disabled:opacity-50"
            >
              {cancelText}
            </button>
            <button 
              onClick={onConfirm}
              disabled={isLoading}
              className={`flex-1 py-4 font-bold rounded-2xl transition-all active:scale-95 flex items-center justify-center gap-2 order-1 sm:order-2 disabled:opacity-50 ${styles.button}`}
            >
              {isLoading && <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />}
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
