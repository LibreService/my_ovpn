import { test, expect, Page, Locator } from '@playwright/test'

const baseURL = 'http://localhost:4173/'
const keyRegex = /^-----BEGIN PRIVATE KEY-----[\s\S]+-----END PRIVATE KEY-----\n$/
const crtRegex = /^-----BEGIN CERTIFICATE-----[\s\S]+-----END CERTIFICATE-----\n$/
const taRegex = /^-----BEGIN OpenVPN Static key V1-----\n([0-9a-f]{32}\n){16}-----END OpenVPN Static key V1-----\n$/

function getFileTag (page: Page, name: string) {
  return page.locator('.n-tag', { hasText: name })
}

async function downloadFile (page: Page, locator: Locator, pattern: RegExp) {
  const downloadPromise = page.waitForEvent('download')
  await locator.click()
  const download = await downloadPromise
  const readable = (await download.createReadStream())!.setEncoding('utf-8')
  return new Promise(resolve => readable!.on('data', content => {
    expect(content).toMatch(pattern)
    resolve(null)
  }))
}

function unavailable (page: Page, name: string) {
  return expect(getFileTag(page, name)).toHaveClass(/n-tag--disabled/)
}

async function available (page: Page, name: string, pattern?: RegExp) {
  const locator = getFileTag(page, name)
  await expect(locator).not.toHaveClass(/n-tag--disabled/)
  await locator.hover()
  if (pattern) {
    await expect(page.locator('.n-popover').last()).toHaveText(pattern)
    await downloadFile(page, locator, pattern)
  }
}

async function generate (page: Page, next: string) {
  await page.getByRole('button', { name: 'Generate' }).click()
  return expect(page.getByText(next)).toBeVisible()
}

async function skip (page: Page, next: string) {
  await page.getByRole('button', { name: 'Skip' }).click()
  return expect(page.getByText(next)).toBeVisible()
}

test('test', async ({ page }) => {
  await page.goto(baseURL)

  await page.getByText('I need a CA first').click()
  await expect(page).toHaveURL(`${baseURL}ca`)

  await unavailable(page, 'ca.key')
  await unavailable(page, 'ca.crt')
  await generate(page, "What's next?")
  await available(page, 'ca.key', keyRegex)
  await available(page, 'ca.crt', crtRegex)

  await page.getByText('Generate server files').click()
  await expect(page.getByText('openssl dhparam -out dh2048.pem 2048')).toBeVisible()
  await skip(page, 'Use the CA key and certificate below')
  await unavailable(page, 'dh2048.pem')

  await unavailable(page, 'server.key')
  await unavailable(page, 'server.crt')
  await generate(page, 'Listen on IP')
  await available(page, 'server.key', keyRegex)
  await available(page, 'server.crt', crtRegex)

  await unavailable(page, 'server.conf')
  await generate(page, 'should have a copy of')
  await available(page, 'server.conf')

  await unavailable(page, 'ta.key')
  await generate(page, 'Your server needs')
  await available(page, 'ta.key', taRegex)

  await page.getByText('Generate client files').click()
  await expect(page.getByText('Use the CA key and certificate below')).toBeVisible()
  await unavailable(page, 'client.key')
  await unavailable(page, 'client.crt')
  await generate(page, 'Protocol')
  await available(page, 'client.key', keyRegex)
  await available(page, 'client.crt', crtRegex)

  await page.getByPlaceholder('IP or domain').fill('example.com')
  await unavailable(page, 'client.ovpn')
  await generate(page, 'Each client needs')
  await available(page, 'client.ovpn')
})
