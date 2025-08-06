import { HttpException, HttpStatus } from "@nestjs/common";
import { FileUploadError } from "../customError";
import { ValidationError } from "class-validator";
import { FileUploadErrorCode } from "../file/enums/FileUploadErrorCodes.enum";

export const handleError = (error: any) : HttpException => {
  if (error instanceof FileUploadError) {
    throw new HttpException({
      error: {
        code: error.errorCode,
        message: error.errorMessage
      }
    }, error.status ?? HttpStatus.BAD_REQUEST)
  } else if (Array.isArray(error) && error.every(e => e instanceof ValidationError)) {
    const message = error.map((e) => {
                      const constraints = Object.values(e.constraints).join(', ');
                      return `Property '${e.property}': ${constraints}`;
                    }).join('\n');
    throw new HttpException({
      error: {
        code: FileUploadErrorCode.VALIDATION_ERROR,
        message: message,
      },
    }, HttpStatus.BAD_REQUEST,)
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