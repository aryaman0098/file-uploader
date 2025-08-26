import { useEffect, useState } from "react"
import Topbar from "./Topbar.components"
import {
  deleteFile,
  getUserFiles,
  shareFiles,
  uploadFiles,
} from "../../services/fileService"
import { useAuth } from "../../hooks/useAuth.hook"
import { UserFile } from "../../models/File"
import { ReactComponent as Preview } from "../../assets/preview.svg"
import { ReactComponent as Download } from "../../assets/download.svg"
import { ReactComponent as Delete } from "../../assets/delete.svg"
import { ReactComponent as Share } from "../../assets/share.svg"
import UploadModal from "./UploadModal.component"
import { HttpStatusCode } from "axios"
import ShareModal from "./ShareModal.component"

const Homepage = () => {
  const { user, loading: authLoading } = useAuth()

  const [loading, setLoading] = useState(true)
  const [filesList, setFilesList] = useState<UserFile[]>([])
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [showShareModal, setShowShareModal] = useState(false)
  const [showLoadMore, setShowLoadMore] = useState(false)
  const [skip, setSkip] = useState(0)
  const [refreshList, setRefreshList] = useState(0)
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null)

  useEffect(() => {
    const fetchUserFiles = async () => {
      if (!user || authLoading) return
      try {
        setLoading(true)
        const response = await getUserFiles({
          take: 10,
          skip: skip,
        })

        if (response.length === 10) {
          setShowLoadMore(true)
        } else {
          setShowLoadMore(false)
        }

        setFilesList(prev => skip === 0 ? response : [...prev, ...response])
      } catch (e) {
        alert("Error occured while fetching files. Please refresh.")
      } finally {
        setLoading(false)
      }
    }

    fetchUserFiles()
  }, [user, authLoading, skip, refreshList])

  const handleUploadFile = async (files: File[]) => {
    try {
      const uploadResponse = await uploadFiles({
        files: files,
      })

      if (uploadResponse.status !== HttpStatusCode.Ok) {
        alert("Error occurred while uploading files. Please try again.")
        return
      }

      setFilesList([])
      setSkip(0)
      setRefreshList(prev => prev + 1)
    } catch (e) {
      alert("Error occurred while uploading files. Please try again.")
    }
  }

  const handleShareFile = async (email: string) => {
    try {
      await shareFiles({
        fileId: selectedFileId!!,
        email: email
      })
    } catch(e) {
      alert("Error occurred while sharing file")
    }
  }

  const handleLoadMore = () => {
    setSkip(prev => prev + 10)
  }

  const handleDownload = async (file: UserFile) => {
    try {
      const response = await fetch(file.downloadUrl)
      const blob = await response.blob()

      const blobUrl = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = blobUrl
      link.download = file.name || "downloaded_file"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      URL.revokeObjectURL(blobUrl)
    } catch (e) {
      alert("Error occurred while downloading files. Please try again.")
    }
  }

  const handleDelete = async (file: UserFile) => {
    try {
      const confirmDelete = window.confirm(
        `Are you sure you want to delete ${file.name}?`
      )
      if (!confirmDelete) return

      const deleteResp = await deleteFile({
        fileId: file.id,
      })

      if (deleteResp.status !== HttpStatusCode.Ok) {
        alert(`Error occurred while deleting file ${file.name}`)
        return
      }

      setFilesList([])
      setSkip(0)
      setRefreshList(prev => prev + 1)
    } catch (e) {
      alert("Error occurred while deleting file. Please try again.")
    }
  }

  return (
    <div>
      <div className="px-4 sm:px-7 py-10 max-w-screen overflow-x-hidden">
        <Topbar onUploadClick={() => setShowUploadModal(true)} />
      </div>

      {showUploadModal && (
        <UploadModal
          onClose={() => setShowUploadModal(false)}
          onUpload={handleUploadFile}
        />
      )}

      {showShareModal && (
        <ShareModal
          onClose={() => setShowShareModal(false)}
          onShare={handleShareFile}
        />
      )}

      {loading ? (
        <div className="flex justify-center mt-10">
          <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
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
                    <th className="p-3">Share</th>
                    <th className="p-3 text-center rounded-tr-lg">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filesList.map(file => (
                    <tr
                      key={file.id}
                      className="border-b border-gray-700 hover:bg-gray-800"
                    >
                      <td className="p-3">{file.name} {file.isShared ? " - [Shared]" : ""}</td>
                      <td className="p-3">
                        {(file.size / 1024).toFixed(2)} KB
                      </td>
                      <td className="p-3">{file.mimeType}</td>
                      <td className="p-3">
                        {new Date(file.createdAt).toLocaleString()}
                      </td>
                      <td>
                        <Share 
                          onClick={() => {
                            setSelectedFileId(file.id)
                            setShowShareModal(true)
                          }} 
                          className="w-8 h-8 transition-transform duration-200 transform hover:scale-125"
                        />
                      </td>
                      <td className="p-3 flex gap-6 justify-center">
                        <a
                          href={file.signedUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Preview className="w-10 h-10 transition-transform duration-200 transform hover:scale-125" />
                        </a>
                        <Download
                          onClick={() => handleDownload(file)}
                          className="w-10 h-10 transition-transform duration-200 transform hover:scale-125"
                        />
                        {
                          !file.isShared &&
                          <Delete
                            onClick={() => handleDelete(file)}
                            className="w-8 h-8 transition-transform duration-200 transform hover:scale-125"
                          />
                        }
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {showLoadMore && (
                <div className="flex justify-center mt-5">
                  <p onClick={handleLoadMore} className="text-white cursor-pointer">
                    Load more
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default Homepage