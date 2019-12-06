var fs = require("fs");
var cp = require("child_process");
const shell = require("electron").shell;
const remote = require("electron").remote;

let data;
let version = 1;
let path;
let selectedLabelOfGroup = [];
let groupdata

function Init(dbPath) {
  path = dbPath;
  if (!fs.existsSync(path)) {
    data = {};
    data.maxlabelId = 1;
    data.groups = [];
    data.version = version;
    Save();
  } else {
    let str = fs.readFileSync(path);
    data = JSON.parse(str);
  }

  groupdata = data.groups

  return groupdata;
}

function labelCompare(a, b) {
  if (a.name < b.name) {
    // 按某种排序标准进行比较, a 小于 b
    return -1;
  }
  if (a.name > b.name) {
    return 1;
  }
  // a must be equal to b
  return 0;
}

function AddLabel(group, name) {
  if(name == "")
    return 

  for (let index in group.labels) {
    let label = group.labels[index];
    if (label.name == name) {
      return 
    }
  }

  let label = {};
  label.name = name;
  label.id = ++data.maxlabelId;
  label.selected = false;
  label.selected1 = false;
  label.changing = false;
  group.labels.push(label);
  if (group.sortType == "number") {
    group.labels.sort(labelCompare);
  }

  Save()
}

function DeleteLabel(group, label) {
  for (var i = 0; i < group.labels.length; i++) {
    if (group.labels[i].id == label.id) {
      group.labels.splice(i, 1);
      Save()
      break;
    }
  }
}

function AddGroup(groups, name, sortType) {
  for (let index in groups) {
    let group = groups[index];
    if (group.name == name) {
      return 
    }
  }

  let group = {};
  group.name = name;
  group.sortType = sortType;
  group.labels = [];
  group.isUnion = true
  groups.push(group);

  Save()
}

function DeleteGroup(groups, name) {
  for (var i = 0; i < groups.length; i++) {
    if (groups[i].name == name) {
      groups.splice(i, 1);
      Save()
      break;
    }
  }
}

function Save() {
  let jsonstr = JSON.stringify(data, null, 2);
  fs.writeFileSync(path, jsonstr, "utf8");
}

function clearLabelsByGroup(group) {
  for (let index in group.labels) {
    let label = group.labels[index];
    label.selected = false;
  }
}

function selectAllByGroup(group) {
  for (let index in group.labels) {
    let label = group.labels[index];
    label.selected = true;
  }
}

function Contain(filelabels, labels) {
  for (let index in labels) {
      if (!filelabels.includes(labels[index].id)) {
        return false;
      }
  }

  return true;
}

function Some(filelabels, labels) {
  for (let index in labels) {
      if (filelabels.includes(labels[index].id)) {
        return true;
      }
  }

  return false;
}

function HasSelectedLabel() {
  for (let groupindex in data.groups) {
    let group = data.groups[groupindex];
    for (let labelIndex in group.labels) {
      let label = group.labels[labelIndex];
      if (label.selected == true) {
        return true;
      }
    }
  }

  return false;
}

function RefreshSelectedLabel() {
  selectedLabelOfGroup = [];
  for (let groupindex in data.groups) {
    let group = data.groups[groupindex];
    group.selectedLabels = [];

    for (let labelIndex in group.labels) {
      let label = group.labels[labelIndex];
      if (label.selected == true) {
        group.selectedLabels.push(label);
      }
    }
  }
}

function Filter(filelabels) {
  RefreshSelectedLabel()

  for (let index in data.groups) {
    let group = data.groups[index];
    if (group.selectedLabels.length > 0) {
      if (group.isUnion == true) {
        if (!Some(filelabels, group.selectedLabels)) return false;
      } else {
        if (!Contain(filelabels, group.selectedLabels)) return false;
      }
    }
  }

  return true;
}

function GetFileLabels()
{
  let selectedLabels = []
    for (let groupindex in data.groups) {
        let group = data.groups[groupindex]
        for (let labelIndex in group.labels) {
            let label = group.labels[labelIndex]
            if (label.selected1 == true) {
                selectedLabels.push(label.id)
            }
        }
    }

    return selectedLabels
}

function ClearSelected() {
  for (let groupindex in data.groups) {
      let group = data.groups[groupindex]
      for (let labelindex in group.labels) {
          group.labels[labelindex].selected = false
      }
  }
}

function ClearSelected1() {
  for (let groupindex in data.groups) {
      let group = data.groups[groupindex]
      for (let labelindex in group.labels) {
          group.labels[labelindex].selected1 = false
      }
  }
}

function FindLabelInfo(id) {
  for (let groupindex in groupdata) {
      let group = groupdata[groupindex]
      for (let labelindex in group.labels) {
          let label = group.labels[labelindex]
          if (label.id == id) {
              return label
          }
      }
  }

  return null
}

function SetSelected1(labels)
{
  ClearSelected1()

  for (let lableindex in labels) {
      let label = labels[lableindex]
      let labelinfo = FindLabelInfo(label)
      labelinfo.selected1 = true
  }
}

export {
  Init,
  DeleteGroup,
  AddGroup,
  AddLabel,
  DeleteLabel,
  Save,
  clearLabelsByGroup,
  selectAllByGroup,
  Filter,
  HasSelectedLabel,
  GetFileLabels,
  ClearSelected1,
  ClearSelected,
  SetSelected1
};
