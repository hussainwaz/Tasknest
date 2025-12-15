import { Plus, CalendarDays, Pin, PinOff, NotebookPen, Notebook, TrendingUp, Sparkles, AlertTriangle, Play, Pause, X, Volume2, VolumeX, RotateCcw } from 'lucide-react';
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import CustomCheckbox from "../Components/check";
import QuoteOfTheDay from "../Components/QuoteOfTheDay";
import Loading from "../Components/Loading";
import ProductivityChart from "../Components/ProductivityChart";
import { useNavigate } from 'react-router-dom';
import { useData } from '../DataContext';

const toDateKey = (value) => {
  if (!value) return null;
  try {
    return new Date(value).toISOString().split('T')[0];
  } catch {
    return null;
  }
};

export default function HomePage() {
  const { tasks, notes, userId, isGuest, fetchUserData, setTasks, normaliseTask } = useData();
  const API = import.meta.env.VITE_API_URL;

  const [warningOpen, setWarningOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const hasInitialised = useRef(false);
  const lastUserIdRef = useRef(null);
  const navigate = useNavigate();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  const todayKey = useMemo(() => toDateKey(new Date()), []);
  const todayLabel = useMemo(
    () => new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' }),
    []
  );

  useEffect(() => {
    if (lastUserIdRef.current !== userId) {
      hasInitialised.current = false;
      lastUserIdRef.current = userId;
    }

    const initialiseDashboard = async () => {
      try {
        setIsLoading(true);

        if (isGuest || !fetchUserData || !userId) {
          hasInitialised.current = true;
          return;
        }

        if (hasInitialised.current) {
          return;
        }

        if ((tasks?.length ?? 0) || (notes?.length ?? 0)) {
          hasInitialised.current = true;
          return;
        }

        await fetchUserData(userId);
        hasInitialised.current = true;
      } catch (error) {
        console.error("Failed to load dashboard data", error);
      } finally {
        setIsLoading(false);
      }
    };

    initialiseDashboard();
  }, [userId, fetchUserData, tasks, notes, isGuest]);

  useEffect(() => {
    if (isGuest) {
      setIsLoading(false);
      return;
    }

    if (!fetchUserData || !userId) {
      setIsLoading(false);
      return;
    }

    if ((tasks?.length ?? 0) || (notes?.length ?? 0)) {
      setIsLoading(false);
    }
  }, [tasks, notes, fetchUserData, userId, isGuest]);

  useEffect(() => {
    setWarningOpen(Boolean(isGuest));
  }, [isGuest]);

  const pinnedNotes = useMemo(() => (notes || []).filter(note => note?.isPinned), [notes]);
  const pinnedTasks = useMemo(() => (tasks || []).filter(task => task?.isPinned && !task?.completed), [tasks]);
  const todayTasks = useMemo(
    () => (tasks || []).filter(task => !task?.completed && toDateKey(task?.dueDate) === todayKey),
    [tasks, todayKey]
  );

  const [pendingTask, setPendingTask] = useState(null);
  const markTaskCompleted = useCallback(async (taskToCheck) => {
    if (!taskToCheck?.id) return;

    const taskId = taskToCheck.id;
    setPendingTask(taskId);

    const optimisticUpdate = () => {
      setTasks(prev => (prev || []).map(task => (
        task.id === taskId ? { ...task, completed: true } : task
      )));
    };

    if (isGuest) {
      optimisticUpdate();
      window.setTimeout(() => setPendingTask(null), 300);
      return;
    }

    optimisticUpdate();

    try {
      const res = await fetch(`${API}/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: true }),
      });

      if (res.ok) {
        const payload = await res.json();
        if (payload?.task) {
          setTasks(prev => (prev || []).map(task => (
            task.id === taskId ? normaliseTask(payload.task) : task
          )));
        }
      }
    } catch (err) {
      console.error("Error updating task:", err);
    } finally {
      window.setTimeout(() => setPendingTask(null), 300);
    }
  }, [API, isGuest, normaliseTask, setTasks]);

  const [focusTimeLeft, setFocusTimeLeft] = useState(25 * 60);
  const [isFocusing, setIsFocusing] = useState(false);
  const [focusOverlayOpen, setFocusOverlayOpen] = useState(false);

  const rainAudioRef = useRef(null);
  const [rainEnabled, setRainEnabled] = useState(true);
  const [rainPlaying, setRainPlaying] = useState(false);

  useEffect(() => {
    const audio = new Audio('/rain.mp3');
    audio.loop = true;
    audio.preload = 'auto';
    audio.volume = 0.55;
    rainAudioRef.current = audio;

    return () => {
      try {
        audio.pause();
        audio.src = '';
      } catch {
        // ignore
      }
      rainAudioRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!isFocusing) return;

    const timer = setInterval(() => {
      setFocusTimeLeft(prev => {
        if (prev <= 1) {
          setIsFocusing(false);
          return 25 * 60;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isFocusing]);

  useEffect(() => {
    if (isFocusing) return;
    try {
      const audio = rainAudioRef.current;
      if (audio) {
        audio.pause();
      }
    } catch {
      // ignore
    }
    setRainPlaying(false);
  }, [isFocusing]);

  const getFocusTime = (time) => {
    const minutes = Math.floor(time / 60).toString().padStart(2, '0');
    const seconds = (time % 60).toString().padStart(2, '0');
    return `${minutes} : ${seconds}`;
  };

  const startFocusSession = async () => {
    setFocusOverlayOpen(true);

    if (isFocusing) {
      setIsFocusing(false);
      try {
        const audio = rainAudioRef.current;
        if (audio) {
          audio.pause();
        }
      } catch {
        // ignore
      }
      setRainPlaying(false);
      return;
    }

    if (focusTimeLeft <= 0) {
      setFocusTimeLeft(25 * 60);
    }
    setIsFocusing(true);

    if (rainEnabled) {
      try {
        const audio = rainAudioRef.current;
        if (audio) {
          await audio.play();
          setRainPlaying(true);
        }
      } catch {
        setRainPlaying(false);
      }
    }
  };

  const pauseFocusSession = () => {
    setIsFocusing(false);
    try {
      const audio = rainAudioRef.current;
      if (audio) {
        audio.pause();
      }
    } catch {
      // ignore
    }
    setRainPlaying(false);
  };

  const resetFocusSession = () => {
    setIsFocusing(false);
    setFocusTimeLeft(25 * 60);
    try {
      const audio = rainAudioRef.current;
      if (audio) {
        audio.pause();
        audio.currentTime = 0;
      }
    } catch {
      // ignore
    }
    setRainPlaying(false);
  };

  const toggleRain = async () => {
    const next = !rainEnabled;
    setRainEnabled(next);

    const audio = rainAudioRef.current;
    if (!audio) return;

    if (!next) {
      try {
        audio.pause();
        audio.currentTime = 0;
      } catch {
        // ignore
      }
      setRainPlaying(false);
      return;
    }

    if (focusOverlayOpen || isFocusing) {
      try {
        await audio.play();
        setRainPlaying(true);
      } catch {
        setRainPlaying(false);
      }
    }
  };

  const totalTasks = tasks?.length ?? 0;
  const completedTasks = useMemo(() => (tasks || []).filter(task => task?.completed).length, [tasks]);
  const activeTasks = totalTasks - completedTasks;
  const todayCount = todayTasks.length;
  const pinnedNotesCount = pinnedNotes.length;
  const progress = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

  const overdueCount = useMemo(() => (tasks || []).filter(task => {
    if (!task || task.completed) return false;
    const dueKey = toDateKey(task.dueDate);
    if (!dueKey) return false;
    return dueKey < todayKey;
  }).length, [tasks, todayKey]);

  const pendingCount = useMemo(() => (tasks || []).filter(task => {
    if (!task || task.completed) return false;
    const dueKey = toDateKey(task.dueDate);
    if (!dueKey) return true;
    return dueKey >= todayKey;
  }).length, [tasks, todayKey]);

  return (
    <section className="relative h-full w-full overflow-hidden">
      <div className="absolute inset-0" aria-hidden="true">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_35%_15%,rgba(109,141,255,0.16),transparent_55%)]" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_80%_80%,rgba(87,214,255,0.12),transparent_60%)]" />
      </div>

      {focusOverlayOpen && (
        <div className="fixed inset-0 z-30">
          <div className="absolute inset-0 bg-[rgba(4,7,13,0.72)] backdrop-blur-xl" />
          <div className="relative flex h-full w-full items-center justify-center px-[10px] py-6">
            <div className="surface-blur w-full max-w-[560px] rounded-[28px] border border-[rgba(255,255,255,0.06)] p-5 sm:p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[rgba(197,208,245,0.65)]">Focus pulse</p>
                  <h2 className="mt-2 text-xl font-semibold">Deep work session</h2>
                  <p className="mt-1 text-sm text-[rgba(197,208,245,0.7)]">Stay in the zone. Rain sound is optional.</p>
                </div>
                <button
                  type="button"
                  className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)] text-[rgba(197,208,245,0.85)] transition hover:border-[rgba(255,255,255,0.16)]"
                  onClick={() => {
                    setFocusOverlayOpen(false);
                    if (!isFocusing) {
                      try {
                        const audio = rainAudioRef.current;
                        if (audio) {
                          audio.pause();
                        }
                      } catch {
                        // ignore
                      }
                      setRainPlaying(false);
                    }
                  }}
                  aria-label="Close focus"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="mt-6 flex flex-col items-center gap-6">
                <div className="flex h-40 w-40 items-center justify-center rounded-full border border-[rgba(109,141,255,0.28)] bg-[rgba(255,255,255,0.04)] text-3xl font-semibold">
                  {getFocusTime(focusTimeLeft)}
                </div>

                <div className="w-full">
                  <div className="h-2 w-full overflow-hidden rounded-full bg-[rgba(255,255,255,0.06)]">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[rgba(109,141,255,0.8)] to-[rgba(87,214,255,0.8)]"
                      style={{ width: `${Math.min(100, Math.max(0, (1 - focusTimeLeft / (25 * 60)) * 100))}%` }}
                    />
                  </div>
                  <div className="mt-2 flex items-center justify-between text-xs text-[rgba(197,208,245,0.65)]">
                    <span>0:00</span>
                    <span>25:00</span>
                  </div>
                </div>

                <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex flex-wrap items-center gap-2">
                    {isFocusing ? (
                      <button
                        type="button"
                        className="inline-flex items-center gap-2 rounded-full bg-[rgba(109,141,255,0.2)] px-6 py-2 text-sm font-semibold text-white transition hover:bg-[rgba(109,141,255,0.32)]"
                        onClick={pauseFocusSession}
                      >
                        <Pause className="h-4 w-4" />
                        Pause
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[rgba(109,141,255,0.9)] to-[rgba(87,214,255,0.9)] px-6 py-2 text-sm font-semibold text-[rgba(4,7,13,0.85)] transition hover:opacity-95"
                        onClick={startFocusSession}
                      >
                        <Play className="h-4 w-4" />
                        Start
                      </button>
                    )}

                    <button
                      type="button"
                      className="inline-flex items-center gap-2 rounded-full border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.04)] px-5 py-2 text-sm font-semibold text-[rgba(197,208,245,0.85)] transition hover:border-[rgba(255,255,255,0.18)]"
                      onClick={resetFocusSession}
                    >
                      <RotateCcw className="h-4 w-4" />
                      Reset
                    </button>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      className={`inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm font-semibold transition ${rainEnabled
                        ? "border border-[rgba(87,214,255,0.28)] bg-[rgba(87,214,255,0.12)] text-white hover:bg-[rgba(87,214,255,0.18)]"
                        : "border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.04)] text-[rgba(197,208,245,0.85)] hover:border-[rgba(255,255,255,0.18)]"
                        }`}
                      onClick={toggleRain}
                    >
                      {rainEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                      Rain
                    </button>

                    <span className="text-xs text-[rgba(197,208,245,0.65)]">
                      {rainEnabled ? (rainPlaying ? "Playing" : "Ready") : "Off"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="relative h-full w-full overflow-y-auto custom-scrollbar px-[10px] py-4">
        {isGuest && warningOpen && (
          <div className="mb-6 flex items-center justify-between gap-4 rounded-2xl border border-[rgba(255,209,102,0.35)] bg-[rgba(255,209,102,0.1)] px-4 py-3 text-[rgba(255,209,102,0.95)]">
            <div className="flex items-center gap-3 text-sm">
              <AlertTriangle className="h-5 w-5" />
              <p>Heads up! You are exploring as a guest. Sign in to sync tasks and notes permanently.</p>
            </div>
            <button
              className="rounded-full border border-[rgba(255,209,102,0.4)] px-3 py-1 text-xs uppercase tracking-wide"
              onClick={() => setWarningOpen(false)}
            >
              Dismiss
            </button>
          </div>
        )}

        {isLoading ? (
          <div className="flex min-h-[60vh] items-center justify-center">
            <Loading />
          </div>
        ) : (
          <div className="flex flex-col gap-6 pb-10">
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
              <div className="surface-blur relative overflow-hidden rounded-[28px] border border-[rgba(109,141,255,0.18)] p-6 sm:p-8">
                <div className="absolute -left-12 top-6 h-40 w-40 rounded-full bg-[rgba(109,141,255,0.16)] blur-3xl" aria-hidden="true" />
                <div className="absolute bottom-0 right-0 h-32 w-32 bg-[radial-gradient(circle,rgba(87,214,255,0.16),transparent_70%)]" aria-hidden="true" />
                <div className="relative flex flex-col gap-6">
                  <div className="flex flex-col gap-3">
                    <span className="pill text-[rgba(197,208,245,0.78)]">{todayLabel}</span>
                    <h1 className="text-2xl font-semibold sm:text-3xl">
                      {getGreeting()}, {isGuest ? 'Guest creator' : 'Tasknest member'}
                    </h1>
                    <p className="text-sm text-[rgba(197,208,245,0.75)] sm:text-base">
                      Everything you need to plan, capture, and focus is organised for you. Start a quick session or capture a thought before it fades.
                    </p>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-3">
                    <div className="rounded-2xl border border-[rgba(109,141,255,0.25)] bg-[rgba(109,141,255,0.08)] px-4 py-3">
                      <p className="text-[11px] uppercase tracking-[0.16em] text-[rgba(197,208,245,0.7)]">Active tasks</p>
                      <div className="mt-2 flex items-end gap-2">
                        <span className="text-2xl font-semibold">{activeTasks}</span>
                        <span className="text-xs text-[rgba(197,208,245,0.65)]">currently open</span>
                      </div>
                    </div>
                    <div className="rounded-2xl border border-[rgba(87,214,255,0.25)] bg-[rgba(87,214,255,0.08)] px-4 py-3">
                      <p className="text-[11px] uppercase tracking-[0.16em] text-[rgba(197,208,245,0.7)]">Progress</p>
                      <div className="mt-2 flex items-end gap-2">
                        <span className="text-2xl font-semibold">{progress}%</span>
                        <span className="text-xs text-[rgba(197,208,245,0.65)]">completed this cycle</span>
                      </div>
                    </div>
                    <div className="rounded-2xl border border-[rgba(255,209,102,0.25)] bg-[rgba(255,209,102,0.08)] px-4 py-3">
                      <p className="text-[11px] uppercase tracking-[0.16em] text-[rgba(197,208,245,0.7)]">Pinned notes</p>
                      <div className="mt-2 flex items-end gap-2">
                        <span className="text-2xl font-semibold">{pinnedNotesCount}</span>
                        <span className="text-xs text-[rgba(197,208,245,0.65)]">ready to revisit</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      onClick={() => navigate('/tasks')}
                      className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[rgba(109,141,255,0.9)] to-[rgba(87,214,255,0.9)] px-4 py-2 text-sm font-semibold text-[rgba(4,7,13,0.85)] transition hover:opacity-95"
                    >
                      <Plus className="h-4 w-4" />
                      Quick task
                    </button>
                    <button
                      onClick={() => navigate('/notes')}
                      className="inline-flex items-center gap-2 rounded-full border border-[rgba(109,141,255,0.3)] bg-[rgba(255,255,255,0.06)] px-4 py-2 text-sm font-medium text-white transition hover:border-[rgba(109,141,255,0.5)]"
                    >
                      <NotebookPen className="h-4 w-4" />
                      Capture a note
                    </button>
                  </div>
                </div>
              </div>

              <div className="surface-blur rounded-[28px] border border-[rgba(109,141,255,0.16)] p-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold">Daily inspiration</h2>
                  <Sparkles className="h-5 w-5 text-[rgba(109,141,255,0.9)]" />
                </div>
                <div className="mt-4 rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)] p-4">
                  <QuoteOfTheDay />
                </div>
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
              <div className="surface-blur rounded-[24px] border border-[rgba(109,141,255,0.18)] p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">Today's commitments</h3>
                    <p className="text-xs text-[rgba(197,208,245,0.7)]">{todayCount === 0 ? 'Nothing pressing, plan ahead.' : `${todayCount} task${todayCount === 1 ? '' : 's'} lined up.`}</p>
                  </div>
                  <span className="rounded-full bg-[rgba(109,141,255,0.12)] px-3 py-1 text-xs font-medium text-[rgba(109,141,255,0.8)]">{todayCount}</span>
                </div>
                <div className="mt-4 flex max-h-[210px] flex-col gap-3 overflow-y-auto pr-1">
                  {todayTasks.length === 0 ? (
                    <button
                      onClick={() => navigate('/tasks')}
                      className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-[rgba(109,141,255,0.3)] bg-[rgba(255,255,255,0.03)] py-8 text-sm text-[rgba(197,208,245,0.7)] transition hover:border-[rgba(109,141,255,0.6)]"
                    >
                      <CalendarDays className="h-5 w-5" />
                      Schedule a new intention
                    </button>
                  ) : (
                    todayTasks.map(task => (
                      <CustomCheckbox
                        key={task.id}
                        label={task.title}
                        dueDate={task.dueDate}
                        checked={task.completed}
                        onChange={() => markTaskCompleted(task)}
                        isPending={pendingTask === task.id}
                      />
                    ))
                  )}
                </div>
              </div>

              <div className="surface-blur rounded-[24px] border border-[rgba(255,209,102,0.2)] p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">Pinned priorities</h3>
                    <p className="text-xs text-[rgba(197,208,245,0.7)]">Stay close to what matters most.</p>
                  </div>
                  <span className="rounded-full bg-[rgba(255,209,102,0.14)] px-3 py-1 text-xs font-medium text-[rgba(255,209,102,0.85)]">{pinnedTasks.length}</span>
                </div>
                <div className="mt-4 flex max-h-[210px] flex-col gap-3 overflow-y-auto pr-1">
                  {pinnedTasks.length === 0 ? (
                    <button
                      onClick={() => navigate('/tasks')}
                      className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-[rgba(255,209,102,0.32)] bg-[rgba(255,255,255,0.03)] py-8 text-sm text-[rgba(255,209,102,0.8)] transition hover:border-[rgba(255,209,102,0.6)]"
                    >
                      <PinOff className="h-5 w-5" />
                      Pin important tasks to keep focus
                    </button>
                  ) : (
                    pinnedTasks.map(task => (
                      <CustomCheckbox
                        key={task.id}
                        label={task.title}
                        dueDate={task.dueDate}
                        checked={task.completed}
                        onChange={() => markTaskCompleted(task)}
                        isPending={pendingTask === task.id}
                      />
                    ))
                  )}
                </div>
              </div>

              <div
                role="button"
                tabIndex={0}
                onClick={() => setFocusOverlayOpen(true)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') setFocusOverlayOpen(true);
                }}
                className="surface-blur w-full cursor-pointer rounded-[24px] border border-[rgba(109,141,255,0.18)] p-5 text-left transition hover:border-[rgba(109,141,255,0.35)]"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">Focus pulse</h3>
                    <p className="text-xs text-[rgba(197,208,245,0.7)]">25-minute deep work ritual</p>
                  </div>
                  <TrendingUp className="h-5 w-5 text-[rgba(109,141,255,0.85)]" />
                </div>
                <div className="mt-6 flex flex-col items-center gap-6">
                  <div className="flex h-32 w-32 items-center justify-center rounded-full border border-[rgba(109,141,255,0.28)] bg-[rgba(255,255,255,0.04)] text-2xl font-semibold">
                    {getFocusTime(focusTimeLeft)}
                  </div>
                  <button
                    className="inline-flex items-center gap-2 rounded-full bg-[rgba(109,141,255,0.2)] px-6 py-2 text-sm font-semibold text-white transition hover:bg-[rgba(109,141,255,0.32)]"
                    onClick={(e) => {
                      e.stopPropagation();
                      startFocusSession();
                    }}
                    type="button"
                  >
                    {isFocusing ? (
                      <>
                        <Pause className="h-4 w-4" /> Pause session
                      </>
                    ) : (
                      <>
                        <Play className="h-4 w-4" /> Start session
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
              <div className="surface-blur rounded-[24px] border border-[rgba(109,141,255,0.16)] p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">Pinned notes</h3>
                    <p className="text-xs text-[rgba(197,208,245,0.7)]">Capture sparks worth keeping.</p>
                  </div>
                  <button
                    onClick={() => navigate('/notes')}
                    className="inline-flex items-center gap-2 rounded-full border border-[rgba(109,141,255,0.28)] px-3 py-1 text-xs font-medium text-white transition hover:border-[rgba(109,141,255,0.5)]"
                  >
                    Browse notes
                  </button>
                </div>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  {pinnedNotes.length === 0 ? (
                    <div className="col-span-full flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-[rgba(109,141,255,0.32)] bg-[rgba(255,255,255,0.03)] px-6 py-8 text-[rgba(197,208,245,0.72)]">
                      <Notebook className="h-6 w-6" />
                      No favourites yet. Pin a note to spotlight it here.
                    </div>
                  ) : (
                    pinnedNotes.map(note => (
                      <button
                        key={note.id}
                        type="button"
                        onClick={() => navigate('/notes')}
                        className="text-left rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.04)] p-4 transition hover:border-[rgba(255,255,255,0.14)]"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-sm font-medium text-white">{note.title || 'Untitled note'}</p>
                            <p className="mt-2 line-clamp-3 text-xs text-[rgba(197,208,245,0.7)]">{note.content}</p>
                          </div>
                          <Pin className="h-4 w-4 text-[rgba(255,209,102,0.8)]" />
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>

              <div className="surface-blur rounded-[24px] border border-[rgba(109,141,255,0.18)] p-5">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Productivity snapshot</h3>
                  <Sparkles className="h-5 w-5 text-[rgba(109,141,255,0.85)]" />
                </div>
                <p className="mt-3 text-sm text-[rgba(197,208,245,0.75)]">
                  A quick view of what’s done, pending, and overdue.
                </p>
                <div className="mt-5 rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.04)] p-4">
                  <ProductivityChart completed={completedTasks} pending={pendingCount} overdue={overdueCount} />
                </div>
                <button
                  onClick={() => navigate('/tasks')}
                  className="mt-4 inline-flex items-center justify-center rounded-full border border-[rgba(109,141,255,0.28)] px-4 py-2 text-sm font-medium text-white transition hover:border-[rgba(109,141,255,0.5)]"
                >
                  Review tasks
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}