const express = require('express')
var path = require('path');

const app = express()
app.use('/static', express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname,'/index.html'));
  })

  app.listen(8080);
 
