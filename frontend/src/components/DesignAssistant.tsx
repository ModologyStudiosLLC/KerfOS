"use client";

import React, { useState, useRef, useEffect } from "react";

export interface DesignAssistantProps {
  onAddCabinet?: (cabinet: any) => void;
  onUpdateCabinet?: (id: string, cabinet: any) => void;
  cabinets?: any[];
  onCabinetSelect?: (id: string) => void;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  suggestedActions?: string[];
}

export interface WizardStep {
  step: string;
  prompt: string;
  options: { value: string; label: string; description: string }[];
  state: any;
  cabinetSummary?: any;
}

export default function DesignAssistant({ onAddCabinet, onUpdateCabinet, cabinets, onCabinetSelect }: DesignAssistantProps) {
  const [mode, setMode] = useState<'chat' | 'wizard'>('chat');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [conversationId, setConversationId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [wizardStep, setWizardStep] = useState<WizardStep | null>(null);
  const [isWizardActive, setIsWizardActive] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  useEffect(() => {
    // Generate conversation ID on mount
    const id = `conv_${Date.now()}`;
    setConversationId(id);
  }, []);

  useEffect(() => {
    // Auto-scroll to bottom of chat
    if (chatEndRef.current) {
      chatEndRef.current.scrollTop = chatEndRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!message.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: message,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setMessage('');
    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          conversation_id: conversationId,
          context: {
            cabinet_count: cabinets?.length || 0,
          },
          wizard_mode: mode === 'wizard',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const data = await response.json();

      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: data.message,
        timestamp: new Date(),
        suggestedActions: data.suggestedActions || [],
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Sorry, I had trouble understanding that. Could you rephrase?',
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartWizard = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/wizard/start`);

      if (!response.ok) {
        throw new Error('Failed to start wizard');
      }

      const data = await response.json();
      setWizardStep(data);
      setIsWizardActive(true);
      setMode('wizard');
    } catch (error) {
      console.error('Wizard error:', error);
      alert('Failed to start wizard. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleWizardNext = async () => {
    if (!wizardStep || !conversationId) return;

    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/wizard/next`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversation_id: conversationId,
          action: 'next',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to advance wizard');
      }

      const data = await response.json();
      setWizardStep(data);
    } catch (error) {
      console.error('Wizard error:', error);
      alert('Failed to advance wizard. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleWizardSelect = async (value: string) => {
    if (!wizardStep || !conversationId) return;

    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/wizard/select`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversation_id: conversationId,
          action: 'select',
          data: { value },
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to make selection');
      }

      const data = await response.json();
      setWizardStep(data);

      // Check if wizard is complete
      if (data.cabinetSummary && onAddCabinet) {
        onAddCabinet(data.cabinetSummary);
        setIsWizardActive(false);
        setMode('chat');
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: `Great! I've created a ${data.cabinetSummary.cabinet_type} cabinet for you. Dimensions: ${data.cabinetSummary.dimensions?.width}"W × ${data.cabinetSummary.dimensions?.height}"H × ${data.cabinetSummary.dimensions?.depth}"D. Estimated cost: $${data.cabinetSummary.estimated_cost}`,
            timestamp: new Date(),
          },
        ]);
      }
    } catch (error) {
      console.error('Wizard error:', error);
      alert('Failed to make selection. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelWizard = async () => {
    setIsWizardActive(false);
    setMode('chat');
    setWizardStep(null);
  };

  const handleActionClick = (action: string) => {
    // Handle suggested action clicks
    const actionMessage: ChatMessage = {
      role: 'user',
      content: action,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, actionMessage]);
    handleSendMessage();
  };

  return (
    <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
      {/* Mode Selection */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white">Design Assistant</h3>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setMode('chat')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              mode === 'chat'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            💬 Chat
          </button>
          <button
            type="button"
            onClick={handleStartWizard}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              mode === 'wizard' || isWizardActive
                ? 'bg-blue-600 text-white'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            📐 Wizard
          </button>
        </div>
      </div>

      {/* Chat Mode */}
      {mode === 'chat' && (
        <div className="space-y-4">
          {/* Chat Messages */}
          <div
            className="space-y-3 max-h-80 overflow-y-auto p-3 bg-slate-900 rounded-lg border border-slate-700"
            ref={chatEndRef}
          >
            {messages.length === 0 && (
              <div className="text-center py-6 text-slate-400">
                <p className="text-sm">Tell me about your cabinet project:</p>
                <ul className="mt-2 text-xs space-y-1">
                  <li>"I need a 36\" base cabinet"</li>
                  <li>"Create a wall cabinet with 3 shelves"</li>
                  <li>"What's the best material for kitchen cabinets?"</li>
                </ul>
              </div>
            )}
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex flex-col ${
                  msg.role === 'user'
                    ? 'items-end'
                    : 'items-start'
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-lg px-3 py-2 ${
                    msg.role === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-700 text-slate-200'
                  }`}
                >
                  <p className="text-sm">{msg.content}</p>
                  {msg.suggestedActions && msg.suggestedActions.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-slate-600">
                      <p className="text-xs text-slate-400 mb-1">Suggested actions:</p>
                      <div className="flex flex-wrap gap-1">
                        {msg.suggestedActions.map((action, actionIdx) => (
                          <button
                            key={actionIdx}
                            type="button"
                            onClick={() => handleActionClick(action)}
                            className="px-2 py-1 bg-slate-600 hover:bg-slate-500 text-slate-200 text-xs rounded transition-colors"
                          >
                            {action}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  {msg.timestamp.toLocaleTimeString()}
                </p>
              </div>
            ))}
            {isLoading && (
              <div className="text-center py-2">
                <p className="text-sm text-slate-400">Thinking...</p>
              </div>
            )}
          </div>


          {/* Input */}
          <div className="flex gap-2">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder="Type your message... (Shift+Enter for new line)"
              className="flex-1 px-4 py-3 bg-slate-700 text-white rounded-lg border border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={handleSendMessage}
              disabled={isLoading || !message.trim()}
              className="px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Send
            </button>
          </div>
        </div>
      )}

      {/* Wizard Mode */}
      {(mode === 'wizard' || isWizardActive) && wizardStep && (
        <div className="space-y-4">
          {/* Wizard Progress */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((step) => (
                <div
                  key={step}
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                    (step === 1 && wizardStep.step === 'cabinet_type') ||
                    (step === 2 && wizardStep.step === 'dimensions') ||
                    (step === 3 && wizardStep.step === 'components') ||
                    (step === 4 && wizardStep.step === 'material') ||
                    (step === 5 && wizardStep.step === 'review')
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-700 text-slate-400'
                  }`}
                >
                  {step}
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={handleCancelWizard}
              className="text-xs text-slate-400 hover:text-slate-300"
            >
              Cancel
            </button>
          </div>

          {/* Wizard Content */}
          <div className="p-4 bg-slate-900 rounded-lg border border-slate-700">
            <p className="text-white text-sm mb-4">{wizardStep.prompt}</p>


            {/* Options */}
            {wizardStep.options && wizardStep.options.length > 0 && (
              <div className="space-y-2">
                {wizardStep.options.map((option, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleWizardSelect(option.value)}
                    disabled={isLoading}
                    className="w-full p-3 bg-slate-700 hover:bg-slate-600 text-left rounded-lg border border-slate-600 hover:border-slate-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div>
                      <div className="font-medium text-white">{option.label}</div>
                      <div className="text-xs text-slate-400">{option.description}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}


            {/* Cabinet Summary (on review step) */}
            {wizardStep.cabinetSummary && (
              <div className="mt-4 p-3 bg-slate-800 rounded border border-slate-600">
                <h4 className="text-sm font-medium text-white mb-2">Cabinet Summary</h4>
                <div className="space-y-1 text-xs">
                  <p><span className="text-slate-400">Type:</span> {wizardStep.cabinetSummary.cabinet_type}</p>
                  <p><span className="text-slate-400">Dimensions:</span> {wizardStep.cabinetSummary.dimensions?.width}"W × {wizardStep.cabinetSummary.dimensions?.height}"H × {wizardStep.cabinetSummary.dimensions?.depth}"D</p>
                  <p><span className="text-slate-400">Material:</span> {wizardStep.cabinetSummary.material?.name}</p>
                  <p><span className="text-slate-400">Components:</span> {wizardStep.cabinetSummary.components?.length} added</p>
                  <p><span className="text-slate-400">Estimated Cost:</span> ${wizardStep.cabinetSummary.estimated_cost}</p>
                </div>
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleWizardNext}
              disabled={isLoading}
              className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Loading...' : 'Next'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
