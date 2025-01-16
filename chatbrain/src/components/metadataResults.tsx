import React from "react"

interface UserData {
  messages: number
  percentage_messages: number
  percentage_characters: number
  average_message_length: number
}

interface MetadataAnalysisResults {
  total_messages: number
  total_characters: number
  [username: string]: number | UserData // For user-specific stats
}

const Card = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`bg-card text-card-foreground rounded-2xl shadow-sm ${className || ""}`}>
    {children}
  </div>
)

export function MetadataResults({ data }: { data: MetadataAnalysisResults }) {
  const userKeys = Object.keys(data).filter(
    (key) => key !== "total_messages" && key !== "total_characters"
  )

  return (
    <Card className="w-full max-w-5xl mx-auto space-y-8 mt-6 bg-card/0 transition duration-300 ease-in-out">
      {/* Global stats */}
      <div className="flex justify-center w-full">
        <Card className="bg-card/40 border-2 w-full max-w-xl">
          <div className="p-6">
            <h2 className="text-xl font-bold mb-6">Global Metrics</h2>
            <div className="mb-2">Total Messages: {data.total_messages}</div>
            <div className="mb-2">Total Characters: {data.total_characters}</div>
          </div>
        </Card>
      </div>
      
      {/* Per-user stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
        {userKeys.map((username) => {
          const userStats = data[username] as UserData
          return (
            <Card key={username} className="bg-card/40 border-2">
              <div className="p-6">
                <h3 className="text-lg font-bold mb-4">{username}</h3>
                <div>Messages: {userStats.messages}</div>
                <div>Percent of Messages: {userStats.percentage_messages} %</div>
                <div>Percent of Characters: {userStats.percentage_characters} %</div>
                <div>Avg Message Length: {userStats.average_message_length}</div>
              </div>
            </Card>
          )
        })}
      </div>
    </Card>
  )
}

export default MetadataResults