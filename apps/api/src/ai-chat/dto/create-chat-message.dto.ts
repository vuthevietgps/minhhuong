import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateChatMessageDto {
  @IsOptional()
  @IsString()
  sessionId?: string;

  @IsString()
  @MinLength(1)
  @MaxLength(4000)
  message!: string;

  @IsOptional()
  @IsString()
  childProfileId?: string;
}
