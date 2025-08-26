import { 
  Column, 
  CreateDateColumn, 
  Entity, 
  PrimaryGeneratedColumn, 
  UpdateDateColumn
} from "typeorm";

@Entity({ name: "FileMetaInfo" })
export class FileMetaInfo {

  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column()
  userId: string

  @Column()
  mimeType: string

  @Column()
  originalName: string

  @Column()
  size: number

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date

  @Column({ type: Boolean, nullable: true })
  softDeleted: Boolean

  signedUrl: string

  downloadUrl: string

  isShared: Boolean

  constructor(instance: Partial<FileMetaInfo>) {
    Object.assign(this, instance)
  }
}