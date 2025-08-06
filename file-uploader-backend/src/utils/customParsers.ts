import { 
  Injectable, 
  PipeTransform, 
  HttpException, 
  HttpStatus 
} from "@nestjs/common"

@Injectable()
export class CustomParseIntPipe implements PipeTransform {
	transform(param ?: string) {
		if(!isNaN(Number(param))) {
			return +param
		} else if(!param) {
			return param
		} else {
			throw new HttpException(
				`${param} is an invalid value`, 
				HttpStatus.BAD_REQUEST
			)
		}
	}
}