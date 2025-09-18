import type { Hash } from 'viem'
import type { Address } from 'viem/accounts'
import type { Chain } from 'viem/chains'
import { Buffer } from 'node:buffer'
import { AlchemyClient, AlchemyNetwork, EVMBasicClient } from '@atp-tools/evm'
import { HDKey } from '@scure/bip32'
import { mnemonicToSeed } from '@scure/bip39'
import { parseAbi } from 'viem'
import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts'
import { arbitrum, base, bsc, gnosis, mainnet, optimism } from 'viem/chains'
import { Service } from '../../common/decorators/service.js'
import { isDev } from '../../common/is.js'
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
  lang?: string
}

@Service()
export class UsdtPaymentService {
  readonly evmClient = new EVMBasicClient({
    endpoint: AlchemyClient.getAlchemyHttpUrl(AlchemyNetwork.BASE_MAINNET, ENV.ALCHEMY_API_KEY),
    privateKey: generatePrivateKey(),
    debug: isDev(),
  })

  readonly supportChains = new Map<number, Chain>([
    [mainnet.id, mainnet],
    [bsc.id, bsc],
    [base.id, base],
    [optimism.id, optimism],
    [arbitrum.id, arbitrum],
    [gnosis.id, gnosis],
  ])

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
    const { chain, to, amount, orderId, qrcodeType, title, lang } = fullChainUSDTPaymentLinkParams
    const url = new URL('https://fullchain-usdt-pay-fe.pages.dev/')
    url.searchParams.set('orderId', orderId)
    url.searchParams.set('amount', amount.toString())
    url.searchParams.set('to', to)
    url.searchParams.set('chain', chain.toString())
    url.searchParams.set('title', title)
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

  async getTransferEvents(fromBlock: bigint, toBlock?: bigint) {
    return this.evmClient.public.getContractEvents({
      address: '0xfde4C96c8593536E31F229EA8f37b2ADa2699bb2',
      fromBlock,
      toBlock,
      eventName: 'Transfer',
      abi: ERC20_ABI,
    })
  }

  async watchTransferEvents(onLog: (from: Address, to: Address, value: bigint, tx: Hash, blockNumber: bigint) => unknown) {
    return this.evmClient.public.watchContractEvent({
      abi: ERC20_ABI,
      address: '0xfde4C96c8593536E31F229EA8f37b2ADa2699bb2',
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
}
