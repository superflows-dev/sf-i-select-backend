import https from 'https';

export const processAuthenticate = async (authorization) => {
  
  let myPromise = new Promise(function(resolve, reject) {
    
    var options = {
       host: process.env.AUTH_API + '.execute-api.' + process.env.AUTH_REGION + '.amazonaws.com',
       port: 443,
       method: 'POST',
       path: '/' + process.env.AUTH_STAGE + '/validate',
       headers: {
          'Authorization': authorization
       }   
    };
    
    //this is the call
    var request = https.get(options, function(response){
      let data = '';
      response.on('data', (chunk) => {
          data = data + chunk.toString();
      });
    
      response.on('end', () => {
          const body = JSON.parse(data);
          console.log('success', body);
          resolve(body)
      });
    })
    
    request.on('error', error => {
      console.log('error', error)
      resolve(error);
    })
    
    request.end()
    
  });
  
  return myPromise;

}