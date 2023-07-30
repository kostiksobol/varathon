import React, { useState } from 'react'

export default function SendMessageForm({handleSendMessageClick}: {handleSendMessageClick: any}){
    const [newMessage, setNewMessage] = useState('');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', padding: '1rem' }}>
    <textarea
      value={newMessage}
      onChange={(e) => setNewMessage(e.target.value)}
      placeholder="Enter your message"
      style={{
        marginBottom: '1rem',
        padding: '0.5rem',
        border: 'none',
        borderRadius:'4px',
        backgroundColor: '#444',
        color: '#fff',
        height: '100px',
        resize: 'vertical',
      }}
    />
    <button
      onClick={handleSendMessageClick(newMessage)}
      style={{
        padding: '0.5rem 1rem',
        border: 'none',
        borderRadius: '4px',
        backgroundColor: '#007bff',
        color: '#fff',
        cursor: 'pointer',
        transition: 'background-color 0.3s',
      }}
    >
      Send Message
    </button>
  </div>
  )
}
