import { IsNotEmpty, IsString, Matches, MaxLength } from 'class-validator';

export class RegisterTokenDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  @Matches(/^ExponentPushToken\[[\w-]{20,50}\]$/, {
    message: 'token must be a valid Expo push token',
  })
  token!: string;
}
