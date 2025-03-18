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
      showError("Please enter an email.");
      return;
    }
    if (searchEmail === auth.currentUser.email) {
      showError("You cannot search for yourself.");
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
        showError("User not found.");
      }
    } catch (error) {
      console.error("Error searching user:", error);
      showError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }

    setSearchEmail("");
  };

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/");
  };

  // Function to display a pop-up error
  const showError = (message) => {
    setError(message);
    setTimeout(() => {
      setError("");
    }, 3000); // Hide error after 3 seconds
  };

  return (
    <div className="flex justify-between items-center px-6 py-3 bg-white shadow-md relative">
      {/* Left - Logo */}
      <h1 className="text-3xl font-semibold bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent cursor-pointer">
        ChatWise
      </h1>

      {/* Middle - Search Input */}
      <div className="flex items-center space-x-2 relative">
        <input
          type="text"
          placeholder="Search by Email"
          className="border rounded-lg px-4 py-2 focus:ring-1 focus:ring-[#6E00FF] focus:outline-none"
          value={searchEmail}
          onChange={(e) => setSearchEmail(e.target.value)}
        />
        <button
          onClick={handleSearch}
          className={`flex items-center bg-[#6E00FF] text-white px-4 py-2 rounded-lg transition duration-200 ${
            searchEmail.trim() ? "hover:bg-[#8400ff]" : "opacity-50 cursor-not-allowed"
          }`}
          disabled={!searchEmail.trim() || loading}
        >
          {loading ? "Searching..." : <><FiSearch className="mr-2" /> Search</>}
        </button>
      </div>

      {/* Right - Logout */}
      <div className="relative group">
        <button
          onClick={handleLogout}
          className="flex items-center bg-[#6E00FF] px-3 py-2 text-white rounded-lg hover:bg-[#8400ff] transition duration-200"
        >
          <FiLogOut />
        </button>
        {/* Tooltip */}
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-[-4px] bg-transparent text-black text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition duration-200">
          Logout
        </div>
      </div>

      {/* Error Pop-up Modal */}
      {error && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          {/* Blurred Background */}
          <div className="absolute inset-0 bg-black/30 backdrop-blur-md"></div>

          {/* Modal Content */}
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