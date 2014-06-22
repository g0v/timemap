expect = require \chai .expect
avaliable-titles = require '../lib/wmts' .avaliable-titles
describe 'leaflet-tw', ->
  describe 'is compatable with WMTS.', -> ``it``
    .. 'sould able to get avaliable titles.', (done) ->
      _, result <- avaliable-titles \http://gis.sinica.edu.tw/tainan/wmts//1.0.0/WMTSCapabilities.xml
      expect result.count .to.equal 49
      expect result.titles.AM50K_1944.name .to.equal '1944-美軍地形圖-1:50,000'
      expect result.titles.AM50K_1944.format .to.equal 'png'
      expect result.titles.AM50K_1944.lower-corner.long .to.equal '117.84953432'
      expect result.titles.AM50K_1944.lower-corner.lat .to.equal '21.65607265'
      expect result.titles.AM50K_1944.upper-corner.long .to.equal '123.85924109'
      expect result.titles.AM50K_1944.upper-corner.lat .to.equal '25.64233621'
      done!
