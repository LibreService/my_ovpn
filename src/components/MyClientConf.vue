<script setup lang="ts">
import { ref, computed } from 'vue'
import { NForm, NFormItem, NInput, NInputNumber, NRadioGroup, NRadio, NSpace, useMessage } from 'naive-ui'
import { resetToast, isMobile } from '../util'
import { updateClientConf } from '../manager'
import { FileName } from '../convention'

const labelPlacement = computed(() => isMobile.value ? 'top' : 'left')

const props = defineProps<{
  register: Register
}>()

const message = useMessage()

const address = ref<string | null>(null)

const defaultPort = 1194
const port = ref<number>(defaultPort)

function checkPort () {
  if (port.value === null) {
    port.value = defaultPort
    message.error(resetToast)
  }
}

const protocol = ref<'udp' | 'tcp'>('udp')

const device = ref<'tun' | 'tap'>('tun')

function confCallback () {
  if (!address.value) {
    message.error('Server address should be IP or domain.')
    return Promise.reject(new Error())
  }
  const conf: string[] = []
  function set (item: string) {
    conf.push(item)
  }
  set('client')
  set(`proto ${protocol.value}`)
  set(`dev ${device.value}`)
  set(`remote ${address.value} ${port.value}`)
  set('resolv-retry infinite')
  set('nobind')
  set('persist-key')
  set('persist-tun')
  set(`ca ${FileName.caCrt}`)
  set(`cert ${FileName.clientCrt}`)
  set(`key ${FileName.clientKey}`)
  set(`tls-auth ${FileName.taKey} 1`)
  set('cipher AES-256-CBC')
  set('verb 3')
  updateClientConf(conf.join('\n'))
  return Promise.resolve()
}

props.register(confCallback)
</script>

<template>
  <n-form
    :label-placement="labelPlacement"
    label-width="auto"
  >
    <n-form-item label="Server">
      <n-space :vertical="isMobile">
        <n-input
          v-model:value="address"
          clearable
          placeholder="IP or domain"
        />
        <n-input-number
          v-model:value="port"
          :precision="0"
          :min="1"
          :max="65535"
          clearable
          :show-button="false"
          class="input-port"
          placeholder="Port"
          @blur="checkPort"
        />
      </n-space>
    </n-form-item>
    <n-form-item label="Protocol">
      <n-radio-group v-model:value="protocol">
        <n-radio value="udp">
          UDP
        </n-radio>
        <n-radio value="tcp">
          TCP
        </n-radio>
      </n-radio-group>
    </n-form-item>
    <n-form-item label="Layer">
      <n-radio-group v-model:value="device">
        <n-radio value="tun">
          IP (TUN)
        </n-radio>
        <n-radio value="tap">
          Ethernet (TAP)
        </n-radio>
      </n-radio-group>
    </n-form-item>
  </n-form>
</template>
