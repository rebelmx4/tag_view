<template>
<div id="app" :style="{'position':'fixed','width':'100%','height':'100%'}">
    <div class="titlebar">
        <svgicon name="folder-open" class="open_dir" @click="OpenDir"></svgicon>
        <svgicon name="close" class="close" @click="CloseWin"></svgicon>
        <svgicon name="minimize" class="minimize" @click="Minimize"></svgicon>
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
                <el-col :span="4" v-for="(item, index) in files" :class="{ active: isActive }" :style="{'height':'200px'}">
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
                <svgicon name="filter" :class="selectedTab == 0? 'tab_btn_selected' : 'tab_btn'" @click="selectedTab = 0" title="head"></svgicon>
                <svgicon name="tags" :class="selectedTab == 1? 'tab_btn_selected' : 'tab_btn'" @click="selectedTab = 1" title="head"></svgicon>
                <svgicon name="file" :class="selectedTab == 2? 'tab_btn_selected' : 'tab_btn'" @click="selectedTab = 2" title="head"></svgicon>
                <svgicon name="Collection" :class="selectedTab == 3? 'tab_btn_selected' : 'tab_btn'" @click="selectedTab = 3" title="head"></svgicon>
            </div>
            <!-- filter -->
            <div v-if="selectedTab == 0" :style="{'height':'100%'}">
                <!-- head -->
                <div class="filter_head">
                    <svgicon name="add" class="filter_btn" @click="addGroupDialogVisible = true" title="head"></svgicon>
                    <svgicon name="clear" class="filter_btn" @click="clearAllLabels"></svgicon>
                </div>
                <div class="group_container">
                    <div v-for="(group, index) in groups" class="group">
                        <div class="group_bar">
                            <input type="text" class="groupname" v-model="group.name" @change="changeGroupName">
                            <svgicon name="selectall" class="group_btn" @click="selectAllOfGroup(group)" title="head"></svgicon>
                            <svgicon name="clear" class="group_btn" @click="clearLabelsOfGroup(group)" title="head"></svgicon>
                            <svgicon v-show="group.isUnion == false" name="filter-1" class="group_btn" @click="Setfiter(group)"></svgicon>
                            <svgicon v-show="group.isUnion == true" name="filter-9" class="group_btn" @click="Setfiter(group)"></svgicon>
                            <svgicon name="delete" class="group_btn" @click="OpenDeleteGroupDialog(group)" title="head"></svgicon>
                            <svgicon name="add" class="group_btn" @click="AddLabel(group)" title="head"></svgicon>
                        </div>
                        <!-- https://www.jianshu.com/p/03f0f58f84cc -->
                        <draggable :options="{group:'label',animation:150,ghostClass:'sortable-ghost',chosenClass:'chosenClass',scroll:true,scrollSensitivity:200}" v-model="group.labels" @change="Change">
                            <button v-for="(label, index) in group.labels" :class="{labelSelected:label.selected, labelUnselected:!label.selected}" @click="SelectLable(label)" @dblclick="changeLable(group, label)">
                                {{label.name}}
                            </button>
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
                <!-- <div :style="{'height':'100%', 'overflow':'auto'}">
                    <div v-for="(item, index) in groups" class="group">
                        <input type="text" class="groupname" v-model="item.name" @change="changeGroupName">    
                        <svgicon name="delete" class="group_btn" @click="OpenDeleteGroupDialog(group)" title="head"></svgicon>
                        <svgicon name="add" class="group_btn" @click="AddLabel(group)" title="head"></svgicon>
                        <br>
                        <br>
                        <draggable :options="{group:'label',animation:150,ghostClass:'sortable-ghost',chosenClass:'chosenClass',scroll:true,scrollSensitivity:200}" v-model="item.labels" @change="Change">
                            <el-checkbox v-for="(label, index) in item.labels" :label="label.name" v-model="label.selected1" @change="FileSelectLable" class="label"></el-checkbox>
                        </draggable>
                    </div>
                </div> -->
                <div class="group_container">
                    <div v-for="(group, index) in groups" class="group">
                        <div class="group_bar">
                            <input type="text" class="groupname" v-model="group.name" @change="changeGroupName">
                            <svgicon name="selectall" class="group_btn" @click="selectAllOfGroup(group)" title="head"></svgicon>
                            <svgicon name="clear" class="group_btn" @click="clearLabelsOfGroup(group)" title="head"></svgicon>
                            <svgicon v-show="group.isUnion == false" name="filter-1" class="group_btn" @click="Setfiter(group)"></svgicon>
                            <svgicon v-show="group.isUnion == true" name="filter-9" class="group_btn" @click="Setfiter(group)"></svgicon>
                            <svgicon name="delete" class="group_btn" @click="OpenDeleteGroupDialog(group)" title="head"></svgicon>
                            <svgicon name="add" class="group_btn" @click="AddLabel(group)" title="head"></svgicon>
                        </div>
                        <!-- https://www.jianshu.com/p/03f0f58f84cc -->
                        <draggable :options="{group:'label',animation:150,ghostClass:'sortable-ghost',chosenClass:'chosenClass',scroll:true,scrollSensitivity:200}" v-model="group.labels" @change="Change">
                            <button v-for="(label, index) in group.labels" :class="{labelSelected:label.selected1, labelUnselected:!label.selected1}" @click="FileSelectLable(label)" @dblclick="changeLable(group, label)">
                                {{label.name}}
                            </button>
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
    <el-dialog title="删除组" :visible.sync="showDeleteGroupDialog" append-to-body>
        {{"确定要删除" + selectedGroup.name}}
        <div slot="footer" class="dialog-footer">
            <el-button @click="showDeleteGroupDialog = false">取 消</el-button>
            <el-button type="primary" @click="ConfirmDeleteGroup(selectedGroup)">确 定</el-button>
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
    <el-dialog title="修改标签" :visible.sync="changeLabelDialogVisible" append-to-body>
        <el-form>
            <el-form-item label="名称">
                <el-input v-model="willchangeLabelname" autocomplete="off"></el-input>
            </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
            <el-button @click="deletelabel">删 除</el-button>
            <el-button @click="changeLabelDialogVisible = false">取 消</el-button>
            <el-button type="primary" @click="ConfirmChangeLabel">确 定</el-button>
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
var labelData = require("./LabelData")
import '../icons'
import '../icons'

