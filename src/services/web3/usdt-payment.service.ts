import type { Hash } from 'viem'
import type { Address } from 'viem/accounts'
import type { Chain } from 'viem/chains'
import { Buffer } from 'node:buffer'
import { AlchemyClient, AlchemyNetwork, EVMBasicClient, EVMToken } from '@atp-tools/evm'
import { HDKey } from '@scure/bip32'
import { mnemonicToSeed } from '@scure/bip39'
import { parseAbi } from 'viem'
import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts'
import { arbitrum, base, bsc, gnosis, mainnet, optimism } from 'viem/chains'
import { Service } from '../../common/decorators/service.js'
import { isDev } from '../../common/is.js'
import { AsyncLock } from '../../common/lock.js'
import { prisma } from '../../common/prisma.js'
import { CONFIG } from '../../constants/config.js'
import { ENV } from '../../constants/env.js'

const ERC20_ABI = parseAbi([
  'event Transfer(address indexed from, address indexed to, uint256 value)',
])

export interface FullChainUSDTPaymentLinkParams {
  orderId: string
  amount: number
  to: Address
  chain: number
  qrcodeType?: 'address' | 'eip681'
  title: string
  expireTime: Date
  lang?: string
}

@Service()
export class UsdtPaymentService {
  readonly evmClient: EVMBasicClient
  constructor() {
    const chain = this.supportChains.get(CONFIG.USDT_PAYMENT_CHAIN_ID)
    this.evmClient = new EVMBasicClient({
      endpoint: AlchemyClient.getAlchemyHttpUrl(this.getAlchemyNetwork(CONFIG.USDT_PAYMENT_CHAIN_ID), ENV.ALCHEMY_API_KEY),
      privateKey: generatePrivateKey(),
      debug: isDev(),
      chain,
    })
  }

  private getAlchemyNetwork(chainId: number) {
    switch (chainId) {
      case mainnet.id:
        return AlchemyNetwork.ETH_MAINNET
      case bsc.id:
        return AlchemyNetwork.BNB_MAINNET
      case base.id:
        return AlchemyNetwork.BASE_MAINNET
      case optimism.id:
        return AlchemyNetwork.OPT_MAINNET
      case arbitrum.id:
        return AlchemyNetwork.ARB_MAINNET
      case gnosis.id:
        return AlchemyNetwork.GNOSIS_MAINNET
    }
    return AlchemyNetwork.ETH_MAINNET
  }

  readonly supportChains = new Map<number, Chain>([
    [mainnet.id, mainnet],
    [bsc.id, bsc],
    [base.id, base],
    [optimism.id, optimism],
    [arbitrum.id, arbitrum],
    [gnosis.id, gnosis],
  ])

  getUSDTAddress(chainId = 1): Address {
    const USDT_MAINNET = '0xdAC17F958D2ee523a2206206994597C13D831ec7'
    const USDT_BASE = '0xfde4C96c8593536E31F229EA8f37b2ADa2699bb2'
    const USDT_POLYGON = '0xc2132D05D31c914a87C6611C10748AEb04B58e8F'
    const USDT_BSC = '0x55d398326f99059ff775485246999027b3197955'
    const USDT_ARBITRUM = '0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9'
    const USDT_AVALANCHE = '0xc7198437980c041c805a1edcba50c1ce5db95118'
    switch (chainId) {
      case 1:
        return USDT_MAINNET
      case 137:
        return USDT_POLYGON
      case 56:
        return USDT_BSC
      case 42161:
        return USDT_ARBITRUM
      case 43114:
        return USDT_AVALANCHE
      case 8453:
        return USDT_BASE
    }
    return USDT_MAINNET
  }

  async getAccount(chainId: number, accountIndex: number) {
    const chain = this.supportChains.get(chainId)
    if (!chain) {
      throw new Error(`Chain ${chainId} is not supported`)
    }

    const seed = await mnemonicToSeed(ENV.MNEMONIC)
    const hdKey = HDKey.fromMasterSeed(seed)
    const path = `m/44'/${chainId}'/0'/0'/${accountIndex}`
    const account = privateKeyToAccount(
      `0x${Buffer.from(hdKey.derive(path).privateKey as Uint8Array).toString('hex')}`,
    )
    return account
  }

  getPaymentLink(fullChainUSDTPaymentLinkParams: FullChainUSDTPaymentLinkParams) {
    const { chain, to, amount, orderId, qrcodeType, title, lang, expireTime } = fullChainUSDTPaymentLinkParams
    const url = new URL('https://fullchain-usdt-pay-fe.pages.dev/')
    url.searchParams.set('orderId', orderId)
    url.searchParams.set('amount', amount.toString())
    url.searchParams.set('to', to)
    url.searchParams.set('chain', chain.toString())
    url.searchParams.set('title', title)
    url.searchParams.set('expireTime', expireTime.getTime().toString())
    if (qrcodeType) {
      url.searchParams.set('qrcodeType', qrcodeType)
    }
    if (lang) {
      url.searchParams.set('lang', lang)
    }
    return url.toString()
  }

  getCurrentBlockNumber(chainId: number) {
    const chain = this.supportChains.get(chainId)
    if (!chain) {
      throw new Error(`Chain ${chainId} is not supported`)
    }

    return this.evmClient.public.getBlockNumber()
  }

  async getTransferEvents(fromBlock: bigint, toBlock?: bigint, to?: Address) {
    return this.evmClient.public.getContractEvents({
      address: this.getUSDTAddress(CONFIG.USDT_PAYMENT_CHAIN_ID),
      fromBlock,
      toBlock,
      eventName: 'Transfer',
      abi: ERC20_ABI,
      args: {
        to,
      },
    })
  }

  async watchTransferEvents(onLog: (from: Address, to: Address, value: bigint, tx: Hash, blockNumber: bigint) => unknown) {
    return this.evmClient.public.watchContractEvent({
      abi: ERC20_ABI,
      address: this.getUSDTAddress(CONFIG.USDT_PAYMENT_CHAIN_ID),
      eventName: 'Transfer',
      onLogs: (logs) => {
        logs.forEach((log) => {
          if (!log.args.from || !log.args.to || !log.args.value) {
            return
          }

          onLog(log.args.from, log.args.to, log.args.value, log.transactionHash, log.blockNumber)
        })
      },
    })
  }

  async getDecimals() {
    const token = await EVMToken.fromAddress(this.evmClient, this.getUSDTAddress(CONFIG.USDT_PAYMENT_CHAIN_ID))
    return token.decimals
  }

  getUsdtPaymentAccountNextIndex() {
    const key = 'usdt-payment-account-next-index'
    return AsyncLock.instance.execute(`usdt-payment-account-index:lock`, async () => {
      const accountIndex = await prisma.telegramMessageSession.findUnique({
        where: {
          key,
        },
        select: {
          value: true,
        },
      })

      await prisma.telegramMessageSession.upsert({
        where: {
          key,
        },
        create: {
          key,
          value: isDev() ? '1' : '10000',
        },
        update: {
          value: (Number(accountIndex?.value) + 1).toString(),
        },
      })

      const index = Number(accountIndex?.value || 0)
      if (isDev()) {
        return index
      }

      // 正式环境添加偏移量
      if (index < 10000) {
        return index + 10000
      }

      return index
    })
  }
}
