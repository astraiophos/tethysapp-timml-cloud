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
                            editable_columns=(False, 'ageInput', 'jobInput'),
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

    #   Massage input to be in the right format
    print "Building model"

    #   Credit to @SilentGhost on stackoverflow for the following code
    k_list = [float(i) for i in ((model_info['k']).split(','))]
    zb_list = [float(i) for i in ((model_info['zb']).split(','))]
    zt_list = [float(i) for i in ((model_info['zt']).split(','))]

    ml = Model(k=k_list,zb=zb_list,zt=zt_list)

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
                 Qw=float(wells_info[str("well_" + str(index))]['Qw'][0]),
                 rw=float(wells_info[str("well_" + str(index))]['rw']),
                 layers=layers_list,label=wells_info[str("well_" + str(index))]['label'])
        print "Finished wells"

    ml.solve()

    print "solved!!!"

    return JsonResponse({
        "sucess": "Data analysis complete!",
        "raster": "Raster data goes here",
        "contours": "Contour data goes here",
        "particle": "Particle tracking goes here",
    })
