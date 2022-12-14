<script setup lang="ts">
import { h, ref, computed, VNode } from 'vue'
import { NCard, NSpace, NButton, NText, NUpload, NUploadDragger, useLoadingBar, useNotification, useDialog, useMessage, UploadFileInfo } from 'naive-ui'
import { downloadZip } from 'client-zip'
import MyFile from './MyFile.vue'
import { register, caKey, caCrt, serverKey, serverCrt, serverConf, dh, taKey, clientKey, clientCrt, clientConf } from '../manager'
import { FileName } from '../convention'
import { downloadBlob } from '../util'

const loadingBar = useLoadingBar()
const notification = useNotification()
const dialog = useDialog()
const message = useMessage()

register(loadingBar, notification)

const files = { caKey, caCrt, dh, serverKey, serverCrt, serverConf, taKey, clientKey, clientCrt, clientConf }
type FN = keyof typeof files

const clicked = ref<boolean[]>(new Array(10).fill(false))

function setClicked (i: number) {
  return (value: boolean) => { clicked.value[i] = value }
}

const text = ref<string[]>(new Array(10).fill(''))

function setText (i: number) {
  return (value: string) => { text.value[i] = value }
}

function getText (name: string) {
  return text.value[Object.keys(files).indexOf(name)]
}

function available (name: string) {
  return getText(name) !== ''
}

function count (names: string[]) {
  return names.reduce((prev, current) => prev + +(available(current)), 0)
}

const serverFiles = { caCrt, dh, serverKey, serverCrt, serverConf, taKey }
const clientFiles = { caCrt, taKey, clientKey, clientCrt, clientConf }

const serverZipDisabled = computed(() => count(Object.keys(serverFiles)) < 2)
const clientZipDisabled = computed(() => count(Object.keys(clientFiles)) < 2)

function zipFiles (type: 'server' | 'client') {
  const availableFiles: { name: string, input: string }[] = []
  const missingFiles: FN[] = []
  Object.keys(type === 'server' ? serverFiles : clientFiles).forEach(name => available(name)
    ? availableFiles.push({
      name: FileName[name as FN], input: getText(name)
    })
    : missingFiles.push(name as FN))

  async function download () {
    const blob = await downloadZip(availableFiles).blob()
    downloadBlob(blob, `${type}.zip`)
  }

  if (missingFiles.length) {
    const children: (string | VNode)[] = []
    for (let i = 0; i < missingFiles.length; ++i) {
      if (i > 0) {
        children.push(i === missingFiles.length - 1 ? ' and ' : ', ')
      }
      children.push(h(NText, { code: true }, () => [FileName[missingFiles[i]]]))
    }
    children.push(` ${missingFiles.length === 1 ? 'is' : 'are'} missing. The pack may not work.`)
    dialog.warning({
      title: 'Warning',
      content: () => h('div', children),
      positiveText: 'Proceed',
      onPositiveClick: download
    })
  } else {
    download()
  }
}

const embedDisabled = computed(() => !caCrt.value || !clientKey.value || !clientCrt.value || !clientConf.value)

function embed (taKeyText: string) {
  const conf = getText('clientConf')
  const embedded = conf.replace(`ca ${FileName.caCrt}`, `<ca>\n${getText('caCrt')}</ca>`)
    .replace(`cert ${FileName.clientCrt}`, `<cert>\n${getText('clientCrt')}</cert>`)
    .replace(`key ${FileName.clientKey}`, `<key>\n${getText('clientKey')}</key>`)
    .replace(`tls-auth ${FileName.taKey} 1`, `key-direction 1\n<tls-auth>\n${taKeyText}</tls-auth>`)
  downloadBlob(new Blob([embedded], { type: 'application/octet-stream' }), FileName.clientConf)
}

async function matchTaKey (file: UploadFileInfo) {
  const text = await file.file!.text()
  if (!text.match(/^-----BEGIN OpenVPN Static key V1-----\n([0-9a-f]{32}\n){16}-----END OpenVPN Static key V1-----\n?$/)) {
    return null
  }
  return text[text.length - 1] === '\n' ? text : `${text}\n`
}

function embedClientFiles () {
  if (taKey.value) {
    embed(getText('taKey'))
  } else {
    const dialogReactive = dialog.info({
      title: `${FileName.taKey} is missing`,
      content: () => h(NUpload, {
        defaultUpload: false,
        fileList: [],
        onUpdateFileList: async fileList => {
          const file = fileList[0]
          if (file.name !== FileName.taKey) {
            message.error(`File name must be ${FileName.taKey}`)
            return
          }
          const text = await matchTaKey(file)
          if (!text) {
            message.error(`${FileName.taKey} is in wrong format.`)
            return
          }
          embed(text)
          dialogReactive.destroy()
        }
      }, () => [h(NUploadDragger, () => [
        'Upload ',
        h(NText, {
          code: true
        }, () => [FileName.taKey]),
        ' by clicking or dragging.'
      ])])
    })
  }
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
        :text="text[i]"
        :set-text="setText(i)"
      />
    </n-space>
    <template #action>
      <n-space justify="end">
        <n-button
          secondary
          type="success"
          :disabled="serverZipDisabled"
          @click="zipFiles('server')"
        >
          Zip server files
        </n-button>
        <n-button
          secondary
          type="success"
          :disabled="clientZipDisabled"
          @click="zipFiles('client')"
        >
          Zip client files
        </n-button>
        <n-button
          secondary
          type="success"
          :disabled="embedDisabled"
          @click="embedClientFiles"
        >
          Embed client files
        </n-button>
      </n-space>
    </template>
  </n-card>
</template>
