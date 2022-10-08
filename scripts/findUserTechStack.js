// Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
const gremlin = require('gremlin');
const DriverRemoteConnection = gremlin.driver.DriverRemoteConnection;
const Graph = gremlin.structure.Graph;

const connection = new DriverRemoteConnection(`wss://${process.env.NEPTUNE_ENDPOINT}:8182/gremlin`,{});

const graph = new Graph();
const g = graph.traversal().withRemote(connection);

const findUserTechStack = async (username) => {
  return g.V()
    .has('User', 'username', username)
    .out('HasStack')
    .values('name')
    .toList()
}

findUserTechStack('ashleywu').then((resp) => {
  console.log(resp)
  connection.close()
})
