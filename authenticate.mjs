import https from 'https';

export const processAuthenticate = async (authorization) => {
  
  let myPromise = new Promise(function(resolve, reject) {

    var options = {
       host: process.env.AUTH_API + '.lambda-url.' + process.env.AUTH_REGION + '.on.aws',
       port: 443,
       method: 'POST',
       path: '/validate',
       headers: {
          'Authorization': authorization
       }   
    };
    
    console.log(options);
    
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