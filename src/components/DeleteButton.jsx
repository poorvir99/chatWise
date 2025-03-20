import { useState } from "react";
import { BsTrash } from "react-icons/bs";


const DeleteButton = ({ deleteChat, chat }) => {
  const [showConfirm, setShowConfirm] = useState(false);

  return (
    <div className="relative group">
      {/* Delete Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          setShowConfirm(true); // Show custom modal
        }}
        className="p-2 rounded-full bg-transparent text-white hover:bg-gray-600 transition duration-200 shadow-md flex items-center justify-center"
      >
        <BsTrash size={18} />
      </button>

      {/* Tooltip */}
      <span className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1 scale-0 group-hover:scale-100 transition bg-transparent text-white text-xs px-2 py-1 ">
        Delete
      </span>

      {/* Custom Delete Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
        <div className="absolute inset-0 bg-black/30 backdrop-blur-md"></div>
        <div className="relative bg-white px-6 py-4 rounded-lg shadow-lg text-center z-10">
            <p className="text-gray-800 text-lg font-semibold">
              Are you sure you want to delete this chat?
            </p>
            <p className="text-red-600 text-sm mt-2">This action cannot be undone.</p>
            <div className="flex justify-center gap-4 mt-4">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition"
              >
                Cancel
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deleteChat(chat.id);
                  setShowConfirm(false);
                }}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeleteButton;
