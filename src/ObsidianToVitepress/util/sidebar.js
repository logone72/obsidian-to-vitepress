import fs from "fs";
import {convertFilePathToVitepressPath, convertFilePathToUsableFormat} from "./fileConverter.js";

class SidebarItem {
    text;
    collapsed;
    items;

    constructor(text = '', collapsed = false, items = []) {
        this.text = text;
        this.collapsed = collapsed;
        this.items = [];
    }
}

class SidebarLink {
    text;
    link;

    constructor(text = '', link = '/') {
        this.text = text;
        this.link = link;
    }
}

const recursiveAttacker = (path, sidebar = new SidebarItem(), data = {}) => {
    const currentDepth = data.depth + 1;
    const isCollapsed = currentDepth > 1;

    const filenames = fs.readdirSync(path, {withFileTypes: true})

    filenames.forEach((_file) => {
        if (!_file instanceof fs.Dirent)
            return;

        const fileName = _file.name.includes('.') ? _file.name.split('.')[0] : _file.name;

        const currentPath = `${path}/${_file.name}`
        const modifiedPath = `${convertFilePathToVitepressPath(data.originalPath, convertFilePathToUsableFormat(path))}/${convertFilePathToUsableFormat(fileName)}`

        if (_file.isFile()) {
            sidebar.items.push(new SidebarLink(fileName, modifiedPath))
        } else if (_file.isDirectory()) {
            const newSidebarItem = recursiveAttacker(currentPath, new SidebarItem(fileName, isCollapsed), {
                ...data,
                depth: currentDepth,
            })
            sidebar.items.push(newSidebarItem)
        }
    })

    return sidebar;
}

const createSidebarConfig = (dirPath) => {
    try {
        const data = {
            originalPath: dirPath,
            depth: 0,
        }

        const sidebar = recursiveAttacker(dirPath, new SidebarItem(), data)

        return JSON.stringify(sidebar.items)
    } catch (e) {
        console.error(e);
        return [];
    }
}

export default createSidebarConfig;