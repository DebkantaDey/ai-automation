import { WebhooksService } from '../webhooks.service';
import * as crypto from 'crypto';

describe('Outbound Webhook Delivery Engine', () => {
  let webhooksService: WebhooksService;
  let mockEndpointModel: any;
  let mockDeliveryModel: any;
  let mockQueue: any;

  beforeEach(() => {
    mockEndpointModel = jest.fn().mockImplementation(function (data) {
      Object.assign(this, data, { _id: 'ep-123' });
      this.save = jest.fn().mockResolvedValue(this);
    });
    mockEndpointModel.find = jest.fn();
    mockEndpointModel.findOne = jest.fn();
    mockEndpointModel.findOneAndUpdate = jest.fn();
    mockEndpointModel.deleteOne = jest.fn();

    mockDeliveryModel = {
      create: jest.fn(),
      find: jest.fn().mockReturnValue({
        sort: jest.fn().mockReturnValue({
          skip: jest.fn().mockReturnValue({
            limit: jest.fn().mockReturnValue({
              exec: jest.fn().mockResolvedValue([]),
            }),
          }),
        }),
      }),
      countDocuments: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue(0) }),
    };

    mockQueue = {
      add: jest.fn().mockResolvedValue({ id: 'job-webhook-1' }),
    };

    webhooksService = new WebhooksService(
      mockEndpointModel as any,
      mockDeliveryModel as any,
      mockQueue as any,
    );
  });

  describe('1. Webhook Endpoint Registration & Secret Generation', () => {
    it('should create webhook endpoint with auto-generated HMAC signing secret', async () => {
      const endpoint = await webhooksService.createEndpoint('org-1', 'ws-1', 'user-1', {
        url: 'https://webhook.site/my-endpoint',
        eventTypes: ['workflow.completed', 'workflow.failed'],
        description: 'Customer notification webhook',
      });

      expect(endpoint.url).toBe('https://webhook.site/my-endpoint');
      expect(endpoint.secret).toMatch(/^whsec_[a-f0-9]{48}$/);
      expect(endpoint.status).toBe('active');
    });

    it('should reject invalid non-HTTP/HTTPS URLs', async () => {
      await expect(
        webhooksService.createEndpoint('org-1', 'ws-1', 'user-1', {
          url: 'ftp://invalid-url.com',
        }),
      ).rejects.toThrow();
    });

    it('should rotate secret with fresh cryptographically secure random value', async () => {
      const mockUpdated = {
        _id: 'ep-1',
        secret: `whsec_${crypto.randomBytes(24).toString('hex')}`,
      };
      mockEndpointModel.findOneAndUpdate.mockResolvedValue(mockUpdated);

      const rotated = await webhooksService.rotateSecret('ep-1', 'org-1', 'ws-1');
      expect(rotated.secret).toMatch(/^whsec_[a-f0-9]{48}$/);
    });
  });

  describe('2. Outbound Event Dispatching to BullMQ', () => {
    it('should find matching active endpoints and enqueue delivery jobs', async () => {
      mockEndpointModel.find.mockResolvedValue([
        {
          _id: 'ep-1',
          workspaceId: 'ws-1',
          url: 'https://api.customer.com/webhook1',
          secret: 'whsec_secret1',
        },
        {
          _id: 'ep-2',
          workspaceId: 'ws-1',
          url: 'https://api.customer.com/webhook2',
          secret: 'whsec_secret2',
        },
      ]);

      const count = await webhooksService.dispatchOutboundEvent('org-1', 'ws-1', 'workflow.completed', {
        workflowId: 'wf-100',
        executionId: 'exec-500',
        durationMs: 1200,
      });

      expect(count).toBe(2);
      expect(mockQueue.add).toHaveBeenCalledTimes(2);
    });
  });
});
