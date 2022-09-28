declare global {
  const Module: {
    onRuntimeInitialized: () => void
    ccall: (name: string, returnType: string, argsType: string[], args: any[]) => any
  }
  type Callback = () => Promise<void>
  type Register = (callback: Callback) => void
}

export {}
