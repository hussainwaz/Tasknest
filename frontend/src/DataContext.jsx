import React, { createContext, useContext, useState, useEffect } from 'react';

const DataContext = createContext();

export const DataProvider = ({ children }) => {
  const [tasks, setTasks] = useState([]);
  const [notes, setNotes] = useState([]);
  const [userId, setUserId] = useState(null);
  const [isGuest, setIsGuest] = useState(false);
  const API = import.meta.env.VITE_API_URL;

  // In DataContext.jsx, modify the fetchUserData function:
const fetchUserData = async (id) => {
  try {
    const resNotes = await fetch(`${API}/notes/${id}`);
    const notesData = await resNotes.json();

    const resTasks = await fetch(`${API}/tasks/${id}`);
    const tasksData = await resTasks.json();

    // Ensure createdAt is properly formatted for notes
    const formattedNotes = notesData.map(note => ({
      ...note,
      createdAt: note.createdAt ? new Date(note.createdAt) : new Date(),
      pinned: note.is_pinned || false
    }));

    setNotes(formattedNotes);
    setTasks(tasksData);
  } catch (err) {
    console.error("Error fetching user data:", err);
  }
};

  useEffect(() => {
    const user_id = localStorage.getItem("user_id");
    if (user_id) {
      setUserId(user_id);
      fetchUserData(user_id);
      setIsGuest(false);
    } else {
      setIsGuest(true);
    }
  }, []);

 return (
    <DataContext.Provider value={{ 
      tasks, 
      notes, 
      setTasks, 
      setNotes, 
      userId, 
      setUserId, // Make sure to expose setUserId
      isGuest,
      setIsGuest, // Make sure to expose setIsGuest
      fetchUserData
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => useContext(DataContext);