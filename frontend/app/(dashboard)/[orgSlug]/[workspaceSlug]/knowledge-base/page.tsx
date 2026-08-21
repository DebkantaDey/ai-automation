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
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../../../components/ui/card';
import { Badge } from '../../../../../components/ui/badge';
import { Button } from '../../../../../components/ui/button';
import { Input } from '../../../../../components/ui/input';
import { apiClient } from '../../../../../lib/api-client';

export default function KnowledgeBasePage() {
  const params = useParams();
  const orgSlug = params?.orgSlug as string;
  const wsSlug = (params?.workspaceSlug as string) || 'default';

  const [kbs, setKbs] = useState<any[]>([]);
  const [selectedKb, setSelectedKb] = useState<any | null>(null);
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
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
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const loadKbs = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/knowledge-base');
      const data = res.data?.data || res.data || [];
      setKbs(data);
      if (data.length > 0 && !selectedKb) {
        setSelectedKb(data[0]);
      }
    } catch {
      setMessage({ type: 'error', text: 'Failed to load knowledge bases' });
    } finally {
      setLoading(false);
    }
  };

  const loadDocuments = async (kbId: string) => {
    try {
      const res = await apiClient.get(`/knowledge-base/${kbId}/documents`);
      setDocuments(res.data?.data || res.data || []);
    } catch {
      console.error('Failed to load documents');
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
    try {
      const res = await apiClient.post('/knowledge-base', {
        name: kbName,
        description: kbDesc,
      });
      const newKb = res.data?.data || res.data;
      setMessage({ type: 'success', text: 'Knowledge base created successfully!' });
      setShowCreateKbModal(false);
      setKbName('');
      setKbDesc('');
      await loadKbs();
      setSelectedKb(newKb);
      setTimeout(() => setMessage(null), 3000);
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to create knowledge base' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedKb || !docName.trim() || !docText.trim()) return;

    setIsSubmitting(true);
    try {
      await apiClient.post(`/knowledge-base/${selectedKb._id}/documents`, {
        name: docName,
        rawText: docText,
      });

      setMessage({ type: 'success', text: 'Document submitted for background vector chunking & indexing!' });
      setShowUploadModal(false);
      setDocName('');
      setDocText('');
      await loadDocuments(selectedKb._id);
      setTimeout(() => setMessage(null), 3000);
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to add document' });
    } finally {
      setIsSubmitting(false);
    }
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
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'RAG query failed' });
    } finally {
      setIsQuerying(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-emerald-600" />
            <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
              Knowledge Base & Vector Search RAG
            </h1>
          </div>
          <p className="text-xs text-neutral-500 mt-0.5">
            Upload company documentation, generate dense vector embeddings in the background, and ask contextual questions.
          </p>
        </div>

        <Button
          size="sm"
          onClick={() => setShowCreateKbModal(true)}
          className="gap-1.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>New Collection</span>
        </Button>
      </div>

      {message && (
        <div
          className={`p-3 rounded-lg text-xs flex items-center gap-2 border ${
            message.type === 'success'
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400'
              : 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-400'
          }`}
        >
          {message.type === 'success' ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
          <span>{message.text}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Collections & Documents */}
        <div className="lg:col-span-5 space-y-4">
          <div className="space-y-2">
            <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
              Knowledge Collections ({kbs.length})
            </h2>

            {kbs.length === 0 ? (
              <Card className="border-dashed p-6 text-center text-xs text-neutral-500">
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
                          ? 'border-emerald-600 ring-2 ring-emerald-600/30 bg-emerald-50/20 dark:bg-emerald-950/20'
                          : 'border-neutral-200 dark:border-neutral-800 hover:border-neutral-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <h3 className="text-xs font-bold text-neutral-900 dark:text-white">{kb.name}</h3>
                          <p className="text-[11px] text-neutral-500 line-clamp-1">{kb.description || 'No description'}</p>
                        </div>
                        <div className="text-right">
                          <Badge variant="secondary" className="text-[10px] font-mono">
                            {kb.documentsCount || 0} Docs
                          </Badge>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>

          {/* Indexed Documents Table */}
          {selectedKb && (
            <Card className="border-neutral-200 dark:border-neutral-800">
              <CardHeader className="py-3 px-4 flex flex-row items-center justify-between border-b border-neutral-100 dark:border-neutral-800">
                <div>
                  <CardTitle className="text-xs font-bold text-neutral-900 dark:text-white">
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
                  className="h-7 px-2 text-xs gap-1"
                >
                  <Upload className="h-3 w-3" />
                  <span>Add Doc</span>
                </Button>
              </CardHeader>

              <CardContent className="p-0 max-h-[300px] overflow-y-auto">
                {documents.length === 0 ? (
                  <p className="text-xs text-neutral-400 text-center py-6">No documents indexed in this collection yet.</p>
                ) : (
                  <div className="divide-y divide-neutral-100 dark:divide-neutral-800 text-xs">
                    {documents.map((doc) => (
                      <div key={doc._id} className="p-3 flex items-center justify-between">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <FileText className="h-3.5 w-3.5 text-blue-500" />
                            <span className="font-semibold text-neutral-900 dark:text-white text-xs">{doc.name}</span>
                          </div>
                          <p className="text-[10px] text-neutral-400">
                            {doc.chunksCount || 0} vector chunks • {(doc.sizeBytes / 1024).toFixed(1)} KB
                          </p>
                        </div>
                        <Badge
                          variant={doc.status === 'processed' ? 'success' : doc.status === 'processing' ? 'outline' : 'destructive'}
                          className="text-[9px] uppercase font-mono"
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

        {/* Right: RAG Q&A Interface */}
        <div className="lg:col-span-7">
          {selectedKb ? (
            <Card className="border-neutral-200 dark:border-neutral-800 flex flex-col h-full">
              <CardHeader className="py-3 px-4 border-b border-neutral-100 dark:border-neutral-800">
                <CardTitle className="text-sm font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-emerald-600" />
                  <span>RAG Q&A Assistant ({selectedKb.name})</span>
                </CardTitle>
                <CardDescription className="text-xs">
                  Queries are matched against the vector similarity index and augmented into LLM context with citations.
                </CardDescription>
              </CardHeader>

              <CardContent className="p-4 space-y-4 flex-1 flex flex-col">
                <form onSubmit={handleAskRAG} className="space-y-2">
                  <div className="flex gap-2">
                    <Input
                      placeholder={`Ask any question about documentation in ${selectedKb.name}...`}
                      value={queryInput}
                      onChange={(e) => setQueryInput(e.target.value)}
                      className="text-xs"
                      disabled={isQuerying}
                    />
                    <Button
                      type="submit"
                      disabled={isQuerying || !queryInput.trim()}
                      className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white gap-1"
                    >
                      <Send className="h-3 w-3" />
                      <span>{isQuerying ? 'Searching...' : 'Ask RAG'}</span>
                    </Button>
                  </div>
                </form>

                <div className="flex-1 min-h-[350px] rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-950 p-4 space-y-4 overflow-y-auto">
                  {!queryResult && !isQuerying && (
                    <div className="h-full flex flex-col items-center justify-center text-neutral-400 text-xs py-16">
                      <Database className="h-8 w-8 mb-2 opacity-40" />
                      <p>Type a question above to synthesize answers from your indexed documents.</p>
                    </div>
                  )}

                  {isQuerying && (
                    <div className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 py-8 justify-center animate-pulse">
                      <span>Computing embeddings & retrieving top vector matches...</span>
                    </div>
                  )}

                  {queryResult && (
                    <div className="space-y-4">
                      {/* Synthesized Answer */}
                      <div className="p-4 rounded-lg bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-2 shadow-sm">
                        <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1 font-mono">
                          <Sparkles className="h-3.5 w-3.5" />
                          RAG Response:
                        </span>
                        <p className="text-xs text-neutral-800 dark:text-neutral-200 leading-relaxed whitespace-pre-wrap">
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
                                className="p-3 rounded bg-neutral-100 dark:bg-neutral-900/80 border text-[11px] font-mono space-y-1"
                              >
                                <div className="flex justify-between text-neutral-500 text-[10px]">
                                  <span>Source #{i + 1} ({src.metadata?.documentName || 'Document'})</span>
                                  <span className="text-emerald-600 font-bold">Similarity: {(src.score * 100).toFixed(1)}%</span>
                                </div>
                                <p className="text-neutral-700 dark:text-neutral-300 font-sans text-xs italic">
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
            <Card className="p-12 text-center text-xs text-neutral-400">
              Select or create a knowledge collection to launch the RAG assistant.
            </Card>
          )}
        </div>
      </div>

      {/* Create KB Modal */}
      {showCreateKbModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-xl max-w-md w-full p-6 space-y-4 border border-neutral-200 dark:border-neutral-800">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-neutral-900 dark:text-white">Create Knowledge Collection</h2>
              <button onClick={() => setShowCreateKbModal(false)} className="text-neutral-400 hover:text-neutral-600 text-sm">✕</button>
            </div>
            <form onSubmit={handleCreateKb} className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">Collection Name</label>
                <Input required placeholder="e.g. Product Documentation" value={kbName} onChange={(e) => setKbName(e.target.value)} className="text-xs" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">Description</label>
                <Input placeholder="Company policies and product guides" value={kbDesc} onChange={(e) => setKbDesc(e.target.value)} className="text-xs" />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setShowCreateKbModal(false)} className="text-xs">Cancel</Button>
                <Button type="submit" disabled={isSubmitting} size="sm" className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white">
                  {isSubmitting ? 'Creating...' : 'Create Collection'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Document Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-xl max-w-lg w-full p-6 space-y-4 border border-neutral-200 dark:border-neutral-800">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-neutral-900 dark:text-white">Add Document to {selectedKb?.name}</h2>
              <button onClick={() => setShowUploadModal(false)} className="text-neutral-400 hover:text-neutral-600 text-sm">✕</button>
            </div>
            <form onSubmit={handleAddDocument} className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">Document Title</label>
                <Input required placeholder="e.g. Refund Policy v2.0" value={docName} onChange={(e) => setDocName(e.target.value)} className="text-xs" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">Document Text Content</label>
                <textarea
                  required
                  rows={8}
                  placeholder="Paste documentation text, markdown, or FAQ content here..."
                  value={docText}
                  onChange={(e) => setDocText(e.target.value)}
                  className="w-full rounded-md border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-2 text-xs text-neutral-900 dark:text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setShowUploadModal(false)} className="text-xs">Cancel</Button>
                <Button type="submit" disabled={isSubmitting} size="sm" className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white">
                  {isSubmitting ? 'Submitting...' : 'Upload & Generate Vectors'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
