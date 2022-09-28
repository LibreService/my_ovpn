<script setup lang="ts">
import { ref } from 'vue'
import { NCard, NSpace, useLoadingBar, useNotification } from 'naive-ui'
import MyFile from './MyFile.vue'
import { register, caKey, caCrt, serverKey, serverCrt, serverConf, dh, taKey, clientKey, clientCrt, clientConf } from '../manager'
import { FileName } from '../convention'

const loadingBar = useLoadingBar()
const notification = useNotification()

register(loadingBar, notification)

const files = { caKey, caCrt, dh, serverKey, serverCrt, serverConf, taKey, clientKey, clientCrt, clientConf }
const clicked = ref<boolean[]>(new Array(10).fill(false))

function setClicked (i: number) {
  return (value: boolean) => { clicked.value[i] = value }
}
</script>

<template>
  <n-card
    title="Available files"
    class="my-column"
  >
    <n-space>
      <my-file
        v-for="(ptr, name, i) in files"
        :key="i"
        :name="FileName[name]"
        :ptr="ptr.value"
        :clicked="clicked[i]"
        :set-clicked="setClicked(i)"
      />
    </n-space>
  </n-card>
</template>
