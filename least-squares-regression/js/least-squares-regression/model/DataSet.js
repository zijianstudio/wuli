// Copyright 2014-2022, University of Colorado Boulder

/**
 * Model that defines data sets that are used to populate the comboBox.
 * See doc/implementation-notes.md for more information.
 *
 * @author Martin Veillette (Berea College)
 */

import Range from '../../../../dot/js/Range.js';
import leastSquaresRegression from '../../leastSquaresRegression.js';
import LeastSquaresRegressionStrings from '../../LeastSquaresRegressionStrings.js';

// source strings - isolated here, these sources should not be translatable
const SOURCES = {
  TEMPERATURE_CELSIUS_LATITUDE_SOURCE: 'Hand, D.J., et al. (1994) A Handbook of\nSmall Data Sets, London: Chapman & Hall, 208-210',
  TEMPERATURE_CELSIUS_LONGITUDE_SOURCE: 'Hand, D.J., et al. (1994) A Handbook of\nSmall Data Sets, London: Chapman & Hall, 208-210',
  TEMPERATURE_FAHRENHEIT_LATITUDE_SOURCE: 'Hand, D.J., et al. (1994) A Handbook of\nSmall Data Sets, London: Chapman & Hall, 208-210',
  TEMPERATURE_FAHRENHEIT_LONGITUDE_SOURCE: 'Hand, D.J., et al. (1994) A Handbook of\nSmall Data Sets, London: Chapman & Hall, 208-210',
  SPENDING_SALARY_SOURCE: 'National Education Association',
  WAGE_YEAR_SOURCE: 'U.S. Department of Labor',
  MORTALITY_YEAR_SOURCE: 'Florida Fish and Wildlife Conservation Commission',
  USER_YEAR_SOURCE: 'World Bank',
  GASOLINE_YEAR_SOURCE: 'The World Almanac and Book of Facts',
  LIFE_TV_SOURCE: 'The World Almanac and Book of Facts',
  SPEED_DISTANCE_SOURCE: 'Wikipedia',
  TEMPERATURE_FAHRENHEIT_CHIRP_SOURCE: 'Office for Mathematics, Science, and Technology\nEducation, University of Illinois',
  TEMPERATURE_CELSIUS_CHIRP_SOURCE: 'Office for Mathematics, Science, and Technology\nEducation, University of Illinois',
  HEIGHT_SHOE_SOURCE: 'Courtney Pearson, www.statcrunch.com'
};

