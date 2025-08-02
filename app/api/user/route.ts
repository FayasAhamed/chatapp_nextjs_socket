import prisma from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get('email');
  if (!email) {
    return NextResponse.json(
      { error: 'Must specify an email' },
      { status: 400 }
    )
  }

  const user = await prisma.user.findUnique({
    where: {
      email: email
    }
  })

  return NextResponse.json({data: user})
}

export async function POST(request: NextRequest) {
  const requestBody = await request.json()
  const email = requestBody.email;
  const name = requestBody.name;

  if (!(email || name)) {
    return NextResponse.json(
      { error: 'Must specify an email and name for registering new user' },
      { status: 400 }
    )
  }

  const user = await prisma.user.create({
    data: {
      email: email,
      name: name
    }
  })

  return NextResponse.json({data: user})
}
