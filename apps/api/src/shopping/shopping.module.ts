import { Module } from '@nestjs/common';
import { ShoppingController } from './shopping.controller';
import { ShoppingService } from './shopping.service';
import { ShoppingGateway } from './shopping.gateway';

@Module({
  controllers: [ShoppingController],
  providers: [ShoppingGateway, ShoppingService],
})
export class ShoppingModule {}
