import type { User } from '@prisma/client'
import { Service } from '../../common/decorators/service.js'
import { prisma } from '../../common/prisma.js'
import { CONFIG } from '../../constants/config.js'
import { ENV } from '../../constants/env.js'

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
    message: string
  }
}

@Service()
export class CoinIFTService {
  readonly baseURL = ENV.COIN_IFT_API_URL
  readonly type = WhaleAnalysisType

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

  async getWhaleAnalysisAndRecord(user: User, symbol: string, type: WhaleAnalysisType) {
    const response = await this.getWhaleAnalysis(symbol, type)
    const analysisResult = await prisma.userAnalysisResult.create({
      data: {
        userId: user.id,
        symbol,
        type,
        result: response.data.message,
        cost: CONFIG.COST.ANALYSIS,
      },
    })
    return analysisResult
  }
}
