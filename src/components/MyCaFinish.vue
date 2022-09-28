<script setup lang="ts">
import { NSpace, NText, NButton } from 'naive-ui'
import { jump } from '../router'
import { FileName } from '../convention'
</script>

<template>
  <n-space vertical>
    <div>
      You may download generated
      <n-text code>
        {{ FileName.caKey }}
      </n-text>
      and
      <n-text code>
        {{ FileName.caCrt }}
      </n-text>
      below.
    </div>
    <div>
      What's next?
    </div>
    <n-button
      type="info"
      @click="jump('Server')"
    >
      Generate server files
    </n-button>
    <n-button
      type="info"
      @click="jump('Client')"
    >
      Generate client files
    </n-button>
  </n-space>
</template>
