<template>
<div id="app" :style="{'position':'fixed','width':'100%','height':'100%'}">
    <div class="titlebar">
        <input type="text" class="dir" v-model="rootDir" />
        <button @click="OpenDir" class="open_dir" icon="el-icon-folder-opened">
            <img src="static/folder-open.svg">
        </button>
        <button type="button" class="close" @click="CloseWin"></button>
    </div>
    <div class="mainbody">
        <!-- file -->
        <div class="filebody">
            <div class="filebar">
                <input type="text" class="keyword" v-model="keyword" />
                <button class="searchbutton">
                    <img src="static/icon-search.svg">
                </button>
                <button class="sortbutton">
                    <img src="static/sort.svg">
                </button>
                <button class="sortbutton">
                    <img src="static/sort.svg">
                </button>
            </div>
            <br />
            <el-row :gutter="30" :style="{'margin-left':'20px', 'margin-right':'20px'}">
                <el-col :span="4" v-for="(item, index) in files" :class="{ active: isActive }" :style="{'height':'200px'}" :aaa="aaa">
                    <div class="playcount1">
                        <img :src="item.thumb" v-bind:id="item.name" width="100%" @dblclick="OpenFile(item)" @click="OpenDrawer(item)" :style="{'border-radius':'8px', 'height':'150px'}">
                        <p class="playcount">{{item.playCount}}<br>{{item.labels.length}}</p>
                        <button class="filefunc" @click="AddCollection(item)">
                            <icon name="favorite" :w="20" :h="20" color="red"></icon>
                        </button>
                    </div>
                </el-col>
            </el-row>
        </div>
        <!-- tools -->
        <div class="sidebar">
            <div class="tabs">
                <button class="tabbtn" @click="selectedTab = 0">
                    <img src="static/filter.svg" width="25px" height="25px">
                </button>
                <button class="tabbtn" @click="selectedTab = 1">
                    <img src="static/tags.svg" width="25px" height="25px">
                </button>
                <button class="tabbtn" @click="selectedTab = 2">
                    <img src="static/file.svg" width="25px" height="25px">
                </button>
                <button class="tabbtn" @click="selectedTab = 3">
                    <img src="static/Collection.svg" width="25px" height="25px">
                </button>
            </div>
            <!-- filter -->
            <div v-if="selectedTab == 0" :style="{'height':'100%'}">
                <!-- head -->
                <div class="filterhead">
                    <el-button circle size="small" icon="el-icon-plus" @click="addGroupDialogVisible = true"></el-button>
                    <el-tooltip content="清空标签" placement="top">
                        <el-button circle size="small" icon="el-icon-document-delete" @click="clearAllLabels"></el-button>
                    </el-tooltip>
                </div>
                <br>
                <div :style="{'height':'100%', 'overflow':'auto'}">
                    <div v-for="(item, index) in groups" class="group">
                        <div class="groupbar">
                            <input type="text" class="groupname" v-model="item.name" @change="changeGroupName">
                            <el-button circle size="small" icon="el-icon-delete" :style="{'float':'right'}"></el-button>
                            <el-button circle size="small" icon="el-icon-plus" @click="AddLabel(item)" :style="{'float':'right'}"></el-button>
                        </div>
                        <!-- https://www.jianshu.com/p/03f0f58f84cc -->
                        <draggable :options="{group:'label',animation:150,ghostClass:'sortable-ghost',chosenClass:'chosenClass',scroll:true,scrollSensitivity:200}" v-model="item.labels" @change="Change">
                            <el-checkbox v-for="(label, index) in item.labels" :id="label.id" :label="label.name" v-model="label.selected" @change="SelectLable" class="label"></el-checkbox>
                        </draggable>
                    </div>
                </div>
            </div>
            <!-- label -->
            <div v-else-if="selectedTab == 1" :style="{'height':'100%'}">
                {{selectedFile.name}}
                <br>
                <img :src="selectedFile.thumb" width="150px" height="150px" :style="{'border-radius':'8px'}">
                <br>
                <div :style="{'height':'100%', 'overflow':'auto'}">
                    <div v-for="(item, index) in groups" class="group">
                        <span class="noselect">{{item.name}}</span>
                        <el-button circle size="small" icon="el-icon-delete" :style="{'float':'right'}"></el-button>
                        <el-button circle size="small" icon="el-icon-plus" @click="AddLabel(item)" :style="{'float':'right'}"></el-button>
                        <br>
                        <br>
                        <draggable :options="{group:'label',animation:150,ghostClass:'sortable-ghost',chosenClass:'chosenClass',scroll:true,scrollSensitivity:200}" v-model="item.labels" @change="Change">
                            <el-checkbox v-for="(label, index) in item.labels" v-bind:id="label.id" :label="label.name" v-model="label.selected1" @change="FileSelectLable" class="label"></el-checkbox>
                        </draggable>
                    </div>
                </div>
            </div>
            <!-- fileInfo -->
            <div v-else-if="selectedTab == 2">
                <!-- {{selectedFile.name}}
                        <img v-bind:src="selectedFile.thumb" v-bind:id="selectedFile.name" width="150px" height="150px" :style="{'border-radius':'8px'}">
                        <div :style="{'height':'100%'}">
                            <div v-for="(item, index) in groups">
                                {{item.name}}
                                <el-button circle size="small" icon="el-icon-delete" :style="{'float':'right'}"></el-button>
                                <el-button circle size="small" icon="el-icon-plus" @click="AddLabel(item)" :style="{'float':'right'}"></el-button>
                                <br>
                                <el-checkbox v-for="(label, index) in item.labels" v-bind:id="label.id" :label="label.name" v-model="label.selected1" @change="FileSelectLable"></el-checkbox>
                                <el-divider></el-divider>
                            </div>
                        </div> -->
            </div>
            <!-- collection -->
            <div v-else-if="selectedTab == 3" :style="{'height':'100%'}">
                <div :style="{'height':'100%', 'overflow':'auto'}">
                    <img v-for="(item, index) in collection" :src="item.thumb" v-bind:id="item.name" width="80%" @dblclick="OpenFile(item)" class="favoriteitem">
                </div>
            </div>
        </div>
    </div>

    <el-dialog title="添加组" :visible.sync="addGroupDialogVisible" append-to-body>
        <el-form>
            <el-form-item label="名称">
                <el-input v-model="newGroupName" autocomplete="off"></el-input>
                <el-select v-model="sortType" placeholder="请选择">
                    <el-option v-for="item in sortTypes" :key="item" :label="item" :value="item">
                    </el-option>
                </el-select>
            </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
            <el-button @click="addGroupDialogVisible = false">取 消</el-button>
            <el-button type="primary" @click="ConfirmAddGroup">确 定</el-button>
        </div>
    </el-dialog>
    <el-dialog title="添加标签" :visible.sync="addLabelDialogVisible" append-to-body>
        <el-form>
            <el-form-item label="名称">
                <el-input v-model="newLabelName" autocomplete="off"></el-input>
            </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
            <el-button @click="addLabelDialogVisible = false">取 消</el-button>
            <el-button type="primary" @click="ConfirmAddLabel">确 定</el-button>
        </div>
    </el-dialog>
