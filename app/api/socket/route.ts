import { NextResponse } from 'next/server';
import { Server } from 'socket.io';
import { createServer } from 'http';

let io: Server | null = null;

export async function GET() {
  if (!io) {
    const httpServer = createServer();
    
    io = new Server(httpServer, {
      cors: {
        origin: process.env.NEXTAUTH_URL || 'http://localhost:3000',
        methods: ['GET', 'POST'],
        credentials: true,
      },
    });

    io.on('connection', (socket) => {
      console.log('New client connected:', socket.id);
      
      const userId = socket.handshake.auth.userId;
      if (userId) {
        socket.join(`user:${userId}`);
        console.log(`User ${userId} joined their room`);
      }

      socket.on('join-room', (roomId: string) => {
        socket.join(roomId);
        console.log(`Socket ${socket.id} joined room ${roomId}`);
      });

      socket.on('leave-room', (roomId: string) => {
        socket.leave(roomId);
        console.log(`Socket ${socket.id} left room ${roomId}`);
      });

      socket.on('post:create', (data) => {
        socket.broadcast.emit('post:new', data);
      });

      socket.on('post:like', (data) => {
        io?.to(`user:${data.authorId}`).emit('notification:like', data);
      });

      socket.on('comment:create', (data) => {
        socket.broadcast.to(`post:${data.postId}`).emit('comment:new', data);
        io?.to(`user:${data.postAuthorId}`).emit('notification:comment', data);
      });

      socket.on('follow', (data) => {
        io?.to(`user:${data.targetUserId}`).emit('notification:follow', data);
      });

      socket.on('message:send', (data) => {
        io?.to(`user:${data.recipientId}`).emit('message:receive', data);
      });

      socket.on('typing:start', (data) => {
        socket.to(`user:${data.recipientId}`).emit('typing:update', {
          userId: userId,
          isTyping: true,
        });
      });

      socket.on('typing:stop', (data) => {
        socket.to(`user:${data.recipientId}`).emit('typing:update', {
          userId: userId,
          isTyping: false,
        });
      });

      socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
      });
    });

    const port = process.env.SOCKET_PORT || 3001;
    httpServer.listen(port, () => {
      console.log(`Socket.io server running on port ${port}`);
    });
  }

  return NextResponse.json({ message: 'Socket.io server is running' });
}