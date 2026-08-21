import { Schema, Document } from 'mongoose';
import { TenantContextService } from '../../tenancy/tenant-context.service';

export function auditPlugin(schema: Schema) {
  schema.add({
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  });

  // Automatically attach createdBy / updatedBy from active context
  schema.pre('save', function (next) {
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
