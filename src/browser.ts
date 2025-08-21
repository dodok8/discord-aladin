import puppeteer, { Browser } from 'puppeteer'

let browser: Browser | null = null

export async function getBrowser(): Promise<Browser> {
  if (!browser) {
    browser = await puppeteer.launch({
      executablePath: '/usr/bin/chromium-browser',
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    })
  }
  return browser
}

export async function resolveShortUrl(
  shortUrl: string
): Promise<string | null> {
  const browser = await getBrowser()
  const page = await browser.newPage()
  try {
    await page.goto(shortUrl, { waitUntil: 'domcontentloaded' })
    const finalUrl = page.url()
    await page.close()
    return finalUrl
  } catch (e) {
    await page.close()
    return null
  }
}

export async function closeBrowser() {
  if (browser) {
    await browser.close()
    browser = null
  }
}
