import TabsContainer from '@/components/ui/tabsContainers';
import { Analysis } from '@/components/pages/analysis';
import HowTo from '@/components/pages/howTo';
import { Brain, LucideCircleHelp } from 'lucide-react'; // Replace with actual icon names

function Use() {
  return (
    <div className="bg-black/60 rounded-lg">
      <TabsContainer tabs={[
        { title: <><Brain className="inline-block w-4 h-4 mr-4 mb-0.5" />Analyze</>, component: <Analysis /> },
        { title: <><LucideCircleHelp className="inline-block w-4 h-4 mr-4 mb-0.5" />Usage guide</>, component: <HowTo /> }
      ]} />
    </div>
  )
}

export { Use }