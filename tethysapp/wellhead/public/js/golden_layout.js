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
var $domDiv;

/*****************************************************************************
 *                            Main Script
 *****************************************************************************/

$(document).ready(function(){
    config = {
        settings:{hasHeaders:false},
        content: [{
            type: 'row',
            content:[{
                type: 'component',
                componentName: 'testComponent',
                componentState: { label: 'A' },
                id: 'window1'
            },
            {
            type: 'column',
            content:[{
                type: 'component',
                componentName: 'testComponent',
                componentState: { label: 'B' },
                id: 'window2'
                },
                {
                type: 'component',
                componentName: 'testComponent',
                componentState: { label: 'C' },
                id: 'window3'
                }]
            }]
        }],
        id:'myWindow'
    };

    $domDiv = $('#inner-app-content')
    myLayout = new GoldenLayout( config,$domDiv );
    myLayout.registerComponent( 'testComponent', function( container, componentState ){
        container.getElement().html( '<h2>' + componentState.label + '</h2>' );
    });
    myLayout.init();
})
