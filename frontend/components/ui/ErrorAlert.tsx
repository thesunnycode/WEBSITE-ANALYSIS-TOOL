import { motion } from "framer-motion";
import { XCircleIcon } from "@heroicons/react/24/outline";

interface ErrorAlertProps {
  message: string;
  onClose?: () => void;
}

export function ErrorAlert({ message, onClose }: ErrorAlertProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex items-center p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg"
    >
      <XCircleIcon className="h-6 w-6" />
      <span>{message}</span>
      {onClose && (
        <button
          onClick={onClose}
          className="p-1 text-red-600 hover:bg-red-200 rounded-full"
        >
          ✕
        </button>
      )}
    </motion.div>
  );
}
