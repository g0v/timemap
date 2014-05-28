L.ATIS = {}

L.ATIS.WMS = L.TileLayer.WMS.extend do
  _url: 'http://whgis.nlsc.gov.tw/WMSProxy.ashx?'
  defaultWmsParams: do
    service: 'WMS'
    request: 'GetMap'
    version: '1.1.0'
    layers: ''
    styles: ''
    format: 'image/gif'
    transparent: true
  
  options: {attribution: '© <a target="_target" href="http://www.afasi.gov.tw/">農林航空測量所</a>'}
  initialize: (options) ->
    @defaultWmsParams.'layers' = @layerid
    wmsParams = L.extend {}, @defaultWmsParams
    for i of options
      wmsParams[i] = options[i] if (not @options[i]?) && i isnt 'crs'
    options = L.setOptions @, options
    wmsParams.width = wmsParams.height = options.tileSize * if options.detectRetina && L.Browser.retina then 2 else 1
    @wmsParams = wmsParams

L.ATIS.MNC = L.ATIS.WMS.extend do
  name: '農航所航照'
  layerid: 'ATIS_MNC'

L.ATIS.ATIS_2010 = L.ATIS.WMS.extend do
  name: '農航所航照 2010 航照圖'
  layerid: 'ATIS_2010'

L.ATIS.Taiwan5k_96 = L.ATIS.WMS.extend do
  name: '農航所航照97 五千分之一航照基本圖'
  layerid: 'Taiwan5k_97'

L.ATIS.Frames = L.ATIS.WMS.extend do
  name: '農航所航照圖框'
  layerid: 'ATIS_frames'