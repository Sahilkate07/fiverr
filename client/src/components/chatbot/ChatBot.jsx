import React, { useState } from 'react';
import './ChatBot.scss';
import { FaComments, FaTimes } from 'react-icons/fa';

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="chatbot-container">
      {isOpen ? (
        <>
          <div className="chatbot-header">
            <span>Chat with us</span>
            <button onClick={toggleChat} className="close-button">
              <FaTimes />
            </button>
          </div>
          <iframe
            src="https://www.chatbase.co/chatbot-iframe/rr3Utl18ifRiZxGaPgw30"
            width="100%"
            height="100%"
            frameBorder="0"
            allowFullScreen
            style={{
              width: '100%',
              height: '450px',
              border: 'none',
              borderRadius: '0 0 10px 10px',
            }}
          ></iframe>
        </>
      ) : (
        <button onClick={toggleChat} className="chat-toggle-button">
          <FaComments />
          <span>Chat with us</span>
        </button>
      )}
    </div>
  );
};

export default ChatBot; 