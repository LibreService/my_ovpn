<script setup lang="ts">
import { computed, ref, Ref } from 'vue'
import { NForm, NFormItem, NInput, NInputNumber, NRadioGroup, NRadio, NAutoComplete, NCheckbox, NDynamicInput, NSpace, useMessage } from 'naive-ui'
import { isValidIP, resetToast, getPrivateIPSlash, slash2mask, getPoolStart, getPoolEnd, isInPool, isMobile } from '../util'
import { updateServerConf } from '../manager'
import { FileName } from '../convention'

const labelPlacement = computed(() => isMobile.value ? 'top' : 'left')

const props = defineProps<{
  register: Register
}>()

const message = useMessage()

const listenIP = ref<string | null>(null)

function checkListenIP () {
  if (listenIP.value && !isValidIP(listenIP.value)) {
    listenIP.value = null
    message.error(resetToast)
  }
}

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

const defaultSubnet = '10.8.0.0'
const subnet = ref<string>(defaultSubnet)
const defaultSlash = 24
const minSlash = computed(() => getPrivateIPSlash(subnet.value))
const slash = ref<number>(defaultSlash)
const prefixes = ['10.', '172.', '192.168.']

function makeOptions (ipRef: Ref<string>) {
  return () => prefixes.filter(prefix => prefix.startsWith(ipRef.value) && prefix !== ipRef.value)
}

const subnetOptions = computed(makeOptions(subnet))

function checkSubnet () {
  if (minSlash.value > 30 || minSlash.value < 8) {
    subnet.value = defaultSubnet
    slash.value = defaultSlash
    message.error(resetToast)
    return
  }
  if (slash.value < minSlash.value) {
    slash.value = minSlash.value
  }
}

function checkSlash () {
  if (slash.value === null) {
    slash.value = minSlash.value
    message.error(resetToast)
  }
}

const ipProvider = ref<'OpenVPN' | 'DHCP'>('OpenVPN')
const showServerBridge = computed(() => device.value === 'tap' && ipProvider.value === 'OpenVPN')
const defaultIP = '10.8.0.4'
const IP = ref<string>(defaultIP)
const ipOptions = computed(makeOptions(IP))
const defaultBridgeSlash = 24
const minBridgeSlash = computed(() => IP.value.startsWith('10') ? 8 : 16)
const bridgeSlash = ref<number>(defaultBridgeSlash)
const defaultPoolStart = '10.8.0.50'
const minPoolStart = computed(() => getPoolStart(IP.value, bridgeSlash.value))
const poolStart = ref<string>(defaultPoolStart)
const defaultPoolEnd = '10.8.0.100'
const maxPoolEnd = computed(() => getPoolEnd(IP.value, bridgeSlash.value))
const poolEnd = ref<string>(defaultPoolEnd)

function adjustPoolStart (ipRef: Ref<string>, start: string, end: string) {
  if (!isInPool(ipRef.value, start, end)) {
    ipRef.value = start
  }
}

function adjustPoolEnd (ipRef: Ref<string>, start: string, end: string) {
  if (!isInPool(ipRef.value, start, end)) {
    ipRef.value = end
  }
}

function checkIP () {
  if (getPrivateIPSlash(IP.value) < 8) {
    IP.value = defaultIP
    bridgeSlash.value = defaultBridgeSlash
    poolStart.value = defaultPoolStart
    poolEnd.value = defaultPoolEnd
    message.error(resetToast)
    return
  }
  if (bridgeSlash.value < minBridgeSlash.value) {
    bridgeSlash.value = defaultBridgeSlash
  }
  adjustPoolStart(poolStart, minPoolStart.value, maxPoolEnd.value)
  adjustPoolEnd(poolEnd, minPoolStart.value, maxPoolEnd.value)
}

function checkBridgeSlash () {
  if (bridgeSlash.value === null) {
    bridgeSlash.value = defaultBridgeSlash
  }
  adjustPoolStart(poolStart, minPoolStart.value, maxPoolEnd.value)
  adjustPoolEnd(poolEnd, minPoolStart.value, maxPoolEnd.value)
}

function checkPoolStart () {
  adjustPoolStart(poolStart, minPoolStart.value, poolEnd.value)
}

function checkPoolEnd () {
  adjustPoolEnd(poolEnd, poolStart.value, maxPoolEnd.value)
}

const isGateway = ref<boolean>(false)
const defaultRouteSlash = 32
const routes = ref<{IP: string, slash: number}[]>([])

function checkRoutes () {
  let hasError = false
  for (const route of routes.value) {
    if (route.slash === null) {
      hasError = true
      route.slash = defaultRouteSlash
    }
    if (!isValidIP(route.IP)) {
      console.log(route.IP)
      if (route.IP === '') {
        continue
      }
      hasError = true
      route.IP = ''
    }
  }
  if (hasError) {
    message.error(resetToast)
  }
}

const c2c = ref<boolean>(false)
const unique = ref<boolean>(true)

