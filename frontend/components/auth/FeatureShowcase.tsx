'use client'

import { motion } from 'framer-motion'
import { FaChartLine, FaShieldAlt, FaBolt, FaSearch } from 'react-icons/fa'

const features = [
  {
    icon: <FaSearch className="w-8 h-8" />,
    title: "Advanced Website Analysis",
    description: "Comprehensive scanning and analysis of websites for security vulnerabilities and performance issues."
  },
  {
    icon: <FaShieldAlt className="w-8 h-8" />,
    title: "Security Assessment",
    description: "In-depth security checks and vulnerability assessments to protect your web applications."
  },
  {
    icon: <FaChartLine className="w-8 h-8" />,
    title: "Performance Metrics",
    description: "Detailed performance analytics and optimization recommendations for better user experience."
  },
  {
    icon: <FaBolt className="w-8 h-8" />,
    title: "Real-time Monitoring",
    description: "Continuous monitoring and instant alerts for any security or performance issues."
  }
]

export default function FeatureShowcase() {
  return (
    <div className="hidden lg:flex flex-col justify-center items-start p-12 text-white">
      <motion.h1 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="text-4xl font-bold mb-6"
      >
        Website Analysis Tool
      </motion.h1>
      
      <motion.p 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="text-xl mb-12 text-white/80"
      >
        Your all-in-one solution for website security and performance analysis
      </motion.p>

      <div className="grid gap-8">
        {features.map((feature, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
            className="flex items-start gap-4"
          >
            <div className="p-3 bg-white/10 rounded-lg backdrop-blur-lg">
              {feature.icon}
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-white/70">{feature.description}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
} 