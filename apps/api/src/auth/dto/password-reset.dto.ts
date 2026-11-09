import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class RefreshTokenDto {
  @IsString()
  @IsNotEmpty()
  refreshToken!: string;
}

export class ForgotPasswordDto {
  @IsEmail()
  email!: string;
}

export class ResetPasswordDto {
  @IsString()
  @IsNotEmpty()
  token!: string;

  // Same rule as registration and admin password resets.
  @IsString()
  @MinLength(8, { message: 'Mật khẩu mới phải có ít nhất 8 ký tự.' })
  @MaxLength(128, { message: 'Mật khẩu mới tối đa 128 ký tự.' })
  newPassword!: string;
}
