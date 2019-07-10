const AWS = require("aws-sdk");

//configuring the AWS environment
AWS.config.update({
  accessKeyId: process.env.AWSAccessKeyId,
  secretAccessKey: process.env.AWSAccessKey
});

var s3 = new AWS.S3();

module.exports.s3 = s3;
