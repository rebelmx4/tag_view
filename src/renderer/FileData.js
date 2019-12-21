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

let sortTypes = {}
sortTypes.time_asc = 1
sortTypes.time_dec = 2
sortTypes.tag_asc = 3
sortTypes.tag_dec = 4
sortTypes.size_asc = 5
sortTypes.size_dec = 6
sortTypes.duration_asc = 7
sortTypes.duration_dec = 8

let sortFuncs = []
sortFuncs[sortTypes.time_asc] = function(result) {result.sort(function (a, b) { return (a.addtime - b.addtime)})}
sortFuncs[sortTypes.time_dec] = function(result) {result.sort(function (a, b) { return (b.addtime - a.addtime)})}
sortFuncs[sortTypes.tag_asc] = function(result) {result.sort(function (a, b) { return (a.labels.length - b.labels.length)})}
sortFuncs[sortTypes.tag_dec] = function(result) {result.sort(function (a, b) { return (b.labels.length - a.labels.length)})}
sortFuncs[sortTypes.size_asc] = function(result) {result.sort(function (a, b) { return (a.size - b.size)})}
sortFuncs[sortTypes.size_dec] = function(result) {result.sort(function (a, b) { return (b.size - a.size)})}
sortFuncs[sortTypes.duration_asc] = function(result) {result.sort(function (a, b) { return (a.duration - b.duration)})}
sortFuncs[sortTypes.duration_dec] = function(result) {result.sort(function (a, b) { return (b.duration - a.duration)})}

function sort(result, sorttype)
{
    sortFuncs[sorttype](result)
    return result
}

export {
    Init,
    Save,
    SetLabels,
    AddFile,
    Files,
    Search,
    SetSelected, sort,  sortTypes
  };
  