import fs from "fs";
import dayjs from "dayjs";
import crypto from "crypto";
import ssr from "../../ssr/index.js";
import { isObject } from "../../validation/lib/typeValidators";
import settings from "../../settings";
import generateErrorPage from "../../lib/generateErrorPage.js";
import replaceFileProtocol from "../../lib/replaceFileProtocol.js";
import replaceBackslashesWithForwardSlashes from "../../lib/replaceBackslashesWithForwardSlashes.js";
import getBuildPath from "../../lib/getBuildPath.js";
import escapeHTML from "../../lib/escapeHTML.js";
import escapeKeyValuePair from "../../lib/escapeKeyValuePair.js";
import importFile from "../../lib/importFile.js";
import getTranslations from "./getTranslations.js";
const generateHash = (input = "") => {
  return crypto.createHash("sha256").update(input).digest("hex");
};
const getCacheDiff = async (diffFunction = null) => {
  if (diffFunction) {
    const diff = await diffFunction();
    const diffHash = typeof diff === "string" ? generateHash(diff) : null;
    return diffHash;
  }
  return null;
};
const writeCacheFileToDisk = ({
  expiresAfterMinutes = "",
  cachePath = "",
  cacheFileName = "index",
  currentDiff = null,
  html = ""
}) => {
  const expiresAt = dayjs().add(expiresAfterMinutes, "minutes").unix();
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
  });
};
const getCachedHTML = ({ cachePath, cacheFileName, currentDiff }) => {
  const files = fs.existsSync(`${cachePath}/_cache`) ? fs.readdirSync(`${cachePath}/_cache`) : [];
  const cacheFile = files?.find((file) => file?.includes(cacheFileName));
  const cacheFileExpiresAtUnix = cacheFile?.replace(`${cacheFileName}_`, "").replace(".html", "");
  const existingDiff = fs.existsSync(`${cachePath}/_cache/diff_${cacheFileExpiresAtUnix}`) ? fs.readFileSync(`${cachePath}/_cache/diff_${cacheFileExpiresAtUnix}`, "utf-8") : null;
  const cacheFileDiffHasChanged = existingDiff !== currentDiff;
  const cacheFileExpiresAtHasPassed = dayjs().isAfter(dayjs.unix(parseInt(cacheFileExpiresAtUnix)));
  const cacheFileHasExpired = cacheFileDiffHasChanged || cacheFileExpiresAtHasPassed;
  if (cacheFileDiffHasChanged || cacheFileExpiresAtHasPassed) {
    fs.unlink(`${cachePath}/_cache/${cacheFile}`, (error) => {
      if (error)
        return;
    });
    fs.unlink(`${cachePath}/_cache/diff_${cacheFileExpiresAtUnix}`, (error) => {
      if (error)
        return;
    });
  }
  return cacheFile && !cacheFileHasExpired ? fs.readFileSync(`${cachePath}/_cache/${cacheFile}`, "utf-8") : null;
};
const getUrl = (request = {}) => {
  const [path = null] = request.url?.split("?");
  return {
    params: escapeKeyValuePair(request.params),
    query: escapeKeyValuePair(request.query),
    route: escapeHTML(request.route.path),
    path: escapeHTML(path)
  };
};
var render_default = (req, res, next, appInstance = {}) => {
  res.render = async function(path = "", options = {}) {
    const urlFormattedForCache = req?.url?.split("/")?.filter((part) => !!part)?.join("_");
    const buildPathForEnvironment = getBuildPath();
    const buildPath = replaceFileProtocol(replaceBackslashesWithForwardSlashes(`${process.cwd().replace(buildPathForEnvironment, "")}/${buildPathForEnvironment}`));
    const pagePath = `${buildPath}${path}`;
    const layoutPath = options.layout ? `${buildPath}${options.layout}` : null;
    const pagePathParts = `${buildPathForEnvironment}${path}`?.split("/")?.filter((part) => !!part);
    const cachePath = pagePathParts?.slice(0, pagePathParts.length - 1)?.join("/");
    let currentDiff;
    if (!fs.existsSync(pagePath)) {
      return res.status(404).send(generateErrorPage({
        type: "pageNotFound",
        path: `res.render('${path}')`,
        frame: null,
        stack: `A page component at the path ${path} could not be found.`
      }));
    }
    if (layoutPath && !fs.existsSync(layoutPath)) {
      return res.status(404).send(generateErrorPage({
        type: "layoutNotFound",
        path: `res.render('${path}', { layout: '${options.layout}' })`,
        frame: null,
        stack: `A layout component at the path ${options.layout} could not be found.`
      }));
    }
    if (options?.cache?.expiresAfterMinutes) {
      currentDiff = typeof options?.cache?.diff === "function" ? await getCacheDiff(options?.cache?.diff) : null;
      const cachedHTML = await getCachedHTML({
        cachePath,
        cacheFileName: urlFormattedForCache?.trim() === "" ? "index" : urlFormattedForCache,
        currentDiff
      });
      if (cachedHTML) {
        return res.send(cachedHTML);
      }
    }
    const pageFile = await importFile(pagePath);
    const Page = pageFile;
    const layoutFile = layoutPath ? await importFile(layoutPath) : null;
    const Layout = layoutFile;
    const translations = await getTranslations({ build: buildPath, page: path }, req);
    const url = getUrl(req);
    const props = { ...options?.props || {} };
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
      pageComponentPath: path?.substring(0, 1) === "/" ? path?.replace("/", "") : path,
      head: options?.head,
      api: appInstance?.options?.api
    });
    if (options?.cache?.expiresAfterMinutes) {
      writeCacheFileToDisk({
        expiresAfterMinutes: parseInt(options?.cache?.expiresAfterMinutes),
        cachePath,
        cacheFileName: urlFormattedForCache?.trim() === "" ? "index" : urlFormattedForCache,
        currentDiff,
        html
      });
    }
    return res.status(200).send(html);
  };
  next();
};
export {
  render_default as default
};
