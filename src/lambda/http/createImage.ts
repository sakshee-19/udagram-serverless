import {APIGatewayProxyResult, APIGatewayProxyEvent, APIGatewayProxyHandler} from 'aws-lambda'
import * as AWS from 'aws-sdk';
import * as uuid from 'uuid';

const imageTable = process.env.IMAGES_TABLE
const groupTable = process.env.GROUPS_TABLE
// const expirationTime = process.env.SIGNED_URL_EXPIRATION
const bucketName = process.env.IMAGES_S3_BUCKET

const docClient = new AWS.DynamoDB.DocumentClient()

const s3 = new AWS.S3({
    signatureVersion: 'v4'
})

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
    const imageUrl = `https://${bucketName}.s3.ap-south-1.amazonaws.com/${imageId}` // save url in db as this

    var date = new Date().toLocaleString("en-US", {timeZone: "Asia/Kolkata"});
    // var timestamp = date.toString()
    const url = getSignedUrl(imageId) //url returned while createion to let user upload image for the same info of image

    const newItem = {
        groupId: groupItem.id,
        imageId: imageId,
        timestamp: date.toString(),
        ...item,
        imageUrl: imageUrl
    }
    console.log("new item ", newItem)

    await docClient.put({
        TableName: imageTable,
        Item: newItem
    }).promise()

    return {
        statusCode: 201,
        headers: {
            'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
            newItem: newItem,
            uploadUrl: url
        })
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

function getSignedUrl(imageId) {
    return s3.getSignedUrl('putObject', {
        Bucket: bucketName,
        Key: imageId,
        Expires: 300
    })
}