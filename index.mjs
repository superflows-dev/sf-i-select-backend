import { processCreate } from './create.mjs';
import { processList } from './list.mjs';
import { processDetail } from './detail.mjs';
import { processUpdate } from './update.mjs';
import { processDelete } from './delete.mjs';

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
    
    var path = ""; 
    
    if(event["path"] != null) {
      path = event["path"];
    } else {
      path = event["rawPath"];
    }
    
    switch(path) {
      
        case "/create":
          const resultCreate = await processCreate(event);
          response.body = JSON.stringify(resultCreate.body);
          console.log('status code', processCreate.statusCode);
          response.statusCode = resultCreate.statusCode;
        break;
        
        case "/list":
          const resultList = await processList(event);
          response.body = JSON.stringify(resultList.body);
          response.statusCode = resultList.statusCode;
        break;
        
        case "/detail":
          const resultDetail = await processDetail(event);
          response.body = JSON.stringify(resultDetail.body);
          response.statusCode = resultDetail.statusCode;
        break;
        
        case "/update":
          const resultUpdate = await processUpdate(event);
          response.body = JSON.stringify(resultUpdate.body);
          response.statusCode = resultUpdate.statusCode;
        break;
        
        case "/delete":
          const resultDelete = await processDelete(event);
          response.body = JSON.stringify(resultDelete.body);
          response.statusCode = resultDelete.statusCode;
        break;
        
    }
    
    callback(null, response);
    
    return response;
};
