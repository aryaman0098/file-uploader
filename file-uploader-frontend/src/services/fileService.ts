import { UserFile } from "../models/File"
import api from "./api"

const delay = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

export const getUserFiles = async (args: {
  userId?: string,
  take: number,
  skip: number
}) => {
  const apiResp = await api.get("/files", {
    params: {
      "user-id": args.userId,
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
  userId?: string
}) => {
  const formData = new FormData()
  args.files.forEach((file) => {
    formData.append('files', file)
  });
  formData.append('meta-data', JSON.stringify({userId: args.userId}));
  const response = await api.post('/files/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })

  delay(3000)
}