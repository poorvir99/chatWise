import { useEffect, useState, useRef } from "react";
import { collection, addDoc, orderBy, query, onSnapshot, serverTimestamp, updateDoc, doc } from "firebase/firestore";
import { auth, db } from "../firebase/firebase.js";
import EmojiPicker from "emoji-picker-react";
import { BsEmojiSmile, BsSend, BsCheck, BsCheckAll } from "react-icons/bs";
import moment from "moment";

const ChatWindow = ({ selectedChat }) => {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!selectedChat) return;

    const messagesRef = collection(db, "chats", selectedChat.id, "messages");
    const q = query(messagesRef, orderBy("createdAt", "asc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedMessages = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setMessages(fetchedMessages);

      // Mark messages as 'read' if the recipient is viewing
      fetchedMessages.forEach(async (msg) => {
        if (msg.sender !== auth.currentUser.email && msg.status !== "read") {
          const msgRef = doc(db, "chats", selectedChat.id, "messages", msg.id);
          await updateDoc(msgRef, { status: "read" });
        }
      });
    });

    return () => unsubscribe();
  }, [selectedChat]);
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
  if (lastMessage?.sender === auth.currentUser.email) {
    scrollToBottom();
  }
  }, [messages]);

  const sendMessage = async () => {
    if (!message.trim() || !selectedChat) return;

    const messagesRef = collection(db, "chats", selectedChat.id, "messages");
    await addDoc(messagesRef, {
      sender: auth.currentUser.email,
      text: message,
      createdAt: serverTimestamp(),
      status: "sent",
    });
    setMessage("");
    setShowEmojiPicker(false);
  };

  let lastDate = null; // Variable to track the last displayed date

  return (
    <div className="flex flex-col w-full h-screen bg-[#eae6df]">
      <div className="p-4 bg-[#f0f2f5] shadow-sm flex items-center justify-between sticky top-0 z-10">
        <h2 className="text-lg font-semibold text-gray-800">
          {selectedChat?.users.find(email => email !== auth.currentUser.email) || "Chat"}
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-hide">
        {messages.map((msg) => {
          const isSender = msg.sender === auth.currentUser.email;
          const messageDate = msg.createdAt?.toDate ? moment(msg.createdAt.toDate()).format("MMMM D, YYYY") : "";
          const showDate = messageDate !== lastDate; // Show date separator only if it's different from the last displayed one
          lastDate = messageDate; // Update lastDate after rendering

          return (
            <div key={msg.id}>
              {/* Show date separator only when the day changes */}
              {showDate && (
                <div className="text-center text-gray-500 text-sm my-2">
                  {messageDate}
                </div>
              )}

              <div className={`flex ${isSender ? "justify-end" : "justify-start"}`}>
                <div className={`flex flex-col ${isSender ? "items-end" : "items-start"}`}>
                  <div
                    className={`px-6 py-3 text-sm max-w-xs md:max-w-sm lg:max-w-md break-words shadow rounded-lg ${
                      isSender
                        ? "bg-[#6E00FF] text-white rounded-br-2xl rounded-tl-2xl rounded-tr-lg"
                        : "bg-white text-black rounded-bl-2xl rounded-tr-2xl rounded-tl-lg"
                    }`}
                  >
                    <span>{msg.text}</span>
                  </div>
                  <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
                    {msg.createdAt && (
                      <span>
                        {moment(msg.createdAt.toDate()).format("hh:mm A")}
                      </span>
                    )}
                    {isSender && (
                      <span>
                       {msg.status === "read" ? <BsCheckAll className="text-blue-500" /> : <BsCheck />}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef}></div>
      </div>

      <div className="p-4 bg-[#f0f2f5] flex items-center sticky bottom-0 z-10 shadow-md">
        <button onClick={() => setShowEmojiPicker(!showEmojiPicker)} className="mr-3 text-gray-500 text-xl hover:text-[#6E00FF]">
          <BsEmojiSmile />
        </button>
        {showEmojiPicker && (
          <div className="absolute bottom-16 left-4 shadow-lg">
            <EmojiPicker onEmojiClick={(emoji) => setMessage((prev) => prev + emoji.emoji)} />
          </div>
        )}
        <input
          type="text"
          className="flex-1 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6E00FF] bg-white"
          placeholder="Type a message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              sendMessage();
            }
          }}
        />
        <button
          onClick={sendMessage}
          className="bg-[#6E00FF] hover:bg-[#8400ff] text-white px-4 py-2 ml-2 rounded-lg flex items-center justify-center"
        >
          <BsSend className="text-xl" />
        </button>
      </div>
    </div>
  );
};

export default ChatWindow;
