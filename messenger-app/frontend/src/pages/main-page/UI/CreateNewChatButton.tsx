import React, { useState } from 'react';

export default function CreateNewChatButton({ handleCreateChatClick }: { handleCreateChatClick: any }) {
  const [name, setName] = useState('');

  const handleChatClick = () => {
    handleCreateChatClick(name)();
    setName(''); 
  };

  return (
    <div style={{ marginTop: '1rem' }}>
      <input
        type="text"
        placeholder="Enter chat name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        style={{
          backgroundColor: '#333',
          color: 'white',
          border: 'none',
          padding: '10px',
          marginBottom: '20px',
          borderRadius: '5px',
          width: '100%',
          maxWidth: '500px', // Increased max-width to accommodate longer keys
          fontSize: '14px', // Adjusted font size to fit longer text
        }}
      />
      <button
        onClick={handleChatClick}
        style={{
          padding: '0.5rem 1rem',
          border: 'none',
          borderRadius: '0 4px 4px 0',
          backgroundColor: '#007bff',
          color: '#fff',
          cursor: 'pointer',
          transition: 'background-color 0.3s',
        }}
      >
        Create New Chat
      </button>
    </div>
  );
}

