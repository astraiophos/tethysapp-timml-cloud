/*****************************************************************************
 * FILE:    main.js
 * DATE:    12/16/2016
 * AUTHOR:  Jacob Fullerton
 * COPYRIGHT: (c) 2016 Brigham Young University
 * LICENSE: BSD 2-Clause
 * CONTRIBUTIONS:   http://openlayers.org/
 *
 *****************************************************************************/

/*****************************************************************************
 *                              Functions
 *****************************************************************************/

var initialize_timml_layers;

/*****************************************************************************
 *                             Variables
 *****************************************************************************/

//  TimML Layers
var model_constant_layer;
var line_sink_layer;
var head_line_sink_layer;
var res_line_sink_layer;
var line_doublet_imp_layer;
var line_sink_ditch_layer;
var polygon_inhom_layer;
var wells_layer;

//  Layer options and attributes

/*****************************************************************************
 *                            Main Script
 *****************************************************************************/


/*****************************************************************************
 *                            TimML Layers
 *****************************************************************************/
initialize_timml_layers = function(){
    var map = TETHYS_MAP_VIEW.getMap();
    var timml_layer;
    var numLayers;
    var layers = [];

    //  Assign layers[] with the list of TimML layer variables with [layer,color]
    layers.push(['Polygon Inhom','#fff00']);
    layers.push(['Line Sink Ditch','#fff00']);
    layers.push(['Line Doublet Imp','#fff00']);
    layers.push(['Res Line Sinks','#fff00']);
    layers.push(['Head Line Sinks','#fff00']);
    layers.push(['Line Sinks','#fff00']);
    layers.push(['Wells','#fff00']);
    layers.push(['Constant and Model','#fff00']);

    layer_source = new ol.source.Vector({wrapX: false});

    numLayers = layers.length;
    for (i=0;i<numLayers;i++ in layers){
        layer = layers[i];
        timml_layer = new ol.layer.Vector({
            source: layer_source,
            style: new ol.style.Style({
              fill: new ol.style.Fill({
                color: layer[1]
                }),
              stroke: new ol.style.Stroke({
                color: String(layer[1]),
                width: 2
                }),
              image: new ol.style.Circle({
                radius: 4,
                fill: new ol.style.Fill({
                  color: String(layer[1])
                })
              }),
            })
        });

        // Add drawing layer legend properites
        timml_layer.tethys_legend_title = String(layer[0]);
        timml_layer.editable = true;
        timml_layer.tethys_toc = true;

        // Add drawing layer to the map
        map.addLayer(timml_layer);
    }
};

exit_edit_mode = function(){
    //  Hide all of the Draw/Edit tools in the Map View Gizmo

};

/*****************************************************************************
 *                        To be executed on load
 *****************************************************************************/

$(document).ready(function(){
    var map = TETHYS_MAP_VIEW.getMap();
    //  This will hide the drawing layer from the view of the user
    map.getLayers().item(1).tethys_toc=false;
    //  Initialize the TimML layers to be used
    initialize_timml_layers();
});

///*****************************************************************************
// *                          Useful snippets of code
// *****************************************************************************
// layer.getSource().getExtent(),
// this will return the extents of a layer, returns the coordinates of the bottom right corner and the top left corner
//
//
// /
