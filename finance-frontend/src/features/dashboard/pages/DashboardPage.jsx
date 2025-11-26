import { useNavigate } from 'react-router-dom';
import { useAuth } from '@contexts/AuthContext';
import { Dashboard } from '../components/Dashboard';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return <Dashboard onLogout={handleLogout} />;
}
