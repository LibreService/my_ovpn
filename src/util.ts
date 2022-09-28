import { computed } from 'vue'
import { useBreakpoint } from 'vooks'

const breakpoint = useBreakpoint()
const isPortrait = computed(() => breakpoint.value === 'xs')
const isMobile = computed(() => breakpoint.value === 'xs' || breakpoint.value === 's')

const resetToast = 'Invalid value. Reset to default.'

const ipReg = /^((25[0-5]|(2[0-4]|1\d|[1-9]|)\d)\.?\b){4}$/

function isValidIP (IP: string) {
  return IP.match(ipReg) !== null
}

function getPrivateIPSlash (IP: string) {
  function lsb (n: number) {
    let i = 0
    for (; i < 24; ++i, n >>= 1) {
      if (n & 1) {
        break
      }
    }
    return 32 - i
  }
  if (!isValidIP(IP)) {
    return 0
  }
  const parts = IP.split('.').map(Number)
  if (parts[0] === 10) {
    return lsb((parts[1] << 16) | (parts[2] << 8) | parts[3])
  }
  if ((parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) || (parts[0] === 192 && parts[1] === 168)) {
    return lsb((parts[2] << 8) | parts[3])
  }
  return 0
}

function slash2num (slash: number) {
  const mask = 0xFFFFFFFF
  return (mask << (32 - slash)) & mask
}

function ip2num (IP: string) {
  const parts = IP.split('.').map(Number)
  return (parts[0] << 24) | (parts[1] << 16) | (parts[2] << 8) | parts[3]
}

function num2ip (num: number) {
  return [(num >> 24) & 0xFF, (num >> 16) & 0xFF, (num >> 8) & 0xFF, num & 0xFF].join('.')
}

function slash2mask (slash: number) {
  const mask = slash2num(slash)
  return num2ip(mask)
}

function getPoolStart (IP: string, slash: number) {
  const num = ip2num(IP)
  const mask = slash2num(slash)
  return num2ip(num & mask)
}

function getPoolEnd (IP: string, slash: number) {
  const num = ip2num(IP)
  const mask = slash2num(slash)
  return num2ip((num & mask) | ~mask)
}

function isInPool (IP: string, start: string, end: string) {
  const num = ip2num(IP)
  return ip2num(start) <= num && num <= ip2num(end)
}

export { resetToast, isValidIP, getPrivateIPSlash, slash2mask, getPoolStart, getPoolEnd, isInPool, isPortrait, isMobile }
