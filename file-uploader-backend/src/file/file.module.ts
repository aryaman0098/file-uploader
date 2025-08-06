import { Module } from '@nestjs/common';
import { FileService } from './file.service';
import { FileController } from './file.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FileMetaInfo } from './entities/fileMetaInfo.entity';
import { FirebaseService } from '../firebase/firebase.service';
import { FirebaseModule } from '../firebase/firebase.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      FileMetaInfo
    ]),
    FirebaseModule
  ],
  controllers: [FileController],
  providers: [FileService],
})
export class FileModule {}
