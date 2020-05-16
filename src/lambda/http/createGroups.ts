import {APIGatewayProxyHandler, APIGatewayProxyResult, APIGatewayProxyEvent} from 'aws-lambda';
import 'source-map-support/register'
import * as AWS  from 'aws-sdk'
import * as uuid from 'uuid';

const docClient = new AWS.DynamoDB.DocumentClient();

const table = process.env.GROUPS_TABLE;

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent ): Promise<APIGatewayProxyResult> => {
    console.log("processing event ", event);
    const id = uuid.v4();

    const item = {
        id: id,
        ...JSON.parse(event.body)
    }

    await docClient.put({
        TableName: table,
        Item: item
    }).promise();

    // const items = results.Items;

    return {
        statusCode: 201,
        headers: {
            "Access-Cotrol-Allow_origin":"*"
        },
        body: JSON.stringify({
            item
        })
    }
}