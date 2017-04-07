from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
import json
import matplotlib.pyplot as plt
import numpy
from .app import WellheadProtection as wellhead
import os
import uuid
import datetime
from shutil import copyfile


from tethys_sdk.gizmos import *

@login_required()
def home(request):
    select_input2 = SelectInput(display_text='Select2',
                            name='select1',
                            multiple=False,
                            options=[('One', '1'), ('Two', '2'), ('Three', '3')],
                            initial=['Three'],
                            original=True)
    context = {'select_input2':select_input2}
    return render(request, 'wellhead/home.html',context)
def map(request):
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
        # line_color='#663399'
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

    return render(request, 'wellhead/map.html', context)

def timml(request):
    #   Make sure that the module loads properly
    try:
        from timml import *
    except Exception,e:
        print str(e)
        return JsonResponse({"error":str(e),
                             "message":"Check with administrator, timml library is not loading properly"})

    post_data = request.POST

    #   Collect the model information
    model_info = json.loads(post_data['model'])
    constant_info = json.loads(post_data['constant'])
    uflow_info = json.loads(post_data['uflow'])
    wells_info = json.loads(post_data['wells'])
    linesinks_info = json.loads(post_data['line_sink'])
    headlinesinks_info = json.loads(post_data['head_line_sink'])
    reslinesinks_info = json.loads(post_data['res_line_sink'])
    linedoubletimp_info = json.loads(post_data['line_doublet_imp'])
    linesinkditch_info = json.loads(post_data['line_sink_ditch'])
    circareasink_info = json.loads(post_data['circ_area_sink'])
    polygoninhom_info = json.loads(post_data['polygon_inhom'])

    #   Initialize capture_zone variable
    capture_zone=[]

    #   Get map size and calculate cell size
    map_window = json.loads(post_data['map_corners'])
    cell_side = (map_window[2]-map_window[0])/20

    #   Set the solver to default to regular solves (not iterative solutions)
    #   If elements are used that require iterative solutions then solvetype will be modified before ml.solve()
    solvetype = False

    #   Massage data input to be in the right format
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
            if wells_info['well_' + str(index)]['layers']<>"":
                layers_list = [int(i) for i in (wells_info[str("well_" + str(index))]['layers'].split(','))]
            else:
                layers_list = [0]
            Well(ml,
                 xw=wells_info[str("well_" + str(index))]['coordinates'][0],
                 yw=wells_info[str("well_" + str(index))]['coordinates'][1],
                 Qw=float(wells_info[str("well_" + str(index))]['Qw']),
                 rw=float(wells_info[str("well_" + str(index))]['rw']),
                 layers=layers_list,
                 label=wells_info[str("well_" + str(index))]['label'])
        print "Finished wells"

    if 'line_sink_0' in linesinks_info:
        for index in range(0,len(linesinks_info)):
            if linesinks_info['line_sink_' + str(index)]['layers']<>"":
                layers_list = [int(i) for i in (linesinks_info[str("line_sink_" + str(index))]['layers'].split(','))]
            else:
                layers_list = []
            LineSink(ml,
                 x1=linesinks_info[str("line_sink_" + str(index))]['coordinates'][0][0],
                 y1=linesinks_info[str("line_sink_" + str(index))]['coordinates'][0][1],
                 x2=linesinks_info[str("line_sink_" + str(index))]['coordinates'][1][0],
                 y2=linesinks_info[str("line_sink_" + str(index))]['coordinates'][1][1],
                 sigma=float(linesinks_info[str("line_sink_" + str(index))]['sigma']),
                 layers=layers_list,
                 label=linesinks_info[str("line_sink_" + str(index))]['label'])
        print "Finished linesinks"

    if 'head_line_sink_0' in headlinesinks_info:
        for index in range(0,len(headlinesinks_info)):
            if headlinesinks_info['head_line_sink_' + str(index)]['layers']<>"":
                layers_list = [int(i) for i in (headlinesinks_info[str("head_line_sink_" + str(index))]['layers'].split(','))]
            else:
                layers_list = []
            HeadLineSink(ml,
                 x1=headlinesinks_info[str("head_line_sink_" + str(index))]['coordinates'][0][0],
                 y1=headlinesinks_info[str("head_line_sink_" + str(index))]['coordinates'][0][1],
                 x2=headlinesinks_info[str("head_line_sink_" + str(index))]['coordinates'][1][0],
                 y2=headlinesinks_info[str("head_line_sink_" + str(index))]['coordinates'][1][1],
                 head=float(headlinesinks_info[str("head_line_sink_" + str(index))]['head']),
                 layers=layers_list,
                 label=headlinesinks_info[str("head_line_sink_" + str(index))]['label'])
        print "Finished head_linesinks"

    if 'res_line_sink_0' in reslinesinks_info:
        for index in range(0,len(reslinesinks_info)):
            if reslinesinks_info['res_line_sink_' + str(index)]['layers']<>"":
                layers_list = [int(i) for i in (reslinesinks_info[str("res_line_sink_" + str(index))]['layers'].split(','))]
            else:
                layers_list = []
            if reslinesinks_info['res_line_sink_'+str(index)]['bottomelev']<>"":
                elev = reslinesinks_info['res_line_sink_'+str(index)]['bottomelev']
                #   Reslinesinks require iterative solutions when bottomelev is specified, trigger iterative solution
                solvetype=True
            else:
                elev = None
            ResLineSink(ml,
                 x1=reslinesinks_info[str("res_line_sink_" + str(index))]['coordinates'][0][0],
                 y1=reslinesinks_info[str("res_line_sink_" + str(index))]['coordinates'][0][1],
                 x2=reslinesinks_info[str("res_line_sink_" + str(index))]['coordinates'][1][0],
                 y2=reslinesinks_info[str("res_line_sink_" + str(index))]['coordinates'][1][1],
                 head=float(reslinesinks_info[str("res_line_sink_" + str(index))]['head']),
                 res=float(reslinesinks_info[str("res_line_sink_" + str(index))]['res']),
                 width=float(reslinesinks_info[str("res_line_sink_" + str(index))]['width']),
                 layers=layers_list,
                 bottomelev=elev,
                 label=reslinesinks_info[str("res_line_sink_" + str(index))]['label'])
        print "Finished res_linesinks"

    if 'line_doublet_imp_0' in linedoubletimp_info:
        for index in range(0,len(linedoubletimp_info)):
            if linedoubletimp_info['line_doublet_imp_' + str(index)]['layers']<>"":
                layers_list = [int(i) for i in (linedoubletimp_info[str("line_doublet_imp_" +
                                                                        str(index))]['layers'].split(','))]
            else:
                layers_list = []
            LineDoubletImp(ml,
                 x1=linedoubletimp_info[str("line_doublet_imp_" + str(index))]['coordinates'][0][0],
                 y1=linedoubletimp_info[str("line_doublet_imp_" + str(index))]['coordinates'][0][1],
                 x2=linedoubletimp_info[str("line_doublet_imp_" + str(index))]['coordinates'][1][0],
                 y2=linedoubletimp_info[str("line_doublet_imp_" + str(index))]['coordinates'][1][1],
                 order=int(linedoubletimp_info[str("line_doublet_imp_" + str(index))]['order']),
                 layers=layers_list,
                 label=linedoubletimp_info[str("line_doublet_imp_" + str(index))]['label'])
        print "Finished line_doublet_imp's"

    if 'line_sink_ditch_0' in linesinkditch_info:
        for index in range(0,len(linesinkditch_info)):
            if linesinkditch_info['line_sink_ditch_' + str(index)]['layers']<>"":
                layers_list = [int(i) for i in (linesinkditch_info[str("line_sink_ditch_" +
                                                                        str(index))]['layers'].split(','))]
            else:
                layers_list = []
            LineSinkDitch(ml,
                 xylist=linesinkditch_info[str("line_sink_ditch_" + str(index))]['coordinates'],
                 Q=linesinkditch_info[str("line_sink_ditch_" + str(index))]['Q'],
                 res=linesinkditch_info[str("line_sink_ditch_" + str(index))]['res'],
                 width=linesinkditch_info[str("line_sink_ditch_" + str(index))]['width'],
                 layers=layers_list,
                 label=linesinkditch_info[str("line_sink_ditch_" + str(index))]['label'])
        print "Finished linesink_ditches"

    if 'circ_area_sink_0' in circareasink_info:
        for index in range(0,len(circareasink_info)):
            CircAreaSink(ml,
                        xp=float(circareasink_info[str("circ_area_sink_" + str(index))]['coordinates'][0]),
                        yp=float(circareasink_info[str("circ_area_sink_" + str(index))]['coordinates'][1]),
                        Rp=float(circareasink_info[str("circ_area_sink_" + str(index))]['Rp']),
                        infil=float(circareasink_info[str("circ_area_sink_" + str(index))]['infil']),
                        layer=int(circareasink_info[str("circ_area_sink_" + str(index))]['layer']),
                        label=circareasink_info[str("circ_area_sink_" + str(index))]['label']
                        )
        print "Finished CircAreaSink's"

    if 'polygoninhom_0' in polygoninhom_info:
        for index in range(0,len(polygoninhom_info)):
            #   Credit to @SilentGhost on stackoverflow for the following code structure
            k_list = [float(i) for i in ((polygoninhom_info[str("polygoninhom_" + str(index))]['k']).split(','))]
            zb_list = [float(i) for i in ((polygoninhom_info[str("polygoninhom_" + str(index))]['zb']).split(','))]
            zt_list = [float(i) for i in ((polygoninhom_info[str("polygoninhom_" + str(index))]['zt']).split(','))]
            #   Optional Parameters, make empty arrays if not defined by the user
            if polygoninhom_info[str("polygoninhom_" + str(index))]['n'] <> "":
                n_list = [float(i) for i in ((polygoninhom_info[str("polygoninhom_" + str(index))]['n']).split(','))]
            else:
                n_list = []
            if polygoninhom_info[str("polygoninhom_" + str(index))]['c'] <> "":
                c_list = [float(i) for i in ((polygoninhom_info[str("polygoninhom_" + str(index))]['c']).split(','))]
            else:
                c_list = []
            if polygoninhom_info[str("polygoninhom_" + str(index))]['nll'] <> "":
                nll_list = [float(i) for i in ((polygoninhom_info[str("polygoninhom_" + str(index))]['nll']).split(','))]
            else:
                nll_list = []
            PolygonInhom(ml,
                 k=k_list,
                 zb=zb_list,
                 zt=zt_list,
                 c=c_list,
                 xylist=polygoninhom_info[str("polygoninhom_" + str(index))]['coordinates'][0],
                 n=n_list,
                 nll=nll_list,
                         )
            MakeInhomPolySide(ml,
                 xylist=polygoninhom_info[str("polygoninhom_" + str(index))]['coordinates'][0],
                 order=int(polygoninhom_info[str("polygoninhom_" + str(index))]['order']),
                             )
        print "Finished polygon_inhom's"

    #   Do iterations in the event that elements are used that require it (used as a 'catch-all')
    ml.solve(doIterations=solvetype)

    print "solved!!!"

    contourList = timcontour(ml, map_window[0], map_window[2], 100, map_window[1],
                             map_window[3], 100, levels = 10,
                             newfig = False, returncontours = True)

    #   This next part uses modified equations from TimML to retrieve capturezone tracelines
    if 'well_0' in wells_info:
        tracelines = []
        for index in range(0,len(wells_info)):
            if wells_info['well_' + str(index)]['Num Particles']<>"":
                well = ml.elementDict[wells_info['well_' + str(index)]['label']]
                tracelines.append(j_capturezone(ml,
                                           w=well,
                                           N=int(wells_info['well_' + str(index)]['Num Particles']),
                                           z=float(wells_info['well_' + str(index)]['zStart']),
                                           tmax=float(wells_info['well_' + str(index)]['Time']),
                                           window = map_window,
                                           xsec=False)
                                  )

    if 'tracelines' in locals():
        capture_info = capture_builder(tracelines)
        for well in range(0,len(capture_info)):
            for path in range(0,len(capture_info['well_'+str(well)])):
                for seg in range(1,len(capture_info['well_'+str(well)]['path_'+str(path)])+1):
                    try:
                        capture_zone.append({
                            'type':'Feature',
                            'geometry':{
                                'type':'LineString',
                                'coordinates':capture_info['well_'+str(well)]['path_'+str(path)]['segment_'+str(seg)]['coordinates']
                            },
                            'properties':{
                                'layer':capture_info['well_'+str(well)]['path_'+str(path)]['segment_'+str(seg)]['layer'],
                                'elem_ID':str("well_"+str(well)),
                                'elem_label':wells_info['well_'+str(well)]['label'],
                                'total_time':capture_info['well_'+str(well)]['path_'+str(path)]['segment_'+str(seg)]['total_time'],
                                'end_state':capture_info['well_'+str(well)]['path_'+str(path)]['segment_'+str(seg)]['end_state'],
                                'end_element':capture_info['well_'+str(well)]['path_'+str(path)]['segment_'+str(seg)]['end_element']
                            }
                        })
                    except Exception,e:
                        print str(e)

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

    # Retrieves the contour traces and stores them in contourPaths[]
    i = 0
    try:
        while (i < 10):
            print i
            contourPaths.append(contourList.collections[i].get_paths())
            i += 1
    except:
        pass

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
        "contours": json.dumps(Contours),
        "heads": json.dumps(intervals),
        "capture": capture_zone,
    })

