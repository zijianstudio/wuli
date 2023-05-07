#!/usr/bin/env python

# This script was used in conjunction with the Climate Data Store (CDS) API to obtain the temperature data used in the
# Number Line: Integers PhET simulation.  Adjust the dates as needed if and when updated data is required for the
# simulation. To use, make sure that you have Python and the necessary imports available, and then run this from the
# command line. The temperature data needs to then be extracted and formatted using one of the other scripts.

import cdsapi
c = cdsapi.Client()
c.retrieve(
  'reanalysis-era5-single-levels-monthly-means',
  {
    'product_type':'monthly_averaged_reanalysis',
    'variable':'2m_temperature',
    'grid':[2.0,2.0],
    'year':'2018',
    'month':['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'],
    'time':'00:00',
    'format':'netcdf'
  },
  "temperature-data.nc"
)
