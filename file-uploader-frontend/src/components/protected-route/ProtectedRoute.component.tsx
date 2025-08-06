import { Navigate } from 'react-router-dom';
import { 
  ReactNode, 
  useContext 
} from 'react';
import { AuthContext } from '../../context/Auth.context';

interface Props {
  children: ReactNode;
}

const ProtectedRoute = ({ children }: Props) => {
  const auth = useContext(AuthContext)

  if (!auth) return null

  const { user, loading } = auth

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return (
    <>{ children }</>
  );
};

export default ProtectedRoute;