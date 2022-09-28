<script setup lang="ts">
import { NA } from 'naive-ui'
import { homepage } from '../../package.json'

const commit = '__COMMIT__'
const commitURL = `${homepage}/commit/${commit}`
const buildDate = '__BUILD_DATE__'
</script>

<template>
  <div class="my-column">
    <p>
      Commit <n-a
        :href="commitURL"
        target="_blank"
      >
        {{ commit.slice(0, 7) }}
      </n-a> · Built at {{ buildDate }}
    </p>
    <p>&copy; 2022 Qijia Liu</p>
    <p>
      This project is <n-a
        href="https://www.gnu.org/philosophy/free-sw"
        target="_blank"
      >
        Free
      </n-a> and
      <n-a
        href="https://opensource.org/osd"
        target="_blank"
      >
        Open Source
      </n-a>
      (<n-a
        href="https://www.gnu.org/licenses/agpl-3.0.html"
        target="_blank"
      >
        AGPLv3
      </n-a>+)
    </p>
  </div>
</template>
