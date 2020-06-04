import {APIGatewayProxyHandler, APIGatewayProxyResult, APIGatewayProxyEvent} from 'aws-lambda';
// import 'source-map-support/register'
import * as AWS  from 'aws-sdk'
import * as uuid from 'uuid'

const docClient = createDocClient();

const table = process.env.GROUPS_TABLE;

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent ): Promise<APIGatewayProxyResult> => {
    console.log("processing event ", event);
    const id = uuid.v4()

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
            'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
            item
        })
    }
}

function createDocClient() {
    if(process.env.IS_OFFLINE) {
        console.log("creating a local dynamoDB instance")
        return new AWS.DynamoDB.DocumentClient({
            region: 'localhost',
            endpoint: 'http://localhost:8000'
        })
    }
    return new AWS.DynamoDB.DocumentClient()
}