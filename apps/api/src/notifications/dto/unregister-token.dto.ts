import { IsNotEmpty, IsString, Matches, MaxLength } from 'class-validator';

export class UnregisterTokenDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  @Matches(/^ExponentPushToken\[[\w-]{20,50}\]$/, {
    message: 'token must be a valid Expo push token',
  })
  token!: string;
}
