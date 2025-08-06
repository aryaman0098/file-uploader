import { auth, googleProvider } from '../../utils/firebase.utils';
import { signInWithPopup } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { ReactComponent as GoogleLogo } from '../../assets/google.svg'
import { ReactComponent as UploadLogo } from '../../assets/upload.svg'

const Login = () => {
  const navigate = useNavigate();

  const handleGoogleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      navigate('/files');
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white">
      
      <div className="flex items center justify-center gap-6 mb-4">
        <h1 className="text-4xl font-bold mb-4 text-center mb-32">File Uploader</h1>
        <UploadLogo className="h-12 w-12"/>
      </div>
      
      <div className="p-6 bg-gray-800 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-4 text-center">Login</h2>
        <button
          onClick={handleGoogleLogin}
          className="px-6 py-2 bg-green-600 hover:bg-blue-700 rounded text-white font-semibold"
        >
          <div className="flex items-center justify-center gap-2">
            <GoogleLogo className="h-5 w-5" />
            <span>Sign in with Google</span>
          </div>
        </button>
      </div>
    </div>
  );
};

export default Login;