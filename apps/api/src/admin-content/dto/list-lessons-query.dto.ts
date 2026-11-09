import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, MaxLength, Min } from 'class-validator';

/** Query phân trang danh sách bài học (dùng cho admin và giáo viên). */
export class ListLessonsQueryDto {
  @IsOptional()
  @IsString()
  @MaxLength(64)
  cursor?: string;

  /** Số bài học mỗi trang; giá trị lớn hơn 100 được giới hạn về 100. */
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'take phải là số nguyên' })
  @Min(1, { message: 'take phải lớn hơn hoặc bằng 1' })
  take?: number;
}
