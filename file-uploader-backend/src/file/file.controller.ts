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
  UseInterceptors 
} from '@nestjs/common';
import { FileService } from './file.service';
import { FileMetaInfo } from './entities/fileMetaInfo.entity';
import { FilesInterceptor } from '@nestjs/platform-express';
import { UploadFilesDto } from './dto/uploadFiles.dto';
import { handleError } from '../utils/handleError';
import { FileUploadError } from '../customError';
import { FileUploadErrorCode } from './enums/FileUploadErrorCodes.enum';
import { plainToInstance } from 'class-transformer';
import { validateOrReject } from 'class-validator';
import { CustomParseIntPipe } from '../utils/customParsers';

@Controller('files')
export class FileController {
  
  constructor(private readonly fileService: FileService) {}

  @Get()
  async getUserFiles(
    @Query('user-id') userId: string,
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
  async getFile(
    @Param("id") fileId: string,
    @Query("user-id") userId: string
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
  @UseInterceptors(FilesInterceptor('files'))
  async uploadFiles(
    @UploadedFiles() files: Express.Multer.File[],
    @Body('meta-data') metaData: string
  ) {
    try {
      if(files.length > 10) {
        throw new FileUploadError({
          errorCode: FileUploadErrorCode.MAXIMUM_FILES_EXCEEDED,
          errorMessage: "Maximum 10 files allowed for upload at a time"
        })
      }
      const parsedData = JSON.parse(metaData);
      const uploadFilesDto = plainToInstance(UploadFilesDto, parsedData);
      await validateOrReject(uploadFilesDto);
      await this.fileService.uploadFiles(files, uploadFilesDto)
    } catch(e) {
      handleError(e)
    }
  }

  @Delete(":id")
  async deleteFile(
    @Param("id") fileId: string,
    @Query("user-id") userId: string
  ) {
    try { 
      await this.fileService.deleteFile(fileId, userId)
    } catch(e) {
      handleError(e)
    }
  }
}
