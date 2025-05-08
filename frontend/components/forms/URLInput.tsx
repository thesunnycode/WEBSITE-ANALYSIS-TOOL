"use client";

import { useState } from "react";
import { InfoIcon } from "lucide-react";
import Tooltip from "../modals/Tooltip";

interface URLInputProps {
  value: string;
  onChange: (value: string) => void;
}

export default function URLInput({ value, onChange }: URLInputProps) {
  const [isValid, setIsValid] = useState(true);

  const validateURL = (url: string) => {
    const urlPattern =
      /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/;
    return urlPattern.test(url);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    setIsValid(validateURL(newValue));
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <label htmlFor="url" className="text-xl font-semibold text-white">
          Website URL
        </label>
        <Tooltip content="Enter the full URL of the website you want to analyze">
          <InfoIcon className="w-5 h-5 text-gray-400 hover:text-white transition-colors" />
        </Tooltip>
      </div>
      <input
        id="url"
        type="url"
        value={value}
        onChange={handleChange}
        placeholder="https://example.com"
        className={`w-full px-4 py-3 bg-white/5 border ${
          isValid ? "border-gray-600" : "border-red-500"
        } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
      />
      {!isValid && value && (
        <p className="text-red-500 text-sm">Please enter a valid URL</p>
      )}
    </div>
  );
}
