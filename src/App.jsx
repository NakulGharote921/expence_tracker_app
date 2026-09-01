import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { AuthProvider } from './lib/appwrite/AuthProvider';
import AuthPage from './pages/auth/index';
import AuthSuccess from './pages/auth/success';
import AuthFailure from './pages/auth/failure';
import Dashboard from './pages/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';

const router = createBrowserRouter([
    { path: '/auth', element: <AuthPage /> },
    { path: '/auth/success', element: <AuthSuccess /> },
    { path: '/auth/failure', element: <AuthFailure /> },
    {
        path: '/dashboard',
        element: (
            <ProtectedRoute>
                <Dashboard />
            </ProtectedRoute>
        ),
    },
    { path: '*', element: <AuthPage /> },
]);

export default function App() {
    return (
        <AuthProvider>
            <RouterProvider router={router} />
        </AuthProvider>
    );
}