</div>
</template>

<script>
var fs = require('fs');
var path = require('path');
var cp = require('child_process');
const shell = require('electron').shell;
const remote = require('electron').remote;
import draggable from 'vuedraggable'
var appConfig = require("./AppData")

const dataVersion = 1.0
let rootDir
let libDir
let dbPath
let thumbDir

let vData = {}

let mData = {}
let fsData
vData.selectedGroup = {}
vData.groups = []
vData.fileGroups = []
vData.files = []
vData.selectedFile = {}
vData.addGroupDialogVisible = false
vData.newGroupName = ""
vData.addLabelDialogVisible = false
vData.newLabelName = ""
vData.files = []
vData.rootDir = ""
vData.sortTypes = ["number", "1"]
vData.sortType = "number"
vData.AddGroupFromDrawer = false
vData.showSilder = "filter"
vData.isActive = true
vData.aaa = ""
vData.tabs = ["el-icon-search", "el-icon-paperclip", "el-icon-files", "el-icon-collection"]
vData.selectedTab = ""
vData.collection = []
vData.keyword = ""

let appData = appConfig.load()
vData.recentDirs = appData.recentDirs

if (vData.recentDirs.length > 0) {
    Init(vData.recentDirs[0])
}

function Init(rdir) {
    rootDir = rdir
    libDir = path.join(rootDir, ".library")
    dbPath = path.join(libDir, "meta.db")
    thumbDir = path.join(libDir, "Thumb")

    if (!fs.existsSync(libDir)) {
        fs.mkdirSync(libDir)
    }

    if (!fs.existsSync(thumbDir)) {
        fs.mkdirSync(thumbDir)
    }

    if (!fs.existsSync(dbPath)) {
        let data1 = {}
        data1.maxlabelId = 1
        data1.groups = []
        data1.files = []
        data1.version = dataVersion
        let jsonstr = JSON.stringify(data1, null, 2)
        fs.writeFileSync(dbPath, jsonstr, 'utf8')
    }

    fsData = ReadFileSystem()
    mData = ReadDB()
    MatchMeta()
    ClearInvaildMeta()
    GenThumbs()
    ClearInvaildThumb()

    ClearSelected1()
    ClearSelected()

    vData.selectedGroup = ""
    if (mData.groups.length > 0) {
        vData.selectedGroup = "0"
    }

    vData.fileSelectedGroup = ""
    vData.groups = mData.groups
    vData.fileGroups = mData.groups
    vData.files = mData.files
    vData.selectedFile = {}
    vData.addGroupDialogVisible = false
    vData.newGroupName = ""
    vData.addLabelDialogVisible = false
    vData.newLabelName = ""
    vData.files = Fileter()
    vData.rootDir = rootDir
}

