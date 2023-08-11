import { HexString } from "@gear-js/api";
import { useAccount } from "@gear-js/react-hooks";
import React from "react";
import { useNavigate, useParams } from "react-router-dom";

type ChatButtonProps = {
    chat_id: string;
};

export function ChatButton({chat_id}: ChatButtonProps){
    const navigate = useNavigate();
    const params = useParams<{ id: HexString }>();
    const selectedChatId = params.id!;

    const {account} = useAccount();
    const onClick = React.useCallback(() => {
        navigate(`/${account?.meta.name}/chat/${chat_id}`, {replace: true});
    }, [navigate, chat_id]);

    return (
      <div
      key={chat_id}
      onClick={onClick}
      onContextMenu={(e) => {
        e.preventDefault();
      }}
      style={{
        marginBottom: '10px',
        fontWeight: selectedChatId === chat_id ? 'bold' : 'normal',
        display: 'flex',
        alignItems: 'center',
        backgroundColor: selectedChatId === chat_id ? '#444' : 'inherit',
        padding: '10px',
        border: 'none',
        cursor: 'pointer',
        transition: 'background-color 0.3s',
        width: 'fit-content',
      }}
    >
      <div
        style={{
          border: '1px solid #ddd',
          borderRadius: '5px',
          padding: '0.5rem',
          wordBreak: 'break-all',  // Break the word if it's too long to fit in one line
        }}
      >
        <div style={{ fontWeight: 'bold', color: '#ddd' }}>{chat_id}</div>
      </div>
    </div>
    );
}