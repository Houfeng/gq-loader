const path = require('path');
const fs = require('fs');
const _ = require('lodash');
const os = require('os');

const IMPORT_REGEXP = /^#\s*(import|include|require)\s*(\'|\")(.+?)(\'|\")/;
const EXTENSIONS = ['.gql', '.graphql'];
const OPNAME_REGEXP = /(query|mutation) ?([\w\d-_]+)? ?\(.*?\)? \{/;

function getFile(cwd, filePath, options, tryExts) {
  tryExts = (tryExts || options.extensions || []).slice(0);
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
    this.addDependency(fileInfo.filename);
    const includes = parse.call(
      this, fileInfo.context, fileInfo.content, options
    );
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
  const query = JSON.stringify(result.join(os.EOL));
  const opnameInfo = OPNAME_REGEXP.exec(query);
  const operationName = JSON.stringify((opnameInfo && opnameInfo[2]) || '');
  if (options.string) {
    return `module.exports = ${query}`;
  } else {
    return `
    var request = require('${options.request}');
    var url = '${options.url}';
    module.exports = function(variables, options) {
      var data = { 
        operationName: ${operationName},
        query: ${query}, 
        variables: JSON.stringify(variables)
      };
      return request(url, data, options);
    };`
  }
}

module.exports = loader;