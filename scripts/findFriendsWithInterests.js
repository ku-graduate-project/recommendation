// Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
const gremlin = require('gremlin');
const DriverRemoteConnection = gremlin.driver.DriverRemoteConnection;
const Graph = gremlin.structure.Graph;
const neq = gremlin.process.P.neq
const local = gremlin.process.scope.local
const values = gremlin.process.column.values
const desc = gremlin.process.order.desc

const connection = new DriverRemoteConnection(`wss://${process.env.NEPTUNE_ENDPOINT}:8182/gremlin`,{});

const graph = new Graph();
const g = graph.traversal().withRemote(connection);

const findFriendsWithPreferTime = async (username) => {
  return g.V()
  .has('User', 'username', username).as('user')
  .out('PreferTime')
  .in_('PreferTime')
  .where(neq('user'))
  .values('username')
  .groupCount()
  .next()
}

const findFriendsWithStack = async (username) => {
  return g.V()
  .has('User', 'username', username).as('user')
  .out('HasStack')
  .in_('HasStack')
  .where(neq('user'))
  .values('username')
  .groupCount()
  .next()
}

// findFriendsWithStack('pricelucas').then((resp) => {
//   console.log(resp.value)
//   connection.close()
// })
let queryList = [
  findFriendsWithPreferTime('pricelucas'),
  findFriendsWithStack('pricelucas')];
  
const reduceFunction = (map1, map2) => {
    // map2.forEach((k, v) => map1.merge(k, v, (v1, v2) -> v1 + v2));
    // console.log(map1)
    for (let [key, value] of map2) {
      if(map1.get(key)){
        map1.set(key, value + map1.get(key))
      } else{
        map1.set(key, value);
      }
    }
    return map1;
  };
  
Promise.all([findFriendsWithPreferTime('pricelucas'), findFriendsWithStack('pricelucas')]).then(values=>{
  const a = values.map(value=>value.value)
  .reduce(reduceFunction, new Map())
  console.log(a)
})
.finally(()=>connection.close())
