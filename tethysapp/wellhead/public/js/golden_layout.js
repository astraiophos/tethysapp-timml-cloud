/*****************************************************************************
 * FILE:    golden_layout.js
 * DATE:    12/16/2016
 * AUTHOR:  Jacob Fullerton
 * COPYRIGHT: (c) 2016 Brigham Young University
 * LICENSE: BSD 2-Clause
 * CONTRIBUTIONS:   http://golden-layout.com/
 *
 *****************************************************************************/

/*****************************************************************************
 *                              Functions
 *****************************************************************************/



/*****************************************************************************
 *                             Variables
 *****************************************************************************/

var config;
var myLayout
var $innerApp;
var $mapContainer;
var $tableContainer;
var $mapWrapper;
var window_height;
var $mapLayoutDiv;
var $tableLayoutDiv;

/*****************************************************************************
 *                            Main Script
 *****************************************************************************/

$(document).ready(function(){
    if (typeof TETHYS_MAP_VIEW !== 'undefined') {
    //    initializeJqueryVars;
        $innerApp = $('#inner-app-content');
        $mapContainer = $('#map_view_outer_container');
        $tableContainer = $('#attr-table');
        $mapWrapper = $('#map_wrapper');

        config = {
            settings:{hasHeaders:false},
            content: [{
                type: 'column',
                content:[{
                    type: 'component',
                    componentName: 'Map',
                    componentState: { myId: 'map_view_layout' },
                id: 'map'
                },

                {
                type: 'column',
                content:[{
                    type: 'component',
                    componentName: 'Table',
                    componentState: { myId: 'attribute_table_layout' }
                    }],
                id: 'table',
                height:10
                }]
            }]
        };

        //  To resize the layout to fit
        window_height = $(window).height();
        $innerApp.height(window_height-220);

        myLayout = new GoldenLayout( config,$innerApp );
        myLayout.registerComponent( 'Map', function( container, componentState ){
            container.getElement().addClass('id');
            container.getElement().attr('id',componentState.myId);
        });
            myLayout.registerComponent( 'Table', function( container, componentState ){
            container.getElement().addClass('id');
            container.getElement().attr('id',componentState.myId);
        });
        myLayout.init();

        $mapLayoutDiv = $('#map_view_layout');
        $tableLayoutDiv = $('#attribute_table_layout');

        $mapContainer.appendTo($mapLayoutDiv);
        $tableContainer.appendTo($tableLayoutDiv);
        //  Resize map div to be 100% so that map always fills the space inside layout container
        $mapWrapper.height('100%');
    }
})
