import { useState } from "react";
import { signOut } from "firebase/auth";
import { collection, query, where, getDocs, addDoc } from "firebase/firestore";
import { auth, db } from "../firebase/firebase";
import { useNavigate } from "react-router-dom";
import { FiSearch, FiLogOut } from "react-icons/fi";

const Header = ({ onSearch }) => {
  const [searchEmail, setSearchEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSearch = async () => {
    if (!searchEmail.trim()) {
      setError("Please enter an email.");
      return;
    }
    if (searchEmail === auth.currentUser.email) {
      setError("You cannot search for yourself.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("email", "==", searchEmail));
      const userSnapshot = await getDocs(q);

      if (!userSnapshot.empty) {
        const chatRef = collection(db, "chats");
        const chatQuery = query(chatRef, where("users", "array-contains", auth.currentUser.email));
        const chatSnapshot = await getDocs(chatQuery);

        let existingChat = null;
        chatSnapshot.forEach((doc) => {
          if (doc.data().users.includes(searchEmail)) {
            existingChat = { id: doc.id, ...doc.data() };
          }
        });

        if (!existingChat) {
          const newChat = await addDoc(chatRef, {
            users: [auth.currentUser.email, searchEmail],
            createdAt: new Date(),
          });
          existingChat = { id: newChat.id, users: [auth.currentUser.email, searchEmail] };
        }

        onSearch(existingChat);
      } else {
        setError("User not found.");
      }
    } catch (error) {
      console.error("Error searching user:", error);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }

    setSearchEmail("");
  };

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/");
  };

  return (
    <div className="flex items-center justify-between px-4 py-2 bg-white shadow-md space-x-2">
      {/* Left - Logo */}
      <h1 className="text-lg sm:text-2xl font-semibold bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent cursor-pointer whitespace-nowrap">
        ChatWise
      </h1>

      {/* Middle - Search Input */}
      <div className="flex flex-1 min-w-0 justify-center">
        <div className="flex items-center space-x-2 w-full max-w-sm">
          <input
            type="text"
            placeholder="Search by Email"
            className="border rounded-lg px-3 py-1 sm:px-4 sm:py-2 w-full focus:ring-1 focus:ring-[#6E00FF] focus:outline-none"
            value={searchEmail}
            onChange={(e) => setSearchEmail(e.target.value)}
          />
          <button
            onClick={handleSearch}
            className={`flex items-center bg-[#6E00FF] text-white px-3 py-1 sm:px-4 sm:py-2 rounded-lg transition duration-200 ${
              searchEmail.trim() ? "hover:bg-[#8400ff]" : "opacity-50 cursor-not-allowed"
            }`}
            disabled={!searchEmail.trim() || loading}
          >
            {loading ? "..." : <FiSearch />}
          </button>
        </div>
      </div>

      {/* Right - Logout */}
      <button
        onClick={handleLogout}
        className="flex items-center bg-[#6E00FF] px-3 py-1 sm:px-4 sm:py-2 text-white rounded-lg hover:bg-[#8400ff] transition duration-200 whitespace-nowrap"
      >
        <FiLogOut />
      </button>
     {/* Error Modal */}
     {error && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-md"></div>
          <div className="relative bg-white px-6 py-4 rounded-lg shadow-lg text-center z-10">
            <p className="text-red-600 font-semibold">{error}</p>
            <button
              onClick={() => setError("")}
              className="mt-3 px-4 py-2 bg-[#6E00FF] text-white rounded-lg hover:bg-[#8400ff] transition"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
export default Header;
