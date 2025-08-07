import { useState } from 'react';
import { ReactComponent as Logo } from '../../assets/upload.svg';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.hook';

interface TopbarProps {
  onUploadClick: () => void;
}


export const Topbar = ({ onUploadClick }: TopbarProps) => {
  const { user, logout } = useAuth()

  const [dropdownOpen, setDropdownOpen] = useState(false)

  const navigate = useNavigate()

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  }

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <nav className="w-full flex items-center justify-between px-6 py-3 text-white shadow">
      <div className="flex items-center gap-2">
        <span className="text-2xl font-semibold">File Uploader</span>
      </div>

      <div className="ml-auto flex items-center gap-4">
        <Logo
          onClick={onUploadClick}
          className="h-10 w-10 text-green-500 cursor-pointer transition-transform duration-200 transform hover:scale-125 mt-2"
        />

        <div className='relative'>
          {user?.photoURL ? (
            <img
              src={user.photoURL || "../../assets/default-avatar.png"}
              alt="User"
              className="w-10 h-10 rounded-full border-2 border-white"
              onClick={toggleDropdown}
            />
          ) : (
            <div 
              className="w-12 h-12 rounded-full bg-gray-600" 
              onClick={toggleDropdown}
            />
          )}
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-32 bg-gray-800 text-white rounded-md shadow-lg z-10 hover:bg-gray-600">
              <button
                onClick={handleLogout}
                className="block w-full text-left px-4 py-2"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Topbar
