import { Module } from '@nestjs/common';
import { FileService } from './file.service';
import { FileController } from './file.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FileMetaInfo } from './entities/fileMetaInfo.entity';
import { FirebaseModule } from '../firebase/firebase.module';
import { SharedFile } from './entities/sharedFiles.entity';
import { UserModule } from '../user/user.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      FileMetaInfo,
      SharedFile
    ]),
    FirebaseModule,
    UserModule
  ],
  controllers: [FileController],
  providers: [FileService],
})
export class FileModule {}
