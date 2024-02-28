const AWS = require("aws-sdk");
const UUID = require('uuid');
const ATV = require('atv');

// Callback is (error, response)
exports.handler = function(event, context, callback) {
    //dynamo.deleteItem(JSON.parse(event.body), done);
    //dynamo.scan({ TableName: event.queryStringParameters.TableName }, done);
    //dynamo.putItem(JSON.parse(event.body), done);
    //dynamo.updateItem(JSON.parse(event.body), done);    
    var userScore = JSON.parse(event.body);
    ATV.validateAccessToken(userScore.userName, userScore.accessToken, function(valid, reason) {
        if(!valid) respondError(401, reason, callback);
            var params = {
                TableName: 'xmas-fun-score',
                Key: { "userGuid" : userScore.userGuid },
                UpdateExpression: 'set score = :score, turnsUsed = if_not_exists(turnsUsed, :start) + :inc',
                /*ConditionExpression: '#a < :MAX',
                ExpressionAttributeNames: {'#a' : 'Sum'},*/
                ExpressionAttributeValues: {
                ':score' : userScore.score,
                ':inc': 1,
                ':start': 0,
                }
            };
          
          var documentClient = new AWS.DynamoDB.DocumentClient();          
          documentClient.update(params, function(err, data) {
             if (err) { console.log(err); respondError(500, err, callback); }
             else {  console.log(data); respondOK(null, callback); }
          });
    });
};

function respondOK(data, callback) {
    const response = {
        statusCode: 200,
        body: JSON.stringify({ response: 'Score updated', data: data }),
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin' : "*", // Required for CORS support to work
            'Access-Control-Allow-Credentials' : true // Required for cookies, authorization headers with HT
        },
    };
    callback(null, response);
}

function respondError(errorCode, errorMessage, callback) {
    const response = {
        statusCode: errorCode,
        body: JSON.stringify({ response: errorMessage }),
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin' : "*", // Required for CORS support to work
            'Access-Control-Allow-Credentials' : true // Required for cookies, authorization headers with HT
        },
    };
    callback(null, response);
}