const custom_graphTitleString = LeastSquaresRegressionStrings.custom.graphTitle;
const temperatureCelsiusLatitude_graphTitleString = LeastSquaresRegressionStrings.temperatureCelsiusLatitude.graphTitle;
const temperatureCelsiusLatitude_yAxisTitleString = LeastSquaresRegressionStrings.temperatureCelsiusLatitude.yAxisTitle;
const temperatureCelsiusLatitude_xAxisTitleString = LeastSquaresRegressionStrings.temperatureCelsiusLatitude.xAxisTitle;
const temperatureCelsiusLatitude_referenceString = LeastSquaresRegressionStrings.temperatureCelsiusLatitude.reference;
const temperatureCelsiusLongitude_graphTitle = LeastSquaresRegressionStrings.temperatureCelsiusLongitude.graphTitle;
const temperatureCelsiusLongitude_yAxisTitle = LeastSquaresRegressionStrings.temperatureCelsiusLongitude.yAxisTitle;
const temperatureCelsiusLongitude_xAxisTitle = LeastSquaresRegressionStrings.temperatureCelsiusLongitude.xAxisTitle;
const temperatureCelsiusLongitude_reference = LeastSquaresRegressionStrings.temperatureCelsiusLongitude.reference;
const temperatureFahrenheitLatitude_graphTitle = LeastSquaresRegressionStrings.temperatureFahrenheitLatitude.graphTitle;
const temperatureFahrenheitLatitude_yAxisTitle = LeastSquaresRegressionStrings.temperatureFahrenheitLatitude.yAxisTitle;
const temperatureFahrenheitLatitude_xAxisTitle = LeastSquaresRegressionStrings.temperatureFahrenheitLatitude.xAxisTitle;
const temperatureFahrenheitLatitude_reference = LeastSquaresRegressionStrings.temperatureFahrenheitLatitude.reference;
const temperatureFahrenheitLongitude_graphTitle = LeastSquaresRegressionStrings.temperatureFahrenheitLongitude.graphTitle;
const temperatureFahrenheitLongitude_yAxisTitle = LeastSquaresRegressionStrings.temperatureFahrenheitLongitude.yAxisTitle;
const temperatureFahrenheitLongitude_xAxisTitle = LeastSquaresRegressionStrings.temperatureFahrenheitLongitude.xAxisTitle;
const temperatureFahrenheitLongitude_reference = LeastSquaresRegressionStrings.temperatureFahrenheitLongitude.reference;
const spendingSalary_graphTitle = LeastSquaresRegressionStrings.spendingSalary.graphTitle;
const spendingSalary_yAxisTitle = LeastSquaresRegressionStrings.spendingSalary.yAxisTitle;
const spendingSalary_xAxisTitle = LeastSquaresRegressionStrings.spendingSalary.xAxisTitle;
const spendingSalary_reference = LeastSquaresRegressionStrings.spendingSalary.reference;
const wageYear_graphTitle = LeastSquaresRegressionStrings.wageYear.graphTitle;
const wageYear_yAxisTitle = LeastSquaresRegressionStrings.wageYear.yAxisTitle;
const wageYear_xAxisTitle = LeastSquaresRegressionStrings.wageYear.xAxisTitle;
const wageYear_reference = LeastSquaresRegressionStrings.wageYear.reference;
const mortalityYear_graphTitle = LeastSquaresRegressionStrings.mortalityYear.graphTitle;
const mortalityYear_yAxisTitle = LeastSquaresRegressionStrings.mortalityYear.yAxisTitle;
const mortalityYear_xAxisTitle = LeastSquaresRegressionStrings.mortalityYear.xAxisTitle;
const mortalityYear_reference = LeastSquaresRegressionStrings.mortalityYear.reference;
const userYear_graphTitle = LeastSquaresRegressionStrings.userYear.graphTitle;
const userYear_yAxisTitle = LeastSquaresRegressionStrings.userYear.yAxisTitle;
const userYear_xAxisTitle = LeastSquaresRegressionStrings.userYear.xAxisTitle;
const userYear_reference = LeastSquaresRegressionStrings.userYear.reference;
const gasolineYear_graphTitle = LeastSquaresRegressionStrings.gasolineYear.graphTitle;
const gasolineYear_yAxisTitle = LeastSquaresRegressionStrings.gasolineYear.yAxisTitle;
const gasolineYear_xAxisTitle = LeastSquaresRegressionStrings.gasolineYear.xAxisTitle;
const gasolineYear_reference = LeastSquaresRegressionStrings.gasolineYear.reference;
const lifeTV_graphTitle = LeastSquaresRegressionStrings.lifeTV.graphTitle;
const lifeTV_yAxisTitle = LeastSquaresRegressionStrings.lifeTV.yAxisTitle;
const lifeTV_xAxisTitle = LeastSquaresRegressionStrings.lifeTV.xAxisTitle;
const lifeTV_reference = LeastSquaresRegressionStrings.lifeTV.reference;
const speedDistance_graphTitle = LeastSquaresRegressionStrings.speedDistance.graphTitle;
const speedDistance_yAxisTitle = LeastSquaresRegressionStrings.speedDistance.yAxisTitle;
const speedDistance_xAxisTitle = LeastSquaresRegressionStrings.speedDistance.xAxisTitle;
const speedDistance_reference = LeastSquaresRegressionStrings.speedDistance.reference;
const temperatureFahrenheitChirp_graphTitle = LeastSquaresRegressionStrings.temperatureFahrenheitChirp.graphTitle;
const temperatureFahrenheitChirp_yAxisTitle = LeastSquaresRegressionStrings.temperatureFahrenheitChirp.yAxisTitle;
const temperatureFahrenheitChirp_xAxisTitle = LeastSquaresRegressionStrings.temperatureFahrenheitChirp.xAxisTitle;
const temperatureFahrenheitChirp_reference = LeastSquaresRegressionStrings.temperatureFahrenheitChirp.reference;
const temperatureCelsiusChirp_graphTitle = LeastSquaresRegressionStrings.temperatureCelsiusChirp.graphTitle;
const temperatureCelsiusChirp_yAxisTitle = LeastSquaresRegressionStrings.temperatureCelsiusChirp.yAxisTitle;
const temperatureCelsiusChirp_xAxisTitle = LeastSquaresRegressionStrings.temperatureCelsiusChirp.xAxisTitle;
const temperatureCelsiusChirp_reference = LeastSquaresRegressionStrings.temperatureCelsiusChirp.reference;
const heightShoe_graphTitle = LeastSquaresRegressionStrings.heightShoe.graphTitle;
const heightShoe_yAxisTitle = LeastSquaresRegressionStrings.heightShoe.yAxisTitle;
const heightShoe_xAxisTitle = LeastSquaresRegressionStrings.heightShoe.xAxisTitle;
const heightShoe_reference = LeastSquaresRegressionStrings.heightShoe.reference;

const custom = {
  graphTitle: custom_graphTitleString,
  yAxisTitle: '',
  xAxisTitle: '',
  reference: '',
  source: ''
};

const temperatureCelsiusLatitude = {
  graphTitle: temperatureCelsiusLatitude_graphTitleString,
  yAxisTitle: temperatureCelsiusLatitude_yAxisTitleString,
  xAxisTitle: temperatureCelsiusLatitude_xAxisTitleString,
  reference: temperatureCelsiusLatitude_referenceString,
  source: SOURCES.TEMPERATURE_CELSIUS_LATITUDE_SOURCE
};

const temperatureCelsiusLongitude = {
  graphTitle: temperatureCelsiusLongitude_graphTitle,
  yAxisTitle: temperatureCelsiusLongitude_yAxisTitle,
  xAxisTitle: temperatureCelsiusLongitude_xAxisTitle,
  reference: temperatureCelsiusLongitude_reference,
  source: SOURCES.TEMPERATURE_CELSIUS_LONGITUDE_SOURCE
};

