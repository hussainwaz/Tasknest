import React, { useState, useEffect } from "react";
import { Plus, ChevronDown, ChevronUp, Filter, Search, ListTodo, Calendar, Flag, Star, Check, MoreVertical, X, Tags, Goal, CalendarDaysIcon, CalendarDays, Tag } from "lucide-react";
import { useData } from '../DataContext';

export default function Tasks() {
    const { tasks, setTasks, userId, isGuest, normaliseTask } = useData();
    const API = import.meta.env.VITE_API_URL;

    // Local UI state
    const [newTaskTitle, setNewTaskTitle] = useState("");
    const [newTaskDueDate, setNewTaskDueDate] = useState(
        new Date().toISOString().split("T")[0]
    );
    const [newTaskPriority, setNewTaskPriority] = useState("Medium");
    const [newTaskCategory, setNewTaskCategory] = useState("Personal");
    const [newTaskDescription, setNewTaskDescription] = useState("");
    const [isAddingTask, setIsAddingTask] = useState(false);
    const [filter, setFilter] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [expandedTask, setExpandedTask] = useState(null);

    // Fetch tasks when userId changes (on login)
    useEffect(() => {
        const fetchTasks = async () => {
            if (!userId || isGuest) {
                return;
            }

            try {
                const res = await fetch(`${API}/tasks/${userId}`);
                const data = await res.json();
                const mappedTasks = Array.isArray(data)
                    ? data.map(normaliseTask).filter(Boolean)
                    : [];
                setTasks(mappedTasks);
            } catch (err) {
                console.error("Error fetching tasks:", err);
            }
        };

        fetchTasks();
    }, [userId, API, setTasks, normaliseTask, isGuest]);

    // Listen for logout events to clear tasks
    useEffect(() => {
        const handleLogout = () => {
            setTasks([]); // Clear tasks on logout
        };

        window.addEventListener("userLoggedOut", handleLogout);
        return () => {
            window.removeEventListener("userLoggedOut", handleLogout);
        };
    }, [setTasks]);

    const filteredTasks = tasks.filter(task => {
        const matchesFilter =
            filter === "all" ||
            (filter === "completed" && task.completed) ||
            (filter === "active" && !task.completed);

        const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase());

        return matchesFilter && matchesSearch;
    });

    const toggleTaskCompletion = async (taskId) => {
        const updatedTasks = tasks.map(task =>
            task.id === taskId ? { ...task, completed: !task.completed } : task
        );

        if (isGuest) {
            setTasks(updatedTasks);
        } else {
            try {
                const taskToUpdate = updatedTasks.find(task => task.id === taskId);
                const res = await fetch(`${API}/tasks/${taskId}`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ completed: taskToUpdate.completed }),
                });
                if (res.ok) {
                    const payload = await res.json();
                    if (payload?.task) {
                        setTasks(tasks.map(task => task.id === taskId ? normaliseTask(payload.task) : task));
                    } else {
                        setTasks(updatedTasks);
                    }
                }
            } catch (err) {
                console.error("Error updating task:", err);
            }
        }
    };

    const addNewTask = async () => {
        if (!newTaskTitle.trim()) return;

        const tempTask = normaliseTask({
            id: Date.now(),
            title: newTaskTitle,
            completed: false,
            priority: newTaskPriority || 'Medium',
            dueDate: newTaskDueDate,
            creationDate: new Date().toISOString(),
            description: newTaskDescription,
            category: newTaskCategory,
            isPinned: false,
        });

        if (isGuest) {
            setTasks([...tasks, tempTask]);
        } else {
            try {
                const res = await fetch(`${API}/tasks`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        title: tempTask.title,
                        description: tempTask.description,
                        creationDate: tempTask.creationDate,
                        dueDate: tempTask.dueDate,
                        completed: tempTask.completed,
                        priority: tempTask.priority,
                        category: tempTask.category,
                        isPinned: tempTask.isPinned,
                        user_id: userId,
                    }),
                });
                const data = await res.json();
                if (data.success && data.task) {
                    setTasks([...tasks, normaliseTask(data.task)]);
                }
            } catch (err) {
                console.error("Error creating task:", err);
            }
        }

        setNewTaskTitle("");
        setNewTaskDescription("");
        setNewTaskPriority("Medium");
        setNewTaskDueDate(new Date().toISOString().split("T")[0]);
        setNewTaskCategory("Personal");
        setIsAddingTask(false);
    };

    const deleteTask = async (taskId) => {
        if (isGuest) {
            setTasks(tasks.filter(task => task.id !== taskId));
        } else {
            try {
                const res = await fetch(`${API}/tasks/${taskId}`, {
                    method: "DELETE",
                });
                if (res.ok) {
                    setTasks(tasks.filter(task => task.id !== taskId));
                }
            } catch (err) {
                console.error("Error deleting task:", err);
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
                    {/* Header */}
                    <div className="flex items-center justify-between gap-4 border-b border-[rgba(255,255,255,0.06)] px-4 py-4">
                        <div className="flex items-center gap-3">
                            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[rgba(109,141,255,0.14)]">
                                <ListTodo className="h-5 w-5 text-white" />
                            </span>
                            <div>
                                <h1 className="text-xl font-semibold">Tasks</h1>
                                <p className="mt-1 text-xs text-[rgba(197,208,245,0.68)]">Capture, prioritise, and close the loop.</p>
                            </div>
                        </div>

                        <button
                            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[rgba(109,141,255,0.85)] to-[rgba(87,214,255,0.85)] px-4 py-2 text-xs font-semibold uppercase tracking-wide text-[rgba(4,7,13,0.85)] transition hover:opacity-95"
                            onClick={() => setIsAddingTask(!isAddingTask)}
                        >
                            <Plus className="h-4 w-4" />
                            {isAddingTask ? "Close" : "New"}
                        </button>
                    </div>

                    {/* Controls */}
                    <div className="flex flex-col gap-3 border-b border-[rgba(255,255,255,0.06)] px-4 py-4 sm:flex-row sm:items-center">
                        <div className="relative flex-1">
                            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[rgba(197,208,245,0.65)]" />
                            <input
                                type="text"
                                placeholder="Search tasks..."
                                className="w-full rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)] py-2 pl-11 pr-4 text-sm text-white placeholder:text-[rgba(197,208,245,0.5)] focus:outline-none focus:ring-2 focus:ring-[rgba(109,141,255,0.35)]"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>

                        <div className="relative">
                            <select
                                className="appearance-none rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)] py-2 pl-4 pr-10 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[rgba(109,141,255,0.35)]"
                                value={filter}
                                onChange={(e) => setFilter(e.target.value)}
                            >
                                <option value="all">All</option>
                                <option value="active">Active</option>
                                <option value="completed">Completed</option>
                            </select>
                            <Filter className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[rgba(197,208,245,0.65)]" />
                        </div>
                    </div>

                    {/* Add Task Form */}
                    {isAddingTask && (
                        <div className="border-b border-[rgba(255,255,255,0.06)] px-4 py-4">
                            {/* Title and Description - Stack on mobile, side-by-side on desktop */}
                            <div className="flex flex-col sm:flex-row gap-3">
                                {/* Task Title */}
                                <div className="flex-1 min-w-0">
                                    <input
                                        type="text"
                                        placeholder="Task title"
                                        className="w-full rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)] px-4 py-2 text-sm text-white placeholder:text-[rgba(197,208,245,0.5)] focus:outline-none focus:ring-2 focus:ring-[rgba(109,141,255,0.35)]"
                                        value={newTaskTitle}
                                        onChange={(e) => setNewTaskTitle(e.target.value)}
                                        autoFocus
                                    />
                                </div>

                                {/* Task Description */}
                                <div className="flex-1 min-w-0">
                                    <input
                                        type="text"
                                        placeholder="Description (optional)"
                                        className="w-full rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)] px-4 py-2 text-sm text-white placeholder:text-[rgba(197,208,245,0.5)] focus:outline-none focus:ring-2 focus:ring-[rgba(109,141,255,0.35)]"
                                        value={newTaskDescription}
                                        onChange={(e) => setNewTaskDescription(e.target.value)}
                                    />
                                </div>
                            </div>

                            {/* Form Controls - Grid layout for better mobile experience */}
                            <div className="grid grid-cols-2 md:flex gap-3 my-2">
                                {/* Due Date */}
                                <div className="relative col-span-1">
                                    <input
                                        type="date"
                                        className="w-full appearance-none rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)] px-4 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[rgba(109,141,255,0.35)]"
                                        min={new Date().toISOString().split("T")[0]}
                                        value={newTaskDueDate}
                                        onChange={(e) => setNewTaskDueDate(e.target.value)}
                                    />
                                    <CalendarDays className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[rgba(197,208,245,0.65)]" />
                                </div>

                                {/* Priority */}
                                <div className="relative col-span-1">
                                    <select
                                        className="w-full appearance-none rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)] px-4 py-2 pr-10 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[rgba(109,141,255,0.35)]"
                                        value={newTaskPriority}
                                        onChange={(e) => setNewTaskPriority(e.target.value)}
                                    >
                                        <option value="Low">Low</option>
                                        <option value="Medium">Medium</option>
                                        <option value="High">High</option>
                                    </select>
                                    <Flag className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[rgba(197,208,245,0.65)]" />
                                </div>

                                {/* Category */}
                                <div className="relative col-span-1">
                                    <select
                                        className="w-full appearance-none rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)] px-4 py-2 pr-10 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[rgba(109,141,255,0.35)]"
                                        value={newTaskCategory}
                                        onChange={(e) => setNewTaskCategory(e.target.value)}
                                    >
                                        <option value="Work">Work</option>
                                        <option value="Personal">Personal</option>
                                        <option value="Health">Health</option>
                                        <option value="Chores">Chores</option>
                                        <option value="Long-Term">Long Term</option>
                                    </select>
                                    <Tags className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[rgba(197,208,245,0.65)]" />
                                </div>

                                {/* Add Button - Takes full width on small screens */}
                                <button
                                    className="col-span-2 inline-flex items-center justify-center rounded-full bg-[rgba(109,141,255,0.2)] px-5 py-2 text-sm font-semibold text-white transition hover:bg-[rgba(109,141,255,0.32)] md:w-auto"
                                    onClick={addNewTask}
                                >
                                    Add Task
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Tasks List */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar px-4 py-4">
                        {filteredTasks.length === 0 ? (
                            <div className="flex min-h-[40vh] flex-col items-center justify-center rounded-2xl border border-dashed border-[rgba(255,255,255,0.12)] bg-[rgba(255,255,255,0.03)] p-10 text-[rgba(197,208,245,0.7)]">
                                <ListTodo className="h-12 w-12 mb-4" />
                                <p className="text-center">
                                    {searchQuery ? "No tasks match your search" : "No tasks found"}
                                </p>
                                <button
                                    className="mt-4 rounded-full border border-[rgba(109,141,255,0.3)] px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white transition hover:border-[rgba(109,141,255,0.55)]"
                                    onClick={() => setIsAddingTask(true)}
                                >
                                    Add your first task
                                </button>
                            </div>
                        ) : (
                            <div className="animate-fade-in">
                                <ul className="flex flex-col gap-3">
                                    {filteredTasks.map(task => (
                                        <li key={task.id} className="group rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.04)] px-4 py-4 transition hover:border-[rgba(255,255,255,0.14)]">
                                            <div className="flex items-start gap-3">
                                                <button
                                                    type="button"
                                                    aria-label={task.completed ? "Mark as incomplete" : "Mark as complete"}
                                                    className={`mt-1 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-md border transition ${task.completed
                                                        ? "border-[rgba(125,216,125,0.75)] bg-[rgba(125,216,125,0.25)]"
                                                        : "border-[rgba(197,208,245,0.35)] bg-[rgba(8,10,18,0.35)] hover:border-[rgba(109,141,255,0.55)]"
                                                        }`}
                                                    onClick={() => toggleTaskCompletion(task.id)}
                                                >
                                                    {task.completed && <Check className="h-4 w-4 text-[rgba(248,250,255,0.9)]" />}
                                                </button>
                                                <div className="min-w-0 flex-1">
                                                    <button
                                                        type="button"
                                                        className={`flex w-full items-start justify-between gap-3 text-left ${task.completed ? "opacity-70" : ""}`}
                                                        onClick={() => setExpandedTask(expandedTask == task.id ? null : task.id)}
                                                    >
                                                        <div>
                                                            <p className={`text-sm font-medium ${task.completed ? "line-through text-[rgba(197,208,245,0.65)]" : "text-white"}`}>{task.title}</p>
                                                            <div className="mt-2 flex flex-wrap gap-2 text-xs">
                                                                <span className="flex items-center gap-1 text-[rgba(197,208,245,0.7)]">
                                                                    <Calendar className="w-3 h-3" />
                                                                    {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "No due date"}
                                                                </span>
                                                                <span className={`flex items-center gap-1 ${task.priority === "High" ? "text-[rgba(255,107,107,0.92)]" : ""} ${task.priority === "Medium" ? "text-[rgba(255,209,102,0.92)]" : ""} ${task.priority === "Low" ? "text-[rgba(125,216,125,0.92)]" : ""}`}>
                                                                    <Flag className="w-3 h-3" />
                                                                    <span>{task.priority}</span>
                                                                </span>
                                                                <span className="flex items-center gap-1 text-[rgba(197,208,245,0.7)]">
                                                                    <Tag className="w-3 h-3" />
                                                                    <span>{task.category}</span>
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <span className="mt-0.5 text-[rgba(197,208,245,0.7)] group-hover:text-white">
                                                            {expandedTask === task.id ? (
                                                                <ChevronUp className="h-5 w-5" />
                                                            ) : (
                                                                <ChevronDown className="h-5 w-5" />
                                                            )}
                                                        </span>
                                                    </button>

                                                    {/* Expanded View */}
                                                    {expandedTask === task.id && (
                                                        <div className="mt-4 border-t border-[rgba(255,255,255,0.06)] pt-4">
                                                            <p className="mb-3 text-sm text-[rgba(197,208,245,0.78)]">
                                                                {task.description || "No description"}
                                                            </p>
                                                            <div className="flex justify-between items-center">
                                                                <button
                                                                    className="rounded-full border border-[rgba(255,107,107,0.35)] bg-[rgba(255,107,107,0.12)] px-3 py-1 text-xs font-semibold text-[rgba(255,107,107,0.9)] transition hover:bg-[rgba(255,107,107,0.18)]"
                                                                    onClick={() => deleteTask(task.id)}
                                                                >
                                                                    Delete
                                                                </button>
                                                                <span className="text-xs text-[rgba(197,208,245,0.62)]">
                                                                    Created: {task.creationDate ? new Date(task.creationDate).toLocaleDateString() : "Unknown"}
                                                                </span>

                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </section>
    )
}