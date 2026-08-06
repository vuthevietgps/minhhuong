import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class GrantExtraDeviceTimeDto {
  @IsInt()
  @Min(5)
  @Max(120)
  extraMinutes!: number;

  @IsOptional()
  @IsString()
  note?: string;
}
