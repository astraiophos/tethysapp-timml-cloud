
    var createLayerListItem = function (position, layerIndex, layerId, resType, geomType, layerAttributes, visible, layerName, bandInfo, resId, publicFilename, disableChkbx) {
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

    var editLayerDisplayName = function (e, $layerNameInput, $layerNameSpan) {
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
                    projectInfo.map.layers[nameB4Change].displayName = newDisplayName;
                    projectInfo.map.layers[newDisplayName] = projectInfo.map.layers[nameB4Change];
                    delete projectInfo.map.layers[nameB4Change];
                    $btnSaveProject.prop('disabled', false);
                    closeLyrEdtInpt($layerNameSpan, $layerNameInput);
                }
            } else {
                closeLyrEdtInpt($layerNameSpan, $layerNameInput);
            }
        } else if (e.which === 27) {  // Esc key
            closeLyrEdtInpt($layerNameSpan, $layerNameInput);
        }
    };
    var closeLyrEdtInpt = function ($layerNameSpan, $layerNameInput) {
        $layerNameInput
            .addClass('hidden')
            .off('keyup')
            .off('click');
        $layerNameSpan.removeClass('hidden');
        $(document).off('click.edtLyrNm');
    };

    var addListenersToListItem = function ($listItem) {/*, layerIndex) {*/
        var $layerNameInput;
        $listItem.find('.layer-name').on('dblclick', function () {
            var $layerNameSpan = $(this);
            $layerNameSpan.addClass('hidden');
            $layerNameInput = $listItem.find('input[type=text]');
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

    var addLayerToUI = function () {
        var geomType;
        var hide255 = false;
        var cssStyles;
        var layerAttributes;
        var layerExtents;
        var displayName;
        var layerId;
        var layerIndex;
        var resType;
        var bandInfo;
        var rawLayerExtents;
        var resId;
        var siteInfo;
        var $newLayerListItem;

        resId = "79283bfd563f48fca8ab44869ef48f93";
        resType = "GeographicFeatureResource";
        if (resType === 'GeographicFeatureResource') {
            geomType = getGeomType(results.geom_type);
            layerAttributes = results.layer_attributes;
        } else {
            geomType = "None";
            layerAttributes = "None";
        }
        if (resType === 'RasterResource' && results.band_info) {
            bandInfo = results.band_info;
            if (typeof bandInfo === "string") {
                try {
                    bandInfo = JSON.parse(bandInfo);
                } catch (e) {
                    console.error(e);
                    bandInfo = "None";
                }
            }
        } else {
            bandInfo = "None";
        }

        layerId = "test" || resID;
//        rawLayerExtents = results.layer_extents;

//        if (resType.indexOf('TimeSeriesResource') > -1) {
//            siteInfo = results.site_info;
//            if (typeof siteInfo === 'string') {
//                try {
//                    siteInfo = JSON.parse(siteInfo);
//                } catch (_) {
//                    var message = 'The spatial metadata was in an unrecognizable format and so the location of the data is not shown on the map.';
//                    addLogEntry('warning', message);
//                }
//            }
//            if (typeof siteInfo === 'object') {
//                layerExtents = ol.proj.fromLonLat([siteInfo.lon, siteInfo.lat]);
//            }
//        } else {
//            layerExtents = reprojectExtents(rawLayerExtents);
//        }
//
//        if (bandInfo === 'None') {
//            cssStyles = 'Default';
//        } else {
//            if (bandInfo.min && bandInfo.nd && bandInfo.nd > bandInfo.min) {
//                if (bandInfo.nd < 0) {
//                    bandInfo.min = 0;
//                }
//            }
//
//            cssStyles = {'color-map': {}};
//            cssStyles.method = 'ramp';
//
//            if (bandInfo.nd || bandInfo.nd === 0) {
//                cssStyles['color-map'][bandInfo.nd] = {
//                    color: '#000000',
//                    opacity: 0
//                };
//            }
//
//            if (bandInfo.min === 'Unknown') {
//                bandInfo.min = 0;
//            }
//
//            cssStyles['color-map'][bandInfo.min] = {
//                color: '#000000',
//                opacity: 1
//            };
//
//            if (bandInfo.max === 'Unknown') {
//                bandInfo.max = 10000;
//            }
//
//            cssStyles['color-map'][bandInfo.max] = {
//                color: '#ffffff',
//                opacity: 1
//            };
//
//            if (bandInfo.min > 255 || bandInfo.max < 255) {
//                hide255 = true;
//            }
//        }
//
//        addLayerToMap({
//            cssStyles: cssStyles,
//            geomType: geomType,
//            resType: resType,
//            lyrExtents: layerExtents,
//            url: projectInfo.map.geoserverUrl + '/wms',
//            lyrId: layerId,
//            hide255: hide255,
//            publicFname: results.public_fname
//        });

        layerIndex = layerCount.get();

        displayName = "myAnimas Watershed";
        // Check if a layer with the same name exists. If so, tack on a modifier
        var modifier = 1;
        while (projectInfo.map.layers[displayName] !== undefined) {
            displayName = displayName + ' (' + modifier + ')';
            modifier += 1;
        }

        // Add layer data to project info
//        projectInfo.map.layers[displayName] = {
//            displayName: displayName,
//            hsResId: resId,
//            resType: resType,
//            attributes: layerAttributes,
//            cssStyles: cssStyles,
//            extents: layerExtents,
//            siteInfo: siteInfo,
//            geomType: geomType,
//            bandInfo: bandInfo,
//            id: layerId,
//            index: layerIndex,
//            visible: true,
//            hide255: hide255,
//            listOrder: 1
//        };

        createLayerListItem('prepend', layerIndex, layerId, resType, geomType, layerAttributes, true, displayName, bandInfo, resId);
        $newLayerListItem = $currentLayersList.find('li:first-child');
        addListenersToListItem($newLayerListItem, layerIndex);
        addContextMenuToListItem($newLayerListItem, resType);

        drawLayersInListOrder(); // Must be called after creating the new layer list item
//        zoomToLayer(layerExtents, map.getSize(), resType);

        if (isLastResource) {
            setStateAfterLastResource();
        }
    };

    var layerCount = (function () {
        // The count = 2 (0-based) accounts for the 3 base maps added before this count is initialized
        var count = 4;
        return {
            'get': function () {
                return count;
            },
            'increase': function () {
                count += 1;
            },
            'decrease': function () {
                count -= 1;
            }
        };
    }());

    var createLayerListItem = function (position, layerIndex, layerId, resType, geomType, layerAttributes, visible, layerName, bandInfo, resId, publicFilename, disableChkbx) {
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
