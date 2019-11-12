'use strict';

var express = require('express');
var mongo = require('mongodb');
var mongoose = require('mongoose');
var bodyParser = require('body-parser')
var cors = require('cors');
var dns = require('dns');
var urlLib = require('url');

var app = express();

// Basic Configuration 
var port = process.env.PORT || 3000;

var urls = [
  
]

/** this project needs a db !! **/ 
// mongoose.connect(process.env.MONGOLAB_URI);
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

/** this project needs to parse POST bodies **/
// you should mount the body-parser here

app.use('/public', express.static(process.cwd() + '/public'));

app.get('/', function(req, res){
  res.sendFile(process.cwd() + '/views/index.html');
});

  
// your first API endpoint... 
app.get("/api/hello", function (req, res) {
  res.json({greeting: 'hello API'});
});

app.post("/api/shorturl/new", function (req, res) {
  let url = req.body.url;
  if (url) {
    //Verifico la validità dell'URL
    let cleanUrl = urlLib.parse(url);
    if (cleanUrl.hostname && cleanUrl.protocol) {
      dns.lookup(cleanUrl.hostname, (err, address, family) => {
        if (err) {
          console.log(err);
          res.json({"error":"invalid Hostname"});
        }
        else {
          let result = searchUrl(urls, url);
          if (result.length > 0) {
            res.json(result[0]);  
          } else {
            let count = urls.length + 1;
            let obj = {'original_url':url, short_url: count};
            urls.push(obj);
            res.json(obj);
          }
        }
      });  
    } else {
      res.json({"error":"invalid URL"});  
    }
  } else {
    res.json({"error":"invalid URL"});
  }
});

app.get("/api/shorturl/:short_url", function (req, res) {
  let short = req.params.short_url;
  if (parseInt(short)) {
    let result = searchShortUrl(urls, new Number(short));
    console.log('ris--',result);
    if (result.length > 0) 
      res.redirect(result[0].original_url);
    else
      res.json({"error":"No short url found for given input"});
  } else {
    res.json({"error":"Wrong Format"});
  }
});

app.listen(port, function () {
  console.log('Node.js listening ...');
});


function searchUrl(urls, url) {
  return urls.filter(entry => entry.original_url == url);
}

function searchShortUrl(urls, shortUrl) {
  return urls.filter(entry  => entry.short_url == shortUrl);
}

function isNumeric(num){
  return !isNaN(num)
}