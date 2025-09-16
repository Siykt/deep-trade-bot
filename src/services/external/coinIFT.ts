import { Service } from '../../common/decorators/service.js'

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
  readonly baseURL = 'https://dev.coinift.net/api/external'
  readonly type = WhaleAnalysisType

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
}
