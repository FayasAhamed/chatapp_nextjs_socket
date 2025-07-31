import { createServer } from 'node:http';
import next from 'next';
import { Server } from "socket.io";
import { PrismaClient } from './app/generated/prisma/index.js'

const globalForPrisma = global as unknown as { 
    prisma: PrismaClient
}
const prisma = globalForPrisma.prisma || new PrismaClient()
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

const dev = process.env.NODE_ENV !== 'production';
const hostname = process.env.HOSTNAME || 'localhost';
const port = parseInt(process.env.PORT || '3000', 10);

const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();

app.prepare().then(() => {
    const httpServer = createServer(handler);
    const io = new Server(httpServer);
    io.on('connection', (socket) => {
        console.log(`User connected: ${socket.id}`)

        // TODO handle unjoin room

        socket.on('join-room', async ({room, user}) => {
            // access db, create chatRoom if not exist, add user to chatRoom
            let dbRoom = await prisma.room.findUnique({
                where: {
                    name: room
                }
            })
            if (!dbRoom) {
                return new Error(`Room with name: ${room} is not found`)
            }
            let dbUser = await prisma.user.findUnique({
                where: {
                    id: user
                }
            })
            if (!dbUser) {
                return new Error(`User with id: ${user} is not found`)
            }
            let chatRoom = await prisma.chatRoom.findUnique({
                where: {
                    id: dbRoom.id
                }
            })
            if (!chatRoom) {
                chatRoom = await prisma.chatRoom.create({
                    data: {
                        roomId: room
                    }
                })
            }
            await prisma.chatRoom.update({
                where: {
                    id: chatRoom.id
                },
                data: {
                    users: {
                        connect: {
                            id: user
                        }
                    }
                }
            })

            socket.join(room);
            console.log(`User ${dbUser.email} joined room ${room}`);

            socket.to(room).emit('user_joined', `${dbUser.email} joined room ${room}`)
        })

        socket.on('message', ({ room, message, sender }) => {
            console.log(`Message from ${sender} in room ${room}: ${message}`);
            socket.to(room).emit('message', {sender, message})
        })

        socket.on('disconnect', () => {
            console.log(`User disconnected: ${socket.id}`)
        })
    })

    httpServer.listen(port, () => {
        console.log(`Server running on http://${hostname}:${port}`)
    })
})
