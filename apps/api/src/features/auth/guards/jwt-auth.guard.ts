import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  override handleRequest(
    err: any,
    user: any,
    info: any,
    ctx: ExecutionContext,
  ) {
    const req = ctx
      .switchToHttp()
      .getRequest<{ headers: Record<string, string> }>();
    const token = req.headers['authorization']?.split(' ')[1];
    if (token) {
      try {
        const part = token.split('.')[0] ?? '';
        const header = JSON.parse(Buffer.from(part, 'base64url').toString());
        console.log(
          '[JwtAuthGuard] token alg:',
          header.alg,
          'typ:',
          header.typ,
        );
      } catch {}
    }
    console.log('[JwtAuthGuard] info:', (info as Error)?.message);
    return super.handleRequest(err, user, info, ctx);
  }
}
