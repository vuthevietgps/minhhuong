import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateChildProfileDto {
  @IsString()
  @MinLength(1)
  @MaxLength(80)
  displayName!: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  avatarUrl?: string;
}
