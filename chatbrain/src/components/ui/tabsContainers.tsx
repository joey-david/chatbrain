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
    <div className="max-w-6xl mx-auto rounded-lg shadow overflow-hidden">
      {/* Tab Headers */}
      <div className="flex">
        {tabs.map((tab, index) => (
          <button
            key={index}
            onClick={() => handleTabClick(index)}
            className={`rounded-none flex-1 px-4 py-3 text-lg font-light transition-colors 
              ${index === activeTab
                ? 'bg-primary/0 text-white'
                : 'text-white bg-primary/50 hover:bg-muted-foreground/20'}`}
          >
            {tab.title}
          </button>
        ))}
      </div>

      {/* Single active tab content (no sliding) */}
      <div className="relative overflow-hidden" style={{ minHeight: 200 }}>
        <div className="w-full p-6">
          {tabs[activeTab].component}
        </div>
      </div>
    </div>
  )
}

export default TabsContainer