import { Module } from '@nestjs/common';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { HouseholdModule } from './household/household.module';
import { MealPlanModule } from './meal-plan/meal-plan.module';
import { PantryModule } from './pantry/pantry.module';
import { RecipeModule } from './recipe/recipe.module';
import { ShoppingModule } from './shopping/shopping.module';
import { SupabaseModule } from './supabase/supabase.module';
import { JwtAuthGuard } from './auth/auth.guard';
import { GlobalExceptionFilter } from './common/http-exception.filter';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 10 }]),
    SupabaseModule,
    HouseholdModule,
    ShoppingModule,
    PantryModule,
    RecipeModule,
    MealPlanModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_FILTER, useClass: GlobalExceptionFilter },
  ],
})
export class AppModule {}
