import { IsEmail, IsString } from "class-validator";

export class ShareFileDto {

  @IsEmail()
  email: string

  @IsString()
  id: string

}