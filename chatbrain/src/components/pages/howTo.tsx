import { TextSelect, LucideFileStack, AudioLines } from 'lucide-react';
import TabsContainer from '@/components/ui/tabsContainers';
import TextTutorial from '@/components/tutorials/howToText';
import ImageTutorial from '@/components/tutorials/howToImage';
import AudioTutorial from '@/components/tutorials/howToAudio';

const HowTo = () => {
  const tabs = [
    { title: <><TextSelect className="inline-block w-4 h-4 mr-2" />Copy/Paste or Type</>, component: <TextTutorial /> },
    { title: <><LucideFileStack className="inline-block w-4 h-4 mr-2" />Chat Logs or Screenshots</>, component: <ImageTutorial /> },
    { title: <><AudioLines className="inline-block w-4 h-4 mr-2" />Audio recordings</>, component: <AudioTutorial /> }
  ];

  return <TabsContainer tabs={tabs}/>;
};

export default HowTo;