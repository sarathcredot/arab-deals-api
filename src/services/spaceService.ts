import { digitalOceanSpace } from "../configs";
import * as path from 'path';
import { GetObjectCommand, GetObjectCommandInput, DeleteObjectCommand, PutObjectCommandInput } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Readable } from 'stream';
import { Upload } from '@aws-sdk/lib-storage';




interface FileUploadResponse {
    location: string
}


let { space, spaceEndPoint, spaceName, spacePath } = digitalOceanSpace;


function getFileExtension(filename: string): string {
    return path.extname(filename);
}



function getFileKey(filepath: string, filename: string, ids: string[] = []) {
    let result = `${spacePath}/`;
    let paths = filepath.split("#ID#");
    for (let [i, path] of paths.entries()) {
        result += ids[i] ? path + ids[i] : path;
    }
    result += `/${Date.now()}${getFileExtension(filename)}`;
    return result;
}


function getUploadedPublicLocation(key: string): string {
    let location = `https://${spaceName}.${spaceEndPoint}/${key}`;
    return location;
}


function getUploadedPrivateLocation(key: string): string {
    let location = `${key}`;
    return location;
}


// Write public File to space

function publicFileUpload(key: string, contentType: string, metadata = {}, body: Readable): Promise<FileUploadResponse> {
    let params: PutObjectCommandInput = {
        Bucket: spaceName,
        Key: key,
        ACL: "public-read",
        Metadata: metadata,
        ContentType: contentType,
        Body: body
    };
    const upload = new Upload({ client: space, params: params });
    return new Promise(async (resolve, reject) => {
        try {
            await upload.done();
            resolve({
                location: getUploadedPublicLocation(key),
            });
        } catch (err) {
            console.error('Error uploading file to S3:', err);
            reject(err);
        }
    });
}


// Write Private File to space
function privateFileUpload(key: string, contentType: string, metadata = {}, body: Readable): Promise<FileUploadResponse> {
    let params: PutObjectCommandInput = {
        Bucket: spaceName,
        Key: key,
        ACL: "private",
        Metadata: metadata,
        ContentType: contentType,
        Body: body
    };
    const upload = new Upload({ client: space, params: params });
    return new Promise(async (resolve, reject) => {
        try {
            await upload.done();
            resolve({
                location: getUploadedPrivateLocation(key),
            });
        } catch (err) {
            console.error('Error uploading file to S3:', err);
            reject(err);
        }
    });
}


// Read File from space

function readFileFromSpace(fileName: string) {
    let params: GetObjectCommandInput = {
        Bucket: spaceName,
        Key: fileName,
    };
    const getObjectCommand = new GetObjectCommand(params);
    return new Promise(async (resolve, reject) => {
        try {
            const data = await space.send(getObjectCommand);
            return resolve(data);
        } catch (err) {
            console.error('Error retrieving file from S3:', err);
            reject(err);
        }
    });
}

// Create signedURL for private files

function createSignedURL(fileName: string, contentType: string = '', signedUrlExpireSeconds = 10 * 60): Promise<string> {
    let params: GetObjectCommandInput = {
        Bucket: spaceName,
        Key: fileName,
    };
    if (contentType) {
        params.ResponseContentType = contentType;
    }
    const getObjectCommand = new GetObjectCommand(params);

    return new Promise(async (resolve, reject) => {
        try {
            const data = await getSignedUrl(space, getObjectCommand, { expiresIn: signedUrlExpireSeconds });
            return resolve(data);
        } catch (err) {
            console.error('Error retrieving file from S3:', err);
            reject(err);
        }
    });
}

async function deleteFileFromSpace(fileName: string) {
    const deleteObjectCommand = new DeleteObjectCommand({
        Bucket: spaceName,
        Key: fileName,
    });

    try {
        await space.send(deleteObjectCommand);
        console.log('Deleted file from S3');
    } catch (err) {
        console.error('Error retrieving file from S3:', err);
    }
}


async function deleteFilesFromSpace(files: string[] = []) {
    console.log("files", files);
    let deletePromises = files.map((file) => {
        return deleteFileFromSpace(file);
    });
    try {
        await Promise.all(deletePromises);
    } catch (error) {
        console.error('Error deleting files from S3:', error);
    }
}


export {
    getFileKey,
    publicFileUpload,
    privateFileUpload,
    readFileFromSpace,
    createSignedURL,
    deleteFileFromSpace,
    deleteFilesFromSpace,
};
