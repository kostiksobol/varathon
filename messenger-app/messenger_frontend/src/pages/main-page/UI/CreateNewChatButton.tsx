import React from 'react'

export default function CreateNewChatButton(props: any) {
  return (
    <div style={{ marginTop: '1rem' }}>
    <button
      {...props}
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
      Create New Chat
    </button>
  </div>
  )
}
