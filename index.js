const parse = require('@vue/compiler-sfc').parse;
const parser = require('@babel/parser');
const traverse = require("@babel/traverse").default;
const t = require('@babel/types');
const fs = require("fs");

// 读取原始始代码
const content = fs.readFileSync('/Users/crab.huang/Project/abtest.web/src/views/approval/list.vue').toString();
const { descriptor, errors } = parse(content);
const { script, scriptSetup } = descriptor;
const scriptSetupContent = scriptSetup?.content || ''

// 使用Babel解析代码
const ast = parser.parse(scriptSetupContent, {
  sourceType: "module",
});

function cb(path) {
  console.log(scriptSetupContent)
  if (path.node.name.indexOf('axios') > -1) {
    // 找到 axios 请求
    const found = path.findParent((path) => path.isCallExpression())
    console.log(found)
    if (found) {

    }
  }
}

// 遍历AST
traverse(ast, {
  CallExpression(path) {
    // if (
    //   t.isMemberExpression(path.node.callee)
    // ) {
    //   if (
    //   t.isIdentifier(path.node.callee.object, { name: "axios" }) &&
    //   t.isIdentifier(path.node.callee.property, { name: "post" })) {}
    //   // 获取axios请求的参数
    //   const axiosArgs = path.node.arguments;

    //   // 创建一个新的axios请求函数
    //   const newAxiosCall = t.callExpression(t.identifier("commonRequest"), axiosArgs);

    //   // 替换原来的axios请求
    //   path.replaceWith(newAxiosCall);
    // }
  },
  Identifier: cb
});