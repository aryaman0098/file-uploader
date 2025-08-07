import { 
  Injectable, 
  OnModuleInit 
} from '@nestjs/common'
import * as admin from 'firebase-admin'
import { getAuth } from 'firebase-admin/auth'


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

  getAuth() {
    return getAuth()
  }

  async verifyToken(idToken: string) {
    try {
      const decoded = await this.getAuth().verifyIdToken(idToken);
      return decoded;
    } catch (err) {
      throw new Error('Invalid or expired Firebase token');
    }
  }
}
