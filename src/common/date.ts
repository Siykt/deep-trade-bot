import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime.js'
import utc from 'dayjs/plugin/utc.js'

dayjs.extend(utc)
dayjs.extend(relativeTime)

export function utcNow(date?: Date | number) {
  return dayjs(date).utc()
}

export function formatRelativeTime(date: Date | number) {
  return utcNow(date).fromNow()
}

export function formatTime(date: Date | number) {
  return utcNow(date).format('YYYY-MM-DD HH:mm:ss')
}

export function isBefore(date: Date | number) {
  return dayjs().isBefore(dayjs(date))
}

export function isAfter(date: Date | number) {
  return dayjs().isAfter(dayjs(date))
}

export function isExpired(date: Date | number, seconds: number) {
  return dayjs().isAfter(dayjs(date).add(seconds, 'seconds'))
}
