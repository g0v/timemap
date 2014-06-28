(function () {
  "use strict";

var mobilecheck = function() {
var check = false;
(function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4)))check = true})(navigator.userAgent||navigator.vendor||window.opera);
return check; }  

jQuery(function($) {
  var reclineDatasetInfo = $.extend({}, true, VIZDATA.resources[0]);
  if (VIZDATA.resources[0].schema && VIZDATA.resources[0].schema.fields) {
    reclineDatasetInfo.fields = VIZDATA.resources[0].schema.fields;
  }
  if(mobilecheck()){
    VIZDATA.tmconfig.viewtype = 'map';
  }
  var dataset = new recline.Model.Dataset(reclineDatasetInfo);
  var timemapper = new TimeMapperView({
    model: dataset,
    datapackage: VIZDATA,
    el: $('.data-views')
  });
  // TODO: move this stuff into a proper view
  $('.js-embed').on('click', function(e) {
    e.preventDefault();
    var url = window.location.href.replace(/#.*$/, "") + '?embed=1'; // for now, just remove any fragment id
    var val = '<iframe src="' + url + '" frameborder="0" style="border: none;" width="100%" height="780;"></iframe>';
    $('.embed-modal textarea').val(val);
    $('.embed-modal').modal();
  });
});

var TimeMapperView = Backbone.View.extend({
  events: {
    'click .controls .js-show-toolbox': '_onShowToolbox',
    'submit .toolbox form': '_onSearch'
  },

  initialize: function(options) {
    var self = this;
    this._setupOnHashChange();

    this.datapackage = options.datapackage;
    // fix up for datapackage without right structure
    if (!this.datapackage.tmconfig) {
      this.datapackage.tmconfig = {};
    }
    this.timelineState = _.extend({}, this.datapackage.tmconfig.timeline, {
      nonUSDates: this.datapackage.tmconfig.dayfirst,
      timelineJSOptions: _.extend({}, this.datapackage.tmconfig.timelineJSOptions, {
        "hash_bookmark": true
      })
    });
    this._setupTwitter();

    // now load the data
    this.model.fetch().done(function() {
      self.model.query({size: self.model.recordCount})
      .done(function() {
        self._dataChanges();
        self._setStartPosition();
        self._onDataLoaded();
      });
    });
  },

  _setStartPosition: function() {
    var startAtSlide = 0;
    switch (this.datapackage.tmconfig.startfrom) {
      case 'start':
        // done
        break;
      case 'end':
        startAtSlide = this.model.recordCount - 1;
        break;
      case 'today':
        var dateToday = new Date();
        this.model.records.each(function(rec, i) {
          if (rec.get('startParsed') < dateToday) {
            startAtSlide = i;
          }
        });
        break;
    }
    this.timelineState.timelineJSOptions = _.extend(this.timelineState.timelineJSOptions, {
        "start_at_slide": startAtSlide
      }
    );
  },

  _onDataLoaded: function() {
    $('.js-loading').hide();

    // Note: We *have* to postpone setup until now as otherwise timeline
    // might try to navigate to a non-existent marker
    if (this.datapackage.tmconfig.viewtype === 'timeline') {
      // timeline only
      $('body').addClass('viewtype-timeline');
      // fix height of timeline to be window height minus navbar and footer
      $('.timeline-pane').height($(window).height() - 42 - 41);
      this._setupTimeline();
    } else if (this.datapackage.tmconfig.viewtype === 'map') {
      $('body').addClass('viewtype-map');
      this._setupMap();
    } else {
      $('body').addClass('viewtype-timemap');
      this._setupTimeline();
      this._setupMap();
    }

    // Nasty hack. Timeline ignores hashchange events unless is_moving ==
    // True. However, once it's True, it can never become false again. The
    // callback associated with the UPDATE event sets it to True, but is
    // otherwise a no-op.
    $("div.slider").trigger("UPDATE");
  },

  _setupTwitter: function(e) {
    !function(d,s,id){var js,fjs=d.getElementsByTagName(s)[0];if(!d.getElementById(id)){js=d.createElement(s);js.id=id;js.src="//platform.twitter.com/widgets.js";fjs.parentNode.insertBefore(js,fjs);}}(document,"script","twitter-wjs");
  },

  _dataChanges: function() {
    var self = this;
    this.model.records.each(function(record) {
      // normalize date field names
      if (record.get('startdate') && !record.get('start')) {
        record.set({
          start: record.get('startdate'),
          end: record.get('enddate')
        }, {silent: true}
        );
      }
      var startDate = VMM.Date.parse(normalizeDate(record.get("start"), self.datapackage.tmconfig.dayfirst));
      var data = {
        // VMM.Date.parse is the timelinejs date parser
        startParsed: startDate,
        title: record.get('title') || record.get('headline'),
        description: record.get('description') || record.get('text') || '',
        url: record.get('url') || record.get('webpage'),
        media: record.get('image') || record.get('media'),
        mediacaption: record.get('caption') || record.get('mediacaption') || record.get('imagecaption'),
        mediacredit: record.get('imagecredit') || record.get('mediacredit'),
      };
      if (record.get('size') || record.get('size') === 0) {
        data.size = parseFloat(record.get('size'));
      }
      record.set(data, { silent: true });
    });

    var starts = this.model.records.pluck('startParsed')
      , minDate = _.min(starts)
      , maxDate =  _.max(starts)
      , dateRange = maxDate - minDate
      , sizes = this.model.records.pluck('size')
      , maxSize = _.max(sizes)
      ;
    // set opacity - we compute opacity between 0.1 and 1 based on distance from most recent date
    var minOpacity = 0.3
      , opacityRange = 1.0 - minOpacity
      ;
    this.model.records.each(function(rec) {
      var temporalRangeLocation = (rec.get('startParsed') - minDate) / dateRange;
      rec.set({
        temporalRangeLocation: temporalRangeLocation,
        opacity: minOpacity + (opacityRange * temporalRangeLocation),
        relativeSize: parseFloat(rec.get('size')) / maxSize
      });
    });

    // Timeline will sort the entries by timestamp, and we need the order to be
    // the same for the map which runs off the model
    this.model.records.comparator = function (a, b) {
      return a.get('startParsed') - b.get('startParsed');
    };
    this.model.records.sort();
  },

  _setupOnHashChange: function() {
    var self = this;
    // listen for hashchange to update map
    $(window).on("hashchange", function () {
      var hash = window.location.hash.substring(1);
      if (parseInt(hash, 10)) {
        var record = self.model.records.at(hash);
        if (record && record.marker) {
          record.marker.openPopup();
        }
      }
    });
  },

  _onShowToolbox: function(e) {
    e.preventDefault();
    if (this.$el.find('.toolbox').hasClass('hideme')) {
      this.$el.find('.toolbox').removeClass('hideme');
    } else {
      this.$el.find('.toolbox').addClass('hideme');
    }
  },

  _onSearch: function(e) {
    e.preventDefault();
    var query = this.$el.find('.text-query input').val();
    this.model.query({q: query});
  },

  _setupTimeline: function() {
    this.timeline = new recline.View.Timeline({
      model: this.model,
      el: this.$el.find('.timeline'),
      state: this.timelineState
    });

    // convert the record to a structure suitable for timeline.js
    this.timeline.convertRecord = function(record, fields) {
      if (record.get('startParsed') == 'Invalid Date') {
        if (typeof console !== "undefined" && console.warn) {
          console.warn('Failed to extract date from record');
          console.warn(record.toJSON());
        }
        return null;
      }
      try {
        var out = this._convertRecord(record, fields);
      } catch (e) {
        out = null;
      }
      if (!out) {
        if (typeof console !== "undefined" && console.warn) {
          console.warn('Failed to extract timeline entry from record');
          console.warn(record.toJSON());
        }
        return null;
      }
      if (record.get('media')) {
        out.asset = {
          media: record.get('media'),
          caption: record.get('mediacaption'),
          credit: record.get('mediacredit'),
          thumbnail: record.get('icon')
        };
      }
      out.headline = record.get('title');
      if (record.get('url')) {
        out.headline = '<a href="%url" class="title-link" title="%url">%headline <i class="icon-external-link title-link"></i></a>'
          .replace(/%url/g, record.get('url'))
          .replace(/%headline/g, out.headline)
          ;
      }
      out.text = record.get('description');
      if (record.get('source') || record.get('sourceurl')) {
        var s = record.get('source') || record.get('sourceurl');
        if (record.get('sourceurl')) {
          s = '<a href="' + record.get('sourceurl') + '">' + s + '</a>';
        }
        out.text += '<p class="source">Source: ' + s + '</p>';
      }

      return out;
    };
    this.timeline.render();
  },

  initMap: function(){
      var datapackage = this.model.datapackage;
      var overlayers = {};
      var mapUrl = "//otile{s}-s.mqcdn.com/tiles/1.0.0/osm/{z}/{x}/{y}.png";
      var osmAttribution = 'Map data &copy; 2011 OpenStreetMap contributors, Tiles Courtesy of <a href="http://www.mapquest.com/" target="_blank">MapQuest</a> <img src="//developer.mapquest.com/content/osm/mq_logo.png">';
      var bg = new L.TileLayer(mapUrl, {maxZoom: 18, attribution: osmAttribution ,subdomains: '1234'});
      this.map.addLayer(bg);

      if(datapackage.tmconfig.maplayer != 'none'){
        for(var i=0;i<datapackage.tmconfig.maplayer_available.length;i++){
          var mapid = datapackage.tmconfig.maplayer_available[i];
          if(!L.RCHSS[mapid])
             console.log(mapid);
          var layer = new L.RCHSS[mapid]({opacity:0.75});
          if(mapid == datapackage.tmconfig.maplayer){
            this.map.addLayer(layer);
          }
          overlayers[layer.name] = layer;
        }
      }
      this.map.addControl(new L.Control.Layers({'OSM': bg}, overlayers));
  },

  _setupMap: function() {
    this.model.datapackage = this.datapackage
    this.map = new recline.View.Map({
      model: this.model
    });
    this.map.initMap = this.initMap;
    this.$el.find('.map').append(this.map.el);

    // customize with icon column
    this.map.infobox = function(record) {
      if (record.icon !== undefined) {
        return '<img src="' + record.get('icon') + '" width="100px"> ' + record.get('title');
      }
      return record.get('title');
    };

    this.map.geoJsonLayerOptions.pointToLayer = function(feature, latlng) {
      var record = this.model.records.get(feature.properties.cid);
      var recordAttr = record.toJSON();
      var maxSize = 400;
      var radius = parseInt(Math.sqrt(maxSize * recordAttr.relativeSize));
      if (radius) {
        var marker = new L.CircleMarker(latlng, {
          radius: radius,
          fillcolor: '#fe9131',
          color: '#fe9131',
          opacity: recordAttr.opacity,
          fillOpacity: recordAttr.opacity * 0.9
        });
      } else {
        var marker = new L.Marker(latlng, {
          opacity: recordAttr.opacity
        });
      }
      var label = recordAttr.title + '<br />Date: ' + recordAttr.start;
      if (recordAttr.size) {
        label += '<br />Size: ' + recordAttr.size;
      }
      marker.bindLabel(label);

      // customize with icon column
      if (recordAttr.icon !== undefined) {
        var eventIcon = L.icon({
            iconUrl: recordAttr.icon,
            iconSize:     [100, 20], // size of the icon
            iconAnchor:   [22, 94], // point of the icon which will correspond to marker's location
            shadowAnchor: [4, 62],  // the same for the shadow
            popupAnchor:  [-3, -76] // point from which the popup should open relative to the iconAnchor
        });
        marker.setIcon(eventIcon);
      }

      // this is for cluster case
      // this.markers.addLayer(marker);

      // When a marker is clicked, update the fragment id, which will in turn update the timeline
      marker.on("click", function (e) {
        var i = _.indexOf(record.collection.models, record);
        window.location.hash = "#" + i.toString();
      });

      // Stored so that we can get from record to marker in hashchange callback
      record.marker = marker;

      return marker;
    };
    this.map.render();
  }
});

// convert dates into a format TimelineJS will handle
// TimelineJS does not document this at all so combo of read the code +
// trial and error
// Summary (AFAICt):
// Preferred: [-]yyyy[,mm,dd,hh,mm,ss]
// Supported: mm/dd/yyyy
var normalizeDate = function(date, dayfirst) {
  if (!date) {
    return '';
  }
  var out = $.trim(date);
  // HACK: support people who put '2013-08-20 in gdocs (to force gdocs to
  // not attempt to parse the date)
  if (out.length && out[0] === "'") {
    out = out.slice(1);
  }
  out = out.replace(/(\d)th/g, '$1');
  out = out.replace(/(\d)st/g, '$1');
  out = $.trim(out);
  if (out.match(/\d\d\d\d-\d\d-\d\d(T.*)?/)) {
    out = out.replace(/-/g, ',').replace('T', ',').replace(':',',');
  }
  if (out.match(/\d\d-\d\d-\d\d.*/)) {
    out = out.replace(/-/g, '/');
  }
  if (dayfirst) {
    var parts = out.match(/(\d\d)\/(\d\d)\/(\d\d.*)/);
    if (parts) {
      out = [parts[2], parts[1], parts[3]].join('/');
    }
  }
  return out;
}

})();
