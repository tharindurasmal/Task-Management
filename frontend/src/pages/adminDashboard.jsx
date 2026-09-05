import { useEffect, useState, useCallback } from 'react';
import api from '../api/axios';

export default function AdminDashboard() {
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [tasksRes, usersRes] = await Promise.all([api.get('/tasks'), api.get('/users')]);
      setTasks(tasksRes.data.tasks);
      setUsers(usersRes.data.users);
    } catch (err) {
      setErrorMsg(err.response?.data?.error || 'Failed to load admin data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const handleReassign = async (taskId, userId) => {
    try {
      const { data } = await api.patch(`/tasks/${taskId}/assign`, { userId });
      setTasks((prev) => prev.map((t) => (t._id === taskId ? data.task : t)));
    } catch (err) {
      setErrorMsg(err.response?.data?.error || 'Could not reassign task');
    }
  };

  if (loading) return <div className="board-loading">Loading admin dashboard…</div>;

  return (
    <div className="admin-page">
      <h1>Admin Dashboard</h1>
      {errorMsg && <div className="board-error">{errorMsg}</div>}

      <section className="admin-section">
        <h2>All Tasks ({tasks.length})</h2>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Status</th>
              <th>Created By</th>
              <th>Assigned To</th>
              <th>Reassign</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((task) => (
              <tr key={task._id}>
                <td>{task.title}</td>
                <td>
                  <span className={`status-pill status-${task.status}`}>{task.status}</span>
                </td>
                <td>{task.createdBy?.name || '—'}</td>
                <td>{task.assignedTo?.name || 'Unassigned'}</td>
                <td>
                  <select
                    value={task.assignedTo?._id || ''}
                    onChange={(e) => handleReassign(task._id, e.target.value)}
                  >
                    <option value="" disabled>
                      Assign to…
                    </option>
                    {users.map((u) => (
                      <option key={u._id} value={u._id}>
                        {u.name}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="admin-section">
        <h2>All Users ({users.length})</h2>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Joined</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u._id}>
                <td>{u.name}</td>
                <td>{u.email}</td>
                <td>
                  <span className={`status-pill ${u.role === 'admin' ? 'status-admin' : ''}`}>{u.role}</span>
                </td>
                <td>{new Date(u.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
