const fs = require('fs'),
	AWS = require('aws-sdk'),
	config_all = require('../../config/env/all'),
	util = require('util');


class AWSService {
	constructor() {
		AWS.config.update({ region: config_all.AWS_REGION });
		this.s3 = new AWS.S3({
			accessKeyId: config_all.AWS_ACCESS_KEY,
			secretAccessKey: config_all.AWS_SECRET_ACCESS_KEY
		});
		// Create DynamoDB service object
		// this.ddb = new AWS.DynamoDB({ apiVersion: '2012-08-10' });
		this.ddb = new AWS.DynamoDB({
			accessKeyId: config_all.AWS_ACCESS_KEY,
			secretAccessKey: config_all.AWS_SECRET_ACCESS_KEY
		});
		/* Table names */
		this.USER_ASSET_TABLE = 'USER_ASSETS';
		  
		this.docClient = new AWS.DynamoDB.DocumentClient();
	}

	CreateS3Bucket(bucketName) {
		var params = { Bucket: "examplebucket" };
		this.s3.createBucket(params, function (err, data) {
			if (err) console.log(err, err.stack); // an error occurred
			else console.log(data);           // successful response
			/*
			data = {
			 Location: "/examplebucket"
			}
			*/
		});
	};

	UploadFileToS3(filePath, fileName, bucketName) {

		return new Promise((resolve, reject) => {
			fs.readFile(filePath, 'utf8', (err, data) => {
				if (err) throw err;
				const params = {
					Bucket: bucketName,
					Key: fileName, //All keys have to be lower case for backend
					Body: data
				};
				this.s3.upload(params, function (err, data) {
					if (err) {
						reject(err);
					} else {
						resolve(`File uploaded successfully at ${data.Location}`);
					}
				});
			});
		});
	}

	DeleteFileFromS3(fileName, bucketName) {

		return new Promise((resolve, reject) => {
			var params = {  Bucket: bucketName, Key: fileName };
			this.s3.deleteObject(params, function(err, data) {
				if (err) {
					console.log(err, err.stack);
					reject(err);
				} else {
					resolve(`File deleted successfully at bucket ${bucketName} & key ${fileName}`);
				}
			});			
		});
	}
	

	GetPresignedUrl(bucketName, Key) {
		return this.s3.getSignedUrl('getObject', {
			Bucket: bucketName,
			Key: Key,
			Expires: config_all.AWS_USER_ASSETS_SIGNED_URL_EXPIRATION_TIME_SECS
		})
	}

	/* Dynamodb */
	//awsService().CreateDynamodbTable()
	CreateDynamodbTable(tableName, params) {
		var params = {
			AttributeDefinitions: [
				{
					AttributeName: 'USERNAME',
					AttributeType: 'S'
				},
				{
					AttributeName: 'USER_ASSET_NAME',
					AttributeType: 'S'
				}
			],
			KeySchema: [
				{
					AttributeName: 'USERNAME',
					KeyType: 'HASH'
				},
				{
					AttributeName: 'USER_ASSET_NAME',
					KeyType: 'RANGE'
				}
			],
			BillingMode: 'PAY_PER_REQUEST',
			/* 			ProvisionedThroughput: {
						  ReadCapacityUnits: 1,
						  WriteCapacityUnits: 1
						}, */
			TableName: 'USER_ASSETS',
			StreamSpecification: {
				StreamEnabled: false
			}
		};

		this.ddb.createTable(params, function (err, data) {
			if (err) {
				console.log("Error", err);
			} else {
				console.log("Table Created", data);
			}
		});
	}

	createTable() {
		this.ddb.createTable({
			AttributeDefinitions: [
				{
					AttributeName: "key",
					AttributeType: "S"
				}
			],
			KeySchema: [
				{
					AttributeName: "key",
					KeyType: "HASH"
				}
			],
			ProvisionedThroughput: {
				ReadCapacityUnits: 1,
				WriteCapacityUnits: 1
			},
			TableName: "test"
		}, function (err, data) {
			if (err) {
				throw err;
			}
			console.log("data:", data);
		});
	}
	//
	PutItemInDynamoDbTable(tableName, userName, assetName, s3Key, assetType) {
		var params = {
			Item: {
				"USERNAME": {
					S: userName
				},
				"USER_ASSET_NAME": {
					S: assetName
				},
				"USER_ASSET_TYPE": {
					S: assetType
				}
				/* ,
				"S3_Key": {
					S: s3Key
				}	 */
			},
			ReturnConsumedCapacity: "TOTAL",
			TableName: tableName
		};


		return new Promise((resolve, reject) => {
			this.ddb.putItem(params, function (err, data) {
				if (err) {
					reject(err);
				} else {
					resolve(data);
				}
			});
		});
	}

	GetItemsFromDynamoDbTable(tableName, userName, userAssetName) {


		var params = {
			ExpressionAttributeValues: {
				':s': { S: userName }
			},
			KeyConditionExpression: 'USERNAME = :s',
			ProjectionExpression: 'USERNAME, USER_ASSET_NAME, USER_ASSET_TYPE',
			//FilterExpression: 'contains (Subtitle, :topic)',
			TableName: 'USER_ASSETS'
		};

		return new Promise((resolve, reject) => {
			this.ddb.query(params, function (err, data) {
				if (err) {
					reject(err);
				} else {
					resolve(data.Items);
				}
			});
		});

	}

	DeleteItemsFromDynamoDbTable(tableName, userName, userAssetName) {

		var params = {
			TableName:tableName,
			Key:{
				"USERNAME": userName,
				"USER_ASSET_NAME": userAssetName
			}
		};
		

		return new Promise((resolve, reject) => {
			this.docClient.delete(params, function(err, data) {
				if (err) {
					console.error("Unable to delete item. Error JSON:", JSON.stringify(err, null, 2));
					reject(JSON.stringify(err, null, 2));
				} else {
					console.log("DeleteItem succeeded:", JSON.stringify(data, null, 2));
					resolve(JSON.stringify(data, null, 2));
				}
			});
		});
	}

	UpdateItemsDynamoDbTable(tableName, userName, userAssetName, assetType) {

		var params = {
			TableName:tableName,
			Key:{
				"USERNAME": userName,
				"USER_ASSET_NAME": userAssetName
			},
			UpdateExpression: "set USER_ASSET_TYPE = :USER_ASSET_TYPE",
			ExpressionAttributeValues:{
				":USER_ASSET_TYPE": assetType
			},
			ReturnValues:"UPDATED_NEW"			
		};

		return new Promise((resolve, reject) => {

			this.docClient.update(params, function(err, data) {
				if (err) {
					console.error("Unable to update item. Error JSON:", JSON.stringify(err, null, 2));
					reject(JSON.stringify(err, null, 2));
				} else {
					console.log("UpdateItem succeeded:", JSON.stringify(data, null, 2));
					resolve(JSON.stringify(data, null, 2));
				}
			});
		});
	}

	GetItems() {
		var TABLE_NAME = "test";

		this.ddb.batchGetItem({
			RequestItems: {
				test: { // table name
					Keys: [
						{
							key: {
								S: "42"
							}
						},
						{
							key: {
								S: "11"
							}
						}
					],
					ConsistentRead: true
				}
			}
		}, function (err, data) {
			if (err) {
				throw err;
			}

			console.log("data:", data);

			data.Responses[TABLE_NAME].forEach(function (item) {
				try {
					var result = JSON.parse(item.result.S);
					console.log("%s:", item.key.S, result);
				} catch (err) {
					throw err;
				}
			});
		});
	}
	//

}

module.exports = AWSService
