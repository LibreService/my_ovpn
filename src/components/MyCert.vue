<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { NForm, NFormItem, NInput, NInputNumber, NDatePicker, NUpload, NUploadDragger, NText, NButton, NSpace, UploadFileInfo, useMessage } from 'naive-ui'
import { jump } from '../router'
import { freeKey, freeCrt, parseKey, getKeyBits, isKeyValid, parseCrt, isCrtExpired, isCrtValid } from '../workerAPI'
import { caKey, caCrt, updateCA, updateServer, updateClient } from '../manager'
import { resetToast } from '../util'
import { FileName } from '../convention'

const props = defineProps<{
  register: Register
}>()

const context = useRoute().name as 'CA' | 'Server' | 'Client'

const message = useMessage()
const defaultCn = `OpenVPN-${context}`
const CN = ref<string>(defaultCn)

const msPerDay = 24 * 3600 * 1000
const maxDays = 4000
const defaultDays = 365
const days = ref<number>(defaultDays)

const timestamp = computed({
  get () {
    return Date.now() + days.value * msPerDay
  },
  set (newValue) {
    days.value = Math.ceil((newValue - Date.now()) / msPerDay)
  }
})

function invalidTimeStamp (ts: number) {
  const now = Date.now()
  return ts < now || ts > now + maxDays * msPerDay
}

function checkDays () {
  if (days.value === null) {
    days.value = defaultDays
    message.error(resetToast)
  }
}

const files = ref<UploadFileInfo[]>([])

async function checkFiles (uploadedFiles: UploadFileInfo[]) {
  let keyFile: UploadFileInfo | undefined
  let crtFile: UploadFileInfo | undefined
  let newCaKey: number = 0
  let newCaCrt: number = 0

  function clean () {
    newCaKey && freeKey(newCaKey)
    newCaCrt && freeCrt(newCaCrt)
  }

  for (const file of uploadedFiles) {
    if (file.name === FileName.caKey) {
      if (keyFile) {
        message.error('Need one ca.key.')
        return
      }
      keyFile = file
    } else if (file.name === FileName.caCrt) {
      if (crtFile) {
        message.error('Need one ca.crt.')
        return
      }
      crtFile = file
    } else {
      message.error('File name must be ca.key or ca.crt.')
      return
    }
  }
  if (keyFile) {
    const u8Array = new Uint8Array(await keyFile.file!.arrayBuffer())
    newCaKey = await parseKey(u8Array, u8Array.length)
    if (!newCaKey) {
      message.error('ca.key is in wrong format.')
      return
    }
    const bits = await getKeyBits(newCaKey)
    if (bits !== 2048) {
      message.error('The number of bits of key should be 2048.')
      clean()
      return
    }
    const valid = await isKeyValid(newCaKey)
    if (!valid) {
      message.error('ca.key is invalid.')
      clean()
      return
    }
  }
  if (crtFile) {
    const u8Array = new Uint8Array(await crtFile.file!.arrayBuffer())
    newCaCrt = await parseCrt(u8Array, u8Array.length)
    if (!newCaCrt) {
      message.error('ca.crt is in wrong format.')
      clean()
      return
    }
    const expired = await isCrtExpired(newCaCrt)
    if (expired) {
      message.error('Certificate is expired.')
      clean()
      return
    }
  }
  if (keyFile && crtFile) {
    const valid = await isCrtValid(newCaCrt, newCaKey)
    if (!valid) {
      message.error('ca.key and ca.crt mismatch.')
      clean()
      return
    }
    caKey.value = newCaKey
    caCrt.value = newCaCrt
    files.value = []
    return
  }
  files.value = uploadedFiles
  clean()
}

function certCallback () {
  switch (context) {
    case 'CA':
      return updateCA(CN.value, days.value)
    case 'Server':
      return updateServer(CN.value, days.value)
    case 'Client':
      return updateClient(CN.value, days.value)
  }
}

props.register(certCallback)
</script>

<template>
  <n-form
    label-placement="left"
    label-width="auto"
  >
    <n-form-item label="CN">
      <n-input
        v-model:value="CN"
        class="restrict-width"
        clearable
      />
    </n-form-item>
    <n-form-item label="Valid for">
      <n-input-number
        v-model:value="days"
        :precision="0"
        :min="1"
        :max="maxDays"
        clearable
        class="restrict-width"
        @blur="checkDays"
      >
        <template #suffix>
          day(s)
        </template>
      </n-input-number>
    </n-form-item>
    <n-form-item label="Expire on">
      <n-date-picker
        v-model:value="timestamp"
        :is-date-disabled="invalidTimeStamp"
        :actions="null"
      />
    </n-form-item>
    <n-form-item
      v-if="context !== 'CA'"
      label="CA"
    >
      <template v-if="caKey">
        Use the CA key and certificate below.
      </template>
      <n-space
        v-else
        vertical
      >
        <n-upload
          :default-upload="false"
          :file-list="files"
          @update:file-list="checkFiles"
        >
          <n-upload-dragger>
            Upload <n-text code>
              {{ FileName.caKey }}
            </n-text> and <n-text code>
              {{ FileName.caCrt }}
            </n-text> by clicking or dragging.
          </n-upload-dragger>
        </n-upload>
        <n-button
          secondary
          type="info"
          @click="jump('CA')"
        >
          Don't have a CA? Generate one.
        </n-button>
      </n-space>
    </n-form-item>
  </n-form>
</template>

<style scoped>
.restrict-width {
  max-width: 320px;
}
</style>
