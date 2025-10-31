/* eslint-disable prettier/prettier */
// src/modules/chatbot/scraper.service.ts
import { Injectable } from '@nestjs/common';
import axios from 'axios';
import * as cheerio from 'cheerio';
import * as puppeteer from 'puppeteer';
import { cleanText } from 'src/utils/text-cleaner';

@Injectable()
export class ScraperService {
  async scrapeWebsite(url: string): Promise<{ title: string; text: string; links: string[] }> {
    try {
      const html = await this.fetchHTML(url);
      const $ = cheerio.load(html);

      const title = $('title').text().trim();
      const text = cleanText($('body').text());
      const links = $('a')
        .map((_, el) => $(el).attr('href'))
        .get()
        .filter(Boolean)
        .filter((href) => !href.startsWith('#'))
        .map((href) => new URL(href, url).toString());

      return { title, text, links };
    } catch (e) {
      console.error('Scrape failed:', e);
      throw e;
    }
  }

  private async fetchHTML(url: string): Promise<string> {
    try {
      const { data } = await axios.get(url, { timeout: 15000 });
      if (data && data.length > 1000) return data;
    } catch (_) {}
    const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
    const html = await page.content();
    await browser.close();
    return html;
  }
}
