import { supabase } from '@/lib/supabase'

export type ChatMessage = { role: 'system' | 'user' | 'assistant'; content: string }
export type ChatRequest = {
  messages: ChatMessage[]
  system?: string
  model?: string
  provider?: AIProvider
  userIdentifier?: string
}
export type ChatResponse = { content: string; usage?: { prompt_tokens?: number; completion_tokens?: number; total_tokens?: number } }

type AIProvider = 'openai' | 'gemini'

type AIServiceStatus = {
  available: boolean
  provider: string
  message: string
  lastChecked: Date | null
}

type AIServiceResponse = {
  response: string
  provider: string
  error?: 'RATE_LIMITED' | 'SERVICE_UNAVAILABLE' | 'UNKNOWN_ERROR'
}

const PROVIDER_LABELS: Record<AIProvider, string> = {
  openai: 'GPT-4',
  gemini: 'Gemini Pro'
}

const MODEL_MAPPING: Record<AIProvider, string> = {
  openai: 'gpt-4o',
  gemini: 'gemini-pro'
}

let lastStatus: AIServiceStatus = {
  available: true,
  provider: PROVIDER_LABELS.openai,
  message: 'Awaiting status check',
  lastChecked: null
}

export const AIService = {
  async sendMessage(
    messages: ChatMessage[],
    provider: AIProvider,
    userIdentifier: string
  ): Promise<AIServiceResponse> {
    try {
      const request: ChatRequest = {
        messages,
        provider,
        model: MODEL_MAPPING[provider],
        userIdentifier
      }

      const { content } = await legalAiChat(request)

      lastStatus = {
        available: true,
        provider: PROVIDER_LABELS[provider],
        message: 'Operational',
        lastChecked: new Date()
      }

      return {
        response: content,
        provider: PROVIDER_LABELS[provider]
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      const normalizedMessage = errorMessage.toLowerCase()

      let errorCode: AIServiceResponse['error'] = 'UNKNOWN_ERROR'
      let responseMessage =
        "I'm experiencing difficulties responding right now. Please try again shortly."

      if (normalizedMessage.includes('rate limit') || normalizedMessage.includes('429')) {
        errorCode = 'RATE_LIMITED'
        responseMessage =
          'Our AI assistant is temporarily handling a high volume of requests. Please wait a moment and try again.'
      } else if (normalizedMessage.includes('timeout')) {
        errorCode = 'SERVICE_UNAVAILABLE'
        responseMessage =
          'The AI service did not respond in time. Please retry in a few moments.'
      }

      lastStatus = {
        available: false,
        provider: PROVIDER_LABELS[provider],
        message:
          errorCode === 'RATE_LIMITED'
            ? 'Temporarily rate limited'
            : 'Service interruption detected',
        lastChecked: new Date()
      }

      console.error('[AIService] sendMessage failed', err)

      return {
        response: responseMessage,
        provider: PROVIDER_LABELS[provider],
        error: errorCode
      }
    }
  },

  getServiceStatus(): AIServiceStatus {
    if (!lastStatus.lastChecked) {
      return {
        ...lastStatus,
        message: 'Status pending - service not queried yet'
      }
    }

    return lastStatus
  }
}

export async function legalAiChat(req: ChatRequest): Promise<ChatResponse> {
  try {
    const { data, error } = await supabase.functions.invoke('legal-ai-chat', { body: req })
    
    if (error) {
      console.error('[legal-ai-chat] Supabase function error:', error)
      
      // Provide more specific error messages based on the error type
      if (error.message?.includes('404') || error.message?.includes('not found')) {
        throw new Error('Edge function not deployed. Please deploy the legal-ai-chat function to Supabase.')
      }
      if (error.message?.includes('CORS') || error.message?.includes('cors')) {
        throw new Error('CORS error. Check ALLOWED_ORIGINS in edge function environment variables.')
      }
      if (error.message?.includes('unauthorized') || error.message?.includes('401')) {
        throw new Error('Authentication failed. Check Supabase configuration.')
      }
      
      throw new Error(`Edge function error: ${error.message || 'Unknown error'}`)
    }
    
    if (!data) {
      throw new Error('No response from edge function')
    }
    
    return data as ChatResponse
  } catch (err) {
    console.error('[legal-ai-chat] Request failed:', err)
    
    // If it's already our custom error, rethrow it
    if (err instanceof Error && err.message.includes('Edge function')) {
      throw err
    }
    
    // Otherwise, wrap it with more context
    const message = err instanceof Error ? err.message : 'Unknown error'
    throw new Error(`Failed to send request to Edge Function: ${message}`)
  }
}
