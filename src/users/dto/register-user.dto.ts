import { IsNotEmpty, IsEmail, MinLength, Matches } from 'class-validator';

export class RegisterUserDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @MinLength(6)
  @Matches(/^(?=.*[A-Z])(?=.*[!@#$%^&*])(?=.{6,})/, {
    message: 'Password must contain at least 6 characters, 1 uppercase, and 1 special character.',
  })
  password: string;

  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  phone: number;
}