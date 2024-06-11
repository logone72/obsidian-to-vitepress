import fs from "fs";
import fse from "fs-extra";

import {config} from "./constraint.js";
import {
    convertFilePathToVitepressPath,
    extractAllObsidianInternalLinks,
    getObsidianToVitepressInternalLinkMap,
    readAllFilePaths,
    readFiles,
    replaceInternalLinks,
    writeFile,
} from "./fileConverter.js"


class Lavencha {
    original = {};
    converted = {};
    cache = {};

    constructor(originalDirectoryPath = config.originalDirectoryPath) {
        this.original.directoryPath = originalDirectoryPath
        this.original.filePaths = readAllFilePaths(this.original.directoryPath, []);
        this.original.fileItems = readFiles(this.original.filePaths)

        this.cache.vitepressPaths = this.original.filePaths.map(filePath => convertFilePathToVitepressPath(this.original.directoryPath, filePath))
        this.cache.obsidianInternalLinks = extractAllObsidianInternalLinks(this.original.fileItems)

        this.cache.linkMap = getObsidianToVitepressInternalLinkMap(
            this.cache.obsidianInternalLinks,
            this.cache.vitepressPaths,
        )
    }

    executeConversion() {
        this.backupOriginalFiles();

        const newFileItems = this.original.fileItems.map((file) => {
            const path = convertFilePathToVitepressPath(this.original.directoryPath, file.path);
            const replacedFileContent = replaceInternalLinks(file.content, this.cache.linkMap);

            return {
                path,
                content: replacedFileContent,
            }
        })

        this.converted.fileItems = newFileItems;

        newFileItems.forEach(fileItem => {
            const {path, content} = fileItem;

            writeFile(`${config.targetDirectoryPath}${path}`, content)
        })
    }

    backupOriginalFiles() {
        fse.emptyDirSync(config.backupDirectoryPath)
        fse.copySync(config.targetDirectoryPath, `${config.backupDirectoryPath}/docs`);
        fse.copySync(config.originalDirectoryPath, `${config.backupDirectoryPath}/obsidian`);

        fse.emptyDirSync(config.targetDirectoryPath)
        if (fs.existsSync(`${config.backupDirectoryPath}/docs/.vitepress`))
            fse.copySync(`${config.backupDirectoryPath}/docs/.vitepress`, `${config.targetDirectoryPath}/.vitepress`);
        if (fs.existsSync(`${config.backupDirectoryPath}/docs/index.md`))
            fse.copySync(`${config.backupDirectoryPath}/docs/index.md`, `${config.targetDirectoryPath}/index.md`);
    }
}

export default Lavencha;