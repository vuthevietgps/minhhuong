import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class AppHeartbeatDto {
  @IsString()
  @MinLength(8)
  @MaxLength(120)
  deviceKey!: string;

  @IsOptional()
  @IsString()
  sessionId?: string;
}