#   Custom Utility Functions
#   Credits to Mark Bakker (code borrowed from TimML repository for returning the plotting coordinates)

def j_capturezone( ml, w, N, z, tmax, window, xsec=False):
    xstart = w.xw + 1.01*w.rw * numpy.cos( numpy.arange(0.01,2*numpy.pi,2*numpy.pi/N) )
    ystart = w.yw + 1.01*w.rw * numpy.sin( numpy.arange(0.01,2*numpy.pi,2*numpy.pi/N) )
    zstart = z * numpy.ones(len(xstart))
    ax = plt.gcf().axes[0]
    x1,x2,y1,y2 = ax.axis()
    step = (x2 - x1) / 100.0
    traces = j_timtracelines(ml,xstart,ystart,zstart,-step,window=window,tmax=tmax,xsec=xsec)
    return traces


def j_timtracelines(ml,xlist,ylist,zlist,step,twoD=1,tmax=1e30,Nmax=200,labfrac=2.0,
                    Hfrac=5.0,window=[-1e30,-1e30,1e30,1e30],overlay=1,color=None,
                    width=0.5,style='-',xsec=0,layout=True, verbose = True):
    '''Routine for plotting multiple tracelines using pylab'''
    from timml.mltrace import *
    # Set colors
    if type( color ) is str:
        color = ml.aq.Naquifers * [color]
    elif type( color ) is list:
        Ncolor = len(color)
        if Ncolor < ml.aq.Naquifers:
            color = color + ml.aq.Naquifers * [ color[0] ]
    elif color is None:
        color = ['b','r','g','m','c']
        if ml.aq.Naquifers > 5:
            color = int(ceil(ml.aq.Naquifers/5.)) * color
    # Set figure
    if not overlay:
        fig = plt.figure()
        ax1 = plt.subplot(111)
    if overlay:
        fig = plt.gcf()
        ax1 = fig.axes[0]
        if xsec:
            ax2 = fig.axes[1]
    xmin,xmax = ax1.get_xlim()
    ymin,ymax = ax1.get_ylim()
    trace = []
    for i in range(len(xlist)):
        x = xlist[i]; y = ylist[i]; z = zlist[i]
        [xyz,t,stop,pylayers] = traceline(ml,x,y,z,step,tmax,Nmax,labfrac=labfrac,Hfrac=Hfrac,window=window,verbose=verbose)
        trace.append([xyz,t,stop,pylayers])
        pylayers = numpy.array(pylayers)
        if xsec:
            ax2.plot(xyz[:,0],xyz[:,2],color=[.7,.7,.7])
        for j in range(pylayers.min(),pylayers.max()+1):
            ax1.plot( numpy.where(pylayers==j,xyz[:,0],numpy.nan), numpy.where(pylayers==j,xyz[:,1],numpy.nan), color[j])
            if xsec:
                ax2.plot( numpy.where(pylayers==j,xyz[:,0],numpy.nan), numpy.where(pylayers==j,xyz[:,2],numpy.nan), color[j])
    ax1.set_xlim(xmin,xmax)
    ax1.set_ylim(ymin,ymax)
    if xsec:
        ax2.set_ylim(ml.aq.zb[-1],ml.aq.zt[0])
        ax2.set_xlim(xmin,xmax)
    plt.draw()
    return trace


