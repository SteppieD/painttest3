'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { MessageBubble } from './message-bubble';
import { ChatInput } from './chat-input';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ChatInterfaceProps {
  companyId: number;
  onQuoteCreated?: (quoteId: string) => void;
}

export function ChatInterface({ 
  companyId, 
  onQuoteCreated
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [quoteData, setQuoteData] = useState<any>(null);
  const [suggestedReplies, setSuggestedReplies] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Initial greeting
  useEffect(() => {
    setMessages([
      {
        role: 'assistant',
        content: "Hi! I'll help you create a professional quote for your customer. What type of painting project are you quoting today?",
        timestamp: new Date()
      }
    ]);
    // Set initial suggested replies
    setSuggestedReplies(['Interior residential', 'Exterior residential', 'Commercial space', 'Single room', 'Whole house', 'Office space']);
  }, []);

  const sendMessage = async (content: string) => {
    // Add user message
    const userMessage: Message = {
      role: 'user',
      content,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setSuggestedReplies([]);

    try {
      // Get company data from localStorage for access code
      const companyData = localStorage.getItem('paintquote_company');
      const company = companyData ? JSON.parse(companyData) : null;
      
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-company-data': JSON.stringify({ 
            id: companyId,
            access_code: company?.accessCode || ''
          })
        },
        body: JSON.stringify({
          message: content,
          sessionId
        })
      });

      let data;
      try {
        const text = await response.text();
        data = JSON.parse(text);
      } catch (parseError) {
        console.error('Failed to parse response:', parseError);
        console.error('Response status:', response.status);
        console.error('Response headers:', response.headers);
        throw new Error(`Server error: ${response.status} - Unable to parse response`);
      }

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send message');
      }

      // Add assistant response
      const assistantMessage: Message = {
        role: 'assistant',
        content: data.response,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, assistantMessage]);

      // Update session and other data
      if (data.sessionId) setSessionId(data.sessionId);
      if (data.suggestedReplies) setSuggestedReplies(data.suggestedReplies);
      
      // Handle quote completion
      if (data.isComplete && data.quoteData) {
        setQuoteData(data.quoteData);
      }

    } catch (error) {
      console.error('Chat error:', error);
      toast({
        title: 'Error',
        description: 'Failed to send message. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createQuote = async () => {
    if (!quoteData) return;

    console.log('[CHAT] Quote data from AI:', quoteData);
    console.log('[CHAT] Pricing structure:', quoteData.pricing);
    
    // Debug: Show what we're about to send
    console.log('[CHAT DEBUG] Creating quote with data:', {
      customerName: quoteData.customerName,
      hasPricing: !!quoteData.pricing,
      pricingKeys: quoteData.pricing ? Object.keys(quoteData.pricing) : 'no pricing',
      pricingStructure: quoteData.pricing
    });

    setIsLoading(true);
    try {
      // Get company data from localStorage for access code
      const companyData = localStorage.getItem('paintquote_company');
      const company = companyData ? JSON.parse(companyData) : null;
      
      // Check if pricing data exists
      if (!quoteData.pricing) {
        console.error('[CHAT] No pricing data in quote:', quoteData);
        toast({
          title: 'Incomplete Quote',
          description: 'The quote is missing pricing information. Please try again.',
          variant: 'destructive'
        });
        return;
      }
      
      const requestBody = {
        companyId: Number(companyId), // Ensure it's a number
        quoteData: {
          customerName: quoteData.customerName || 'Unknown Customer',
          customerEmail: quoteData.customerEmail || null,
          customerPhone: quoteData.customerPhone || null,
          address: quoteData.address || null,
          projectType: quoteData.projectType || 'interior',
          rooms: quoteData.rooms || [],
          roomCount: quoteData.roomCount || 0,
          paintQuality: quoteData.paintQuality || 'better',
          prepWork: quoteData.prepWork || null,
          timeEstimate: quoteData.timeline || null,
          specialRequests: quoteData.specialRequests || null,
          totalCost: quoteData.pricing?.subtotal || quoteData.pricing?.total || 0,
          finalPrice: quoteData.pricing?.total || quoteData.pricing?.subtotal || 0,
          markupPercentage: quoteData.markupPercentage || 30,
          sqft: quoteData.surfaces?.walls || quoteData.measurements?.wallSqft || quoteData.sqft || 0,
          breakdown: {
            materials: quoteData.pricing?.materials?.total || quoteData.pricing?.materials || 0,
            labor: quoteData.pricing?.labor?.total || quoteData.pricing?.labor || 0,
            markup: quoteData.pricing?.markup || 0
          }
        },
        conversationHistory: messages
      };

      console.log('[CHAT] Request body to quotes API:', requestBody);
      console.log('[CHAT] Conversation history length:', messages.length);
      console.log('[CHAT] Request body size:', new Blob([JSON.stringify(requestBody)]).size, 'bytes');
      
      // Limit conversation history to prevent oversized requests
      const limitedMessages = messages.slice(-10); // Keep only last 10 messages
      const finalRequestBody = {
        ...requestBody,
        conversationHistory: limitedMessages
      };

      const response = await fetch('/api/quotes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-company-data': JSON.stringify({ 
            id: companyId,
            access_code: company?.accessCode || ''
          })
        },
        body: JSON.stringify(finalRequestBody)
      });

      let result;
      try {
        const text = await response.text();
        console.log('[CHAT] Quote API response text:', text);
        
        // Handle empty response
        if (!text) {
          console.error('Empty response from quote API');
          throw new Error('Server returned empty response. Check server logs.');
        }
        
        result = JSON.parse(text);
      } catch (parseError) {
        console.error('Failed to parse quote response:', parseError);
        console.error('Response status:', response.status);
        console.error('Response text length:', response.text?.length || 0);
        
        // Check for common server errors
        if (response.status === 500) {
          throw new Error('Server error: Database might not be initialized. Please check /api/diagnose for details.');
        }
        throw new Error(`Failed to parse quote response: ${response.status}`);
      }

      if (!response.ok) {
        console.error('Quote creation error response:', result);
        throw new Error(result.details || result.error || 'Failed to create quote');
      }
      
      toast({
        title: 'Quote Created!',
        description: `Quote ${result.quoteId} has been created successfully.`,
        action: (
          <Button 
            size="sm" 
            onClick={() => router.push(`/dashboard/quotes/${result.quoteId}`)}
          >
            View Quote
          </Button>
        )
      });

      // Navigate to the quote using the quote_id (like Q-2025-00001-1NWTY8)
      if (onQuoteCreated) {
        onQuoteCreated(result.quoteId);
      } else {
        // Small delay to show the toast
        setTimeout(() => {
          router.push(`/dashboard/quotes/${result.quoteId}`);
        }, 1000);
      }

    } catch (error) {
      console.error('Create quote error:', error);
      toast({
        title: 'Error',
        description: 'Failed to create quote. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-full flex-col bg-gray-900/50">
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-transparent to-gray-900/30">
        {messages.map((message, index) => (
          <MessageBubble
            key={index}
            message={message}
          />
        ))}
        {isLoading && (
          <MessageBubble
            message={{ role: 'assistant', content: '' }}
            isTyping
          />
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quote preview */}
      {quoteData && (
        <div className="mx-4 mb-4 p-6 bg-gradient-to-r from-green-500/10 to-emerald-500/10 backdrop-blur-sm rounded-xl border border-green-500/20">
          <div className="flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-green-400 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-green-300 text-lg">
                Quote Ready!
              </h3>
              <p className="text-sm text-green-400/80 mt-1">
                {quoteData.customerName} - {quoteData.address}
              </p>
              
              {/* Quote Breakdown */}
              {quoteData.pricing?.breakdown && (
                <div className="mt-4 space-y-3">
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/10">
                    <h4 className="font-semibold text-sm mb-2 text-white">MATERIALS: ${quoteData.pricing.materials?.total?.toFixed(2)}</h4>
                    <div className="space-y-1 text-sm text-gray-300">
                      {quoteData.pricing.breakdown.primer && (
                        <div>• Primer: {quoteData.pricing.breakdown.primer.gallons} gallons - ${quoteData.pricing.breakdown.primer.cost.toFixed(2)}</div>
                      )}
                      {quoteData.pricing.breakdown.wallPaint && (
                        <div>• Wall Paint: {quoteData.pricing.breakdown.wallPaint.gallons} gallons - ${quoteData.pricing.breakdown.wallPaint.cost.toFixed(2)}</div>
                      )}
                      {quoteData.pricing.breakdown.ceilingPaint && (
                        <div>• Ceiling Paint: {quoteData.pricing.breakdown.ceilingPaint.gallons} gallons - ${quoteData.pricing.breakdown.ceilingPaint.cost.toFixed(2)}</div>
                      )}
                      {quoteData.pricing.breakdown.supplies && (
                        <div>• Supplies: ${quoteData.pricing.breakdown.supplies.toFixed(2)}</div>
                      )}
                    </div>
                  </div>
                  
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/10">
                    <h4 className="font-semibold text-sm mb-2 text-white">LABOR: ${quoteData.pricing.labor?.total?.toFixed(2)}</h4>
                    <div className="space-y-1 text-sm text-gray-300">
                      {quoteData.pricing.breakdown.prepWork && (
                        <div>• Prep work: {quoteData.pricing.breakdown.prepWork.hours} hours - ${quoteData.pricing.breakdown.prepWork.cost.toFixed(2)}</div>
                      )}
                      {quoteData.pricing.breakdown.painting && (
                        <div>• Painting: {quoteData.pricing.breakdown.painting.hours} hours - ${quoteData.pricing.breakdown.painting.cost.toFixed(2)}</div>
                      )}
                    </div>
                  </div>
                </div>
              )}
              
              <div className="mt-4 pt-4 border-t border-green-500/30">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-2xl font-bold text-white">
                      Total: ${quoteData.pricing?.total?.toFixed(2) || '0.00'}
                    </p>
                    {quoteData.pricing?.timeline && (
                      <p className="text-sm text-green-400">
                        Timeline: {quoteData.pricing.timeline}
                      </p>
                    )}
                  </div>
                  <Button
                    onClick={createQuote}
                    disabled={isLoading}
                    size="lg"
                    className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-lg shadow-green-500/25"
                  >
                    Create Quote
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Input area */}
      <ChatInput
        onSendMessage={sendMessage}
        isLoading={isLoading}
        suggestedReplies={suggestedReplies}
        placeholder={
          quoteData 
            ? "Quote is ready! Click 'Create Quote' above."
            : "Type your message..."
        }
      />
    </div>
  );
}