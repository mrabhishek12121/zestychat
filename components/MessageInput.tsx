'use client'
import React, { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function MessageInput({ roomId, nickname, joined }:{ roomId:string, nickname:string, joined:boolean }) {
  const [text, setText] = useState('')

  async function send(){
    if(!joined) return alert('Join the chat with a nickname first')
    if(!text.trim()) return
    // insert message
    await supabase.from('messages').insert({
      room_id: roomId,
      user_id: null,
      content: text.trim(),
      image_url: null
    })
    setText('')
  }

  return (
    <div className="card" style={{display:'flex',alignItems:'center',gap:8}}>
      <input className="input" placeholder="Type a message..." value={text} onChange={e=>setText(e.target.value)} onKeyDown={e=>{ if(e.key==='Enter'){ send() }}} />
      <button className="btn" onClick={send}>Send</button>
    </div>
  )
}
