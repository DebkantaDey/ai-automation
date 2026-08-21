import { Module, Global } from '@nestjs/common';
import { TemplatesController } from './templates.controller';
import { TemplatesService } from './templates.service';
import { WorkflowsModule } from '../workflows/workflows.module';

@Global()
@Module({
  imports: [WorkflowsModule],
  controllers: [TemplatesController],
  providers: [TemplatesService],
  exports: [TemplatesService],
})
export class TemplatesModule {}
