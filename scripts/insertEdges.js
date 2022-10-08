// Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
const fs = require('fs');
const path = require('path');

const gremlin = require('gremlin');
const DriverRemoteConnection = gremlin.driver.DriverRemoteConnection;
const Graph = gremlin.structure.Graph;

const connection = new DriverRemoteConnection(`wss://${process.env.NEPTUNE_ENDPOINT}:8182/gremlin`,{});

const graph = new Graph();
const g = graph.traversal().withRemote(connection);

const addPreferTime = async ({ user, name}) => {
  return g.V().has('User', 'username', user).as('user')
    .V().has('StudyTime', 'name', name).as('studyTime')
    .addE('PreferTime').from_('user').to('studyTime').next()
}

const addTechStack = async ({ user, name}) => {
  return g.V().has('User', 'username', user).as('user')
    .V().has('TechnologyStack', 'name', name).as('techStack')
    .addE('HasStack').from_('user').to('techStack').next()
}


const raw = fs.readFileSync(path.resolve( __dirname, 'edges.json'));
const edges = JSON.parse(raw)

const edgePromises = edges.map((edge) => {
  if (edge.label === 'PreferTime') {
    return addPreferTime({ user: edge.user, name: edge.name })
  } else if (edge.label === 'HasStack') {
    return addTechStack({ user: edge.user, name: edge.name })
  }
})

Promise.all(edgePromises).then(() => {
  console.log('Loaded edges successfully!')
  connection.close()
})
