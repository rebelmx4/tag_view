<template>
<div id="app" class="frame">
    <div class="titlebar">
        <svgicon name="folder-open" class="open_dir" @click="OpenDir"></svgicon>
        <svgicon name="close" class="close" @click="CloseWin"></svgicon>
        <svgicon name="minimize" class="minimize" @click="Minimize"></svgicon>
    </div>
    <div class="main_body">
        <!-- file -->
        <div class="file_body">
            <div class="file_bar">
                <input type="text" class="keyword" v-model="keyword" @change="Search" />
                <!-- <svgicon name="icon-search" class="search_btn" @click="Search"> </svgicon>
                <svgicon name="time" :class="fileSortType == 1? 'sort_btn_asc' : fileSortType == 2? 'sort_btn_dec' : 'sort_btn'" @click="SetAddTimeSortType" title="head"></svgicon>
                <svgicon name="tag" :class="fileSortType == 3? 'sort_btn_asc' : fileSortType == 4? 'sort_btn_dec' : 'sort_btn'" @click="SetLabelNumSortType" title="head"></svgicon>
                <svgicon name="size" :class="fileSortType == 5? 'sort_btn_asc' : fileSortType == 6? 'sort_btn_dec' : 'sort_btn'" @click="SetSizeSortType" title="head"></svgicon>
                <svgicon name="duration" :class="fileSortType == 7? 'sort_btn_asc' : fileSortType == 8? 'sort_btn_dec' : 'sort_btn'" @click="SetDurationSortType" title="head"></svgicon> -->
                <button class="sort_btn" :class="fileSortType == sortTypes.duration_asc || fileSortType == sortTypes.duration_dec? 'sort_btn_selected' : 'sort_btn'" @click="SetDurationSortType">时长</button>
                <button class="sort_btn" :class="fileSortType == sortTypes.tag_asc || fileSortType == sortTypes.tag_dec? 'sort_btn_selected' : 'sort_btn'" @click="SetLabelNumSortType">标签数量</button>
                <button class="sort_btn" :class="fileSortType == sortTypes.time_asc || fileSortType == sortTypes.time_dec? 'sort_btn_selected' : 'sort_btn'" @click="SetAddTimeSortType">录入时间</button>
                <button class="sort_btn" :class="fileSortType == sortTypes.size_asc || fileSortType == sortTypes.size_dec? 'sort_btn_selected' : 'sort_btn'" @click="SetSizeSortType">文件大小</button>
                <svgicon name="up" :class="fileSortType % 2 == 1? 'sort_asc' : 'sort_dec'"></svgicon>
            </div>
            <div class="file_form">
                <el-row :gutter="30" :style="{'margin-left':'20px', 'margin-right':'20px'}">
                    <el-col :span="4" v-for="(item, index) in files" :style="{'height':'200px'}">
                        <div class="file">
                            <img :src="item.thumb" v-bind:id="item.name" @dblclick="OpenFile(item)" @click="ShowFileLables(item)" :class="item.isSelected?'file_img_selected':'file_img'">
                            <svgicon name="favorite" class="file_favorite" @click="AddCollection(item)"> </svgicon>
                        </div>
                    </el-col>
                </el-row>
            </div>
        </div>
        <!-- tools -->
        <div class="sidebar">
            <div class="tabs">
                <div :class="selectedTab == 0? 'tab_btn_selected' : 'tab_btn'" @click="selectedTab = 0">
                    <svgicon name="filter" :class="selectedTab == 0? 'tab_btn_img_selected' : 'tab_btn_img'" @click="selectedTab = 0" title="head"></svgicon>
                </div>
                <div :class="selectedTab == 1? 'tab_btn_selected' : 'tab_btn'" @click="selectedTab = 1">
                    <svgicon name="tags" :class="selectedTab == 1? 'tab_btn_img_selected' : 'tab_btn_img'" @click="selectedTab = 1" title="head"></svgicon>
                </div>
                <div :class="selectedTab == 2? 'tab_btn_selected' : 'tab_btn'" @click="selectedTab = 2">
                    <svgicon name="file" :class="selectedTab == 2? 'tab_btn_img_selected' : 'tab_btn_img'" @click="selectedTab = 2" title="head"></svgicon>
                </div>
                <div :class="selectedTab == 3? 'tab_btn_selected' : 'tab_btn'" @click="selectedTab = 3">
                    <svgicon name="albums" :class="selectedTab == 3? 'tab_btn_img_selected' : 'tab_btn_img'" @click="selectedTab = 3" title="head"></svgicon>
                </div>
            </div>
            <!-- filter -->
            <div v-if="selectedTab == 0" :style="{'height':'100%'}">
                <!-- head -->
                <div class="filter_head">
                    <svgicon name="add" class="filter_btn" @click="ShowGroupDialog" title="head"></svgicon>
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
                            <svgicon name="add" class="group_btn" @click="ShowAddLableDialog(group)" title="head"></svgicon>
                        </div>
                        <!-- https://www.jianshu.com/p/03f0f58f84cc -->
                        <draggable :options="{group:'label',animation:150,ghostClass:'sortable-ghost',chosenClass:'chosenClass',scroll:true,scrollSensitivity:200}" v-model="group.labels" @change="OnChangeLabelOrder">
                            <button v-for="(label, index) in group.labels" :class="{labelSelected:label.selected, labelUnselected:!label.selected}" @click="SelectLable(label)" @dblclick="changeLable(group, label)">
                                {{label.name}}
                            </button>
                        </draggable>
                    </div>
                </div>
            </div>
            <!-- label -->
            <div v-else-if="selectedTab == 1" :style="{'height':'100%'}">
                <span>{{selectedFile.name}}</span>
                <br>
                <img :src="selectedFile.thumb" width="150px" height="150px" :style="{'border-radius':'8px'}">
                <div class="filter_head">
                    <svgicon name="add" class="filter_btn" @click="ShowGroupDialog" title="head"></svgicon>
                </div>
                <div class="group_label_container">
                    <div v-for="(group, index) in groups" class="group_label">
                        <div class="group_bar">
                            <input type="text" class="groupname" v-model="group.name" @change="changeGroupName">
                            <svgicon name="selectall" class="group_btn" @click="selectAllOfGroup(group)" title="head"></svgicon>
                            <svgicon name="clear" class="group_btn" @click="clearLabelsOfGroup(group)" title="head"></svgicon>
                            <svgicon v-show="group.isUnion == false" name="filter-1" class="group_btn" @click="Setfiter(group)"></svgicon>
                            <svgicon v-show="group.isUnion == true" name="filter-9" class="group_btn" @click="Setfiter(group)"></svgicon>
                            <svgicon name="delete" class="group_btn" @click="OpenDeleteGroupDialog(group)" title="head"></svgicon>
                            <svgicon name="add" class="group_btn" @click="ShowAddLableDialog(group)" title="head"></svgicon>
                        </div>
                        <!-- https://www.jianshu.com/p/03f0f58f84cc -->
                        <draggable :options="{group:'label',animation:150,ghostClass:'sortable-ghost',chosenClass:'chosenClass',scroll:true,scrollSensitivity:200}" v-model="group.labels" @change="OnChangeLabelOrder">
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

    <el-dialog title="添加标签" :visible.sync="addLabelDialogVisible" append-to-body>
        <el-form @submit.native.prevent>
            <el-form-item label="名称">
                <input ref="newLabelName" v-model="newLabelName" v-on:keyup.enter="ConfirmAddLabel">
            </el-form-item>
        </el-form>
    </el-dialog>
    <el-dialog title="添加组" :visible.sync="addGroupDialogVisible" append-to-body>
        <el-form>
            <el-form-item label="名称">
                <input ref="newGroupName" v-model="newGroupName" v-on:keyup.enter="ConfirmAddGroup">
                <el-select v-model="sortType" placeholder="请选择">
                    <el-option v-for="item in sortTypes" :key="item" :label="item" :value="item">
                    </el-option>
                </el-select>
            </el-form-item>
        </el-form>
    </el-dialog>
    <el-dialog title="删除组" :visible.sync="showDeleteGroupDialog" append-to-body>
        {{"确定要删除" + selectedGroup.name}}
        <div slot="footer" class="dialog-footer">
            <el-button type="primary" @click="ConfirmDeleteGroup(selectedGroup)">确 定</el-button>
        </div>
    </el-dialog>

    <el-dialog title="修改标签" :visible.sync="changeLabelDialogVisible" append-to-body>
        <el-form>
            <el-form-item label="名称">
                <input ref="newLabelName2" v-model="willchangeLabelname" v-on:keyup.enter="ConfirmChangeLabel">
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
var appConfig = require("./AppConfig")
var labelData = require("./LabelData")
var fileData = require("./FileData")
let fsDataS = require("./FsData")
var FFmpeg = require('fluent-ffmpeg');
import '../icons'
import {
    filter
} from 'minimatch';

