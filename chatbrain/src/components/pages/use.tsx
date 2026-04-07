import TabsContainer from '@/components/ui/tabsContainers';
import { Analysis } from '@/components/pages/analysis';
import HowTo from '@/components/pages/howTo';
import { Brain, LucideCircleHelp } from 'lucide-react'; // Replace with actual icon names

function Use() {
  return (
    <div className="mx-auto w-full max-w-6xl rounded-[2rem] border border-white/10 bg-white/[0.03] shadow-[0_0_0_1px_rgba(255,255,255,0.02)]">
      <TabsContainer tabs={[
        { title: <><Brain className="inline-block w-4 h-4 mr-4 mb-0.5" />Analyze a conversation</>, component: <Analysis /> },
        { title: <><LucideCircleHelp className="inline-block w-4 h-4 mr-4 mb-0.5" />How to analyze</>, component: <HowTo /> }
      ]} />
    </div>
  )
}

export { Use }
