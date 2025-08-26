import { Controller, Post, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { FirebaseAuthGuard } from '../auth/authGuard';
import { CurrentUserEmail, CurrentUserId } from '../auth/decorator';
import { handleError } from '../utils/handleError';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @UseGuards(FirebaseAuthGuard)
  async createUser(
    @CurrentUserId() userId: string,
    @CurrentUserEmail() email: string
  ) {
    try {
      const response = await this.userService.createUser(userId, email)
    } catch(e) {
      handleError(e)
    }
  }
}
