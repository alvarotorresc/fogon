import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HouseholdModule } from './household/household.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    HouseholdModule,
  ],
})
export class AppModule {}
