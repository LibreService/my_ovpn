import { loadWasm, expose } from '@libreservice/my-worker'

const readyPromise = loadWasm('crypto.js', {
  url: '__LIBRESERVICE_CDN__',
  init () {
    Module.ccall('init', 'null', [], [])
  }
})

expose({
  genKey (): number {
    return Module.ccall('gen_key', 'number', [], [])
  },
  genCaCrt (key: number, CN: string, days: number): number {
    return Module.ccall('gen_ca_crt', 'number', ['number', 'string', 'number'], [key, CN, days])
  },
  genCrt (caKey: number, caCrt: number, key: number, CN: string, days: number): number {
    return Module.ccall('gen_crt', 'number', ['number', 'number', 'number', 'string', 'number'], [caKey, caCrt, key, CN, days])
  },
  genDh (bit: number): number {
    return Module.ccall('gen_dh', 'number', ['number'], [bit])
  },
  genTaKey (): number {
    return Module.ccall('gen_ta_key', 'number', [], [])
  },
  printKey (key: number): string {
    return Module.ccall('print_key', 'string', ['number'], [key])
  },
  printCrt (crt: number): string {
    return Module.ccall('print_crt', 'string', ['number'], [crt])
  },
  printDh (key: number): string {
    return Module.ccall('print_dh', 'string', ['number'], [key])
  },
  printTaKey (key: number): string {
    return Module.ccall('print_ta_key', 'string', ['number'], [key])
  },
  freeKey (key: number): void {
    return Module.ccall('free_key', 'null', ['number'], [key])
  },
  freeCrt (crt: number): void {
    return Module.ccall('free_crt', 'null', ['number'], [crt])
  },
  freeTaKey (key: number): void {
    return Module.ccall('free_ta_key', 'null', ['number'], [key])
  },
  parseKey (buf: Uint8Array, len: number): number {
    return Module.ccall('parse_key', 'number', ['array', 'number'], [buf, len])
  },
  getKeyBits (key: number) {
    return Module.ccall('get_key_bits', 'number', ['number'], [key])
  },
  isKeyValid (key: number) {
    return Module.ccall('is_key_valid', 'number', ['number'], [key])
  },
  parseCrt (buf: Uint8Array, len: number): number {
    return Module.ccall('parse_crt', 'number', ['array', 'number'], [buf, len])
  },
  isCrtExpired (crt: number): number {
    return Module.ccall('is_crt_expired', 'number', ['number'], [crt])
  },
  isCrtValid (crt: number, key: number): number {
    return Module.ccall('is_crt_valid', 'number', ['number', 'number'], [crt, key])
  }
}, readyPromise)
