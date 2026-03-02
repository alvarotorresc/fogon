import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateHouseholdDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name!: string;
}
