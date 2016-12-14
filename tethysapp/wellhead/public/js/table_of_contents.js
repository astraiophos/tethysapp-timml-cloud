/*****************************************************************************
 * FILE:    Main
 * DATE:    2/2/2016
 * AUTHOR:  Shawn Crawley and Jacob Fullerton
 * COPYRIGHT: (c) 2016 Brigham Young University
 * LICENSE: BSD 2-Clause
 * CONTRIBUTIONS:   http://openlayers.org/
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
var onClickRenameLayer;
var initializeLayersContextMenus;
var initializeJqueryVariables;
var addListenersToInitialLayers;
var addInitialEventListeners;

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

    //  Start 'i' counter and count backwards in reverse order to obtain the correct map index for the layer
    i = layers.array_.length - 1;

    //  Read through layers and sift out only the layers that are wanted for the Table of Contents
    for (layer in layers.array_.reverse()){
        if (layers.item(layer).tethys_toc === true || String(layers.item(layer).tethys_toc) === "undefined"){
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
        addContextMenuToListItem($listItem,'GeographicFeatureResource');
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
            extents: layer.getSource().getExtent
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

//        $listItem.find('.hmbrgr-div img').on('click', function (e) {
//            var clickedObj = $(e.currentTarget);
//            var contextmenuId;
//            var menuObj;
//            var newStyle;
//            contextmenuId = $listItem.data('context-menu');
//            menuObj = $('#' + contextmenuId);
//            if (menuObj.attr('style') !== undefined && menuObj.attr('style').indexOf('display: none;') === -1) {
//                window.setTimeout(function () {
//                    newStyle = menuObj.attr('style').replace('inline-block', 'none');
//                    menuObj.attr('style', newStyle);
//                    clickedObj.parent().removeClass('hmbrgr-open');
//                }, 50);
//            }
//        });
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

closeLyrEdtInpt = function ($layerNameSpan, $layerNameInput) {
    $layerNameInput
        .addClass('hidden')
        .off('keyup')
        .off('click');
    $layerNameSpan.removeClass('hidden');
    $(document).off('click.edtLyrNm');
};

projectInfo = {
    'resId': null,
    'map': {
        'baseMap': 'None',
        'showInset': false,
        'layers': {},
        'zoomLevel': 2,
        'center': [0, 0],
        'geoserverUrl': null
    }
};

onClickRenameLayer = function (e) {
    var clickedElement = e.trigger.context;
    var $lyrListItem = $(clickedElement).parent().parent();
    var $layerNameInput = $lyrListItem.find('input[type=text]');
    var $LayerNameSpan = $lyrListItem.find('span');
    // layerIndex = $lyrListItem.data('layer-index');

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

initializeLayersContextMenus = function () {
    layersContextMenuBase = [
//        {
//            name: 'Open in HydroShare',
//            title: 'Open in HydroShare',
//            fun: function (e) {
//                onClickOpenInHS(e);
//            }
//        },
        {
            name: 'Rename',
            title: 'Rename',
            fun: function (e) {
                onClickRenameLayer(e);
            }
        }, {
            name: 'Delete',
            title: 'Delete',
            fun: function (e) {
//                onClickDeleteLayer(e);
                console.log("Deleting the layer sir...")
            }
        }
    ];

//    layersContextMenuViewFile = layersContextMenuBase.slice();
//    layersContextMenuViewFile.unshift({
//        name: 'View file',
//        title: 'View file',
//        fun: function (e) {
//            onClickViewFile(e);
//        }
//    });

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
    layersContextMenuVector.unshift({
        name: 'View attribute table',
        title: 'View attribute table',
        fun: function (e) {
//            onClickShowAttrTable(e);
            console.log("Here's the table!...for now")
        }
    });

//    layersContextMenuTimeSeries = layersContextMenuGeospatialBase.slice();
//    layersContextMenuTimeSeries.unshift({
//        name: 'View time series',
//        title: 'View time series',
//        fun: function (e) {
//            onClickViewFile(e);
//        }
//    });
//
    contextMenuDict = {
//        'GenericResource': layersContextMenuViewFile,
        'GeographicFeatureResource': layersContextMenuVector,
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
 *                           To be executed on load
 *****************************************************************************/

$(document).ready(function(){
    initializeJqueryVariables();
    initializeLayersContextMenus();
    readInitialLayers();
    addInitialEventListeners();

    $tocLayersList.sortable({
    placeholder: "ui-state-highlight",
    stop: drawLayersInListOrder
    });

});

/*****************************************************************************
 *                           To be executed on load
 *****************************************************************************/

var TETHYS_TOC;

TETHYS_TOC = {projectInfo: projectInfo}
