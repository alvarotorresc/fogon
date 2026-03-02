import { IsNotEmpty, IsString, Length } from 'class-validator';

export class JoinHouseholdDto {
  @IsString()
  @IsNotEmpty()
  @Length(8, 8)
  inviteCode: string;

  @IsString()
  @IsNotEmpty()
  displayName: string;
}
