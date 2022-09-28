import { nodeResolve } from '@rollup/plugin-node-resolve'
import typescript from '@rollup/plugin-typescript'

export default {
  input: 'src/worker.ts',
  output: {
    dir: 'public',
    format: 'iife'
  },
  plugins: [
    nodeResolve(),
    typescript()
  ]
}
