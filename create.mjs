import { AUTH_ENABLE, GetObjectCommand, S3_BUCKET_NAME, s3Client, S3_DB_FILE_KEY, PutObjectCommand } from "./globals.mjs";
import { processAuthenticate } from './authenticate.mjs';
import { newUuidV4 } from './newuuid.mjs';
import { processAddLog } from './addlog.mjs';

export const processCreate = async (event) => {
    
    console.log('event', event);
    
    //if(AUTH_ENABLE) {
    
        if((event["headers"]["Authorization"]) == null) {
            return {statusCode: 400, body: { result: false, error: "Malformed headers!"}};
        }
        
        if((event["headers"]["Authorization"].split(" ")[1]) == null) {
            return {statusCode: 400, body: { result: false, error: "Malformed headers!"}};
        }
        
        var hAscii = Buffer.from((event["headers"]["Authorization"].split(" ")[1] + ""), 'base64').toString('ascii');
        
        if(hAscii.split(":")[1] == null) {
            return {statusCode: 400, body: { result: false, error: "Malformed headers!"}};
        }
        
        const email = hAscii.split(":")[0];
        const accessToken = hAscii.split(":")[1];
        
        if(email == "" || !email.match(/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/)) {
            return {statusCode: 400, body: {result: false, error: "Malformed headers!"}}
        }
        
        if(accessToken.length < 5) {
            return {statusCode: 400, body: {result: false, error: "Malformed headers!"}}
        }
        
        const authResult = await processAuthenticate(event["headers"]["Authorization"]);
        
        if(!authResult.result && !authResult.admin) {
            return {statusCode: 401, body: {result: false, error: "Unauthorized request!"}};
        }

        const userId = authResult.userId;
        
    //}
    var name = "";
    
    try {
        name = JSON.parse(event.body).name.trim();
    } catch (e) {
      const response = {statusCode: 400, body: { result: false, error: "Malformed body!"}};
      processAddLog(userId, 'create', event, response, response.statusCode)
      return response;
    }
    
    if(name == null || name == "" || name.length < 3) {
      const response = {statusCode: 400, body: {result: false, error: "Name not valid!"}}
      processAddLog(userId, 'create', event, response, response.statusCode)
      return response;
    }
    
    // scan records
  
    var command = new GetObjectCommand({
        Bucket: S3_BUCKET_NAME,
        Key: S3_DB_FILE_KEY,
    });
    
    var jsonData = {};
    
    try {
        const response = await s3Client.send(command);
        const s3ResponseStream = response.Body;
        const chunks = []
        for await (const chunk of s3ResponseStream) {
            chunks.push(chunk)
        }
        const responseBuffer = Buffer.concat(chunks)
        jsonData = JSON.parse(responseBuffer.toString());
    } catch (err) {
        console.log("db read",err); 
    } 
    
    var found = false;
    
    for(const itemId of Object.keys(jsonData)){
        if(jsonData[itemId].name == name){
            found = true;
            break;
        }
    }
    
    if(found) {
    
      const response = {statusCode: 409, body: {result: false, error: "Name already exists!"}}
      processAddLog(userId, 'create', event, response, response.statusCode)
      return response;
    
    }
    
    const id = newUuidV4();
    
    jsonData[id] = {
        'name' : name
    }
    
    command = new PutObjectCommand({
        Bucket: S3_BUCKET_NAME,
        Key: S3_DB_FILE_KEY,
        Body: JSON.stringify(jsonData),
        ContentType: 'application/json'
    });
    
    try {
        await s3Client.send(command);
    } catch (err) {
        console.log("log error",err);
    }
    
    
    const response = {statusCode: 200, body: {result: true}};
    processAddLog(userId, 'create', event, response, response.statusCode)
    return response;
    

}