import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { AuthSessionService } from './auth-session.service';
import { AuthenticatedRequest, AuthenticatedUser } from './auth.types';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwt: JwtService,
    private readonly authSessions: AuthSessionService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context
      .switchToHttp()
      .getRequest<Request & AuthenticatedRequest>();
    const authHeader = request.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing bearer token');
    }

    let user: AuthenticatedUser;

    try {
      user = this.jwt.verify<AuthenticatedUser>(
        authHeader.replace('Bearer ', ''),
      );
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }

    await this.authSessions.assertTokenSessionActive(user);
    request.user = user;
    return true;
  }
}
