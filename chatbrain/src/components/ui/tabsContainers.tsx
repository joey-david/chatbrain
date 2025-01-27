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
    <div className="w-full max-w-4xl mx-auto bg-card border border-border rounded-lg shadow overflow-hidden">
    {/* Tab Headers */}
        <div className="flex">
        {tabs.map((tab, index) => (
            <button
            key={index}
            onClick={() => handleTabClick(index)}
            className={`flex-1 px-4 py-3 text-sm font-medium relative transition-colors
                ${index === activeTab 
                  ? 'text-primary bg-primary/10'
                  : 'text-foreground hover:bg-muted-foreground/10'
                }`}              
            >
                {tab.title}
                {index === activeTab && (
                <motion.div 
                    className="absolute bottom-0 left-0 w-full h-1 bg-primary"
                    layoutId="tab-underline"
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                />
                )}
            </button>
            ))}
        </div>

      {/* Tab Content */}
      <div className="relative overflow-visible min-h-[200px]">
          <AnimatePresence mode='wait' custom={direction}>
          <motion.div
            key={activeTab}
            custom={direction}
            variants={slideVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="absolute inset-0 p-6"
          >
            {tabs[activeTab].component}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}

export default TabsContainer