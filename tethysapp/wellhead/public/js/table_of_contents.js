/*****************************************************************************
 * FILE:    table_of_contents.js
 * DATE:    12/16/2016
 * AUTHOR:  Shawn Crawley and Jacob Fullerton
 * COPYRIGHT: (c) 2016 Brigham Young University
 * LICENSE: BSD 2-Clause
 * CONTRIBUTIONS:   http://openlayers.org/
 * OTHER SOURCES: Source code for the original Table of Contents tool is
 *      located at https://github.com/hydroshare/tethysapp-hydroshare_gis,
 *      extracted from the main.js page in tethysapp/hydroshare_gis/public/js
 *
 *****************************************************************************/

/*****************************************************************************
 *                           Gizmo Functions
 *****************************************************************************/
var readInitialLayers;
var createLayerListItem;
var addListenersToListItem;
var editLayerDisplayName;
var closeLyrEdtInpt;

var initializeLayersContextMenus;
var initializeJqueryVariables;
var addListenersToInitialLayers;
var addInitialEventListeners;
var select_list_item;

var onClickRenameLayer;
var onClickEditLayer;
var onClickSaveEdits;
var onClickShowAttrTable;

/*****************************************************************************
 *                             Variables
 *****************************************************************************/
 var $tocLayersList;
 var projectInfo;
 var contextMenuDict;
/*****************************************************************************
 *                            Main Script
 *****************************************************************************/

//  Initialize JQUERY Variables
initializeJqueryVariables = function(){
    $tocLayersList = $('#toc-layers-list');
}

//  Read in the layers from the map_view gizmo
readInitialLayers = function (){
    var map;
    var layers;
    var i;

    //  Get the map object to read in initial layers on map
    map = TETHYS_MAP_VIEW.getMap();
    layers = map.getLayers();

    //  Make Drawing Layer not editable on initialization as edit mode will appropriately handle the editable state
    for (i=0; i < map.getLayers().getArray().length;i++){
        if (map.getLayers().item(i).tethys_legend_title === "Drawing Layer"){
            map.getLayers().item(i).tethys_editable = false;
        }
    };

    //  Start 'i' counter and count backwards in reverse order to obtain the correct map index for the layer
    i = layers.array_.length - 1;

    //  Read through layers and sift out only the layers that are wanted for the Table of Contents
    for (layer in layers.array_.reverse()){
        if (layers.item(layer).tethys_table_of_contents === true || String(layers.item(layer).tethys_toc) === "undefined"){
            createLayerListItem(layers.item(layer),i);
        }
        i -= 1
    }
    //  Put layers back in original order and add listeners
    layers.array_.reverse();
    addMenus_and_ListenersToInitialLayers();
}

//  Add listeners to the initial table of contents as read in from the map view gizmo layers
addMenus_and_ListenersToInitialLayers = function()
{
    // Reinitialize the variables to make sure the list is up-to-date
    initializeJqueryVariables();
    var $list = $tocLayersList;
    var $listItem;
    for (i=0; i < $list.children().length; i++){
        $listItem = $tocLayersList.find('li:nth-child(' + (i+1) + ')');
        addListenersToListItem($listItem);
        if ($listItem.find('.layer-name').text().trim() === "Basemap"){
            addContextMenuToListItem($listItem,'Basemap');
        }
        else{
            addContextMenuToListItem($listItem,'GeographicFeatureResource');
        };
    };
};

projectInfo = {
    'resId': null,
    'map': {
        'baseMap': 'None',
        'layers': {},
    }
};

