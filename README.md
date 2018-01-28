# gq-loader

GraphQL 既是一种用于 API 的查询语言也是一个满足你数据查询的运行时。 GraphQL 对你的 API 中的数据提供了一套易于理解的完整描述，使得客户端能够准确地获得它需要的数据，而且没有任何冗余。

gq-loader 是一个 `webpack` 插件，它能让前端开发人员在使用 GraphQL 时更加方便。
它使你能在 `js` 文件中通过 `import` 或 `require` 导入 `.gql` 和 `.graphql` 文件. 并且它还支持通过 `#import` 语法导入其它 `.gql` 文件，比如 fragments。

## 安装

```
npm install gq-loader --save-dev
```

或者

```
yarn add gq-loader
```

## 基本使用

首先，在 `webpack.config.js` 中添加 `gq-loader` 配置

```js
{
  test: /\.(graphql|gql)$/,
  exclude: /node_modules/,
  use: {
    loader: 'gq-loader'
    options: {
      url: 'Graphql Server URL'
    }
  }
}
```

然后，你就可以在 `js` 文件中使用它了，我们来一个简单的示例
假设已经有一个可以工作的 `Graphql Server`，我们先创建一个 `getUser.gql`

```gql
#import './fragment.gql' 

query MyQuery($name: String) {
  getUser(name: $name)
    ...userFields
  }
}
```
可以看到，我们通过 `#import` 引用其它的 `graphql` 文件 `fragment.gql`，我们同时创建一下它

```gql
fragment userFields on User {
  name
  age
}
```

好了，可以在 `js` 文件中直接使用它了，如下

```js
import getUser from './getUser.gql';
import React from 'react';
import ReactDOM from 'react-dom';

async function query() {
  const user = await getUser({ name: 'bob' });
  console.log('user', user);
}

function App() {
  return <button onClick={query}>click</button>;
}

ReactDOM.render(<App />, document.getElementById('root'));
```

## 自定义请求

默认 `gq-loader` 就会帮你完成 `graphql 请求`，如果有需要你也可以通过 `request` 属性自定义请求，如下

```js
{
  test: /\.(graphql|gql)$/,
  exclude: /node_modules/,
  use: {
    loader: 'gq-loader'
    options: {
      url: 'Graphql Server URL',
      request: require.resolve('your_request_module_path');
    }
  }
}
```
在 `your_request_module_path` 填写自定义请求模块路径，`gq-loader` 将自动加载并使用对应模块，自定义示例

```js
const $ = require('jquery');

module.exports = function(url, data, options){
  //如果有需要还可以处理 options
  return $.post(url, data);
};
```

其中，`options` 时导入 `.gql` 文件后「函数的第二个参数」，比如，可以这样传递 `options` 参数

```js
import getUser from './getUser.gql';

async function query() {
  const options = {...};
  const user = await getUser({ name: 'bob' }, options);
  console.log('user', user);
}
```

## 完整选项

| 名称 | 默认值 | 说明 |
| ---- | ------- | ----------- |
| URL | /graphql | 指定 graphql 服务 URL |
| request | 内建 | 自定义请求函数 |
| extensions | .gql/.graphql | 扩展名，省备扩展名时将按配置查找 |
| string | false | 指定模式，当为 true 时导入的为字符串，而不是可执行的函数 |


注意，`extensions` 无论配置任何值，在 `js` 中 `import` 时都不能省略扩展名，此选项仅作用于 `.gql` 文件 `import` 其它 `.gql` 文件