"use client";

import React, { useEffect, useState } from "react";

import { socket } from "@/lib/socketClient";
import ChatForm from "@/components/ChatForm";
import ChatMessage from "@/components/ChatMessage";

type User = {
  id: number,
  name: string,
  email: string
}

export default function Home() {
  const [room, setRoom] = useState("")
  const [joined, setJoined] = useState(false)
  const [userName, setUserName] = useState("")
  const [email, setEmail] = useState("")

  const [user, setUser] = useState<User | null>(null)
  const [signedIn, setSignedIn] = useState(false)
  const [userNameRequired, setUserNameRequired] = useState(false)
  const [messages, setMessages] = useState<
    Array<{message: string; sender: string;}>
  >([])

  const handleSignIn = async () => {
    if (email) {
      const response = await fetch(`/api/user?email=${email}`);
      const userData = (await response.json()).data;
      if (userData) {
        setSignedIn(true);
        setUser(userData);

        return
      }

      // new user register
      if (userName) {
        const response = await fetch('/api/user', {
          method: 'POST',
          body: JSON.stringify({
            name: userName,
            email: email
          })
        })
        if (response.ok) {
          alert(`New user '${userName}' with email: '${email}' created`);
          setSignedIn(true);
          setUser((await response.json()).data)
        }
      } else {
        setUserNameRequired(true)
      }
    }
  }

  const handleJoin = async () => {
    if (room) {
      const response = await fetch(`/api/room?name=${room}`)
      if ((await response.json()).data) {
        console.log(room, user)
        socket.emit('join-room', { room, user: (user as User).id });
        setJoined(true)
      } else {
        alert('Room not found')
      }
    }
  }

  const handleCreateRoom = async () => {
    if (room) {
      const response = await fetch('/api/room', {
        method: 'POST',
        body: JSON.stringify({
          type: 'create',
          room: room,
          owner: (user as User).id
        })
      })

      if (response.ok) {
        setJoined(true)
      }

    }
  }

  const handleSendMessage = async (message: string) => {
    const data = {room, message, sender: user?.email};
    setMessages((prev) => [...prev, {message, sender: user?.email as string}]);
    socket.emit('message', data)
    await fetch('/api/messages', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }

  useEffect(() => {
    // -------------- initial fetch from db ----------------
    // TODO handle unjoin room

    // -------------- socket related ----------------
    if (joined) {
      socket.on('user_joined', (message) => {
        setMessages((prev) => [...prev, { sender: "system", message }]);
      })
      
      socket.on('message', (data) => {
        setMessages((prev) => [...prev, data]);
      })

      socket.on('connect', () => {
        socket.emit('join-room', { room, user: (user as User).id });
      })

      // handle messages from db
      const getMessages = async () => {
        const response = await fetch(`/api/messages?room=${room}`)
        // default pagination will be 50, and next page token will be there if next page exists (scroll to load)
        const messages = (await response.json()).data;
        setMessages(messages)
      }
      getMessages();
    }
    
    return () => {
      socket.off('user_joined');
      socket.off('message');
      socket.off('connect');
    }
  }, [joined])

  return (
    <div className="w-full flex mt-24 justify-center">
      {!signedIn ? (
        <div className="max-w-3xl w-full flex flex-col items-center gap-2">
          <h1 className="text-4xl font-bold text-left mb-8">
            Sign In
          </h1>
          <input
            type="text"
            placeholder="Enter your User Name"
            value={userName}
            onChange={(e) => {setUserName(e.target.value)}}
            className="w-64 px-4 py-2 border-1 border-gray-300 rounded-lg"
          />
          {userNameRequired && (<p className="text-xs text-red-800">Enter User Name to Register as new user</p>)}
          <input
            type="text"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => {setEmail(e.target.value)}}
            className="w-64 px-4 py-2 border-1 border-gray-300 rounded-lg"
          />
          <button
            onClick={handleSignIn}
            className="px-4 py-2 rounded-lg bg-blue-500 text-white"
          >
            Sign In
          </button>
        </div>
      ) : (
        !joined ? (
          <div className="max-w-3xl w-full flex justify-space-between gap-5">
            <div className="max-w-3xl w-full flex flex-col items-center gap-2">
              <h1 className="text-4xl font-bold text-left mb-8">
                Join a Room
              </h1>
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
            <h1 className="text-4xl font-bold text-left mb-8">
              OR
            </h1>
            <div className="max-w-3xl w-full flex flex-col items-center gap-2">
              <h1 className="text-4xl font-bold text-left mb-8">
                Create a Room
              </h1>
              <input
                type="text"
                placeholder="Enter Room to Join"
                value={room}
                onChange={(e) => {setRoom(e.target.value)}}
                className="w-64 px-4 py-2 border-1 border-gray-300 rounded-lg"
              />
              <button
                onClick={handleCreateRoom}
                className="px-4 py-2 rounded-lg bg-blue-500 text-white"
              >
                Create Room
              </button>
            </div>
          </div>
        ) : (
          <div className="max-w-3xl w-full mx-auto">
            <h1 className="text-4xl font-bold text-left mb-8">
              Chat Room: {room}
            </h1>
            <div className="h-[500px] overflow-y-auto p-4 mb-4 bg-gray-200 border-1 border-gray-300 rounded-lg">
              {messages.map((item) => (
                <ChatMessage
                  key={Math.random().toString(10).slice(2)}
                  message={item.message}
                  sender={item.sender}
                  isOwnMessage={item.sender == user?.email}
                  />
                ))}
            </div>
            <div className="mb-20">
              <ChatForm onSendMessage={handleSendMessage}></ChatForm>
            </div>
          </div>
        )
      )}
    </div>
  );
}
