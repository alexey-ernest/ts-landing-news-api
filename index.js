if (!process.env.WORDPRESS_FEED_URL) {
  console.log("WORDPRESS_FEED_URL environment variable required.");
  process.exit(1);
}

var port = process.env.PORT || 8080;

var debug = require('debug')('ts');
var request = require('request');
var cors = require('cors');
var bodyParser = require('body-parser');
var express = require('express');
var FeedParser = require('feedparser');

// configure express app
var app = express();

// CORS
app.use(cors());

// JSON body parsing
app.use(bodyParser.json());

/**
 * Healthcheck endpoint.
 */
app.get('/', function (req, res) {
  res.send('OK');
});

app.get('/feed2', function (req, res) {
  request(process.env.WORDPRESS_FEED_URL, function (err, response, body) {
    res.send(body);
  });
});

/**
 * Retrieves news feed from wordpress blog.
 */
app.get('/feed', function (req, res) {
  var items = [];
  var feedparser = new FeedParser();

  var req = request(process.env.WORDPRESS_FEED_URL);
  
  req.on('error', function (err) {
    handleError(err, res);
  });

  req.on('response', function (res) {
    var stream = this;
    if (res.statusCode != 200) {
      return this.emit('error', new Error('Bad status code'));
    }

    // parsing feed
    stream.pipe(feedparser);
  });

  feedparser.on('error', function (err) {
    handleError(err, res);
  });

  feedparser.on('readable', function() {
    var stream = this;
    var item;
    while (item = stream.read()) {
      items.push(item);
    }
  });

  feedparser.on('end', function () {
    var response = items.map(mapNewsItem);
    res.send(response);
  });
});

function handleError(err, res) {
  res.status(502).send('News feed is unavailable: ' + err);
}

function mapNewsItem(item) {
  return {
    title: item.title,
    text: item.description,
    date: item.date,
    link: item.link
  };
} 

app.listen(port, function () {
  debug('Listening on port: ' + port);
});
