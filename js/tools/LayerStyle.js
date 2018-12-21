function getStyle(feature, resolution){


    var style1 = new Style({
        fill: new Fill({
            color: 'rgba(0,255,255,0.5)'
        }),
        stroke: new Stroke({
            color: '#0ff',
            width: 1
        })
    });



    // if ( feature.get('rank') == 3) {
    //     return [styleR3];
    // } else {
    //     return [styleCatchAll];
    // }

    return style1;
}