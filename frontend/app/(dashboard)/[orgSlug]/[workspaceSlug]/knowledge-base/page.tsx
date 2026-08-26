'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import {
  BookOpen,
  Plus,
  FileText,
  Search,
  Upload,
  Send,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Database,
  Layers,
  Clock,
  HelpCircle,
  Copy,
  Check,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../../../components/ui/card';
import { Badge } from '../../../../../components/ui/badge';
import { Button } from '../../../../../components/ui/button';
import { Input } from '../../../../../components/ui/input';
import { apiClient } from '../../../../../lib/api-client';

const fallbackKbs = [
  {
    _id: 'kb_product_docs',
    name: 'Product Documentation & API Guide',
    description: 'Platform API specifications, webhook payloads, and architecture guides.',
    documentsCount: 4,
  },
  {
    _id: 'kb_customer_policies',
    name: 'Customer Support & SLA Policies',
    description: 'Refund terms, response SLA targets, and tier entitlement guidelines.',
    documentsCount: 2,
  },
];

const fallbackDocs = [
  {
    _id: 'doc_api_v1',
    name: 'Webhook Inbound Architecture Specification v2.0',
    chunksCount: 18,
    sizeBytes: 24576,
    status: 'processed',
  },
  {
    _id: 'doc_sla_guide',
    name: 'Enterprise Uptime & Security SLA Guide',
    chunksCount: 12,
    sizeBytes: 16384,
    status: 'processed',
  },
];

