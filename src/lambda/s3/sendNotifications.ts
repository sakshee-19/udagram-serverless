import {S3Event, S3Handler} from 'aws-lambda'
import 'source-map-support'

// for this to connect to lambda add func without event in serverless.yaml the add permission and notif config
export const handler: S3Handler = async(event: S3Event) => { // while upload to s3 bucket it should hit here
    //S3Event have list of records
    for(const record of event.Records) {
        const key = record.s3.object.key;
        console.log("Processing S3 item with key ",key);
    }
}