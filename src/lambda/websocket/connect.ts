import {APIGatewayProxyHandler, APIGatewayProxyResult, APIGatewayProxyEvent} from 'aws-lambda';
import 'source-map-support/register'
import * as AWS  from 'aws-sdk'

const connectionTable = process.env.CONNECTION_TABLE;

const docCLient = new AWS.DynamoDB.DocumentClient();

export const handler:APIGatewayProxyHandler = async(event: APIGatewayProxyEvent) : Promise<APIGatewayProxyResult> => {
    const connectionId = event.requestContext.connectionId
    console.log("processing event ", event);
    console.log("table name ", connectionTable)

    const timestamp = new Date().toISOString()

    const newItem = {
        id: connectionId,
        timestamp
    }

    await docCLient.put({
        TableName: connectionTable,
        Item: newItem
    }).promise()

    console.log("put successfull")
    return {
        statusCode: 200,
        body: ''
    }
 
}