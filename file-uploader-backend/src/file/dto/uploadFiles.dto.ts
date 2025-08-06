import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class UploadFilesDto{

  @IsString()
  @IsNotEmpty()
  userId: string

  @IsString()
  @IsOptional()
  description: string

}