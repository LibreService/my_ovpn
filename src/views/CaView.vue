<script setup lang="ts">
import { ref } from 'vue'
import { NCard, NSteps, NStep, NButton } from 'naive-ui'
import MyCert from '../components/MyCert.vue'
import MyCaFinish from '../components/MyCaFinish.vue'

const Step = {
  Cert: 1,
  Finish: 2
}

const current = ref<number>(Step.Cert)
const generateDisabled = ref<boolean>(false)

let certCallback: Callback

function registerCert (callback: Callback) {
  certCallback = callback
}

async function generate () {
  generateDisabled.value = true
  await certCallback()
  current.value = Step.Finish
  generateDisabled.value = false
}

function updateCurrent (future: number) {
  if (future < current.value) {
    current.value = future
  }
}
</script>

<template>
  <n-card class="my-column">
    <template #header>
      <n-steps
        :current="current"
        @update:current="updateCurrent"
      >
        <n-step title="CA certificate" />
        <n-step title="Finish" />
      </n-steps>
    </template>
    <my-cert
      v-show="current === Step.Cert"
      :register="registerCert"
    />
    <my-ca-finish v-if="current === Step.Finish" />
    <template
      v-if="current === Step.Cert"
      #action
    >
      <div style="display: flex; justify-content: flex-end">
        <n-button
          secondary
          type="success"
          :disabled="generateDisabled"
          @click="generate"
        >
          Generate
        </n-button>
      </div>
    </template>
  </n-card>
</template>
