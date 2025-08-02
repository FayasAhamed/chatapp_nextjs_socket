import prisma from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const roomName = searchParams.get('room');
  if (!roomName) {
    return NextResponse.json(
      { error: 'Must specify the room name' },
      { status: 400 }
    )
  }

  const room = await prisma.chatRoom.findUnique({
    where: {
        name: roomName
    }
  })

  if (!room) {
    return NextResponse.json(
      { error: `Room ${roomName} doesn't exist in db` },
      { status: 400 }
    )
  }

  const messages = await prisma.message.findMany({
    where: {
      chatId: room.id
    },
    include: {
        sender: {
            select: {
                email: true,
                name: true
            }
        }
    },
    take: 50,
  })

  return NextResponse.json({
    data: messages.map(data => ({
        sender: data.sender.email,
        message: data.content
    }))
  })
}

export async function POST(request: NextRequest) {
  const requestBody = await request.json()
  const roomName = requestBody.room;
  const userEmail = requestBody.sender;
  const content = requestBody.message;

  if (!(roomName || content)) {
    return NextResponse.json(
      { error: 'Must specify a roomName and content to post messages' },
      { status: 400 }
    )
  }

  const room = await prisma.chatRoom.findUnique({ where: { name: roomName } })

  if (!room) {
    return NextResponse.json(
      { error: `Room ${roomName} doesn't exist in db` },
      { status: 400 }
    )
  }

  const user = await prisma.user.findUnique({ where: { email: userEmail } })
  if (!user) {
    return NextResponse.json(
      { error: `User with id ${user} doesn't exist in db` },
      { status: 400 }
    )
  }

  await prisma.message.create({
    data: {
      chatId: room.id,
      senderId: user.id,
      content: content
    }
  })

  return NextResponse.json({})
}
