import fs from "fs";
import {config} from "../util/constraint.js";
import createSidebarConfig from "../util/sidebar.js";

const run = () => {
    const sidebarConfig = createSidebarConfig(config.originalDirectoryPath);

    fs.writeFileSync(`${config.targetDirectoryPath}/.vitepress/sidebarConfig.json`, sidebarConfig);
}

run();