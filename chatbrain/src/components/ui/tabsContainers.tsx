import { useState, useEffect, ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface Tab {
  title: string
  component: ReactNode
}

interface TabsContainerProps {
  tabs: Tab[]
}

const TabsContainer = ({ tabs }: TabsContainerProps) => {
  const [activeTab, setActiveTab] = useState(0)
  const [direction, setDirection] = useState<'left' | 'right'>('right')
  const [prevIndex, setPrevIndex] = useState(0)

  const handleTabClick = (index: number) => {
    setDirection(index > activeTab ? 'right' : 'left')
    setPrevIndex(activeTab)
    setActiveTab(index)
  }

  const slideVariants = {
    hidden: (direction: string) => ({
      x: direction === 'right' ? '100%' : '-100%',
      opacity: 0,
    }),
    visible: {
      x: 0,
      opacity: 1,
      transition: { duration: 0.3, ease: 'easeInOut' }
    },
    exit: (direction: string) => ({
      x: direction === 'right' ? '-100%' : '100%',
      opacity: 0,
      transition: { duration: 0.3, ease: 'easeInOut' }
    })
  }

  return (
    <div className="max-w-4xl mx-auto rounded-lg shadow overflow-hidden">
      {/* Tab Headers */}
      <div className="flex">
        {tabs.map((tab, index) => (
            <button
            key={index}
            onClick={() => handleTabClick(index)}
            className={`rounded-none flex-1 px-4 py-3 text-lg font-light relative transition-colors text-white
              ${index === activeTab 
              ? 'bg-primary/0'
              : 'text-primary bg-primary/30 hover:bg-muted-foreground/20'
              }
              ${index === 0 ? 'rounded-lb-lg' : ''}
              ${index === tabs.length - 1 ? 'rounded-r-lg' : ''}`}              
            >
            {tab.title}
            </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="relative">
        <AnimatePresence mode='wait' custom={direction}>
          <motion.div
            key={activeTab}
            custom={direction}
            variants={slideVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="w-full p-6"
          >
            {tabs[activeTab].component}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}

export default TabsContainer