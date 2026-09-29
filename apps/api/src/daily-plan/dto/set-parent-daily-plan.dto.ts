import { ArrayMaxSize, ArrayMinSize, IsArray, IsString } from 'class-validator';

export class SetParentDailyPlanDto {
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(3)
  @IsString({ each: true })
  lessonIds!: string[];
}
