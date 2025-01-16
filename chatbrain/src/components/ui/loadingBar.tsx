import { useEffect, useState } from "react"

interface LoadingBarProps {
  progress: number;
  status: string;
}

export function LoadingBar({ progress, status }: LoadingBarProps) {
  return (
    <div className="p-4 w-full max-w-xl mx-auto">
      <p className="text-center mb-2 font-medium">
        {status || "Initializing..."}
      </p>
      <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
        <div
          className="bg-blue-600 h-2.5 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="text-center text-sm text-gray-500 mt-2">
        {progress}% Complete
      </p>
    </div>
  )
}