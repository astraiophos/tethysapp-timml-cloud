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



/*****************************************************************************
 *                             Variables
 *****************************************************************************/


/*****************************************************************************
 *                              Main Script
 *****************************************************************************/
//  Populates the tables with the user and app workspace saved models
build_user_table = function(){

};

/*****************************************************************************
 *                        To be executed on load
 *****************************************************************************/

$(document).ready(function(){
    //  Only fires if the map is not on the same page, if map is added later for file management or something, need to
    //  change this if statement accordingly so it only fires with the landing page.
    if (typeof TETHYS_MAP_VIEW === 'undefined') {
        //  Build model lists as tables
        build_user_table();
        build_example_table();
    }
});