//file
function ReadFileSystem() {
    let fsData = []
    let files = fs.readdirSync(rootDir)
    for (let index in files) {
        let filename = files[index]
        let filePath = path.join(rootDir, filename);
        let stats = fs.statSync(filePath)
        if (stats.isFile()) {
            let info = {
                'name': filename,
                'size': stats.size
            }
            fsData.push(info)
        }
    }

    return fsData
}

function ReadDB() {
    let jsonstr = fs.readFileSync(dbPath)
    let ret = JSON.parse(jsonstr)
    if (ret.version == undefined) {
        ret.maxlabelId = 1
        ret.groups = []
        ret.files = []
        ret.version = 1.0
    }

    return ret
}

function FindFile(name) {
    for (let index in mData.files) {
        let info = mData.files[index]
        if (name == info.name) {
            return info
        }
    }

    return null
}

function ModifyLabel(file, label, isAdd) {
    let labels = file.labels
    if (isAdd == true) {
        if (labels.find(function (element) {
                return element > label;
            }) == undefined) {
            labels.push(label)
        }
    } else {
        var evens = _.remove(labels, function (n) {
            return n == label
        })
    }
}

function ModifyLabel2(file) {
    let selectedLabels = []
    for (let groupindex in mData.groups) {
        let group = mData.groups[groupindex]
        for (let labelIndex in group.labels) {
            let label = group.labels[labelIndex]
            if (label.selected1 == true) {
                selectedLabels.push(label.id)
            }
        }
    }

    file.labels = selectedLabels
}

function MatchMeta() {
    for (let index in fsData) {
        let info = fsData[index]
        let isFound = false
        for (let index1 in mData.files) {
            let info1 = mData.files[index1]
            if (info1.name == info.name) {
                isFound = true
                break
            }
        }

        if (isFound == false) {
            let info2 = {
                'name': info.name,
                'size': info.size,
                'thumb': "",
                'playCount': 0,
                "labels": []
            }
            mData.files.push(info2)
        }
    }
}

