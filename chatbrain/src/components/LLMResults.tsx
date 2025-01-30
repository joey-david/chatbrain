import React from 'react';

interface ConversationMetrics {
  stability_score_out_of_100: number;
  health_score_out_of_100: number;
  intensity_score_out_of_100: number;
}

interface UserMetrics {
  [username: string]: {
    assertiveness: number;
    positiveness: number;
    affection_towards_other: number;
    romantic_attraction_towards_other: number;
    rationality: number;
    emotiveness: number;
    IQ_estimate: number;
  }
}

interface ResultsData {
  conversation_metrics: ConversationMetrics;
  users: UserMetrics;
  insights: string[];
}

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

export function LLMResults({ data }: { data: ResultsData }) {
  const { conversation_metrics, users, insights } = data;

  return (
    <div className="w-full max-w-7xl mx-auto space-y-8 mt-2 mb-6 transition duration-300 ease-in-out">
      {/* Conversation Metrics */}
      <div className='max-w-[832px] border-t-2 border-gray-500 mx-auto'/>
      <h1 className="text-white text-3xl mt-8">Large Language Model Feedback</h1>
      <div className="flex justify-center w-full">
        <Card className="bg-black/35 w-full max-w-xl">
          <div className="p-6">
            <h2 className="text-xl mb-6">Conversation Metrics</h2>
            <ScoreRow label="Stability" value={conversation_metrics.stability_score_out_of_100} />
            <ScoreRow label="Healthiness" value={conversation_metrics.health_score_out_of_100} />
            <ScoreRow label="Intensity" value={conversation_metrics.intensity_score_out_of_100} />
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
          <ScoreRow label="Assertiveness" value={metrics.assertiveness} />
          <ScoreRow label="Positiveness" value={metrics.positiveness} />
          <ScoreRow label="Affection" value={metrics.affection_towards_other} />
          <ScoreRow label="Rom. Attraction" value={metrics.romantic_attraction_towards_other} />
          <ScoreRow label="Rationality" value={metrics.rationality} />
          <ScoreRow label="Emotiveness" value={metrics.emotiveness} />
          <ScoreRow label="IQ Estimate" value={metrics.IQ_estimate} />
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