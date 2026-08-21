import { IsArray, IsNotEmpty, IsOptional, IsString, Matches, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateRoleDto {
  @ApiProperty({ example: 'Automation Engineer' })
  @IsString()
  @IsNotEmpty({ message: 'Role name is required' })
  @MaxLength(60)
  name: string;

  @ApiPropertyOptional({ example: 'automation-engineer' })
  @IsOptional()
  @IsString()
  @Matches(/^[a-z0-9-]+$/, {
    message: 'Slug must contain only lowercase alphanumeric characters and hyphens',
  })
  slug?: string;

  @ApiPropertyOptional({ example: 'Can build, configure, and execute workflows and AI agents' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  description?: string;

  @ApiProperty({
    example: ['workflow.read', 'workflow.create', 'workflow.execute', 'ai.read', 'ai.execute'],
    type: [String],
  })
  @IsArray()
  @IsNotEmpty({ message: 'At least one permission is required' })
  permissions: string[];
}
