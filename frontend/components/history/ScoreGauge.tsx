import React, { useState, useEffect } from 'react';

interface ScoreGaugeProps {
  score?: number;
  maxScore?: number;
  title?: string;
  size?: 'sm' | 'md' | 'lg';
}

type SizeConfig = {
  gaugeSize: string;
  fontSize: string;
  titleSize: string;
}

export default function ScoreGauge({ 
  score = 0, 
  maxScore = 100, 
  title = "Score", 
  size = "md" 
}: ScoreGaugeProps): JSX.Element {
  const [animatedScore, setAnimatedScore] = useState<number>(0);
  
  // Size configurations
  const sizeConfig: Record<string, SizeConfig> = {
    sm: { gaugeSize: "w-32 h-32", fontSize: "text-2xl", titleSize: "text-xs" },
    md: { gaugeSize: "w-40 h-40", fontSize: "text-3xl", titleSize: "text-sm" },
    lg: { gaugeSize: "w-48 h-48", fontSize: "text-4xl", titleSize: "text-base" }
  };
  
  const { gaugeSize, fontSize, titleSize } = sizeConfig[size] || sizeConfig.md;
  
  // Animate the score on mount and when score changes
  useEffect(() => {
    // Reset animation if score decreases
    if (score < animatedScore) {
      setAnimatedScore(0);
    }
    
    const duration = 1000; // Animation duration in ms
    const frames = 60; // Number of frames for the animation
    const step = score / frames;
    
    let currentFrame = 0;
    let currentScore = animatedScore;
    
    const interval = setInterval(() => {
      currentFrame++;
      currentScore = Math.min(currentScore + step, score);
      setAnimatedScore(currentScore);
      
      if (currentFrame >= frames || currentScore >= score) {
        clearInterval(interval);
        setAnimatedScore(score);
      }
    }, duration / frames);
    
    return () => clearInterval(interval);
  }, [score, animatedScore]);
  
  // Calculate percentage and arc properties
  const percentage = (score / maxScore) * 100;
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;
  
  // Determine color based on score percentage
  const getColor = (): string => {
    if (percentage >= 80) return "text-green-500";
    if (percentage >= 60) return "text-blue-500";
    if (percentage >= 40) return "text-yellow-500";
    if (percentage >= 20) return "text-orange-500";
    return "text-red-500";
  };
  
  return (
    <div className="flex flex-col items-center justify-center">
      <div className={`${titleSize} font-medium text-gray-600 mb-2`}>{title}</div>
      <div className={`relative ${gaugeSize} flex items-center justify-center`}>
        {/* Background circle */}
        <svg className="w-full h-full" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke="#e6e6e6"
            strokeWidth="8"
            className="opacity-25"
          />
          {/* Foreground circle */}
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            transform="rotate(-90 50 50)"
            className={getColor()}
          />
        </svg>
        
        {/* Score display */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className={`${fontSize} font-bold ${getColor()}`}>
            {Math.round(animatedScore)}
          </div>
          <div className="text-xs text-gray-500">
            out of {maxScore}
          </div>
        </div>
      </div>
    </div>
  );
}