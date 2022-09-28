<script setup lang="ts">
import { NCard, NSpace, NButton } from 'naive-ui'
import { jump } from '../router'
</script>

<template>
  <n-card
    title="You want to set up OpenVPN with minimal configuration. What can I do for you?"
    class="my-column"
  >
    <n-space vertical>
      <n-button
        secondary
        type="info"
        @click="jump('CA')"
      >
        I start from zero, so I need a CA first.
      </n-button>
      <n-button
        secondary
        type="info"
        @click="jump('Server')"
      >
        I want to generate files for server.
      </n-button>
      <n-button
        secondary
        type="info"
        @click="jump('Client')"
      >
        I want to generate files for client.
      </n-button>
    </n-space>
  </n-card>
</template>