const temperatureFahrenheitLatitude = {
  graphTitle: temperatureFahrenheitLatitude_graphTitle,
  yAxisTitle: temperatureFahrenheitLatitude_yAxisTitle,
  xAxisTitle: temperatureFahrenheitLatitude_xAxisTitle,
  reference: temperatureFahrenheitLatitude_reference,
  source: SOURCES.TEMPERATURE_FAHRENHEIT_LATITUDE_SOURCE
};

const temperatureFahrenheitLongitude = {
  graphTitle: temperatureFahrenheitLongitude_graphTitle,
  yAxisTitle: temperatureFahrenheitLongitude_yAxisTitle,
  xAxisTitle: temperatureFahrenheitLongitude_xAxisTitle,
  reference: temperatureFahrenheitLongitude_reference,
  source: SOURCES.TEMPERATURE_FAHRENHEIT_LONGITUDE_SOURCE
};

const spendingSalary = {
  graphTitle: spendingSalary_graphTitle,
  yAxisTitle: spendingSalary_yAxisTitle,
  xAxisTitle: spendingSalary_xAxisTitle,
  reference: spendingSalary_reference,
  source: SOURCES.SPENDING_SALARY_SOURCE
};

const wageYear = {
  graphTitle: wageYear_graphTitle,
  yAxisTitle: wageYear_yAxisTitle,
  xAxisTitle: wageYear_xAxisTitle,
  reference: wageYear_reference,
  source: SOURCES.WAGE_YEAR_SOURCE
};

const mortalityYear = {
  graphTitle: mortalityYear_graphTitle,
  yAxisTitle: mortalityYear_yAxisTitle,
  xAxisTitle: mortalityYear_xAxisTitle,
  reference: mortalityYear_reference,
  source: SOURCES.MORTALITY_YEAR_SOURCE
};

const userYear = {
  graphTitle: userYear_graphTitle,
  yAxisTitle: userYear_yAxisTitle,
  xAxisTitle: userYear_xAxisTitle,
  reference: userYear_reference,
  source: SOURCES.USER_YEAR_SOURCE
};

const gasolineYear = {
  graphTitle: gasolineYear_graphTitle,
  yAxisTitle: gasolineYear_yAxisTitle,
  xAxisTitle: gasolineYear_xAxisTitle,
  reference: gasolineYear_reference,
  source: SOURCES.GASOLINE_YEAR_SOURCE
};

const lifeTV = {
  graphTitle: lifeTV_graphTitle,
  yAxisTitle: lifeTV_yAxisTitle,
  xAxisTitle: lifeTV_xAxisTitle,
  reference: lifeTV_reference,
  source: SOURCES.LIFE_TV_SOURCE
};

const speedDistance = {
  graphTitle: speedDistance_graphTitle,
  yAxisTitle: speedDistance_yAxisTitle,
  xAxisTitle: speedDistance_xAxisTitle,
  reference: speedDistance_reference,
  source: SOURCES.SPEED_DISTANCE_SOURCE
};

const temperatureFahrenheitChirp = {
  graphTitle: temperatureFahrenheitChirp_graphTitle,
  yAxisTitle: temperatureFahrenheitChirp_yAxisTitle,
  xAxisTitle: temperatureFahrenheitChirp_xAxisTitle,
  reference: temperatureFahrenheitChirp_reference,
  source: SOURCES.TEMPERATURE_FAHRENHEIT_CHIRP_SOURCE
};

const temperatureCelsiusChirp = {
  graphTitle: temperatureCelsiusChirp_graphTitle,
  yAxisTitle: temperatureCelsiusChirp_yAxisTitle,
  xAxisTitle: temperatureCelsiusChirp_xAxisTitle,
  reference: temperatureCelsiusChirp_reference,
  source: SOURCES.TEMPERATURE_CELSIUS_CHIRP_SOURCE
};

const heightShoe = {
  graphTitle: heightShoe_graphTitle,
  yAxisTitle: heightShoe_yAxisTitle,
  xAxisTitle: heightShoe_xAxisTitle,
  reference: heightShoe_reference,
  source: SOURCES.HEIGHT_SHOE_SOURCE
};

/**
 * Function that returns a dataSet Object
 * @param {Object} name - object of the form { graphTitle: string, yAxisTitle: string, xAxisTitle: string, reference: string, source: string}
 * @param {Range} yRange
 * @param {Range} xRange
 * @param {Array.<Object>} dataXY - array of object of the form {x: 2, y: 5}
 * @returns {Object} dataSet
 */
function createDataSet( name, yRange, xRange, dataXY ) {
  const dataSet = {
    yRange: yRange,
    xRange: xRange,
    dataXY: dataXY,
    name: name.graphTitle,
    yAxisTitle: name.yAxisTitle,
    xAxisTitle: name.xAxisTitle,
    reference: name.reference,
    source: name.source
  };

  return dataSet;
}

const DataSet = {};

DataSet.CUSTOM = createDataSet( custom, new Range( 0, 20 ), new Range( 0, 20 ), [] );

