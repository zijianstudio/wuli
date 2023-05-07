import cdstoolbox as ct

# This script was used in the Climate Data Store (CDS) Toolbox to produce the maps needed by the Number Line: Integers
# PhET simulation.  It was run once for each month, and the 'month' field was manually updated each time.  To use,
# go to the CDS Toolbox (at https://cds.climate.copernicus.eu/toolbox-editor/18912/their-example-with-grid-usage-fewer-years
# as of this writing), create a new script, paste this in, modify the date as needed and run it.  The map should appear
# on the right.

layout = {
    'output_align': 'bottom'
}

@ct.application(title='Plot Map for NLI Sim', layout=layout)
@ct.output.figure()
def plot_map():

    data = ct.catalogue.retrieve(
        'reanalysis-era5-single-levels-monthly-means',
        {
            'product_type': 'monthly_averaged_reanalysis',
            'variable': '2m_temperature',
            'year': '2018',
            'month': '01',
            'time': '00:00',
        }
    )

    title = 'Near-surface air temperature'
    fig = ct.cdsplot.geomap(
        data, title=title, pcolormesh_kwargs={ 'vmin':-60, 'vmax':50, 'cmap':'RdYlBu_r' } 
    )
    
    return fig
