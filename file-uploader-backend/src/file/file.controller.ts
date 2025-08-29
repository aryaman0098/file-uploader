import { 
  Body,
  Controller, 
  Delete, 
  Get, 
  HttpCode, 
  HttpStatus, 
  Param, 
  Post, 
  Query, 
  UploadedFiles, 
  UseGuards, 
  UseInterceptors 
} from '@nestjs/common';
import { FileService } from './file.service';
import { FileMetaInfo } from './entities/fileMetaInfo.entity';
import { FilesInterceptor } from '@nestjs/platform-express';
import { handleError } from '../utils/handleError';
import { FileUploadError } from '../customError';
import { FileUploadErrorCode } from './enums/FileUploadErrorCodes.enum';
import { CustomParseIntPipe } from '../utils/customParsers';
import { FirebaseAuthGuard } from '../auth/authGuard';
import { CurrentUserEmail, CurrentUserId } from '../auth/decorator';
import { ShareFileDto } from './dto/shareFile.dto';
import { SearchParamsDto } from './dto/searchParam.dto';

@Controller('files')
export class FileController {
  
  constructor(private readonly fileService: FileService) {}

  @Get()
  @UseGuards(FirebaseAuthGuard)
  async getUserFiles(
    @CurrentUserId() userId: string,
    @Query('take', CustomParseIntPipe) take: number,
    @Query('skip', CustomParseIntPipe) skip: number
  ): Promise<FileMetaInfo[]> {
    try {
      const paginationInfo = {
        take: take || 10,
        skip: skip || 0
      }
      const response = await this.fileService.getUserFiles(userId, paginationInfo)
      return response
    } catch(e) {
      handleError(e)
      return []
    }
  }


  @Get(":id")
  @UseGuards(FirebaseAuthGuard)
  async getFile(
    @CurrentUserId() userId: string,
    @Param("id") fileId: string,
  ) {
    try{
      const response = await this.fileService.getFile(fileId, userId)
      return response
    } catch(e){
      handleError(e)
    }
  }

  @Post("/upload")
  @HttpCode(HttpStatus.OK)
  @UseGuards(FirebaseAuthGuard)
  @UseInterceptors(FilesInterceptor('files'))
  async uploadFiles(
    @CurrentUserId() userId: string,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    try {
      if(files.length > 10) {
        throw new FileUploadError({
          errorCode: FileUploadErrorCode.MAXIMUM_FILES_EXCEEDED,
          errorMessage: "Maximum 10 files allowed for upload at a time"
        })
      }
      await this.fileService.uploadFiles(files, userId)
    } catch(e) {
      handleError(e)
    }
  }

  @Delete(":id")
  @UseGuards(FirebaseAuthGuard)
  async deleteFile(
    @CurrentUserId() userId: string,
    @Param("id") fileId: string
  ) {
    try { 
      const resp = await this.fileService.deleteFile(fileId, userId)
      return resp
    } catch(e) {
      handleError(e)
    }
  }

  @Post(":id/restore")
  @UseGuards(FirebaseAuthGuard)
  async restoreFile(
    @CurrentUserId() userId: string,
    @Param("id") fileId: string
  ) {
    try {
      const resp = await this.fileService.restoreFile(fileId, userId)
      return resp
    } catch(e) {
      handleError(e)
    }
  }

  @Post("delete-old-files")
  async deleteOldFiles() {
    try {
      await this.fileService.deleteOldDeletedFiles()
    } catch(e) {
      handleError(e)
    }
  }

  @Post(":id/share")
  @UseGuards(FirebaseAuthGuard)
  async shareFile(
    @CurrentUserEmail() email: string,
    @Param("id") fileId: string,
    @Body() shareFileDto: ShareFileDto
  ) {
    try {
      await this.fileService.shareFile(email, fileId, shareFileDto)
    } catch(e) {
      handleError(e)
    }
  }

  @Post("/search")
  @UseGuards(FirebaseAuthGuard)
  async searchFiles(
    @CurrentUserId() userId: string,
    @Body() searchParams: SearchParamsDto
  ) {
    try {
      const response = await this.fileService.searchFiles(searchParams, userId)
      return response
    } catch(e) {
      handleError(e)
    }
  }
}
