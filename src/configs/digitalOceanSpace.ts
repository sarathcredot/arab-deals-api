import { S3Client, S3ClientConfig } from '@aws-sdk/client-s3';

const spaceName = process.env.SPACE_NAME!;
const spacePath = process.env.SPACE_PATH!;
const spaceEndPoint = process.env.SPACE_ENDPOINT!;
const region = spaceEndPoint.split(".").shift();

const spaceConfig: S3ClientConfig = {
    credentials: {
        accessKeyId: process.env.SPACE_ACCESS_KEY!,
        secretAccessKey: process.env.SPACE_SECRET_ACCESS_KEY!
    },
    endpoint: `https://${spaceEndPoint}`,
    region: region
};


const space = new S3Client(spaceConfig)


export {
    space,
    spaceName,
    spaceEndPoint,
    spacePath
}