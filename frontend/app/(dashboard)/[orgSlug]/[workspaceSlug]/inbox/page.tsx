'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  Inbox,
  MessageSquare,
  Mail,
  Send,
  Sparkles,
  UserCheck,
  Bot,
  Search,
  CheckCircle2,
  Clock,
  Phone,
  Paperclip,
  Check,
  Shield,
  Zap,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../../../components/ui/card';
import { Badge } from '../../../../../components/ui/badge';
import { Button } from '../../../../../components/ui/button';
import { Input } from '../../../../../components/ui/input';

const fallbackConversations = [
  {
    id: 'conv-1',
    channel: 'whatsapp',
    contactName: 'David Vance',
    company: 'Global Logistics Corp',
    phone: '+1 (555) 234-5678',
    lastMessage: 'Can we schedule a 30-min demo for tomorrow at 2:00 PM?',
    lastMessageTime: '11:42 AM',
    unreadCount: 1,
    assignedTo: 'AI Sales Agent',
    isAiHandled: true,
    messages: [
      { id: 'm1', sender: 'customer', text: "Hi, I'm interested in your enterprise automation plan.", time: '11:38 AM' },
      { id: 'm2', sender: 'ai', text: 'Hello David! We would love to assist you. Our enterprise tier includes unlimited workflows and dedicated agent orchestration. Would you like a live demo?', time: '11:39 AM' },
      { id: 'm3', sender: 'customer', text: 'Can we schedule a 30-min demo for tomorrow at 2:00 PM?', time: '11:42 AM' },
    ],
  },
  {
    id: 'conv-2',
    channel: 'email',
    contactName: 'Dr. Emily Watson',
    company: 'HealthTech Clinics',
    phone: 'dr.watson@healthclinics.org',
    lastMessage: 'Does your WhatsApp gateway support HIPAA compliant encryption?',
    lastMessageTime: '10:15 AM',
    unreadCount: 0,
    assignedTo: 'Support Agent (Human)',
    isAiHandled: false,
    messages: [
      { id: 'm4', sender: 'customer', text: 'Does your WhatsApp gateway support HIPAA compliant encryption?', time: '10:15 AM' },
      { id: 'm5', sender: 'human', text: 'Hello Dr. Watson. Yes, all webhook payload channels and vector storage use AES-256 envelope encryption with BAA agreements.', time: '10:20 AM' },
    ],
  },
  {
    id: 'conv-3',
    channel: 'whatsapp',
    contactName: 'Marcus Brody',
    company: 'Brody & Partners Law',
    phone: '+1 (555) 432-1098',
    lastMessage: 'Payment for invoice #INV-2026-088 has been dispatched via wire.',
    lastMessageTime: 'Yesterday',
    unreadCount: 0,
    assignedTo: 'AI Finance Agent',
    isAiHandled: true,
    messages: [
      { id: 'm6', sender: 'customer', text: 'Payment for invoice #INV-2026-088 has been dispatched via wire.', time: 'Yesterday' },
      { id: 'm7', sender: 'ai', text: 'Thank you Marcus! We have acknowledged your payment advice and updated your ledger.', time: 'Yesterday' },
    ],
  },
];

