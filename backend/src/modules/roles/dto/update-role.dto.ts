import { IsArray, IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateRoleDto {
  @ApiPropertyOptional({ example: 'Senior Automation Engineer' })
  @IsOptional()
  @IsString()
  @MaxLength(60)
  name?: string;

  @ApiPropertyOptional({ example: 'Updated description for automation engineer' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  description?: string;

  @ApiPropertyOptional({
    example: ['workflow.read', 'workflow.create', 'workflow.update', 'workflow.execute', 'ai.read', 'ai.execute'],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  permissions?: string[];
}
