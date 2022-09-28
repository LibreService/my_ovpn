<script setup lang="ts">
import { Component, computed, watch } from 'vue'
import { NTag, NIcon, NTooltip } from 'naive-ui'
import { Certificate20Filled, KeyMultiple20Regular, Key20Regular, Settings20Filled } from '@vicons/fluent'
import { ExchangeAlt } from '@vicons/fa'
import { printKey, printCrt, printTaKey, printDh, abortDh } from '../workerAPI'
import { generatingDH } from '../manager'

const props = defineProps<{
  name: string
  ptr: number | string // C struct pointer or JS content string
  clicked: boolean
  setClicked:(value: boolean) => void
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
  if (props.ptr) {
    return props.clicked ? 'success' : 'info'
  }
  if (type.value === 'dh' && generatingDH.value) {
    return 'warning'
  }
  return 'default'
})

async function download () {
  if (!props.ptr) {
    return
  }
  let text: string
  props.setClicked(true)
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
  if (process.env.NODE_ENV === 'production') {
    const a = document.createElement('a')
    a.href = `data:text/plain;charset=utf-8,${encodeURIComponent(text)}`
    a.download = props.name
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  } else {
    console.log(text)
  }
}

// file regenerated, reset color
watch(() => props.ptr, () => { props.setClicked(false) })

function abort () {
  abortDh()
}
</script>

<template>
  <n-tooltip
    :disabled="tagType !== 'warning'"
    placement="top-end"
  >
    <template #trigger>
      <n-tag
        :bordered="false"
        :style="{ cursor: tagType === 'warning' ? 'auto' : 'pointer' }"
        :disabled="tagType === 'default'"
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
    Click close to abort generation.
  </n-tooltip>
</template>
