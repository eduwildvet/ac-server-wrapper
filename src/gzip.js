const zlib = require('zlib');

function gzip(req, res) {
  // check if the client accepts gzip
  var header = req.headers['accept-encoding'];
  var accepts = header && /gzip/i.test(header);
  if (!accepts) return false;

  // store native methods
  var writeHead = res.writeHead;
  var write = res.write;
  var end = res.end;

  var gzip = zlib.createGzip();
  gzip.on('data', function (chunk) {
    try {
      write.call(res, chunk);
    } catch (err) {}
  }).on('end', function () {
    end.call(res);
  }).on('error', function(e) {
    end.call(res);
  });

  // duck punch gzip piping
  res.writeHead = function (status, headers) {
    headers = headers || {};

    if (Array.isArray(headers)) {
      headers.push([ 'Content-Encoding', 'gzip' ]);
    } else {
      headers['Content-Encoding'] = 'gzip';
    }

    writeHead.call(res, status, headers);
  };

  res.write = function (chunk) {
    gzip.write(chunk);
  };

  res.end = function () {
    gzip.end();
  };

  return true;
};

module.exports = gzip;