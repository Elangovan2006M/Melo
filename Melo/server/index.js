// server/index.js

const express = require('express');
const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const cors = require('cors');
const url = require('url');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const BASE_URLS = {
  ta: "https://www.masstamilan.dev",
  ml: "https://mp3chetta.com",
  te: "https://masstelugu.com",
  hi: "https://mp3bhai.com",
};
const DEFAULT_LANG = "ta";

const getBaseUrl = (lang) => {
  return BASE_URLS[lang] || BASE_URLS[DEFAULT_LANG];
};

const BROWSER_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36',
  'Accept-Language': 'en-US,en;q=0.5',
};

const scrapeListByTitle = ($, titleText) => {
  const items = [];
  const h4 = $(`h4.wtitle.cen:contains('${titleText}')`); 
  const list = h4.first().next('ul');

  let selector = 'li > a';
  if (titleText.includes('Latest')) {
    selector = 'li > h3 > a';
  }

  list.find(selector).each((i, el) => {
    const item = $(el);
    const path = item.attr('href');
    if (path) {
      items.push({
        title: item.text().trim(),
        path: url.resolve(getBaseUrl('ta'), path) // Base URL doesn't matter here
      });
    }
  });
  return items;
};

const scrapeGridItems = ($, selector, lang) => {
  const results = [];
  const BASE_URL = getBaseUrl(lang);

  $(selector).each((index, element) => {
    const resultEl = $(element);
    const linkTag = resultEl.find('a');
    
    const pagePath = linkTag.attr('href');

    if (pagePath) {
      const title = linkTag.find('h2').text().trim();
      const imagePath = linkTag.find('img')?.attr('src');
      const details = linkTag.find('p').text().trim().replace(/\s+/g, ' ');

      const pageUrl = url.resolve(BASE_URL, pagePath);
      const imageUrl = imagePath ? url.resolve(BASE_URL, imagePath) : null;

      results.push({
        title,
        pageUrl,
        imageUrl,
        details,
        lang: lang // Add lang for the app to know
      });
    }
  });
  return results;
};

app.get('/search', async (req, res) => {
  const { keyword, lang = DEFAULT_LANG } = req.query;

  if (!keyword) {
    return res.status(400).json({ error: 'Search keyword is required' });
  }

  const BASE_URL = getBaseUrl(lang);
  const searchUrl = `${BASE_URL}/search?keyword=${encodeURIComponent(keyword)}`;
  console.log(`[${lang}] Fetching search results from: ${searchUrl}`);

  let browser = null;

  try {
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();
    await page.setExtraHTTPHeaders(BROWSER_HEADERS);
    await page.goto(searchUrl, { waitUntil: 'networkidle2' });
    await page.waitForSelector('div.a-i', { timeout: 10000 });

    const htmlContent = await page.content();
    await browser.close();

    const $ = cheerio.load(htmlContent);
    const results = scrapeGridItems($, 'div.a-i', lang);

    console.log(`[${lang}] Found ${results.length} results.`);
    res.status(200).json(results);

  } catch (error) {
    if (browser) {
      await browser.close();
    }
  res.status(200).json([])  }
});

