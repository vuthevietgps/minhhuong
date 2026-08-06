import { IsOptional, IsString, MaxLength } from 'class-validator';

export class ReviewPayoutRequestDto {
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  reviewNotes?: string;
}
