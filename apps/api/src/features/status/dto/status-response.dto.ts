import { ApiProperty } from '@nestjs/swagger';

import type { StatusResponse } from '@michelin/contracts';

export class StatusResponseDto implements StatusResponse {
  @ApiProperty({ example: 'michelin-api' })
  service!: string;

  @ApiProperty({ enum: ['ok', 'degraded'], example: 'ok' })
  status!: 'ok' | 'degraded';

  @ApiProperty({ example: '2026-06-15T12:00:00.000Z' })
  timestamp!: string;

  @ApiProperty({ example: '0.1.0' })
  version!: string;
}
