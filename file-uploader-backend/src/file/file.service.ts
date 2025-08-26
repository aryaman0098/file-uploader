import { 
  HttpStatus, 
  Injectable 
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FileMetaInfo } from './entities/fileMetaInfo.entity';
import { LessThan, Repository } from 'typeorm';
import { FirebaseService } from '../firebase/firebase.service';
import { supportedMimeTypes } from './enums/MimeType.enum';
import { FileUploadError } from '../customError';
import { FileUploadErrorCode } from './enums/FileUploadErrorCodes.enum';
import { v4 as uuidv4 } from 'uuid';
import { SharedFile } from './entities/sharedFiles.entity';
import { ShareFileDto } from './dto/shareFile.dto';
import { UserService } from '../user/user.service';

@Injectable()
export class FileService {

  constructor(
    @InjectRepository(FileMetaInfo)
    private fileMetaInfoRepo: Repository<FileMetaInfo>,

    @InjectRepository(SharedFile)
    private sharedFilesRepo: Repository<SharedFile>,

    private readonly userService: UserService,
    private readonly firebaseService: FirebaseService
  ) {}

  /**
   * Get meta info of the file from postgresql
   * Get signed and download url from firebase, each having a validity for 15 mins
   */
  async getUserFiles(
    userId: string, 
    paginationInfo: {
      take: number, 
      skip: number
  }) {
    const dbResp = await this.fileMetaInfoRepo.find({
      where: {
        userId: userId,
        softDeleted: false
      },
      order: {
        updatedAt: "desc"
      },
      take: paginationInfo.take,
      skip: paginationInfo.skip
    })

    const sharedFilesInfo = await this.sharedFilesRepo.find({
      where: {
        userId: userId
      },
      order: {
        createdAt: "desc"
      }
    })

    const sharedFiles = await Promise.all(sharedFilesInfo.map(async(e) => {
      const resp = await this.fileMetaInfoRepo.findOne({
        where: {
          id: e.fileId
        }
      })
      resp.isShared = true
      return resp
    }))

    const files = dbResp.concat(sharedFiles)

    const bucket = this.firebaseService.getStorage()

    await Promise.all(files.map(async (e) => {
      const file = bucket.file(e.id);
      const [signedUrl] = await file.getSignedUrl({
        action: 'read',
        expires: Date.now() + 1000 * 60 * 15, // 15 minutes from now
      });
      const [downloadUrl] = await file.getSignedUrl({
        action: 'read',
        expires: Date.now() + 1000 * 60 * 15, // 15 minutes from now
        responseDisposition: `attachment; filename="${e.originalName}"`
      });
      e.signedUrl = signedUrl
      e.downloadUrl = downloadUrl
      e.isShared = (!e.isShared) ? false : true
    }))

    return files
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

  /**
   * Store the meta info of file in postgresql
   * Upload the file to firebase storage
   */
  async uploadFiles(files: Express.Multer.File[], userId: string) {
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
        userId: userId,
        mimeType: file.mimetype,
        originalName: file.originalname,
        size: file.size,
        softDeleted: false
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
    const dbResp = await this.fileMetaInfoRepo.findOne({
      where: {
        id: fileId,
        userId: userId
      }
    })
    if(!dbResp) {
      throw new FileUploadError({
        errorCode: FileUploadErrorCode.NOT_FOUND_OR_NOT_AUTHORIZED,
        errorMessage: `Either file not found or user ${userId} not authorized to delete this file`
      })
    } else {
      const response = await this.fileMetaInfoRepo.update({
        id: fileId
      }, {
        softDeleted: true
      })

      return response
    }
  }

  async restoreFile(fileId: string, userId: string) {
    const dbResp = await this.fileMetaInfoRepo.findOne({
      where: {
        id: fileId,
        userId: userId
      }
    })
    if(!dbResp) {
      throw new FileUploadError({
        errorCode: FileUploadErrorCode.NOT_FOUND_OR_NOT_AUTHORIZED,
        errorMessage: `Either file not found or user ${userId} not authorized to delete this file`
      })
    } else {
      const response = await this.fileMetaInfoRepo.update({
        id: fileId
      }, {
        softDeleted: false
      })
      return response
    }
  }

  async deleteOldDeletedFiles() {
    const currDate = new Date()
    const fifteenDaysBack = new Date(currDate.getDate() - 15)
    const files = await this.fileMetaInfoRepo.find({
      where: {
        softDeleted: true,
        updatedAt: LessThan(fifteenDaysBack )
      }
    })
    
    await Promise.all(files.map(async (f) => {
      const bucket = this.firebaseService.getStorage()
      await bucket.file(f.id).delete()

      await this.fileMetaInfoRepo.delete({
        id: f.id
      })

      console.log("File deleted.")
    }))
  }

  async shareFile(
    email:string, 
    fileId: string, 
    shareFileDto: ShareFileDto
  ) {

    const userResp = await this.userService.getUserIdFromEmail(shareFileDto.email)

    if(!userResp) {
      throw new FileUploadError({
        errorCode: FileUploadErrorCode.USER_NOT_FOUND,
        errorMessage: `User withe email ${shareFileDto.email} not found`
      })
    }

    const dbResp = await this.sharedFilesRepo.insert({
      id: shareFileDto.id,
      fileId: fileId,
      userId: userResp.id,
      ownerEmail: email
    })
  }
}