createLayerListItem = function (layer,mapIndex,position) {
        var $newLayerListItem;
        var zIndex;
        var chkbxHtml;
        var listHtmlString =
            '<li class="ui-state-default" ' +
            'data-editable="' + layer.editable + '" ' +
            'data-geom-type="' + layer.geometry_attribute + '"> ' +
            '<input class="chkbx-layer" type="checkbox">' +
            '<span class="layer-name">' + layer.tethys_legend_title + '</span>' +
            '<input type="text" class="edit-layer-name hidden" value="' + layer.tethys_legend_title + '">' +
            '<div class="hmbrgr-div"><img src="/static/wellhead/images/hamburger-menu.png"></div>' +
            '</li>';

        if (position === 'prepend') {
            $tocLayersList.prepend(listHtmlString);
            $newLayerListItem = $tocLayersList.find('li:first-child');
        } else {
            $tocLayersList.append(listHtmlString);
            $newLayerListItem = $tocLayersList.find(':last-child');
        }

        if (layer.getProperties().visible === true){
            $newLayerListItem.find('.chkbx-layer').prop('checked', layer.getProperties().visible);
        }

        // Get the count and assign the initial list order value to the new layer in the TOC
        initializeJqueryVariables();
        zIndex = $tocLayersList.children().length;

        projectInfo.map.layers[layer.tethys_legend_title] = {
            displayName: layer.tethys_legend_title,
            TethysMapIndex: Number(mapIndex),
            layerListIndex: zIndex,
            extents: layer.tethys_legend_extent,
            editable: layer.tethys_editable,
            geomType: layer.getProperties().geometry_attribute
        };
};

addContextMenuToListItem = function ($listItem, resType) {
    var contextMenuId;

    $listItem.find('.hmbrgr-div img')
        .contextMenu('menu', contextMenuDict[resType], {
            'triggerOn': 'click',
            'displayAround': 'trigger',
            'mouseClick': 'left',
            'position': 'right',
            'onOpen': function (e) {
                $('.hmbrgr-div').removeClass('hmbrgr-open');
                $(e.trigger.context).parent().addClass('hmbrgr-open');
            },
            'onClose': function (e) {
                $(e.trigger.context).parent().removeClass('hmbrgr-open');
            }
        });
    contextMenuId = $('.iw-contextMenu:last-child').attr('id');
    $listItem.data('context-menu', contextMenuId);
};

addListenersToListItem = function ($listItem) {/*, layerIndex) {*/
        var $layerNameInput;
        $listItem.find('.layer-name').on('dblclick', function () {
            var $layerNameSpan = $(this);
            $layerNameSpan.addClass('hidden');
            var $layerNameInput = $listItem.find('input[type=text]');
            $layerNameInput
                .val($layerNameSpan.text())
                .removeClass('hidden')
                .select()
                .on('keyup', function (e) {
                    editLayerDisplayName(e, $(this), $layerNameSpan);/*, layerIndex);*/
                })
                .on('click', function (e) {
                    e.stopPropagation();
                });

            $(document).on('click.edtLyrNm', function () {
                closeLyrEdtInpt($layerNameSpan, $layerNameInput);
            });
        });

        $listItem.find('.hmbrgr-div img').on('click', function (e) {
            var clickedObj = $(e.currentTarget);
            var contextmenuId;
            var menuObj;
            var newStyle;
            contextmenuId = $listItem.data('context-menu');
            menuObj = $('#' + contextmenuId);
            if (menuObj.attr('style') !== undefined && menuObj.attr('style').indexOf('display: none;') === -1) {
                window.setTimeout(function () {
                    newStyle = menuObj.attr('style').replace('inline-block', 'none');
                    menuObj.attr('style', newStyle);
                    clickedObj.parent().removeClass('hmbrgr-open');
                }, 50);
            }
        });
    };

