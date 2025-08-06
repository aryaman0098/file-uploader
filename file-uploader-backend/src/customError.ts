import { HttpStatus } from "@nestjs/common";

export class FileUploadError extends Error {
  errorCode: string
  errorMessage: Object
  status: HttpStatus


  constructor(args: { 
    errorCode: string 
    errorMessage?: Object 
    status?: HttpStatus
  }) {
    super('')
    this.errorCode = args.errorCode
    this.errorMessage = args.errorMessage
    this.status = args.status
  }
}