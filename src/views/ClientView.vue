<script setup lang="ts">
import { ref, computed } from 'vue'
import { NCard, NSpace, NSteps, NStep, NButton } from 'naive-ui'
import { isPortrait } from '../util'
import { caKey } from '../manager'
import MyCert from '../components/MyCert.vue'
import MyClientConf from '../components/MyClientConf.vue'
import MyClientFinish from '../components/MyClientFinish.vue'

const Step = {
  Cert: 1,
  Conf: 2,
  Finish: 3
}

const current = ref<number>(1)

let confCallback: Callback

function registerConf (callback: Callback) {
  confCallback = callback
}

let certCallback: Callback

function registerCert (callback: Callback) {
  certCallback = callback
}

const blockedByCA = computed(() => current.value === Step.Cert && !caKey.value)
const actionDisabled = ref<boolean>(false)

async function generate () {
  actionDisabled.value = true
  switch (current.value) {
    case Step.Cert:
      await certCallback()
      ++current.value
      break
    case Step.Conf:
      await confCallback().then(() => {
        ++current.value
      }).catch(() => {})
      break
  }
  actionDisabled.value = false
}

function skip () {
  ++current.value
}

function updateCurrent (future: number) {
  if (actionDisabled.value || future === Step.Finish) {
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
        <n-step title="Client certificate" />
        <n-step title="Client configuration" />
        <n-step title="Finish" />
      </n-steps>
      <div style="flex-grow: 2; display: flex; justify-content: center">
        <my-cert
          v-show="current === Step.Cert"
          :register="registerCert"
        />
        <my-client-conf
          v-show="current === Step.Conf"
          :register="registerConf"
        />
        <my-client-finish v-show="current === Step.Finish" />
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
          :disabled="blockedByCA || actionDisabled"
          @click="generate"
        >
          Generate
        </n-button>
      </n-space>
    </template>
  </n-card>
</template>