def capture_builder(tracelines):
    capture_info = {}
    for index in range(0,len(tracelines)):
        capture_info['well_' + str(index)] = {}
        for particle in range(0,len(tracelines[index])):
            seg = 1
            capture_info['well_' + str(index)]['path_'+str(particle)]={}
            capture_info['well_' + str(index)]['path_'+str(particle)]['segment_'+str(seg)]={}
            capture_info['well_' + str(index)]['path_'+str(particle)]['segment_'+str(seg)]['coordinates']=[]
            capture_info['well_' + str(index)]['path_'+str(particle)]['segment_'+str(seg)]['layer'] = tracelines[index][particle][3][0]
            capture_info['well_' + str(index)]['path_'+str(particle)]['segment_'+str(seg)]['end_state'] = tracelines[index][particle][2][0]
            capture_info['well_' + str(index)]['path_'+str(particle)]['segment_'+str(seg)]['end_element'] = tracelines[index][particle][2][1]
            capture_info['well_' + str(index)]['path_'+str(particle)]['segment_'+str(seg)]['total_time'] = tracelines[index][particle][1][-1]
            for i in range(0,len(tracelines[index][particle][0])):
                check=tracelines[index][particle][3][i]
                if check <> capture_info['well_' + str(index)]['path_'+str(particle)]['segment_'+str(seg)]['layer']:
                    seg+=1
                    capture_info['well_' + str(index)]['path_'+str(particle)]['segment_'+str(seg)]={}
                    capture_info['well_' + str(index)]['path_'+str(particle)]['segment_'+str(seg)]['coordinates']=[]
                    capture_info['well_' + str(index)]['path_'+str(particle)]['segment_'+str(seg)]['layer'] = check

                capture_info['well_' + str(index)]['path_' + str(particle)]['segment_'+str(seg)]['coordinates'].append([
                    tracelines[index][particle][0][i][0],   # X-Coordinate
                    tracelines[index][particle][0][i][1]    # Y-Coordinate
                ])
    return capture_info

