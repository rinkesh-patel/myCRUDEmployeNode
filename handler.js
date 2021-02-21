'use strict';

const AWS = require('aws-sdk');
const db = new AWS.DynamoDB.DocumentClient();
const request = require('request');
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

// Get all posts
module.exports.getAllPosts = (event, context, callback) => {
  return db
    .scan({
      TableName: employeesTable
    })
    .promise()
    .then((res) => {
      callback(null, response(200, res.Items.sort(sortByDate)));
    })
    .catch((err) => callback(null, response(err.statusCode, err)));
};
// Get number of posts
module.exports.getPosts = (event, context, callback) => {
  const numberOfPosts = event.pathParameters.number;
  const params = {
    TableName: employeesTable,
    Limit: numberOfPosts
  };
  return db
    .scan(params)
    .promise()
    .then((res) => {
      callback(null, response(200, res.Items.sort(sortByDate)));
    })
    .catch((err) => callback(null, response(err.statusCode, err)));
};
// Get a single post
module.exports.getPost = (event, context, callback) => {
  const id = event.pathParameters.id;

  const params = {
    Key: {
      id: id
    },
    TableName: employeesTable
  };

  return db
    .get(params)
    .promise()
    .then((res) => {
      if (res.Item) callback(null, response(200, res.Item));
      else callback(null, response(404, { error: 'Post not found' }));
    })
    .catch((err) => callback(null, response(err.statusCode, err)));
};
// Update a post
module.exports.updatePost = (event, context, callback) => {
  const id = event.pathParameters.id;
  const reqBody = JSON.parse(event.body);
  const { body, title } = reqBody;

  const params = {
    Key: {
      id: id
    },
    TableName: employeesTable,
    ConditionExpression: 'attribute_exists(id)',
    UpdateExpression: 'SET title = :title, body = :body',
    ExpressionAttributeValues: {
      ':firstName': firstName,
      ':lastName': lastName
    },
    ReturnValues: 'ALL_NEW'
  };
  console.log('Updating');

  return db
    .update(params)
    .promise()
    .then((res) => {
      console.log(res);
      callback(null, response(200, res.Attributes));
    })
    .catch((err) => callback(null, response(err.statusCode, err)));
};
// Delete a post
module.exports.deletePost = (event, context, callback) => {
  const id = event.pathParameters.id;
  const params = {
    Key: {
      id: id
    },
    TableName: employeesTable
  };
  return db
    .delete(params)
    .promise()
    .then(() =>
      callback(null, response(200, { message: 'Post deleted successfully' }))
    )
    .catch((err) => callback(null, response(err.statusCode, err)));
};





// const apiKey = process.env.DYNAMO_DB_TABLE;

// module.exports.getWeather = (event, context, callback) => {
//   let apiKey = '28686699b8b52a829bfc61fc5621a0c4';
//   let city = '75071';
  let url = 'https://api.openweathermap.org/data/2.5/weather?zip=75071&appid=28686699b8b52a829bfc61fc5621a0c4&units=Imperial'
//   let weather;
//   request(url, function (err, response, body) {
//     if(err){
//       console.log('error:', JSON.parse(err));
//     } else {
//       weather = JSON.parse(body)
//       let message = `It's ${weather.main.temp} degrees in ${weather.name}!`;
//       console.log(message);
//     }
//   });

//   callback(null, response(200,  weather));
// };
// Create a response
function responseb(statusCode, message) {
  return {
    statusCode: statusCode,
    body: JSON.stringify(message)
  };
}

module.exports.getWeather = (event, context, callback) => {

  request(url, (err, response, body) => {
    if(err){
      return callback(null, responseb(err.statusCode, err));
    } else {
      let weather = JSON.parse(body)
      let message = `It's ${weather.main.temp} degrees in ${weather.name}!`;
      console.log(message);
      console.log(weather);
      return callback(null, responseb(200,  body));
    }
  });
  
};