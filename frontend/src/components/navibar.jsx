import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/authContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="navbar">
      <Link to="/board" className="navbar-brand">
        LessTaxi Tasks
      </Link>
      {user && (
        <nav className="navbar-links">
          <Link to="/board">Board</Link>
          {user.role === 'admin' && <Link to="/admin">Admin</Link>}
          <span className="navbar-user">
            {user.name} <span className="navbar-role">{user.role}</span>
          </span>
          <button onClick={handleLogout} className="btn-ghost">
            Log out
          </button>
        </nav>
      )}
    </header>
  );
}
