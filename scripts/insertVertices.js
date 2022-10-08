// Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

const USER="User"
const STUDY_TIME="StudyTime"
const TECH_STACK="TechnologyStack"
const LOCATION="Location"
const AGE_RANGE="AgeRange"
const STUDY_SIZE="StudySize"


const fs = require('fs');
const path = require('path');

const gremlin = require('gremlin');
const DriverRemoteConnection = gremlin.driver.DriverRemoteConnection;
const Graph = gremlin.structure.Graph;

const connection = new DriverRemoteConnection(`wss://${process.env.NEPTUNE_ENDPOINT}:8182/gremlin`,{});

const graph = new Graph();
const g = graph.traversal().withRemote(connection);

const createUser = async (username) => {
  return g.addV(USER).property('username', username).next()
}

const createStudyTime = async (studyTime) => {
  return g.addV(STUDY_TIME).property('name', studyTime).next()
}

const createTechnologyStack = async (technologyStack) => {
  return g.addV(TECH_STACK).property('name', technologyStack).next()
}

const createLocation = async (location) => {
  return g.addV(LOCATION).property('name', location).next()
}

const createAgeRange = async (ageRange) => {
  return g.addV(AGE_RANGE).property('name', ageRange).next()
}

const createStudySize = async (studySize) => {
  return g.addV(STUDY_SIZE).property('name', studySize).next()
}

const raw = fs.readFileSync(path.resolve( __dirname, 'vertices.json'));
const vertices = JSON.parse(raw)

const vertexPromises = vertices.map((vertex) => {
  if (vertex.label === USER) {
    return createUser(vertex.username)
  } else if (vertex.label === STUDY_TIME) {
    return createStudyTime(vertex.name)
  } else if (vertex.label === TECH_STACK) {
    return createTechnologyStack(vertex.name)
  } else if (vertex.label === LOCATION) {
    return createLocation(vertex.name)
  } else if (vertex.label === AGE_RANGE) {
    return createAgeRange(vertex.name)
  } else if (vertex.label === STUDY_SIZE) {
    return createStudySize(vertex.name)
  }
})

Promise.all(vertexPromises).then(() => {
  console.log('Loaded vertices successfully!')
  connection.close()
})
