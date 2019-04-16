import userGql from './test1.gql';
import React from 'react';
import ReactDOM from 'react-dom';
console.log(userGql);
async function query() {
  const user = await userGql({ name: 'bob' });
  console.log('user', user);
}

async function update() {
  const user = await userGql.update({ form: { age: 25 } });
  console.log('after update user:', user);
}

function App() {
  return (
    <div>
      <button onClick={query}>query</button>
      <button onClick={update}>update</button>
    </div>
  );
}

ReactDOM.render(<App />, document.getElementById('root'));