editLayerDisplayName = function (e, $layerNameInput, $layerNameSpan) {
    var newDisplayName;
    var map = TETHYS_MAP_VIEW.getMap();
    var nameB4Change = $layerNameSpan.text();
    if (e.which === 13) {  // Enter key
        newDisplayName = $layerNameInput.val();
        if (nameB4Change !== newDisplayName) {
            // Make sure the user does not rename a layer the same name as an existing layer
            if (projectInfo.map.layers[newDisplayName] !== undefined) {
                error_message('A layer already exists with that name. Please choose a different name');
            } else {
                $layerNameSpan.text(newDisplayName);
                projectInfo.map.layers[nameB4Change].displayName = newDisplayName;
                map.getLayers().item(projectInfo.map.layers[nameB4Change].TethysMapIndex).tethys_legend_title = newDisplayName;
                projectInfo.map.layers[newDisplayName] = projectInfo.map.layers[nameB4Change];
                delete projectInfo.map.layers[nameB4Change];
                TETHYS_MAP_VIEW.updateLegend();
//                $btnSaveProject.prop('disabled', false);
                closeLyrEdtInpt($layerNameSpan, $layerNameInput);
            }
        } else {
            closeLyrEdtInpt($layerNameSpan, $layerNameInput);
        }
    } else if (e.which === 27) {  // Esc key
        closeLyrEdtInpt($layerNameSpan, $layerNameInput);
    }
};

initializeLayersContextMenus = function () {
    layersContextMenuBase = [
//        {
//            name: 'Isolate',
//            title: 'Isolate',
//            fun: function (e) {
//                onClickisolateLayer(e);
//            }
//        },
        {
            name: 'Rename',
            title: 'Rename',
            fun: function (e) {
                onClickRenameLayer(e);
            }
        }
//        {
//            name: 'Delete',
//            title: 'Delete',
//            fun: function (e) {
////                onClickDeleteLayer(e);
//                console.log("Deleting the layer sir...")
//            }
//        }
    ];

    layersContextMenuGeospatialBase = layersContextMenuBase.slice();
    layersContextMenuGeospatialBase.unshift({
        name: 'Zoom to',
        title: 'Zoom to',
        fun: function (e) {
//            onClickZoomToLayer(e);
            console.log("Zoomin' to the layer captain...I'm giving it all she's got captain!")
        }
    });

    layersContextMenuRaster = layersContextMenuGeospatialBase.slice();
    layersContextMenuRaster.unshift({
        name: 'Modify symbology',
        title: 'Modify symbology',
        fun: function (e) {
//            onClickModifySymbology(e);
            console.log("Modifying the symbology!...oh wait...")
        }
    }),
//    {
//        name: 'View legend',
//        title: 'View legend',
//        fun: function (e) {
//            onClickViewLegend(e);
//        }
//    },
//        {
//        name: 'Get pixel value on click',
//        title: 'Get pixel value on click',
//        fun: function (e) {
//            onClickViewGetPixelVal(e);
//        }
//    });

    layersContextMenuVector = layersContextMenuRaster.slice();
    layersContextMenuVector.unshift(
//    {
//        name: 'Attribute Table',
//        title: 'Attribute Table',
//        fun: function (e) {
//            onClickShowAttrTable(e);
//        }
//    },
    {
        name: 'Edit Features',
        title: 'Edit Features',
        fun: function (e) {
            onClickEditLayer(e);
        }
    }
//    {
//        name: 'Save Edits',
//        title: 'Save Edits',
//        fun: function (e) {
//            onClickSaveEdits(e);
//        }
//    }
    );


    contextMenuDict = {
//        'GenericResource': layersContextMenuViewFile,
        'GeographicFeatureResource': layersContextMenuVector,
        'Basemap':layersContextMenuBase
//        'TimeSeriesResource': layersContextMenuTimeSeries,
//        'RefTimeSeriesResource': layersContextMenuTimeSeries,
//        'RasterResource': layersContextMenuRaster
    };
};

drawLayersInListOrder = function () {
    var i;
    var index;
    var layer;
    var displayName;
    var numLayers;
    var zIndex;
    var map;

    //  Define map as TETHYS_MAP
    map = TETHYS_MAP_VIEW.getMap();

    numLayers = $tocLayersList.children().length;
    for (i = 1; i <= numLayers; i += 1) {
        layer = $tocLayersList.find('li:nth-child(' + (i) + ')');
        displayName = layer.text().trim();
        index = Number(projectInfo.map.layers[layer.text().trim()].TethysMapIndex);
        if (index < 1000) {
            zIndex = numLayers - i;
            map.getLayers().item(index).setZIndex(zIndex);
        }
        projectInfo.map.layers[displayName].layerListIndex = i;
//        $btnSaveProject.prop('disabled', false);
    }
};

