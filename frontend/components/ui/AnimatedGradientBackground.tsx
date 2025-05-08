import React from 'react';

export function AnimatedGradientBackground({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* Animated gradient blobs with random movement and merging */}
      <div className="absolute inset-0 -z-10 pointer-events-none">
        <div className="absolute top-[10%] left-[5%] w-[40vw] h-[40vw] rounded-full bg-pink-500 opacity-40 blur-3xl mix-blend-lighten animate-blob1" />
        <div className="absolute top-[30%] left-[60%] w-[35vw] h-[35vw] rounded-full bg-blue-500 opacity-35 blur-3xl mix-blend-lighten animate-blob2" />
        <div className="absolute top-[60%] left-[20%] w-[30vw] h-[30vw] rounded-full bg-yellow-400 opacity-30 blur-3xl mix-blend-lighten animate-blob3" />
        <div className="absolute top-[50%] left-[70%] w-[28vw] h-[28vw] rounded-full bg-green-400 opacity-30 blur-3xl mix-blend-lighten animate-blob4" />
        <div className="absolute top-[15%] left-[40%] w-[32vw] h-[32vw] rounded-full bg-purple-500 opacity-25 blur-3xl mix-blend-lighten animate-blob5" />
      </div>
      {children}
    </div>
  );
}

// Add the following to your global CSS (e.g., globals.css):
//
// @keyframes blob1 { 0%,100%{transform:translate(0,0) scale(1);} 33%{transform:translate(10vw,8vh) scale(1.1);} 66%{transform:translate(-8vw,12vh) scale(0.95);} }
// @keyframes blob2 { 0%,100%{transform:translate(0,0) scale(1);} 33%{transform:translate(-12vw,-10vh) scale(1.05);} 66%{transform:translate(8vw,6vh) scale(1.15);} }
// @keyframes blob3 { 0%,100%{transform:translate(0,0) scale(1);} 33%{transform:translate(6vw,-12vh) scale(1.1);} 66%{transform:translate(-10vw,8vh) scale(0.9);} }
// @keyframes blob4 { 0%,100%{transform:translate(0,0) scale(1);} 33%{transform:translate(-8vw,10vh) scale(1.2);} 66%{transform:translate(12vw,-8vh) scale(0.85);} }
// @keyframes blob5 { 0%,100%{transform:translate(0,0) scale(1);} 33%{transform:translate(8vw,-8vh) scale(1.05);} 66%{transform:translate(-6vw,10vh) scale(1.1);} }
// .animate-blob1 { animation: blob1 18s ease-in-out infinite alternate; }
// .animate-blob2 { animation: blob2 22s ease-in-out infinite alternate; }
// .animate-blob3 { animation: blob3 20s ease-in-out infinite alternate; }
// .animate-blob4 { animation: blob4 24s ease-in-out infinite alternate; }
// .animate-blob5 { animation: blob5 26s ease-in-out infinite alternate; } 