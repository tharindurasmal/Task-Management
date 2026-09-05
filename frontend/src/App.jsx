import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/authContext';
import ProtectedRoute from './components/protectedRoute';
import AdminRoute from './components/adminRoute';
import Login from './pages/login';
import Register from './pages/register';
import './index.css';

function AppRoutes() {
  const { user } = useAuth();

  return (
    <BrowserRouter>
      <Navbar />
      <main className="app-main">
        <Routes>
          <Route path="/login" element={user ? <Navigate to="/board" replace /> : <Login />} />
          <Route path="/register" element={user ? <Navigate to="/board" replace /> : <Register />} />
          <Route
            path="/board"
            element={
              <ProtectedRoute>
                <Board />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            }
          />
          <Route path="*" element={<Navigate to={user ? '/board' : '/login'} replace />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}
