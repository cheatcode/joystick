import fs from "fs";
import dayjs from 'dayjs';
import crypto from 'crypto';
import ssr from "../../ssr/index.js";
import { isObject } from "../../validation/lib/typeValidators";
import settings from "../../settings";
import generateErrorPage from "../../lib/generateErrorPage.js";
import replaceFileProtocol from '../../lib/replaceFileProtocol.js';
import replaceBackslashesWithForwardSlashes from '../../lib/replaceBackslashesWithForwardSlashes.js';
import getBuildPath from "../../lib/getBuildPath.js";

const generateHash = (input = '') => {
  return crypto.createHash('sha256').update(input).digest('hex');
};

const getCacheDiff = async (diffFunction = null) => {
  if (diffFunction) {
    const diff = await diffFunction();
    // NOTE: Assume we receive the diff response as a string. This string could be stringified JSON, plain text etc.
    // We don't care as we're just going to blind hash it and later, compare the hashes to verify difference.
    const diffHash = typeof diff === 'string' ? generateHash(diff) : null;
    return diffHash;
  }

  return null;
};

const writeCacheFileToDisk = ({
  expiresAfterMinutes = '',
  cachePath = '',
  cacheFileName = 'index', // NOTE: If we don't get a cacheFileName, we're rendering the / index path.
  currentDiff = null,
  html = ''
}) => {
  const expiresAt = dayjs().add(expiresAfterMinutes, 'minutes').unix();

  fs.mkdir(`${cachePath}/_cache`, { recursive: true }, () => {
    fs.writeFile(`${cachePath}/_cache/${cacheFileName}_${expiresAt}.html`, html, (error) => {
      if (error) {
        console.warn(error);
      }
    });

    if (currentDiff) {
      fs.writeFile(`${cachePath}/_cache/diff_${expiresAt}`, currentDiff, (error) => {
        if (error) {
          console.warn(error);
        }
      });
    }
  })
};

const getCachedHTML = ({ cachePath, cacheFileName, currentDiff }) => {
  const files = fs.existsSync(`${cachePath}/_cache`) ? fs.readdirSync(`${cachePath}/_cache`) : [];
  const cacheFile = files?.find((file) => file?.includes(cacheFileName));
  const cacheFileExpiresAtUnix = cacheFile?.replace(`${cacheFileName}_`, '').replace('.html', '');
  const existingDiff = fs.existsSync(`${cachePath}/_cache/diff_${cacheFileExpiresAtUnix}`) ? fs.readFileSync(`${cachePath}/_cache/diff_${cacheFileExpiresAtUnix}`, 'utf-8') : null;
  const cacheFileDiffHasChanged = existingDiff !== currentDiff;
  const cacheFileExpiresAtHasPassed = dayjs().isAfter(dayjs.unix(parseInt(cacheFileExpiresAtUnix)));
  const cacheFileHasExpired = cacheFileDiffHasChanged || cacheFileExpiresAtHasPassed;

  if (cacheFileDiffHasChanged || cacheFileExpiresAtHasPassed) {
    fs.unlink(`${cachePath}/_cache/${cacheFile}`, (error) => { if (error) return; });
    fs.unlink(`${cachePath}/_cache/diff_${cacheFileExpiresAtUnix}`, (error) => { if (error) return; });
  }

  return cacheFile && !cacheFileHasExpired ? fs.readFileSync(`${cachePath}/_cache/${cacheFile}`, 'utf-8') : null;
};

const getUrl = (request = {}) => {
  const [path = null] = request.url?.split('?');

  return {
    params: request.params,
    query: request.query,
    route: request.route.path,
    path,
  };
};

const getFile = async (buildPath = "") => {  
  const file = await import(buildPath);
  return file.default;
};

const getTranslationsFile = async (languageFilePath = '', paths = '') => {
  const languageFile = await getFile(`${paths.build}/i18n/${languageFilePath}`);
  const isValidLanguageFile = languageFile && isObject(languageFile);

  if (isValidLanguageFile) {
    const translationsForPage = languageFile[paths.page];
    return translationsForPage ? translationsForPage : languageFile;
  }

  return {};
};

const getTranslations = async (paths = {}, languagePreferences = []) => {
  const languageFiles = fs.readdirSync(`${paths.build}/i18n`);

  let matchingFile = null;

  for (let i = 0; i < languagePreferences.length; i += 1) {
    const languageRegex = languagePreferences[i];
    const match = languageFiles.find((languageFile) => !!languageFile.match(languageRegex));

    if (match) {
      matchingFile = match;
      break;
    }
  }

  
  const translationsFile = await getTranslationsFile(matchingFile, paths);

  return translationsFile;
};