function ClearInvaildMeta() {
    let i = mData.files.length;
    while (i--) {
        let info = mData.files[i]
        let isFound = false
        for (let index1 in fsData) {
            let info1 = fsData[index1]
            if (info1.name == info.name) {
                isFound = true
                break
            }
        }

        if (isFound == false) {
            mData.files.splice(i, 1)
        }
    }
}

function ClearInvaildThumb() {
    let thumbs = fs.readdirSync(thumbDir)
    let thumbDiff = thumbs.filter(function (x) {
        let isfind = false
        for (let index in mData.files) {
            if (mData.files[index].name + ".jpg" == x) {
                isfind = true
                break
            }
        }
        return !isfind
    })

    for (let index in thumbDiff) {
        let name = thumbDiff[index]
        fs.unlink(path.join(thumbDir, name))
    }
}

function hmsToSecondsOnly(str) {
    var p = str.split(':'),
        s = 0,
        m = 1;

    while (p.length > 0) {
        s += m * parseInt(p.pop(), 10);
        m *= 60;
    }

    return s;
}

function GenThumb(filePath, thumbPath, info) {
    let cmd = 'ffmpeg -i "' + filePath + '" 2>&1 | FindStr "Duration"'
    var process = cp.exec(cmd);

    process.stdout.on('data', function (data) {
        var items = data.split(",")

        if (items.length > 1) {
            var str = items[0].substring(0, "   Duration: ".length - 1)
            if (str == "  Duration: ") {
                let time = hmsToSecondsOnly(items[0].substring("   Duration: ".length).split(".")[0])
                var thumbProcess = cp.exec('ffmpeg -ss ' + time * 0.5 + ' -i "' + filePath + '" -y -f image2  -vframes 1 -s 352x240 "' + thumbPath + '"');
                thumbProcess.stderr.on('data', function (d) {
                    console.log(d)
                })
                thumbProcess.on('exit', (code) => {
                    info.thumb = thumbPath
                    info.duration = time
                })
            }
        }
    });
    process.stderr.on('uncaughtException', err => {
        console.log(err)
    })
}

function GenThumbs() {
    for (let fileindex in mData.files) {
        let filename = mData.files[fileindex].name
        let filePath = path.join(rootDir, filename)
        let thumbPath = path.join(thumbDir, filename + ".jpg")
        if (!fs.existsSync(thumbPath)) {
            thumbPath,
            mData.files[fileindex].thumb = ""
            GenThumb(filePath, thumbPath, mData.files[fileindex])
        }
        else {
            mData.files[fileindex].thumb = thumbPath
        }
    }
}

function SaveDB() {
    let jsonstr = JSON.stringify(mData, null, 2)
    fs.writeFileSync(dbPath, jsonstr, 'utf8')
}

//vdata
function ClearSelected1() {
    for (let groupindex in mData.groups) {
        let group = mData.groups[groupindex]
        for (let labelindex in group.labels) {
            group.labels[labelindex].selected1 = false
        }
    }
}

function ClearSelected() {
    for (let groupindex in mData.groups) {
        let group = mData.groups[groupindex]
        for (let labelindex in group.labels) {
            group.labels[labelindex].selected = false
        }
    }
}

function FindLabelInfo(id) {
    for (let groupindex in mData.groups) {
        let group = mData.groups[groupindex]
        for (let labelindex in group.labels) {
            let label = group.labels[labelindex]
            if (label.id == id) {
                return label
            }
        }
    }

    return null
}

function FillDrawer(file) {
    ClearSelected1()

    for (let lableindex in file.labels) {
        let label = file.labels[lableindex]
        let labelinfo = FindLabelInfo(label)
        labelinfo.selected1 = true
    }
}

