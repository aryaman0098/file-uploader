import { useState, ChangeEvent } from 'react';

interface UploadModalProps {
  onClose: () => void;
  onUpload: (file: File[]) => Promise<void>;
}

const UploadModal: React.FC<UploadModalProps> = ({ onClose, onUpload }) => {
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedFiles(Array.from(e.target.files));
    }
  };

  const handleUploadClick = async () => {
    if (!selectedFiles) return;
    if(selectedFiles.length > 10) {
      alert(`Atmost 10 files are allowed to upload at a time`)
      return
    }
    setIsUploading(true);
    try {
      await onUpload(selectedFiles);
      setIsUploading(false)
      onClose();
    } catch (error) {
      console.error('Upload failed:', error);
      setIsUploading(false)
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-900 text-white p-6 rounded-lg shadow-lg w-80">
        <h2 className="text-xl font-semibold mb-4">Upload Files</h2>
        <label htmlFor="file-upload" className="cursor-pointer bg-white text-black px-4 py-2 rounded shadow">
          Choose Files
        </label>
        <input
          id="file-upload"
          type="file"
          multiple
          accept=".pdf,.doc,.docx,.jpg,.jpeg"
          onChange={handleFileChange}
          className="hidden"
        />
        <div className="text-white mt-2 max-w-xs mb-4 mt-4">
          {selectedFiles.length > 0 && (
            <div className="bg-gray-700 p-2 rounded text-sm">
              {selectedFiles.map((file, index) => (
                <div
                  key={index}
                  className="truncate overflow-hidden whitespace-nowrap"
                  title={file.name}
                >
                  {file.name}
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-700 rounded hover:bg-gray-600"
          >
            Cancel
          </button>
          <button
            onClick={handleUploadClick}
            disabled={selectedFiles.length === 0 || isUploading}
            className="px-4 py-2 bg-green-600 rounded hover:bg-green-500 disabled:opacity-50"
          >
            {isUploading ? 'Uploading...' : 'Upload'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UploadModal;