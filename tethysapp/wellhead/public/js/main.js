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
var drawing_listener;
var build_table;
var addRow;
var deleteRow;

/*****************************************************************************
 *                             Variables
 *****************************************************************************/

//  TimML Layers, header lists
var model_constant_layer;
var line_sink_layer;
var head_line_sink_layer;
var res_line_sink_layer;
var line_doublet_imp_layer;
var line_sink_ditch_layer;
var polygon_inhom_layer;
var wells_layer;


/*****************************************************************************
 *                            Main Script
 *****************************************************************************/

////  Edit the selected layer
//edit_layer = function(){
//    var map
//    var layerName
//    var layerIndex
//    var layer
//
//    layerName = $('.ui-selected').find('.layer-name').text().trim();
//
//    if (layerName === ""){
//        error_message("Make sure that you have a layer selected");
//        return false
//    }
//    if (projectInfo.map.layers[layerName].tethys_editable === false){
//        error_message("The selected layer is not editable");
//        return false
//    }
//
//    //  Initialize the map object
//    map = TETHYS_MAP_VIEW.getMap();
//    //  Get the mapIndex for layer selection
//    layerIndex = projectInfo.map.layers[layerName].TethysMapIndex;
//    //  Get the layer from the map
//    layer = map.getLayers().item(layerIndex);
//
//    enter_edit_mode()
//}

//  Add listeners for every new object created
drawing_listener = function(){
    var map;
    var $layer;
    var added_feature;
    var deleted_feature;

    //  Select the drawing layer
    map = TETHYS_MAP_VIEW.getMap();
    for (i=0;i < map.getLayers().getArray().length;i++){
        if (map.getLayers().item(i).tethys_legend_title === "Drawing Layer"){
            $layer = map.getLayers().item(i);
        }
    };

    //  These are the function to be called by the listener
    added_feature = function(e){
        var feature;
        var layerName;

        feature = e.target.getSource().getFeatures().slice(-1)[0];
        layerName = e.target.tag

        //  Use if/else statments to specify which attributes to add to the feature
        if (layerName === 'Constant and Model'){
            for (i=0;i<model_constant_layer.length;i++){
                feature.set(model_constant_layer[i],"");
            }
        }
        else if (layerName === 'Wells'){
            for (i=0;i<wells_layer.length;i++){
                feature.set(wells_layer[i],"");
            };
        }
        else if (layerName === 'Line Sinks'){
            for (i=0;i<line_sink_layer.length;i++){
                feature.set(line_sink_layer[i],"");
            };
        }
        else if (layerName === 'Head Line Sinks'){
            for (i=0;i<head_line_sink_layer.length;i++){
                feature.set(head_line_sink_layer[i],"");
            };
        }
        else if (layerName === 'Res Line Sinks'){
            for (i=0;i<res_line_sink_layer.length;i++){
                feature.set(res_line_sink_layer[i],"");
            };
        }
        else if (layerName === 'Line Doublet Imp'){
            for (i=0;i<line_doublet_imp_layer.length;i++){
                feature.set(line_doublet_imp_layer[i],"");
            };
        }
        else if (layerName === 'Line Sink Ditch'){
            for (i=0;i<line_sink_ditch_layer.length;i++){
                feature.set(line_sink_ditch_layer[i],"");
            };
        }
        else if (layerName === 'Polygon Inhom'){
            for (i=0;i<polygon_inhom_layer.length;i++){
                feature.set(polygon_inhom_layer[i],"");
            };
        }
        console.log(feature);

        $layer.once('change',added_feature);

        addRow(layerName,feature);
    };
    deleted_feature = function(e){
        feature = e.target.getSource().getFeatures().slice(-1)[0];
        console.log(feature);
//        deleteRow(layerName,feature);
    };

    //  Add Listeners only to the drawing layer while draw/delete tools are active/in-use
    $('#draw_Point').click(function(){
        $layer.un('change',added_feature);
        $layer.un('change',deleted_feature);
        $layer.once('change',added_feature);
    });
    $('#draw_Box').click(function(){
        $layer.un('change',added_feature);
        $layer.un('change',deleted_feature);
        $layer.once('change',added_feature);
    });
    $('#draw_Polygon').click(function(){
        $layer.un('change',added_feature);
        $layer.un('change',deleted_feature);
        $layer.once('change',added_feature);
    });
    $('#draw_LineString').click(function(){
        $layer.un('change',added_feature);
        $layer.un('change',deleted_feature);
        $layer.once('change',added_feature);
    });

    //  Remove Listeners if any other map tool is in use
    $('#tethys_pan').click(function(){
        $layer.un('change',added_feature);
        $layer.un('change',deleted_feature);
    });
    $('#tethys_modify').click(function(){
        $layer.un('change',added_feature);
        $layer.un('change',deleted_feature);
    });
    $('#tethys_delete').click(function(){
        $layer.un('change',added_feature);
        $layer.un('change',deleted_feature);
        $layer.once('change',deleted_feature);
    });
    $('#tethys_move').click(function(){
        $layer.un('change',added_feature);
        $layer.un('change',deleted_feature);
    });

}

//  Build the attribute table (called by table_of_contents.js)
build_table = function(layerName,features){

//    //  Empty out the attribute table before rebuilding
//    $('#attr-table tbody').empty();
//
//    //  Build Table from features and properties
//    for (feature in features){
//        for (prop in feature.getProperties())
//
//            $('#attr-table tbody').append("");
//    };

};

