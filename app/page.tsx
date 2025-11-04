'use client'
import React, { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import ChatRoom from '@/components/ChatRoom'

export default function Page(){
  // default redirect to Global room id "global"
  const router = useRouter()
  useEffect(()=>{ router.replace('/rooms/global') }, [router])
  return <div />
}