DataSet.TEMPERATURE_FAHRENHEIT_LONGITUDE = createDataSet( temperatureFahrenheitLongitude, new Range( 0, 80 ), new Range( 0, 140 ),
  [
    { x: 88.5, y: 44 },
    { x: 86.8, y: 38 },
    { x: 112.5, y: 35 },
    { x: 92.8, y: 31 },
    { x: 118.7, y: 47 },
    { x: 123, y: 42 },
    { x: 105.3, y: 15 },
    { x: 73.4, y: 22 },
    { x: 76.3, y: 26 },
    { x: 77.5, y: 30 },
    { x: 82.3, y: 45 },
    { x: 82, y: 65 },
    { x: 80.7, y: 58 },
    { x: 85, y: 37 },
    { x: 117.1, y: 22 },
    { x: 88, y: 19 },
    { x: 86.9, y: 21 },
    { x: 93.6, y: 11 },
    { x: 97.6, y: 22 },
    { x: 86.5, y: 27 },
    { x: 90.2, y: 45 },
    { x: 70.5, y: 12 },
    { x: 77.3, y: 25 },
    { x: 71.4, y: 23 },
    { x: 83.9, y: 21 },
    { x: 93.9, y: 2 },
    { x: 90.5, y: 24 },
    { x: 112.4, y: 8 },
    { x: 96.1, y: 13 },
    { x: 71.9, y: 11 },
    { x: 75.3, y: 27 },
    { x: 106.7, y: 24 },
    { x: 73.7, y: 14 },
    { x: 74.6, y: 27 },
    { x: 81.5, y: 34 },
    { x: 78.9, y: 31 },
    { x: 101, y: 0 },
    { x: 85, y: 26 },
    { x: 82.5, y: 21 },
    { x: 97.5, y: 28 },
    { x: 123.2, y: 33 },
    { x: 77.8, y: 24 },
    { x: 75.5, y: 24 },
    { x: 80.8, y: 38 },
    { x: 87.6, y: 31 },
    { x: 101.9, y: 24 },
    { x: 95.5, y: 49 },
    { x: 95.9, y: 44 },
    { x: 112.3, y: 18 },
    { x: 73.9, y: 7 },
    { x: 76.6, y: 32 },
    { x: 122.5, y: 33 },
    { x: 117.9, y: 19 },
    { x: 90.2, y: 9 },
    { x: 88.1, y: 13 },
    { x: 104.9, y: 14 }
  ] );

// celsius
DataSet.TEMPERATURE_CELSIUS_LONGITUDE = createDataSet( temperatureCelsiusLongitude, new Range( -20, 20 ), new Range( 0, 140 ),
  [
    { x: 88.5, y: 6.6 },
    { x: 86.8, y: 3.3 },
    { x: 112.5, y: 1.7 },
    { x: 92.8, y: -0.6 },
    { x: 118.7, y: 8.3 },
    { x: 123, y: 5.5 },
    { x: 105.3, y: -9.4 },
    { x: 73.4, y: -5.6 },
    { x: 76.3, y: -3.3 },
    { x: 77.5, y: -1.1 },
    { x: 82.3, y: 7.2 },
    { x: 82, y: 18.3 },
    { x: 80.7, y: 14.4 },
    { x: 85, y: 2.8 },
    { x: 117.1, y: -5.6 },
    { x: 88, y: -7.2 },
    { x: 86.9, y: -6.1 },
    { x: 93.6, y: -11.7 },
    { x: 97.6, y: -5.6 },
    { x: 86.5, y: -2.8 },
    { x: 90.2, y: 7.2 },
    { x: 70.5, y: -11.1 },
    { x: 77.3, y: -3.9 },
    { x: 71.4, y: -5 },
    { x: 83.9, y: -6.1 },
    { x: 93.9, y: -16.7 },
    { x: 90.5, y: -4.4 },
    { x: 112.4, y: -13.3 },
    { x: 96.1, y: -10.6 },
    { x: 71.9, y: -11.7 },
    { x: 75.3, y: -2.8 },
    { x: 106.7, y: -4.4 },
    { x: 73.7, y: -10 },
    { x: 74.6, y: -2.8 },
    { x: 81.5, y: 1.1 },
    { x: 78.9, y: -0.6 },
    { x: 101, y: -17.8 },
    { x: 85, y: -3.3 },
    { x: 82.5, y: -6.1 },
    { x: 97.5, y: -2.2 },
    { x: 123.2, y: 0.6 },
    { x: 77.8, y: -4.4 },
    { x: 75.5, y: -4.4 },
    { x: 80.8, y: 3.3 },
    { x: 87.6, y: -0.6 },
    { x: 101.9, y: -4.4 },
    { x: 95.5, y: 9.4 },
    { x: 95.9, y: 6.6 },
    { x: 112.3, y: -7.8 },
    { x: 73.9, y: -13.9 },
    { x: 76.6, y: 0 },
    { x: 122.5, y: 0.6 },
    { x: 117.9, y: -7.2 },
    { x: 90.2, y: -12.8 },
    { x: 88.1, y: -10.6 },
    { x: 104.9, y: -10 }
  ] );

