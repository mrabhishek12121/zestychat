'use client'
import React, { useEffect, useRef, useState } from 'react'
import { supabase } from '@/lib/supabase'
import MessageInput from './MessageInput'
import OnlineUsers from './OnlineUsers'

type Msg = {
  id: string
  content: string
  created_at: string
  user_name?: string
  image_url?: string | null
}

export default function ChatRoom({ roomId }:{roomId:string}) {
  const [messages, setMessages] = useState<Msg[]>([])
  const [nickname, setNickname] = useState<string>('')
  const [joined, setJoined] = useState(false)
  const messagesRef = useRef<HTMLDivElement|null>(null)

  useEffect(()=>{
    // nickname from localStorage
    const nm = localStorage.getItem('zesty_nick') || ''
    if(nm) setNickname(nm)
  },[])

  useEffect(()=>{
    fetchMessages()
    const channel = supabase
      .channel(`room-${roomId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `room_id=eq.${roomId}` }, (payload)=>{
        setMessages(prev => [...prev, payload.new])
      })
      .subscribe()

    return ()=>{ supabase.removeChannel(channel) }
  },[roomId])

  useEffect(()=>{ // auto scroll
    if(messagesRef.current) messagesRef.current.scrollTop = messagesRef.current.scrollHeight
  },[messages])

  async function fetchMessages(){
    const { data } = await supabase.from('messages').select('*').eq('room_id', roomId).order('created_at', { ascending: true })
    setMessages(data || [])
  }

  function handleJoin(){
    if(!nickname.trim()) return alert('Enter a nickname')
    localStorage.setItem('zesty_nick', nickname.trim())
    setJoined(true)
    // create or upsert user row (best-effort)
    supabase.from('users').upsert({ name: nickname.trim(), ip_address: null }, { onConflict: ['name'] }).then(()=>{})
  }

  return (
    <div style={{display:'flex',flexDirection:'column',height:'100%',gap:12}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:12}}>
        <div style={{display:'flex',flexDirection:'column'}}>
          <div style={{fontWeight:800}}>{roomId==='global' ? 'Global Room' : roomId==='language' ? 'Language Room' : 'Staff Room'}</div>
          <div className="small">Room id: {roomId}</div>
        </div>
        <OnlineUsers roomId={roomId} />
      </div>

      <div className="card messages" ref={messagesRef}>
        {!joined && (
          <div style={{padding:12,display:'flex',gap:8,alignItems:'center'}}>
            <input className="input" placeholder="Pick a nickname" value={nickname} onChange={e=>setNickname(e.target.value)} />
            <button className="btn" onClick={handleJoin}>Join</button>
          </div>
        )}

        {messages.map(m => (
          <div key={m.id} className="message">
            <div style={{display:'flex',flexDirection:'column',gap:6}}>
              <div className="msg-author">{m.user_name || 'Guest'}</div>
              <div className="msg-text">{m.content}</div>
              {m.image_url && <img src={m.image_url} style={{maxWidth:200,borderRadius:8,marginTop:6}} alt="img" />}
            </div>
            <div style={{display:'flex',flexDirection:'column',alignItems:'flex-end',gap:6}}>
              <div className="small">{new Date(m.created_at).toLocaleTimeString()}</div>
              <button className="report" onClick={()=> {
                // create report row
                supabase.from('reports').insert({ message_id: m.id }).then(()=>alert('Reported'))
              }}>Report</button>
            </div>
          </div>
        ))}

      </div>

      <MessageInput roomId={roomId} nickname={nickname} joined={joined} />
    </div>
  )
}
