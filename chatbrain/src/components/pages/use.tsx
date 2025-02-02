import TabsContainer from '@/components/ui/tabsContainers';
import { Analysis } from '@/components/pages/analysis';
import HowTo from '@/components/pages/howTo';
import { Brain, LucideCircleHelp } from 'lucide-react'; // Replace with actual icon names



function Use() {
  return (
    <div className="bg-black/60 md:rounded-lg max-w-full">
      <TabsContainer tabs={[
        { title: <><Brain className="inline-block w-4 h-4 mr-4 mb-0.5" />Analyze a conversation</>, component: <Analysis /> },
        { title: <><LucideCircleHelp className="inline-block w-4 h-4 mr-4 mb-0.5" />How to analyze</>, component: <HowTo /> }
      ]} />
    </div>
  )
}

export { Use }