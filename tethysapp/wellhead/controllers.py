from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
import json
import numpy

from tethys_sdk.gizmos import *

@login_required()
def home(request):
    """
    Controller for the app home page.
    """
    # Define view options
    view_options = MVView(
        projection='EPSG:4326',
        center=[-111.64925, 40.24721],
        zoom=16.5,
        maxZoom=22,
        minZoom=2
    )

    # Define drawing options
    drawing_options = MVDraw(
        controls=['Delete', 'Move', 'Point', 'Box','Polygon','LineString', 'Modify'],
        initial='Point',
        output_format='WKT',
        line_color='#663399'
    )

    # Define map view options
    map_view_options = MapView(
            height='600px',
            width='100%',
            controls=['ZoomSlider', 'Rotate', 'FullScreen',
                      {'MousePosition': {'projection': 'EPSG:4326'}},
                      {'ZoomToExtent': {'projection': 'EPSG:4326', 'extent': [-130, 22, -65, 54]}}],
            layers=[],
            view=view_options,
            basemap={'Bing': {'key': 'AnOW7YhvlSoT5teH6u7HmKhs2BJWeh5QNzp5CBU-4su1K1XI98TGIONClI22jpbk',
                              'imagerySet': 'AerialWithLabels'}},
            draw=drawing_options
    )

    #   Initialize the Bootstraps table
    table_view_edit = TableView(column_names=('Name', 'Age', 'Job'),
                            rows=[('Bill', 30, 'contractor'),
                                  ('Fred', 18, 'programmer'),
                                  ('Bob', 26, 'boss')],
                            hover=True,
                            striped=True,
                            bordered=False,
                            condensed=False,
                            editable_columns=(False, 'ageInumpyut', 'jobInumpyut'),
                            row_ids=[21, 25, 31],
                            attributes={'id':'attr-table'})

    context = {'map_view_options': map_view_options,
               'table_view_edit': table_view_edit}

    return render(request, 'wellhead/home.html', context)

def timml(request):
    #   Make sure that the module loads properly
    try:
        from timml import *
    except Exception,e:
        print str(e)
        return JsonResponse({"error":str(e),
                             "message":"Check with administrator, timml library is not loading properly"})

    get_data = request.GET

    #   Collect the model information
    model_info = json.loads(get_data['model'])
    constant_info = json.loads(get_data['constant'])
    uflow_info = json.loads(get_data['uflow'])
    wells_info = json.loads(get_data['wells'])

    #   Get map size and calculate cell size
    map_window = json.loads(get_data['map_corners'])
    cell_side = (map_window[2]-map_window[0])/20

    #   Massage data inumpyut to be in the right format
    print "Building model"

    #   Credit to @SilentGhost on stackoverflow for the following code structure
    k_list = [float(i) for i in ((model_info['k']).split(','))]
    zb_list = [float(i) for i in ((model_info['zb']).split(','))]
    zt_list = [float(i) for i in ((model_info['zt']).split(','))]
    #   Optional Parameters, make empty arrays if not defined by the user
    if model_info['n'] <> "":
        n_list = [float(i) for i in ((model_info['n']).split(','))]
    else:
        n_list = []
    if model_info['c'] <> "":
        c_list = [float(i) for i in ((model_info['c']).split(','))]
    else:
        c_list = []
    if model_info['nll'] <> "":
        nll_list = [float(i) for i in ((model_info['nll']).split(','))]
    else:
        nll_list = []

    ml = Model(k=k_list,zb=zb_list,zt=zt_list,n=n_list,c=c_list,nll=nll_list)

    print "Build constant"
    rf = Constant(ml,xr=constant_info["coordinates"][0],yr=constant_info["coordinates"][1],
                  head=float(constant_info["head"]))

    if 'uflow grad' in uflow_info:
        uf = Uflow(ml,grad=float(uflow_info["uflow grad"]),angle=float(uflow_info["uflow angle"]))
        print "Finished uflow"

    if 'well_0' in wells_info:
        for index in range(0,len(wells_info)):
            layers_list = [int(i) for i in (wells_info[str("well_" + str(index))]['layers'].split(','))]
            Well(ml,
                 xw=wells_info[str("well_" + str(index))]['coordinates'][0],
                 yw=wells_info[str("well_" + str(index))]['coordinates'][1],
                 Qw=float(wells_info[str("well_" + str(index))]['Qw']),
                 rw=float(wells_info[str("well_" + str(index))]['rw']),
                 layers=layers_list,label=wells_info[str("well_" + str(index))]['label'])
        print "Finished wells"

    #   Do iterations in the event that elements are used that require it (used as a 'catch-all')
    ml.solve(doIterations=True)

    print "solved!!!"

    contourList = timcontour(ml, map_window[0], map_window[2], numpy.absolute((map_window[0]-map_window[2])/cell_side), map_window[1],
                             map_window[3], numpy.absolute((map_window[1]-map_window[3])/cell_side), levels = 10,
                             newfig = True, returncontours = True)

    # Return the contour paths and store them as a list
    contourPaths = []

    # This retrieves the heads of each contour traced by TimML and stores them in intervals[]
    intervals = []
    i = 0

    retrieveIntervals = contourList.levels
    try:
        while(i<10):
            intervals.append(retrieveIntervals[i])
            i += 1
    except:
        pass

    # print intervals

    # Retrieves the contour traces and stores them in contourPaths[]
    i = 0
    try:
        while (i < 10):
            print i
            contourPaths.append(contourList.collections[i].get_paths())
            i += 1
    except:
        pass

    # print contourPaths


    # This section constructs the featurecollection polygons defining the water table elevations
    # Cells are defined at the corners, water table elevation is defined at the center of the cell

    waterTable = []

    for long in numpy.arange(map_window[0]-cell_side, map_window[2]+cell_side, cell_side):
        for lat in numpy.arange(map_window[1]-cell_side, map_window[3]+cell_side, cell_side):
            waterTable.append({
                'type': 'Feature',
                'geometry': {
                    'type': 'Polygon',
                    'coordinates': [
                                    [   [long,lat],
                                        [long + cell_side, lat],
                                        [long + cell_side, lat + cell_side],
                                        [long, lat + cell_side],
                                        [long,lat]
                                    ]
                                   ]
                    },
                    'properties': {
                        'elevation' : ml.head(0,(long+cell_side/2),(lat+cell_side/2)),
                    }
            })

    # print waterTable
    # This collects the contour lines and creates JSON objects for the response to AJAX request (to be drawn in js)

    Contours = []
    i = 0

    for path in contourList.collections:
        for segment in path.get_segments():
            trace = []
            for piece in segment:
                trace.append(piece.tolist())

            if (i<len(intervals)):
                Contours.append({
                    'type': 'Feature',
                    'geometry': {
                        'type': 'LineString',
                        'coordinates': trace
                    },
                    'properties':{
                        'elevation' : intervals[i],
                    }
                })
        i += 1

    # print "Showing the Contour Objects"
    # print Contours

    return JsonResponse({
        "sucess": "Data analysis complete!",
        "raster": json.dumps(waterTable),
        "contours": json.dumps(Contours),
        "heads": json.dumps(intervals),
        "capture": "Capture Zone goes here",
        "wells": json.dumps(wells_info),
    })
