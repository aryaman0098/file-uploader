import { useEffect, useState } from "react"
import Topbar from "./Topbar.components"
import { getUserFiles, uploadFiles } from "../../services/fileService"
import { auth } from "../../utils/firebase.utils"
import { useAuth } from "../../hooks/useAuth.hook"
import { UserFile } from "../../models/File"
import { ReactComponent as Preview } from "../../assets/preview.svg"
import { ReactComponent as Download } from "../../assets/download.svg"
import UploadModal from "./UploadModal.component"


const Homepage = () => {

  const { user, loading: authLoading } = useAuth();

  const [loading, setLoading] = useState(true)

  const [filesList, setFilesList] =useState([])

  const [showUploadModal, setShowUploadModal] = useState(false);

  const handleUploadFile = async (files: File[]) => {
    try {
      await uploadFiles({
        files: files,
        userId: user?.uid
      })
      const response = await getUserFiles({
        userId: auth.currentUser?.uid,
        take: 10,
        skip: 0
      })
      setFilesList(response);
    } catch (e) {
      console.error(`Error ${JSON.stringify(e)} occurred while uploading files`);
    }
  };

  
  useEffect(() => {
    const fetchUserFiles = async () => {
      if (!user || authLoading) return
      try {
        const response = await getUserFiles({
          userId: auth.currentUser?.uid,
          take: 10,
          skip: 0
        })
        setFilesList(response);
        setLoading(false)
      } catch(e) {
        console.error(`Error ${JSON.stringify(e)} occurred while fetching user files list`)
        setLoading(false)
      }
    }

    fetchUserFiles()
  }, [user, authLoading])


  const handleDownload = async (file: UserFile) => {
    try {
      const response = await fetch(file.downloadUrl);
      const blob = await response.blob();

      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = file.name || 'downloaded_file';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error("Download failed:", err);
    }
  };

  return (
    <div>
      <div className="px-4 sm:px-7 py-10 max-w-screen overflow-x-hidden">  
        <Topbar onUploadClick={() => setShowUploadModal(true)}/>
      </div>

    {showUploadModal && (
      <UploadModal
        onClose={() => setShowUploadModal(false)}
        onUpload={handleUploadFile}
      />
    )}

      {loading ? (
        <div className="flex justify-center mt-10">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500"></div>
        </div>
      ) : (
        <div className="p-4">
          {filesList.length === 0 ? (
            <p className="text-white text-center mt-8">No files found.</p>
          ) : (
            <div className="p-4 overflow-x-auto">
              <table className="w-full text-white border-collapse">
                <thead>
                  <tr className="bg-gray-800 text-left">
                    <th className="p-3 rounded-tl-lg">File Name</th>
                    <th className="p-3">Size</th>
                    <th className="p-3">Type</th>
                    <th className="p-3">Uploaded on</th>
                    <th className="p-3 text-center rounded-tr-lg">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filesList.map((file: UserFile) => (
                    <tr key={file.id} className="border-b border-gray-700 hover:bg-gray-800">
                      <td className="p-3">{file.name}</td>
                      <td className="p-3">{(file.size / 1024).toFixed(2)} KB</td>
                      <td className="p-3">{file.mimeType}</td>
                      <td className="p-3">{new Date(file.createdAt).toLocaleString()}</td>
                      <td className="p-3 flex gap-6 justify-center">
                        <a
                          href={file.signedUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Preview className="w-10 h-10 transition-transform duration-200 transform hover:scale-125"/>
                        </a>
                        <Download onClick={() => handleDownload(file)} className="w-10 h-10 transition-transform duration-200 transform hover:scale-125"/> 
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default Homepage