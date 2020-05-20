import {APIGatewayProxyHandler, APIGatewayProxyResult, APIGatewayProxyEvent} from 'aws-lambda';
import 'source-map-support/register'
import * as AWS  from 'aws-sdk'

const connectionTable = process.env.CONNECTION_TABLE;

const docCLient = new AWS.DynamoDB.DocumentClient();

export const handler:APIGatewayProxyHandler = async(event: APIGatewayProxyEvent) : Promise<APIGatewayProxyResult> => {
    const connectionId = event.requestContext.connectionId

    const key = {
        id: connectionId    
    }
    await docCLient.delete({
        TableName: connectionTable,
        Key: key   
    }).promise()

    return {
        statusCode: 200,
        body: ''
    }
 
}