import puppeteer from 'puppeteer'

import {
  HTML_SELECTORS,
  LINKS,
  COURSE_MAP,
  LOGIN_CREDENTIALS,
  TEE_TIME_PLAYER_SIZE,
  TEE_TIME_DATE,
  TEE_TIME_COURSE,
} from './constants.js'

async function confirmTeeTime(page, size) {
  await selectPlayerSize(page, size)

  await page.waitForSelector(HTML_SELECTORS.CONFIRM_TEE_TIME_BUTTON)

  // if you want to test the bot, comment the line below out so that it won't actually reserve the tee time for you. Bethpage limits the amount of cancellations you can make
  await page.click(HTML_SELECTORS.CONFIRM_TEE_TIME_BUTTON)
}

async function retryPageTillTeeTimeAvailable(page, size) {
  const desiredDate = new Date()
  // hours, minutes, seconds, ms
  // Bethpage releases tee times at 7:00PM which equals 19, 0, 0, 0
  desiredDate.setHours(19, 0, 0, 0)
  const currentDate = new Date()

  if (currentDate >= desiredDate) {
    await page.click(
      `#nav > div > div:nth-child(3) > div > div > a:nth-child(${size})`
    )
    console.log('conditions met')
    await page.waitForSelector(HTML_SELECTORS.FIRST_AVAILABLE_TIME)
    await page.click(HTML_SELECTORS.FIRST_AVAILABLE_TIME)
  }

  if (currentDate < desiredDate) {
    setTimeout(() => {
      console.log('currentDate: ', currentDate)
      console.log('desiredDate: ', desiredDate)
      retryPageTillTeeTimeAvailable(page, size)
    }, 100)
  }
}

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
  const browser = await puppeteer.launch({ headless: false, dumpio: true })
  const page = await browser.newPage()
  await page.setDefaultTimeout(60000)

  // Update LOGIN_CREDENTIALS.EMAIL and LOGIN_CREDENTIALS.PASSWORD in constants.js file to YOUR email and password for Bethpage
  await loginAndNavigateToTeeTimes(page)
  // Modify TEE_TIME_COURSE to the course you want to play. Example: COURSE_MAP.BLACK, other options are listed in constants.js
  // Modify TEE_TIME_DATE to the date that you're trying to reserve on. Format should be "10-23-2024". Modify value in constants.js folder
  await setDateAndCourse(page, TEE_TIME_COURSE, TEE_TIME_DATE)
  // Modify TEE_TIME_PLAYER_SIZE to be the amount of people in your party. Options are '1', '2', '3', '4'. Modify value in constants.js folder
  await retryPageTillTeeTimeAvailable(page, TEE_TIME_PLAYER_SIZE)
  await confirmTeeTime(page, TEE_TIME_PLAYER_SIZE)

  // await browser.close()
}

start()
