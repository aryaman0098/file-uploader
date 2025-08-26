import { Global, Module } from '@nestjs/common';
import { FirebaseService } from './firebase.service';

@Global()
@Module({
  controllers: [],
  providers: [FirebaseService],
  exports: [FirebaseService]
})
export class FirebaseModule {}
