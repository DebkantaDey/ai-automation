import { Schema, Document } from 'mongoose';
import { TenantContextService } from '../../tenancy/tenant-context.service';

export function auditPlugin(schema: Schema) {
  // Only add audit fields if not already defined
  if (!schema.path('isDeleted')) {
    schema.add({
      isDeleted: {
        type: Boolean,
        default: false,
        index: true,
      },
    });
  }

  if (!schema.path('deletedAt')) {
    schema.add({
      deletedAt: {
        type: Date,
        default: null,
      },
    });
  }

  if (!schema.path('createdBy')) {
    schema.add({
      createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        default: null,
      },
    });
  }

  if (!schema.path('updatedBy')) {
    schema.add({
      updatedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        default: null,
      },
    });
  }

  // Automatically attach createdBy / updatedBy from active context
  schema.pre('save', function (next) {
    if (typeof this.get !== 'function') {
      return next();
    }
    const userId = TenantContextService.getUserId();
    if (this.isNew && userId && !this.get('createdBy')) {
      this.set('createdBy', userId);
    }
    if (userId) {
      this.set('updatedBy', userId);
    }
    next();
  });
}
