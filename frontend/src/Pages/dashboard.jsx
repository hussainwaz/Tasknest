import { Plus, CalendarDays, ClipboardList, Pin, PinOff, NotebookPen, Notebook, Activity, Clock, AlarmClock, CalendarCheck, TrendingUp, X } from 'lucide-react';
import React, { useEffect, useState } from "react";
import CustomCheckbox from "../Components/check"
import QuoteOfTheDay from "../Components/QuoteOfTheDay"
import Loading from "../Components/Loading";
import ProductivityChart from "../Components/ProductivityChart"
import { useNavigate } from 'react-router-dom'
export default function HomePage() {

  const [userId, setUserId] = useState(null);
  const [isGuest, setIsGuest] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [notes, setNotes] = useState([]);
  const [warnignOpen, setWarningOpen] = useState(false);

  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate()
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  const [todayTasks, setTodayTasks] = useState([]);

  const [pinnedTasks, setPinnedTasks] = useState([]);

  const [pinnedNotes, setPinnedNotes] = useState([]);

  const [pendingTask, setPendingTask] = useState(null);

  const handleCheck = (taskToCheck) => {
    // Mark it as checked first
    setTodayTasks(prev =>
      prev.map(task =>
        task.title === taskToCheck.title ? { ...task, checked: true } : task
      )
    );
    setPinnedTasks(prev =>
      prev.map(task =>
        task.title === taskToCheck.title ? { ...task, checked: true } : task
      )
    );

    // Trigger pending animation
    setPendingTask(taskToCheck.id);

    setTimeout(() => {
      setTodayTasks(prev => prev.filter(task => task.title !== taskToCheck.title));
      setPinnedTasks(prev => prev.filter(task => task.title !== taskToCheck.title));
      setPendingTask(null);
    }, 300);
  };

  const [focusTimeLeft, setFocusTimeLeft] = useState(25 * 60);
  const [isFocusing, setIsFocusing] = useState(false);

  // Format the timer
  const getFocusTime = (time) => {
    const minutes = Math.floor(time / 60).toString().padStart(2, '0');
    const seconds = (time % 60).toString().padStart(2, '0');
    return `${minutes} : ${seconds}`;
  }

  // Start the focus session
  const startFocusSession = () => {
    if (!isFocusing) {
      setIsFocusing(true);
    }
    else{
      setIsFocusing(false);
    }
  };

  // Countdown logic
  useEffect(() => {
    let interval;
    if (isFocusing && focusTimeLeft > 0) {
      interval = setInterval(() => {
        setFocusTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (focusTimeLeft === 0) {
      clearInterval(interval);
      setIsFocusing(false);
      // You can trigger a notification or alert here
    }

    return () => clearInterval(interval);
  }, [isFocusing, focusTimeLeft]);


  useEffect(() => {
    const user_id = localStorage.getItem("user_id");
    if (user_id) {
      setUserId(user_id);
      fetchUserData(user_id);
      setWarningOpen(false);
    } else {
      setIsGuest(true);
      setWarningOpen(true);
    }

    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const API = import.meta.env.VITE_API_URL;
  const fetchUserData = async (id) => {
    try {
      const resNotes = await fetch(`${API}/notes/${id}`);
      const notesData = await resNotes.json();

      const resTasks = await fetch(`${API}/tasks/${id}`);
      const tasksData = await resTasks.json();

      setNotes(notesData);
      setTasks(tasksData);

      const today = new Date().toISOString().split('T')[0];

      const pinnedNotes = notesData.filter(note => note.is_pinned);
      const pinnedTasks = tasksData.filter(task => task.is_pinned);
      const todayTasks = tasksData.filter(task => {
        const taskDate = new Date(task.due_date).toISOString().split('T')[0];
        return taskDate === today;
      });

      setPinnedNotes(pinnedNotes);
      setPinnedTasks(pinnedTasks);
      setTodayTasks(todayTasks);

      console.log(id, tasksData, today)

    } catch (err) {
      console.error("Error fetching user data:", err);
    }
  };


  return (
    <>
      <div className="relative w-full h-full bg-black text-[#fffbfeff] flex flex-col">
        <div className="bg-[#121212] rounded-2xl flex-1 mx-1 mb-3  overflow-hidden flex flex-col">
          { isFocusing && (
            <div className='absolute inset-0 w-full h-full bg-black/50 z-3'></div>
          )}
          {isGuest && warnignOpen && (
            <div className="bg-yellow-900/40 border border-yellow-500/30 text-yellow-200 p-3 px-6 w-full rounded-t-2xl text-sm shadow-md flex flex-row justify-between items-center ">
              <p><strong>Heads up!</strong> You're not logged in — your tasks and notes won’t be saved permanently. Log in to sync your progress.</p>
              <p><X className='cursor-pointer hover:text-red-500/80 transition-all duration-300' onClick={() => setWarningOpen(false)} /></p>
            </div>
          )}

          {isLoading ? (
            <div className="absolute inset-0 z-50 flex items-center justify-center">
              <Loading />
            </div>
          ) : (
            <div className="h-full overflow-y-auto">
              {/* Welcome part - optimized for mobile first */}
              <div className="flex flex-col lg:flex-row justify-between items-center p-4 md:p-6 md:px-8">
                <div className="flex flex-col gap-1.5 w-full md:w-auto">
                  <div className="flex gap-3 items-center">
                    <h1 className="text-xl sm:text-2xl font-semibold text-white">
                      {getGreeting()}, stranger
                    </h1>
                    <img
                      src="./wave.png"
                      alt="Wave emoji"
                      className="h-7 sm:h-9"
                    />
                  </div>
                  <p className="text-gray-400 text-xs sm:text-sm">
                    Your tasks, notes, and focus — all in one place.
                  </p>
                </div>
                <div className="w-full mt-4 md:mt-0 md:w-auto md:pl-4">
                  <QuoteOfTheDay />
                </div>
              </div>

              {/* Main content grid - fully responsive */}
              <div className="p-4 sm:p-6">
                {/* First row of cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {/* Today's Tasks Card */}
                  <div className="flex flex-col gap-2 p-4 h-[200px] sm:h-[220px] bg-gray-900 rounded-xl relative border border-gray-800 hover:border-blue-500/40 transition-all duration-300 cursor-pointer bg-gradient-to-br from-gray-900/80 via-blue-900/10 to-blue-900/20 shadow-lg hover:shadow-blue-500/10 group"
                    onClick={() => navigate('/tasks')
                    }>
                    <div className="flex justify-between items-center">
                      <h2 className="text-xl sm:text-2xl font-semibold text-white flex items-center gap-2">
                        <CalendarDays className="h-5 w-5 text-blue-400" />
                        Today's Tasks
                      </h2>
                      <div className="px-2 py-1 bg-gray-800/50 rounded-full text-xs flex items-center gap-1">
                        <span className="text-blue-400 font-medium">{todayTasks.length}</span>
                        <span className="text-gray-400">tasks</span>
                      </div>
                    </div>
                    <div className="flex-1 overflow-x-hidden overflow-y-auto mt-2 pr-2">
                      {todayTasks.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center gap-2 text-gray-400/80">
                          <ClipboardList className="h-8 w-8" />
                          <p className="text-sm">No tasks due today</p>
                          <button className="text-blue-400 text-xs mt-2 hover:underline cursor-pointer">
                            Add your first task
                          </button>
                        </div>
                      ) : (
                        todayTasks.map((task) => (
                          <CustomCheckbox
                            key={task.id}
                            label={task.title}
                            due_date={task.due_date}
                            checked={task.completed}
                            onChange={() => handleCheck(task)}
                            isPending={pendingTask === task.id}
                          />
                        ))
                      )}
                    </div>
                  </div>

                  {/* Pinned Tasks Card - Enhanced */}
                  <div className="flex flex-col gap-2 p-4 h-[200px] sm:h-[220px] bg-gray-900 rounded-xl border border-gray-800 hover:border-purple-500/40 transition-all duration-300 bg-gradient-to-br from-gray-900/80 via-purple-900/10 to-purple-900/20 shadow-lg hover:shadow-purple-500/10 cursor-pointer"
                    onClick={() => navigate('/tasks')}
                  >
                    <div className="flex justify-between items-center">
                      <h2 className="text-xl sm:text-2xl font-semibold text-white flex items-center gap-2">
                        <Pin className="h-5 w-5 text-purple-400" />
                        Pinned Tasks
                      </h2>
                      <div className="px-2 py-1 bg-gray-800/50 rounded-full text-xs flex items-center gap-1">
                        <span className="text-purple-400 font-medium">{pinnedTasks.length}</span>
                        <span className="text-gray-400">pinned</span>
                      </div>
                    </div>
                    <div className="flex-1 overflow-x-hidden overflow-y-auto mt-2 pr-2">
                      {pinnedTasks.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center gap-2 text-gray-400/80">
                          <PinOff className="h-8 w-8" />
                          <p className="text-sm">No tasks pinned</p>
                          <button className="text-purple-400 text-xs mt-2 hover:underline cursor-pointer">
                            Pin important tasks
                          </button>
                        </div>
                      ) : (
                        pinnedTasks.map((task) => (
                          <CustomCheckbox
                            key={task.id}
                            label={task.title}
                            due_date={task.due_date}
                            checked={task.checked}
                            onChange={() => handleCheck(task)}
                            isPending={pendingTask === task.id}

                          />
                        ))
                      )}
                    </div>
                  </div>

                  {/* Pinned Notes Card - Enhanced */}
                  <div className="flex flex-col gap-2 p-4 h-[200px] sm:h-[220px] bg-gray-900 rounded-xl border border-gray-800 hover:border-emerald-500/40 transition-all duration-300 bg-gradient-to-br from-gray-900/10 via-emerald-900/10 to-emerald-900/10 shadow-lg hover:shadow-emerald-500/10 cursor-pointer"
                    onClick={() => navigate('/notes')}
                  >
                    <div className="flex justify-between items-center">
                      <h2 className="text-xl sm:text-2xl font-semibold text-white flex items-center gap-2">
                        <NotebookPen className="h-5 w-5 text-emerald-400" />
                        Quick Notes
                      </h2>
                      <div className="px-2 py-1 bg-gray-800/50 rounded-full text-xs flex items-center gap-1">
                        <span className="text-emerald-400 font-medium">{pinnedNotes.length}</span>
                        <span className="text-gray-400">notes</span>
                      </div>
                    </div>
                    <div className="flex-1 overflow-x-hidden overflow-y-auto mt-2 pr-2">
                      {pinnedNotes.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center gap-2 text-gray-400/80">
                          <Notebook className="h-8 w-8" />
                          <p className="text-sm">No notes yet</p>
                          <button className="text-emerald-400 text-xs mt-2 cursor-pointer hover:underline">
                            Create your first note
                          </button>
                        </div>
                      ) : (
                        pinnedNotes.map((note) => (
                          <div key={note.id} className="mb-2">
                            <p className="text-white text-sm font-medium">{note.title}</p>
                            <p className="text-gray-400 text-xs">{note.content}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                  {/* Productivity Stats Card */}
                  <div className="flex flex-col gap-2 p-4 h-[200px] sm:h-[220px] bg-gray-900 rounded-xl border border-gray-800 hover:border-green-500/40 transition-all duration-300 bg-gradient-to-br from-gray-900/80 via-green-900/10 to-green-900/10 shadow-lg hover:shadow-green-500/10 group">
                    <div className="flex justify-between items-center">
                      <h2 className="text-xl sm:text-2xl font-semibold text-white flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-green-400" />
                        Your Stats
                      </h2>
                      <div>
                        Comming Soon
                      </div>
                      {/* <div className="px-2 py-1 bg-gray-800/50 rounded-full text-xs flex items-center gap-1">
                        <span className="text-green-400 font-medium">{1}</span>
                        <span className="text-gray-400">done</span>
                      </div> */}
                    </div>

                    <div className='flex flex-col gap-2 w-full h-full justify-center'>
                      <div className='w-[100%] py-4 rounded-md bg-gray-500/30 animate-pulse'></div>
                      <div className='w-[60%] py-4 rounded-md bg-gray-500/30 animate-pulse'></div>
                      <div className='w-[80%] py-4 rounded-md bg-gray-500/30 animate-pulse'></div>
                    </div>
                    {/* <div className="flex-1 flex items-center justify-center">
                      <ProductivityChart
                        completed={0}
                        pending={20}
                        overdue={300}
                      />
                    </div> */}
                  </div>
                  <div className={`bg-gray-900 z-5 p-5 rounded-xl border border-gray-800 duration-300 hover:border-red-500/40 shadow-lg hover:shadow-red-500/10 transition-all  group flex flex-col items-center justify-between bg-gradient-to-br from-gray-800/50 via-red-900/20 to-red-900/20 ${isFocusing?"scale-150 border-red-500/40":""}`}>
                    <div className="flex items-center gap-3 w-full">
                      <div className="bg-blue-900/30 p-3 rounded-full group-hover:bg-blue-900/50 transition-colors">
                        <span className="text-2xl">🎯</span>
                      </div>
                      <div>
                        <h3 className="font-medium text-white">Focus Mode</h3>
                        <p className="text-sm text-gray-400">25-minute deep work session</p>
                      </div>
                    </div>
                    <div>
                      <p className='text-2xl font-bold'>{getFocusTime(focusTimeLeft)}</p>
                    </div>
                    <button
                      className="mt-3 w-full py-2 bg-blue-600 hover:bg-blue-700 rounded-md font-medium text-white transition-colors text-sm cursor-pointer"
                      onClick={() => startFocusSession()}
                    >
                      {isFocusing && (
                        <span>Pause Session</span>
                      )}
                      {!isFocusing && (
                        <span>Start Session</span>
                      )}                      
                    </button>

                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}