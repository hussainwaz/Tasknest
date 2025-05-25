import React, { useState } from "react";
import { Pin, MoreVertical, Trash2 } from "lucide-react";

// Note Card Component
export default function NoteCard({ note, onPin, onDelete, formatDate }) {
  const [isHovered, setIsHovered] = useState(false);
  const [showOptions, setShowOptions] = useState(false);

  return (
    <div
      className="bg-gray-900 rounded-xl p-4 border border-gray-800 hover:border-gray-700 transition-all relative h-40 flex flex-col"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Note Header */}
      {note.title && (
        <h3
          className="font-medium mb-2 whitespace-nowrap overflow-x-auto"
          style={{
            WebkitOverflowScrolling: "touch",
            scrollbarWidth: "none",           // Firefox
            msOverflowStyle: "none",          // IE
            overflowX: "auto"
          }}
        >
          {note.title}
        </h3>

      )}

      {/* Note Content */}
      <p className="text-gray-300 text-sm flex-1 overflow-auto md:overflow-hidden md:hover:overflow-auto">
        {note.content.split('\n').map((line, i) => (
          <span key={i}>
            {line}
            <br />
          </span>
        ))}
      </p>

      {/* Note Footer */}
      <div className="flex justify-between items-center mt-2 text-xs text-gray-500">
        <span>{formatDate(note.createdAt)}</span>

        {/* Note Actions (shown on hover) */}
        {(isHovered || showOptions) && (
          <div className="flex gap-2">
            <button
              className={`p-1 rounded-full ${note.pinned ? 'text-yellow-400 hover:text-gray-400' : 'text-gray-400 hover:text-yellow-400'} cursor-pointer`}
              onClick={() => onPin(note.id)}
            >
              <Pin className="h-4 w-4" />
            </button>
            <div
              className="p-1 rounded-full text-gray-400 hover:text-red-400 relative cursor-pointer"
              onClick={() => setShowOptions(!showOptions)}
            >
              <MoreVertical className="h-4 w-4" />
              {showOptions && (
                <div className="absolute right-0 bottom-6 text-gray-400 hover:text-red-400 cursor-pointer bg-gray-800 rounded-md shadow-lg z-10 w-32">
                  <button
                    className="w-full text-left px-3 py-2 text-sm hover:bg-red-900/20 cursor-pointer rounded-md flex items-center gap-2"
                    onClick={() => onDelete(note.id)}
                  >
                    <Trash2 className="h-3 w-3" />
                    Delete
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};