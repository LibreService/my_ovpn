<script setup lang="ts">
import { NCard, NSpace, NButton } from 'naive-ui'
import { MoneyOffRound, FastForwardRound, SecurityRound } from '@vicons/material'
import { UserCheck } from '@vicons/fa'
import { BrandOpenSource } from '@vicons/tabler'
import { EyeTrackingOff16Filled } from '@vicons/fluent'
import { MyFeaturePanel } from '@libreservice/my-widget'
import { jump } from '../router'

const features = [
  { icon: MoneyOffRound, title: 'Free of Charge', description: 'Forget about "try a little for free and pay if you need more".' },
  { icon: FastForwardRound, title: 'Fast', description: 'Thanks to Web Assembly, the speed (except for Diffie-Hellman key generation) is comparable to native program.' },
  { icon: UserCheck, title: 'User Friendly', description: 'Minimal clicking and typing to set up OpenVPN on Linux, Windows, macOS, Android and iOS.' },
  { icon: BrandOpenSource, title: 'Open Source', description: 'Every SaaS project under LibreService is Free and Open Source. PRs are welcomed!' },
  { icon: SecurityRound, title: 'Secure', description: 'Your privacy matters! Files won\'t be uploaded. Have doubt? Check Network requests and/or source code.' },
  { icon: EyeTrackingOff16Filled, title: 'No Telemetry', description: 'Don\'t like trackers? Neither do us. Instead, we welcome you to submit an issue if you have problem.' }
]
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
  <my-feature-panel
    :features="features"
    class="my-column"
    style="margin-top: 16px"
  />
</template>
