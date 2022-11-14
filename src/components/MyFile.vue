<script setup lang="ts">
import { Component, computed, watch } from 'vue'
import { NTag, NIcon, NTooltip, NCode } from 'naive-ui'
import { Certificate20Filled, KeyMultiple20Regular, Key20Regular, Settings20Filled } from '@vicons/fluent'
import { ExchangeAlt } from '@vicons/fa'
import { printKey, printCrt, printTaKey, printDh, abortDh } from '../workerAPI'
import { generatingDH } from '../manager'
import { downloadBlob } from '../util'

const props = defineProps<{
  name: string
  ptr: number | string // C struct pointer or JS content string
  clicked: boolean
  setClicked:(value: boolean) => void
  text: string
  setText: (value: string) => void
}>()

const type = computed(() => {
  if (props.name.endsWith('crt')) {
    return 'crt'
  }
  if (props.name === 'dh2048.pem') {
    return 'dh'
  }
  if (props.name === 'ta.key') {
    return 'ta'
  }
  if (props.name.endsWith('key')) {
    return 'rsa'
  }
  return 'conf' // server.conf, client.ovpn
})

const icon = computed<Component>(() => ({
  crt: Certificate20Filled,
  dh: ExchangeAlt,
  ta: Key20Regular,
  rsa: KeyMultiple20Regular,
  conf: Settings20Filled
})[type.value])

const tagType = computed(() => {
  if (props.text) {
    return props.clicked ? 'success' : 'info'
  }
  if (type.value === 'dh' && generatingDH.value) {
    return 'warning'
  }
  return 'default'
})

const disabled = computed(() => tagType.value === 'default')

async function download () {
  if (!props.text) {
    return
  }
  downloadBlob(new Blob([props.text], { type: 'application/octet-stream' }), props.name)
  props.setClicked(true)
}

// file regenerated, reset color
watch(() => props.ptr, async ptr => {
  props.setClicked(false)
  let text = ''
  if (ptr) {
    switch (type.value) {
      case 'conf':
        text = props.ptr as string
        break
      case 'rsa':
        text = await printKey(props.ptr as number)
        break
      case 'crt':
        text = await printCrt(props.ptr as number)
        break
      case 'dh':
        text = await printDh(props.ptr as number)
        break
      case 'ta':
        text = await printTaKey(props.ptr as number)
    }
  }
  props.setText(text)
})

function abort () {
  abortDh()
}
</script>

<template>
  <n-tooltip
    :disabled="disabled"
    placement="top-end"
  >
    <template #trigger>
      <n-tag
        :bordered="false"
        :style="{ cursor: tagType === 'warning' ? 'auto' : 'pointer' }"
        :disabled="disabled"
        :closable="tagType === 'warning'"
        :type="tagType"
        @click="download"
        @close="abort"
      >
        <template #icon>
          <n-icon :component="icon" />
        </template>
        {{ name }}
      </n-tag>
    </template>
    <template v-if="tagType === 'warning'">
      Click close to abort generation.
    </template>
    <n-code
      v-else
      :code="text"
    />
  </n-tooltip>
</template>
