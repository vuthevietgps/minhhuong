import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { EntitlementModule } from '../entitlement/entitlement.module';
import { LearningAccessModule } from '../learning-access/learning-access.module';
import { LearningPathModule } from '../learning-path/learning-path.module';
import { UploadStorageController } from './upload-storage.controller';
import { UploadObjectAccessService } from './upload-object-access.service';

@Module({
  imports: [
    AuthModule,
    EntitlementModule,
    LearningAccessModule,
    LearningPathModule,
  ],
  controllers: [UploadStorageController],
  providers: [UploadObjectAccessService],
})
export class UploadStorageModule {}
