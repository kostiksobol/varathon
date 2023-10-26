// import { HexString } from "@gear-js/api";
// import { decryptData } from "utils/crypto-defence/symmetric-key-encryption";

// const styles = {
//   header: {
//     backgroundColor: '#282c34',
//     minHeight: '100vh',
//     display: 'flex',
//     flexDirection: 'column' as 'column',
//     alignItems: 'center',
//     justifyContent: 'center',
//     fontSize: 'calc(10px + 2vmin)',
//     color: 'white',
//   },
//   button: {
//     marginTop: '20px',
//     padding: '10px 20px',
//     fontSize: '16px',
//   },
//   fileInfo: {
//     marginTop: '20px',
//     padding: '15px',
//     border: '1px solid #61dafb',
//     borderRadius: '5px',
//     cursor: 'pointer',
//   },
// };

// export type IpfsFile = {
//   name: string;
//   tip: string;
//   sizet: string;
//   hashipfs: string;
// }

// export type Message = {
//   from: HexString;
//   encryptedContent: string;
//   files: IpfsFile[],
//   timestamp: number;
// };

// type MessageFormProps = {
//     message: Message;
// };
// type FileInfoProps = {
//     file: IpfsFile;
// };

// const FileInfo: React.FC<FileInfoProps> = ({ file }) => {
//   const ipfsLink = `http://ipfs.io/ipfs/${file.hashipfs}`;

//   const isImage = ['image/jpeg', 'image/png', 'image/gif'].includes(file.tip);

//   return (
//     <div 
//       style={styles.fileInfo} 
//       onClick={() => window.open(ipfsLink, "_blank")}
//     >
//       <p><strong>File Name:</strong> {file.name}</p>
//       <p><strong>File Size:</strong> {file.sizet} bytes</p>
//       <p><strong>IPFS Hash:</strong> {file.hashipfs}</p>
//       {isImage && (
//         <div>
//           <img src={ipfsLink} alt="Uploaded content" style={{ maxWidth: '100%', maxHeight: '200px' }} />
//         </div>
//       )}
//       <p>Click for more details on IPFS...</p>
//     </div>
//   );
// };

// export function MessageForm({message}: MessageFormProps){
//     return (
//     <div style={{ marginBottom: '10px' }}>
//       <div style={{ fontWeight: 'bold', color: '#ddd' }}>
//         {message.from}
//       </div>
//       <div
//         style={{
//           fontSize: '0.9rem',
//           backgroundColor: '#444',
//           padding: '10px',
//           borderRadius: '5px',
//           marginBottom: '10px', // Add margin at the bottom to separate messages
//         }}
//       >
//         <div
//           style={{
//             border: '1px solid #ddd',
//             borderRadius: '5px',
//             padding: '0.5rem',
//             wordBreak: 'break-all', // To handle long decrypted content
//           }}
//         >
//           {message.encryptedContent}
//         </div>
//       </div>
//       <div
//         style={{
//           fontSize: '0.8rem',
//           color: '#888',
//           textAlign: 'right',
//         }}
//       >
//         {new Date(
//           Number(message.timestamp.toString().replace(/,/g, ''))
//         ).toLocaleString()}
//       </div>
//       {message.files.length > 0 ? <FileInfo file={message.files[0]}/> : null}
//     </div>
//     );
// }

import { HexString } from "@gear-js/api";

const styles = {
  messageContainer: {
    marginBottom: '20px',
    backgroundColor: '#333',
    padding: '10px',
    borderRadius: '5px',
    color: 'white',
  },
  header: {
    backgroundColor: '#282c34',
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column' as 'column',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 'calc(10px + 2vmin)',
    color: 'white',
  },
  button: {
    marginTop: '20px',
    padding: '10px 20px',
    fontSize: '16px',
    backgroundColor: '#61dafb',
    color: 'white',
    borderRadius: '5px',
    cursor: 'pointer',
  },
  fileInfo: {
    marginTop: '20px',
    padding: '15px',
    border: '1px solid #61dafb',
    borderRadius: '5px',
    cursor: 'pointer',
  },
};

export type IpfsFile = {
  name: string;
  tip: string;
  sizet: string;
  hashipfs: string;
}

export type Message = {
  from: HexString;
  encryptedContent: string;
  files: IpfsFile[];
  timestamp: number;
};

type MessageFormProps = {
  message: Message;
};

type FileInfoProps = {
  file: IpfsFile;
};

const FileInfo: React.FC<FileInfoProps> = ({ file }) => {
  const ipfsLink = `http://ipfs.io/ipfs/${file.hashipfs}`;
  const isImage = ['image/jpeg', 'image/png', 'image/gif'].includes(file.tip);

  return (
    <div 
      style={styles.fileInfo} 
      onClick={() => window.open(ipfsLink, "_blank")}
    >
      <p><strong>File Name:</strong> {file.name}</p>
      <p><strong>File Size:</strong> {file.sizet} bytes</p>
      {isImage && (
        <div>
          <img src={ipfsLink} alt="Uploaded content" style={{ maxWidth: '100%', maxHeight: '200px' }} />
        </div>
      )}
    </div>
  );
};

export function MessageForm({message}: MessageFormProps){
  return (
    <div style={styles.messageContainer}>
      <div style={{ fontWeight: 'bold', color: '#ddd', marginBottom: '5px' }}>
        {message.from}
      </div>
      <div
        style={{
          fontSize: '0.9rem',
          backgroundColor: '#444',
          padding: '10px',
          borderRadius: '5px',
          marginBottom: '10px',
        }}
      >
        <div
          style={{
            wordBreak: 'break-all',
          }}
        >
          {message.encryptedContent}
        </div>
      </div>
      <div
        style={{
          fontSize: '0.8rem',
          color: '#888',
          textAlign: 'right',
        }}
      >
        {new Date(
          Number(message.timestamp.toString().replace(/,/g, ''))
        ).toLocaleString()}
      </div>
      {message.files.map((file) => (<FileInfo file={file}/>))}
    </div>
  );
}
