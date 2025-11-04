"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";

export default function Home() {
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [userIP, setUserIP] = useState("");

  useEffect(() => {
    fetch("https://api64.ipify.org?format=json")
      .then((res) => res.json())
      .then((data) => setUserIP(data.ip));

    loadMessages();

    const channel = supabase
      .channel("public:messages")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        (payload) => setMessages((prev) => [...prev, payload.new])
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  async function loadMessages() {
    const { data } = await supabase.from("messages").select("*").order("id");
    setMessages(data || []);
  }

  async function sendMessage() {
    if (!input.trim()) return;
    await supabase.from("messages").insert({ text: input, ip: userIP });
    setInput("");
  }

  async function reportMessage(id: number) {
    await supabase.from("reports").insert({ message_id: id, ip: userIP });
    alert("✅ Message reported!");
  }

  return (
    <main className="min-h-screen bg-gray-900 text-white flex flex-col items-center py-8">
      <h1 className="text-3xl font-bold mb-2 text-green-400">💬 Zesty Chat</h1>
      <p className="text-gray-400 mb-6">{messages.length} total messages</p>

      <div className="w-full max-w-lg bg-gray-800 rounded-xl shadow-md p-4 mb-4 overflow-y-auto h-[400px]">
        {messages.length === 0 ? (
          <p className="text-gray-500 text-center mt-20">
            Start chatting now...
          </p>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className="flex justify-between items-center bg-gray-700 p-2 rounded-md mb-2"
            >
              <span>{msg.text}</span>
              <button
                onClick={() => reportMessage(msg.id)}
                className="text-red-400 hover:text-red-300 text-sm"
              >
                Report
              </button>
            </div>
          ))
        )}
      </div>

      <div className="flex w-full max-w-lg gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-grow bg-gray-700 p-2 rounded-md outline-none"
          placeholder="Type your message..."
        />
        <button
          onClick={sendMessage}
          className="bg-green-500 px-4 rounded-md hover:bg-green-600"
        >
          Send
        </button>
      </div>
    </main>
  );
}
