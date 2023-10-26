import React, { useState } from 'react';

export default function SendMessageForm({handleSendMessageClick}: {handleSendMessageClick: any}){
  const [newMessage, setNewMessage] = useState<string>('');
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedFiles(e.target.files);
  }

  const handleSend = () => {
    handleSendMessageClick(newMessage, selectedFiles)();
    setNewMessage(''); // Optional: Clear the message text as well.
    setSelectedFiles(null);
  }  

  return (
    <div style={styles.container}>
      <textarea
        value={newMessage}
        onChange={(e) => setNewMessage(e.target.value)}
        placeholder="Enter your message"
        style={styles.textarea}
      />

      <div style={styles.buttonContainer}>
        <label style={styles.fileLabel}>
          Upload Files
          <input 
            type="file"
            multiple // Allows multiple files to be selected
            style={styles.fileInput}
            onChange={handleFileChange}
          />
        </label>
        <button onClick={handleSend} style={styles.sendButton}>
          Send Message
        </button>
      </div>

      <div style={styles.fileName}>
        {selectedFiles ? `${selectedFiles.length} file(s) selected` : 'No files chosen'}
      </div>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    padding: '1rem',
    backgroundColor: '#444',
    borderRadius: '5px',
    boxShadow: '0 2px 5px rgba(0, 0, 0, 0.2)',
  },
  textarea: {
    marginBottom: '1rem',
    padding: '0.5rem',
    border: 'none',
    borderRadius: '4px',
    backgroundColor: '#555',
    color: '#fff',
    height: '100px',
    resize: 'vertical',
  },
  buttonContainer: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '1rem',
  },
  fileLabel: {
    padding: '0.5rem 1rem',
    border: '1px solid #666',
    borderRadius: '4px',
    backgroundColor: '#555',
    color: '#fff',
    cursor: 'pointer',
    marginRight: '1rem',
    position: 'relative',
    overflow: 'hidden',
  },
  fileInput: {
    position: 'absolute',
    opacity: 0,
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    cursor: 'pointer'
  },
  fileName: {
    fontSize: '14px',
    color: '#aaa',
    marginBottom: '1rem'
  },
  sendButton: {
    padding: '0.5rem 1rem',
    border: 'none',
    borderRadius: '4px',
    backgroundColor: '#007bff',
    color: '#fff',
    cursor: 'pointer',
    transition: 'background-color 0.3s',
  }
};
