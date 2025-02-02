import { useState, ReactNode } from 'react'

interface Tab {
  title: ReactNode
  component: ReactNode
}

interface TabsContainerProps {
  tabs: Tab[]
}

const TabsContainer = ({ tabs }: TabsContainerProps) => {
  const [activeTab, setActiveTab] = useState(0)

  const handleTabClick = (index: number) => {
    setActiveTab(index)
  }

  return (
    <div className="w-100vw max-w-6xl mx-auto md:rounded-lg shadow overflow-hidden">
      {/* Tab Headers */}
      <div className="flex flex-col md:flex-row">
        {tabs.map((tab, index) => (
            <button
            key={index}
            onClick={() => handleTabClick(index)}
            className={`rounded-none flex-1 md:px-4 md:py-3 text-md md:text-lg font-light transition-colors 
              ${index === activeTab
              ? 'bg-white/20 text-white'
              : 'text-gray-300 bg-primary/50 hover:bg-muted-foreground/20'}`}
            >
            {tab.title}
            </button>
        ))}
      </div>

      {/* Single active tab content (no sliding) */}
      <div className="relative overflow-hidden" style={{ minHeight: 200 }}>
        <div className="w-full py-4 md:p-6">
          {tabs[activeTab].component}
        </div>
      </div>
    </div>
  )
}

export default TabsContainer
