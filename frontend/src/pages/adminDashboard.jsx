import { useEffect, useState, useCallback } from 'react';
import api from '../api/axios';

export default function AdminDashboard() {
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [approvingId, setApprovingId] = useState(null);

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

  const handleApprove = async (userId) => {
    setApprovingId(userId);
    try {
      const { data } = await api.patch(`/users/${userId}/approve`);
      setUsers((prev) => prev.map((u) => (u._id === userId ? data.user : u)));
    } catch (err) {
      setErrorMsg(err.response?.data?.error || 'Could not approve user');
    } finally {
      setApprovingId(null);
    }
  };

  if (loading) return <div className="board-loading">Loading admin dashboard…</div>;

  const pendingUsers = users.filter((u) => u.role === 'user' && !u.isApproved);
  const approvedUsers = users.filter((u) => u.role === 'admin' || u.isApproved);

  return (
    <div className="admin-page">
      <h1>Admin Dashboard</h1>
      {errorMsg && <div className="board-error">{errorMsg}</div>}

      {pendingUsers.length > 0 && (
        <section className="admin-section">
          <h2>Pending Approvals ({pendingUsers.length})</h2>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Registered</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {pendingUsers.map((u) => (
                <tr key={u._id}>
                  <td>{u.name}</td>
                  <td>{u.email}</td>
                  <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td>
                    <button
                      className="btn-claim"
                      disabled={approvingId === u._id}
                      onClick={() => handleApprove(u._id)}
                    >
                      {approvingId === u._id ? 'Approving…' : 'Approve'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

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
                    {/* Only approved users can be assigned tasks */}
                    {approvedUsers.map((u) => (
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
              <th>Status</th>
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
                <td>
                  <span className={`status-pill ${u.role === 'admin' || u.isApproved ? 'status-done' : 'status-doing'}`}>
                    {u.role === 'admin' || u.isApproved ? 'Approved' : 'Pending'}
                  </span>
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
