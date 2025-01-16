// filepath: /home/joey/Projects/py-scripts/chatbrain/chatbrain/src/components/ChatbrainLogo.tsx
import React from 'react'
import chatbrainLogo from '@/assets/chatbrain_logo.png'
import classNames from 'classnames'

interface ChatbrainLogoProps {
    className?: string
}

const ChatbrainLogo: React.FC<ChatbrainLogoProps> = ({ className }) => {
    return <img src={chatbrainLogo} alt="Chatbrain Logo" className={classNames("h-12 w-auto", className)} />
}

export default ChatbrainLogo