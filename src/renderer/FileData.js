var fs = require('fs');
var cp = require('child_process');
const shell = require('electron').shell;
const remote = require('electron').remote;

let path
let data
const dataVersion = 1.0

function Init(dbPath)
{
    path = dbPath

    if (!fs.existsSync(path)) {
        data = {}
        data.files = []
        data.version = dataVersion
        let jsonstr = JSON.stringify(data, null, 2)
        fs.writeFileSync(path, jsonstr, 'utf8')

        return data
    }

    let jsonstr = fs.readFileSync(path)
    data = JSON.parse(jsonstr)

    for (let index in data.files) {
        let info = data.files[index]
        info.isSelected = false
    }

    return data
}

function SetLabels(file, labels) {
    file.labels = labels
    Save()
}

function Save() {
    let jsonstr = JSON.stringify(data, null, 2)
    fs.writeFileSync(path, jsonstr, 'utf8')
}


function Find(filename) {
    for (let index in data.files) {
        let info = data.files[index]
        if (filename == info.name) {
            return info
        }
    }

    return null
}

function AddFile(filename, size) {
    let isFound = false
    for (let index in data.files) {
        let info = data.files[index]
        if (info.name == filename) {
            isFound = true
            break
        }
    }

    if (isFound == false) {
        let info = {
            'name': filename,
            'size': size,
            'thumb': "",
            'playCount': 0,
            'addtime': new Date().getTime(),
            'duration': 0,
            'isSelected': false,
            "labels": []
        }
        data.files.push(info)
    }
}

function Files()
{
    return data.files
}

function Search(keyword)
{
    if(keyword == "")
        return data.files

    let result = []
    for (let index in data.files) {
        let info = data.files[index]
        if (info.name.includes(keyword)) {
            result.push(info)
        }
    }
    
    return result;
}

let _selectedFile

function SetSelected(file)
{
    if (_selectedFile != undefined)
        _selectedFile.isSelected = false
    _selectedFile = file
    _selectedFile.isSelected = true
}

export {
    Init,
    Save,
    SetLabels,
    AddFile,
    Files,
    Search,
    SetSelected
  };
  