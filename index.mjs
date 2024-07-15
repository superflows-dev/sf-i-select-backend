import { processCreate } from './create.mjs';
import { processList } from './list.mjs';
import { processDetail } from './detail.mjs';
import { processUpdate } from './update.mjs';
import { processDelete } from './delete.mjs';
import { ENTITY_NAME } from './globals.mjs';
import { processMoveFromDb } from './movefromdb.mjs'

export const handler = async (event, context, callback) => {
    
    const response = {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin" : '*',
        "Access-Control-Allow-Methods": "*",
        "Access-Control-Allow-Headers": "Authorization, Access-Control-Allow-Origin, Access-Control-Allow-Methods, Access-Control-Allow-Headers, Access-Control-Allow-Credentials, Content-Type, isBase64Encoded, x-requested-with",
        "Access-Control-Allow-Credentials" : true,
        'Content-Type': 'application/json',
        "isBase64Encoded": false
      },
    };
    
    if(event["httpMethod"] == "OPTIONS") {
      callback(null, response);
      return;
    }
    
    if(event["requestContext"] != null) {
      if(event["requestContext"]["http"] != null) {
        if(event["requestContext"]["http"]["method"] != null) {
          if(event["requestContext"]["http"]["method"] == "OPTIONS") {
            callback(null, response);
            return;
          }
        }
      }
    }
    
    var path = "";
    
    if(event["path"] != null) {
      path = event["path"];
    } else {
      path = event["rawPath"];
    }
    
    if(event["headers"] != null) {
      if(event["headers"]["authorization"] != null) {
        event["headers"]["Authorization"] = event["headers"]["authorization"]
      } else if(event["headers"]["Authorization"] != null) {
        event["headers"]["authorization"] = event["headers"]["Authorization"]
      }
    }
    
    switch(path) {
      
        case "/"+ENTITY_NAME+"/create":
        case "/create":
          const resultCreate = await processCreate(event);
          response.body = JSON.stringify(resultCreate.body);
          console.log('status code', processCreate.statusCode);
          response.statusCode = resultCreate.statusCode;
        break;
        
        case "/"+ENTITY_NAME+"/list":
        case "/list":
          const resultList = await processList(event);
          response.body = JSON.stringify(resultList.body);
          response.statusCode = resultList.statusCode;
        break;
        
        case "/"+ENTITY_NAME+"/detail":
        case "/detail":
          const resultDetail = await processDetail(event);
          response.body = JSON.stringify(resultDetail.body);
          response.statusCode = resultDetail.statusCode;
        break;
        
        case "/"+ENTITY_NAME+"/update":
        case "/update":
          const resultUpdate = await processUpdate(event);
          response.body = JSON.stringify(resultUpdate.body);
          response.statusCode = resultUpdate.statusCode;
        break;
        
        case "/"+ENTITY_NAME+"/delete":
        case "/delete":
          const resultDelete = await processDelete(event);
          response.body = JSON.stringify(resultDelete.body);
          response.statusCode = resultDelete.statusCode;
        break;
        
        case "/movefromdb":
          await processMoveFromDb();
        break;
        
    }
    
    callback(null, response);
    
    return response;
};
