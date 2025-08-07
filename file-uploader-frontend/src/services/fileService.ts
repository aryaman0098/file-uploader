import { UserFile } from "../models/File"
import api from "./api"

export const getUserFiles = async (args: {
  take: number,
  skip: number
}): Promise<UserFile[]> => {
  const apiResp = await api.get("/files", {
    params: {
      take: args.take,
      skip: args.skip
    }
  })
  const response = apiResp.data.map((e: any) => {
    return new UserFile({
      id: e.id,
      userId: e.userId,
      description: e.description,
      mimeType: e.mimeType,
      name: e.originalName,
      signedUrl: e.signedUrl,
      downloadUrl: e.downloadUrl,
      size: e.size,
      createdAt: new Date(e.createdAt),
      updatedAt: new Date(e.updatedAt)
    })
  })
  return response
}

export const uploadFiles = async (args: {
  files: File[],
}) => {
  const formData = new FormData()
  args.files.forEach((file) => {
    formData.append('files', file)
  });
  const response = await api.post('/files/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
  return response
}

export const deleteFile = async (args: {
  fileId: string,
}) => {
  const apiResp = await api.delete(`/files/${args.fileId}`)
  return apiResp
}