DataSet.TEMPERATURE_FAHRENHEIT_LATITUDE = createDataSet( temperatureFahrenheitLatitude, new Range( 0, 80 ), new Range( 0, 60 ),
  [
    { x: 31.2, y: 44 },
    { x: 32.9, y: 38 },
    { x: 33.6, y: 35 },
    { x: 35.4, y: 31 },
    { x: 34.3, y: 47 },
    { x: 38.4, y: 42 },
    { x: 40.7, y: 15 },
    { x: 41.7, y: 22 },
    { x: 40.5, y: 26 },
    { x: 39.7, y: 30 },
    { x: 31, y: 45 },
    { x: 25, y: 65 },
    { x: 26.3, y: 58 },
    { x: 33.9, y: 37 },
    { x: 43.7, y: 22 },
    { x: 42.3, y: 19 },
    { x: 39.8, y: 21 },
    { x: 41.8, y: 11 },
    { x: 38.1, y: 22 },
    { x: 39, y: 27 },
    { x: 30.8, y: 45 },
    { x: 44.2, y: 12 },
    { x: 39.7, y: 25 },
    { x: 42.7, y: 23 },
    { x: 43.1, y: 21 },
    { x: 45.9, y: 2 },
    { x: 39.3, y: 24 },
    { x: 47.1, y: 8 },
    { x: 41.9, y: 13 },
    { x: 43.5, y: 11 },
    { x: 39.8, y: 27 },
    { x: 35.1, y: 24 },
    { x: 42.6, y: 14 },
    { x: 40.8, y: 27 },
    { x: 35.9, y: 34 },
    { x: 36.4, y: 31 },
    { x: 47.1, y: 0 },
    { x: 39.2, y: 26 },
    { x: 42.3, y: 21 },
    { x: 35.9, y: 28 },
    { x: 45.6, y: 33 },
    { x: 40.9, y: 24 },
    { x: 40.9, y: 24 },
    { x: 33.3, y: 38 },
    { x: 36.7, y: 31 },
    { x: 35.6, y: 24 },
    { x: 29.4, y: 49 },
    { x: 30.1, y: 44 },
    { x: 41.1, y: 18 },
    { x: 45, y: 7 },
    { x: 37, y: 32 },
    { x: 48.1, y: 33 },
    { x: 48.1, y: 19 },
    { x: 43.4, y: 9 },
    { x: 43.3, y: 13 },
    { x: 41.2, y: 14 }
  ] );
// in celsius
DataSet.TEMPERATURE_CELSIUS_LATITUDE = createDataSet( temperatureCelsiusLatitude, new Range( -20, 20 ), new Range( 0, 60 ),
  [
    { x: 31.2, y: 6.6 },
    { x: 32.9, y: 3.3 },
    { x: 33.6, y: 1.7 },
    { x: 35.4, y: -0.6 },
    { x: 34.3, y: 8.3 },
    { x: 38.4, y: 5.5 },
    { x: 40.7, y: -9.4 },
    { x: 41.7, y: -5.6 },
    { x: 40.5, y: -3.3 },
    { x: 39.7, y: -1.1 },
    { x: 31, y: 7.2 },
    { x: 25, y: 18.3 },
    { x: 26.3, y: 14.4 },
    { x: 33.9, y: 2.8 },
    { x: 43.7, y: -5.6 },
    { x: 42.3, y: -7.2 },
    { x: 39.8, y: -6.1 },
    { x: 41.8, y: -11.7 },
    { x: 38.1, y: -5.6 },
    { x: 39, y: -2.8 },
    { x: 30.8, y: 7.2 },
    { x: 44.2, y: -11.1 },
    { x: 39.7, y: -3.9 },
    { x: 42.7, y: -5 },
    { x: 43.1, y: -6.1 },
    { x: 45.9, y: -16.7 },
    { x: 39.3, y: -4.4 },
    { x: 47.1, y: -13.3 },
    { x: 41.9, y: -10.6 },
    { x: 43.5, y: -11.7 },
    { x: 39.8, y: -2.8 },
    { x: 35.1, y: -4.4 },
    { x: 42.6, y: -10 },
    { x: 40.8, y: -2.8 },
    { x: 35.9, y: 1.1 },
    { x: 36.4, y: -0.6 },
    { x: 47.1, y: -17.8 },
    { x: 39.2, y: -3.3 },
    { x: 42.3, y: -6.1 },
    { x: 35.9, y: -2.2 },
    { x: 45.6, y: 0.6 },
    { x: 40.9, y: -4.4 },
    { x: 40.9, y: -4.4 },
    { x: 33.3, y: 3.3 },
    { x: 36.7, y: -0.6 },
    { x: 35.6, y: -4.4 },
    { x: 29.4, y: 9.4 },
    { x: 30.1, y: 6.6 },
    { x: 41.1, y: -7.8 },
    { x: 45, y: -13.9 },
    { x: 37, y: 0 },
    { x: 48.1, y: 0.6 },
    { x: 48.1, y: -7.2 },
    { x: 43.4, y: -12.8 },
    { x: 43.3, y: -10.6 },
    { x: 41.2, y: -10 }
  ] );

