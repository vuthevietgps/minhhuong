import { IsInt, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class UploadVideoDto {
  @IsOptional()
  @IsString()
  @MaxLength(160)
  title?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  durationSec?: number;
}
