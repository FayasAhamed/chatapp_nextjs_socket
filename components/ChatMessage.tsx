import React from "react";

interface ChatMessageProps {
    isOwnMessage: boolean;
    message: string;
    sender: string;
}

const ChatMessage = ({
    isOwnMessage, message, sender
}: ChatMessageProps) => {
    const isSystemMessage = sender == 'system';

    return (
        <div
            className={`flex ${
                isSystemMessage ?
                'justify-center' :
                isOwnMessage ?
                'justify-end':
                'justify-start'
            } mb-3`}
        >
            <div
                className={`max-w-xs px-4 py-2 rounded-lg ${
                    isSystemMessage ?
                    'bg-gray-800 text-white text-center text-xs' :
                    isOwnMessage ?
                    'bg-blue-900 text-white':
                    'bg-white text-black'
                }`}
            >
                {!isSystemMessage && <p className="text-sm font-bold">{sender}</p>}
                <p>{message}</p>
            </div>
        </div>
    )
}

export default ChatMessage
