var fs = require('fs');
var cp = require('child_process');
var path = require('path');

let workDir
let data = []

function Init(workPath) {
    workDir = workPath
    let files = fs.readdirSync(workDir)
    for (let index in files) {
        let filename = files[index]
        let filePath = path.join(workDir, filename);
        let stats = fs.statSync(filePath)
        if (stats.isFile()) {
            let info = {
                'name': filename,
                'size': stats.size
            }
            data.push(info)
        }
    }

    return data
}

function Find(name)
{
    for (let index in data) {
        let info = data[index]
        if (info.name == name) {
            return true
            break
        }
    }

    return false
}

function Foreach(fun)
{
    for (let index in data) {
        let info = data[index]
        fun(data[index])
    }
}


export {
    Init,
    Find,
    Foreach
  };
  