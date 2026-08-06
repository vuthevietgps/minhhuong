import { IsOptional, IsString, MaxLength } from 'class-validator';

export class ResubmitActivationOrderDto {
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  notes?: string;
}
