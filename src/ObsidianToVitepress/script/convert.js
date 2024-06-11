import fs from 'fs';

import Lavencha from "../util/lavencha.js";
import {config} from "../util/constraint.js";
import createSidebarConfig from '../util/sidebar.js';

const run = () => {
    const lavencha = new Lavencha(config.originalDirectoryPath)
    lavencha.executeConversion();

    const sidebarConfig = createSidebarConfig(config.originalDirectoryPath)

    fs.writeFileSync(`${config.targetDirectoryPath}/.vitepress/sidebarConfig.json`, sidebarConfig);
}

run();