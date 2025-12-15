import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const DataContext = createContext();

const normaliseNote = (note) => {
  if (!note) return null;

  const createdValue = note.creationDate ?? note.creation_date ?? note.createdAt;
  const createdAt = createdValue ? new Date(createdValue).toISOString() : new Date().toISOString();
  const pinnedValue = Boolean(note.isPinned ?? note.is_pinned ?? note.pinned);

  return {
    id: note.id,
    title: note.title ?? '',
    content: note.content ?? '',
    createdAt,
    creationDate: createdAt,
    isPinned: pinnedValue,
    pinned: pinnedValue,
    userId: note.userId ?? note.user_id ?? null,
  };
};

const normaliseTask = (task) => {
  if (!task) return null;

  const creationValue = task.creationDate ?? task.creation_date ?? task.createdAt;
  const dueValue = task.dueDate ?? task.due_date ?? task.due;
  const createdAt = creationValue ? new Date(creationValue).toISOString() : new Date().toISOString();
  const dueDate = dueValue ? new Date(dueValue).toISOString() : null;
  const pinnedValue = Boolean(task.isPinned ?? task.is_pinned ?? task.pinned);

  return {
    id: task.id,
    title: task.title ?? '',
    description: task.description ?? '',
    creationDate: createdAt,
    dueDate,
    completed: Boolean(task.completed),
    isPinned: pinnedValue,
    pinned: pinnedValue,
    priority: task.priority ?? 'Medium',
    category: task.category ?? 'Personal',
    userId: task.userId ?? task.user_id ?? null,
  };
};

export const DataProvider = ({ children }) => {
  const [tasks, setTasks] = useState([]);
  const [notes, setNotes] = useState([]);
  const [userId, setUserId] = useState(null);
  const [isGuest, setIsGuest] = useState(false);
  const API = import.meta.env.VITE_API_URL;

  const fetchUserData = useCallback(async (id) => {
    if (!id) return;

    try {
      const [resNotes, resTasks] = await Promise.all([
        fetch(`${API}/notes/${id}`),
        fetch(`${API}/tasks/${id}`),
      ]);

      const notesData = await resNotes.json();
      const tasksData = await resTasks.json();

      setNotes(Array.isArray(notesData) ? notesData.map(normaliseNote).filter(Boolean) : []);
      setTasks(Array.isArray(tasksData) ? tasksData.map(normaliseTask).filter(Boolean) : []);
    } catch (err) {
      console.error('Error fetching user data:', err);
    }
  }, [API]);

  useEffect(() => {
    const storedUserId = localStorage.getItem('user_id');
    if (storedUserId) {
      setUserId(storedUserId);
      setIsGuest(false);
      fetchUserData(storedUserId);
    } else {
      setIsGuest(true);
    }
  }, [fetchUserData]);

  return (
    <DataContext.Provider value={{
      tasks,
      notes,
      setTasks,
      setNotes,
      userId,
      setUserId,
      isGuest,
      setIsGuest,
      fetchUserData,
      normaliseNote,
      normaliseTask,
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => useContext(DataContext);