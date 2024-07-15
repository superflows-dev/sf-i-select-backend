// import { TABLE, ddbClient, ScanCommand, PutItemCommand, GetItemCommand, UpdateItemCommand } from "./globals.mjs";
import { AUTH_ENABLE, ENTITY_NAME, GetObjectCommand, S3_BUCKET_NAME, s3Client, S3_DB_FILE_KEY, PutObjectCommand } from "./globals.mjs";
import { processAuthenticate } from './authenticate.mjs';
import { processManageChange } from './managechange.mjs';
import { newUuidV4 } from './newuuid.mjs';
import { processAddLog } from './addlog.mjs';

export const processUpdate = async (event) => {
    
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
        
        // const userId = "1234";
        
    //}
    
    var id = "";
    var name = "";
    var disablechange = "";
    
    try {
        id = JSON.parse(event.body).id.trim();
        name = JSON.parse(event.body).name.trim();
        disablechange = JSON.parse(event.body).disablechange;
    } catch (e) {
      const response = {statusCode: 400, body: { result: false, error: "Malformed body!"}};
      processAddLog(userId, 'update', event, response, response.statusCode)
      return response;
    }
    
    if(id == null || id == "" || id.length < 3) {
      const response = {statusCode: 400, body: {result: false, error: "Id not valid!"}}
      processAddLog(userId, 'update', event, response, response.statusCode)
      return response;
    }
    
    if(name == null || name == "" || name.length < 3) {
      const response = {statusCode: 400, body: {result: false, error: "Name not valid!"}}
      processAddLog(userId, 'update', event, response, response.statusCode)
      return response;
    }

    var disableChangeManagement = false;

    if(disablechange != null && disablechange) {
      disableChangeManagement = true;
    }
    
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
    
    if(jsonData[id] == null) {
        const response = {statusCode: 404, body: {result: false, error: "Record does not exist!"}}
        processAddLog(userId, 'update', event, response, response.statusCode)
        return response;
    }
    
    var oldName = jsonData[id].name;
    jsonData[id].name = name;
    
    command = new PutObjectCommand({
        Bucket: S3_BUCKET_NAME,
        Key: S3_DB_FILE_KEY,
        Body: JSON.stringify(jsonData),
        ContentType: 'application/json'
    });
    
    try {
        await s3Client.send(command);
    } catch (err) {
        console.log("update error",err);
    }
    
    if(!disableChangeManagement) {
      await processManageChange(event["headers"]["Authorization"], 
          { 
              changedEntity: ENTITY_NAME,
              changedEntityId: id,
              changedEntityOldName: oldName.S,
              changedEntityNewName: name
          }
      );
    }
    
    
    const response = {statusCode: 200, body: {result: true}};
    processAddLog(userId, 'update', event, response, response.statusCode)
    return response;
  

}