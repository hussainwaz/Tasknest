import React, { useState, useEffect } from "react";
import { Plus, ChevronDown, ChevronUp, Filter, Search, ListTodo, Calendar, Flag, Star, Check, MoreVertical, X, Tags, Goal, CalendarDaysIcon, CalendarDays, Tag } from "lucide-react";

export default function Tasks() {
    const [tasks, setTasks] = useState([]);
    const [newTaskTitle, setNewTaskTitle] = useState("");
    const [newTaskDueDate, setNewTaskDueDate] = useState(
        new Date().toISOString().split("T")[0]
    );
    const [newTaskPriority, setNewTaskPriority] = useState("");
    const [newTaskCategory, setNewTaskCategory] = useState("Personal");
    const [newTaskDescription, setNewTaskDescription] = useState("");
    const [isAddingTask, setIsAddingTask] = useState(false);
    const [filter, setFilter] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [expandedTask, setExpandedTask] = useState(null);
    // Sample tasks data
    useEffect(() => {
        const sampleTasks = [
           
        ];
        setTasks(sampleTasks);
    }, []);

    const filteredTasks = tasks.filter(task => {
        const matchesFilter =
            filter === "all" ||
            (filter === "completed" && task.completed) ||
            (filter === "active" && !task.completed);

        const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase());

        return matchesFilter && matchesSearch;
    });

    const toggleTaskCompletion = (taskId) => {
        setTasks(tasks.map(task =>
            task.id === taskId ? { ...task, completed: !task.completed } : task
        ));
    };
    const addNewTask = () => {
        if (newTaskTitle.trim()) {
            const newTask = {
                id: 34,
                title: newTaskTitle,
                completed: false,
                priority: newTaskPriority,
                dueDate: newTaskDueDate,
                creationDate: new Date(),
                description: newTaskDescription,
                category: newTaskCategory
            };
            setTasks([...tasks, newTask]);
            setNewTaskTitle("");
            setIsAddingTask(false);
        }
    };
    const deleteTask = (taskId) => {
        setTasks(tasks.filter(task => task.id !== taskId));
    };
    return (
        <div className="relative w-full h-full bg-black text-[#fffbfeff] flex flex-col">
            <div className="bg-[#121212] rounded-2xl flex-1 mx-1 mb-3  overflow-hidden flex flex-col">
                {/* Header */}
                <div className="p-4 border-b border-gray-800 flex justify-between items-center">
                    <h1 className="text-xl font-bold flex items-center gap-2">
                        <ListTodo className="h-5 w-5" />
                        My Tasks
                    </h1>
                    <div className="flex gap-2">
                        <button
                            className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors"
                            onClick={() => setIsAddingTask(!isAddingTask)}
                        >
                            <Plus className="h-5 w-5" />
                        </button>
                    </div>
                </div>
                {/* Controls */}
                <div className="p-4 border-b border-gray-800 flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search tasks..."
                            className="w-full pl-10 pr-4 py-2 bg-gray-800 rounded-lg border border-gray-700 focus:border-blue-500 hover:border-blue-500 focus:outline-none text-sm"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-2">
                        <div className="relative">
                            <select
                                className="appearance-none pl-3 pr-8 py-2 bg-gray-800 rounded-lg border border-gray-700 hover:border-blue-500 focus:border-blue-500 focus:outline-none text-sm"
                                value={filter}
                                onChange={(e) => setFilter(e.target.value)}
                            >
                                <option value="all">All Tasks</option>
                                <option value="active">Active</option>
                                <option value="completed">Completed</option>
                            </select>
                            <Filter className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                        </div>
                    </div>
                </div>

                {/* Add Task Form */}
                {isAddingTask && (
                    <div className="p-4 border-b border-gray-800 flex flex-col gap-3">
                        {/* Title and Description - Stack on mobile, side-by-side on desktop */}
                        <div className="flex flex-col sm:flex-row gap-3">
                            {/* Task Title */}
                            <div className="flex-1 min-w-0">
                                <input
                                    type="text"
                                    placeholder="Task title"
                                    className="w-full px-4 py-2 bg-gray-800 rounded-lg border border-gray-700 focus:border-blue-500 hover:border-blue-500 focus:outline-none text-sm"
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
                                    className="w-full px-4 py-2 bg-gray-800 rounded-lg border border-gray-700 focus:border-blue-500 hover:border-blue-500 focus:outline-none text-sm"
                                    value={newTaskDescription}
                                    onChange={(e) => setNewTaskDescription(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Form Controls - Grid layout for better mobile experience */}
                        <div className="grid grid-cols-2 md:flex gap-3">
                            {/* Due Date */}
                            <div className="relative col-span-1">
                                <input
                                    type="date"
                                    className="w-full px-4 py-2 bg-gray-800 rounded-lg border text-white border-gray-700 focus:border-blue-500 hover:border-blue-500 focus:outline-none text-sm appearance-none"
                                    min={new Date().toISOString().split("T")[0]}
                                    value={newTaskDueDate}
                                    onChange={(e) => setNewTaskDueDate(e.target.value)}
                                />
                                <CalendarDays className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none h-4 w-4" />
                            </div>

                            {/* Priority */}
                            <div className="relative col-span-1">
                                <select
                                    className="w-full appearance-none border bg-gray-800 border-gray-700 focus:border-blue-500 hover:border-blue-500 px-4 pr-8 py-2 rounded-lg text-sm focus:outline-none"
                                    value={newTaskPriority}
                                    onChange={(e) => setNewTaskPriority(e.target.value)}
                                >
                                    <option value="Low">Low</option>
                                    <option value="Medium">Medium</option>
                                    <option value="High">High</option>
                                </select>
                                <Flag className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none h-4 w-4" />
                            </div>

                            {/* Category */}
                            <div className="relative col-span-1">
                                <select
                                    className="w-full appearance-none border bg-gray-800 border-gray-700 focus:border-blue-500 hover:border-blue-500 px-4 pr-8 py-2 rounded-lg text-sm focus:outline-none"
                                    value={newTaskCategory}
                                    onChange={(e) => setNewTaskCategory(e.target.value)}
                                >
                                    <option value="Work">Work</option>
                                    <option value="Personal">Personal</option>
                                    <option value="Health">Health</option>
                                    <option value="Chores">Chores</option>
                                    <option value="Long-Term">Long Term</option>
                                </select>
                                <Tags className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none h-4 w-4" />
                            </div>

                            {/* Add Button - Takes full width on small screens */}
                            <button
                                className="col-span-2 md:w-auto px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors cursor-pointer text-sm md:text-base"
                                onClick={addNewTask}
                            >
                                Add Task
                            </button>
                        </div>
                    </div>
                )}

                {/* Tasks List */}
                <div className="flex-1 overflow-y-auto">
                    {filteredTasks.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center p-8 text-gray-400">
                            <ListTodo className="h-12 w-12 mb-4" />
                            <p className="text-center">
                                {searchQuery ? "No tasks match your search" : "No tasks found"}
                            </p>
                            <button
                                className="mt-4 text-blue-400 hover:underline"
                                onClick={() => setIsAddingTask(true)}
                            >
                                Add your first task
                            </button>
                        </div>
                    ) : (
                        <div>
                            <ul className="divide-y divide-gray-800">
                                {filteredTasks.map(task => (
                                    <li key={task.id} className="group">
                                        <div className="p-4 hover:bg-gray-800/50 transition-colors">
                                            <div className="flex items-start gap-3">
                                                <div className={`border rounded mt-1 w-5 h-5 flex justify-center items-center flex-shrink-0 transition-colors ${task.completed ? "bg-green-700 border-green-700" : "border-gray-500 hover:border-gray-400"}`}
                                                    onClick={() => toggleTaskCompletion(task.id)}
                                                >
                                                    {task.completed && <Check className="w-4 h-4 text-white" />}
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <div className={`flex justify-between items-start ${task.completed ? "opacity-70" : ""}`}
                                                        onClick={() => setExpandedTask(expandedTask == task.id ? null : task.id)}
                                                    >
                                                        <div>
                                                            <p className={`font-medium text-sm ${task.completed ? "line-through" : ""}`}>{task.title}</p>
                                                            <div className="flex mt-1 gap-2 text-xs">
                                                                <span className=" text-gray-400 gap-1 flex items-center">
                                                                    <Calendar className="w-3 h-3" />
                                                                    {new Date(task.dueDate).toLocaleDateString()}
                                                                </span>
                                                                <span className={`gap-1 flex items-center ${task.priority === "High" ? "text-red-500" : ""} ${task.priority === "Medium" ? "text-yellow-500" : ""} ${task.priority === "Low" ? "text-green-500" : ""}`}>
                                                                    <Flag className="w-3 h-3" />
                                                                    <span>{task.priority}</span>
                                                                </span>
                                                                <span className={`text-xs  gap-1 flex items-center text-gray-400`}>
                                                                    <Tag className="w-3 h-3" />
                                                                    <span>{task.category}</span>
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <button className="text-gray-400 hover:text-white ml-2">
                                                            {expandedTask === task.id ? (
                                                                <ChevronUp className="h-5 w-5" />
                                                            ) : (
                                                                <ChevronDown className="h-5 w-5" />
                                                            )}
                                                        </button>
                                                    </div>

                                                    {/* Expanded View */}
                                                    {expandedTask === task.id && (
                                                        <div className="mt-3 pt-3 border-t border-gray-800">
                                                            <p className="text-sm text-gray-300 mb-3">
                                                                {task.description || "No description"}
                                                            </p>
                                                            <div className="flex justify-between items-center">
                                                                <button
                                                                    className="text-xs px-2 py-1 bg-gray-700 rounded hover:bg-gray-600 transition-colors"
                                                                    onClick={() => deleteTask(task.id)}
                                                                >
                                                                    Delete
                                                                </button>
                                                                <span className="text-xs text-gray-400">
                                                                    Created: {new Date(task.creationDate).toLocaleDateString()}
                                                                </span>

                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
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
    )
}