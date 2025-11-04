'use client';
import React from 'react';
import ChatRoom from '@/components/ChatRoom';

export default function RoomPage({ params }:{params:{id:string}}){
  const { id } = params;
  // id can be "global", "language", "staff"
  return (
    <main className="container chat-area">
      <ChatRoom roomId={id} />
    </main>
  );
}
