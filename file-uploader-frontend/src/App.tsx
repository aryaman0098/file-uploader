import { 
  BrowserRouter as Router, 
  Routes,
  Route, 
  Navigate
} from 'react-router-dom';
import Login from './components/login/Login.component';
import Homepage from './components/files/Homepage.component';
import { AuthProvider } from './context/Auth.context';
import ProtectedRoute from './components/protected-route/ProtectedRoute.component';
import { useAuth } from './hooks/useAuth.hook';

const RootRedirect = () => {
  const { user, loading } = useAuth()
  if (loading) return null
  return <Navigate to={user ? "/files" : "/login"} replace />
};

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={ <RootRedirect /> }/>
          <Route path="/login" element={<Login />} />
          <Route
            path="/files"
            element={
              <ProtectedRoute>
                <Homepage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App