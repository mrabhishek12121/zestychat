import '../styles/globals.css'
import React from 'react'

export const metadata = {
  title: 'Zesty Chat',
  description: 'Public chat — ZestyChat'
}

export default function RootLayout({ children }:{children:React.ReactNode}) {
  return (
    <html lang="en">
      <body>
        <header className="header container">
          <div className="brand">
            <span style={{fontSize:20}}>💬</span>
            <div>
              <div style={{fontWeight:800}}>Zesty Chat</div>
              <div className="small">Global · Language · Staff</div>
            </div>
          </div>
          <div style={{display:'flex',gap:8,alignItems:'center'}}>
            <div className="small">No login — anonymous</div>
          </div>
        </header>
        {children}
      </body>
    </html>
  )
}
