<script setup lang="ts">
import { NAlert, NCode, NCard } from 'naive-ui'
</script>

<template>
  <div>
    <n-alert
      title="Warning"
      type="warning"
    >
      Diffie-Hellman key takes several minutes to generate in browser.
      Consider skipping it and executing code below in terminal.
    </n-alert>
    <n-card style="margin-top: 16px">
      <n-code
        code="openssl dhparam -out dh2048.pem 2048"
        word-wrap
      />
    </n-card>
  </div>
</template>
