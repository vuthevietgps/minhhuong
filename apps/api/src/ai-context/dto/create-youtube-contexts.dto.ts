import {
  ArrayMaxSize,
  ArrayMinSize,
  Equals,
  IsArray,
  IsBoolean,
  IsIn,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  MinLength,
} from 'class-validator';
import { accountRoles } from '../../auth/auth.types';

export class CreateYoutubeContextsDto {
  @IsUrl({ require_protocol: true })
  url!: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(200)
  title?: string;

  @IsOptional()
  @IsString()
  @MinLength(20)
  @MaxLength(100000)
  script?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  language?: string;

  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(12)
  @IsIn(accountRoles, { each: true })
  targetRoles!: string[];

  @IsBoolean()
  @Equals(true)
  rightsConfirmed!: boolean;

  @IsString()
  @IsIn(['OWNED', 'WRITTEN_PERMISSION', 'CC_BY', 'PUBLIC_DOMAIN'])
  rightsType!: 'OWNED' | 'WRITTEN_PERMISSION' | 'CC_BY' | 'PUBLIC_DOMAIN';

  @IsString()
  @MinLength(10)
  @MaxLength(240)
  rightsBasis!: string;
}
