import React, { useState } from 'react'

export default function AddNewUserForm({handleAddUserClick}: {handleAddUserClick: any}) {
    const [newUser, setNewUser] = useState('');

  return (
    <div style={{ marginTop: '1rem' }}>
    <input
      type="text"
      value={newUser}
      onChange={(e) => setNewUser(e.target.value)}
      placeholder="Enter User Id"
      pattern="^0x[A-Za-z0-9]+$" 
      style={{
        marginRight: '0.5rem',
        padding: '0.5rem',
        border: 'none',
        borderRadius: '4px',
        backgroundColor: '#444',
        color: '#fff',
      }}
    />
    <button
      onClick={handleAddUserClick(newUser)}
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
      Add New User in the Chat
    </button>
  </div>
  )
}
