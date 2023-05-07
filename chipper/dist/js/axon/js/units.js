// Copyright 2018-2022, University of Colorado Boulder

/**
 * These are the units that can be associated with Property instances.
 *
 * When adding units to this file, please add abbreviations, preferably SI abbreviations.
 * And keep the array alphabetized by value.
 * See https://github.com/phetsims/phet-io/issues/530
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import axon from './axon.js';
const units = {
  values: ['1/(cm*M)',
  // molar absorptivity
  '%',
  // percent
  'A',
  // amperes
  'AMU',
  // atomic mass unit
  'atm',
  // atmospheres
  'cm',
  // centimeters
  'cm^2',
  // centimeters squared
  'C',
  // coulombs
  '\u00B0',
  // °, degrees (angle)
  '\u00B0C',
  // °C, degrees Celsius
  'F',
  // farad
  'g',
  // grams
  'Hz',
  // hertz
  'J',
  // Joules
  'K',
  // Kelvin
  'kg',
  // kilograms
  'kg/m^3',
  // kg/cubic meter
  'kg\u00b7m/s',
  // kg·m/s, kilogram-meters/second
  'kPa',
  // kilopascals
  'L', 'L/s', 'm',
  // meters
  'm^3',
  // cubic meter
  'm/s',
  // meters/second
  'm/s/s',
  // meters/second/second
  'm/s^2',
  // meters/seconds squared
  'mA',
  // milliampere
  'mm',
  //millimeters
  'mol', 'mol/L', 'mol/s', 'M',
  // molar
  'N',
  // Newtons
  'N/m',
  // Newtons/meter
  'nm',
  // nanometers
  'nm/ps',
  // nanometers/picosecond
  'N\u00b7s/m',
  // N·s/m, Newton-seconds/meter
  '\u2126',
  // Ω, ohms - don't use the one in MathSymbols to prevent a dependency on scenery-phet
  '\u2126\u00b7cm',
  // Ω·cm, ohm-centimeters
  'Pa\u00b7s',
  // Pascal-seconds
  'particles/ps',
  // particles/picosecond
  'pm',
  // picometers
  'pm/ps',
  // picometers/picosecond
  'pm/s',
  // picometers/second
  'pm/s^2',
  // picometers/second-squared
  'pm^3',
  // picometers cubed
  'ps',
  // picoseconds
  'radians',
  // radians - note this has the same abbreviation as the radiation term "rad" so we use the full term
  'radians/s',
  // radians/second
  's',
  // seconds
  'V',
  // volts
  'view-coordinates/s', 'W' // watts
  ],

  isValidUnits: function (unit) {
    return _.includes(units.values, unit);
  }
};
axon.register('units', units);
export default units;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJheG9uIiwidW5pdHMiLCJ2YWx1ZXMiLCJpc1ZhbGlkVW5pdHMiLCJ1bml0IiwiXyIsImluY2x1ZGVzIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJ1bml0cy50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxOC0yMDIyLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBUaGVzZSBhcmUgdGhlIHVuaXRzIHRoYXQgY2FuIGJlIGFzc29jaWF0ZWQgd2l0aCBQcm9wZXJ0eSBpbnN0YW5jZXMuXHJcbiAqXHJcbiAqIFdoZW4gYWRkaW5nIHVuaXRzIHRvIHRoaXMgZmlsZSwgcGxlYXNlIGFkZCBhYmJyZXZpYXRpb25zLCBwcmVmZXJhYmx5IFNJIGFiYnJldmlhdGlvbnMuXHJcbiAqIEFuZCBrZWVwIHRoZSBhcnJheSBhbHBoYWJldGl6ZWQgYnkgdmFsdWUuXHJcbiAqIFNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvcGhldC1pby9pc3N1ZXMvNTMwXHJcbiAqXHJcbiAqIEBhdXRob3IgU2FtIFJlaWQgKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXHJcbiAqL1xyXG5cclxuaW1wb3J0IGF4b24gZnJvbSAnLi9heG9uLmpzJztcclxuXHJcbmNvbnN0IHVuaXRzID0ge1xyXG4gIHZhbHVlczogW1xyXG4gICAgJzEvKGNtKk0pJywgLy8gbW9sYXIgYWJzb3JwdGl2aXR5XHJcbiAgICAnJScsIC8vIHBlcmNlbnRcclxuICAgICdBJywgLy8gYW1wZXJlc1xyXG4gICAgJ0FNVScsIC8vIGF0b21pYyBtYXNzIHVuaXRcclxuICAgICdhdG0nLCAvLyBhdG1vc3BoZXJlc1xyXG4gICAgJ2NtJywgLy8gY2VudGltZXRlcnNcclxuICAgICdjbV4yJywgLy8gY2VudGltZXRlcnMgc3F1YXJlZFxyXG4gICAgJ0MnLCAvLyBjb3Vsb21ic1xyXG4gICAgJ1xcdTAwQjAnLCAvLyDCsCwgZGVncmVlcyAoYW5nbGUpXHJcbiAgICAnXFx1MDBCMEMnLCAvLyDCsEMsIGRlZ3JlZXMgQ2Vsc2l1c1xyXG4gICAgJ0YnLCAvLyBmYXJhZFxyXG4gICAgJ2cnLCAvLyBncmFtc1xyXG4gICAgJ0h6JywgLy8gaGVydHpcclxuICAgICdKJywgLy8gSm91bGVzXHJcbiAgICAnSycsIC8vIEtlbHZpblxyXG4gICAgJ2tnJywgLy8ga2lsb2dyYW1zXHJcbiAgICAna2cvbV4zJywgLy8ga2cvY3ViaWMgbWV0ZXJcclxuICAgICdrZ1xcdTAwYjdtL3MnLCAvLyBrZ8K3bS9zLCBraWxvZ3JhbS1tZXRlcnMvc2Vjb25kXHJcbiAgICAna1BhJywgLy8ga2lsb3Bhc2NhbHNcclxuICAgICdMJyxcclxuICAgICdML3MnLFxyXG4gICAgJ20nLCAvLyBtZXRlcnNcclxuICAgICdtXjMnLCAvLyBjdWJpYyBtZXRlclxyXG4gICAgJ20vcycsIC8vIG1ldGVycy9zZWNvbmRcclxuICAgICdtL3MvcycsIC8vIG1ldGVycy9zZWNvbmQvc2Vjb25kXHJcbiAgICAnbS9zXjInLCAvLyBtZXRlcnMvc2Vjb25kcyBzcXVhcmVkXHJcbiAgICAnbUEnLCAvLyBtaWxsaWFtcGVyZVxyXG4gICAgJ21tJywgLy9taWxsaW1ldGVyc1xyXG4gICAgJ21vbCcsXHJcbiAgICAnbW9sL0wnLFxyXG4gICAgJ21vbC9zJyxcclxuICAgICdNJywgLy8gbW9sYXJcclxuICAgICdOJywgLy8gTmV3dG9uc1xyXG4gICAgJ04vbScsIC8vIE5ld3RvbnMvbWV0ZXJcclxuICAgICdubScsIC8vIG5hbm9tZXRlcnNcclxuICAgICdubS9wcycsIC8vIG5hbm9tZXRlcnMvcGljb3NlY29uZFxyXG4gICAgJ05cXHUwMGI3cy9tJywgLy8gTsK3cy9tLCBOZXd0b24tc2Vjb25kcy9tZXRlclxyXG4gICAgJ1xcdTIxMjYnLCAvLyDOqSwgb2htcyAtIGRvbid0IHVzZSB0aGUgb25lIGluIE1hdGhTeW1ib2xzIHRvIHByZXZlbnQgYSBkZXBlbmRlbmN5IG9uIHNjZW5lcnktcGhldFxyXG4gICAgJ1xcdTIxMjZcXHUwMGI3Y20nLCAvLyDOqcK3Y20sIG9obS1jZW50aW1ldGVyc1xyXG4gICAgJ1BhXFx1MDBiN3MnLCAvLyBQYXNjYWwtc2Vjb25kc1xyXG4gICAgJ3BhcnRpY2xlcy9wcycsIC8vIHBhcnRpY2xlcy9waWNvc2Vjb25kXHJcbiAgICAncG0nLCAvLyBwaWNvbWV0ZXJzXHJcbiAgICAncG0vcHMnLCAvLyBwaWNvbWV0ZXJzL3BpY29zZWNvbmRcclxuICAgICdwbS9zJywgLy8gcGljb21ldGVycy9zZWNvbmRcclxuICAgICdwbS9zXjInLCAvLyBwaWNvbWV0ZXJzL3NlY29uZC1zcXVhcmVkXHJcbiAgICAncG1eMycsIC8vIHBpY29tZXRlcnMgY3ViZWRcclxuICAgICdwcycsIC8vIHBpY29zZWNvbmRzXHJcbiAgICAncmFkaWFucycsIC8vIHJhZGlhbnMgLSBub3RlIHRoaXMgaGFzIHRoZSBzYW1lIGFiYnJldmlhdGlvbiBhcyB0aGUgcmFkaWF0aW9uIHRlcm0gXCJyYWRcIiBzbyB3ZSB1c2UgdGhlIGZ1bGwgdGVybVxyXG4gICAgJ3JhZGlhbnMvcycsIC8vIHJhZGlhbnMvc2Vjb25kXHJcbiAgICAncycsIC8vIHNlY29uZHNcclxuICAgICdWJywgLy8gdm9sdHNcclxuICAgICd2aWV3LWNvb3JkaW5hdGVzL3MnLFxyXG4gICAgJ1cnIC8vIHdhdHRzXHJcbiAgXSxcclxuXHJcbiAgaXNWYWxpZFVuaXRzOiBmdW5jdGlvbiggdW5pdDogc3RyaW5nICk6IGJvb2xlYW4ge1xyXG4gICAgcmV0dXJuIF8uaW5jbHVkZXMoIHVuaXRzLnZhbHVlcywgdW5pdCApO1xyXG4gIH1cclxufTtcclxuXHJcbmF4b24ucmVnaXN0ZXIoICd1bml0cycsIHVuaXRzICk7XHJcblxyXG5leHBvcnQgZGVmYXVsdCB1bml0czsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxJQUFJLE1BQU0sV0FBVztBQUU1QixNQUFNQyxLQUFLLEdBQUc7RUFDWkMsTUFBTSxFQUFFLENBQ04sVUFBVTtFQUFFO0VBQ1osR0FBRztFQUFFO0VBQ0wsR0FBRztFQUFFO0VBQ0wsS0FBSztFQUFFO0VBQ1AsS0FBSztFQUFFO0VBQ1AsSUFBSTtFQUFFO0VBQ04sTUFBTTtFQUFFO0VBQ1IsR0FBRztFQUFFO0VBQ0wsUUFBUTtFQUFFO0VBQ1YsU0FBUztFQUFFO0VBQ1gsR0FBRztFQUFFO0VBQ0wsR0FBRztFQUFFO0VBQ0wsSUFBSTtFQUFFO0VBQ04sR0FBRztFQUFFO0VBQ0wsR0FBRztFQUFFO0VBQ0wsSUFBSTtFQUFFO0VBQ04sUUFBUTtFQUFFO0VBQ1YsYUFBYTtFQUFFO0VBQ2YsS0FBSztFQUFFO0VBQ1AsR0FBRyxFQUNILEtBQUssRUFDTCxHQUFHO0VBQUU7RUFDTCxLQUFLO0VBQUU7RUFDUCxLQUFLO0VBQUU7RUFDUCxPQUFPO0VBQUU7RUFDVCxPQUFPO0VBQUU7RUFDVCxJQUFJO0VBQUU7RUFDTixJQUFJO0VBQUU7RUFDTixLQUFLLEVBQ0wsT0FBTyxFQUNQLE9BQU8sRUFDUCxHQUFHO0VBQUU7RUFDTCxHQUFHO0VBQUU7RUFDTCxLQUFLO0VBQUU7RUFDUCxJQUFJO0VBQUU7RUFDTixPQUFPO0VBQUU7RUFDVCxZQUFZO0VBQUU7RUFDZCxRQUFRO0VBQUU7RUFDVixnQkFBZ0I7RUFBRTtFQUNsQixXQUFXO0VBQUU7RUFDYixjQUFjO0VBQUU7RUFDaEIsSUFBSTtFQUFFO0VBQ04sT0FBTztFQUFFO0VBQ1QsTUFBTTtFQUFFO0VBQ1IsUUFBUTtFQUFFO0VBQ1YsTUFBTTtFQUFFO0VBQ1IsSUFBSTtFQUFFO0VBQ04sU0FBUztFQUFFO0VBQ1gsV0FBVztFQUFFO0VBQ2IsR0FBRztFQUFFO0VBQ0wsR0FBRztFQUFFO0VBQ0wsb0JBQW9CLEVBQ3BCLEdBQUcsQ0FBQztFQUFBLENBQ0w7O0VBRURDLFlBQVksRUFBRSxTQUFBQSxDQUFVQyxJQUFZLEVBQVk7SUFDOUMsT0FBT0MsQ0FBQyxDQUFDQyxRQUFRLENBQUVMLEtBQUssQ0FBQ0MsTUFBTSxFQUFFRSxJQUFLLENBQUM7RUFDekM7QUFDRixDQUFDO0FBRURKLElBQUksQ0FBQ08sUUFBUSxDQUFFLE9BQU8sRUFBRU4sS0FBTSxDQUFDO0FBRS9CLGVBQWVBLEtBQUsifQ==