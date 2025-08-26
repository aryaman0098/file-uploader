import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>
  ){}

  async createUser(userId: string, email: string) {
    const dbResp = await this.userRepo.save(
      new User({
        id: userId,
        email: email
      })
    )
    return dbResp
  }

  async getUserIdFromEmail(email: string) {
    const dbResp = await this.userRepo.findOne({
      where: {
        email: email
      }
    })
    return dbResp
  }
}
