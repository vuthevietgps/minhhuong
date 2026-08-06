import { IsBoolean, IsInt, IsOptional, Max, Min } from 'class-validator';

export class UpdateChildScreenTimeDto {
  @IsOptional()
  @IsBoolean()
  isEnabled?: boolean;

  @IsOptional()
  @IsInt()
  @Min(10)
  @Max(240)
  dailyLimitMinutes?: number;
}
