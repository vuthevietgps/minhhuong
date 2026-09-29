import {
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { CreateYoutubeContextsDto } from '../ai-context/dto/create-youtube-contexts.dto';

// The existing transcript pipeline's rights fields remain validated at the API boundary.
export class BrowserImportDto extends CreateYoutubeContextsDto {
  @IsInt() @Min(1) @Max(120) minutes!: number;
}
export class BrowserComboDto {
  @IsInt() @Min(1) @Max(120) minutes!: number;
}
export class BrowserRetryImportDto {
  @IsOptional() @IsString() @MaxLength(100000) script?: string;
}