def saveAs(request):
    #   Generates a unique id for the file
    unique_id = uuid.uuid4().hex[:6]

    post_data = request.POST

    file_name = post_data['file_name']
    new_file_name = unique_id + '_' + file_name + '.txt'
    session = post_data['session']

    user_workspace = wellhead.get_user_workspace(request.user)
    new_file_path = os.path.join(user_workspace.path,unique_id + '_' + file_name + '.txt')

    with open(new_file_path, 'w') as a_file:
        a_file.write(session)

    return JsonResponse({
        "success":"Save Successfull!",
        'file_name':new_file_name,
    })

def save(request):
    post_data = request.POST

    file_name = post_data['file_name']
    session = post_data['session']

    user_workspace = wellhead.get_user_workspace(request.user)
    new_file_path = os.path.join(user_workspace.path,file_name)

    with open(new_file_path, 'w') as a_file:
        a_file.write(str(session))

    return JsonResponse({
        "success":"Save Successfull!",
    })

def openModel(request):
    post_data = request.POST

    file_name = post_data['file_name']

    user_workspace = wellhead.get_user_workspace(request.user)
    new_file_path = os.path.join(user_workspace.path,file_name)

    with open(new_file_path, 'r') as a_file:
        session = a_file.read()

    return JsonResponse({
        'success':'Load Successfull!',
        'session':session,
    })

