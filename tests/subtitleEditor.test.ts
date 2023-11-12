import { test, expect } from './baseFixtures';
import { Page, Download, Locator } from '@playwright/test';


const baseURL = 'http://localhost:3000/';
const textAreaInputs = ['text1', 'text2', 'text3'];
const timeSegInputs = [{ st: '00:00:10:000', en: '00:00:05:000' }, { st: '00:00:07:000', en: '00:00:11:000' }];
const vttFile = `WEBVTT

00:00.000 --> 00:05.000
text1

00:00.000 --> 00:05.000
text2

`;


test.beforeEach(async ({ page }) => {
  await page.goto(baseURL);
  await page.click('li[role="menuitem"]:has-text("Subtitles")');
  const addButtonLoc = page.getByLabel('Opens a dialog for creating new subtitles');
  await addButtonLoc.click();
  await page.click('div[id="mui-component-select-selectedSubtitle"]');
  const langItem = page.locator('ul[aria-labelledby="select-input-selectedSubtitle"] > li:nth-child(1)');
  await langItem.click();
  await page.click('button[type="submit"]:has-text("Create")');
});

const downloadScenarioHandler = async (page: Page): Promise<Download> => {
  const downloadButton = page.locator('div[role="button"]:has-text("Download")');
  downloadButton.click();
  const down = await page.waitForEvent('download');
  return down;
};

const fillSubtitleTextareas = async (page: Page): Promise<void> => {
  const subtitleList = await page.locator('div[class$="listStyle"] > div > div > div > div').all();
  expect(subtitleList.length).toBe(2);  // there should be 2 textareas, each contained in div element
  for (let indx = 0; indx < subtitleList.length; indx++) {
    const segment = subtitleList[indx].locator("textarea");
    await segment.click();
    await segment.fill(textAreaInputs[indx]);
  }
};

test.describe('Subtitle editor tests', () => {

  test('Download button should download subtitle', async ({ page }) => {
    const down = await downloadScenarioHandler(page);
    expect(await down.failure()).toBe(null);  // No error returned
  });

  test('File should contain subtitle segments', async ({ page }) => {
    await fillSubtitleTextareas(page);

    const down = await downloadScenarioHandler(page);
    expect(await down.failure()).toBe(null);
    const subtitleContent = await down.createReadStream();
    expect(subtitleContent).not.toBe(null);

    await new Promise<boolean>((resolve, reject) => {
      let content = "";
      subtitleContent?.on('readable', () => {
        let chunk = "";
        while ((chunk = subtitleContent.read()) !== null) {
          content += chunk;
        }
      });

      subtitleContent?.on('end', () => {
        console.log(content);
        expect(content).toBe(vttFile);
        resolve(true);
      });

      subtitleContent?.on('error', () => reject(false));
    });
  });

  test('Subtitles should rearrange themselves when changing starttimes', async ({ page }) => {
    await fillSubtitleTextareas(page);
    let segs = await page.locator('div[class$="segmentsListStyle"] > div').all();
    expect(segs.length).toBe(2);
    let commentSeg = await page.locator('div[class$="listStyle"] > div > div > div > div').all();

    // filling intervals
    for (let i = 0, seg: Locator; i < commentSeg.length; i++) {
      seg = commentSeg[i];
      const timeInputs: Locator[] = await seg.locator('div[class$="timeAreaStyle"] > input').all();
      expect(timeInputs.length).toBe(2);
      console.log(await timeInputs[0].inputValue());
      console.log(await timeInputs[1].inputValue());

      await timeInputs[0].clear();
      await timeInputs[0].fill(timeSegInputs[i].st);
      await timeInputs[1].clear();
      await timeInputs[1].fill(timeSegInputs[i].en);
      await timeInputs[1].blur();
    }

    segs = await page.locator('div[class$="segmentsListStyle"] > div').all();
    expect(segs.length).toBe(2);
    commentSeg = await page.locator('div[class$="listStyle"] > div > div > div > div').all();

    for (let i = 0; i < commentSeg.length; i++) {
      const textarea: Locator = commentSeg[i].locator('textarea');
      expect(await textarea.inputValue()).toBe(textAreaInputs[textAreaInputs.length - 2 - i]);  // segments should have changed order
    }

  });

  test('Subtitles should be in correct order on subtitle timeline', async ({page}) => {
    await fillSubtitleTextareas(page);
    const commentSeg = await page.locator('div[class$="listStyle"] > div > div > div > div').all();
    for (let i = 0, seg: Locator; i < commentSeg.length; i++) {
      seg = commentSeg[i];
      const timeInputs: Locator[] = await seg.locator('div[class$="timeAreaStyle"] > input').all();
      expect(timeInputs.length).toBe(2);
      await timeInputs[0].clear();
      await timeInputs[0].fill(timeSegInputs[i].st);
      await timeInputs[1].clear();
      await timeInputs[1].fill(timeSegInputs[i].en);
      await timeInputs[1].blur();
    }

    const subTimeLine = await page.locator('div[class$="segmentsListStyle"] > div').all();
    for (let i = 0; i < subTimeLine.length; i++) {
      const seg = subTimeLine[i].locator('span').first();
      expect(await seg.innerText()).toBe(textAreaInputs[textAreaInputs.length - 2 - i]);
    }
  });
});
