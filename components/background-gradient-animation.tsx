import React from 'react';

const AnimatedGradientBackground = ({ children }) => {
  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Main animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-400 via-pink-500 to-red-500 animate-gradient-x"></div>
      
      {/* Secondary animated layer for more complex animation */}
      <div className="absolute inset-0 bg-gradient-to-tr from-blue-400 via-purple-500 to-pink-500 opacity-70 animate-gradient-y"></div>
      
      {/* Third layer for depth */}
      <div className="absolute inset-0 bg-gradient-to-bl from-green-400 via-blue-500 to-purple-500 opacity-50 animate-gradient-xy"></div>
      
      {/* Floating orbs for extra visual interest */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-gradient-to-r from-yellow-400 to-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
      <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-gradient-to-r from-purple-400 to-yellow-400 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-gradient-to-r from-pink-400 to-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      
      {/* Content overlay */}
      <div className="relative z-50">
        {children || (
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center text-white">
              <h1 className="text-6xl font-bold mb-4 drop-shadow-2xl">
                Beautiful Gradient
              </h1>
              <p className="text-xl opacity-90 drop-shadow-lg">
                Animated background for your Next.js app
              </p>
            </div>
          </div>
        )}
      </div>
      
      <style jsx>{`
        @keyframes gradient-x {
          0%, 100% {
            transform: translateX(0%) rotate(0deg);
          }
          50% {
            transform: translateX(100%) rotate(180deg);
          }
        }
        
        @keyframes gradient-y {
          0%, 100% {
            transform: translateY(0%) rotate(0deg);
          }
          50% {
            transform: translateY(-100%) rotate(180deg);
          }
        }
        
        @keyframes gradient-xy {
          0%, 100% {
            transform: translate(0%, 0%) rotate(0deg);
          }
          25% {
            transform: translate(-50%, -50%) rotate(90deg);
          }
          50% {
            transform: translate(50%, -50%) rotate(180deg);
          }
          75% {
            transform: translate(-50%, 50%) rotate(270deg);
          }
        }
        
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1) rotate(0deg);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1) rotate(120deg);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9) rotate(240deg);
          }
          100% {
            transform: translate(0px, 0px) scale(1) rotate(360deg);
          }
        }
        
        .animate-gradient-x {
          animation: gradient-x 15s ease infinite;
        }
        
        .animate-gradient-y {
          animation: gradient-y 20s ease infinite;
        }
        
        .animate-gradient-xy {
          animation: gradient-xy 25s ease infinite;
        }
        
        .animate-blob {
          animation: blob 7s infinite;
        }
        
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
};

export default AnimatedGradientBackground;