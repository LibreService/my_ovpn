import { LambdaWorker } from '@libreservice/my-worker'

const workerURL = './worker.js'
const worker = new LambdaWorker(workerURL)

const genKey: () => Promise<number> = worker.register('genKey')
const genCaCrt: (key: number, CN: string, days: number) => Promise<number> = worker.register('genCaCrt')
const genCrt: (caKey: number, caCrt: number, key: number, CN: string, days: number) => Promise<number> = worker.register('genCrt')
const genTaKey: () => Promise<number> = worker.register('genTaKey')

const printKey: (key: number) => Promise<string> = worker.register('printKey')
const printCrt: (crt: number) => Promise<string> = worker.register('printCrt')
const printTaKey: (key: number) => Promise<string> = worker.register('printTaKey')

const freeKey: (key: number) => Promise<void> = worker.register('freeKey')
const freeCrt: (crt: number) => Promise<void> = worker.register('freeCrt')
const freeTaKey: (key: number) => Promise<void> = worker.register('freeTaKey')

const parseKey: (buf: Uint8Array, len: number) => Promise<number> = worker.register('parseKey')
const getKeyBits: (key: number) => Promise<number> = worker.register('getKeyBits')
const isKeyValid: (key: number) => Promise<number> = worker.register('isKeyValid')
const parseCrt: (buf: Uint8Array, len: number) => Promise<number> = worker.register('parseCrt')
const isCrtExpired: (crt: number) => Promise<number> = worker.register('isCrtExpired')
const isCrtValid: (crt: number, key: number) => Promise<number> = worker.register('isCrtValid')

// Diffie-Hellman key takes a long time to generate, so use a separate worker.
const dhWorker = new LambdaWorker(workerURL)
const genDh: (bit: number) => Promise<number> = dhWorker.register('genDh')
const printDh: (key: number) => Promise<string> = dhWorker.register('printDh')
const freeDh: (key: number) => Promise<void> = dhWorker.register('freeKey') // same C implementation
const abortDh = () => dhWorker.skip()

export { genKey, genCaCrt, genCrt, genTaKey, genDh, printKey, printCrt, printTaKey, printDh, freeKey, freeCrt, freeTaKey, freeDh, abortDh, parseKey, getKeyBits, isKeyValid, parseCrt, isCrtExpired, isCrtValid }
