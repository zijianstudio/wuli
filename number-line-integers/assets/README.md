This file describes the processes that were used to produce some of the more unusual assets used in this sim.

Maps and Temperature Data for the "Temperature" scene of the "Scenes" screen.
=============================================================================

Overview
--------

The "Temperature" scene has a set of world maps that graphically depict the temperature at various places around the
world, and the user can measure the temperature at multiple locations and see those values on a number.  The process of
creating the maps and the underlying data was pretty involved, and the steps through which it was done are described
below.

The website where the maps and temperature data was obtains is called the "Climate Data Store" at
https://cds.climate.copernicus.eu/cdsapp#!/home.  I (jbphet) and @amanda-phet learned just enough about how to use this
to get what we needed.  There is a lot to it, and there may be better and quicker ways to get the information needed,
but this got the job done.

Steps to Get Set Up
-------------------

+ Set up Python and pip on your machine if you don't already have them
+ Install the Climate Data Store API for Python.  At the time of this writing, directions on how to install this
were found at https://cds.climate.copernicus.eu/api-how-to. You may need to set up an account on CDS if you don't
already have one.
+ Install the NetCDF software utilities from UniData for manipulating NetCDF (.cd) files.  I (jbphet) installed the
netCDF4 v4.7.0 without DAP (whatever that is) from https://www.unidata.ucar.edu/software/netcdf/docs/winbin.html. 
+ If you don't already have one, set up an account on the CDS site at https://cds.climate.copernicus.eu/cdsapp#!/home

Steps to Create the Map Images
------------------------------

+ Create and download the maps using the CDSToolbox and the Python code.  The script for retrieving a  map for a single
 month is in the `assets/scripts` directory and is named `get-nli-map.py`.    The CDS Toolbox interface allows a The script needs to be run once for each month.
+ Download each image, crop it, make the portions outside the map transparent (Photoshop was used to do this for the
original images)

Steps to Get the Temperature Data
---------------------------------

+ Download data that matches the map by using the Python script `get-nli-temperature-data`
+ Run the command `ncdump -v longitude,latitude,t2m temperature-data.nc > extracted-data.txt` to obtain the data set we
need from the downloaded NetCDF file
+ Verify that the `latitude` and `longitude` arrays in the extracted data file match that in `temperatureDataSet.js`.
They should, but if they don't, you'll need to figure out why and straighten everything out. 
+ Unfortunately, the temperature data (in the t2m array for "temperature at two meters from the surface') is in "packed"
format, which is apparently done to reduce the file size.  This has be be unpacked, and the Unidata command line tools
don't support this, so the process is a bit of a pain in the butt.  First, you need to look at the header of the
downloaded data file by executing the command `ncdump -h temperature-data.nc`.  The output of this command will have a
section that describes the t2m data, in included in that will be a `scale_factor` value and an `add_offset` value.  
These values need to be pasted into the appropriate constant values in the `unpack-t2m-temperature.js` NodeJS script.
The location for this should be fairly obvious from looking at the code.  The next step is to copy and past all of the
`t2m` values from the extracted data file into the `VALUES_TO_BE_ADJUSTED` field in that same script, and then run the
script by executing the command `node unpack-t2m-temperature.js`.  This will output the adjusted data into a file, and
you'll need to open that file and cut and paste the unpacked temperature values into the
`airTemperatureNearSurfaceValues` field in `temperatureDataSet.js`.
+ The temperature data was compressed in order to make the file size more
compact.  Please read through the information in temperatureDataSet.js to
see how this was done and to figure out how to repeat the process if an
when necessary.
+ At this point, the temperature data set should be fully updated, and can be tested in the context of the sim.