DataSet.SPENDING_SALARY = createDataSet( spendingSalary, new Range( 0, 10 ), new Range( 0, 50 ),
  [
    { x: 19.583, y: 3.346 },
    { x: 20.263, y: 3.114 },
    { x: 20.325, y: 3.554 },
    { x: 26.800, y: 4.642 },
    { x: 29.470, y: 4.669 },
    { x: 26.610, y: 4.888 },
    { x: 30.678, y: 5.710 },
    { x: 27.170, y: 5.536 },
    { x: 25.853, y: 4.168 },
    { x: 24.500, y: 3.547 },
    { x: 24.274, y: 3.159 },
    { x: 27.170, y: 3.621 },
    { x: 30.168, y: 3.782 },
    { x: 26.525, y: 4.247 },
    { x: 27.360, y: 3.982 },
    { x: 21.690, y: 3.568 },
    { x: 21.974, y: 3.155 },
    { x: 20.816, y: 3.059 },
    { x: 18.095, y: 2.967 },
    { x: 20.939, y: 3.285 },
    { x: 22.644, y: 3.914 },
    { x: 24.624, y: 4.517 },
    { x: 27.186, y: 4.349 },
    { x: 33.990, y: 5.020 },
    { x: 23.382, y: 3.594 },
    { x: 20.627, y: 2.821 },
    { x: 22.795, y: 3.366 },
    { x: 21.570, y: 2.920 },
    { x: 22.080, y: 2.980 },
    { x: 22.250, y: 3.731 },
    { x: 20.940, y: 2.853 },
    { x: 21.800, y: 2.533 },
    { x: 22.934, y: 2.729 },
    { x: 18.443, y: 2.305 },
    { x: 19.538, y: 2.642 },
    { x: 20.460, y: 3.124 },
    { x: 21.419, y: 2.752 },
    { x: 25.160, y: 3.429 },
    { x: 22.482, y: 3.947 },
    { x: 20.969, y: 2.509 },
    { x: 27.224, y: 5.440 },
    { x: 25.892, y: 4.042 },
    { x: 22.644, y: 3.402 },
    { x: 24.640, y: 2.829 },
    { x: 22.341, y: 2.297 },
    { x: 25.610, y: 2.932 },
    { x: 26.015, y: 3.705 },
    { x: 25.788, y: 4.123 },
    { x: 29.132, y: 3.608 },
    { x: 41.480, y: 8.349 },
    { x: 25.845, y: 3.766 }
  ] );

DataSet.WAGE_YEAR = createDataSet( wageYear, new Range( 0, 8 ), new Range( 0, 60 ),
  [
    { x: 0, y: 2.94 },
    { x: 1, y: 2.72 },
    { x: 2, y: 2.75 },
    { x: 3, y: 5.1 },
    { x: 4, y: 4.72 },
    { x: 5, y: 4.64 },
    { x: 6, y: 4.6 },
    { x: 7, y: 4.57 },
    { x: 8, y: 4.58 },
    { x: 9, y: 5.77 },
    { x: 10, y: 5.82 },
    { x: 11, y: 5.66 },
    { x: 12, y: 5.62 },
    { x: 13, y: 5.53 },
    { x: 14, y: 5.75 },
    { x: 15, y: 6.23 },
    { x: 16, y: 6.31 },
    { x: 17, y: 6.6 },
    { x: 18, y: 6.5 },
    { x: 19, y: 6.31 },
    { x: 20, y: 6.81 },
    { x: 21, y: 7.44 },
    { x: 22, y: 7.22 },
    { x: 23, y: 6.89 },
    { x: 24, y: 6.6 },
    { x: 25, y: 6.4 },
    { x: 26, y: 6.02 },
    { x: 27, y: 6.41 },
    { x: 28, y: 6.64 },
    { x: 29, y: 6.88 },
    { x: 30, y: 6.47 },
    { x: 31, y: 7.15 },
    { x: 32, y: 7.15 },
    { x: 33, y: 6.88 },
    { x: 34, y: 6.8 },
    { x: 35, y: 6.42 },
    { x: 36, y: 6.16 },
    { x: 37, y: 5.93 },
    { x: 38, y: 5.73 },
    { x: 39, y: 5.63 },
    { x: 40, y: 5.45 },
    { x: 41, y: 5.25 },
    { x: 42, y: 5.04 },
    { x: 43, y: 5.29 },
    { x: 44, y: 5.72 },
    { x: 45, y: 5.73 },
    { x: 46, y: 5.59 },
    { x: 47, y: 5.48 },
    { x: 48, y: 5.35 },
    { x: 49, y: 5.37 },
    { x: 50, y: 5.86 },
    { x: 51, y: 6.09 },
    { x: 52, y: 5.97 },
    { x: 53, y: 5.78 },
    { x: 54, y: 5.62 },
    { x: 55, y: 5.53 },
    { x: 56, y: 5.41 },
    { x: 57, y: 5.27 },
    { x: 58, y: 5.15 }
  ] );

DataSet.MORTALITY_YEAR = createDataSet( mortalityYear, new Range( 0, 500 ), new Range( 0, 40 ),
  [
    { x: 1, y: 29 },
    { x: 2, y: 62 },
    { x: 3, y: 114 },
    { x: 4, y: 84 },
    { x: 5, y: 77 },
    { x: 6, y: 63 },
    { x: 7, y: 116 },
    { x: 8, y: 114 },
    { x: 9, y: 81 },
    { x: 10, y: 128 },
    { x: 11, y: 119 },
    { x: 12, y: 122 },
    { x: 13, y: 114 },
    { x: 14, y: 133 },
    { x: 15, y: 168 },
    { x: 16, y: 206 },
    { x: 17, y: 174 },
    { x: 18, y: 163 },
    { x: 19, y: 145 },
    { x: 20, y: 193 },
    { x: 21, y: 201 },
    { x: 22, y: 415 },
    { x: 23, y: 242 },
    { x: 24, y: 231 },
    { x: 25, y: 269 },
    { x: 26, y: 272 },
    { x: 27, y: 325 },
    { x: 28, y: 305 },
    { x: 29, y: 380 },
    { x: 30, y: 276 }
  ] );

