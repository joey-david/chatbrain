import React from 'react';
import { Upload, Mic, MessageSquare } from 'lucide-react';
import TabsContainer from '@/components/ui/tabsContainers';

interface Step {
  title: string;
  description: string;
  gif?: boolean;
}

interface InputModeCardProps {
  title: string;
  description: string;
  steps: Step[];
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}

const InputModeCard: React.FC<InputModeCardProps> = ({ title, description, steps, icon: Icon }) => (
  <div className="space-y-6">
    <div className="flex items-center space-x-4">
      <div className="p-3 bg-primary/10 rounded-lg">
        <Icon className="w-6 h-6 text-primary" />
      </div>
      <h2 className="text-2xl font-semibold">{title}</h2>
    </div>
    
    <p className="text-muted-foreground">{description}</p>
    
    <div className="space-y-4">
      {steps.map((step, index) => (
        <div key={index} className="flex items-start space-x-4">
          <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-primary text-primary-foreground font-medium">
            {index + 1}
          </div>
          <div className="flex-1 space-y-2">
            <h3 className="font-medium">{step.title}</h3>
            <p className="text-sm text-muted-foreground">{step.description}</p>
            {step.gif && (
              <div className="mt-2 rounded-lg overflow-hidden">
                <img 
                  src="/api/placeholder/400/200" 
                  alt={`How to ${step.title.toLowerCase()}`}
                  className="w-full h-48 object-cover"
                />
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  </div>
);

const TextMode = () => (
  <InputModeCard
    title="Text Input"
    description="Send text messages to ChatBrain for instant responses and engaging conversations."
    icon={MessageSquare}
    steps={[
      {
        title: "Type Your Message",
        description: "Use the text input field at the bottom of the chat interface to type your message or question.",
        gif: true
      },
      {
        title: "Send Message",
        description: "Press Enter or click the send button to submit your message. ChatBrain will process your input and respond accordingly.",
        gif: true
      },
      {
        title: "Continue the Conversation",
        description: "ChatBrain remembers the context of your conversation, allowing for natural back-and-forth dialogue.",
        gif: true
      }
    ]}
  />
);

const ImageMode = () => (
  <InputModeCard
    title="Image Input"
    description="Share images with ChatBrain for analysis, recognition, and detailed discussions about visual content."
    icon={Upload}
    steps={[
      {
        title: "Select Image",
        description: "Click the image upload button or drag and drop an image file into the chat interface.",
        gif: true
      },
      {
        title: "Add Context",
        description: "Optionally, add a message to provide context about what you'd like to know about the image.",
        gif: true
      },
      {
        title: "Review Analysis",
        description: "ChatBrain will analyze the image and provide detailed observations and insights.",
        gif: true
      }
    ]}
  />
);

const AudioMode = () => (
  <InputModeCard
    title="Audio Input"
    description="Use voice commands and audio messages for a hands-free chat experience."
    icon={Mic}
    steps={[
      {
        title: "Enable Microphone",
        description: "Click the microphone icon to start recording your voice message.",
        gif: true
      },
      {
        title: "Record Message",
        description: "Speak clearly into your microphone. The interface will show audio levels as you speak.",
        gif: true
      },
      {
        title: "Send Recording",
        description: "Click the send button or stop recording to automatically send your voice message.",
        gif: true
      }
    ]}
  />
);

const HowTo = () => {
  const tabs = [
    { title: "Text", component: <TextMode /> },
    { title: "Image", component: <ImageMode /> },
    { title: "Audio", component: <AudioMode /> }
  ];

  return <TabsContainer tabs={tabs}/>;
};

export default HowTo;