let rootDir
let thumbDir
let fsData

let vData = {}
vData.selectedGroup = {}
vData.groups = []
vData.files = []
vData.selectedFile = {}
vData.addGroupDialogVisible = false
vData.addLabelDialogVisible = false
vData.newGroupName = ""
vData.newLabelName = ""
vData.sortTypes = ["number", "1"]
vData.sortType = "number"
vData.selectedTab = ""
vData.collection = []
vData.keyword = ""
vData.showDeleteGroupDialog = false
vData.willchangeLabel = {}
vData.changeLabelDialogVisible = false
vData.willchangeLabelname = ""

let appData = appConfig.load()
vData.recentDirs = appData.recentDirs

if (vData.recentDirs.length > 0) {
    Init(vData.recentDirs[0])
}

function Init(rdir) {
    rootDir = rdir
    let libDir = path.join(rootDir, ".library")
    thumbDir = path.join(libDir, "Thumb")

    if (!fs.existsSync(libDir)) {
        fs.mkdirSync(libDir)
    }

    if (!fs.existsSync(thumbDir)) {
        fs.mkdirSync(thumbDir)
    }

    fsData = fsDataS.Init(rootDir)
    vData.files = fileData.Init(path.join(libDir, "file.db")).files
    vData.groups = labelData.Init(path.join(libDir, "groups.db"))

    //add new file
    fsDataS.Foreach(function (info) {
        fileData.AddFile(info.name, info.size)
    })
    ClearInvaildFileMeta()
    GenThumbs()
    ClearInvaildThumb()

    fileData.Save()

    labelData.ClearSelected1()
    labelData.ClearSelected()

    vData.fileSelectedGroup = ""

    vData.selectedFile = {}
    vData.newGroupName = ""
    vData.newLabelName = ""

    vData.sortTypes = fileData.sortTypes
    vData.fileSortType = vData.sortTypes.time_dec

    Filter()
}

