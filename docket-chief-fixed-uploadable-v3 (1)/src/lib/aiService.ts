import { supabase } from '@/lib/supabase'

export type ChatMessage = { role: 'system' | 'user' | 'assistant'; content: string }
export type ChatRequest = { messages: ChatMessage[]; system?: string; model?: string }
export type ChatResponse = { content: string; usage?: any }

export async function legalAiChat(req: ChatRequest): Promise<ChatResponse> {
  const { data, error } = await supabase.functions.invoke('legal-ai-chat', { body: req })
  if (error) {
    console.error('[legal-ai-chat] error', error)
    throw new Error(error.message || 'AI function failed')
  }
  return data as ChatResponse
}