export default function UnifiedInboxPage() {
  const params = useParams();
  const orgSlug = params?.orgSlug as string;
  const wsSlug = (params?.workspaceSlug as string) || 'default';

  const [conversations, setConversations] = useState(fallbackConversations);
  const [selectedConv, setSelectedConv] = useState(fallbackConversations[0]);
  const [channelFilter, setChannelFilter] = useState<'all' | 'whatsapp' | 'email'>('all');
  const [replyText, setReplyText] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredConversations = conversations.filter((c) => {
    const matchesChannel = channelFilter === 'all' || c.channel === channelFilter;
    const matchesSearch =
      c.contactName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.company.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesChannel && matchesSearch;
  });

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedConv) return;

    const newMessage = {
      id: `m_${Date.now()}`,
      sender: 'human',
      text: replyText,
      time: 'Just now',
    };

    const updatedConv = {
      ...selectedConv,
      messages: [...selectedConv.messages, newMessage],
      lastMessage: replyText,
      lastMessageTime: 'Just now',
    };

    setSelectedConv(updatedConv);
    setConversations(conversations.map((c) => (c.id === selectedConv.id ? updatedConv : c)));
    setReplyText('');
  };

  const toggleAiTakeover = () => {
    if (!selectedConv) return;
    const updated = { ...selectedConv, isAiHandled: !selectedConv.isAiHandled };
    setSelectedConv(updated);
    setConversations(conversations.map((c) => (c.id === selectedConv.id ? updated : c)));
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between border-b border-neutral-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-neutral-900">
              Unified Omnichannel Inbox
            </h1>
            <Badge variant="default" className="text-[10px] font-mono">
              WhatsApp & Email Live
            </Badge>
          </div>
          <p className="text-xs text-neutral-500 mt-1">
            Real-time conversation stream with WhatsApp Business webhook ingestion, AI auto-replies, and human takeover.
          </p>
        </div>

        <div className="flex items-center gap-1.5 rounded-lg border border-neutral-200 p-0.5 bg-neutral-50">
          <button
            onClick={() => setChannelFilter('all')}
            className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
              channelFilter === 'all' ? 'bg-white text-neutral-900 shadow-sm' : 'text-neutral-500'
            }`}
          >
            All ({conversations.length})
          </button>
          <button
            onClick={() => setChannelFilter('whatsapp')}
            className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer ${
              channelFilter === 'whatsapp' ? 'bg-neutral-900 text-white shadow-sm' : 'text-neutral-500 hover:text-neutral-900'
            }`}
          >
            <MessageSquare className="h-3 w-3" />
            <span>WhatsApp</span>
          </button>
          <button
            onClick={() => setChannelFilter('email')}
            className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer ${
              channelFilter === 'email' ? 'bg-neutral-900 text-white shadow-sm' : 'text-neutral-500 hover:text-neutral-900'
            }`}
          >
            <Mail className="h-3 w-3" />
            <span>Email</span>
          </button>
        </div>
      </div>

      {/* Main Inbox Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[580px]">
        {/* Left: Conversation Thread List */}
        <div className="lg:col-span-4 space-y-3">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-neutral-400" />
            <Input
              placeholder="Search conversations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 text-xs h-9"
            />
          </div>

          <div className="space-y-2 max-h-[520px] overflow-y-auto">
            {filteredConversations.map((conv) => {
              const isSelected = selectedConv?.id === conv.id;

              return (
                <Card
                  key={conv.id}
                  onClick={() => setSelectedConv(conv)}
                  className={`p-3 cursor-pointer transition-all border ${
                    isSelected
                      ? 'border-neutral-900 ring-2 ring-neutral-900/10 bg-white shadow-sm'
                      : 'border-neutral-200 hover:border-neutral-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className="p-1.5 rounded-md bg-neutral-100 text-neutral-800"
                      >
                        {conv.channel === 'whatsapp' ? <MessageSquare className="h-3.5 w-3.5" /> : <Mail className="h-3.5 w-3.5" />}
                      </div>
                      <span className="font-bold text-xs text-neutral-900">{conv.contactName}</span>
                    </div>
                    <span className="text-[10px] text-neutral-400 font-mono">{conv.lastMessageTime}</span>
                  </div>

                  <p className="text-[11px] text-neutral-500 line-clamp-1 mt-1.5">{conv.lastMessage}</p>

                  <div className="flex items-center justify-between pt-2 mt-2 border-t border-neutral-100 text-[10px]">
                    <span className="text-neutral-400">{conv.company}</span>
                    {conv.isAiHandled ? (
                      <span className="flex items-center gap-1 text-neutral-700 font-mono font-medium">
                        <Bot className="h-3 w-3" />
                        AI Handled
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-neutral-700 font-mono font-medium">
                        <UserCheck className="h-3 w-3" />
                        Human Agent
                      </span>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Center: Active Chat Feed */}
        <div className="lg:col-span-8 flex flex-col">
          {selectedConv ? (
            <Card className="border-neutral-200 flex-1 flex flex-col">
              {/* Chat Header */}
              <CardHeader className="py-3 px-5 border-b border-neutral-100 flex flex-row items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-sm font-bold text-neutral-900">
                      {selectedConv.contactName}
                    </CardTitle>
                    <Badge variant={selectedConv.channel === 'whatsapp' ? 'success' : 'default'} className="text-[9px] uppercase font-mono">
                      {selectedConv.channel}
                    </Badge>
                  </div>
                  <CardDescription className="text-xs">{selectedConv.company} • {selectedConv.phone}</CardDescription>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant={selectedConv.isAiHandled ? 'outline' : 'default'}
                    onClick={toggleAiTakeover}
                    className={`h-7 px-2.5 text-xs gap-1 font-semibold ${
                      selectedConv.isAiHandled ? 'text-neutral-800 border-neutral-300' : 'bg-neutral-900 text-white'
                    }`}
                  >
                    {selectedConv.isAiHandled ? <UserCheck className="h-3 w-3" /> : <Bot className="h-3 w-3" />}
                    <span>{selectedConv.isAiHandled ? 'Take Over (Human)' : 'Hand Back to AI'}</span>
                  </Button>
                </div>
              </CardHeader>

              {/* Chat Message Scroll */}
              <CardContent className="p-5 flex-1 overflow-y-auto space-y-3 bg-neutral-50/50 min-h-[340px]">
                {selectedConv.messages.map((msg) => {
                  const isUser = msg.sender === 'customer';
                  const isAi = msg.sender === 'ai';

                  return (
                    <div key={msg.id} className={`flex flex-col ${isUser ? 'items-start' : 'items-end'}`}>
                      <div
                        className={`max-w-[75%] rounded-2xl p-3.5 text-xs space-y-1 ${
                          isUser
                            ? 'bg-white border border-neutral-200 text-neutral-900 rounded-tl-sm'
                            : isAi
                            ? 'bg-neutral-900 text-white shadow-none rounded-tr-sm'
                            : 'bg-neutral-800 text-white shadow-none rounded-tr-sm'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-4 text-[10px] opacity-80 font-mono">
                          <span>{isUser ? selectedConv.contactName : isAi ? 'AI Sales Agent (GPT-4o)' : 'You (Staff Agent)'}</span>
                          <span>{msg.time}</span>
                        </div>
                        <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                      </div>
                    </div>
                  );
                })}
              </CardContent>

              {/* Reply Form & AI Suggestion */}
              <div className="p-4 border-t border-neutral-100 bg-white space-y-2">
                <div className="flex items-center justify-between text-[11px] text-neutral-400">
                  <span className="flex items-center gap-1 text-neutral-700 font-medium">
                    <Sparkles className="h-3 w-3 text-neutral-600" />
                    AI Suggestion: "I have booked your demo for tomorrow at 2:00 PM with our Solutions Architect."
                  </span>
                  <button
                    onClick={() => setReplyText('I have booked your demo for tomorrow at 2:00 PM with our Solutions Architect. You will receive calendar invite shortly.')}
                    className="text-neutral-900 hover:underline font-semibold cursor-pointer"
                  >
                    Insert
                  </button>
                </div>

                <form onSubmit={handleSendMessage} className="flex gap-2">
                  <Input
                    placeholder={`Reply to ${selectedConv.contactName} via ${selectedConv.channel}...`}
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    className="text-xs h-9"
                  />
                  <Button type="submit" size="sm" className="bg-neutral-900 hover:bg-neutral-800 text-white font-semibold gap-1.5 px-4 h-9">
                    <Send className="h-3 w-3" />
                    <span>Send</span>
                  </Button>
                </form>
              </div>
            </Card>
          ) : (
            <Card className="p-16 text-center text-xs text-neutral-400">Select a conversation thread to start messaging.</Card>
          )}
        </div>
      </div>
    </div>
  );
}