//file
function ClearInvaildFileMeta() {
    let i = vData.files.length;
    while (i--) {
        let info = vData.files[i]
        if (fsDataS.Find(info.name) == false) {
            vData.files.splice(i, 1)
        }
    }
}

function ClearInvaildThumb() {
    let thumbs = fs.readdirSync(thumbDir)
    let thumbDiff = thumbs.filter(function (x) {
        let isfind = false
        for (let index in vData.files) {
            if (vData.files[index].name + ".jpg" == x) {
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

function GenThumb(videoPath, path, info) {
    let p = new Promise(function (resolve, reject) {
        let command = FFmpeg()
            .input(videoPath)
            .ffprobe(function (err, data) {
                if (err) {
                    reject(err);
                    return;
                }

                info.duration = data.format.duration
                var streams = data.streams;
                if (streams) {
                    streams.map((value) => {
                        if (value.codec_type == 'video') {
                            info.width = value.width
                            info.height = value.height
                        }
                    })
                }
            });
        
        fileData.Save()
    });

    var proc = new FFmpeg(videoPath)
            .takeScreenshots({count:1,timemarks:['50%'],filename:path}, '' )
            .on('end', function(err) {
                info.thumb = path
                fileData.Save()} 
                )
}

// function GenThumb(filePath, thumbPath, info) {
//     let cmd = 'ffmpeg -i "' + filePath + '" 2>&1 | FindStr "Duration"'
//     var process = cp.exec(cmd);

//     videoSupport(filePath)

//     process.stdout.on('data', function (data) {
//         var items = data.split(",")

//         if (items.length > 1) {
//             var str = items[0].substring(0, "   Duration: ".length - 1)
//             if (str == "  Duration: ") {
//                 let time = hmsToSecondsOnly(items[0].substring("   Duration: ".length).split(".")[0])
//                 info.duration = time
//                 var thumbProcess = cp.exec('ffmpeg -ss ' + time * 0.5 + ' -i "' + filePath + '" -y -f image2  -vframes 1 -s 352x240 "' + thumbPath + '"');
//                 thumbProcess.stderr.on('data', function (d) {
//                     console.log(d)
//                 })
//                 thumbProcess.on('exit', (code) => {
//                     info.thumb = thumbPath
//                     info.duration = time
//                     labelData.Save()
//                 })
//             }
//         }
//     });
//     process.stderr.on('uncaughtException', err => {
//         console.log(err)
//     })
// }

function GenThumbs() {
    for (let fileindex in vData.files) {
        let filename = vData.files[fileindex].name
        let filePath = path.join(rootDir, filename)
        let thumbPath = path.join(thumbDir, filename + ".jpg")
        if (!fs.existsSync(thumbPath)) {
            vData.files[fileindex].thumb = ""
            GenThumb(filePath, thumbPath, vData.files[fileindex])
        }
        else {
            vData.files[fileindex].thumb = thumbPath
        }
    }
}

//vdata
function Filter() {
    let result = []
    let files = fileData.Search(vData.keyword)
    if (!labelData.HasSelectedLabel())
        result = files
    else {
        for (let index in files) {
            if (labelData.Filter(files[index].labels)) {
                result.push(files[index])
            }
        }
    }

    vData.files = fileData.sort(result, vData.fileSortType);
}

let clickTimeout = {
    _timeout: null,
    set: function (fn) {
        var that = this;
        that.clear();
        that._timeout = window.setTimeout(fn, 50);
    },
    clear: function () {
        var that = this;
        if (that._timeout) {
            window.clearTimeout(that._timeout);
        }
    }
};

function SetFileSortType(num1, num2) {
    if (vData.fileSortType == num1) {
        vData.fileSortType = num2
    } else if (vData.fileSortType == num2) {
        vData.fileSortType = vData.sortTypes.time_dec
    } else {
        vData.fileSortType = num1
    }
}

export default {
    name: 'tag_view',
    data() {
        return vData
    },
    methods: {
        CloseWin() {
            remote.getCurrentWindow().close()
        },
        Minimize() {
            remote.BrowserWindow.getFocusedWindow().minimize();
        },
        changeGroupName() {
            labelData.Save()
        },
        OpenDir() {
            remote.dialog.showOpenDialog(remote.getCurrentWindow(), {
                properties: ['openDirectory']
            }, (filename) => {
                if (filename != undefined && filename.length === 1) {
                    if (appConfig.isCurDir(filename[0])) {
                        return
                    } else {
                        appConfig.Unshift(filename[0])
                        Init(filename[0])
                    }
                }
            })
        },
        Search() {
            Filter()
        },
        ShowGroupDialog() {
            vData.addGroupDialogVisible = true
            let self = this
            self.$nextTick()
                .then(function () {
                    self.$refs.newGroupName.focus()
                })
        },
        ConfirmAddGroup() {
            vData.addGroupDialogVisible = false
            labelData.AddGroup(vData.groups, vData.newGroupName, vData.sortType)
            vData.newGroupName = ""
        },
        ShowAddLableDialog(group) {
            vData.selectedGroup = group
            vData.addLabelDialogVisible = true
            let self = this
            self.$nextTick()
                .then(function () {
                    self.$refs.newLabelName.focus()
                })
        },
        ConfirmAddLabel() {
            labelData.AddLabel(vData.selectedGroup, vData.newLabelName)
            vData.addLabelDialogVisible = false
            vData.newLabelName = ""
        },
        changeLable(group, label) {
            clickTimeout.clear()
            vData.willchangeLabelname = label.name
            vData.changeLabelDialogVisible = true
            vData.willchangeLabel = label
            vData.willChangeLabelOfGroup = group
            let self = this
            self.$nextTick()
                .then(function () {
                    self.$refs.newLabelName2.focus()
                })
        },
        OpenFile(file) {
            fileData.SetSelected(file)
            clickTimeout.clear()
            shell.openItem(path.join(rootDir, file.name));
            file.playCount++;
            fileData.Save();
        },
        ShowFileLables(file) {
            clickTimeout.set(function () {
                fileData.SetSelected(file)
                vData.selectedFile = file
                vData.selectedTab = 1
                labelData.SetSelected1(file.labels)
            });
        },
        SelectLable(label) {
            clickTimeout.set(function () {
                label.selected = !label.selected
                Filter()
            });
        },
        FileSelectLable(label, event) {
            label.selected1 = !label.selected1
            fileData.SetLabels(vData.selectedFile, labelData.GetFileLabels())
        },
        clearAllLabels() {
            labelData.ClearSelected()
            Filter()
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
        OnChangeLabelOrder(evt) {
            SaveDB()
        },
        OpenDeleteGroupDialog(group) {
            vData.showDeleteGroupDialog = true
            vData.selectedGroup = group
        },
        ConfirmDeleteGroup() {
            labelData.DeleteGroup(vData.groups, vData.selectedGroup.name)
            vData.showDeleteGroupDialog = false
        },
        deletelabel() {
            labelData.DeleteLabel(vData.willChangeLabelOfGroup, vData.willchangeLabel)
            vData.changeLabelDialogVisible = false
        },
        ConfirmChangeLabel() {
            vData.willchangeLabel.name = vData.willchangeLabelname
            labelData.Save()
            vData.changeLabelDialogVisible = false
        },
        clearLabelsOfGroup(group) {
            labelData.clearLabelsByGroup(group)
            Filter()
        },
        selectAllOfGroup(group) {
            labelData.selectAllByGroup(group)
            Filter()
        },
        Setfiter(group) {
            group.isUnion = !group.isUnion
        },
        SetAddTimeSortType(group) {
            SetFileSortType(1, 2)
            Filter()
        },
        SetLabelNumSortType(group) {
            SetFileSortType(3, 4)
            Filter()
        },
        SetSizeSortType(group) {
            SetFileSortType(5, 6)
            Filter()
        },
        SetDurationSortType(group) {
            SetFileSortType(7, 8)
            Filter()
        }
    },
    components: {
        draggable,
    }
}
</script>

<style>
@import "../style.css"
</style>
