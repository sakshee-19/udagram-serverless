import {APIGatewayProxyResult, APIGatewayProxyEvent, APIGatewayProxyHandler} from 'aws-lambda'
import * as AWS from 'aws-sdk';
import * as uuid from 'uuid';

const imageTable = process.env.IMAGES_TABLE
const groupTable = process.env.GROUPS_TABLE

const docClient = new AWS.DynamoDB.DocumentClient()

export const handler:APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    console.log("processing event ",event);

    const groupId = event.pathParameters.groupId
    const groupItem = await groupExists(groupId)
    if(!groupItem) {
        return {
            statusCode: 404,
            headers: {
                "Access-Cotrol-Allow_origin":"*"
            },
            body: JSON.stringify({
                message: "group does not exists"
            })
        }

    }
    console.log("valid group ", groupItem)
    const item = JSON.parse(event.body)

    const imageId = uuid.v4();

    var date = new Date().toLocaleString("en-US", {timeZone: "Asia/Kolkata"});
    // var timestamp = date.toString()

    const newItem = {
        groupId: groupItem.id,
        imageId: imageId,
        timestamp: date.toString(),
        ...item
    }
    console.log("new item ", newItem)

    await docClient.put({
        TableName: imageTable,
        Item: newItem
    }).promise()

    return {
        statusCode: 201,
        headers: {
            "Access-Cotrol-Allow_origin":"*"
        },
        body: JSON.stringify(newItem)
    }  
}

async function groupExists(groupId){
    const result = await docClient.get({
        TableName: groupTable,
        Key: {
            id: groupId
        }
    }).promise()
    return result.Item
}