addInitialEventListeners = function(){
    var map;

    //  Initialize the map object
    map = TETHYS_MAP_VIEW.getMap();

    //  Add a listener for all checkbox layers
    $(document).on('change', '.chkbx-layer', function () {
        var layerName = $(this).next().text().trim();
        var index = projectInfo.map.layers[layerName].TethysMapIndex;

        map.getLayers().item(index).setVisible($(this).is(':checked'));
    });
};

/*****************************************************************************
 *                           Context Menu Functions
 *****************************************************************************/

onClickRenameLayer = function (e) {
    var clickedElement = e.trigger.context;
    var $lyrListItem = $(clickedElement).parent().parent();
    var $layerNameInput = $lyrListItem.find('input[type=text]');
    var $LayerNameSpan = $lyrListItem.find('span');

    $LayerNameSpan.addClass('hidden');
    $lyrListItem.find('input')
        .removeClass('hidden')
        .select()
        .on('keyup', function (e) {
            editLayerDisplayName(e, $(this), $LayerNameSpan);/*, layerIndex);*/
        })
        .on('click', function (e) {
            e.stopPropagation();
        });

    $(document).on('click.edtLyrNm', function () {
        closeLyrEdtInpt($LayerNameSpan, $layerNameInput);
    });
};

closeLyrEdtInpt = function ($layerNameSpan, $layerNameInput) {
    $layerNameInput
        .addClass('hidden')
        .off('keyup')
        .off('click');
    $layerNameSpan.removeClass('hidden');
    $(document).off('click.edtLyrNm');
};

