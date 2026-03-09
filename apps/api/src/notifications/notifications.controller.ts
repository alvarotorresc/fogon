import { Controller, Post, Delete, Body, Req, HttpCode, HttpStatus } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { RegisterTokenDto } from './dto/register-token.dto';
import { UnregisterTokenDto } from './dto/unregister-token.dto';

interface AuthenticatedRequest {
  userId: string;
}

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post('register-token')
  async registerToken(
    @Body() dto: RegisterTokenDto,
    @Req() req: AuthenticatedRequest,
  ) {
    await this.notificationsService.registerToken(req.userId, dto.token);
    return { data: null };
  }

  @Delete('unregister-token')
  @HttpCode(HttpStatus.OK)
  async unregisterToken(
    @Body() dto: UnregisterTokenDto,
    @Req() req: AuthenticatedRequest,
  ) {
    await this.notificationsService.unregisterToken(req.userId, dto.token);
    return { data: null };
  }
}
