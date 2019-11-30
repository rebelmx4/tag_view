var fs = require("fs");
var cp = require("child_process");
const shell = require("electron").shell;
const remote = require("electron").remote;

let data;
let version = 1;
let path;
let selectedLabelOfGroup = [];

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

  return data.groups;
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
  for (let index in group.labels) {
    let label = group.labels[index];
    if (label.name == name) {
      return -1;
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
}

function DeleteLabel(group, label) {
  for (var i = 0; i < group.labels.length; i++) {
    if (group.labels[i].id == label.id) {
      group.labels.splice(i, 1);
      break;
    }
  }
}

function AddGroup(groups, name, sortType) {
  for (let index in groups) {
    let group = groups[index];
    if (group.name == name) {
      return -1;
    }
  }

  let group = {};
  group.name = name;
  group.sortType = sortType;
  group.labels = [];
  group.isUnion = true
  groups.push(group);
}

function DeleteGroup(groups, name) {
  for (var i = 0; i < groups.length; i++) {
    if (groups[i].name == name) {
      groups.splice(i, 1);
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
  HasSelectedLabel
};
