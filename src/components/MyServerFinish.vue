<script setup lang="ts">
import { NSpace, NText, NButton } from 'naive-ui'
import { jump } from '../router'
import { FileName } from '../convention'
</script>

<template>
  <n-space vertical>
    <div>
      Your server needs
      <n-text code>
        {{ FileName.caCrt }}
      </n-text>,
      <n-text code>
        {{ FileName.dh }}
      </n-text>,
      <n-text code>
        {{ FileName.serverKey }}
      </n-text>,
      <n-text code>
        {{ FileName.serverCrt }}
      </n-text>,
      <n-text code>
        {{ FileName.serverConf }}
      </n-text>
      and
      <n-text code>
        {{ FileName.taKey }}
      </n-text>.
    </div>
    <div>
      What's next?
    </div>
    <n-button
      type="info"
      @click="jump('Client')"
    >
      Generate client files
    </n-button>
  </n-space>
</template>
