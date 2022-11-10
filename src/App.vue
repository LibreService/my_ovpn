<script setup lang="ts">
import { NConfigProvider, NMessageProvider, NNotificationProvider, NLoadingBarProvider, NH1, darkTheme, useOsTheme } from 'naive-ui'
import { MyHeader, MyLayout } from '@libreservice/my-widget'
import { jump } from './router'
import MyFileList from './components/MyFileList.vue'
import MyFooter from './components/MyFooter.vue'
import MyPwa from './components/MyPwa.vue'
import { isMobile } from './util'
import { homepage } from '../package.json'
import './main.css'

const osThemeRef = useOsTheme()
</script>

<template>
  <my-pwa />
  <n-config-provider :theme="osThemeRef === 'dark' ? darkTheme : null">
    <n-message-provider>
      <n-notification-provider :placement="isMobile ? 'top' : 'top-right'">
        <n-loading-bar-provider>
          <my-layout>
            <template #header>
              <my-header
                icon="/LibreService.svg"
                :homepage="homepage"
              />
            </template>
            <template #content>
              <div
                style="cursor: pointer; text-align: center; margin-top: 16px"
                @click="jump('Main')"
              >
                <n-h1>My OVPN</n-h1>
              </div>
              <router-view v-slot="{ Component }">
                <keep-alive>
                  <component :is="Component" />
                </keep-alive>
              </router-view>
              <my-file-list style="margin-top: 16px" />
            </template>
            <template #footer>
              <my-footer />
            </template>
          </my-layout>
        </n-loading-bar-provider>
      </n-notification-provider>
    </n-message-provider>
  </n-config-provider>
</template>
