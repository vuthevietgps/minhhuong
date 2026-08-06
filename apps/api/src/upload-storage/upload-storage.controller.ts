import {
  Controller,
  Get,
  Header,
  Param,
  Query,
  StreamableFile,
  UseGuards,
  VERSION_NEUTRAL,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import type { AuthenticatedUser } from '../auth/auth.types';
import { assertSafeObjectKey } from './blob-storage';
import { getUploadBlobStorage } from './provider-upload-storage';
import { UploadObjectAccessService } from './upload-object-access.service';

@Controller({ path: 'uploads', version: VERSION_NEUTRAL })
@UseGuards(JwtAuthGuard)
export class UploadStorageController {
  constructor(private readonly access: UploadObjectAccessService) {}

  @Get('*path')
  @Header('Cache-Control', 'private, no-store')
  async read(
    @Param('path') path: string | string[],
    @CurrentUser() user: AuthenticatedUser,
    @Query('childProfileId') childProfileId?: string,
  ) {
    const key = assertSafeObjectKey(
      Array.isArray(path) ? path.join('/') : path,
    );
    await this.access.assertCanRead(user, key, childProfileId);
    const object = await getUploadBlobStorage().read(key);
    return new StreamableFile(object.body, {
      type: object.contentType,
      length: object.size,
    });
  }
}
