import React from "react"
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid } from "recharts"

interface UserData {
  number_messages: number
  number_characters: number
}

interface MetadataAnalysisResults {
  total_messages: number
  total_characters: number
  [username: string]: number | UserData // For user-specific stats
}

export function MetadataResults({ data }: { data: MetadataAnalysisResults }) {
  if (data.total_characters === 0) {
    return (
      <div className="inline-flex flex-col justify-center items-center mx-auto px-4 mt-10">
        <p className="text-center text-md mt-3">
          No valid formatting detected, unable to parse metadata.
        </p>
        <p className="text-center mt-1 text-md">
          Please use the following format for each message:
        </p>
        <p className="text-center text-md mt-5 mb-1 border-2 border-gray-500 p-2">
          <code className="">John — 01/02/25, 12:34 AM: *message from the user*</code>
        </p>
      </div>
    )
  }

  const userKeys = Object.keys(data).filter(
    (key) => key !== "total_messages" && key !== "total_characters"
  )

  // Define the metrics (categories) to plot
  const categories = [
    { key: "messages", label: "number of messages sent" },
    { key: "percentage_messages", label: "total messages sent %" },
    { key: "percentage_characters", label: "total chars. typed %" },
    { key: "average_message_length", label: "avg chars./message" }
  ]

  // Pivot the data so that each category is on the x-axis, with each user as a series
  const chartData = categories.map(({ key, label }) => {
    const row: any = { category: label }
    userKeys.forEach((username) => {
      const userStats = data[username] as UserData
      switch (key) {
        case "messages":
          row[username] = userStats.number_messages
          break
        case "percentage_messages":
          row[username] = ((userStats.number_messages / data.total_messages) * 100).toFixed(2)
          break
        case "percentage_characters":
          row[username] = ((userStats.number_characters / data.total_characters) * 100).toFixed(2)
          break
        case "average_message_length":
          row[username] = (userStats.number_characters / userStats.number_messages).toFixed(2)
          break
        default:
          row[username] = 0
      }
    })
    return row
  })

  // Simple color palette for each user
  const colorPalette = ["rgb(194, 188, 255)", "rgb(107, 203, 255)", "rgb(150, 187, 139)", "rgb(95, 139, 126)", "rgb(90, 44, 44)"]

  return (
    <div>
      <hr className="border-t-2 border-gray-500 mt-10" />
      <div className="w-full justify-center space-y-8 mt-6 bg-card/0 transition duration-300 ease-in-out">
        <h1 className="text-white text-3xl mt-8">Metadata Analysis</h1>
        {/* Global stats */}
        <div className="flex justify-center w-full mt-5">
          <div className="flex flex-col items-center justify-center px-12 py-4 rounded-lg bg-black/25 max-w-xl">
            <h2 className="text-xl font-bold mb-4">Global Metrics</h2>
            <div className="mb-2">Total Messages: <code className="font-semibold">{data.total_messages}</code></div>
            <div className="">Total Characters: <code className="font-semibold">{data.total_characters}</code></div>
          </div>
        </div>
        <div className="flex justify-center w-full">
          <div className="w-[52rem] h-96 rounded-lg p-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} width={1152}>
                <CartesianGrid strokeDasharray="3 3" stroke="white" />
                <XAxis dataKey="category" stroke="white" />
                <YAxis stroke="white" />
                <Tooltip />
                <Legend />
                {userKeys.map((user, index) => (
                  <Bar
                    key={user}
                    dataKey={user}
                    fill={colorPalette[index % colorPalette.length]}
                    name={user}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MetadataResults