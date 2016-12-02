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

//    Give listeners to each item in Table of Contents
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

    var addListenersToListItem = function ($listItem) {/*, layerIndex) {*/
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
        var closeLyrEdtInpt = function ($layerNameSpan, $layerNameInput) {
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
