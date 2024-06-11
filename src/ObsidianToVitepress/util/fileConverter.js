import fs from 'fs';
import nodePath from 'path';
import fse from 'fs-extra';

import {config, obsidianInternalLinkMatcher,} from "./constraint.js";

const convertFilePathToUsableFormat = (_filePath = '') => {
    return _filePath.replaceAll(' ', '-').replaceAll('?', '﹖').replaceAll(/'/g, '"')
}

/**
 * 특정 디렉토리 하위의 모든 파일 경로들을 두번쨰 인자로 넘기는 배열에 담는 함수
 */
const readAllFilePaths = (dirPath, filePathArr) => {
    const filenames = fs.readdirSync(dirPath, {withFileTypes: true})

    filenames.forEach((_file) => {
        if (!_file instanceof fs.Dirent)
            return;

        const currentPath = `${dirPath}/${_file.name}`

        if (_file.isFile())
            filePathArr.push(currentPath)
        else if (_file.isDirectory())
            readAllFilePaths(currentPath, filePathArr)
    })

    return filePathArr;
}

/**
 * 주어진 path의 모든 파일을 utf8로 포맷팅 형태로 읽어오는 함수
 */
const readFiles = (paths) => {
    const mapper = (path) => ({
        path,
        content: fs.readFileSync(path, "utf8")
    })

    return paths.map(mapper)
}

const convertFilePathToVitepressPath = (basePath = config.originalDirectoryPath, filePath) => {
    return convertFilePathToUsableFormat(filePath.replace(basePath, ''))
}

const getObsidianToVitepressInternalLinkMap = (obsidianInternalLinks, paths) => {
    const internalLinkMap = new Map();

    obsidianInternalLinks.forEach(obsidianLink => {
        try {
            const fileName = obsidianLink.replace('[[', '').replace(']]', '');
            const matchedPath = paths.find(path => path.includes(convertFilePathToUsableFormat(fileName)));

            if (!matchedPath || !fileName) {
                internalLinkMap.set(obsidianLink, '')
                return;
            }

            const vitepressLikeInternalLink = `[${fileName}](${matchedPath})`

            internalLinkMap.set(obsidianLink, vitepressLikeInternalLink)
        } catch (e) {
            internalLinkMap.set(obsidianLink, '')
        }
    })

    return internalLinkMap
}

const extractAllObsidianInternalLinks = (files) => {
    const obsidianInternalLinks = new Set();

    files.forEach(file => {
        const {content} = file;
        const matchedStrings = content.match(obsidianInternalLinkMatcher) ?? []
        matchedStrings.forEach(match => obsidianInternalLinks.add(match))
    })

    return Array.from(obsidianInternalLinks).filter(string => !!string);
}

const replaceInternalLinks = (file, obsidianToVitepressMap) => {
    let replacedFile = file;

    const matches = file.match(obsidianInternalLinkMatcher)

    if (!matches)
        return file;

    matches.forEach(match => {
        const vitepressInternalLink = obsidianToVitepressMap.get(match);

        replacedFile = replacedFile.replaceAll(match, vitepressInternalLink)
    })

    return replacedFile;
}

const backupFiles = (path) => {
    fse.copySync(path, config.backupDirectoryPath, {overwrite: true});
}

const restoreBackup = (path) => {
    if (fs.existsSync(config.backupDirectoryPath))
        fse.copySync(config.backupDirectoryPath, path, {overwrite: true});
}

const writeFile = (path, contents, callback) => {
    const dirPath = nodePath.dirname(path);

    try {
        fs.mkdirSync(dirPath, {recursive: true})
    } catch (e) {
        console.error(e, 'write file error')
    }

    fs.writeFileSync(path, contents, callback);
}

export {
    readAllFilePaths,
    readFiles,
    writeFile,
    backupFiles,
    restoreBackup,
    extractAllObsidianInternalLinks,
    convertFilePathToVitepressPath,
    getObsidianToVitepressInternalLinkMap,
    replaceInternalLinks,
    convertFilePathToUsableFormat,
}
