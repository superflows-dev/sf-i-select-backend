import { TABLE, AUTH_ENABLE, ddbClient, ScanCommand, PutItemCommand } from "./globals.mjs";
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
  
    var scanParams = {
        TableName: TABLE,
    }
    
    var resultItems = []
  
    async function ddbQuery () {
        try {
            const data = await ddbClient.send (new ScanCommand(scanParams));
            resultItems = resultItems.concat((data.Items))
            if(data.LastEvaluatedKey != null) {
                scanParams.ExclusiveStartKey = data.LastEvaluatedKey;
                await ddbQuery();
            }
        } catch (err) {
            console.log(err);
            return err;
        }
    };
    
    const resultQ = await ddbQuery();
    
    var found = false;
    
    console.log('result items', resultItems);
    
    for(var i = 0; i < resultItems.length; i++) {
        
        if(resultItems[i].name.S == name) {
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
    
    var setParams = {
        TableName: TABLE,
        Item: {
          'id' : {"S": id},
          'name' : {"S": name}
        }
    };
    
    const ddbPut = async () => {
        try {
          const data = await ddbClient.send(new PutItemCommand(setParams));
          return data;
        } catch (err) {
          return err;
        }
    };
    
    const resultPut = await ddbPut();
    
    
    const response = {statusCode: 200, body: {result: true}};
    processAddLog(userId, 'create', event, response, response.statusCode)
    return response;
    

}