onClickisolateLayer = function(e) {
    var clickedElement = e.trigger.context;
    var $lyrListItem = $(clickedElement).parent().parent();
    var layerName = $lyrListItem.find('span').text().trim();
    var i;
    var numLayers;
    var map;
    var mapIndex;

    //  Use the projectInfo for finding the mapIndex and initialize map
    mapIndex = projectInfo.map.layers[layerName].TethysMapIndex;
    map = TETHYS_MAP_VIEW.getMap();

    //  Find the number of layers in the map object
    numLayers = map.getLayers().getArray().length;

    //  Set layer visibility state, leaving only the 'clicked' layer as visible
    for (i=0; i < numLayers; i++){
        if (i != mapIndex){
            map.getLayers().item(i).setVisible(false);
        }
        else{
            map.getLayers().item(i).setVisible(true);
        }
    }
};
//*TODO*Need to select drawing layer regardless of index, right now it's hard coded to be layer 1 = Drawing Layer
onClickEditLayer = function(e){
    //  Initialize the layer item variables, use a try/catch to make a button available as an option for layer editing.
    try{
        if (e){
            var clickedElement = e.trigger.context;
            var $lyrListItem = $(clickedElement).parent().parent();
        }
        else{
            var $lyrListItem = $('.ui-selected');
        }
    }
    catch(err){console.log(err);};
    if ($lyrListItem[0] === undefined){
        error_message("You have not selected a layer, please select one for editing");
        return false;
    }

    var layerName = $lyrListItem.find('span').text().trim();
    var numLayers;
    var map;
    var mapIndex;
    var layer;
    var clone;
    var copyFeatures=[];
    var featureProps=[];
    var copied;
    var newStyle;
    var jsonFeatures;
    var jsonStyle;

    //  Use the projectInfo for finding the mapIndex and initialize map
    mapIndex = projectInfo.map.layers[layerName].TethysMapIndex;
    map = TETHYS_MAP_VIEW.getMap();
    layer = map.getLayers().item(mapIndex);

    //  Make sure that the layer being edited is actually editable
    if (layer.tethys_editable === false){
        error_message("This layer is locked and cannot be edited," +
            " make sure that you aren't already editing another layer." +
            " Otherwise, contact the administrator.");
        return false
    }

    //  Find the number of layers in the map object
    numLayers = map.getLayers().getArray().length;

    //  Make all layers except for Drawing Layer not-editable
    for (i=0; i < numLayers; i++){
        if (i != 1){
            map.getLayers().item(i).tethys_editable = false;
        }
        else{
            map.getLayers().item(i).tethys_editable = true;
            map.getLayers().item(i).setVisible(true);
        }
    }

    try{
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
                else{
                    featureProps[feature].push([String(property),layer.getSource().getFeatures()[feature].getProperties()[property]])
                    console.log(property);
                }
            };
            //  This copies the features to the drawinglayer
            map.getLayers().item(1).getSource().addFeature(layer.getSource().getFeatures()[feature].clone())
        };
        //  Add Properties to feature list
        for (feature in copyFeatures){
            for (prop in featureProps[feature]){
                copyFeatures[feature][featureProps[feature][prop][0]] = featureProps[feature][prop][1];
            }
        };
        copied = {
            'type': 'FeatureCollection',
            'crs': {
                'type': 'name',
                'properties': {
                    'name':'EPSG:4326'
                }
            },
            'features': copyFeatures
        };
        newStyle = layer.getStyle();

        //  Read features and style to string for localStorage and then store features and style
        jsonFeatures = JSON.stringify(copied);
        jsonStyle = JSON.stringify(newStyle);

        localStorage.setItem(String(layerName + "_Features"),jsonFeatures);
        localStorage.setItem(String(layerName + "_Style"),jsonStyle);

        //  Set drawing layer style to match the layer to be edited
        map.getLayers().item(1).setStyle(newStyle);

    }
    catch(err){
        console.log(err);
        newStyle = layer.getStyle();

        //  Read style to string for localStorage and store style
        jsonStyle = JSON.stringify(newStyle);
        localStorage.setItem(String(layerName + "_Style"),jsonStyle);

        //  Set drawing layer style to match the layer to be edited
        map.getLayers().item(1).setStyle(newStyle);
    }

    layer.getSource().clear();
    map.getLayers().item(1).tag = layerName;
    enter_edit_mode(projectInfo.map.layers[layerName].geomType,'#attr-table input');
    $('#editSave').removeClass("hidden");
    $('#editCancel').removeClass("hidden");
};

