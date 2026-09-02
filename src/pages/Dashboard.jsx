import { useAuth } from '../context/AuthContext';
import DashboardPage from '../components/DashboardPage';

export default function Dashboard() {
    const { user } = useAuth();
    return <DashboardPage userId={user?.id} />;
}