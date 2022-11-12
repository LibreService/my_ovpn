import { ref } from 'vue'
import { useLoadingBar, useNotification } from 'naive-ui'
import { genKey, genCaCrt, genCrt, genTaKey, genDh, freeKey, freeCrt, freeTaKey, freeDh } from './workerAPI'

const DH_BIT_DEV = 1024
const DH_BIT_PROD = 2048
const dhBit = process.env.NODE_ENV === 'production' ? DH_BIT_PROD : DH_BIT_DEV

let loadingBar: ReturnType<typeof useLoadingBar>
let notification: ReturnType<typeof useNotification>

function register (lb: ReturnType<typeof useLoadingBar>, ntf: ReturnType<typeof useNotification>) {
  loadingBar = lb
  notification = ntf
}

const caKey = ref<number>(0)
const caCrt = ref<number>(0)

const serverKey = ref<number>(0)
const serverCrt = ref<number>(0)
const serverConf = ref<string | 0>(0)
const dh = ref<number>(0)
const taKey = ref<number>(0)

const clientKey = ref<number>(0)
const clientCrt = ref<number>(0)
const clientConf = ref<string | 0>(0)

async function updateCA (CN: string, days: number) {
  loadingBar.start()
  if (caKey.value) {
    await freeKey(caKey.value)
    await freeCrt(caCrt.value)
    caKey.value = caCrt.value = 0
  }
  caKey.value = await genKey()
  caCrt.value = await genCaCrt(caKey.value, CN, days)
  loadingBar.finish()
}

function updateServerConf (conf: string) {
  serverConf.value = conf
}

const generatingDH = ref<boolean>(false)

async function updateDH () {
  if (dh.value) {
    await freeDh(dh.value)
    dh.value = 0
  }
  const generating = notification.info({
    title: 'Please wait ...',
    content: 'Generating Diffie-Hellman key in background.',
    duration: 8000
  })
  generatingDH.value = true
  await genDh(dhBit).then(ptr => {
    dh.value = ptr
    generating.destroy()
    notification.success({
      title: 'Success',
      content: 'Diffie-Hellman key generated.',
      duration: 5000
    })
  }).catch(() => {
    generating.destroy()
    notification.error({
      title: 'Aborted',
      content: 'Diffie-Hellman key generation aborted.',
      duration: 5000
    })
  })
  generatingDH.value = false
}

async function updateTA () {
  if (taKey.value) {
    await freeTaKey(taKey.value)
    taKey.value = 0
  }
  taKey.value = await genTaKey()
}

async function updateServer (CN: string, days: number) {
  loadingBar.start()
  if (serverKey.value) {
    await freeKey(serverKey.value)
    await freeCrt(serverCrt.value)
    serverKey.value = serverCrt.value = 0
  }
  serverKey.value = await genKey()
  serverCrt.value = await genCrt(caKey.value, caCrt.value, serverKey.value, CN, days)
  loadingBar.finish()
}

async function updateClient (CN: string, days: number) {
  loadingBar.start()
  if (clientKey.value) {
    await freeKey(clientKey.value)
    await freeCrt(clientCrt.value)
    clientKey.value = clientCrt.value = 0
  }
  clientKey.value = await genKey()
  clientCrt.value = await genCrt(caKey.value, caCrt.value, clientKey.value, CN, days)
  loadingBar.finish()
}

function updateClientConf (conf: string) {
  clientConf.value = conf
}

export { register, caKey, caCrt, serverKey, serverCrt, serverConf, dh, taKey, clientKey, clientCrt, clientConf, updateCA, updateServerConf, updateDH, generatingDH, updateTA, updateServer, updateClient, updateClientConf }
