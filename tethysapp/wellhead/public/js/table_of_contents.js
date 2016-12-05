/*****************************************************************************
 * FILE:    Main
 * DATE:    2/2/2016
 * AUTHOR:  Shawn Crawley
 * COPYRIGHT: (c) 2015 Brigham Young University
 * LICENSE: BSD 2-Clause
 * CONTRIBUTIONS:   http://openlayers.org/
 *
 *****************************************************************************/

/*****************************************************************************
 *                      Gizmo Function Initializer
 *****************************************************************************/
var createLayerListItem;
var addListenersToListItem;
var editLayerDisplayName;
var closeLyrEdtInpt;
var onClickRenameLayer;
var initializeLayersContextMenus;

/*****************************************************************************
 *                           Main Script
 *****************************************************************************/
//    Give listeners to each item in Table of Contents (Used for debugging, will not likely
var TOCLoop = function()
{
    var TOCList = document.getElementById("toc-layers-list");
    var $myList = $(TOCList).find('li');
    var $myItem;
    for (i=0; i < $myList.length; i++){
        $myItem = $(TOCList).find('li:nth-child(' + (i+1) + ')');
        addListenersToListItem($myItem);
    };
};

createLayerListItem = function (position, layerIndex, layerId, resType, geomType, layerAttributes, visible, layerName, bandInfo, resId, publicFilename, disableChkbx) {
        var $newLayerListItem;
        var chkbxHtml;
        if (disableChkbx === true) {
            chkbxHtml = '<input class="chkbx-layer" type="checkbox" disabled>';
        } else {
            chkbxHtml = '<input class="chkbx-layer" type="checkbox">';
        }
        var listHtmlString =
            '<li class="ui-state-default" ' +
            'data-layer-index="' + layerIndex + '" ' +
            'data-layer-id="' + layerId + '" ' +
            'data-res-id="' + resId + '" ' +
            'data-res-type="' + resType + '" ' +
            'data-geom-type="' + geomType + '" ' +
            'data-public-fname="' + publicFilename + '" ' +
            'data-layer-attributes="' + layerAttributes + '" ' +
            'data-band-variable="' + (bandInfo ? bandInfo.variable : undefined) + '" ' +
            'data-band-units="' + (bandInfo ? bandInfo.units : undefined) + '" ' +
            'data-band-min="' + (bandInfo ? bandInfo.min : undefined) + '" ' +
            'data-band-max="' + (bandInfo ? bandInfo.max : undefined) + '" ' +
            'data-band-nd="' + (bandInfo ? bandInfo.nd : undefined) + '">' +
            chkbxHtml +
            '<span class="layer-name">' + layerName + '</span>' +
            '<input type="text" class="edit-layer-name hidden" value="' + layerName + '">' +
            '<div class="hmbrgr-div"><img src="/static/hydroshare_gis/images/hamburger-menu.svg"></div>' +
            '</li>';

        if (position === 'prepend') {
            $currentLayersList.prepend(listHtmlString);
            $newLayerListItem = $currentLayersList.find('li:first-child');
        } else {
            $currentLayersList.append(listHtmlString);
            $newLayerListItem = $currentLayersList.find(':last-child');
        }

        $newLayerListItem.find('.chkbx-layer').prop('checked', visible);
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
    var nameB4Change = $layerNameSpan.text();
    if (e.which === 13) {  // Enter key
        newDisplayName = $layerNameInput.val();
        if (nameB4Change !== newDisplayName) {
            // Make sure the user does not rename a layer the same name as an existing layer
            if (projectInfo.map.layers[newDisplayName] !== undefined) {
                $('#modalUserMessages-messsage').text('A layer already exists with that name. Please choose a different name');
                $('#modalUserMessages').modal('show');
            } else {
                $layerNameSpan.text(newDisplayName);
//                    projectInfo.map.layers[nameB4Change].displayName = newDisplayName;
//                    projectInfo.map.layers[newDisplayName] = projectInfo.map.layers[nameB4Change];
//                    delete projectInfo.map.layers[nameB4Change];
//                    $btnSaveProject.prop('disabled', false);
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
        {
            name: 'Open in HydroShare',
            title: 'Open in HydroShare',
            fun: function (e) {
                onClickOpenInHS(e);
            }
        }, {
            name: 'Rename',
            title: 'Rename',
            fun: function (e) {
                onClickRenameLayer(e);
            }
        }, {
            name: 'Delete',
            title: 'Delete',
            fun: function (e) {
                onClickDeleteLayer(e);
            }
        }
    ];

    layersContextMenuViewFile = layersContextMenuBase.slice();
    layersContextMenuViewFile.unshift({
        name: 'View file',
        title: 'View file',
        fun: function (e) {
            onClickViewFile(e);
        }
    });

    layersContextMenuGeospatialBase = layersContextMenuBase.slice();
    layersContextMenuGeospatialBase.unshift({
        name: 'Zoom to',
        title: 'Zoom to',
        fun: function (e) {
            onClickZoomToLayer(e);
        }
    });

    layersContextMenuRaster = layersContextMenuGeospatialBase.slice();
    layersContextMenuRaster.unshift({
        name: 'Modify symbology',
        title: 'Modify symbology',
        fun: function (e) {
            onClickModifySymbology(e);
        }
    }, {
        name: 'View legend',
        title: 'View legend',
        fun: function (e) {
            onClickViewLegend(e);
        }
    }, {
        name: 'Get pixel value on click',
        title: 'Get pixel value on click',
        fun: function (e) {
            onClickViewGetPixelVal(e);
        }
    });

    layersContextMenuVector = layersContextMenuRaster.slice();
    layersContextMenuVector.unshift({
        name: 'View attribute table',
        title: 'View attribute table',
        fun: function (e) {
            onClickShowAttrTable(e);
        }
    });

    layersContextMenuTimeSeries = layersContextMenuGeospatialBase.slice();
    layersContextMenuTimeSeries.unshift({
        name: 'View time series',
        title: 'View time series',
        fun: function (e) {
            onClickViewFile(e);
        }
    });

    contextMenuDict = {
        'GenericResource': layersContextMenuViewFile,
        'GeographicFeatureResource': layersContextMenuVector,
        'TimeSeriesResource': layersContextMenuTimeSeries,
        'RefTimeSeriesResource': layersContextMenuTimeSeries,
        'RasterResource': layersContextMenuRaster
    };
};
