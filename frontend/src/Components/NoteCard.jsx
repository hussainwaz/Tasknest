import React, { useState } from "react";
import { Pin, MoreVertical, Trash2 } from "lucide-react";

// Note Card Component
export default function NoteCard({ note, onPin, onDelete, formatDate }) {
  const [isHovered, setIsHovered] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const pinned = Boolean(note?.isPinned ?? note?.pinned);

  return (
    <div
      className="relative flex h-40 flex-col rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.04)] p-4 transition-all hover:border-[rgba(255,255,255,0.14)]"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Note Header */}
      {note.title && (
        <h3
          className="mb-2 whitespace-nowrap overflow-x-auto text-sm font-medium text-white"
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
      <p className="flex-1 overflow-auto text-xs text-[rgba(197,208,245,0.78)] md:overflow-hidden md:hover:overflow-auto">
        {note.content.split('\n').map((line, i) => (
          <span key={i}>
            {line}
            <br />
          </span>
        ))}
      </p>

      {/* Note Footer */}
      <div className="mt-3 flex items-center justify-between text-[11px] text-[rgba(197,208,245,0.6)]">
        <span>{formatDate(note.createdAt)}</span>

        {/* Note Actions (shown on hover) */}
        {(isHovered || showOptions) && (
          <div className="flex gap-2">
            <button
              className={`cursor-pointer rounded-full p-1 transition ${pinned ? 'text-[rgba(255,209,102,0.92)] hover:text-[rgba(197,208,245,0.9)]' : 'text-[rgba(197,208,245,0.7)] hover:text-[rgba(255,209,102,0.9)]'}`}
              onClick={() => onPin(note.id)}
            >
              <Pin className="h-4 w-4" />
            </button>
            <div
              className="relative cursor-pointer rounded-full p-1 text-[rgba(197,208,245,0.7)] transition hover:text-[rgba(255,107,107,0.92)]"
              onClick={() => setShowOptions(!showOptions)}
            >
              <MoreVertical className="h-4 w-4" />
              {showOptions && (
                <div className="absolute bottom-6 right-0 z-10 w-32 overflow-hidden rounded-xl border border-[rgba(255,255,255,0.08)] bg-[rgba(16,24,38,0.92)] shadow-[0_12px_25px_rgba(13,21,35,0.32)]">
                  <button
                    className="flex w-full cursor-pointer items-center gap-2 px-3 py-2 text-left text-sm text-[rgba(197,208,245,0.85)] transition hover:bg-[rgba(255,107,107,0.12)] hover:text-[rgba(255,107,107,0.92)]"
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