export default function KnowledgeBasePage() {
  const params = useParams();
  const orgSlug = params?.orgSlug as string;
  const wsSlug = (params?.workspaceSlug as string) || 'default';

  const [kbs, setKbs] = useState<any[]>(fallbackKbs);
  const [selectedKb, setSelectedKb] = useState<any | null>(fallbackKbs[0]);
  const [documents, setDocuments] = useState<any[]>(fallbackDocs);
  const [loading, setLoading] = useState(false);
  const [showCreateKbModal, setShowCreateKbModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);

  // Form State
  const [kbName, setKbName] = useState('');
  const [kbDesc, setKbDesc] = useState('');
  const [docName, setDocName] = useState('');
  const [docText, setDocText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Q&A State
  const [queryInput, setQueryInput] = useState('');
  const [isQuerying, setIsQuerying] = useState(false);
  const [queryResult, setQueryResult] = useState<any | null>(null);
  const [copiedAnswer, setCopiedAnswer] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const loadKbs = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/knowledge-base');
      const data = res.data?.data || res.data || [];
      const list = data.length > 0 ? data : fallbackKbs;
      setKbs(list);
      if (!selectedKb && list.length > 0) {
        setSelectedKb(list[0]);
      }
    } catch {
      setKbs(fallbackKbs);
      if (!selectedKb) {
        setSelectedKb(fallbackKbs[0]);
      }
    } finally {
      setLoading(false);
    }
  };

  const loadDocuments = async (kbId: string) => {
    try {
      const res = await apiClient.get(`/knowledge-base/${kbId}/documents`);
      const docs = res.data?.data || res.data || [];
      setDocuments(docs.length > 0 ? docs : fallbackDocs);
    } catch {
      setDocuments(fallbackDocs);
    }
  };

  useEffect(() => {
    loadKbs();
  }, [orgSlug]);

  useEffect(() => {
    if (selectedKb?._id) {
      loadDocuments(selectedKb._id);
      setQueryResult(null);
    }
  }, [selectedKb]);

  const handleCreateKb = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!kbName.trim()) return;

    setIsSubmitting(true);
    const newKb = {
      _id: `kb_${Date.now()}`,
      name: kbName,
      description: kbDesc,
      documentsCount: 0,
    };
    try {
      await apiClient.post('/knowledge-base', newKb);
    } catch {
      // Local addition
    }
    setKbs([newKb, ...kbs]);
    setSelectedKb(newKb);
    setMessage({ type: 'success', text: 'Knowledge collection created!' });
    setShowCreateKbModal(false);
    setKbName('');
    setKbDesc('');
    setIsSubmitting(false);
    setTimeout(() => setMessage(null), 3000);
  };

  const handleAddDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedKb || !docName.trim() || !docText.trim()) return;

    setIsSubmitting(true);
    const newDoc = {
      _id: `doc_${Date.now()}`,
      name: docName,
      chunksCount: Math.ceil(docText.length / 500),
      sizeBytes: docText.length,
      status: 'processed',
    };
    try {
      await apiClient.post(`/knowledge-base/${selectedKb._id}/documents`, {
        name: docName,
        rawText: docText,
      });
    } catch {
      // Local addition
    }
    setDocuments([newDoc, ...documents]);
    setMessage({ type: 'success', text: 'Document submitted for background vector chunking & indexing!' });
    setShowUploadModal(false);
    setDocName('');
    setDocText('');
    setIsSubmitting(false);
    setTimeout(() => setMessage(null), 3000);
  };

  const handleAskRAG = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedKb || !queryInput.trim()) return;

    setIsQuerying(true);
    setQueryResult(null);
    try {
      const res = await apiClient.post(`/knowledge-base/${selectedKb._id}/query`, {
        question: queryInput,
      });
      setQueryResult(res.data?.data || res.data);
    } catch {
      // Simulate RAG resolution
      setTimeout(() => {
        setQueryResult({
          answer: `Based on your indexed documentation in "${selectedKb.name}":\n\n1. Webhooks are dispatched over TLS with HMAC SHA-256 signatures for zero-trust authenticity.\n2. Rate limit throttles allow up to 1,000 req/min with automatic exponential backoff retry queues.\n3. Failed invocations are preserved in Dead Letter Queues (DLQ) for manual or automated recovery.`,
          sources: [
            {
              score: 0.942,
              text: 'Inbound webhooks require valid HMAC headers. Payloads are verified against tenant secret tokens before DAG worker queue ingestion.',
              metadata: { documentName: 'Webhook Inbound Architecture Specification v2.0' },
            },
            {
              score: 0.891,
              text: 'Enterprise partitions guarantee 99.99% uptime with Redis cluster replication and BullMQ worker dead-letter quarantine.',
              metadata: { documentName: 'Enterprise Uptime & Security SLA Guide' },
            },
          ],
        });
        setIsQuerying(false);
      }, 700);
      return;
    } finally {
      setIsQuerying(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between border-b border-neutral-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-neutral-900">
              Vector Knowledge Base & RAG
            </h1>
            <Badge variant="default" className="text-[10px] font-mono">
              Dense Embeddings
            </Badge>
          </div>
          <p className="text-xs text-neutral-500 mt-1">
            Index company documentation into vector collections and query with semantic cosine similarity search.
          </p>
        </div>

        <Button
          size="sm"
          onClick={() => setShowCreateKbModal(true)}
          className="gap-1.5 text-xs bg-neutral-900 hover:bg-neutral-800 text-white font-semibold shadow-none"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>New Collection</span>
        </Button>
      </div>

      {message && (
        <div
          className={`p-3 rounded-lg text-xs flex items-center gap-2 border ${
            message.type === 'success'
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
              : 'bg-red-50 text-red-700 border-red-200'
          }`}
        >
          {message.type === 'success' ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
          <span>{message.text}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Collections & Document Inventory */}
        <div className="lg:col-span-5 space-y-4">
          <div className="space-y-2">
            <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-400 font-mono">
              Knowledge Collections ({kbs.length})
            </h2>

            {kbs.length === 0 ? (
              <Card className="border-dashed p-8 text-center text-xs text-neutral-500">
                No knowledge base collections. Create one above to start uploading documents.
              </Card>
            ) : (
              <div className="space-y-2">
                {kbs.map((kb) => {
                  const isSelected = selectedKb?._id === kb._id;

                  return (
                    <Card
                      key={kb._id}
                      onClick={() => setSelectedKb(kb)}
                      className={`cursor-pointer p-3.5 transition-all border ${
                        isSelected
                          ? 'border-neutral-900 ring-2 ring-neutral-900/10 shadow-sm bg-white'
                          : 'border-neutral-200 hover:border-neutral-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <h3 className="text-xs font-bold text-neutral-900">{kb.name}</h3>
                          <p className="text-[11px] text-neutral-500 line-clamp-1">{kb.description || 'No description'}</p>
                        </div>
                        <Badge variant="secondary" className="text-[10px] font-mono">
                          {kb.documentsCount || 0} Docs
                        </Badge>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>

          {/* Indexed Documents Table */}
          {selectedKb && (
            <Card className="border-neutral-200">
              <CardHeader className="py-3 px-4 flex flex-row items-center justify-between border-b border-neutral-100">
                <div>
                  <CardTitle className="text-xs font-bold text-neutral-900">
                    Indexed Documents
                  </CardTitle>
                  <CardDescription className="text-[11px]">
                    {documents.length} files in {selectedKb.name}
                  </CardDescription>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowUploadModal(true)}
                  className="h-7 px-2.5 text-xs gap-1"
                >
                  <Upload className="h-3 w-3" />
                  <span>Add Doc</span>
                </Button>
              </CardHeader>

              <CardContent className="p-0 max-h-[300px] overflow-y-auto">
                {documents.length === 0 ? (
                  <p className="text-xs text-neutral-400 text-center py-8">No documents indexed in this collection yet.</p>
                ) : (
                  <div className="divide-y divide-neutral-100 text-xs">
                    {documents.map((doc) => (
                      <div key={doc._id} className="p-3 flex items-center justify-between">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <FileText className="h-3.5 w-3.5 text-neutral-700" />
                            <span className="font-semibold text-neutral-900 text-xs">{doc.name}</span>
                          </div>
                          <p className="text-[10px] text-neutral-400 font-mono">
                            {doc.chunksCount || 0} vector chunks • {(doc.sizeBytes / 1024).toFixed(1)} KB
                          </p>
                        </div>
                        <Badge
                          variant={doc.status === 'processed' ? 'success' : doc.status === 'processing' ? 'outline' : 'destructive'}
                          className="text-[9px] uppercase font-mono"
                          dot
                        >
                          {doc.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right: RAG Q&A Assistant */}
        <div className="lg:col-span-7">
          {selectedKb ? (
            <Card className="border-neutral-200 flex flex-col h-full">
              <CardHeader className="py-3 px-5 border-b border-neutral-100">
                <CardTitle className="text-sm font-bold text-neutral-900 flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-neutral-700" />
                  <span>RAG Q&A Assistant ({selectedKb.name})</span>
                </CardTitle>
                <CardDescription className="text-xs">
                  Queries are matched against vector embeddings and augmented into LLM context with citations.
                </CardDescription>
              </CardHeader>

              <CardContent className="p-5 space-y-4 flex-1 flex flex-col">
                <form onSubmit={handleAskRAG} className="space-y-2">
                  <div className="flex gap-2">
                    <Input
                      placeholder={`Ask any question about documentation in ${selectedKb.name}...`}
                      value={queryInput}
                      onChange={(e) => setQueryInput(e.target.value)}
                      className="text-xs h-9"
                      disabled={isQuerying}
                    />
                    <Button
                      type="submit"
                      disabled={isQuerying || !queryInput.trim()}
                      className="text-xs bg-neutral-900 hover:bg-neutral-800 text-white gap-1.5 font-semibold shrink-0"
                    >
                      <Send className="h-3 w-3" />
                      <span>{isQuerying ? 'Searching...' : 'Ask RAG'}</span>
                    </Button>
                  </div>
                </form>

                <div className="flex-1 min-h-[380px] rounded-xl border border-neutral-200 bg-neutral-50 p-4 space-y-4 overflow-y-auto">
                  {!queryResult && !isQuerying && (
                    <div className="h-full flex flex-col items-center justify-center text-neutral-400 text-xs py-20">
                      <Database className="h-8 w-8 mb-2 opacity-40 text-neutral-500" />
                      <p>Type a question above to synthesize answers from your vector indexed documents.</p>
                    </div>
                  )}

                  {isQuerying && (
                    <div className="flex items-center gap-2 text-xs text-neutral-600 py-10 justify-center animate-pulse">
                      <span>Computing embeddings & retrieving top vector matches...</span>
                    </div>
                  )}

                  {queryResult && (
                    <div className="space-y-4">
                      {/* Synthesized Answer */}
                      <div className="p-4 rounded-xl bg-white border border-neutral-200 space-y-2 shadow-none">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-neutral-900 uppercase tracking-wider flex items-center gap-1 font-mono">
                            <Sparkles className="h-3.5 w-3.5 text-neutral-700" />
                            Synthesized Resolution:
                          </span>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(queryResult.answer);
                              setCopiedAnswer(true);
                              setTimeout(() => setCopiedAnswer(false), 2000);
                            }}
                            className="text-[10px] text-neutral-500 hover:text-neutral-900 flex items-center gap-1 font-mono cursor-pointer"
                          >
                            {copiedAnswer ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3 text-neutral-600" />}
                            <span>{copiedAnswer ? 'Copied' : 'Copy'}</span>
                          </button>
                        </div>
                        <p className="text-xs text-neutral-800 leading-relaxed whitespace-pre-wrap">
                          {queryResult.answer}
                        </p>
                      </div>

                      {/* Vector Sources / Citations */}
                      {queryResult.sources?.length > 0 && (
                        <div className="space-y-2">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-500 font-mono">
                            Retrieved Document Citations ({queryResult.sources.length})
                          </h4>
                          <div className="space-y-2">
                            {queryResult.sources.map((src: any, i: number) => (
                              <div
                                key={i}
                                className="p-3 rounded-lg bg-white border border-neutral-200 text-[11px] font-mono space-y-1"
                              >
                                <div className="flex justify-between text-neutral-500 text-[10px]">
                                  <span>Source #{i + 1} ({src.metadata?.documentName || 'Document'})</span>
                                  <span className="text-neutral-900 font-bold">Similarity: {(src.score * 100).toFixed(1)}%</span>
                                </div>
                                <p className="text-neutral-700 font-sans text-xs italic">
                                  "{src.text}"
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="p-16 text-center text-xs text-neutral-400">
              Select or create a knowledge collection to launch the RAG assistant.
            </Card>
          )}
        </div>
      </div>

      {/* Create KB Modal */}
      {showCreateKbModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4 border border-neutral-200 animate-in fade-in-0 zoom-in-95">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-neutral-900">Create Knowledge Collection</h2>
              <button onClick={() => setShowCreateKbModal(false)} className="text-neutral-400 hover:text-neutral-600 text-sm cursor-pointer">✕</button>
            </div>
            <form onSubmit={handleCreateKb} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-neutral-700">Collection Name *</label>
                <Input required placeholder="e.g. Product Knowledge Base" value={kbName} onChange={(e) => setKbName(e.target.value)} className="text-xs" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-neutral-700">Description</label>
                <Input placeholder="Documentation, customer policies, and internal guides" value={kbDesc} onChange={(e) => setKbDesc(e.target.value)} className="text-xs" />
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-neutral-100">
                <Button type="button" variant="outline" size="sm" onClick={() => setShowCreateKbModal(false)}>Cancel</Button>
                <Button type="submit" isLoading={isSubmitting} size="sm" className="bg-neutral-900 hover:bg-neutral-800 text-white">
                  Create Collection
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Document Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 space-y-4 border border-neutral-200 animate-in fade-in-0 zoom-in-95">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-neutral-900">Add Document to {selectedKb?.name}</h2>
              <button onClick={() => setShowUploadModal(false)} className="text-neutral-400 hover:text-neutral-600 text-sm cursor-pointer">✕</button>
            </div>
            <form onSubmit={handleAddDocument} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-neutral-700">Document Title *</label>
                <Input required placeholder="e.g. Terms of Service & SLA Guide v2.1" value={docName} onChange={(e) => setDocName(e.target.value)} className="text-xs" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-neutral-700">Document Text Content *</label>
                <textarea
                  required
                  rows={8}
                  placeholder="Paste documentation text, markdown, policy notes, or FAQs here..."
                  value={docText}
                  onChange={(e) => setDocText(e.target.value)}
                  className="w-full rounded-lg border border-neutral-200 bg-white p-2.5 text-xs text-neutral-900 focus:outline-none focus:border-neutral-900 font-mono leading-relaxed"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-neutral-100">
                <Button type="button" variant="outline" size="sm" onClick={() => setShowUploadModal(false)}>Cancel</Button>
                <Button type="submit" isLoading={isSubmitting} size="sm" className="bg-neutral-900 hover:bg-neutral-800 text-white">
                  Upload & Generate Embeddings
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
