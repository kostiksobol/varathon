import { HexString } from "@gear-js/api";
import { decryptData } from "utils/crypto-defence/symmetric-key-encryption";

export type Message = {
  from: HexString;
  encryptedContent: string;
  timestamp: number;
};

type MessageFormProps = {
    message: Message;
    symKey: string;
};

export function MessageForm({message, symKey}: MessageFormProps){
    return (
    <div style={{ marginBottom: '10px' }}>
      <div style={{ fontWeight: 'bold', color: '#ddd' }}>
        {message.from}
      </div>
      <div
        style={{
          fontSize: '0.9rem',
          backgroundColor: '#444',
          padding: '10px',
          borderRadius: '5px',
          marginBottom: '10px', // Add margin at the bottom to separate messages
        }}
      >
        <div
          style={{
            border: '1px solid #ddd',
            borderRadius: '5px',
            padding: '0.5rem',
            wordBreak: 'break-all', // To handle long decrypted content
          }}
        >
          {decryptData(message.encryptedContent, symKey)}
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
    </div>
    );
}