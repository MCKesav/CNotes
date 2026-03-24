import { useStore } from './store/useStore';
import AuthPage from './components/Auth/AuthPage';
import Dashboard from './components/Dashboard/Dashboard';

export default function App() {
  const isAuthenticated = useStore(state => state.isAuthenticated);

  return isAuthenticated ? <Dashboard /> : <AuthPage />;
}