def open_example_model(request):
    post_data = request.POST

    file_name = post_data['file_name']

    app_workspace = wellhead.get_app_workspace()
    new_file_path = os.path.join(app_workspace.path,file_name)

    with open(new_file_path, 'r') as a_file:
        session = a_file.read()

    return JsonResponse({
        'success':'Load Successfull!',
        'session':session,
    })

def workspace_manager(request):
    post_data = request.POST

    task = post_data['task']
    user_workspace = wellhead.get_user_workspace(request.user)
    app_workspace = wellhead.get_app_workspace()

    if task == 'Read':
        user_files = {}
        example_files = {}

        files = os.listdir(user_workspace.path)
        for file in files:
            mypath = os.path.join(user_workspace.path,file)
            file_time = os.path.getmtime(mypath)
            file_time = datetime.datetime.fromtimestamp(file_time)
            user_files[file] = {'date':file_time.strftime("%B %d, %Y"),'description':'To be filled later'}

        files = os.listdir(app_workspace.path)
        for file in files:
            mypath = os.path.join(app_workspace.path,file)
            file_time = os.path.getmtime(mypath)
            file_time = datetime.datetime.fromtimestamp(file_time)
            example_files[file] = {'date':file_time.strftime("%B %d, %Y"),'description':'To be filled later'}

        return JsonResponse({
            'user_files':user_files,
            'example_files':example_files
        })
    elif task == 'Delete':
        file_name = post_data['file_name']
        delete_file_path = os.path.join(user_workspace.path,file_name)
        try:
            os.remove(delete_file_path)
        except Exception,e:
            print str(e)
            return JsonResponse({"error":str(e),
                             "message":"Check with administrator, the file cannot be deleted"})
        return JsonResponse({"success":"Deletion Successful!"})
    elif task == 'Copy':
        file_name = post_data['file_name']
        src_file_path = os.path.join(user_workspace.path,file_name)

        unique_id = uuid.uuid4().hex[:6]
        model = post_data['model']
        dst_file_name = unique_id + '_' + model
        dst_file_path = os.path.join(user_workspace.path,dst_file_name)

        try:
            copyfile(src_file_path,dst_file_path)
        except Exception,e:
            print str(e)
            return JsonResponse({"error":str(e),
                                 "message":"Check with administrator, the file cannot be copied"})
        return JsonResponse({"success":"Copy Successful!"})

    else:
        return JsonResponse({"error":"Bad Request"})
