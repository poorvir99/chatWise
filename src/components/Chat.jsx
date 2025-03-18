import { useEffect, useState } from "react";
import Header from "./Header";
import ChatList from "./ChatList";
import ChatWindow from "./ChatWindow";
import { collection, query, onSnapshot } from "firebase/firestore";
import { db } from "../firebase/firebase";
import Footer from "./Footer";

const Chat = () => {
  const [selectedChat, setSelectedChat] = useState(null);
  const [chatList, setChatList] = useState([]);

  // Fetch user's chat list in real-time
  useEffect(() => {
    const chatsRef = collection(db, "chats");
    const q = query(chatsRef);

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const chats = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setChatList(chats);
    });

    return () => unsubscribe(); // Cleanup on unmount
  }, []);

  // Handle searching or starting a new chat
  const handleSearchChat = (chat) => {
    if (!chatList.find((c) => c.id === chat.id)) {
      setChatList((prev) => [...prev, chat]);
    }
    setSelectedChat(chat);
  };

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      {/* Fixed Header */}
      <Header onSearch={handleSearchChat} />

      {/* Chat Container */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar - Chat List (30%) */}
        <div className="w-[30%] min-w-[280px] bg-white shadow-sm overflow-y-auto custom-scrollbar">
          <ChatList chats={chatList} onSelectChat={setSelectedChat} selectedChat={selectedChat} />
        </div>

        {/* Right Side - Chat Window (70%) */}
        <div className="w-[70%] flex flex-col bg-white overflow-y-auto scroll-smooth custom-scrollbar">
          {selectedChat ? (
            <ChatWindow selectedChat={selectedChat} />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              Select a chat to start messaging
            </div>
          )}
        </div>
      </div>
      {/* Footer */}
      <Footer/>
    </div>
  );
};

export default Chat;
