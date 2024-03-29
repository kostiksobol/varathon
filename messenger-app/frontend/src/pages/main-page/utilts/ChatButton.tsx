import { useAccount } from "@gear-js/react-hooks";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getNameByChatId } from "utils/indexedDB";

type ChatButtonProps = {
    chat_id: string;
};

export function ChatButton({ chat_id }: ChatButtonProps) {
    const navigate = useNavigate();
    const params = useParams<{ id: string }>();
    const selectedChatId = params.id!;

    const [name, setName] = useState('');
    const [showChatId, setShowChatId] = useState(false);

    useEffect(() => {
        getNameByChatId(chat_id)
            .then((name) => {
                if (name !== undefined) {
                    setName(name);
                } else {
                    console.error("Error retrieving name:");
                }
            });
    }, [chat_id]);

    const { account } = useAccount();

    const toggleChatId = () => {
        setShowChatId(!showChatId);
    };

    const onClick = React.useCallback(() => {
        navigate(`/${account?.meta.name}/chat/${chat_id}`, { replace: true });
    }, [navigate, chat_id, account]);

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
                width: '100%',
            }}
        >
            <div
                style={{
                    border: '1px solid #ddd',
                    borderRadius: '5px',
                    padding: '0.5rem',
                    wordBreak: 'break-all',
                    position: 'relative',
                    width: '100%'
                }}
            >
                <div
                    style={{ fontWeight: 'bold', color: '#ddd', cursor: 'pointer', fontSize: '18px' }}
                >
                    {name}
                    <div style={{ position: 'absolute', bottom: '0', right: '0', cursor: 'pointer' }}>
                        {showChatId ? (
                            <span onClick={toggleChatId}>&times;</span>
                        ) : (
                            <span onClick={toggleChatId}>&#9899;</span>
                        )}
                    </div>
                </div>
                {showChatId && (
                    <div style={{ color: '#ddd', marginTop: '5px' }}>{chat_id}</div>
                )}
            </div>
        </div>
    );
}