const dataVersion = 1.0
let rootDir
let libDir
let dbPath
let thumbDir
let labelDBPath = ""

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
vData.tabs = ["el-icon-search", "el-icon-paperclip", "el-icon-files", "el-icon-collection"]
vData.selectedTab = ""
vData.collection = []
vData.keyword = ""
vData.showDeleteGroupDialog = false
vData.willchangeLabel = {};
vData.changeLabelDialogVisible = false
vData.willchangeLabelname = ""

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
        data1.groups = []
        data1.files = []
        data1.version = dataVersion
        let jsonstr = JSON.stringify(data1, null, 2)
        fs.writeFileSync(dbPath, jsonstr, 'utf8')
    }
    labelDBPath = path.join(libDir, "groups.db")

    fsData = ReadFileSystem()
    mData = ReadDB()
    mData.groups = labelData.Init(labelDBPath)
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
    vData.files = Filter()
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

function Filter() {
    if (!labelData.HasSelectedLabel())
        return mData.files

    let result = []
    for (let index in mData.files) {
        if (labelData.Filter(mData.files[index].labels)) {
            result.push(mData.files[index])
        }
    }

    return result
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
            labelData.AddGroup(vData.groups, vData.newGroupName, vData.sortType)
            vData.newGroupName = ""
            labelData.Save()
        },
        AddLabel(group) {
            vData.selectedGroup = group
            vData.addLabelDialogVisible = true
            vData.newLabelName = ""

        },
        ConfirmAddLabel() {
            labelData.AddLabel(vData.selectedGroup, vData.newLabelName)
            vData.addLabelDialogVisible = false
            labelData.Save()
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
        SelectLable(label) {
            clickTimeout.set(function () {
                label.selected = !label.selected
                vData.files = Filter()
            });
        },
        changeLable(group, label) {
            clickTimeout.clear()
            vData.willchangeLabelname = label.name
            vData.changeLabelDialogVisible = true
            vData.willchangeLabel = label
            vData.willChangeLabelOfGroup = group
        },
        OnShow(event) {
            console.log(event)
        },
        onchanginglabel(event) {
            event.stopPropagation()
        },
        onChanginglabel1(label) {
            label.changing = false
            labelData.Save()
        },
        fileClickGroup(tab, event) {},
        FileSelectLable(label, event) {
            let file = FindFile(vData.selectedFile.name)
            label.selected1 = !label.selected1
            ModifyLabel2(file)
            SaveDB()
        },
        clearAllLabels() {
            ClearSelected()
            vData.files = Filter()
        },
        handleClose(label) {
            label.selected = false
            vData.files = Filter()
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
        },
        Minimize() {
            remote.BrowserWindow.getFocusedWindow().minimize();
        },
        OpenDeleteGroupDialog(group) {
            vData.showDeleteGroupDialog = true
            vData.selectedGroup = group
        },
        ConfirmDeleteGroup() {
            labelData.DeleteGroup(vData.groups, vData.selectedGroup.name)
            labelData.Save()
            vData.showDeleteGroupDialog = false
        },
        deletelabel() {
            labelData.DeleteLabel(vData.willChangeLabelOfGroup, vData.willchangeLabel)
            labelData.Save()
            vData.changeLabelDialogVisible = false
        },
        ConfirmChangeLabel() {
            vData.willchangeLabel.name = vData.willchangeLabelname
            labelData.Save()
            vData.changeLabelDialogVisible = false
        },
        clearLabelsOfGroup(group) {
            labelData.clearLabelsByGroup(group)
            vData.files = Filter()
        },
        selectAllOfGroup(group) {
            labelData.selectAllByGroup(group)
            vData.files = Filter()
        },
        Setfiter(group) {
            group.isUnion = !group.isUnion
        }
    },
    components: {
        draggable,
    }
}
</script>

<style>
@import "../../static/style.css"
</style>
