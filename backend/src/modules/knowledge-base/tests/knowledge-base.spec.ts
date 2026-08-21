import { KnowledgeBaseService } from '../knowledge-base.service';

describe('Knowledge Base & Vector Search RAG Service', () => {
  let kbService: KnowledgeBaseService;
  let mockKbModel: any;
  let mockDocModel: any;
  let mockChunkModel: any;
  let mockQueue: any;
  let mockAiGateway: any;

  beforeEach(() => {
    mockKbModel = jest.fn().mockImplementation(function (data) {
      Object.assign(this, data, { _id: 'kb-123' });
      this.save = jest.fn().mockResolvedValue(this);
    });
    mockKbModel.find = jest.fn();
    mockKbModel.findOne = jest.fn();
    mockKbModel.countDocuments = jest.fn();

    mockDocModel = jest.fn().mockImplementation(function (data) {
      Object.assign(this, data, { _id: 'doc-123' });
      this.save = jest.fn().mockResolvedValue(this);
    });
    mockDocModel.find = jest.fn();
    mockDocModel.countDocuments = jest.fn();

    mockChunkModel = {
      find: jest.fn(),
      insertMany: jest.fn(),
    };

    mockQueue = {
      add: jest.fn().mockResolvedValue({ id: 'file-job-1' }),
    };

    mockAiGateway = {
      generateEmbeddings: jest.fn().mockResolvedValue({
        embeddings: [
          [1, 0, 0], // Query vector
          [0.9, 0.1, 0], // Doc A
          [0, 1, 0], // Doc B
        ],
      }),
      generateChat: jest.fn().mockResolvedValue({
        text: 'The refund policy allows returns within 30 days.',
        usage: { promptTokens: 60, completionTokens: 20, totalTokens: 80 },
      }),
    };

    kbService = new KnowledgeBaseService(
      mockKbModel as any,
      mockDocModel as any,
      mockChunkModel as any,
      mockQueue as any,
      mockAiGateway as any,
    );
  });

  describe('1. Document Ingestion & Queue Dispatch (Module 46)', () => {
    it('should create document record and enqueue background file processing job', async () => {
      mockKbModel.findOne.mockResolvedValue({ _id: 'kb-1' });

      const doc = await kbService.addDocument('kb-1', 'org-1', 'ws-1', 'user-1', {
        name: 'RefundPolicy.md',
        rawText: 'Customers can request refunds within 30 days of purchase.',
      });

      expect(doc.name).toBe('RefundPolicy.md');
      expect(doc.status).toBe('uploaded');
      expect(mockQueue.add).toHaveBeenCalledWith(
        'process-file',
        expect.objectContaining({ name: 'RefundPolicy.md' }),
        expect.anything(),
      );
    });
  });

  describe('2. Vector Similarity Search & RAG Q&A (Modules 44, 45)', () => {
    it('should rank chunks by cosine similarity and return top matches with citations', async () => {
      mockChunkModel.find.mockReturnValue({
        exec: jest.fn().mockResolvedValue([
          { _id: 'c1', text: '30 day refund window', embedding: [0.99, 0.01, 0], metadata: { doc: 'Policy' } },
          { _id: 'c2', text: 'Office opening hours', embedding: [0.01, 0.99, 0], metadata: { doc: 'Hours' } },
        ]),
      });

      const res = await kbService.askQuestion('kb-1', 'org-1', 'ws-1', 'What is the refund window?');

      expect(res.answer).toBe('The refund policy allows returns within 30 days.');
      expect(res.sources).toHaveLength(2);
      expect(res.sources[0].text).toBe('30 day refund window');
      expect(res.sources[0].score).toBeGreaterThan(0.9);
      expect(mockAiGateway.generateChat).toHaveBeenCalled();
    });
  });
});
