import { 
  Column, 
  CreateDateColumn, 
  Entity, 
  PrimaryGeneratedColumn, 
  Unique
} from "typeorm";

@Entity({name: "SharedFile"})
@Unique(["userId", "fileId"])
export class SharedFile {

  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column()
  fileId: string

  @Column()
  ownerEmail: string

  @Column()
  userId: string

  @CreateDateColumn()
  createdAt: Date

  constructor(instance: Partial<SharedFile>) {
    Object.assign(this, instance)
  } 
}