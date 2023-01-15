import { nodeResolve } from '@rollup/plugin-node-resolve'
import typescript from '@rollup/plugin-typescript'
import replace from '@rollup/plugin-replace'

export default {
  input: 'src/worker.ts',
  output: {
    dir: 'public',
    format: 'iife'
  },
  plugins: [
    replace({
      __LIBRESERVICE_CDN__: process.env.LIBRESERVICE_CDN || ''
    }),
    nodeResolve(),
    typescript()
  ]
}
