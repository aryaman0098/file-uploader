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

  @Column({ nullable: true })
  description: string

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date

  signedUrl: string

  downloadUrl: string

  constructor(instance: Partial<FileMetaInfo>) {
    Object.assign(this, instance)
  }
}