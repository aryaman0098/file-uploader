import { HttpException, HttpStatus, UnauthorizedException } from "@nestjs/common";
import { FileUploadError } from "../customError";
import { FileUploadErrorCode } from "../file/enums/FileUploadErrorCodes.enum";

export const handleError = (error: any) : HttpException => {
  if (error instanceof FileUploadError) {
    throw new HttpException({
      error: {
        code: error.errorCode,
        message: error.errorMessage
      }
    }, error.status ?? HttpStatus.BAD_REQUEST)
  } else if (error instanceof UnauthorizedException) {
    throw new HttpException({
      error: {
        code: FileUploadErrorCode.NOT_AUTHORIZED,
        message: error.message
      }
    }, HttpStatus.FORBIDDEN)
  } else {
    console.error(error)
    throw new HttpException({
      error: {
        code: "UNKNOWN_ERROR",
        message: "Unknown error occurred. Check logs to debug."
      },
    }, HttpStatus.INTERNAL_SERVER_ERROR)
  }
}