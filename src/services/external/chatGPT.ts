import OpenAI from 'openai'
import { Service } from '../../common/decorators/service.js'
import { ENV } from '../../constants/env.js'

@Service()
export class ChatGPTService {
  readonly client = new OpenAI({
    apiKey: ENV.CHATGPT_API_KEY,
    baseURL: ENV.CHATGPT_BASE_URL,
    defaultHeaders: {
      'HTTP-Referer': 'https://www.deeptrade.com',
      'X-Title': 'DeepTradeBot',
    },
  })

  systemPrompt = 'You are a professional translation engine. Please translate text without explanation.'

  async chat(body: Omit<OpenAI.Chat.Completions.ChatCompletionCreateParamsNonStreaming, 'model'> & { model?: string }) {
    const response = await this.client.chat.completions.create({
      model: ENV.CHATGPT_DEFAULT_MODEL,
      ...body,
    })
    return response
  }

  async translate(text: string, source: string, target: string, model?: string) {
    const response = await this.chat({
      model: model ?? ENV.CHATGPT_DEFAULT_MODEL,
      temperature: 0,
      max_tokens: 1000,
      top_p: 1,
      frequency_penalty: 1,
      presence_penalty: 1,
      messages: [
        {
          role: 'system',
          content: this.systemPrompt,
        },
        {
          role: 'user',
          content: `translate from ${source} to ${target}:\n\n${text}`,
        },
      ],
    })
    return response.choices[0]?.message.content ?? ''
  }
}
