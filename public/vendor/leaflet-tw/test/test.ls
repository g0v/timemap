expect = chai.expect
describe 'leaflet-tw', ->
  describe 'is compatable with WMTS.', -> ``it``
    .. 'sould able to get avaliable titles.', (done) ->
      result <- avaliable-titles \http://gis.sinica.edu.tw/tainan/wmts//1.0.0/WMTSCapabilities.xml
      expect result.count .to.equal 49
      expect result.tiles.AM50K_1944.name .to.equal '1944-美軍地形圖-1:50,000'
      expect result.tiles.AM50K_1944.format .to.equal 'png'
      done!
