"use client";

import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle } from "lucide-react";

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function DeleteConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
}: DeleteConfirmationModalProps) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50"
          >
            <div className="relative bg-dark-card/20 backdrop-blur-sm rounded-2xl p-6 border border-white/5 shadow-glass overflow-hidden w-[400px]">
              {/* Background Effects */}
              <div className="absolute inset-0 bg-orange-gradient opacity-20" />
              <div className="absolute inset-0 bg-glass-gradient" />
              <div className="absolute inset-0 bg-dark-gradient opacity-50" />

              {/* Content */}
              <div className="relative">
                {/* Icon */}
                <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-accent-red/10 flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-accent-red" />
                </div>

                {/* Title */}
                <h3 className="text-xl font-semibold text-white text-center mb-2">
                  Delete Analysis
                </h3>

                {/* Message */}
                <p className="text-gray-400 text-center mb-6">
                  Are you sure you want to delete this analysis? This action
                  cannot be undone.
                </p>

                {/* Buttons */}
                <div className="flex items-center justify-end gap-4">
                  <button
                    onClick={onClose}
                    className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={onConfirm}
                    className="px-4 py-2 bg-accent-red/80 hover:bg-accent-red text-white rounded-lg transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
