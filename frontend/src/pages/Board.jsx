import { useEffect, useState, useCallback } from 'react';
import { DragDropContext, Droppable } from '@hello-pangea/dnd';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import TaskCard from '../components/TaskCard';

const COLUMNS = [
  { key: 'todo', label: 'To Do' },
  { key: 'doing', label: 'Doing' },
  { key: 'done', label: 'Done' },
];

export default function Board() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [creating, setCreating] = useState(false);

  const fetchTasks = useCallback(async () => {
    try {
      const { data } = await api.get('/tasks');
      setTasks(data.tasks);
    } catch (err) {
      setErrorMsg(err.response?.data?.error || 'Failed to load tasks');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    setCreating(true);
    setErrorMsg('');
    try {
      const { data } = await api.post('/tasks', { title, description });
      setTasks((prev) => [data.task, ...prev]);
      setTitle('');
      setDescription('');
    } catch (err) {
      setErrorMsg(err.response?.data?.error || 'Failed to create task');
    } finally {
      setCreating(false);
    }
  };

  const handleClaim = async (taskId) => {
    try {
      const { data } = await api.patch(`/tasks/${taskId}/assign`, { userId: user.id });
      setTasks((prev) => prev.map((t) => (t._id === taskId ? data.task : t)));
    } catch (err) {
      setErrorMsg(err.response?.data?.error || 'Could not claim this task');
    }
  };

  const handleDragEnd = async (result) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const newStatus = destination.droppableId;

    // Optimistic update so the UI feels instant, then confirm with the server.
    setTasks((prev) => prev.map((t) => (t._id === draggableId ? { ...t, status: newStatus } : t)));

    try {
      await api.patch(`/tasks/${draggableId}/status`, { status: newStatus });
    } catch (err) {
      setErrorMsg(err.response?.data?.error || 'Could not update task status');
      fetchTasks(); // revert to server truth on failure
    }
  };

  if (loading) return <div className="board-loading">Loading tasks…</div>;

  return (
    <div className="board-page">
      <form className="create-task-form" onSubmit={handleCreate}>
        <input
          type="text"
          placeholder="New task title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <button type="submit" className="btn-primary" disabled={creating}>
          {creating ? 'Adding…' : 'Add task'}
        </button>
      </form>

      {errorMsg && <div className="board-error">{errorMsg}</div>}

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="board-columns">
          {COLUMNS.map((col) => {
            const columnTasks = tasks.filter((t) => t.status === col.key);
            return (
              <Droppable droppableId={col.key} key={col.key}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`board-column ${snapshot.isDraggingOver ? 'board-column-over' : ''}`}
                  >
                    <div className="board-column-header">
                      <h2>{col.label}</h2>
                      <span className="board-column-count">{columnTasks.length}</span>
                    </div>
                    {columnTasks.map((task, index) => (
                      <TaskCard
                        key={task._id}
                        task={task}
                        index={index}
                        currentUserId={user.id}
                        onClaim={handleClaim}
                      />
                    ))}
                    {provided.placeholder}
                    {columnTasks.length === 0 && <p className="board-column-empty">No tasks here</p>}
                  </div>
                )}
              </Droppable>
            );
          })}
        </div>
      </DragDropContext>
    </div>
  );
}
