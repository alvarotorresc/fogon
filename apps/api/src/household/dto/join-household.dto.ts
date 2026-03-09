import { IsNotEmpty, IsString, Length, MaxLength } from 'class-validator';

export class JoinHouseholdDto {
  @IsString()
  @IsNotEmpty()
  @Length(8, 12)
  inviteCode!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  displayName!: string;
}