function Fileter() {
    let selectedLabels = []
    for (let groupindex in mData.groups) {
        let group = mData.groups[groupindex]
        for (let labelIndex in group.labels) {
            let label = group.labels[labelIndex]
            if (label.selected == true) {
                selectedLabels.push(label.id)
            }
        }
    }

    if (selectedLabels.length == 0)
        return mData.files

    let files = mData.files
    let result = []
    for (let index in files) {
        let labels = files[index].labels
        let isAllMatch = true
        if (labels.length == 0) {
            isAllMatch = false
        } else {
            for (let k in selectedLabels) {
                let isFound = false
                for (let j in labels) {
                    if (labels[j] == selectedLabels[k]) {
                        isFound = true
                        break;
                    }
                }

                if (isFound == false) {
                    isAllMatch = false
                    break;
                }
            }
        }

        if (isAllMatch) {
            result.push(files[index])
        }
    }

    return result
}

function AddGroup(name, sortType) {
    let group = {}
    group.name = name
    group.sortType = sortType
    group.labels = []
    vData.groups.push(group)
}

function labelCompare(a, b) {
    if (a.name < b.name) { // 按某种排序标准进行比较, a 小于 b
        return -1;
    }
    if (a.name > b.name) {
        return 1;
    }
    // a must be equal to b
    return 0;
}

function AddLabel(labelName) {
    // for (let groupindex in mData.groups) {
    //     let group = mData.groups[groupindex]
    //     if (groupindex == groupName) {

    //         break
    //     }
    // }

    let label = {}
    label.name = labelName
    label.id = (++mData.maxlabelId).toString()
    label.selected = false
    label.selected1 = false
    vData.selectedGroup.labels.push(label)
    if (vData.selectedGroup.sortType == "number") {
        vData.selectedGroup.labels.sort(labelCompare)
    }

    SaveDB()
}

let clickTimeout = {
    _timeout: null,
    set: function (fn) {
        var that = this;
        that.clear();
        that._timeout = window.setTimeout(fn, 300);
    },
    clear: function () {
        var that = this;
        if (that._timeout) {
            window.clearTimeout(that._timeout);
        }
    }
};

export default {
    name: 'tag_view',
    data() {
        return vData
    },
    methods: {
        changeGroupName() {
            SaveDB()
        },
        OpenDir() {
            const dialog = remote.dialog
            dialog.showOpenDialog(remote.getCurrentWindow(), {
                properties: ['openDirectory']
            }, (filename) => {
                if (filename != undefined && filename.length === 1) {

                    if (appConfig.isCurDir(filename[0])) {
                        return
                    } else {
                        appConfig.Unshift(filename[0])

                        appConfig.save()
                        Init(filename[0])
                    }
                }
            })
        },
        CloseWin() {
            var window = remote.getCurrentWindow().close()
        },
        ConfirmAddGroup() {
            vData.addGroupDialogVisible = false
            AddGroup(vData.newGroupName, vData.sortType)

            SaveDB()
        },
        AddLabel(group) {
            vData.selectedGroup = group
            vData.addLabelDialogVisible = true
            vData.newLabelName = ""
        },
        ConfirmAddLabel() {
            AddLabel(vData.newLabelName)
            vData.addLabelDialogVisible = false
        },
        handleTabsEdit(targetName, action) {
            vData.addGroupDialogVisible = true
            vData.AddGroupFromDrawer = false
            vData.newGroupName = ""
        },
        handleTabsEdit1(targetName, action) {
            vData.addGroupDialogVisible = true
            vData.AddGroupFromDrawer = true
            vData.newGroupName = ""
        },
        OpenFile(file) {
            clickTimeout.clear()
            shell.openItem(path.join(rootDir, file.name));
            file.playCount++;
            SaveDB();
        },
        OpenDrawer(file) {
            clickTimeout.set(function () {
                vData.selectedFile = file
                vData.selectedTab = 1
                FillDrawer(file)
            });
        },
        SelectLable(isSelected, event, v1) {
            console.log(event.currentTarget.id)

            vData.files = Fileter()
        },
        fileClickGroup(tab, event) {},
        FileSelectLable(isSelected, event, v1) {
            let file = FindFile(vData.selectedFile.name)
            ModifyLabel2(file)
            SaveDB()
        },
        clearAllLabels() {
            ClearSelected()
            vData.files = Fileter()
        },
        handleClose(label) {
            label.selected = false
            vData.files = Fileter()
        },
        AddCollection(file) {
            for (let index in vData.collection) {
                let file1 = vData.collection[index]
                if (file1.name == file.name) {
                    return
                }
            }
            vData.collection.push(file)
        },
        Change(evt) {
            SaveDB()
        }
    },
    components: {
        draggable,
    }
}
</script>

