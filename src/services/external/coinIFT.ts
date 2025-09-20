import type { User, UserAnalysisResult } from '@prisma/client'
import { pTimeout } from '@atp-tools/lib'
import { inject } from 'inversify'
import { isExpired } from '../../common/date.js'
import { Service } from '../../common/decorators/service.js'
import { ApiError, ApiErrorCode } from '../../common/errors.js'
import logger from '../../common/logger.js'
import { prisma } from '../../common/prisma.js'
import { CONFIG } from '../../constants/config.js'
import { ENV } from '../../constants/env.js'
import { ChatGPTService } from './chatGPT.js'

export enum WhaleAnalysisType {
  Realtime = 'realtime',
  Intraday = 'intraday',
  Longterm = 'longterm',
}

export interface WhaleAnalysisResponse {
  success: boolean
  data: {
    status: string
    coin_symbol: string
    trading_type: string
    message?: string
  }
}

@Service()
export class CoinIFTService {
  readonly baseURL = ENV.COIN_IFT_API_URL
  readonly type = WhaleAnalysisType
  private cache = new Map<string, UserAnalysisResult>()

  constructor(
    @inject(ChatGPTService)
    private readonly chatGPTService: ChatGPTService,
  ) {}

  isEnoughCost(user: User) {
    if (user.isVip) {
      return true
    }

    return user.coins >= CONFIG.COST.ANALYSIS
  }

  async getWhaleAnalysis(symbol: string, type: WhaleAnalysisType) {
    const response = await fetch(`${this.baseURL}/whale/analysis`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Authorization: `Bearer ${ENV.COINIFT_API_KEY}`,
      },
      body: JSON.stringify({ coin_symbol: symbol, trading_type: type }),
    })
    return response.json() as Promise<WhaleAnalysisResponse>
  }

  private getCacheKey(user: User, symbol: string, type: WhaleAnalysisType, lang: string) {
    return `${user.id}-${symbol}-${type}-${lang}`
  }

  private isExpired(createAt: Date, type: WhaleAnalysisType) {
    switch (type) {
      // 10s缓存
      case WhaleAnalysisType.Realtime:
        return isExpired(createAt, 10)

      // 10min缓存
      case WhaleAnalysisType.Intraday:
        return isExpired(createAt, 600)

      // 10min缓存
      case WhaleAnalysisType.Longterm:
        return isExpired(createAt, 600)
    }
  }

  async getWhaleAnalysisAndRecord(user: User, symbol: string, type: WhaleAnalysisType, lang: string) {
    logger.info(`[CoinIFTService] getWhaleAnalysisAndRecord: ${symbol} ${type}`)

    const cacheKey = this.getCacheKey(user, symbol, type, lang)
    const cachedResult = this.cache.get(cacheKey)
    if (cachedResult && !this.isExpired(cachedResult.createdAt, type)) {
      logger.info(`[CoinIFTService] getWhaleAnalysisAndRecord cached result: ${cachedResult.result}`)
      return cachedResult
    }

    const response = await pTimeout(this.getWhaleAnalysis(symbol, type), 15000)

    let result = response.data.message
    if (!result) {
      throw new ApiError(ApiErrorCode.EXTERNAL_SERVICE_ERROR, 'Failed to get whale analysis')
    }

    // 翻译
    if (lang !== 'zh') {
      result = await this.chatGPTService.translate(result, 'zh', lang)
    }

    // 将en中的Market Maker替换成Whale，不区分大小写
    result = result.replace(/market maker/gi, 'Whale')
    logger.info(`[CoinIFTService] getWhaleAnalysisAndRecord: ${result}`)

    const analysisResult = await prisma.userAnalysisResult.create({
      data: {
        userId: user.id,
        symbol,
        type,
        result,
        cost: CONFIG.COST.ANALYSIS,
        lang,
      },
    })
    this.cache.set(cacheKey, analysisResult)
    return analysisResult
  }
}
