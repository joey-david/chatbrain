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
    <div className="mx-auto max-w-6xl overflow-hidden rounded-[2rem]">
      <div className="flex flex-wrap gap-2 border-b border-white/10 px-4 py-4 md:px-6">
        {tabs.map((tab, index) => (
          <button
            key={index}
            onClick={() => handleTabClick(index)}
            className={`rounded-full px-4 py-2.5 text-sm md:text-base transition-colors 
              ${index === activeTab
                ? 'bg-white text-black'
                : 'text-zinc-400 hover:bg-white/6 hover:text-white'}`}
          >
            {tab.title}
          </button>
        ))}
      </div>

      <div className="relative overflow-hidden" style={{ minHeight: 200 }}>
        <div className="w-full p-4 md:p-6">
          {tabs[activeTab].component}
        </div>
      </div>
    </div>
  )
}

export default TabsContainer
