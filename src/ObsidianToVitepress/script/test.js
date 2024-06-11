import {config} from "../util/constraint.js";
import Lavencha from "../util/lavencha.js";
import createSidebarConfig from "../util/sidebar.js";
import fs from "fs";

const tc = (str, title = '') => {
    console.log(`/--------${title}------/ start`)
    console.log(str)
    console.log(`/--------${title}------/ end`)
}

const test = () => {

    const lavencha = new Lavencha(config.testDirectoryPath)

    // tc(lavencha.original)
    // tc(lavencha.cache)

    lavencha.executeConversion();
    // tc(lavencha.converted)

    const sidebarConfig = createSidebarConfig(config.testDirectoryPath)

    fs.writeFileSync(`${config.targetDirectoryPath}/.vitepress/sidebarConfig.json`, sidebarConfig);
}

test();