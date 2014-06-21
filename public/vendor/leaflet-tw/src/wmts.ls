
export function avaliable-titles(url, done)
  get = (node, q)->
    $ node .children q
  result = {count:0, tiles: {}}
  $.ajax do
    type: \GET
    dataType: \xml
    url: url
    success: (xml) ->
      layers = $ xml .find \Layer
      layers.each (idx)->
        id = get @, "ows\\:Identifier" .text!
        name = get @, "ows\\:Title" .text!
        format = get @, \Format .text! .replace 'image/', ''
        url = get @, \ResourceURL .attr \template
        result['tiles'][id] = do
          name: name
          format: format
          url: url
      result.count = layers.length
      done result
