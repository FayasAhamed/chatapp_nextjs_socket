"use client";

import React, { useEffect, useState } from "react";
import { socket } from "@/lib/socketClient";
import ChatForm from "@/components/ChatForm";
import ChatMessage from "@/components/ChatMessage";

export default function Home() {
  const [room, setRoom] = useState("")
  const [joined, setJoined] = useState(false)
  const [userName, setUserName] = useState("")
  const [messages, setMessages] = useState<
    Array<{message: string; sender: string;}>
  >([])

  const handleSendMessage = (message: string) => {
    const data = {room, message, sender: userName};
    setMessages((prev) => [...prev, {message, sender: userName}]);
    socket.emit('message', data)
  }

  const handleJoin = () => {
    if (userName && room) {
      socket.emit('join-room', { room, userName });
      setJoined(true)
    }
  }

  useEffect(() => {
    socket.on('user_joined', (message) => {
      setMessages((prev) => [...prev, { sender: "system", message }]);
    })

    socket.on('message', (data) => {
      setMessages((prev) => [...prev, data]);
    })

    return () => {
      socket.off('user_joined');
      socket.off('message');
    }
  })

  return (
    <div className="w-full flex mt-24 justify-center">
      {!joined ? (
        <div className="max-w-3xl w-full flex flex-col items-center gap-2">
          <h1 className="text-4xl font-bold text-left mb-8">
            Join a Room
          </h1>
          <input
            type="text"
            placeholder="Enter your User Name"
            value={userName}
            onChange={(e) => {setUserName(e.target.value)}}
            className="w-64 px-4 py-2 border-1 border-gray-300 rounded-lg"
          />
          <input
            type="text"
            placeholder="Enter Room to Join"
            value={room}
            onChange={(e) => {setRoom(e.target.value)}}
            className="w-64 px-4 py-2 border-1 border-gray-300 rounded-lg"
          />
          <button
            onClick={handleJoin}
            className="px-4 py-2 rounded-lg bg-blue-500 text-white"
          >
            Join Room
          </button>
        </div>
      ) : (
        <div className="max-w-3xl w-full mx-auto">
          <h1 className="text-4xl font-bold text-left mb-8">
            Chat Room: {room}
          </h1>
          <div className="h-[500px] overflow-y-auto p-4 mb-4 bg-gray-200 border-1 border-gray-300 rounded-lg">
            {messages.map((item) => (
              <ChatMessage
                key={crypto.randomUUID()}
                message={item.message}
                sender={item.sender}
                isOwnMessage={item.sender == userName}
                />
              ))}
          </div>
          <div className="mb-20">
            <ChatForm onSendMessage={handleSendMessage}></ChatForm>
          </div>
        </div>
      )}
    </div>
  );
}
