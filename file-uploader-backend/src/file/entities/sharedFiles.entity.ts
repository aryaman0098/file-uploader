import { 
  Column, 
  CreateDateColumn, 
  Entity, 
  PrimaryGeneratedColumn 
} from "typeorm";

@Entity({name: "SharedFile"})
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
  createrAt: Date

  constructor(instance: Partial<SharedFile>) {
    Object.assign(this, instance)
  } 
}