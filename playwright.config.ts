import type { PlaywrightTestConfig } from '@playwright/test'

const config: PlaywrightTestConfig = {
  projects: [{
    // Firefox slow https://github.com/microsoft/playwright/issues/11102
    name: 'chromium',
    use: {
      browserName: 'chromium',
    },
  }, {
    name: 'webkit',
    use: {
      browserName: 'webkit',
    }
  }],
  webServer: {
    command: 'pnpm run preview',
    port: 4173,
    reuseExistingServer: true
  }
}

export default config
