const express = require('express'); //Import the express dependency
const bodyParser = require('body-parser');
const app = express();              //Instantiate an express app, the main work horse of this server
const port = 5000;                  //Save the port number where your server will be listening
const convert = require('heic-convert');
const { promisify } = require('util');
const fs = require('fs');

app.use(express.static('public'));
app.use(bodyParser.raw({limit: '10mb'}));
let currentIndexJpg = parseInt(process.env.JPG_INDEX);
let currentIndexPng = parseInt(process.env.PNG_INDEX);

//Idiomatic expression in express to route and respond to a client request
app.get('/', (req, res) => {        //get requests to the root ("/") will route here
    res.sendFile('index.html', {root: __dirname});      //server responds by sending the index.html file to the client's browser
                                                        //the .sendFile method needs the absolute path to the file, see: https://expressjs.com/en/4x/api.html#res.sendFile 
});

app.listen(port, () => {            //server starts listening for any attempts from a client to connect at port: {port}
    console.log(`Now listening on port ${port}`); 
});

app.post('/image', async (req, res) => {
console.log(req.headers.name);
  let outputBuffer = req.body;
  if(req.headers.name == 'heic'){
    console.log('converting');
    outputBuffer = await convert({
    buffer: req.body, // the HEIC file buffer
    format: 'JPEG',      // output format
    quality: 0.25          // the jpeg compression quality, between 0 and 1
    });
    console.log(outputBuffer);
    await promisify(fs.writeFile)('./result.jpg', outputBuffer);
  }

  const stringName = "%7B%22parent%22:null,%22name%22:%22test" +((req.headers.name == 'jpg' || req.headers.name == 'heic')? currentIndexJpg.toString()  : currentIndexPng.toString()) + "." + ((req.headers.name == 'jpg' || req.headers.name == 'heic')? "jpg" : "png" )+ "%22%7D";
  console.log(stringName);
  fetch('https://api.filegarden.com/users/' + process.env.USER_ID + '/pipe', {
  method: 'POST',
  headers:{
      "Cookie": process.env.COOKIE_TOKEN,
      "Content-Type": "application/octet-stream",
      "X-Data": stringName
  },
  body: outputBuffer,
  })
  .then(async (response) => {if(req.headers.name == 'jpg' || req.headers.name == 'heic') currentIndexJpg++; else currentIndexPng++; const body = await response.json(); console.log(response)})
  .catch((error) => {
    console.error('Error:', error);
  });
  
  
})