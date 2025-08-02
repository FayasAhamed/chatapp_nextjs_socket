import prisma from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const roomName = searchParams.get('name');
  if (!roomName) {
    return NextResponse.json(
      { error: 'Must specify a room' },
      { status: 400 }
    )
  }

  const room = await prisma.chatRoom.findUnique({
    where: {
      name: roomName
    }
  })

  return NextResponse.json({data: room})
}

export async function POST(request: NextRequest) {
  const requestBody = await request.json()
  const roomName = requestBody.room;
  const owner = requestBody.owner;

  if (!(roomName || owner)) {
    return NextResponse.json(
      { error: 'Must specify a room name and owner to register new room' },
      { status: 400 }
    )
  }

  const chatRoom = await prisma.chatRoom.create({
    data: {
        name: roomName,
        ownerId: owner,
        users: {
            connect: {id: owner}
        }
    }
  })

  return NextResponse.json({data: chatRoom})
}
