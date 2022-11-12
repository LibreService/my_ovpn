<script setup lang="ts">
import { ref, computed } from 'vue'
import { NCard, NSpace, NSteps, NStep, NButton } from 'naive-ui'
import { isPortrait } from '../util'
import { caKey, updateDH, generatingDH, updateTA } from '../manager'
import MyServerConf from '../components/MyServerConf.vue'
import MyDh from '../components/MyDh.vue'
import MyTa from '../components/MyTa.vue'
import MyCert from '../components/MyCert.vue'
import MyServerFinish from '../components/MyServerFinish.vue'

const Step = {
  DH: 1,
  Cert: 2,
  Conf: 3,
  TA: 4,
  Finish: 5
}

const current = ref<number>(1)

// Use callback to bubble user input
let confCallback: Callback

function registerConf (callback: Callback) {
  confCallback = callback
}

let certCallback: Callback

function registerCert (callback: Callback) {
  certCallback = callback
}

const blockedByDH = computed(() => current.value === Step.DH && generatingDH.value)
const blockedByCA = computed(() => current.value === Step.Cert && !caKey.value)
const actionDisabled = ref<boolean>(false)

async function generate () {
  actionDisabled.value = true
  switch (current.value) {
    case Step.DH:
      updateDH() // slow, async
      break
    case Step.Cert:
      await certCallback()
      break
    case Step.Conf:
      await confCallback()
      break
    case Step.TA:
      await updateTA()
      break
  }
  ++current.value
  actionDisabled.value = false
}

function skip () {
  ++current.value
}

function updateCurrent (future: number) {
  if (actionDisabled.value || future === Step.Finish || future === current.value) {
    return
  }
  current.value = future
}
</script>

<template>
  <n-card class="my-column">
    <div :style="{ display: 'flex', flexDirection: isPortrait ? 'column' : 'row' }">
      <n-steps
        vertical
        :current="current"
        class="vertical-steps"
        @update:current="updateCurrent"
      >
        <n-step title="Diffie-Hellman key" />
        <n-step title="Server certificate" />
        <n-step title="Server configuration" />
        <n-step title="TLS authentication key" />
        <n-step title="Finish" />
      </n-steps>
      <div style="flex-grow: 2; display: flex; justify-content: center">
        <my-dh v-show="current === Step.DH" />
        <my-cert
          v-show="current === Step.Cert"
          :register="registerCert"
        />
        <my-server-conf
          v-show="current === Step.Conf"
          :register="registerConf"
        />
        <my-ta v-show="current === Step.TA" />
        <my-server-finish v-if="current === Step.Finish" />
      </div>
    </div>
    <template
      v-if="current !== Step.Finish"
      #action
    >
      <n-space justify="end">
        <n-button
          secondary
          type="info"
          :disabled="actionDisabled"
          @click="skip"
        >
          Skip
        </n-button>
        <n-button
          secondary
          type="success"
          :disabled="blockedByDH || blockedByCA || actionDisabled"
          @click="generate"
        >
          Generate
        </n-button>
      </n-space>
    </template>
  </n-card>
</template>