app.get('/getAlbumDetails', async (req, res) => {
  const { path, lang = DEFAULT_LANG } = req.query;

  if (!path) {
    return res.status(400).json({ error: 'Album path is required' });
  }
  
  const BASE_URL = getBaseUrl(lang);
  const albumUrl = url.resolve(BASE_URL, path);
  console.log(`[${lang}] Fetching album details from: ${albumUrl}`);

  let browser = null;

  try {
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();
    await page.setExtraHTTPHeaders(BROWSER_HEADERS);
    await page.goto(albumUrl, { waitUntil: 'networkidle2' });
    await page.waitForSelector('#tl', { timeout: 10000 });

    const htmlContent = await page.content();
    await browser.close();

    const $ = cheerio.load(htmlContent);

    const albumTitle = $('header h1').text().trim();
    const albumImage = url.resolve(BASE_URL, $('figure.ib img')?.attr('src'));

    const breadcrumbs = [];
    $('div.bcrumbs span[itemprop="name"]').each((i, el) => {
      breadcrumbs.push($(el).text().trim());
    });

    let scriptText = null;
    $('script').each((i, el) => {
      const text = $(el).html();
      if (text && text.includes('window.albumTracks =')) {
        scriptText = text;
        return false;
      }
    });

    if (!scriptText) {
      throw new Error('Could not find albumTracks script');
    }

    const startIndex = scriptText.indexOf('window.albumTracks =') + 'window.albumTracks ='.length;
    const jsonString = scriptText.substring(
        scriptText.indexOf('[', startIndex),
        scriptText.indexOf(']', startIndex) + 1
    );

    const tracksData = JSON.parse(jsonString);

    const processedTracks = tracksData.map(track => {
      const imgJpg = `/i/${track.img_name}.jpg`;
      
      return {
        id: track.id,
        title: track.name,
        artists: track.artists,
        albumName: track.m_name,
        imageUrl: url.resolve(BASE_URL, imgJpg),
        audioUrl: url.resolve(BASE_URL, track.dl_path),
        lang: lang
      };
    });
    
    res.status(200).json({
      title: albumTitle,
      image: albumImage,
      breadcrumbs: breadcrumbs,
      tracks: processedTracks,
      lang: lang
    });

  } catch (error)
  {
    if (browser) {
      await browser.close();
    }
    res.status(200).json([]);
  }
});

app.get('/getLanguageHomePage', async (req, res) => {
  const { lang = DEFAULT_LANG } = req.query;
  const BASE_URL = getBaseUrl(lang);
  const homePageUrl = BASE_URL;
  console.log(`[${lang}] Fetching home page data from: ${homePageUrl}`);
  
  let browser = null;

  try {
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();
    await page.setExtraHTTPHeaders(BROWSER_HEADERS);
    await page.goto(homePageUrl, { waitUntil: 'networkidle2' });

    await page.waitForSelector('h4.wtitle.cen', { timeout: 10000 });

    const htmlContent = await page.content();
    await browser.close();

    const $ = cheerio.load(htmlContent);
    
    const trending = scrapeListByTitle($, 'Trending at');
    const topDirectors = scrapeListByTitle($, 'Top Music Directors');
    
    res.status(200).json({ trending, topDirectors });

  } catch (error) {
    if (browser) {
      await browser.close();
    }
    res.status(200).json([]);
  }
});

const getLatestGridForLang = async (lang) => {
  const BASE_URL = getBaseUrl(lang);
  console.log(`[${lang}] Fetching latest grid from: ${BASE_URL}`);

  let browser = null;
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    const page = await browser.newPage();
    await page.setExtraHTTPHeaders(BROWSER_HEADERS);
    await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
    await page.waitForSelector('section.bots div.gw', { timeout: 10000 });
    const htmlContent = await page.content();
    await browser.close();

    const $ = cheerio.load(htmlContent);
    const albums = scrapeGridItems($, 'section.bots div.gw div.a-i', lang);
    return albums.slice(0, 10); // Return top 10
  } catch (error) {
    if (browser) {
      await browser.close();
    }
    return []; // Return empty array on failure
  }
};

app.get('/getHomeFeed', async (req, res) => {
  console.log('Fetching 4-language Home Feed...');
  try {
    const [taLatest, mlLatest, teLatest, hiLatest] = await Promise.all([
      getLatestGridForLang('ta'),
      getLatestGridForLang('ml'),
      getLatestGridForLang('te'),
      getLatestGridForLang('hi')
    ]);
    
    res.status(200).json({
      tamil: taLatest,
      malayalam: mlLatest,
      telugu: teLatest,
      hindi: hiLatest
    });
  } catch (error) {
    res.status(200).json([]);
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});