import { Controller, Get } from '@nestjs/common';
import { Public } from '../auth/decorator/public.decorator';

@Controller('health')
export class HealthController {
  @Public()
  @Get()
  health() {
    return {
      status: 'online',
      service: 'Social Media NLP Backend',
      timestamp: new Date().toISOString(),
    };
  }
}
