import { 
  Column, 
  Entity, 
  PrimaryColumn 
} from "typeorm";

@Entity({name: "User"})
export class User {

  @PrimaryColumn()
  id: string

  @Column()
  email: string

  constructor(instance: Partial<User>) {
    Object.assign(this, instance)
  }
}