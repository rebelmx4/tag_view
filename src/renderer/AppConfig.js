var fs = require('fs');
var path = require('path');
var cp = require('child_process');
const shell = require('electron').shell;
const remote = require('electron').remote;
import draggable from 'vuedraggable'

let data

function load() {
    if (fs.existsSync("./config.json")) {
        let jsonstr = fs.readFileSync("./config.json")
        data = JSON.parse(jsonstr)

       data.recentDirs = unique(data.recentDirs)

        let i = data.recentDirs.length;
        while (i--) {
            let path = data.recentDirs[i]
            if (!fs.existsSync(path)) {
                data.recentDirs.splice(i, 1);
            }
        }
    } else {
        data = {}
        data.recentDirs = []
    }

    return data
}

function isCurDir(dir)
{
    if(data.recentDirs.length > 0 && data.recentDirs[0] == dir)
    {
        return true
    }

    return false
}

function Unshift(dir)
{
    if(data.recentDirs.length > 0)
    {
        if(data.recentDirs[0] == dir)
            return false
        else
        {
            remove(dir)
            data.recentDirs.unshift(dir)
            save()
            return true
        }
    }
    else {
        data.recentDirs.unshift(dir)
        save()
        return true
    }
}

function remove(dir){
    let i = data.recentDirs.length;
        while (i--) {
            let path = data.recentDirs[i]
            if (path == dir) {
                data.recentDirs.splice(i, 1);
                break;
            }
        }
}

function save() {
    let jsonstr = JSON.stringify(data, null, 2)
    fs.writeFileSync("./config.json", jsonstr, 'utf8')
}

//remove duplicate
function unique (arr) {
    return Array.from(new Set(arr))
  }

export {load, isCurDir, save, Unshift }