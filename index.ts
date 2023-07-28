import { parse } from '@vue/compiler-sfc';
import fs from 'fs';
import * as babelParser from '@babel/parser';
import type { ParserOptions } from '@babel/parser';
import traverse from '@babel/traverse';
import type { TraverseOptions } from '@babel/traverse';
import t from '@babel/types';
import generator from '@babel/generator';
import { globSync } from 'glob';

const url = '/Users/crab.huang/Project/abtest.web/src/views/approval/list.vue';
const vueFiles = globSync('/Users/crab.huang/Project/abtest.web/src/**/*.?(js|vue)');
const set = new Set();
const templateStringSet = new Set()
const config: ParserOptions = {
  sourceType: 'module',
  plugins: [
    'jsx',
    'typescript'
  ]
};

generator

const traverseHandler = (url: string) => {
  const content = fs.readFileSync(url).toString();
  const { descriptor, errors } = parse(content);

  const { script, scriptSetup } = descriptor;

  const scriptContent = script?.content || ''
  const scriptSetupContent = scriptSetup?.content || ''

  const scriptParseContent = babelParser.parse(scriptContent, config)
  const scriptSetupParseContent = babelParser.parse(scriptSetupContent, config)

  const getTraverseConfig = (content: string): TraverseOptions => {
    return {
      Identifier: (path) => {
        if (path.node.name.indexOf('axios') > -1) {
          // 找到 axios 请求
          const axiosCallPath = path.findParent((path) => path.isCallExpression());
          if (axiosCallPath && axiosCallPath.node.type === 'CallExpression') {
            /**
             * 找到请求方法调用中 url 的参数，考虑几种情况：
             * axios.get('url')
             * axios('url')
             * axios.get(`url${template}`)
             * axios({ url: 'url' })
             */
            const axiosArgumentNode = axiosCallPath.node.arguments.find((arg) => ['StringLiteral', 'TemplateLiteral', 'ObjectExpression'].includes(arg.type))
            if (axiosArgumentNode) {
              switch (axiosArgumentNode.type) {
                case 'StringLiteral':
                  set.add((axiosArgumentNode as t.StringLiteral).value);
                  break
                case 'TemplateLiteral':
                  if (axiosArgumentNode.start && axiosArgumentNode.end) {
                    templateStringSet.add(content.slice(axiosArgumentNode.start, axiosArgumentNode.end))
                  }
                  break
                case 'ObjectExpression':
                  // 找到 axios 请求参数对象
                  const urlKeyNode = axiosArgumentNode.properties.find((property) =>
                    property.type === 'ObjectProperty' &&
                    property.key.type === 'Identifier' &&
                    property.key.name === 'url'
                  )
                  if (urlKeyNode && urlKeyNode.type === 'ObjectProperty' && urlKeyNode.value.type === 'StringLiteral') {
                    set.add(urlKeyNode.value.value)
                  }
                  break
              }
            }
            // TODO 修改 path 中的请求为公共请求
          }
        }
      }
    }
  }
  traverse(scriptParseContent, getTraverseConfig(scriptContent))
  traverse(scriptSetupParseContent, getTraverseConfig(scriptSetupContent))
}

traverseHandler(url);
// vueFiles.forEach(traverseHandler);

console.log(set);
