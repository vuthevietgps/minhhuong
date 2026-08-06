import { IsOptional, IsString, MaxLength } from 'class-validator';

export class RejectActivationOrderDto {
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  reviewNotes?: string;
}
