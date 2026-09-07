import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getInitials, getAvatarColor } from '../utils/avatar';

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) return null;

  const isBoard = location.pathname === '/board';
  const isAdmin = location.pathname === '/admin';

  return (
    <>
      <header className="topbar">
        <span className="topbar-brand">LessTaxi Tasks</span>
        <nav className="topbar-nav">
          <Link to="/board" className={`topbar-link ${isBoard ? 'topbar-link-active' : ''}`}>
            Board
          </Link>
          {user.role === 'admin' && (
            <Link to="/admin" className={`topbar-link ${isAdmin ? 'topbar-link-active' : ''}`}>
              Admin
            </Link>
          )}
        </nav>
        <div className="topbar-spacer" />
      </header>

      <div className="subbar">
        <div className="subbar-left">
          <h1>{isAdmin ? 'Admin Dashboard' : 'Task Board'}</h1>
          <span className="role-pill">{user.role}</span>
        </div>
        <div className="subbar-right">
          <div className="avatar-circle" style={{ background: getAvatarColor(user.name) }}>
            {getInitials(user.name)}
          </div>
          <span className="subbar-name">{user.name}</span>
          <button onClick={handleLogout} className="btn-ghost">
            Log out
          </button>
        </div>
      </div>
    </>
  );
}
