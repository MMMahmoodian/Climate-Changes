
import Map from 'ol/Map.js';
import View from 'ol/View.js';
import { GPX, GeoJSON, IGC, KML, TopoJSON } from 'ol/format.js';
import { defaults as defaultInteractions, DragAndDrop } from 'ol/interaction.js';
import { Tile as TileLayer, Vector as VectorLayer } from 'ol/layer.js';
import { Image as ImageLayer } from 'ol/layer.js';
import ImageWMS from 'ol/source/ImageWMS.js';
import { OSM, Vector as VectorSource } from 'ol/source.js';
import { Circle as CircleStyle, Fill, Stroke, Style } from 'ol/style.js';
import { transform as Transform } from 'ol/proj';
import BingMaps from 'ol/source/BingMaps.js';

// import createItems from 'ol/tripleM/LayerList.js';



var defaultStyle = {
    'Point': new Style({
        image: new CircleStyle({
            fill: new Fill({
                color: 'rgba(255,255,0,0.5)'
            }),
            radius: 5,
            stroke: new Stroke({
                color: '#ff0',
                width: 1
            })
        })
    }),
    'LineString': new Style({
        stroke: new Stroke({
            color: '#f00',
            width: 3
        })
    }),
    'Polygon': new Style({
        fill: new Fill({
            color: 'rgba(0,255,255,0.5)'
        }),
        stroke: new Stroke({
            color: '#0ff',
            width: 1
        })
    }),
    'MultiPoint': new Style({
        image: new CircleStyle({
            fill: new Fill({
                color: 'rgba(255,0,255,0.5)'
            }),
            radius: 5,
            stroke: new Stroke({
                color: '#f0f',
                width: 1
            })
        })
    }),
    'MultiLineString': new Style({
        stroke: new Stroke({
            color: '#0f0',
            width: 3
        })
    }),
    'MultiPolygon': new Style({
        fill: new Fill({
            color: 'rgba(0,0,255,0.5)'
        }),
        stroke: new Stroke({
            color: '#00f',
            width: 1
        })
    })
};

var styleFunction = function (feature, resolution) {
    var featureStyleFunction = feature.getStyleFunction();
    if (featureStyleFunction) {
        return featureStyleFunction.call(feature, resolution);
    } else {
        return defaultStyle[feature.getGeometry().getType()];
    }
};

var dragAndDropInteraction = new DragAndDrop({
    formatConstructors: [
        GPX,
        GeoJSON,
        IGC,
        KML,
        TopoJSON
    ]
});
var subs = new ImageLayer({
    opacity: 0.9,
    title: "subs",
    // extent: [-13884991, 2870341, -7455066, 6338219],
    source: new ImageWMS({
        url: 'http://chakadwebgis.ir:8080/geoserver/wms',
        params: {
            'LAYERS': 'vaghefi:subs1_projected'
        },
        ratio: 1,

        serverType: 'geoserver'
    })
});
var lfp = new ImageLayer({
    title: "lfp",
    // extent: [-13884991, 2870341, -7455066, 6338219],
    source: new ImageWMS({
        url: 'http://chakadwebgis.ir:8080/geoserver/wms',
        params: { 'LAYERS': 'vaghefi:lfp-projected' },
        ratio: 1,
        serverType: 'geoserver'
    })
});

var Hydrostns = new ImageLayer({
    title: "Hydrostns",
    // extent: [-13884991, 2870341, -7455066, 6338219],
    source: new ImageWMS({
        url: 'http://chakadwebgis.ir:8080/geoserver/wms',
        params: { 'LAYERS': 'vaghefi:Hydrostns_projected' },
        ratio: 1,
        serverType: 'geoserver'
    })
});

var ClimateStns = new ImageLayer({
    title: "ClimateStns",
    // extent: [-13884991, 2870341, -7455066, 6338219],
    source: new ImageWMS({
        url: 'http://chakadwebgis.ir:8080/geoserver/wms',
        params: { 'LAYERS': 'vaghefi:ClimateStns-projected' },
        ratio: 1,
        serverType: 'geoserver'
    })
});

var map = new Map({
    interactions: defaultInteractions().extend([dragAndDropInteraction]),
    layers: [
        new TileLayer({
            title: "basemap",
            source: new BingMaps({ key: "AnL0-0C9IRmJdvpeTCwi-0FU6NEqQ48a74_PsiXM5AijLH7AXAslLTXQ_pYrkHL-", imagerySet: 'Aerial' })
        }),
        subs,
        lfp,
        Hydrostns,
        ClimateStns
    ],
    target: 'map',
    view: new View({
        center: Transform([8.001124, 46.450142], 'EPSG:4326', 'EPSG:3857'),
        // projection: projection,
        zoom: 11
    })
});

dragAndDropInteraction.on('addfeatures', function (event) {
    var vectorSource = new VectorSource({
        features: event.features
    });
    map.addLayer(new VectorLayer({
        source: vectorSource,
        style: styleFunction
    }));
    map.getView().fit(vectorSource.getExtent());
});

var displayFeatureInfo = function (pixel) {
    var features = [];
    map.forEachFeatureAtPixel(pixel, function (feature) {
        features.push(feature);
    });
    // console.log(features);
    if (features.length > 0) {
        var info = [];
        var i, ii;
        for (i = 0, ii = features.length; i < ii; ++i) {
            info.push(features[i].get('name'));
        }
        // console.log(info);
        document.getElementById('info').innerHTML = info.join(', ') || '&nbsp';
    } else {
        document.getElementById('info').innerHTML = '&nbsp;';
    }
};

map.on('pointermove', function (evt) {
    if (evt.dragging) {
        return;
    }
    var pixel = map.getEventPixel(evt.originalEvent);
    displayFeatureInfo(pixel);
});

map.on('click', function (evt) {
    displayFeatureInfo(evt.pixel);
});
var LayerListUl = document.getElementById("layerlistul");
map.getLayers().forEach(function (layer) {
    var title = layer.get('title');
    if (title != "basemap") {
        
        var li = document.createElement("li");
        var div = document.createElement("div");
        div.setAttribute("class", "material-switch pull-right");

        var input = document.createElement("input");
        input.setAttribute("type", "checkbox");
        input.setAttribute("id", title);
        input.setAttribute("name", title);
        input.checked = true;
        var label = document.createElement("label");
        label.setAttribute("for", title);
        label.setAttribute("class", "label-success");
        li.appendChild(document.createTextNode(title));
        div.appendChild(input);
        div.appendChild(label);

        li.appendChild(div);
        li.setAttribute("class", "list-group-item");
        LayerListUl.appendChild(li);

        input.addEventListener( 'change', function() {
            // layer.visible = this.checked;
            layer.set('visible', this.checked);
        });
    }

});
