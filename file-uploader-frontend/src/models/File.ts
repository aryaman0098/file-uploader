export class UserFile {
  id!: string
  userId!: string
  mimeType!: string
  name!: string
  size!: number
  description?: string
  createdAt!: Date
  updatedAt!: Date
  signedUrl!: string
  downloadUrl!: string

  constructor(instance: Partial<UserFile>) {
    Object.assign(this, instance)
  }
}