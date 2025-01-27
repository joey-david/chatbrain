import TabsContainer from '@/components/ui/tabsContainers';
import { Analysis } from '@/components/pages/analysis';
import HowTo from '@/components/pages/howTo';


function Use() {
  return (
    <TabsContainer tabs={[
      { title: "Text", component: <Analysis /> },
      { title: "How to use chatbrain", component: <HowTo /> }
    ]} />
  )
}

export { Use }