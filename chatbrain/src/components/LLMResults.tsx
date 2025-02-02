import React from 'react';
import { BrainCircuit } from 'lucide-react';

interface ConversationMetrics {
  linguistic_synchrony_score: number;
  trust_asymetry_score: number;
  temporal_engagement_score: number;
}

interface UserMetrics {
  emotional_complexity: number;
  social_perception: number;
  cognitive_dissonance: number;
  vulnerability_activation: number;
  temporal_consistency: number;
  trust: number;
  conceptual_proficiency: number;
}


interface ResultsData {
  conversation_metrics: ConversationMetrics;
  users: {
    [username: string]: UserMetrics;
  };
  insights: string[];
}

const explanations = {
  conversation_metrics: {
    linguistic_synchrony_score: "How users subconsciously mirror communication patterns (vocabulary, sentence length, emoji use)",
    trust_asymetry_score: "Imbalanced reliance levels measured through vulnerability disclosures",
    temporal_engagement_score: "Consistency of involvement across conversation timeline"
  },
  user_metrics: {
    emotional_complexity: "Nuance range in emotional expression (1D anger->5D wistful nostalgia)",
    social_perception: "Accuracy in interpreting others' unstated needs",
    cognitive_dissonance: "Contradictions between stated values and behavioral patterns",
    vulnerability_activation: "Frequency of self-disclosure triggers",
    temporal_consistency: "Personality stability across conversation timeline",
    trust: "Implicit faith in others measured through delegation frequency",
    conceptual_proficiency: "Ability to grasp complex ideas and explain them clearly"
  }
};

const GradientScoreBar = ({ value }: { value: number }) => {
  // Function to interpolate between two colors based on value
  const interpolateColor = (value: number) => {
    // Using CSS variables from your theme
    const lowColor = { h: 354, s: 70, l: 35 };  // Deep burgundy red
    const midColor = { h: 280, s: 50, l: 45 };  // Rich purple
    const highColor = { h: 210, s: 80, l: 65 }; // Bright sky blue

    let h, s, l;
    
    if (value <= 50) {
      // Interpolate between low and mid
      const t = value / 50;
      h = lowColor.h + t * (midColor.h - lowColor.h);
      s = lowColor.s + t * (midColor.s - lowColor.s);
      l = lowColor.l + t * (midColor.l - lowColor.l);
    } else {
      // Interpolate between mid and high
      const t = (value - 50) / 50;
      h = midColor.h + t * (highColor.h - midColor.h);
      s = midColor.s + t * (highColor.s - midColor.s);
      l = midColor.l + t * (highColor.l - midColor.l);
    }

    return `hsl(${h}, ${s}%, ${l}%)`;
  };

  return (
    <div className="relative h-2 w-full bg-muted rounded-full overflow-hidden">
      <div
        className="absolute bottom-0 h-full transition-all duration-300 ease-in-out"
        style={{
          width: `${value}%`,
          backgroundColor: interpolateColor(value)
        }}
      />
    </div>
  );
};

const ScoreRow = ({ label, value }: { label: string; value: number }) => (
  <div className="flex items-center gap-4 mb-3">
    <span className="w-32 text-sm text-gray-400">{label}</span>
    <div className="flex-1">
      <GradientScoreBar value={value} />
    </div>
    <span className="w-12 text-right text-sm font-medium">{value}</span>
  </div>
);

const Card = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`text-gray-200 rounded-2xl shadow-sm ${className || ""}`}>
    {children}
  </div>
);

const ExplanationCard = () => (
  <Card className="bg-black/10 w-full md:max-w-3xl mx-auto text-left">
    <div className="p-6">
      <h2 className="text-xl mb-6 text-center">Explanation of Metrics</h2>
      <div className="space-y-4">
        <h3 className="text-lg mb-2 text-center">Conversation Metrics</h3>
        {Object.entries(explanations.conversation_metrics).map(([key, explanation]) => (
          <div key={key} className="text-sm text-gray-400">
            <strong>{key.replace(/_/g, ' ')}:</strong> {explanation}
          </div>
        ))}
        <h3 className="text-lg mt-4 mb-2 text-center">User Metrics</h3>
        {Object.entries(explanations.user_metrics).map(([key, explanation]) => (
          <div key={key} className="text-sm text-gray-400">
            <strong>{key.replace(/_/g, ' ')}:</strong> {explanation}
          </div>
        ))}
      </div>
    </div>
  </Card>
);

export function LLMResults({ data }: { data: ResultsData }) {
  const { conversation_metrics, users, insights } = data;

  return (
    <div className="w-full max-w-full md:max-w-7xl mx-auto space-y-8 mt-2 mb-6 transition duration-300 ease-in-out">
      {/* Conversation Metrics */}
      <div className='max-w-[832px] border-t-2 border-gray-500 mx-auto'/>
      <h1 className="text-white text-3xl mt-8"><BrainCircuit className='inline mb-1 mr-3 w-8 h-8 animate-pulse'/>LLM Feedback</h1>
      
      {/* Explanation Card */}
      <ExplanationCard />

      <div className="flex justify-center w-full">
        <Card className="bg-black/35 w-full max-w-xl">
          <div className="p-6">
            <h2 className="text-xl mb-6">Conversation Dynamics</h2>
            <ScoreRow label="Linguistic Synchrony" value={conversation_metrics.linguistic_synchrony_score} />
            <ScoreRow label="Trust Asymmetry" value={conversation_metrics.trust_asymetry_score} />
            <ScoreRow label="Temporal Engagement" value={conversation_metrics.temporal_engagement_score} />
          </div>
        </Card>
      </div>

      {/* User Metrics */}
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-${Math.min(Object.keys(users).length, 3)} md:divide-x-2 md:divide-gray-500/50 gap-6 bg-black/35 border-border text-center rounded-lg`}>
      {Object.entries(users).map(([username, metrics]) => (
        <Card key={username} className="bg-black/0 rounded-none">
          <div className="p-6">
        <h3 className="text-lg mb-6">{username}</h3>
        <div className="space-y-4">
          <ScoreRow label="Emotional Complexity" value={metrics.emotional_complexity} />
          <ScoreRow label="Social Perception" value={metrics.social_perception} />
          <ScoreRow label="Cognitive Dissonance" value={metrics.cognitive_dissonance} />
          <ScoreRow label="Vulnerability Activation" value={metrics.vulnerability_activation} />
          <ScoreRow label="Temporal Consistency" value={metrics.temporal_consistency} />
          <ScoreRow label="Trust" value={metrics.trust} />
          <ScoreRow label="Conceptual proficiency" value={metrics.conceptual_proficiency} />
        </div>
          </div>
        </Card>
      ))}
      </div>

      {/* Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
      {insights.slice(0, 2).map((insight, idx) => (
        <Card key={idx} className="bg-black/35">
        <div className="p-6 rounded-lg text-justify">
          <h3 className="text-lg font-medium mb-4 text-center">Insight {idx + 1}</h3>
          {insight}
        </div>
        </Card>
      ))}
      </div>
      {insights.length > 2 && (
      <div className="grid grid-cols-1 gap-6 mt-6">
        <Card className="bg-black/35">
        <div className="p-6 rounded-lg text-justify">
          <h3 className="text-lg font-medium mb-4 text-center">Insight 3</h3>
          {insights[2]}
        </div>
        </Card>
      </div>
      )}
    </div>
  );
}

export default LLMResults;