/*****************************************************************************
 * FILE:    landing_page.js
 * DATE:    1/30/2017
 * AUTHOR:  Jacob Fullerton
 * COPYRIGHT: (c) 2017 Brigham Young University
 * LICENSE: BSD 2-Clause
 * CONTRIBUTIONS:
 *
 *****************************************************************************/

/*****************************************************************************
 *                              Functions
 *****************************************************************************/

var build_model_tables;
var build_layout;

/*****************************************************************************
 *                              Variables
 *****************************************************************************/

var $innerApp;
var $exampleModels;
var $userModels;

/*****************************************************************************
 *                             Main Script
 *****************************************************************************/
//  Populates the tables with the user and app workspace saved models
build_model_tables = function(){
    var examples;
    var user_models;

    $.ajax({
		type: 'POST',
		url: '/apps/wellhead/workspaceManager/',
		dataType: 'json',
		data: {
            'task':'Read',
			},
			success: function (data){
                console.log(data);
                examples = data.example_files;
                user_models = data.user_files;
			}
    });

    //  Build table with Jquery, then format using DataTable();

};

/*****************************************************************************
 *                            Main Script
 *****************************************************************************/

build_layout = function(){
    $innerApp = $('#inner-app-content');
    $exampleModels = $('#example-models');
    $userModels = $('#user-models');

    config = {
        settings:{
            showPopoutIcon: false,
            showMaximiseIcon: false,
            showCloseIcon: false
        },
        content: [{
            type: 'stack',
            content:[{
                type: 'component',
                componentName: 'User Models',
                componentState: { myId: 'user_models_layout' },
                isClosable: false
            },
            {
                type: 'component',
                componentName: 'Example Models',
                componentState: { myId: 'example_models_layout' },
                isClosable: false
            }]
        }]
    };

    //  To resize the layout to fit
    window_height = $(window).height();
    $innerApp.height(window_height-400);

    myLayout = new GoldenLayout( config,$innerApp );
    myLayout.registerComponent( 'User Models', function( container, componentState ){
        container.getElement().addClass('id');
        container.getElement().attr('id',componentState.myId);
    });
        myLayout.registerComponent( 'Example Models', function( container, componentState ){
        container.getElement().addClass('id');
        container.getElement().attr('id',componentState.myId);
    });
    myLayout.init();

    $userLayoutDiv = $('#user_models_layout');
    $exampleLayoutDiv = $('#example_models_layout');

    $userModels.appendTo($userLayoutDiv);
    $exampleModels.appendTo($exampleLayoutDiv);
};

/*****************************************************************************
 *                             UI Functions
 *****************************************************************************/
initialize_selector = function(){
    //  Make model highlight when clicked on
    $('.model').on('click',function(){
        $('.model').removeClass('ui-selected');
        $(this).addClass('ui-selected').trigger('select_change');
    });
};

/*****************************************************************************
 *                        To be executed on load
 *****************************************************************************/

$(document).ready(function(){
    //  Only fires if the map is not on the same page, if map is added later for file management or something, need to
    //  change this if statement accordingly so it only fires with the landing page.
    if (typeof TETHYS_MAP_VIEW === 'undefined') {
        //  Build model lists as tables
        build_model_tables();
        build_layout();
        initialize_listeners();
        sessionStorage.clear();
    }
});
