import { Container } from 'inversify'
import { getRegisteredServices } from '../common/decorators/service.js'
import { ChatGPTService } from './external/chatGPT.js'
import { CoinIFTService } from './external/coinIFT.js'
import { OrderService } from './order/order.service.js'
import { ProductService } from './product/product.service.js'
import { TGBotService } from './tg/tg-bot.service.js'
import { TGPaymentService } from './tg/tg-payment.service.js'
import { UserService } from './user/user.service.js'
import { UsdtPaymentService } from './web3/usdt-payment.service.js'

export const container = new Container()

getRegisteredServices().forEach((service) => {
  container.bind(service).toSelf().inSingletonScope()
})

export const tgBotService = container.get(TGBotService)
export const userService = container.get(UserService)
export const tgPaymentService = container.get(TGPaymentService)
export const orderService = container.get(OrderService)
export const productService = container.get(ProductService)
export const coinIFTService = container.get(CoinIFTService)
export const usdtPaymentService = container.get(UsdtPaymentService)
export const chatGPTService = container.get(ChatGPTService)
