import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const ClientIp = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest();
    const forwarded = request.headers['x-forwarded-for'];
    const ip = forwarded
      ? forwarded.split(',')[0].trim()
      : request.connection?.remoteAddress ||
        request.socket?.remoteAddress ||
        request.ip;
    return ip;
  },
);
