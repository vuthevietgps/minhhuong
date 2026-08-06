import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';

export class ManualRefundRequestDto {
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  requestReason?: string;
}

export class ReviewManualRefundRequestDto {
  @IsIn(['APPROVE', 'REJECT'])
  decision!: 'APPROVE' | 'REJECT';

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  reviewNotes?: string;
}