function confCallback () {
  const conf: string[] = []
  function set (item: string) {
    conf.push(item)
  }
  if (listenIP.value) {
    set(`local ${listenIP.value}`)
  }
  set(`port ${port.value}`)
  set(`proto ${protocol.value}`)
  set(`dev ${device.value}`)
  set(`ca ${FileName.caCrt}`)
  set(`cert ${FileName.serverCrt}`)
  set(`key ${FileName.serverKey}`)
  set(`dh ${FileName.dh}`)
  set('topology subnet')
  if (device.value === 'tun') {
    set(`server ${subnet.value} ${slash2mask(slash.value)}`)
  } else {
    if (ipProvider.value === 'OpenVPN') {
      set(`server-bridge ${IP.value} ${slash2mask(bridgeSlash.value)} ${poolStart.value} ${poolEnd.value}`)
    } else {
      set('server-bridge')
    }
  }
  set('ifconfig-pool-persist /var/log/openvpn/ipp.txt')
  if (isGateway.value) {
    set('push "redirect-gateway def1 bypass-dhcp"')
  } else {
    for (const route of routes.value) {
      if (isValidIP(route.IP)) {
        const mask = slash2mask(route.slash)
        set(`push "route ${route.IP} ${mask}"`)
      }
    }
  }
  if (c2c.value) {
    set('client-to-client')
  }
  if (!unique.value) {
    set('duplicate-cn')
  }
  set('keepalive 10 120')
  set(`tls-auth ${FileName.taKey} 0`)
  set('persist-key')
  set('persist-tun')
  set('status /var/log/openvpn/openvpn-status.log')
  set('verb 3')
  set('explicit-exit-notify 1')
  updateServerConf(conf.join('\n'))
  return Promise.resolve()
}

props.register(confCallback)
</script>

<template>
  <n-form
    :label-placement="labelPlacement"
    label-width="auto"
  >
    <n-form-item label="Listen on IP">
      <n-input
        v-model:value="listenIP"
        placeholder="Blank for all available IPs"
        clearable
        @blur="checkListenIP"
      />
    </n-form-item>
    <n-form-item label="Port">
      <n-input-number
        v-model:value="port"
        :precision="0"
        :min="1"
        :max="65535"
        clearable
        :show-button="false"
        class="input-port"
        placeholder=""
        @blur="checkPort"
      />
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
    <n-form-item
      v-show="device === 'tun'"
      label="Subnet"
    >
      <n-auto-complete
        v-model:value="subnet"
        :get-show="() => true"
        :options="subnetOptions"
        class="input-ip"
        clearable
        @blur="checkSubnet"
      />
      /<n-input-number
        v-model:value="slash"
        placeholder=""
        :precision="0"
        :min="minSlash"
        :max="30"
        class="input-slash"
        :show-button="false"
        clearable
        @blur="checkSlash"
      />
    </n-form-item>
    <n-form-item
      v-show="device === 'tap'"
      label="IP provider"
    >
      <n-radio-group v-model:value="ipProvider">
        <n-radio value="OpenVPN">
          OpenVPN
        </n-radio>
        <n-radio value="DHCP">
          DHCP server
        </n-radio>
      </n-radio-group>
    </n-form-item>
    <n-form-item
      v-show="showServerBridge"
      label="Server IP"
    >
      <n-auto-complete
        v-model:value="IP"
        :get-show="() => true"
        :options="ipOptions"
        class="input-ip"
        clearable
        @blur="checkIP"
      />
    </n-form-item>
    <n-form-item
      v-show="showServerBridge"
      label="Bridge mask"
    >
      /<n-input-number
        v-model:value="bridgeSlash"
        placeholder=""
        :precision="0"
        :min="minBridgeSlash"
        :max="30"
        class="input-slash"
        :show-button="false"
        clearable
        @blur="checkBridgeSlash"
      />
    </n-form-item>
    <n-form-item
      v-show="showServerBridge"
      label="Pool start"
    >
      <n-input
        v-model:value="poolStart"
        class="input-ip"
        clearable
        @blur="checkPoolStart"
      />
    </n-form-item>
    <n-form-item
      v-show="showServerBridge"
      label="Pool end"
    >
      <n-input
        v-model:value="poolEnd"
        class="input-ip"
        clearable
        @blur="checkPoolEnd"
      />
    </n-form-item>
    <n-form-item label="Client route">
      <n-space vertical>
        <n-checkbox v-model:checked="isGateway">
          Default gateway
        </n-checkbox>
        <n-dynamic-input
          v-if="!isGateway"
          v-model:value="routes"
          @create="() => ({ IP: '', slash: defaultRouteSlash })"
        >
          <template #create-button-default>
            Create a route
          </template>
          <template #default="{ value }">
            <div style="display: flex; align-items: center">
              <n-input
                v-model:value="value.IP"
                class="input-ip"
                clearable
                @blur="checkRoutes"
              />
              /<n-input-number
                v-model:value="value.slash"
                placeholder=""
                :precision="0"
                :min="1"
                :max="defaultRouteSlash"
                class="input-slash"
                :show-button="false"
                clearable
                @blur="checkRoutes"
              />
            </div>
          </template>
        </n-dynamic-input>
      </n-space>
    </n-form-item>
    <n-form-item label="Visibility">
      <n-checkbox v-model:checked="c2c">
        Allow client-client communication
      </n-checkbox>
    </n-form-item>
    <n-form-item label="Identification">
      <n-checkbox v-model:checked="unique">
        Require unique certificate/key/CN for each client
      </n-checkbox>
    </n-form-item>
  </n-form>
</template>
