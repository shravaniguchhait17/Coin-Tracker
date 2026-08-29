import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Homepage from './pages/Homepage.jsx';
import Dashboard from './pages/Dashboard.jsx';

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
    </AuthProvider>
  );
}
