import puppeteer from 'puppeteer'
import {
  HTML_SELECTORS,
  LINKS,
  COURSE_MAP,
  LOGIN_CREDENTIALS,
} from './constants.js'

async function retryPageTillTeeTimeAvailable(page) {}

async function setDateAndCourse(page, course, date) {
  await page.select(HTML_SELECTORS.COURSE_SELECT_DROPDOWN, course)
  await page.select(HTML_SELECTORS.DATE_SELECT_DROPDOWN, date)
}

async function loginAndNavigateToTeeTimes(page) {
  await page.goto(LINKS.BETHPAGE)

  const hrefs1 = await page.evaluate(() =>
    Array.from(document.querySelectorAll('a[href]:nth-child(3)'), (a) =>
      a.getAttribute('href')
    )
  )
  const teeTimesUrl = hrefs1.find((href) =>
    href.includes(LINKS.BP_TEETIMES_PREFIX)
  )

  await page.goto(teeTimesUrl)

  await Promise.all([
    page.click(HTML_SELECTORS.VERIFIED_RESIDENT_BUTTON),
    page.waitForSelector(HTML_SELECTORS.LOGIN_BUTTON),
  ])

  await Promise.all([
    page.click(HTML_SELECTORS.LOGIN_BUTTON),
    page.waitForSelector(HTML_SELECTORS.EMAIL_INPUT),
  ])

  await page.type(HTML_SELECTORS.EMAIL_INPUT, LOGIN_CREDENTIALS.EMAIL)
  await page.type(HTML_SELECTORS.PASSWORD_INPUT, LOGIN_CREDENTIALS.PASSWORD)

  await Promise.all([
    page.click(HTML_SELECTORS.LOGIN_SUBMIT_BUTTON),
    page.waitForSelector(HTML_SELECTORS.TEETIME_FORM),
  ])
}

async function selectPlayerSize(page, size) {
  await page.waitForSelector(
    `#book_time > div > div.modal-body.container-fluid > div.row.js-booking-players-row > div.col-sm-6.col-md-4.js-booking-players > div > a:nth-child(${size})`
  )
  await page.click(
    `#book_time > div > div.modal-body.container-fluid > div.row.js-booking-players-row > div.col-sm-6.col-md-4.js-booking-players > div > a:nth-child(${size})`
  )
}

async function start() {
  const browser = await puppeteer.launch({ headless: false })
  const page = await browser.newPage()

  await loginAndNavigateToTeeTimes(page)
  await setDateAndCourse(page, COURSE_MAP.BLUE, '10-23-2024')

  await page.waitForSelector(HTML_SELECTORS.FIRST_AVAILABLE_TIME)
  await page.click(HTML_SELECTORS.FIRST_AVAILABLE_TIME)

  await selectPlayerSize(page, '4')

  await page.waitForSelector(HTML_SELECTORS.CONFIRM_TEE_TIME_BUTTON)
  // await page.click(HTML_SELECTORS.CONFIRM_TEE_TIME_BUTTON)
  await browser.close()
}

start()
