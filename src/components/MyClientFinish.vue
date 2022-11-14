<script setup lang="ts">
import { NText } from 'naive-ui'
import { FileName } from '../convention'
</script>

<template>
  <div>
    Each client needs
    <n-text code>
      {{ FileName.caCrt }}
    </n-text>,
    <n-text code>
      {{ FileName.taKey }}
    </n-text>,
    <n-text code>
      {{ FileName.clientKey }}
    </n-text>,
    <n-text code>
      {{ FileName.clientCrt }}
    </n-text>
    and
    <n-text code>
      {{ FileName.clientConf }}
    </n-text>.
  </div>
</template>