onClickSaveEdits = function(){
    var layerName;
    var numLayers;
    var map;
    var mapIndex;
    var layer;
    var clone;
    var copyFeatures=[];
    var featureProps=[];
    var copied;
    var format;
    var newStyle;
    var newSource;
    var jsonFeatures;
    var jsonStyle;

    //  Initialize map object
    map = TETHYS_MAP_VIEW.getMap();

    //  Set the layer to the edit layer
    layer = map.getLayers().item(1);

    //  Make sure that edit mode is turned on
    if (layer.tethys_editable === false){
        error_message("You are not in edit mode.");
        return false
    }

    layerName = map.getLayers().item(1).tag;

    //  Use the projectInfo for finding the mapIndex
    mapIndex = projectInfo.map.layers[layerName].TethysMapIndex;


    //  Return all layers to their original editable state based on ProjectInfo
    for (mapObj in projectInfo.map.layers){
        if (projectInfo.map.layers[mapObj].editable === true){
            map.getLayers().item(projectInfo.map.layers[mapObj].TethysMapIndex).tethys_editable = true;
        }
        else{
            map.getLayers().item(projectInfo.map.layers[mapObj].TethysMapIndex).tethys_editable = false;
        }
    };

    try{
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
                else{
                    featureProps[feature].push([String(property),layer.getSource().getFeatures()[feature].getProperties()[property]])
                    console.log(property);
                }
            };
            //  This copies the features to the drawinglayer
//            map.getLayers().item(mapIndex).getSource().addFeature(layer.getSource().getFeatures()[feature].clone())
        };
        //  Add Properties to feature list
        for (feature in copyFeatures){
            for (prop in featureProps[feature]){
                copyFeatures[feature][featureProps[feature][prop][0]] = featureProps[feature][prop][1];
            }
        };
        copied = {
            'type': 'FeatureCollection',
            'crs': {
                'type': 'name',
                'properties': {
                    'name':'EPSG:4326'
                }
            },
            'features': copyFeatures
        };
        newStyle = layer.getStyle();

        //  Establish the format as GeoJSON
        format = new ol.format.GeoJSON();

        //  Create new layer source for the layer receiving the features
        newSource = new ol.source.Vector({
        features: format.readFeatures(copied,
        {featureProjection:"EPSG:4326"})
        });

        //  Read features and style to string for localStorage and then store features and style
        jsonFeatures = JSON.stringify(copied);
        jsonStyle = JSON.stringify(newStyle);

        localStorage.setItem(String(layerName + "_Features"),jsonFeatures);
        localStorage.setItem(String(layerName + "_Style"),jsonStyle);

        //  Set drawing layer style to match the layer to be edited
        map.getLayers().item(mapIndex).setStyle(newStyle);

        //  Set the save layer to the new source
        map.getLayers().item(mapIndex).setSource(newSource);

    }
    catch(err){
        console.log(err);
        newStyle = layer.getStyle();

        //  Read style to string for localStorage and store style
        jsonStyle = JSON.stringify(newStyle);
        localStorage.setItem(String(layerName + "_Style"),jsonStyle);

        //  Set drawing layer style to match the layer to be edited
        map.getLayers().item(mapIndex).setStyle(newStyle);
    }

    layer.getSource().clear();
    delete map.getLayers().item(1).tag;
    layer.tethys_editable = false;
    layer.setVisible(false);

    exit_edit_mode('#attr-table input');
    $('#editSave').addClass("hidden");
    $('#editCancel').addClass("hidden");
};

onClickShowAttrTable = function(e){
    //  Initialize the layer item variables, use a try/catch to make a button available as an option for layer editing.
    try{
        if (e){
            var clickedElement = e.trigger.context;
            var $lyrListItem = $(clickedElement).parent().parent();
        }
        else{
            var $lyrListItem = $('.ui-selected');
        }
    }
    catch(err){console.log(err);};
    if ($lyrListItem[0] === undefined){
        error_message("No layer selected");
        return false;
    }
    var layerName = $lyrListItem.find('span').text().trim();
    var numLayers;
    var map;
    var mapIndex;
    var layer;
    var copyFeatures=[];
    var featureProps=[];

    //  Use the projectInfo for finding the mapIndex and initialize map
    mapIndex = projectInfo.map.layers[layerName].TethysMapIndex;
    map = TETHYS_MAP_VIEW.getMap();
    layer = map.getLayers().item(mapIndex);
    console.log(layerName + " Attr Table Coming Up!");

    try{
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
                else{
                    featureProps[feature].push([String(property),layer.getSource().getFeatures()[feature].getProperties()[property]])
                    console.log(property);
                }
            };
        };
        //  Add Properties to feature list
        for (feature in copyFeatures){
            for (prop in featureProps[feature]){
                copyFeatures[feature][featureProps[feature][prop][0]] = featureProps[feature][prop][1];
            }
        };

    }
    catch(err){
        console.log(err);
    }
    if (copyFeatures.length === 0){
        $('#attr-table tbody').empty()
        $('#attr-table tbody').append("<tr><td align='center'>No Features on Selected Layer</td></tr>")
    }
};

/*****************************************************************************
 *                           Utility Functions
 *****************************************************************************/

enter_edit_mode = function(layerType,attrTableId){
    //  Show the Draw/Edit tools in the Map View Gizmo
    //  If the layer in question is a point layer, only turn on pertinent tools
    if (layerType === "point"){
        try{
            $('#tethys_delete').removeClass('hidden')}
        catch(err){}
        try{
            $('#tethys_move').removeClass('hidden')}
        catch(err){}
        try{
            $('#draw_Point').removeClass('hidden')}
        catch(err){}
    }
    else if (layerType === "line"){
        try{
            $('#tethys_modify').removeClass('hidden')}
        catch(err){}
        try{
            $('#tethys_delete').removeClass('hidden')}
        catch(err){}
        try{
            $('#tethys_move').removeClass('hidden')}
        catch(err){}
        try{
            $('#draw_LineString').removeClass('hidden')}
        catch(err){}
    }
    else if (layerType === "polygon"){
        try{
            $('#tethys_modify').removeClass('hidden')}
        catch(err){}
        try{
            $('#tethys_delete').removeClass('hidden')}
        catch(err){}
        try{
            $('#tethys_move').removeClass('hidden')}
        catch(err){}
        try{
            $('#draw_Box').removeClass('hidden')}
        catch(err){}
        try{
            $('#draw_Polygon').removeClass('hidden')}
        catch(err){}
    }
        //  If there is not a definition of the object type in the layer, turn them all on
    else {
        try{
            $('#tethys_modify').removeClass('hidden')}
        catch(err){}
        try{
            $('#tethys_delete').removeClass('hidden')}
        catch(err){}
        try{
            $('#tethys_move').removeClass('hidden')}
        catch(err){}
        try{
            $('#draw_Point').removeClass('hidden')}
        catch(err){}
        try{
            $('#draw_Box').removeClass('hidden')}
        catch(err){}
        try{
            $('#draw_Polygon').removeClass('hidden')}
        catch(err){}
        try{
            $('#draw_LineString').removeClass('hidden')}
        catch(err){}
    }
    $(attrTableId).prop("disabled",false)
};

exit_edit_mode = function(attrTableId){
    //  Hide all of the Draw/Edit tools in the Map View Gizmo
    try{
        $('#tethys_modify').addClass('hidden')}
    catch(err){}
    try{
        $('#tethys_delete').addClass('hidden')}
    catch(err){}
    try{
        $('#tethys_move').addClass('hidden')}
    catch(err){}
    try{
        $('#draw_Point').addClass('hidden')}
    catch(err){}
    try{
        $('#draw_Box').addClass('hidden')}
    catch(err){}
    try{
        $('#draw_Polygon').addClass('hidden')}
    catch(err){}
    try{
        $('#draw_LineString').addClass('hidden')}
    catch(err){}
    try{
        $('#tethys_pan').find('div:first-child').click()}
    catch(err){}
    $(attrTableId).prop("disabled",true)
};

select_list_item = function(){
    //  Make layers highlight when clicked on
    $('.layer-name').parent().on('click',function(){
        $('.layer-name').parent().removeClass('ui-selected');
        $(this).addClass('ui-selected');
        onClickShowAttrTable();
    });
};

/*****************************************************************************
 *                           To be executed on load
 *****************************************************************************/

$(document).ready(function(){
    initializeJqueryVariables();
    initializeLayersContextMenus();
    readInitialLayers();
    addInitialEventListeners();
    select_list_item();
    exit_edit_mode('#attr-table input');

    $tocLayersList.sortable({
    placeholder: "ui-state-highlight",
    stop: drawLayersInListOrder
    });

});

/*****************************************************************************
 *                           To be executed on load
 *****************************************************************************/

var TETHYS_TOC;

TETHYS_TOC =    {   projectInfo: projectInfo,
                    enter_edit_mode: enter_edit_mode,
                    exit_edit_mode: exit_edit_mode,
                    onClickEditLayer: onClickEditLayer,
                    onClickSaveEdits: onClickSaveEdits,
                    onClickShowAttrTable: onClickShowAttrTable
                }
