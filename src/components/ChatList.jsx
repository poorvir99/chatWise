import { useEffect, useState } from "react";
import { collection, query, where, onSnapshot, deleteDoc, doc } from "firebase/firestore";
import { auth, db } from "../firebase/firebase.js";
import { BsTrash } from "react-icons/bs"; // Import delete icon
import "react-tooltip/dist/react-tooltip.css";
import DeleteButton from "./DeleteButton.jsx";

const ChatList = ({ onSelectChat, selectedChat }) => {
  const [chats, setChats] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  

  useEffect(() => {
    if (!auth.currentUser) return;

    const q = query(collection(db, "chats"), where("users", "array-contains", auth.currentUser.email));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setChats(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });

    return () => unsubscribe(); // Cleanup on unmount
  }, []);

  // Function to delete a chat
  const deleteChat = async (chatId) => {
    try {
      await deleteDoc(doc(db, "chats", chatId));
      setChats((prevChats) => prevChats.filter((chat) => chat.id !== chatId)); // Remove from UI
    } catch (error) {
      console.error("Error deleting chat:", error);
    }
  };

  // Filtered Chats based on Search
  const filteredChats = chats.filter((chat) =>
    chat.users.find((email) => email !== auth.currentUser.email)?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-3/3 min-w-[280px] bg-[#612DD1] text-white flex flex-col h-screen ">
      {/* Search Bar */}
      <div className="p-3 bg-[#612DD1] sticky top-0 z-10">
        <input
          type="text"
          placeholder="Search..."
          className="w-full p-2 rounded-lg bg-[#f0f2f5] text-gray-500 focus:outline-none"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto ">
        {filteredChats.length === 0 ? (
          <p className="text-gray-400 text-sm text-center mt-4">No chats found</p>
        ) : (
          filteredChats.map((chat) => {
            const otherUser = chat.users.find((email) => email !== auth.currentUser.email) || "Unknown";

            return (
              <div
                key={chat.id}
                className={`flex items-center justify-between p-4 cursor-pointer transition-all duration-200 ${
                  selectedChat?.id === chat.id ? "bg-[#6E00FF]" : "hover:bg-[#8400ff]"
                }`}
                onClick={() => onSelectChat(chat)}
              >
                {/* Chat Info */}
                <div className="flex items-center gap-3 flex-1">
                  {/* User Avatar (Default with Initials) */}
                  <div className="w-10 h-10 flex items-center justify-center bg-[#f0f2f5] rounded-full text-gray-900 font-semibold">
                    {otherUser.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium">{otherUser}</p>
                    <p className={`text-sm ${selectedChat?.id === chat.id ? "text-green-500 font-bold" : "text-gray-400"}`}>
                      {selectedChat?.id === chat.id ? "Active now" : "Tap to chat"}
                    </p>
                  </div>
                </div>

                {/* Delete Button */}
                <DeleteButton deleteChat={deleteChat} chat={chat} />
          </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ChatList;
