import React from 'react';
import { TextSelect, LucideFileStack, AudioLines } from 'lucide-react';
import TabsContainer from '@/components/ui/tabsContainers';

interface Step {
  title: string | JSX.Element;
  description: string;
  gif?: boolean;
}

const HowTo = () => {
  const tabs = [
    { title: <><TextSelect className="inline-block w-4 h-4 mr-2" />Free text</>, component: <p>toimp</p> },
    { title: <><LucideFileStack className="inline-block w-4 h-4 mr-2" />Logs/Screenshots</>, component: <p>toimp</p> },
    { title: <><AudioLines className="inline-block w-4 h-4 mr-2" />Audio recordings</>, component: <p>toimp</p> }
  ];

  return <TabsContainer tabs={tabs}/>;
};

export default HowTo;