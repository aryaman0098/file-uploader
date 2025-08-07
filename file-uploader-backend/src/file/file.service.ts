import { 
  HttpStatus, 
  Injectable 
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FileMetaInfo } from './entities/fileMetaInfo.entity';
import { Repository } from 'typeorm';
import { FirebaseService } from '../firebase/firebase.service';
import { supportedMimeTypes } from './enums/MimeType.enum';
import { FileUploadError } from '../customError';
import { FileUploadErrorCode } from './enums/FileUploadErrorCodes.enum';
import { UploadFilesDto } from './dto/uploadFiles.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class FileService {

  constructor(
    @InjectRepository(FileMetaInfo)
    private fileMetaInfoRepo: Repository<FileMetaInfo>,
    private readonly firebaseService: FirebaseService
  ) {}

  async getUserFiles(
    userId: string, 
    paginationInfo: {
      take: number, 
      skip: number
  }) {
    const dbResp = await this.fileMetaInfoRepo.find({
      where: {
        userId: userId
      },
      order: {
        updatedAt: "desc"
      },
      take: paginationInfo.take,
      skip: paginationInfo.skip
    })

    const bucket = this.firebaseService.getStorage()

    await Promise.all(dbResp.map(async (e) => {
      const file = bucket.file(e.id);
      const [signedUrl] = await file.getSignedUrl({
        action: 'read',
        expires: Date.now() + 1000 * 60 * 15, // 15 minutes from now
      });
      const [downloadUrl] = await file.getSignedUrl({
        action: 'read',
        expires: Date.now() + 1000 * 60 * 15, 
        responseDisposition: `attachment; filename="${e.originalName}"`
      });
      e.signedUrl = signedUrl
      e.downloadUrl = downloadUrl
    }))

    return dbResp
  }

  async getFile(fileId: string, userId: string) {
    const dbResp = await this.fileMetaInfoRepo.findOne({
      where: {
        id: fileId
      }
    })
    
    if(!dbResp) {
      throw new FileUploadError({
        errorCode: FileUploadErrorCode.FILE_NOT_FOUND,
        errorMessage: "File not found with the provided id.",
        status: HttpStatus.NOT_FOUND
      })
    }
    
    if(dbResp.userId != userId) {
      throw new FileUploadError({
        errorCode: FileUploadErrorCode.NOT_AUTHORIZED,
        errorMessage: `User ${userId} not authorized to view this file.`
      })
    }
    
    const bucket = this.firebaseService.getStorage()
    const file = bucket.file(dbResp.id);
    const [signedUrl] = await file.getSignedUrl({
      action: 'read',
      expires: Date.now() + 1000 * 60 * 15, // 15 minutes from now
    });
    dbResp.signedUrl = signedUrl

    return dbResp
  }

  async uploadFiles(files: Express.Multer.File[], uploadFilesDto: UploadFilesDto) {
    const bucket = this.firebaseService.getStorage()
    
    await Promise.all(files.map(async (file) => {
      if(!supportedMimeTypes.includes(file.mimetype)) {
        throw new FileUploadError({
          errorCode: FileUploadErrorCode.UNSUPPORTED_MIME_TYPE,
          errorMessage: `Mime type ${file.mimetype} not supported for upload.`
        })
      }

      const fileMetaInfo = new FileMetaInfo({
        id: uuidv4(),
        userId: uploadFilesDto.userId,
        mimeType: file.mimetype,
        originalName: file.originalname,
        size: file.size,
      })

      const filename = fileMetaInfo.id;
      const fileUpload = bucket.file(filename);

      await fileUpload.save(file.buffer, {
        metadata: {
          contentType: file.mimetype,
        },
      });

      console.log(`Uploaded file of mime type: ${file.mimetype} and size: ${file.size}`)

      await this.fileMetaInfoRepo.insert(fileMetaInfo)
    }));
  }

  async deleteFile(fileId: string, userId: string) {
    const dbResp = await this.fileMetaInfoRepo.delete({
      id: fileId,
      userId: userId
    })
    if(dbResp.affected == 0) {
      throw new FileUploadError({
        errorCode: FileUploadErrorCode.NOT_FOUND_OR_NOT_AUTHORIZED,
        errorMessage: `Either file not found or user ${userId} not authorized to delete this file`
      })
    } else {
      const bucket = this.firebaseService.getStorage()
      await bucket.file(fileId).delete()
      console.log("File deleted.")
    }
  }
}
