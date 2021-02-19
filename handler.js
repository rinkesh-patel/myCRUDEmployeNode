'use strict';

const AWS = require('aws-sdk');
const db = new AWS.DynamoDB.DocumentClient();
// const uuid = require('uuid/v4');
const { v4: uuid } = require('uuid');

const employeesTable = process.env.DYNAMO_DB_TABLE;

// Create a response
function response(statusCode, message) {
  return {
    statusCode: statusCode,
    body: JSON.stringify(message)
  };
}


// Create a post
module.exports.createPost = (event, context, callback) => {
  const reqBody = JSON.parse(event.body);

  if (
    !reqBody.firstName ||
    reqBody.firstName.trim() === '' ||
    !reqBody.lastName ||
    reqBody.lastName.trim() === ''
  ) {
    return callback(
      null,
      response(400, {
        error: 'Post must have a fn and ln and they must not be empty'
      })
    );
  }

  const post = {
    id: uuid(),
    createdAt: new Date().toISOString(),
    firstName: reqBody.firstName,
    lastName: reqBody.lastName
  };

  return db
    .put({
      TableName: employeesTable,
      Item: post
    })
    .promise()
    .then(() => {
      callback(null, response(201, post));
    })
    .catch((err) => response(null, response(err.statusCode, err)));
};
