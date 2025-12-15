import { Plus, Search, NotepadText } from "lucide-react";
import React, { useEffect, useState } from "react";
import NoteCard from "../Components/NoteCard";
import { useData } from '../DataContext';

export default function Notes() {
    const { notes, setNotes, userId, isGuest, normaliseNote } = useData();
    const API = import.meta.env.VITE_API_URL;

    // Local UI state
    const [searchQuery, setSearchQuery] = useState("");
    const [newNoteContent, setNewNoteContent] = useState("");
    const [isCreatingNote, setIsCreatingNote] = useState(false);
    const [newNoteTitle, setNewNoteTitle] = useState("");

    // Fetch notes when userId changes (on login)
    useEffect(() => {
        let isMounted = true;
        const fetchNotes = async () => {
            if (!userId || isGuest) {
                return;
            }

            try {
                const res = await fetch(`${API}/notes/${userId}`);
                const data = await res.json();
                if (!isMounted) return;
                const mappedNotes = Array.isArray(data)
                    ? data.map(normaliseNote).filter(Boolean)
                    : [];
                setNotes(mappedNotes);
            } catch (err) {
                console.error("Error fetching notes:", err);
            }
        };

        fetchNotes();
        return () => {
            isMounted = false;
        };
    }, [userId, API, setNotes, normaliseNote, isGuest]);

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
            note.id === id
                ? { ...note, isPinned: !note.isPinned, pinned: !note.isPinned }
                : note
        );

        if (isGuest) {
            setNotes(updatedNotes);
        } else {
            try {
                const noteToUpdate = updatedNotes.find(note => note.id === id);
                const res = await fetch(`${API}/notes/${id}`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ isPinned: noteToUpdate.isPinned }),
                });
                if (res.ok) {
                    const payload = await res.json();
                    if (payload?.note) {
                        setNotes(notes.map(n => n.id === id ? normaliseNote(payload.note) : n));
                    } else {
                        setNotes(updatedNotes);
                    }
                }
            } catch (err) {
                console.error("Error updating note:", err);
            }
        }
    };

    // Create new note
    const createNote = async () => {
        if (!newNoteContent.trim() && !newNoteTitle.trim()) return;

        const tempNote = normaliseNote({
            id: Date.now(),
            title: newNoteTitle.trim(),
            content: newNoteContent.trim(),
            isPinned: false,
            creationDate: new Date().toISOString(),
        });

        if (isGuest) {
            // Local-only for guest
            setNotes([tempNote, ...notes]);
            setNewNoteContent("");
            setNewNoteTitle("");
            setIsCreatingNote(false);
        } else {
            try {
                const res = await fetch(`${API}/notes`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        title: tempNote.title,
                        content: tempNote.content,
                        creationDate: tempNote.creationDate,
                        isPinned: tempNote.isPinned,
                        user_id: userId,
                    }),
                });
                const data = await res.json();

                if (data.success) {
                    const newNoteFromServer = {
                        ...normaliseNote(data.note),
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
        <section className="relative h-full w-full overflow-hidden">
            <div className="absolute inset-0" aria-hidden="true">
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_35%_15%,rgba(109,141,255,0.16),transparent_55%)]" />
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_80%_80%,rgba(87,214,255,0.12),transparent_60%)]" />
            </div>

            <div className="relative h-full w-full overflow-y-auto custom-scrollbar px-[10px] py-4">
                <div className="surface-blur rounded-[28px] border border-[rgba(255,255,255,0.04)]">
                    <div className="flex flex-col gap-4 border-b border-[rgba(255,255,255,0.06)] px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-3">
                            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[rgba(109,141,255,0.14)]">
                                <NotepadText className="h-5 w-5 text-white" />
                            </span>
                            <div>
                                <h1 className="text-xl font-semibold">Notes</h1>
                                <p className="mt-1 text-xs text-[rgba(197,208,245,0.68)]">Capture ideas, pin the important ones.</p>
                            </div>
                        </div>

                        <div className="relative w-full sm:w-[320px]">
                            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[rgba(197,208,245,0.65)]" />
                            <input
                                type="text"
                                placeholder="Search notes..."
                                className="w-full rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)] py-2 pl-11 pr-4 text-sm text-white placeholder:text-[rgba(197,208,245,0.5)] focus:outline-none focus:ring-2 focus:ring-[rgba(109,141,255,0.35)]"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="px-4 py-4">
                        {/* Pinned Notes Section */}
                        {filteredNotes.some(note => note.isPinned) && (
                            <div className="mb-6">
                                <h2 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[rgba(197,208,245,0.65)] mb-3">Pinned</h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                    {filteredNotes
                                        .filter(note => note.isPinned)
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
                            <h2 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[rgba(197,208,245,0.65)] mb-3">All notes</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 lg:grid-cols-3 gap-4">
                                {isCreatingNote ? (
                                    <div className="rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)] p-4">
                                        <input
                                            placeholder="Note title..."
                                            type="text"
                                            className="mb-2 w-full bg-transparent text-sm font-medium text-white placeholder:text-[rgba(197,208,245,0.5)] focus:outline-none"
                                            value={newNoteTitle}
                                            onChange={(e) => setNewNoteTitle(e.target.value)}
                                            autoFocus
                                        />
                                        <textarea
                                            placeholder="Write note detail.."
                                            className="mb-3 h-32 w-full resize-none bg-transparent text-sm text-[rgba(197,208,245,0.78)] placeholder:text-[rgba(197,208,245,0.5)] focus:outline-none"
                                            value={newNoteContent}
                                            onChange={(e) => setNewNoteContent(e.target.value)}
                                        />

                                        <div className="flex justify-end mb-2 gap-2">
                                            <button className="rounded-full border border-[rgba(255,255,255,0.1)] px-4 py-2 text-xs font-semibold uppercase tracking-wide text-[rgba(197,208,245,0.8)] transition hover:border-[rgba(255,255,255,0.18)]"
                                                onClick={() => setIsCreatingNote(false)}
                                            >
                                                cancel
                                            </button>
                                            <button className="rounded-full bg-gradient-to-r from-[rgba(109,141,255,0.85)] to-[rgba(87,214,255,0.85)] px-4 py-2 text-xs font-semibold uppercase tracking-wide text-[rgba(4,7,13,0.85)] transition hover:opacity-95 disabled:opacity-60 disabled:cursor-not-allowed"
                                                onClick={createNote}
                                                disabled={!(newNoteContent.trim() || newNoteTitle.trim())}
                                            >
                                                save
                                            </button>

                                        </div>

                                    </div>
                                ) : (
                                    <button className="flex h-40 flex-col items-center justify-center rounded-2xl border border-dashed border-[rgba(255,255,255,0.14)] bg-[rgba(255,255,255,0.03)] transition hover:border-[rgba(109,141,255,0.5)]"
                                        onClick={() => setIsCreatingNote(true)}
                                    >
                                        <Plus className="mb-2 h-6 w-6 text-[rgba(197,208,245,0.75)]" />
                                        <span className="text-sm font-medium text-[rgba(197,208,245,0.75)]">New note</span>
                                    </button>
                                )}

                                {/* allnotes */}
                                {filteredNotes.filter(note => !note.isPinned)
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
        </section>
    )
}