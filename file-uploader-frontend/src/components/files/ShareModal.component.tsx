import { 
  useState, 
  ChangeEvent 
} from "react";

interface ShareModalProps {
  onClose: () => void;
  onShare: (email: string) => Promise<void>;
}

const ShareModal:React.FC<ShareModalProps> = ({onClose, onShare}) => {
  const [email, setEmail] = useState("");

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  const handleShare = async () => {
    if(email == "") {
      alert("Email cannot be empty")
      return
    } else if(!email.includes('@') || !email.includes('.')) {
      alert("Invalid email")
      return
    }
    await onShare(email)
    onClose()
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-900 text-white p-6 rounded-lg shadow-lg w-80">
        <h2 className="text-xl font-semibold mb-4">Share with</h2>

        <input
          type="text"
          placeholder="Enter email"
          value={email}
          onChange={handleChange}
          className="w-full p-2 rounded bg-gray-800 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
        />

        <div className="flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-700 rounded hover:bg-gray-600"
          >
            Cancel
          </button>
          <button
            onClick={handleShare}
            className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-500"
          >
            Share
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShareModal;