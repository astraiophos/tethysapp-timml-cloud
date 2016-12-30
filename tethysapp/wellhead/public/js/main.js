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
var $id = 0;


/*****************************************************************************
 *                            Main Script
 *****************************************************************************/

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
        var id

        try{
            layerName = e.target.tag;
            //  This id is unique to the editing layer, as you draw with the editing layer it will increment
            //  an "id_" variable for each feature. the $id is used as a selector to ensure that the right
            //  feature is grabbed for putting information together for the table.
            $id = $id + 1;
            //  Sets a new id for the object and is unique to the object within the layer being edited.
            //  If there are no objects in the edit layer then the id will be set to 1. If there are existing
            //  features then the id will be +1 of whatever the previous object's id was.
            if (e.target.getSource().getFeatures().length === 1){
                id = 1;
            }
            else {
                for (i=0;i < e.target.getSource().getFeatures().length; i++){
                    if (e.target.getSource().getFeatures()[i].getProperties()["ID"] === undefined){}
                    else if (e.target.getSource().getFeatures()[i].getProperties()["ID"] < id){}
                    else{
                        id = e.target.getSource().getFeatures()[i].getProperties()["ID"];
                    }
                };
                id = id + 1;
            }
            feature = e.target.getSource().getFeatureById($id);

            if (feature === null){
                $layer.once('change',added_feature);
                $id = $id - 1;
                return;
            }

            //  Use if/else statments to specify which attributes to add to the feature
            if (layerName === 'Constant and Model'){
                for (i=0;i<model_constant_layer.length;i++){
                    feature.set(model_constant_layer[i],"");
                }
                var label = "Constant_" + id;
                feature.set("Label",label);
                feature.set("ID",id);
            }
            else if (layerName === 'Wells'){
                for (i=0;i<wells_layer.length;i++){
                    feature.set(wells_layer[i],"");
                };
                var label = "Well_" + id;
                feature.set("Label",label);
                feature.set("ID",id);
            }
            else if (layerName === 'Line Sinks'){
                for (i=0;i<line_sink_layer.length;i++){
                    feature.set(line_sink_layer[i],"");
                };
                var label = "LineSink_" + id;
                feature.set("Label",label);
                feature.set("ID",id);
            }
            else if (layerName === 'Head Line Sinks'){
                for (i=0;i<head_line_sink_layer.length;i++){
                    feature.set(head_line_sink_layer[i],"");
                };
                var label = "HeadLineSink_" + id;
                feature.set("Label",label);
                feature.set("ID",id);
            }
            else if (layerName === 'Res Line Sinks'){
                for (i=0;i<res_line_sink_layer.length;i++){
                    feature.set(res_line_sink_layer[i],"");
                };
                var label = "ResLineSink_" + id;
                feature.set("Label",label);
                feature.set("ID",id);
            }
            else if (layerName === 'Line Doublet Imp'){
                for (i=0;i<line_doublet_imp_layer.length;i++){
                    feature.set(line_doublet_imp_layer[i],"");
                };
                var label = "LineDoubletImp_" + id;
                feature.set("Label",label);
                feature.set("ID",id);
            }
            else if (layerName === 'Line Sink Ditch'){
                for (i=0;i<line_sink_ditch_layer.length;i++){
                    feature.set(line_sink_ditch_layer[i],"");
                };
                var label = "LineSinkDitch_" + id;
                feature.set("Label",label);
                feature.set("ID",id);
            }
            else if (layerName === 'Polygon Inhom'){
                for (i=0;i<polygon_inhom_layer.length;i++){
                    feature.set(polygon_inhom_layer[i],"");
                };
                var label = "PolygonInhom_" + id;
                feature.set("Label",label);
                feature.set("ID",id);
            }
//            console.log(feature);

            $layer.once('change',added_feature);

            addRow(layerName,feature,id);
        }
        catch(err){}
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

    //  Remove Listeners altogether when saving or canceling
    $('#editSave').click(function(){
        $layer.un('change',added_feature);
        $layer.un('change',deleted_feature);
    });
    $('#editCancel').click(function(){
        $layer.un('change',added_feature);
        $layer.un('change',deleted_feature);
    });
};

save_attributes = function(layerName){
    var map;
    var layer;
    var features;
    var feature;
    var selector;
    var copyFeatures = [];
    var featureProps = [];
    var id = 0;

    //  Get the correct layer which the attributes need to be saved to
    map = TETHYS_MAP_VIEW.getMap();
    for(i=0;i<map.getLayers().getArray().length;i++){
        if (map.getLayers().item(i).tethys_legend_title === layerName){
            layer = map.getLayers().item(i);
        }
    };

    //  Loop through each feature and property and set the value of the field to the feature
    features = layer.getSource().getFeatures();
    //  Make sure that the features are in the right order so that the ID's match the table field
    features.sort(function(a,b){
	    return a.getProperties()["ID"] - b.getProperties()["ID"];
    });
    for (i=0;i<features.length;i++){
        feature = features[i];
        for (property in feature.getProperties()){
            if (String(property) === 'geometry'){}
            else if (String(property) === 'ID'){}
            else if (String(property) === 'type'){}
            else{
                //  id number represents the row number in this case
                id = i+1;
                selector = property.replace(/\s+/g,'_') + "_" + id;
                feature.set(String(property),$('#'+selector)["0"].value);
            }
        };
    };

    //  Update features to have the right attributes
    for (feature in layer.getSource().getFeatures()){
        copyFeatures.push({
            'type': 'Feature',
            'geometry':{
                'type': layer.getSource().getFeatures()[feature].getGeometry().getType(),
                'coordinates': layer.getSource().getFeatures()[feature].getGeometry().getCoordinates(),
            }
        });
        //  Gather the properties for each element
        featureProps[feature] = [];
        for (property in layer.getSource().getFeatures()[feature].getProperties()){
            if (String(property) === 'geometry'){}
            else if (String(property) === 'type'){}
            else{
                featureProps[feature].push([String(property),layer.getSource().getFeatures()[feature].getProperties()[property]])
            }
        };
    };
    //  Add Properties to feature list
    for (feature in copyFeatures){
        for (prop in featureProps[feature]){
            copyFeatures[feature][featureProps[feature][prop][0]] = featureProps[feature][prop][1];
        };
    };
    return copyFeatures
};

//  Build the attribute table (called by table_of_contents.js)
build_table = function(layerName,features,editable){
    var table;
    var row;
    var cell;
    var feature;
    var id;
    var featureCount;

    //  Save the attributes before anything else if the table has been edited and needs to be saved
    if ($('#attr-table.edit')[0] != undefined){
        features = save_attributes(layerName);
        $('#attr-table').removeClass('edit')
    }
    //  Empty out the attribute table before rebuilding
    $('#attr-table tbody').empty();
    
    //  Features will be reorganized by their ID attribute to preserve the original drawing order
    features.sort(function(a,b){
	    return a["ID"] - b["ID"];
    });

    //  Build Table from features and properties
    table = document.getElementById('attr-table');
    row = table.insertRow(-1)
    for (property in features[0]){
        if (String(property) === 'geometry'){}
        else if (String(property) === 'type'){}
        else if (String(property) === 'ID'){}
        else{
            cell = row.insertCell();
            cell.style = "width:auto";
            cell.innerHTML = String(property);
        }
    };

    if (editable){
        $('#attr-table').addClass('edit')
        for (i=0;i<features.length;i++){
            feature = features[i];
            row = table.insertRow(-1);
            id = feature["ID"];
            for (property in feature){
                if (String(property) === 'geometry'){}
                else if (String(property) === 'type'){}
                else if (String(property) === 'ID'){}
                else{
                    cell = row.insertCell();
                    cell.style = "width:auto";
                    cell.innerHTML = "<input id=" + property.replace(/\s+/g,'_') + "_" + id +" type='text'" +
                        "class='form-control input-sm' value=' '" +
                        "style=width:auto;margin-bottom:0;" + ">";
                    $(cell).find("input")["0"].value = String(feature[property]);
                }
            };
        };
    }

    else{
        for (i=0;i<features.length;i++){
            feature = features[i];
            row = table.insertRow(-1);
            for (property in feature){
                if (String(property) === 'geometry'){}
                else if (String(property) === 'type'){}
                else if (String(property) === 'ID'){}
                else{
                    cell = row.insertCell();
                    cell.style = "width:auto";
                    cell.innerHTML = feature[property];
                }
            };
        };
    }

    //  Update the feature count for each layer
    featureCount = features.length;
    $('.layer-name').each(function(index){
        if($(this).text().trim()===layerName){
            $(this).parent().find('.feature-count').html("(" + featureCount + ")");}
    })
};

addRow = function(layerName,feature,id){
    var table;
    var row;
    var cell;

    //  Designates that the table is open for editing and that changes should be saved
    $('#attr-table').addClass('edit')

    if ($('#attr-table tbody').text() === "No Features on Selected Layer"){
        //  Clear out the table and initialize table and row variables
        $('#attr-table tbody').empty();
        table = document.getElementById('attr-table');
        row = table.insertRow(0)
            for (property in feature.getProperties()){
                if (String(property) === 'geometry'){}
                else if (String(property) === 'ID'){}
                else if (String(property) === 'type'){}
                else{
                    cell = row.insertCell();
                    cell.style = "width:auto";
                    cell.innerHTML = String(property);
                }
            };
    }
    table = document.getElementById('attr-table');
    row = table.insertRow(-1)
        for (property in feature.getProperties()){
            if (String(property) === 'geometry'){}
            else if (String(property) === 'ID'){}
            else if (String(property) === 'type'){}
            else{
                cell = row.insertCell();
                cell.style = "width:auto";
                //  Credits to @Deviljho and @SimeVidas on stackoverflow.com for this little trick with removing spaces
                cell.innerHTML = "<input id=" + property.replace(/\s+/g,'_') + "_" + id +" type='text'" +
                    "class='form-control input-sm' value=' '" +
                    "style=width:auto;margin-bottom:0;" + ">";
                $(cell).find("input")["0"].value = String(feature.getProperties()[property]);
            }
        };
};

deleteRow = function(){

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
    model_constant_layer = ["Label","constant head","constant layer","k","zb","zt","c",
        "n","nll"];
    wells_layer = ["Label","Qw","rw","layers"];
    line_sink_layer = ["Label","sigma","layers"];
    head_line_sink_layer = ["Label","head","layers"];
    res_line_sink_layer = ["Label","head","res","width","layers","bottomelev"];
    line_doublet_imp_layer = ["Label","order","layers"];
    line_sink_ditch_layer = ["Label","Q","res","width","layers"];
    polygon_inhom_layer = ["Label","Naquifers","k","zb","zt","c","n","nll","inhom side order"];


    //  Assign layers[] with the list of TimML layer variables with [layer,color]
    layers.push(['Polygon Inhom','rgba(10,10,10,0.5)']);
    layers.push(['Line Sink Ditch','#fff000']);
    layers.push(['Line Doublet Imp','#fff000']);
    layers.push(['Res Line Sinks','#fff00']);
    layers.push(['Head Line Sinks','#fff000']);
    layers.push(['Line Sinks','#fff000']);
    layers.push(['Wells','#fff000']);
    layers.push(['Constant and Model','#fff000']);

    layer_source = new ol.source.Vector({wrapX: false});

    for (i=0;i<layers.length;i++){
        layer = layers[i];
        timml_layer = new ol.layer.Vector({
            source: layer_source,
            style: new ol.style.Style({
                    fill: new ol.style.Fill({
                    color: layer[1]
                    }),
                    stroke: new ol.style.Stroke({
                    color: layer[1],
                    width: 2
                    }),
                    image: new ol.style.Circle({
                        radius: 4,
                        fill: new ol.style.Fill({
                          color: layer[1]
                        })
                    }),
                })
        });

        // Add drawing layer legend properites
        timml_layer.tethys_legend_title = String(layer[0]);
        timml_layer.tethys_editable = true;
        timml_layer.tethys_table_of_contents = true;
        timml_layer.color = layer[1];

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
    //  Bind listeners to map drawing tools
    drawing_listener();
});

/*****************************************************************************
 *                              Public
 *****************************************************************************/

 var app;

 app = {build_table:build_table,
        drawing_listener:drawing_listener}

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
