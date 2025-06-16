import { Plus, Search, Trash2, Pin, MoreVertical, NotepadText, Key } from "lucide-react";
import React, { useEffect, useState } from "react";
import NoteCard from "../Components/NoteCard";
import { useData } from '../DataContext';

export default function Notes() {
    const { notes, setNotes, userId, isGuest, fetchUserData } = useData();
    const API = import.meta.env.VITE_API_URL;

    // Local UI state
    const [searchQuery, setSearchQuery] = useState("");
    const [newNoteContent, setNewNoteContent] = useState("");
    const [isCreatingNote, setIsCreatingNote] = useState(false);
    const [newNoteTitle, setNewNoteTitle] = useState("");

    // Fetch notes when userId changes (on login)
    useEffect(() => {
        const fetchNotes = async () => {
            if (userId) {
                try {
                    const res = await fetch(`${API}/notes/${userId}`);
                    const data = await res.json();
                    const mappedNotes = data.map(note => ({
                        id: note.id,
                        title: note.title,
                        content: note.content,
                        pinned: note.is_pinned,
                        createdAt: new Date(note.createdAt)
                    }));
                    setNotes(mappedNotes);
                } catch (err) {
                    console.error("Error fetching notes:", err);
                }
            }
        };

        fetchNotes();
    }, [userId, API, setNotes]);

    // Filter notes based on search
    const filteredNotes = notes.filter(note => {
        const searchLower = searchQuery.toLowerCase();
        return (
            note.content.toLowerCase().includes(searchLower) ||
            (note.title && note.title.toLowerCase().includes(searchLower))
        );
    });

    // Format date (already fixed)
    const formatDate = (date) => {
        if (!date) return "Just now";
        const now = new Date();
        const dateObj = date instanceof Date ? date : new Date(date);
        const diff = now - dateObj;

        if (isNaN(diff)) return "Just now";

        if (diff < 60000) return "Just now";
        if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
        if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
        return dateObj.toLocaleDateString();
    };

    // Delete note
    const deleteNote = async (id) => {
        if (isGuest) {
            setNotes(notes.filter(note => note.id !== id));
        } else {
            try {
                const res = await fetch(`${API}/notes/${id}`, {
                    method: "DELETE",
                });
                if (res.ok) {
                    setNotes(notes.filter(note => note.id !== id));
                }
            } catch (err) {
                console.error("Error deleting note:", err);
            }
        }
    };

    // Toggle pin status
    const togglePin = async (id) => {
        const updatedNotes = notes.map(note =>
            note.id === id ? { ...note, pinned: !note.pinned } : note
        );
        
        if (isGuest) {
            setNotes(updatedNotes);
        } else {
            try {
                const noteToUpdate = updatedNotes.find(note => note.id === id);
                const res = await fetch(`${API}/notes/${id}`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ is_pinned: noteToUpdate.pinned }),
                });
                if (res.ok) {
                    setNotes(updatedNotes);
                }
            } catch (err) {
                console.error("Error updating note:", err);
            }
        }
    };

    // Create new note
    const createNote = async () => {
        if (!newNoteContent.trim() && !newNoteTitle.trim()) return;

        const newNote = {
            id: Date.now(),
            title: newNoteTitle.trim(),
            content: newNoteContent.trim(),
            pinned: false,
            createdAt: new Date(),
        };

        if (isGuest) {
            // Local-only for guest
            setNotes([newNote, ...notes]);
            setNewNoteContent("");
            setNewNoteTitle("");
            setIsCreatingNote(false);
        } else {
            try {
                const res = await fetch(`${API}/notes`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ ...newNote, user_id: userId }),
                });
                const data = await res.json();

                if (data.success) {
                    const newNoteFromServer = {
                        ...data.note,
                        createdAt: new Date(data.note.createdAt), // Convert string to Date here
                    };
                    setNotes([newNoteFromServer, ...notes]);

                    setNewNoteContent("");
                    setNewNoteTitle("");
                    setIsCreatingNote(false);
                } else {
                    alert(data.message || "Failed to create note");
                }
            } catch (err) {
                console.error("Error creating note:", err);
                alert("Server error while creating note");
            }
        }
    };

    return (
        <div className="relative w-full h-full bg-black text-[#fffbfeff] flex flex-col">
            <div className="bg-[#121212] rounded-2xl flex-1 mx-1 mb-3  overflow-hidden flex flex-col">

                <div className="p-4 border-b border-gray-800 flex justify-between items-center">
                    <h1 className="text-xl font-bold flex items-center gap-2"><NotepadText /> Notes</h1>
                    <div className="relative w-64">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search notes..."
                            className="bg-gray-900 w-full pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto px-4 py-2">
                    {/* Pinned Notes Section */}
                    {filteredNotes.some(note => note.pinned) && (
                        <div className="mb-6">
                            <h2 className="text-sm font-medium text-gray-400 mb-3">PINNED</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                {filteredNotes
                                    .filter(note => note.pinned)
                                    .map(note => (
                                        <NoteCard
                                            key={note.id}
                                            note={note}
                                            onPin={togglePin}
                                            onDelete={deleteNote}
                                            formatDate={formatDate}
                                        />
                                    ))}
                            </div>
                        </div>
                    )}

                    {/* All Notes Section */}
                    <div>
                        <h2 className="text-sm font-medium text-gray-400 mb-3">ALL NOTES</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 lg:grid-cols-3 gap-4">
                            {isCreatingNote ? (
                                <div className="bg-gray-900 p-4 rounded-xl border border-gray-700">
                                    <input
                                        placeholder="Note title..."
                                        type="text"
                                        className="focus:outline-none w-full bg-transparent mb-2"
                                        value={newNoteTitle}
                                        onChange={(e) => setNewNoteTitle(e.target.value)}
                                        autoFocus
                                    />
                                    <textarea
                                        placeholder="Write note detail.."
                                        className="focus:outline-none w-full bg-transparent mb-2 h-32 resize-none"
                                        value={newNoteContent}
                                        onChange={(e) => setNewNoteContent(e.target.value)}
                                    />

                                    <div className="flex justify-end mb-2 gap-2">
                                        <button className="px-3 py-1 text-sm rounded hover:bg-gray-800 cursor-pointer"
                                            onClick={(e) => setIsCreatingNote(false)}
                                        >
                                            cancel
                                        </button>
                                        <button className="px-3 py-1 text-sm rounded bg-blue-600 hover:bg-blue-700 cursor-pointer"
                                            onClick={createNote}
                                            disabled={!(newNoteContent.trim() || newNoteTitle.trim())}
                                        >
                                            save
                                        </button>

                                    </div>

                                </div>
                            ) : (
                                <button className="flex flex-col items-center justify-center h-40 bg-gray-900 hover:bg-gray-800 border-2 border-dashed  border-gray-700 rounded-2xl p4 transition-all"
                                    onClick={(e) => setIsCreatingNote(true)}
                                >
                                    <Plus className="h-6 w-6 text-gray-400 mb-2" />
                                    <span className="text-gray-400">New Note</span>
                                </button>
                            )}

                            {/* allnotes */}
                            {filteredNotes.filter(note => !note.pinned)
                                .map(note => (
                                    <NoteCard
                                        key={note.id}
                                        note={note}
                                        onPin={togglePin}
                                        onDelete={deleteNote}
                                        formatDate={formatDate}
                                    />
                                ))
                            }
                        </div>

                    </div>
                </div>

            </div>
        </div>
    )
}