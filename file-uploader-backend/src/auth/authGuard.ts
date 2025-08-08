import { 
  CanActivate, 
  ExecutionContext, 
  Injectable, 
  UnauthorizedException 
} from "@nestjs/common"
import { FirebaseService } from "../firebase/firebase.service"

@Injectable()
export class FirebaseAuthGuard implements CanActivate {
  constructor(private readonly firebaseService: FirebaseService) {}

  /**
   * Verify the bearer token in each api request for user
   */
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<Request>();
    const authHeader = req.headers['authorization']

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException("Bearer token required for authentication")
    }
    const token = authHeader.split(' ')[1]
    try {
      const decodedUser = await this.firebaseService.verifyToken(token)
      req["user"] = decodedUser
      return true
    } catch (err) {
      throw new UnauthorizedException(err.message)
    }
  }
}