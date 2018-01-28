const path = require('path');
const fs = require('fs');
const _ = require('lodash');
const os = require('os');

const IMPORT_REGEXP = /^#\s*(import|include|require)\s*(\'|\")(.+?)(\'|\")/;
const EXTENSIONS = ['.gql', '.graphql'];

function getFile(cwd, filePath, options, tryExts) {
  tryExts = tryExts || options.extensions || [];
  if (!tryExts) return;
  const filename = path.resolve(cwd, filePath);
  if (fs.existsSync(filename)) return filename;
  if (tryExts.length < 1) return;
  return getFile(cwd, filePath + tryExts.shift(), options, tryExts);
}

function readFile(cwd, filePath, options) {
  const filename = getFile(cwd, filePath, options);
  if (!filename) return;
  return {
    filename: filename,
    context: path.dirname(filename),
    content: fs.readFileSync(filename, 'utf8')
  };
}

function parse(cwd, source, options) {
  const contents = [source];
  const lines = source.split('\n');
  lines.forEach(line => {
    line = line.trim();
    const matchInfo = IMPORT_REGEXP.exec(line);
    const filePath = matchInfo && matchInfo[3];
    if (!filePath) return;
    const fileInfo = readFile(cwd, filePath, options);
    if (!fileInfo) return;
    const includes = parse(fileInfo.context, fileInfo.content, options);
    contents.push(...includes);
  });
  return _.uniq(contents);
}

function getOptions(ctx) {
  const options = ctx.loaders[ctx.loaderIndex].options || {};
  return _.defaults(options, {
    extensions: EXTENSIONS,
    string: false,
    url: '/graphql',
    request: require.resolve('./request')
  });
}

function loader(source) {
  this.cacheable();
  const options = getOptions(this);
  const result = parse.call(this, this.context, source, options);
  const graphql = JSON.stringify(result.join(os.EOL));
  if (options.string) {
    return `module.exports = ${graphql}`;
  } else {
    return `
    var request = require('${options.request}');
    var url = '${options.url}';
    module.exports = function(variables, options) {
      var data = { graphql: ${graphql}, variables: variables };
      return request(url, data, options);
    };`
  }
}

module.exports = loader;