const fs = require('fs');

function rewrite(filePath, isZh) {
  let s = fs.readFileSync(filePath, 'utf8');
  const marker = '\n  "variables": {';
  const idx = s.indexOf(marker);
  if (idx < 0) {
    console.error('No variables section found in', filePath);
    return false;
  }

  const head = s.slice(0, idx);
  const vars = `
  "variables": {
    "view": {
      ${isZh ? `"searchPlaceholder": "搜索变量",
      "title": "变量",
      "description": "创建和管理全局变量",` : `"searchPlaceholder": "Search Variables",
      "title": "Variables",
      "description": "Create and manage global variables",`}
      "actions": {
        ${isZh ? `"howToUse": "使用说明",
        "add": "添加变量",
        "save": "保存"` : `"howToUse": "How To Use",
        "add": "Add Variable",
        "save": "Save"`}
      },
      "empty": { ${isZh ? `"title": "暂无变量"` : `"title": "No Variables Yet"`} },
      "table": {
        ${isZh ? `"name": "名称",
        "value": "值",
        "type": "类型",
        "lastUpdated": "最近更新",
        "created": "创建时间",
        "edit": "编辑",
        "delete": "删除"` : `"name": "Name",
        "value": "Value",
        "type": "Type",
        "lastUpdated": "Last Updated",
        "created": "Created",
        "edit": "Edit",
        "delete": "Delete"`}
      },
      "confirm": {
        "delete": {
          ${isZh ? `"title": "删除",
          "description": "删除变量 {{name}}？"` : `"title": "Delete",
          "description": "Delete variable {{name}}?"`}
        }
      },
      "snackbar": {
        ${isZh ? `"deleteSuccess": "变量已删除",
        "deleteErrorPrefix": "删除变量失败"` : `"deleteSuccess": "Variable deleted",
        "deleteErrorPrefix": "Failed to delete Variable"`}
      }
    },
    "types": {
      ${isZh ? `"static": "静态",
      "runtime": "运行时"` : `"static": "Static",
      "runtime": "Runtime"`}
    }
  }`;

  const final = head + vars + '\n}';
  try {
    JSON.parse(final);
    fs.writeFileSync(filePath, final, 'utf8');
    console.log('Rewrote', filePath);
    return true;
  } catch (e) {
    console.error('Rewrite invalid', filePath, e.message);
    return false;
  }
}

rewrite('packages/ui/src/locales/en/common.json', false);
rewrite('packages/ui/src/locales/zh/common.json', true);