<style>
.playcount {
    text-align: center;
    width: 25px;
    height: 50px;
    background-color: red;
    position: absolute;
    bottom: 100px;
    right: 0px;
}

.playcount1 {
    height: 200px;
    position: relative;
}

div:active [aaa=selected] {
    border: 2px solid;
    border-radius: 25px;
    -moz-border-radius: 25px;
}

.titlebar {
    -webkit-app-region: drag;
    height: 28px;
    background-color: dddddd;
}

.close {
    width: 28px;
    height: 28px;
    border-width: 8px;
    border-style: solid;
    border-color: dddddd;
    background: -webkit-linear-gradient(-45deg, transparent 0%, transparent 46%, black 46%, black 56%, transparent 56%, transparent 100%), -webkit-linear-gradient(45deg, transparent 0%, transparent 46%, black 46%, black 56%, transparent 56%, transparent 100%);
    background-color: dddddd;
    float: right;
    -webkit-app-region: no-drag;
}

.close:hover {
    width: 28px;
    height: 28px;
    border-width: 8px;
    border-style: solid;
    border-color: red;
    background: -webkit-linear-gradient(-45deg, transparent 0%, transparent 46%, white 46%, white 56%, transparent 56%, transparent 100%), -webkit-linear-gradient(45deg, transparent 0%, transparent 46%, white 46%, white 56%, transparent 56%, transparent 100%);
    background-color: red;
    float: right;
    -webkit-app-region: no-drag;
}

.open_dir {
    left: 80px;
    position: relative;
    width: 28px;
    height: 28px;
    transition: all 0.3s ease;
    border-width: 8px;
    border-style: solid;
    border-color: white;
    -webkit-app-region: no-drag;
}

.dir {
    left: calc(50% - 100px);
    position: relative;
    top: -4px;
    width: 200px;
    height: 24px;
    border: none;
    margin: 0px;
    -webkit-app-region: no-drag;
    font-size: 15px;
    /* text-align: center; */
}

.mainbody {
    height: calc(100% - 28px);
    display: flex;
    background-color: #d8d8d8;
}

.filebody {
    height: 100%;
    width: 70%;
    /* overflow:auto; */
}

.filebar {
    height: 28px;
}

.keyword {
    position: relative;
    top: -12px;
    width: 200px;
    height: 24px;
    font-size: 15px;
    border: none;
}

.searchbutton {
    height: 26px;
    width: 26px;
    border: none;
}

.sortbutton {
    height: 26px;
    width: 26px;
    border: none;
    float: right
}

.sidebar {
    width: 30%;
    background: #dedede;
    border-left: 3px solid #555555;
    height: 100%;
}

.tabs {
    height: 28px;
    background: #aaaaaa
}

.filterhead {
    /* background: #bbbbbb */
}

.tabbtn {
    height: 26px;
    width: 26px;
    border: none;
    margin-right: 5px;
    margin-left: 5px
}

.filefunc {
    height: 26px;
    width: 26px;
    border: none;
}

.group {
    margin-bottom: 10px;
    border-bottom: 3px solid #bbbbbb;
}

.groupbar {
    background: #bbbbbb;
    height: 28px;
}

.label {
    width: 50px;
    height: 30px;
}

.favoriteitem {
    position: relative;
    right: calc(50%-75px);
    border: radius 8px;
    height: 150px;
    margin-bottom: 10px;
}

.groupname {
    border: none;
    background: #bbbbbb
}

.groupname:hover {
    border-style: solid;
    border-color: #ffffff;
    background: #bbbbbb
}

.noselect {
    -webkit-touch-callout: none;
    -webkit-user-select: none;
    -khtml-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
}
</style>
