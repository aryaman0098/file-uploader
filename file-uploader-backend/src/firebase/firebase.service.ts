import { 
  Injectable, 
  OnModuleInit 
} from '@nestjs/common';
import * as admin from 'firebase-admin';


@Injectable()
export class FirebaseService implements OnModuleInit {
  onModuleInit() {
    admin.initializeApp({
      credential: admin.credential.cert(process.env.FIREBASE_CONFIG_PATH),
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    });
  }

  getStorage() {
    return admin.storage().bucket();
  }
}
