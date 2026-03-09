import { IsNotEmpty, IsString, Matches } from 'class-validator';

export class RegisterTokenDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^ExponentPushToken\[.+\]$/, {
    message: 'token must be a valid Expo push token',
  })
  token!: string;
}
