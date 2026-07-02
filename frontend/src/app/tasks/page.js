'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';

export default function TasksPage() {
  const router = useRouter();
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  // Edit State variables
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');

  // 1. Fetch All Tasks from Backend
  const fetchTasks = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await api.get('/api/tasks');
      setTasks(response.data);
      setLoading(false);
    } catch (err) {
      setError('Tasks load karne mein masla hua.');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  // 2. Create a New Task
  const handleCreateTask = async (e) => {
    e.preventDefault();
    setError('');

    if (!title) {
      setError('Task ka title lazmi hai!');
      return;
    }

    try {
      const response = await api.post('/api/tasks', { title, description });

      setTasks([...tasks, response.data]);
      setTitle('');
      setDescription('');
    } catch (err) {
      setError(err.response?.data?.message || 'Task banane mein koi error aaya.');
    }
  };

  // 3. Toggle Complete Status
  const handleToggleComplete = async (id, currentStatus, currentTitle, currentDesc) => {
    try {
      const response = await api.put(`/api/tasks/${id}`, {
        title: currentTitle,
        description: currentDesc,
        completed: !currentStatus
      });

      setTasks(tasks.map(task => task._id === id ? response.data : task));
    } catch (err) {
      setError('Task update nahi ho saka.');
    }
  };

  // 4. Setup Edit Mode
  const startEdit = (task) => {
    setEditingTaskId(task._id);
    setEditTitle(task.title);
    setEditDescription(task.description || '');
  };

  // 5. Save Updated Task (Title/Description)
  const handleSaveEdit = async (id, currentStatus) => {
    if (!editTitle) {
      setError('Edit karte waqt Title khali nahi ho sakta!');
      return;
    }

    try {
      const response = await api.put(`/api/tasks/${id}`, {
        title: editTitle,
        description: editDescription,
        completed: currentStatus
      });

      setTasks(tasks.map(task => task._id === id ? response.data : task));
      setEditingTaskId(null); // Edit mode band
    } catch (err) {
      setError('Changes save karne mein masla hua.');
    }
  };

  // 6. Delete Task
  const handleDeleteTask = async (id) => {
    if (!window.confirm('Kya aap waqai yeh task delete karna chahte hain?')) return;

    try {
      await api.delete(`/api/tasks/${id}`);

      // Filter out the deleted task from list
      setTasks(tasks.filter(task => task._id !== id));
    } catch (err) {
      setError('Task delete karne mein masla hua. Backend route check karein.');
    }
  };

  // 7. Logout Function
  const handleLogout = () => {
    localStorage.removeItem('token');
    // Cookie delete karne ke liye uski expiry past mein set kar dete hain
    document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <p className="text-xl font-semibold text-gray-600">Loading your tasks...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="mx-auto max-w-4xl">
        {/* Header Section */}
        <div className="flex items-center justify-between border-b pb-4 mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Task Manager Dashboard</h1>
          <button
            onClick={handleLogout}
            className="rounded bg-red-500 px-4 py-2 text-sm font-medium text-white hover:bg-red-600 transition"
          >
            Logout
          </button>
        </div>

        {error && (
          <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded text-center text-sm">
            {error}
          </div>
        )}

        {/* Task Creation Form */}
        <div className="mb-8 rounded-xl bg-white p-6 shadow-md">
          <h2 className="text-xl font-bold text-gray-700 mb-4">Add New Task</h2>
          <form onSubmit={handleCreateTask} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Task Title *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="E.g., Complete Internship Project"
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add task details here..."
                rows="3"
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
              />
            </div>
            <button
              type="submit"
              className="w-full rounded-md bg-blue-600 py-2 font-medium text-white hover:bg-blue-700 transition"
            >
              Add Task
            </button>
          </form>
        </div>

        {/* Tasks List */}
        <div className="rounded-xl bg-white p-6 shadow-md">
          <h2 className="text-xl font-bold text-gray-700 mb-4">Your Tasks ({tasks.length})</h2>
          {tasks.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No tasks found. Add your first task above!</p>
          ) : (
            <div className="space-y-4">
              {tasks.map((task) => (
                <div
                  key={task._id}
                  className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-lg border transition space-y-3 sm:space-y-0 ${
                    task.completed ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  {/* LEFT: Checkbox + Content (Ya Inline Edit Fields) */}
                  <div className="flex items-start space-x-3 flex-1">
                    <input
                      type="checkbox"
                      checked={task.completed || false}
                      onChange={() => handleToggleComplete(task._id, task.completed, task.title, task.description)}
                      className="mt-1.5 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />

                    {editingTaskId === task._id ? (
                      /* Inline Edit Inputs */
                      <div className="flex-1 space-y-2 pr-4">
                        <input
                          type="text"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          className="w-full rounded border border-gray-300 p-1 text-sm text-gray-900 focus:outline-none focus:border-blue-500"
                        />
                        <textarea
                          value={editDescription}
                          onChange={(e) => setEditDescription(e.target.value)}
                          rows="2"
                          className="w-full rounded border border-gray-300 p-1 text-sm text-gray-900 focus:outline-none focus:border-blue-500"
                        />
                      </div>
                    ) : (
                      /* Standard Display */
                      <div>
                        <h3 className={`font-semibold text-lg ${task.completed ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                          {task.title}
                        </h3>
                        {task.description && (
                          <p className={`text-sm mt-1 ${task.completed ? 'line-through text-gray-400' : 'text-gray-600'}`}>
                            {task.description}
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* RIGHT: Action Buttons */}
                  <div className="flex items-center space-x-2 justify-end">
                    {editingTaskId === task._id ? (
                      <>
                        <button
                          onClick={() => handleSaveEdit(task._id, task.completed)}
                          className="rounded bg-green-600 px-3 py-1 text-xs font-medium text-white hover:bg-green-700 transition"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingTaskId(null)}
                          className="rounded bg-gray-400 px-3 py-1 text-xs font-medium text-white hover:bg-gray-500 transition"
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => startEdit(task)}
                          className="rounded bg-amber-500 px-3 py-1 text-xs font-medium text-white hover:bg-amber-600 transition"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteTask(task._id)}
                          className="rounded bg-red-600 px-3 py-1 text-xs font-medium text-white hover:bg-red-700 transition"
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}