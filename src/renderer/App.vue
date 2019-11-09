<template>
<div id="app" :style="{'position':'fixed','width':'100%','height':'100%', 'background':'#696969'}">
    <div id="titlebar" style="-webkit-app-region:drag">
        <input type="text" style="-webkit-app-region:no-drag" v-model="rootDir" />
        <el-button @click="OpenDir" style="-webkit-app-region:no-drag">open</el-button>
        <div id="titlebar" style=" float:right">
            <el-button @click="CloseWin" style="-webkit-app-region:no-drag">x</el-button>
        </div>
    </div>
    <div :style="{'height':'70%','background':'#91D100','overflow':'auto','overflow-x':'hidden'}">
        <br />
        <el-row :gutter="30" :style="{'height':'100%', 'margin-left':'20px', 'margin-right':'20px'}">
            <el-col :span="4" v-for="(item, index) in files">
                <img v-bind:src="item.thumb" v-bind:id="item.name" width="100%" @dblclick="OpenFile" @click="OpenDrawer" :style="{'border-radius':'8px'}">
                <p>{{item.name}}</p>
                <br />
            </el-col>
        </el-row>
        <el-button @click="clearAllLabels" :style="{'position':'fixed', 'bottom':'0', 'right':'0'}">clear</el-button>
    </div>
    <div v-for="(group, index) in groups">
        <el-tag v-for="(label, index1) in group.labels" v-if="label.selected == true" closable @close="handleClose(label)">
            {{label.name}}
        </el-tag>
    </div>
    <div :style="{'height':'30%','background':'#78BA00'}">
        <el-tabs v-model="selectedGroup" @tab-click="clickGroup" type="border-card" @tab-add="handleTabsEdit" addable>
            <el-tab-pane v-for="(item, index) in groups" :label="item.name">
                <el-checkbox v-for="(label, index) in item.labels" v-bind:id="label.id" :label="label.name" v-model="label.selected" @change="SelectLable"></el-checkbox>
                <el-button type="primary" round @click="AddLabel">+</el-button>
            </el-tab-pane>
        </el-tabs>
    </div>
    <el-drawer :title="selectedFile" :visible.sync="drawerShow" size="50%">
        <el-tabs v-model="fileSelectedGroup" @tab-click="fileClickGroup" type="border-card">
            <el-tab-pane v-for="(item, index) in fileGroups" :label="item.name">
                <el-checkbox v-for="(label, index) in item.labels" v-bind:id="label.id" :label="label.name" v-model="label.selected1" @change="FileSelectLable"></el-checkbox>
            </el-tab-pane>
        </el-tabs>
    </el-drawer>
    <el-dialog title="添加组" :visible.sync="addGroupDialogVisible">
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
    <el-dialog title="添加标签" :visible.sync="addLabelDialogVisible">
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
//label
var fs = require('fs');
var path = require('path');
var cp = require('child_process');
const shell = require('electron').shell;
const remote = require('electron').remote;

const dataVersion = 1.0
let rootDir
let libDir
let dbPath
let thumbDir

let vData = {}

let mData = {}
let fsData
vData.selectedGroup = ""
vData.fileSelectedGroup = ""
vData.groups = []
vData.fileGroups = []
vData.files = []
vData.drawerShow = false
vData.selectedFile = ""
vData.addGroupDialogVisible = false
vData.newGroupName = ""
vData.addLabelDialogVisible = false
vData.newLabelName = ""
vData.files = []
vData.rootDir = ""
vData.sortTypes = ["number", "1"]
vData.sortType = "number"

let appData = {}

function ReadAppConfig() {
    if (fs.existsSync("./config.json")) {
        let jsonstr = fs.readFileSync("./config.json")
        appData = JSON.parse(jsonstr)

        let i = appData.recentDirs.length;
        while (i--) {
            let path = appData.recentDirs[i]
            if (!fs.existsSync(path)) {
                appData.recentDirs.splice(i, 1);
            }
        }

        vData.recentDirs = appData.recentDirs
        for (let index in vData.recentDirs) {
            let path = vData.recentDirs[index]
            if (fs.existsSync(path)) {
                Init(path)
            }
        }

    } else {
        appData = {}
        appData.recentDirs = []
        SaveAppConfig()
        vData.recentDirs = []
    }
}

ReadAppConfig()

function SaveAppConfig() {
    let jsonstr = JSON.stringify(appData, null, 2)
    fs.writeFileSync("./config.json", jsonstr, 'utf8')
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
    vData.drawerShow = false
    vData.selectedFile = ""
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
    for (let index in mData.files) {
        let info = mData.files[index]
        let isFound = false
        for (let index1 in fsData) {
            let info1 = fsData[index1]
            if (info1.name == info.name) {
                isFound = true
                break
            }
        }

        if (isFound == false)
            mData.splice(index, 1)
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

function FillDrawer(name) {
    ClearSelected1()

    for (let fileindex in mData.files) {
        let filename = mData.files[fileindex].name
        if (filename == name) {
            for (let lableindex in mData.files[fileindex].labels) {
                let label = mData.files[fileindex].labels[lableindex]
                let labelinfo = FindLabelInfo(label)
                labelinfo.selected1 = true
            }
        }
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

function AddLabel(groupName, labelName) {
    for (let groupindex in mData.groups) {
        let group = mData.groups[groupindex]
        if (groupindex == groupName) {
            let label = {}
            label.name = labelName
            label.id = (++mData.maxlabelId).toString()
            label.selected = false
            label.selected1 = false
            group.labels.push(label)
            if (group.sortType == "number") {
                group.labels.sort(labelCompare)
            }

            SaveDB()
            break
        }
    }
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
        OpenDir() {
            const dialog = remote.dialog
            dialog.showOpenDialog(remote.getCurrentWindow(), {
                properties: ['openDirectory']
            }, (filename) => {
                if (filename != undefined && filename.length === 1) {
                    vData.recentDirs.unshift(filename[0])
                    appData.recentDirs.unshift(filename[0])
                    let jsonstr = JSON.stringify(appData, null, 2)
                    fs.writeFileSync("./config.json", jsonstr, 'utf8')
                    Init(filename[0])
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
        AddLabel() {
            vData.addLabelDialogVisible = true
        },
        ConfirmAddLabel() {
            AddLabel(vData.selectedGroup, vData.newLabelName)
            vData.addLabelDialogVisible = false
        },
        handleTabsEdit(targetName, action) {
            vData.addGroupDialogVisible = true
        },
        OpenFile(event) {
            clickTimeout.clear()
            shell.openItem(path.join(rootDir, event.currentTarget.id));
            let file = FindFile(event.currentTarget.id)
            file.playCount++;
            SaveDB();
        },
        OpenDrawer(event) {
            let id = event.currentTarget.id
            clickTimeout.set(function () {
                vData.selectedFile = id
                FillDrawer(id)
                vData.drawerShow = true
            });
        },
        clickGroup(tab, event) {
            console.log(tab, event);
        },
        SelectLable(isSelected, event, v1) {
            console.log(event.currentTarget.id)

            vData.files = Fileter()
        },
        fileClickGroup(tab, event) {},
        FileSelectLable(isSelected, event, v1) {
            let file = FindFile(vData.selectedFile)
            ModifyLabel2(file)
            SaveDB()
        },
        clearAllLabels()
        {
            ClearSelected()
            vData.files = Fileter()
        },
        handleClose(label)
        {
            label.selected = false
            vData.files = Fileter()
        }
    }
}
</script>

<style>
/* CSS */
</style>
