if process.browser
  request = require \browser-request
else
  request = require \request
require! cheerio

export function avaliable-titles(url, done)
  err, res, body <- request url
  done err, {count:0, titles:{}} if err
  c = cheerio.load body, {+xmlMode}
  get = (o, q)->
    c o .children q
  layers = c \Contents .find \Layer
  result = {count: layers.length, titles: {}}

  layers.each (idx)->
    id = get @, "ows\\:Identifier" .text!
    name = get @, "ows\\:Title" .text!
    format = get @, \Format .text! .replace 'image/', ''
    url = get @, \ResourceURL .attr \template
    lower-corner = get @, \ows\\:WGS84BoundingBox .children 'ows\\:LowerCorner' .text!
    upper-corner = get @, \ows\\:WGS84BoundingBox .children 'ows\\:UpperCorner' .text!
    [llon, llat] = lower-corner / ' '
    [ulon, ulat] = upper-corner / ' '
    result['titles'][id] = do
      id: id
      name: name
      format: format
      url: url
      lower-corner: do
        long: llon
        lat: llat
      upper-corner: do
        long: ulon
        lat: ulat
  done err, result
