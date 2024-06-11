import customConfig from '../config.js';

const defaultConfig = {
    originalDirectoryPath: './public/obsidian',
    targetDirectoryPath: './docs',
    backupDirectoryPath: './backup',
    testDirectoryPath: './public/testmd',
}

const config = {
    ...defaultConfig,
    ...customConfig,
}

const obsidianInternalLinkMatcher = /(\[\[).*(]])/g
const pathMarkdownFileNameMatcher = /(\/).*(.md)/g

export {
    config,

    obsidianInternalLinkMatcher,
    pathMarkdownFileNameMatcher
}