const moment = require('moment');
const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');
const util = require('util');

const downloadDir = '/tmp/puppeteer/downloads/';
const setUpBrowser = async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  page.setViewport({ width: 1200, height: 600 });

  function setDownloadBehavior(downloadPath = downloadDir) {
    return page._client.send('Page.setDownloadBehavior', { // eslint-disable-line no-underscore-dangle
      behavior: 'allow',
      downloadPath,
    });
  }

  await setDownloadBehavior();
  return [browser, page];
};

const login = async (page, userId, pin, logger) => {
  await page.goto('https://www.bancsabadell.com/cs/Satellite/SabAtl/Personal/1191332204474/en/');

  const loginForm = await page.$('form[name=myForm]');
  const username = await loginForm.$('input[name=userDNI]');
  const password = await loginForm.$('input[name=pinDNI]');

  logger.info('Logging into Sabadell');
  await username.type(userId);
  await password.type(pin);
  await Promise.all([
    password.press('Enter'),
    page.waitForNavigation({ waitUntil: 'domcontentloaded' }),
  ]);
};

const goToDownloadPage = async (page, logger) => {
  const account = await page.$('.accounts_stage_section .bs-modulo-contenido-producto-anchor a');
  logger.info('Accessing account');
  await Promise.all([
    account.click(),
    page.waitForNavigation({ waitUntil: 'domcontentloaded' }),
  ]);

  const movements = await page.$('.promobgsub td:nth-child(2) li:nth-child(2) a');
  logger.info('Going to file download area');
  await Promise.all([
    movements.click(),
    page.waitForNavigation({ waitUntil: 'domcontentloaded' }),
  ]);
};

const now = () => moment();
const oneMonthAgo = () => moment().subtract(1, 'months');
async function fillDate(el, date, formatString) {
  await el.click({ clickCount: 3 });
  await el.type(date.format(formatString));
}

const downloadRecords = async (page, logger) => {
  const fromDate = oneMonthAgo();
  const toDate = now();

  logger.info('Customising dates for file download');
  await fillDate(await page.$('input[name="dateMovFrom.day"]'), fromDate, 'D');
  await fillDate(await page.$('input[name="dateMovFrom.month"]'), fromDate, 'M');
  await fillDate(await page.$('input[name="dateMovFrom.year"]'), fromDate, 'Y');

  await fillDate(await page.$('input[name="dateMovTo.day"]'), toDate, 'D');
  await fillDate(await page.$('input[name="dateMovTo.month"]'), toDate, 'M');
  await fillDate(await page.$('input[name="dateMovTo.year"]'), toDate, 'Y');

  const form = await page.$('form[name=myForm]');
  const dateRow = await form.$('table > tbody > tr:nth-child(11)');
  await (await dateRow.$('input[name=r1]')).click();
  const textFormat = await form.$('table > tbody > tr:nth-child(18) > td.a12 > input[type="radio"]:nth-child(5)');
  await textFormat.click();
  const accept = await form.$('input[value=Accept]');
  await accept.click();
  logger.info('Waiting for file to download');
  await page.waitFor(10000);
};

const readdirAsync = util.promisify(fs.readdir);
const statAsync = util.promisify(fs.stat);
async function mostRecentFile(directory) {
  const basepath = path.join(directory);
  const files = await readdirAsync(basepath);
  const stats = await Promise.all(
    files.map(filename => statAsync(path.join(basepath, filename))
      .then(stat => ({ filename, stat }))),
  );
  const sortedFiles = stats
    .sort((a, b) => b.stat.mtime.getTime() - a.stat.mtime.getTime())
    .map(stat => stat.filename);

  return sortedFiles[0];
}

exports.records = async (userId, pin, logger) => {
  const [browser, page] = await setUpBrowser();

  await login(page, userId, pin, logger);
  await goToDownloadPage(page, logger);
  await downloadRecords(page, logger);

  const downloadedFile = await mostRecentFile(downloadDir);
  const downloadedFileAbs = path.join(downloadDir, downloadedFile);
  logger.debug(`Downloaded ${downloadedFileAbs}`);
  await browser.close();
  return downloadedFileAbs;
};
