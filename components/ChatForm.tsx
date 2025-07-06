"use client";

import React, { useState } from 'react';

const ChatForm = ({
    onSendMessage,
}:{
    onSendMessage: (message: string) => void,
}) => {
    const [message, setMessage] = useState("");
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (message.trim() !== '') {
            onSendMessage(message)
            setMessage("")
        }
        console.log('Form submitted..')
    }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 mt-4">
        <input
            type="text"
            onChange={(e) => setMessage(e.target.value)}
            className='flex-1 px-4 border-1 border-gray-300 py-2 rounded-lg focus:outline-none'
            placeholder="Type your message..."
        />
        <button type="submit" className='px-4 py-2 rounded-lg bg-blue-500 text-white'>
            Send
        </button>
    </form>
  )
};

export default ChatForm;
