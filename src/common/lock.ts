import { pControl } from '@atp-tools/lib'

export class AsyncLock {
  private readonly locks = new Map<string, Array<() => void>>()

  async lock(key: string, ttl = 60000) {
    const queue = this.locks.get(key) || []
    const { promise, resolve } = pControl()
    queue.push(resolve)
    this.locks.set(key, queue)
    if (queue.length === 1) {
      // 第一个直接获得锁
      resolve()
      // 超时自动释放
      setTimeout(() => this.release(key), ttl)
    }
    return promise
  }

  release(key: string) {
    const queue = this.locks.get(key)
    if (!queue)
      return
    queue.shift() // 当前持有者释放
    if (queue.length > 0) {
      // 下一个获得锁
      (queue[0] as () => void)()
    }
    else {
      this.locks.delete(key)
    }
  }

  async execute<T>(key: string, fn: () => Promise<T>, ttl = 60000) {
    await this.lock(key, ttl)
    try {
      return await fn()
    }
    finally {
      this.release(key)
    }
  }

  static instance = new AsyncLock()
}