DataSet.USER_YEAR = createDataSet( userYear, new Range( 0, 2.1 ), new Range( 0, 20 ),
  [
    { x: 0, y: 0.002626964881 },
    { x: 1, y: 0.004283257864 },
    { x: 2, y: 0.006851845762 },
    { x: 3, y: 0.0098873072 },
    { x: 4, y: 0.02020656962 },
    { x: 5, y: 0.03889403814 },
    { x: 6, y: 0.07240693774 },
    { x: 7, y: 0.1160626502 },
    { x: 8, y: 0.1809450878 },
    { x: 9, y: 0.2722220605 },
    { x: 10, y: 0.38892392 },
    { x: 11, y: 0.489874705 },
    { x: 12, y: 0.6481611355 },
    { x: 13, y: 0.7590524542 },
    { x: 14, y: 0.8851731627 },
    { x: 15, y: 1.008553923 },
    { x: 16, y: 1.135996928 },
    { x: 17, y: 1.354889581 },
    { x: 18, y: 1.565562367 },
    { x: 19, y: 1.768348783 },
    { x: 20, y: 2.020788881 }
  ] );

DataSet.GASOLINE_YEAR = createDataSet( gasolineYear, new Range( 0, 4 ), new Range( 0, 40 ),
  [
    { x: 0, y: 0.73 },
    { x: 1, y: 1.01 },
    { x: 2, y: 1.25 },
    { x: 3, y: 1.21 },
    { x: 4, y: 1.10 },
    { x: 5, y: 1.12 },
    { x: 6, y: 1.08 },
    { x: 7, y: 0.83 },
    { x: 8, y: 0.85 },
    { x: 9, y: 0.85 },
    { x: 10, y: 0.89 },
    { x: 11, y: 1.09 },
    { x: 12, y: 1.02 },
    { x: 13, y: 0.96 },
    { x: 14, y: 0.94 },
    { x: 15, y: 0.92 },
    { x: 16, y: 0.89 },
    { x: 17, y: 1.02 },
    { x: 18, y: 1.01 },
    { x: 19, y: 0.88 },
    { x: 20, y: 0.90 },
    { x: 21, y: 1.36 },
    { x: 22, y: 1.31 },
    { x: 23, y: 1.16 },
    { x: 24, y: 1.40 },
    { x: 25, y: 1.65 },
    { x: 26, y: 2.22 },
    { x: 27, y: 2.50 },
    { x: 28, y: 2.68 },
    { x: 29, y: 3.75 },
    { x: 30, y: 2.51 },
    { x: 31, y: 2.93 },
    { x: 32, y: 3.71 },
    { x: 33, y: 3.75 },
    { x: 34, y: 3.72 },
    { x: 35, y: 3.80 }
  ] );

DataSet.LIFE_TV = createDataSet( lifeTV, new Range( 0, 80 ), new Range( 0, 600 ),
  [
    { x: 4, y: 70.5 },
    { x: 315, y: 53.5 },
    { x: 4, y: 65 },
    { x: 1.7, y: 76.5 },
    { x: 8, y: 70 },
    { x: 5.6, y: 71 },
    { x: 15, y: 60.5 },
    { x: 503, y: 51.5 },
    { x: 2.6, y: 78 },
    { x: 2.6, y: 76 },
    { x: 44, y: 57.5 },
    { x: 24, y: 61 },
    { x: 23, y: 64.5 },
    { x: 3.8, y: 78.5 },
    { x: 1.8, y: 79 },
    { x: 96, y: 61 },
    { x: 90, y: 70 },
    { x: 4.9, y: 70 },
    { x: 6.6, y: 72 },
    { x: 21, y: 64.5 },
    { x: 592, y: 54.5 },
    { x: 73, y: 56.5 },
    { x: 14, y: 64.5 },
    { x: 8.8, y: 64.5 },
    { x: 3.9, y: 73 },
    { x: 6, y: 72 },
    { x: 3.2, y: 69 },
    { x: 11, y: 64 },
    { x: 2.6, y: 78.5 },
    { x: 23, y: 53 },
    { x: 3.2, y: 75 },
    { x: 11, y: 68.5 },
    { x: 5, y: 70 },
    { x: 3, y: 70.5 },
    { x: 3, y: 76 },
    { x: 1.3, y: 75.5 },
    { x: 5.6, y: 74.5 },
    { x: 29, y: 65 }
  ] );

DataSet.SPEED_DISTANCE = createDataSet( speedDistance, new Range( 0, 50 ), new Range( 0, 30 ),
  [
    { x: 0.38709893, y: 47.8725 },
    { x: 0.72333199, y: 35.0214 },
    { x: 1.00000011, y: 29.7859 },
    { x: 1.52366231, y: 24.1309 },
    { x: 5.20336301, y: 13.0697 },
    { x: 9.53707032, y: 9.6724 },
    { x: 19.19126393, y: 6.8352 },
    { x: 30.06896348, y: 5.4778 }
  ] );

