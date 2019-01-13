
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
import { bbox as bboxStrategy } from 'ol/loadingstrategy.js';


var styleJson = readFile('./json/test.json');
if(styleJson == null){
    console.log("Failed to load json file!")
}else{
    console.log("Json file loaded!")
}


var pcpStyle = [
    new Style({
        fill: new Fill({
            color: 'rgba(255,0,0,1)'
        }),
        stroke: new Stroke({
            color: '#0ff',
            width: 1
        })
    }),
    new Style({
        fill: new Fill({
            color: 'rgba(200,50,0,1)'
        }),
        stroke: new Stroke({
            color: '#0ff',
            width: 1
        })
    }),
    new Style({
        fill: new Fill({
            color: 'rgba(150,100,0,1)'
        }),
        stroke: new Stroke({
            color: '#0ff',
            width: 1
        })
    }),
    new Style({
        fill: new Fill({
            color: 'rgba(100,150,0,1)'
        }),
        stroke: new Stroke({
            color: '#0ff',
            width: 1
        })
    }),
    new Style({
        fill: new Fill({
            color: 'rgba(50,200,0,1)'
        }),
        stroke: new Stroke({
            color: '#0ff',
            width: 1
        })
    }),
    new Style({
        fill: new Fill({
            color: 'rgba(0,255,0,1)'
        }),
        stroke: new Stroke({
            color: '#0ff',
            width: 1
        })
    })
];

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
var Aletsch_riv = new ImageLayer({
    title: "Aletsch_riv",
    // extent: [-13884991, 2870341, -7455066, 6338219],
    source: new ImageWMS({
        url: 'http://95.216.0.116:8080/geoserver/wms',
        params: {
            'LAYERS': 'Glacier:Aletsch_riv'
        },
        ratio: 1,

        serverType: 'geoserver'
    })
});

var Aletsch_subSource = new VectorSource({
    format: new GeoJSON(),
    url: 'http://chakadwebgis.ir/geoserver/vaghefi/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=vaghefi:subs1_projected&' +
    'outputFormat=application/json&srsname=EPSG:4326',
    strategy: bboxStrategy
});


var Aletsch_sub = new VectorLayer({
    source: Aletsch_subSource,
    style: setStyle
});

var Gorner_riv = new ImageLayer({
    title: "Gorner_riv",
    source: new ImageWMS({
        url: 'http://95.216.0.116:8080/geoserver/wms',
        params: { 'LAYERS': 'Glacier:Gorner_riv' },
        ratio: 1,
        serverType: 'geoserver'
    })
});

var Gorner_Sub = new ImageLayer({
    opacity: 0.5,
    
    title: "Gorner_Sub",
    source: new ImageWMS({
        url: 'http://95.216.0.116:8080/geoserver/wms',
        params: { 'LAYERS': 'Glacier:Gorner_Sub' },
        ratio: 1,
        serverType: 'geoserver'
    })
});

var map = new Map({
    interactions: defaultInteractions().extend([dragAndDropInteraction]),
    layers: [
        new TileLayer({
            title: "basemap",
            source: new BingMaps({ key: "AuZoV8yCqZQq3raQl6Wb-EHw1ssB4cgvs3sczPfg0fqrelVtOvGze1FwJvJ9Ooy0", imagerySet: 'Aerial' })
        }),
        Gorner_Sub, 
        Aletsch_sub,               
        Aletsch_riv,
        Gorner_riv,
    ],
    target: 'map',
    view: new View({
        center: Transform([8.001124, 46.200142], 'EPSG:4326', 'EPSG:3857'),
        zoom: 9.5
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
    if (features.length > 0) {
        var info = [];
        var i, ii;
        for (i = 0, ii = features.length; i < ii; ++i) {
            info.push(features[i].get('name'));
        }
        
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





function setStyle(feature, resolution){
    // return pcpStyle[0];
    // console.log("Style called!")
    var id = feature.get('OBJECTID');
    var element = styleJson[id]["PCP"];
    var intvalue = Math.floor( element/40 );
    return pcpStyle[intvalue];
}

function readFile(path) {
    var result = null;
    var request = new XMLHttpRequest();
    request.open('GET', path, false);
    request.send();
    if(request.status == 200){
        result = request.response;
    }
    return JSON.parse(result);
}
