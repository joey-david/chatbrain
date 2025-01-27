import TabsContainer from '@/components/ui/tabsContainers';
import { Analysis } from '@/components/pages/analysis';
import HowTo from '@/components/pages/howTo';


function Use() {
  return (
    <div className="bg-black/60 rounded-lg">
      <TabsContainer tabs={[
        { title: "Analyze", component: <Analysis /> },
        { title: "How to use chatbrain", component: <HowTo /> }
      ]} />
    </div>
  )
}

export { Use }