DataSet.TEMPERATURE_FAHRENHEIT_CHIRP = createDataSet( temperatureFahrenheitChirp, new Range( 0, 100 ), new Range( 0, 20 ),
  [
    { x: 20, y: 89 },
    { x: 16, y: 72 },
    { x: 20, y: 93 },
    { x: 18, y: 84 },
    { x: 17, y: 81 },
    { x: 16, y: 75 },
    { x: 15, y: 70 },
    { x: 17, y: 82 },
    { x: 15, y: 69 },
    { x: 16, y: 83 },
    { x: 15, y: 80 },
    { x: 17, y: 83 },
    { x: 16, y: 81 },
    { x: 17, y: 84 },
    { x: 14, y: 76 }
  ] );

// celsius
DataSet.TEMPERATURE_CELSIUS_CHIRP = createDataSet( temperatureCelsiusChirp, new Range( 0, 40 ), new Range( 0, 20 ),
  [
    { x: 20, y: 31.6 },
    { x: 16, y: 22.2 },
    { x: 20, y: 33.8 },
    { x: 18, y: 28.8 },
    { x: 17, y: 27.2 },
    { x: 16, y: 23.8 },
    { x: 15, y: 21.1 },
    { x: 17, y: 27.7 },
    { x: 15, y: 20.5 },
    { x: 16, y: 28.3 },
    { x: 15, y: 26.6 },
    { x: 17, y: 28.3 },
    { x: 16, y: 27.2 },
    { x: 17, y: 28.8 },
    { x: 14, y: 24.4 }
  ] );

DataSet.HEIGHT_SHOE = createDataSet( heightShoe, new Range( 0, 85 ), new Range( 0, 16 ),
  [
    { x: 5.5, y: 60 },
    { x: 6, y: 60 },
    { x: 7, y: 60 },
    { x: 6, y: 64 },
    { x: 7, y: 64 },
    { x: 7.5, y: 64 },
    { x: 8, y: 64 },
    { x: 8, y: 64 },
    { x: 10, y: 64 },
    { x: 8, y: 64 },
    { x: 8, y: 67 },
    { x: 9, y: 65 },
    { x: 9.5, y: 65 },
    { x: 12, y: 65 },
    { x: 9, y: 66 },
    { x: 9.5, y: 66 },
    { x: 9.5, y: 66 },
    { x: 10.5, y: 66 },
    { x: 11, y: 66 },
    { x: 12, y: 66 },
    { x: 9, y: 68 },
    { x: 9.5, y: 68 },
    { x: 10, y: 68 },
    { x: 10, y: 68 },
    { x: 10.5, y: 68 },
    { x: 9.5, y: 69 },
    { x: 10.5, y: 69 },
    { x: 11, y: 69 },
    { x: 11, y: 69 },
    { x: 12, y: 69 },
    { x: 12, y: 69 },
    { x: 9, y: 70 },
    { x: 9.5, y: 70 },
    { x: 9.5, y: 70 },
    { x: 10.5, y: 70 },
    { x: 11, y: 70 },
    { x: 11, y: 70 },
    { x: 11, y: 70 },
    { x: 11, y: 70 },
    { x: 11.5, y: 70 },
    { x: 12, y: 70 },
    { x: 12, y: 70 },
    { x: 10.5, y: 70 },
    { x: 11, y: 70 },
    { x: 12, y: 70 },
    { x: 10.5, y: 71 },
    { x: 10.5, y: 71 },
    { x: 10.5, y: 71 },
    { x: 11, y: 71 },
    { x: 11, y: 71 },
    { x: 11, y: 71 },
    { x: 11, y: 71 },
    { x: 11, y: 71 },
    { x: 11, y: 71 },
    { x: 11.5, y: 71 },
    { x: 11.5, y: 71 },
    { x: 11.5, y: 71 },
    { x: 11.5, y: 71 },
    { x: 10.5, y: 72 },
    { x: 11.5, y: 72 },
    { x: 12, y: 72 },
    { x: 12, y: 72 },
    { x: 12, y: 72 },
    { x: 12, y: 72 },
    { x: 12.5, y: 72 },
    { x: 12.5, y: 72 },
    { x: 13, y: 72 },
    { x: 13, y: 72 },
    { x: 11, y: 72 },
    { x: 11.5, y: 72 },
    { x: 11.5, y: 72 },
    { x: 12, y: 72 },
    { x: 10.5, y: 73 },
    { x: 10.5, y: 73 },
    { x: 10.5, y: 73 },
    { x: 10.5, y: 73 },
    { x: 11, y: 73 },
    { x: 12, y: 73 },
    { x: 13, y: 73 },
    { x: 13, y: 73 },
    { x: 12, y: 75 },
    { x: 12, y: 75 },
    { x: 15, y: 75 },
    { x: 13, y: 75 },
    { x: 13, y: 75 },
    { x: 12, y: 75 },
    { x: 15, y: 77 },
    { x: 15, y: 77 },
    { x: 13, y: 78 },
    { x: 13, y: 78 },
    { x: 14, y: 78 },
    { x: 15, y: 80 },
    { x: 15, y: 81 }
  ] );

leastSquaresRegression.register( 'DataSet', DataSet );

export default DataSet;