const getLanguagePreferenceRegexes = (userLanguage = '', browserLanguages = []) => {
  let languagePreferences = [];

  if (userLanguage) {
    languagePreferences.push(userLanguage);
  }

  const filteredBrowserLanguages = browserLanguages?.filter((language) => {
    return !language?.includes('*');
  });

  languagePreferences.push(...filteredBrowserLanguages);
  languagePreferences.push(settings?.config?.i18n?.defaultLanguage);

  return languagePreferences?.flatMap((language) => {
    const variants = [language];
  
    if (language?.length === 2) {
      variants.push(`${language.substring(0, 2)}-`);
    }
  
    if (language?.length > 2) {
      variants.push(`${language?.split('-')[0]}`);
      variants.push(`${language?.split('-')[0]}-`);
    }
  
    return variants;
  })?.map((languageString) => {
    const lastCharacter = languageString[languageString.length - 1];
  
    if (lastCharacter === '-') {
      return new RegExp(`^${languageString}[A-Z]+.js`, 'g');
    }
  
    return new RegExp(`^${languageString}.js`, 'g');
  });
};

const parseBrowserLanguages = (languages = '') => {
  const rawLanguages = languages.split(',');
  return rawLanguages?.map((rawLanguage) => rawLanguage.split(';')[0]);
};

export default (req, res, next, appInstance = {}) => {
  res.render = async function (path = "", options = {}) {
    const urlFormattedForCache = req?.url?.split('/')?.filter((part) => !!part)?.join('_');
    const buildPathForEnvironment = getBuildPath();
    const buildPath = replaceFileProtocol(
      replaceBackslashesWithForwardSlashes(
        `${process.cwd().replace(buildPathForEnvironment, '')}/${buildPathForEnvironment}`
      )
    );
    const pagePath = `${buildPath}${path}`;
    const layoutPath = options.layout ? `${buildPath}${options.layout}` : null;
    const pagePathParts = `${buildPathForEnvironment}${path}`?.split('/')?.filter((part) => !!part);
    const cachePath = pagePathParts?.slice(0, pagePathParts.length - 1)?.join('/');
    let currentDiff; // NOTE: Set as undefined here so we can reference it if need be when writing a new cache.

    if (!fs.existsSync(pagePath)) {
      return res.status(404).send(
        generateErrorPage({
          type: 'pageNotFound',
          path: `res.render('${path}')`,
          frame: null,
          stack: `A page component at the path ${path} could not be found.`,
        })
      );
    }

    if (layoutPath && !fs.existsSync(layoutPath)) {
      return res.status(404).send(
        generateErrorPage({
          type: 'layoutNotFound',
          path: `res.render('${path}', { layout: '${options.layout}' })`,
          frame: null,
          stack: `A layout component at the path ${options.layout} could not be found.`,
        })
      );
    }

    // TODO: Implement CSRF for cached html.
    if (options?.cache?.expiresAfterMinutes) {
      // NOTE: Defined above as a let.
      currentDiff = typeof options?.cache?.diff === 'function' ? await getCacheDiff(options?.cache?.diff) : null;

      const cachedHTML = await getCachedHTML({
        cachePath,
        cacheFileName: urlFormattedForCache?.trim() === '' ? 'index' : urlFormattedForCache,
        currentDiff,
      });

      if (cachedHTML) {
        return res.send(cachedHTML);
      }
    }

    const pageFile = await getFile(pagePath);
    const Page = pageFile;
    const layoutFile = layoutPath ? await getFile(layoutPath) : null;
    const Layout = layoutFile;

    const browserLanguages = parseBrowserLanguages(req?.headers['accept-language']);
    const languagePreferenceRegexes = getLanguagePreferenceRegexes(req?.context?.user?.language, browserLanguages);

    const translations = await getTranslations({ build: buildPath, page: path }, languagePreferenceRegexes);

    const url = getUrl(req);
    const props = { ...(options?.props || {}) };

    if (layoutPath && fs.existsSync(layoutPath)) {
      props.page = Page;
    }

    const html = await ssr({
      componentFunction: Layout || Page,
      req,
      props,
      url,
      translations,
      attributes: options?.attributes,
      email: false,
      baseHTMLPath: null,
      layoutComponentPath: options?.layout,
      // NOTE: Safety mechanism. Don't punish a developer if the path they pass to res.render()
      // has a forward slash prepended, just strip it for them.
      pageComponentPath: path?.substring(0, 1) === '/' ? path?.replace('/', '') : path,
      head: options?.head,
      api: appInstance?.options?.api,
    });
    
    if (options?.cache?.expiresAfterMinutes) {
      writeCacheFileToDisk({
        // NOTE: Use parseInt() to round off any float values.
        expiresAfterMinutes: parseInt(options?.cache?.expiresAfterMinutes),
        cachePath,
        cacheFileName: urlFormattedForCache?.trim() === '' ? 'index' : urlFormattedForCache,
        currentDiff,
        html
      });
    }

    return res.status(200).send(html);
  };

  next();
};
