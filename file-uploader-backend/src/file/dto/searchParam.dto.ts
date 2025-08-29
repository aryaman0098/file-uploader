import { 
  IsOptional, 
  IsString 
} from "class-validator";

export class SearchParamsDto {

  @IsString()
  @IsOptional()
  fileType: string

  @IsString()
  @IsOptional()
  name: string
}