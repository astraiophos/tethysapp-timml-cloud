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
        )

        return url_maps