import React from 'react';
import styles from './background-gradient-animation.module.css';

interface AnimatedGradientBackgroundProps {
  children: React.ReactNode;
}

const AnimatedGradientBackground: React.FC<AnimatedGradientBackgroundProps> = ({ children }) => {
  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Main animated gradient background */}
      <div className={`absolute inset-0 bg-gradient-to-br from-purple-400 via-pink-500 to-red-500 ${styles.animateGradientX}`}></div>
      
      {/* Secondary animated layer for more complex animation */}
      <div className={`absolute inset-0 bg-gradient-to-tr from-blue-400 via-purple-500 to-pink-500 opacity-70 ${styles.animateGradientY}`}></div>
      
      {/* Third layer for depth */}
      <div className={`absolute inset-0 bg-gradient-to-bl from-green-400 via-blue-500 to-purple-500 opacity-50 ${styles.animateGradientXY}`}></div>
      
      {/* Floating orbs for extra visual interest */}
      <div className={`absolute top-1/4 left-1/4 w-72 h-72 bg-gradient-to-r from-yellow-400 to-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 ${styles.animateBlob}`}></div>
      <div className={`absolute top-1/3 right-1/4 w-72 h-72 bg-gradient-to-r from-purple-400 to-yellow-400 rounded-full mix-blend-multiply filter blur-xl opacity-70 ${styles.animateBlob} ${styles.animationDelay2000}`}></div>
      <div className={`absolute bottom-1/4 left-1/3 w-72 h-72 bg-gradient-to-r from-pink-400 to-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-70 ${styles.animateBlob} ${styles.animationDelay4000}`}></div>
      
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
      

    </div>
  );
};

export default AnimatedGradientBackground;