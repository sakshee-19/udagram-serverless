import {APIGatewayProxyHandler, APIGatewayProxyResult, APIGatewayProxyEvent} from 'aws-lambda';
// import 'source-map-support/register'
import * as AWS  from 'aws-sdk'

const docClient = new AWS.DynamoDB.DocumentClient()

const table = process.env.GROUPS_TABLE

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent ): Promise<APIGatewayProxyResult> => {
    console.log("processing event ", event);

    const results = await docClient.scan({
        TableName: table
    }).promise();

    const items = results.Items

    return {
        statusCode: 200,
        headers: {
            'Access-Control-Allow-Origin': '*'
        },
            body: JSON.stringify({
            items
        })
    }
}