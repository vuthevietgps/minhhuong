import { CanActivate, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class LocalDemoOnlyGuard implements CanActivate {
  constructor(private readonly config: ConfigService) {}

  canActivate() {
    if (this.config.get<string>('NODE_ENV')?.toLowerCase() === 'production') {
      throw new NotFoundException('Route not found');
    }

    return true;
  }
}
