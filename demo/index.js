import test from './test1.gql';
import React from 'react';
import ReactDOM from 'react-dom';

function query() {
  test({ name: 0 });
}

function App() {
  return <button onClick={query}>click</button>;
}

ReactDOM.render(<App />, document.getElementById('root'));