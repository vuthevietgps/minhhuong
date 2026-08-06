import { IsOptional, IsString, MaxLength } from 'class-validator';

export class RevokeActivationOrderDto {
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  revokeReason?: string;
}
