import React from 'react';
import { motion } from 'framer-motion';

const Loading = ({ className = "" }) => {
  return (
    <motion.div 
      className={`relative flex flex-col items-center justify-center ${className}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="relative w-20 h-20 mb-4">
        {/* Animated circles */}
        <motion.div
          className="absolute inset-0 border-4 border-transparent border-t-blue-500 rounded-full"
          animate={{ rotate: 360 }}
          transition={{ 
            repeat: Infinity, 
            duration: 1, 
            ease: "linear" 
          }}
        />
        <motion.div
          className="absolute inset-2 border-4 border-transparent border-t-purple-500 rounded-full"
          animate={{ rotate: -360 }}
          transition={{ 
            repeat: Infinity, 
            duration: 1.5, 
            ease: "linear" 
          }}
        />
      </div>
      
      {/* Text with fading animation */}
      <motion.p
        className="text-white text-lg font-medium"
        initial={{ opacity: 0.5 }}
        animate={{ opacity: 1 }}
        transition={{ 
          repeat: Infinity, 
          repeatType: "reverse", 
          duration: 1.5 
        }}
      >
        Loading...
      </motion.p>
      
      {/* Progress bar */}
      <div className="w-48 h-1 bg-gray-700 rounded-full mt-4 overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
          initial={{ width: 0 }}
          animate={{ width: "100%" }}
          transition={{ 
            repeat: Infinity, 
            repeatType: "loop", 
            duration: 2,
            ease: "easeInOut"
          }}
        />
      </div>
    </motion.div>
  );
};

export default Loading;