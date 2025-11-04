"use client";
import React, { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface Message {
  id: string;
  username: string;
  text: string;
  created_at: string;
}

export default function ChatRoom({ roomId = "global" }: { roomId?: string }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [username, setUsername] = useState("");

  useEffect(() => {
    const storedName = localStorage.getItem("zesty_username");
    if (storedName) {
      setUsername(storedName);
    } else {
      const name = prompt("Enter your username:");
      if (name) {
        localStorage.setItem("zesty_username", name);
        setUsername(name);
      }
    }
  }, []);

  // Fetch messages
  useEffect(() => {
    async function loadMessages() {
      const { data } = await supabase
        .from("messages")
        .select("*")
        .eq("room", roomId)
        .order("created_at", { ascending: true });
      setMessages(data || []);
    }
    loadMessages();

    const subscription = supabase
      .channel("messages-room")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        (payload) => setMessages((prev) => [...prev, payload.new as Message])
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [roomId]);

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!newMessage.trim()) return;
    await supabase.from("messages").insert({
      username,
      text: newMessage,
      room: roomId,
    });
    setNewMessage("");
  }

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-white p-4">
      <h1 className="text-2xl font-bold text-center mb-4">
        💬 ZestyChat — {roomId.toUpperCase()} Room
      </h1>
      <div className="flex-1 overflow-y-auto space-y-2 bg-gray-800 p-3 rounded-lg">
        {messages.map((m) => (
          <div key={m.id} className="p-2 bg-gray-700 rounded-md">
            <strong>{m.username}: </strong>
            {m.text}
          </div>
        ))}
      </div>
      <form onSubmit={sendMessage} className="mt-3 flex gap-2">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type your message..."
          className="flex-1 p-2 rounded-lg bg-gray-700 text-white"
        />
        <button
          type="submit"
          className="bg-blue-600 px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Send
        </button>
      </form>
    </div>
  );
}
