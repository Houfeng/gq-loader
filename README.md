# The best GraphQL Loader for Webpack

GraphQL 既是一种用于 API 的查询语言也是一个满足你数据查询的运行时。 GraphQL 对你的 API 中的数据提供了一套易于理解的完整描述，使得客户端能够准确地获得它需要的数据，而且没有任何冗余。

想更多的了解或使用 GraphQL，请访问 https://github.com/facebook/graphql

GraphQL 有针对不同语言的服务端实现，以帮助开发人员搭建 `GraphQL Server`。

而 `gq-loader` 是一个 `webpack` 插件，你可以认为它一针对前端项目的一种 `client` 端实现，它的目的是帮助前端开发同学更简便的调用 GraphQL API，它让前端开发人员在使用 GraphQL 时更加方便，像普通 `js` 模块一样轻松自如，使前端开发人员能在 `js` 文件中通过 `import` 或 `require` 导入 `.gql` 和 `.graphql` 文件，然后直接调用。 并且它还支持通过 `#import` 语法导入其它 `.gql` 文件，比如 fragments。

> `#import` 还提供了两个别名，分别是 `#require` 和 `#include`，这两个别名和 `#import` 的用法及行为完全一致。

## 安装

```
npm install gq-loader --save-dev
```

或者

```
yarn add gq-loader
```

## 基本使用

如同其它 loader 一样，首先，我们在 `webpack.config.js` 中添加 `gq-loader` 的配置

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

然后，我们就可以在 `js` 文件中通过 `import` 来导入 `.gql` 文件使用它了，我们来一个简单的示例，假设已经有一个可以工作的 `Graphql Server`，那么，我们先创建一个可以查询用户的 `getUser.gql`

```gql
#import './fragment.gql' 

query MyQuery($name: String) {
  getUser(name: $name)
    ...userFields
  }
}
```
可以看到，我们通过 `#import` 引用了另外一个 `.gql` 文件 `fragment.gql`，在这个文件中我们描术了要返回的 user 的字段信息，这样我们就能在不同的地方「重用」它了，我们也创建一下这个文件

```gql
fragment userFields on User {
  name
  age
}
```

好了，我们可以在 `js` 文件中直接导入 `getUser.gql`，并且使用它查询用户了，从未如此简便，我们来看看

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

在调用 `getUser` 时，我们可以通过函数参数向 `GraphQL` 传递变量，这些变量就是我们的查询参数。

## 自定义请求

默认 `gq-loader` 就会帮你完成 `graphql 请求`，但某些场景下或许你想自已控制所有请求，如果有这样需要，我们还可以通过 `request` 属性来「自定义」请求，看一下示例，需要先稍微改动一下 `loader 配置`

```js
{
  test: /\.(graphql|gql)$/,
  exclude: /node_modules/,
  use: {
    loader: 'gq-loader'
    options: {
      url: 'Graphql Server URL',
      //指定自动请求模块路径
      request: require.resolve('your_request_module_path');
    }
  }
}
```
在 `your_request_module_path` 填写自定义请求模块路径，`gq-loader` 将自动加载并使用对应请求模块，模块只需要改出一个「请求函数即可」，看如下自定义示例

```js
const $ = require('jquery');

//url 是要请求的 GraphQL 服务地址
//data 是待发送的数据
//options 是自定义选项
module.exports = function(url, data, options){
  //如果有需要还可以处理 options
  return $.post(url, data);
};
```

其中，`options` 是导入 `.gql` 文件后「函数的第二个参数」，比如，可以这样传递 `options` 参数

```js
import getUser from './getUser.gql';

async function query() {
  const options = {...};
  const user = await getUser({ name: 'bob' }, options);
  console.log('user', user);
}
```

## 完整选项

| 名称 | 说明 | 默认值 |
| ---- | ------- | ----------- |
| URL |指定 graphql 服务 URL | /graphql |
| request | 自定义请求函数 | 使用内建模块 |
| extensions | 默认扩展名，在导入时省略扩展名时将按配置依次查找 | .gql/.graphql |
| string | 指定导入模式，当为 true 时导入为字符串，而不是可执行的函数 | false |


注意，`gq-loader` 的 `extensions` 无论配置何值，在 `js` 中 `import` 时都不能省略扩展名，此选项仅作用于 `.gql` 文件 `import` 其它 `.gql` 文件