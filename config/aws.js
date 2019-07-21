const aws = require("aws-sdk");

//configuring the AWS environment
aws.config.update({
  accessKeyId: process.env.AWSAccessKeyId,
  secretAccessKey: process.env.AWSAccessKey
});
aws.config.region = "ap-east-1";

const s3 = new aws.S3();

module.exports = s3;
