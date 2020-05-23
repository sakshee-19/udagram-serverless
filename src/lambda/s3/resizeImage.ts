import { SNSHandler, SNSEvent, S3Event } from "aws-lambda"
import * as AWS from 'aws-sdk'
import 'source-map-support/register'
import Jimp from 'jimp/es';

const thumbnailBucketName = process.env.THUMBNAILS_S3_BUCKET
const imageBucket = process.env.IMAGES_S3_BUCKET

const s3 = new AWS.S3()

export const handler: SNSHandler = async(event: SNSEvent) => {
    console.log("processing sns topics ", JSON.stringify(event))
    for(const s3Evnt of event.Records) {
        const s3Image = s3Evnt.Sns.Message
        console.log("process msg ", s3Image);
        await resizeImage(JSON.parse(s3Image))
    }
}

async function resizeImage (event: S3Event) {
    for(const record of event.Records)
    {
        const key = record.s3.object.key;
        const response = await s3.getObject({
            Bucket: imageBucket,
            Key: key
        }).promise()

        // image will be of type buffer as bytes
        const body = response.Body;

        //resize
        const image = await Jimp.read(body);
        image.resize(150, Jimp.AUTO)

        const convertedBuffer = await image.getBufferAsync(Jimp.AUTO)

        await s3.putObject({
            Bucket: thumbnailBucketName,
            Key: `${key}.jpeg`, 
            Body: convertedBuffer
        }).promise()        
    }
}