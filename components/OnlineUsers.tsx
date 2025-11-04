'use client'
import React, { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function OnlineUsers({ roomId }:{roomId:string}) {
  const [count, setCount] = useState(0)

  useEffect(()=>{
    // quick approximate: get presence via a channel presenceState if available
    const ch = supabase.channel(`presence-${roomId}`)
    ch.subscribe().then(()=>{})
    // naive: count last 1 minute messages' distinct user_name as online
    let timer = setInterval(async ()=>{
      const { data } = await supabase.from('messages').select('user_id, user_name').eq('room_id', roomId).order('created_at', { ascending:false }).limit(100)
      const unique = new Set((data||[]).map((r:any)=>r.user_name || 'guest'))
      setCount(unique.size)
    }, 3000)
    return ()=>{ clearInterval(timer); supabase.removeChannel(ch) }
  },[roomId])

  return <div className="small">{count} online</div>
}
