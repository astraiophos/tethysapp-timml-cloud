from tethys_sdk.base import TethysAppBase, url_map_maker


class WellheadProtection(TethysAppBase):
    """
    Tethys app class for Wellhead Protection.
    """

    name = 'Wellhead Protection'
    index = 'wellhead:home'
    icon = 'wellhead/images/icon.gif'
    package = 'wellhead'
    root_url = 'wellhead'
    color = '#34495e'
    description = "Generic groundwater modeling implementing Mark Bakker's TimML software package. Users can delineate wellhead protection zones using this software to identify potential risks to municipal wells."
    tags = '"Hydrology","Environmental","Groundwater"'
    enable_feedback = False
    feedback_emails = []

        
    def url_maps(self):
        """
        Add controllers
        """
        UrlMap = url_map_maker(self.root_url)

        url_maps = (UrlMap(name='home',
                           url='wellhead',
                           controller='wellhead.controllers.home'),
                    UrlMap(name='map',
                           url='wellhead/map',
                           controller='wellhead.controllers.map'),
                    UrlMap(name='timml',
                           url='wellhead/timml',
                           controller='wellhead.controllers.timml'),
                    UrlMap(name='saveAs',
                           url='wellhead/saveAs',
                           controller='wellhead.controllers.saveAs'),
                    UrlMap(name='save',
                           url='wellhead/save',
                           controller='wellhead.controllers.save'),
                    UrlMap(name='openModel',
                           url='wellhead/openModel',
                           controller='wellhead.controllers.openModel')
        )

        return url_maps
