import { 
  ReactNode, 
  createContext, 
  useEffect, 
  useState 
} from 'react';
import { 
  User, 
  onAuthStateChanged, 
  signOut,
  setPersistence,
  browserLocalPersistence
} from 'firebase/auth';
import { auth } from '../utils/firebase.utils';
import { createUser } from '../services/fileService';

interface AuthContextType {
  user: User | null;
  logout: () => Promise<void>;
  loading: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setPersistence(auth, browserLocalPersistence)
      .then(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
          setUser(currentUser);
          setLoading(false);
          if(currentUser) {
            try {
              await createUser();
            } catch (err) {
              console.error("Error creating user in backend:", err);
            }
          }
        });
        return () => unsubscribe();
      })
      .catch((error) => {
        console.error("Failed to set persistence:", error);
        setLoading(false);
      });
  }, []);

  const logout = async () => {
    await signOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};