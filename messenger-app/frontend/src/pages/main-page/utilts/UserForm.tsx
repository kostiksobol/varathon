import { HexString } from "@gear-js/api";
import { useState } from "react";


type UserFormProps = {
    address: HexString;
    login: string;
    name: string;
};

export function UserForm({address, login, name}: UserFormProps){
  const [showUserId, setShowUserId] = useState(false);

  const toggleChatId = () => {
    setShowUserId(!showUserId);
  };

    // return (
    //     <div
    //     style={{
    //       border: '1px solid #ddd',
    //       borderRadius: '5px',
    //       marginBottom: '0.5rem',
    //       padding: '0.5rem',
    //       overflow: 'hidden',
    //       whiteSpace: 'normal',   // Allow text to wrap to the next line
    //       wordWrap: 'break-word', // Break words if they are too long to fit in one line
    //     }}
    //   >
    //     <div style={{ fontWeight: 'bold', color: '#ddd' }}>{address}</div>
    //   </div>
    // )

    return (
      <div
      style={{
          border: '1px solid #ddd',
          borderRadius: '5px',
          padding: '0.5rem',
          wordBreak: 'break-all',  // Break the word if it's too long to fit in one line
          position: 'relative', // Add this line for positioning the icon
          width: '100%'
      }}
  >
      <div
          style={{ fontWeight: 'bold', color: '#ddd', cursor: 'pointer' }}
      >
          {name}
          <div style={{ position: 'absolute', bottom: '0', right: '0', cursor: 'pointer' }}>
              {showUserId ? (
                  <span onClick={toggleChatId}>&times;</span>
              ) : (
                  <span onClick={toggleChatId}>&#9899;</span>
              )}
          </div>
      </div>
      {showUserId && (
        <>
          <div style={{ color: '#ddd', marginTop: '5px' }}>Login: {login}</div>
          <div style={{ color: '#ddd', marginTop: '5px' }}>Address: {address}</div>
        </>
      )}
    </div>
    )
}