import { supabase } from '@/lib/supabase'

export type ChatMessage = { role: 'system' | 'user' | 'assistant'; content: string }
export type ChatRequest = {
  messages: ChatMessage[]
  system?: string
  model?: string
  provider?: AIProvider
  userIdentifier?: string
}
export type ChatResponse = { content: string; usage?: any }

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
  const { data, error } = await supabase.functions.invoke('legal-ai-chat', { body: req })
  if (error) {
    console.error('[legal-ai-chat] error', error)
    throw new Error(error.message || 'AI function failed')
  }
  return data as ChatResponse
}