addRow = function(layerName,feature){
    var table;
    var row;
    var cell;

    if ($('#attr-table tbody').text() === "No Features on Selected Layer"){
        //  Clear out the table and initialize table and row variables
        $('#attr-table tbody').empty();
        table = document.getElementById('attr-table');
        row = table.insertRow(-1)
            for (property in feature.getProperties()){
                if (String(property) === 'geometry'){}
                else{
                    cell = row.insertCell();
                    cell.innerHTML = String(property);
                }
            };
    }

    

};

/*****************************************************************************
 *                            TimML Layers
 *****************************************************************************/
initialize_timml_layers = function(){
    var map = TETHYS_MAP_VIEW.getMap();
    var timml_layer;
    var numLayers;
    var layers = [];

    //  Initialize the headers for each layer
    model_constant_layer = ["Label","head (Constant)","layer (Constant)","k","zb","zt","c",
        "n=[]","nll=[]"];
    wells_layer = ["label","Qw","rw","layers"];
    line_sink_layer = ["label","sigma","layers"];
    head_line_sink_layer = ["label","head","layers"];
    res_line_sink_layer = ["label","head","res","width","layers","bottomelev"];
    line_doublet_imp_layer = ["label","order","layers"];
    line_sink_ditch_layer = ["label","Q","res","width","layers"];
    polygon_inhom_layer = ["label","Naquifers","k","zb","zt","c","n=[]","nll=[]","order (inhom side)"];


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
        timml_layer.tethys_editable = true;
        timml_layer.tethys_table_of_contents = true;

        // Add drawing layer to the map
        map.addLayer(timml_layer);
    }

    //  Assign Geometry type to layers, used to initialize the right state of edit mode later on
    map.getLayers().item(2).setProperties({'geometry_attribute': 'polygon'});
    map.getLayers().item(3).setProperties({'geometry_attribute': 'line'});
    map.getLayers().item(4).setProperties({'geometry_attribute': 'line'});
    map.getLayers().item(5).setProperties({'geometry_attribute': 'line'});
    map.getLayers().item(6).setProperties({'geometry_attribute': 'line'});
    map.getLayers().item(7).setProperties({'geometry_attribute': 'line'});
    map.getLayers().item(8).setProperties({'geometry_attribute': 'point'});
    map.getLayers().item(9).setProperties({'geometry_attribute': 'point'});


};
/*****************************************************************************
 *                       Add Select Interactions to Map
 *****************************************************************************/
//$(document).ready(function(){
//    var map = TETHYS_MAP_VIEW.getMap();
//    //  Credits for the map "select" interactions to Drag Box Selection Openlayers 3 Example
//    //  http://openlayers.org/en/latest/examples/box-selection.html?q=select
//    // a normal select interaction to handle click
//    var select = new ol.interaction.Select();
//    map.addInteraction(select);
//
//    var selectedFeatures = select.getFeatures();
//
//    // a DragBox interaction used to select features by drawing boxes
//    var dragBox = new ol.interaction.DragBox({
//    condition: ol.events.condition.platformModifierKeyOnly
//    });
//
//    map.addInteraction(dragBox);
//
//    var infoBox = document.getElementById('info');
//
//    dragBox.on('boxend', function() {
//    // features that intersect the box are added to the collection of
//    // selected features, and their names are displayed in the "info"
//    // div
//    var info = [];
//    var extent = dragBox.getGeometry().getExtent();
//    vectorSource.forEachFeatureIntersectingExtent(extent, function(feature) {
//      selectedFeatures.push(feature);
//      info.push(feature.get('name'));
//    });
//    if (info.length > 0) {
//      infoBox.innerHTML = info.join(', ');
//    }
//    });
//
//    // clear selection when drawing a new box and when clicking on the map
//    dragBox.on('boxstart', function() {
//    selectedFeatures.clear();
//    infoBox.innerHTML = '&nbsp;';
//    });
//    map.on('click', function() {
//    selectedFeatures.clear();
//    infoBox.innerHTML = '&nbsp;';
//    });
//});

/*****************************************************************************
 *                        To be executed on load
 *****************************************************************************/

$(document).ready(function(){
    var map = TETHYS_MAP_VIEW.getMap();
    //  This will hide the drawing layer from the view of the user
    map.getLayers().item(1).tethys_toc=false;
    //  Initialize the TimML layers to be used
    initialize_timml_layers();
    //  Add Listeners
    drawing_listener();
});

/*****************************************************************************
 *                              Public
 *****************************************************************************/

 var app;

 app = {build_table:build_table}

///*****************************************************************************
// *                          Useful snippets of code
// *****************************************************************************
// layer.getSource().getExtent(),
// this will return the extents of a layer, returns the coordinates of the bottom right corner and the top left corner
//
//  // Copy original feature
//  var clone = map.getLayers().item(i).features[0].clone();
//  // Get the ID of a feature in openlayers
//  layers.item(i).getSource().getFeatures()[j].getId();
//  // Set the feature ID
//  layers.item(i).getSource().getFeature()[j].setId();
//  // Get the Feature by its ID
//  layers.item(i).getSource().getFeatureById(j);
//  // Remove a layers attribute
//  delete map.getLayers().item(1)['tag']
//
// /

//  Need to build the table using jquery
//  Bootstrap classes: table, table-hover, table-striped
//  AddRows
//  $('#myTable tbody').append("<tr> <td style="width:auto;">Bill</td> <td><input id="ageInput21" name="ageInput21" type="text" class="form-control input-sm" value="30" style = width: auto;margin-bottom:0;"</td><td>cell3</td></tr>")
//  Also need to attach jquery listeners so that every new object drawn triggers a new row with the same columns
//  as generated for the layer.
//  Persists and loads will be done through JSON to and from the map MVLayers
