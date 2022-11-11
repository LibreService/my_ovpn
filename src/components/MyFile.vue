<script setup lang="ts">
import { Component, ref, computed, watch } from 'vue'
import { NTag, NIcon, NTooltip, NCode } from 'naive-ui'
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

const text = ref<string | undefined>()

const icon = computed<Component>(() => ({
  crt: Certificate20Filled,
  dh: ExchangeAlt,
  ta: Key20Regular,
  rsa: KeyMultiple20Regular,
  conf: Settings20Filled
})[type.value])

const tagType = computed(() => {
  if (text.value) {
    return props.clicked ? 'success' : 'info'
  }
  if (type.value === 'dh' && generatingDH.value) {
    return 'warning'
  }
  return 'default'
})

const disabled = computed(() => tagType.value === 'default')

async function download () {
  if (!text.value) {
    return
  }
  const url = URL.createObjectURL(new Blob([text.value], { type: 'application/octet-stream' }))
  const a = document.createElement('a')
  a.href = url
  a.download = props.name
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

// file regenerated, reset color
watch(() => props.ptr, async ptr => {
  props.setClicked(false)
  if (!ptr) {
    text.value = undefined
    return
  }
  switch (type.value) {
    case 'conf':
      text.value = props.ptr as string
      break
    case 'rsa':
      text.value = await printKey(props.ptr as number)
      break
    case 'crt':
      text.value = await printCrt(props.ptr as number)
      break
    case 'dh':
      text.value = await printDh(props.ptr as number)
      break
    case 'ta':
      text.value = await printTaKey(props.ptr as number)
  }
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
