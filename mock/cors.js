/* eslint-disable */
// CORS for the mock. Both apps reach it from another origin: the rewrite's browser code directly, the
// original for every "next page" of a REST stream (its first page goes through its own /api proxy, but the
// `Link: rel="next"` it then follows names this server).
//
// A browser hides response headers from a cross-origin page unless they are exposed. Without the list below
// the original could not read `Link` or `X-Total-Pages-Remaining` on page 2, took that for the last page and
// never asked for page 3 of anything (notifications, post search, submissions).
const EXPOSED = ['Link', 'X-Total-Pages', 'X-Total-Pages-Remaining', 'X-TotalCount']

const HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Authorization, Content-Type, If-Modified-Since',
  'Access-Control-Allow-Methods': 'GET,POST,PUT,PATCH,DELETE,HEAD,OPTIONS',
  'Access-Control-Expose-Headers': EXPOSED.join(', '),
}

// Sets the headers on every answer and answers preflights itself. -> true when the request is finished
const apply = (req, res) => {
  res.set(HEADERS)
  if (req.method !== 'OPTIONS') return false
  res.sendStatus(204)
  return true
}

module.exports = { EXPOSED, HEADERS, apply }
