// Copyright 2016-2023, University of Colorado Boulder

/**
 * Query parameters supported by this simulation.
 *
 * @author Denzell Barnett (Berea College)
 * @author Chris Malley (PixelZoom, Inc.)
 */

import plinkoProbability from '../plinkoProbability.js';
const PlinkoProbabilityQueryParameters = QueryStringMachine.getAll({
  // Maximum number of balls in the Intro screen, e.g. maxBallsIntro=150
  // Used to test overflow of bins.
  maxBallsIntro: {
    type: 'number',
    defaultValue: 100,
    isValidValue: value => value > 0 && Number.isInteger(value)
  },
  // Maximum number of balls that can be in any 1 bin in the Lab screen, e.g. maxBallsLab=10
  // Use this to test the 'Out of Balls!' dialog without having to wait an eternity.
  maxBallsLab: {
    type: 'number',
    defaultValue: 9999,
    isValidValue: value => value > 0 && Number.isInteger(value)
  },
  // Number of balls to put in the Lab screen histogram at startup, e.g. populateHistogram=20
  // Use this to quickly test the histogram.
  histogramBallsLab: {
    type: 'number',
    defaultValue: 0,
    isValidValue: value => value >= 0 && Number.isInteger(value)
  },
  // TODO: Bad things will happen if the minRow is set higher than maxRow, https://github.com/phetsims/plinko-probability/issues/84
  // minimum number of peg rows on lab screen
  minRow: {
    type: 'number',
    defaultValue: 1,
    isValidValue: value => value > 0 && Number.isInteger(value)
  },
  // maximum number of peg rows on lab screen
  maxRow: {
    type: 'number',
    defaultValue: 26,
    isValidValue: value => value > 0 && Number.isInteger(value)
  },
  // default number of peg rows on intro and lab screen
  defaultRow: {
    type: 'number',
    defaultValue: 12,
    isValidValue: value => value > 0 && Number.isInteger(value)
  },
  // Uses 3D appearance for the Play button, see https://github.com/phetsims/plinko-probability/issues/26
  play3D: {
    type: 'flag'
  }
});
plinkoProbability.register('PlinkoProbabilityQueryParameters', PlinkoProbabilityQueryParameters);

// log the values of all sim-specific query parameters
phet.log && phet.log(`query parameters: ${JSON.stringify(PlinkoProbabilityQueryParameters, null, 2)}`);
export default PlinkoProbabilityQueryParameters;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJwbGlua29Qcm9iYWJpbGl0eSIsIlBsaW5rb1Byb2JhYmlsaXR5UXVlcnlQYXJhbWV0ZXJzIiwiUXVlcnlTdHJpbmdNYWNoaW5lIiwiZ2V0QWxsIiwibWF4QmFsbHNJbnRybyIsInR5cGUiLCJkZWZhdWx0VmFsdWUiLCJpc1ZhbGlkVmFsdWUiLCJ2YWx1ZSIsIk51bWJlciIsImlzSW50ZWdlciIsIm1heEJhbGxzTGFiIiwiaGlzdG9ncmFtQmFsbHNMYWIiLCJtaW5Sb3ciLCJtYXhSb3ciLCJkZWZhdWx0Um93IiwicGxheTNEIiwicmVnaXN0ZXIiLCJwaGV0IiwibG9nIiwiSlNPTiIsInN0cmluZ2lmeSJdLCJzb3VyY2VzIjpbIlBsaW5rb1Byb2JhYmlsaXR5UXVlcnlQYXJhbWV0ZXJzLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE2LTIwMjMsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIFF1ZXJ5IHBhcmFtZXRlcnMgc3VwcG9ydGVkIGJ5IHRoaXMgc2ltdWxhdGlvbi5cclxuICpcclxuICogQGF1dGhvciBEZW56ZWxsIEJhcm5ldHQgKEJlcmVhIENvbGxlZ2UpXHJcbiAqIEBhdXRob3IgQ2hyaXMgTWFsbGV5IChQaXhlbFpvb20sIEluYy4pXHJcbiAqL1xyXG5cclxuaW1wb3J0IHBsaW5rb1Byb2JhYmlsaXR5IGZyb20gJy4uL3BsaW5rb1Byb2JhYmlsaXR5LmpzJztcclxuXHJcbmNvbnN0IFBsaW5rb1Byb2JhYmlsaXR5UXVlcnlQYXJhbWV0ZXJzID0gUXVlcnlTdHJpbmdNYWNoaW5lLmdldEFsbCgge1xyXG5cclxuICAvLyBNYXhpbXVtIG51bWJlciBvZiBiYWxscyBpbiB0aGUgSW50cm8gc2NyZWVuLCBlLmcuIG1heEJhbGxzSW50cm89MTUwXHJcbiAgLy8gVXNlZCB0byB0ZXN0IG92ZXJmbG93IG9mIGJpbnMuXHJcbiAgbWF4QmFsbHNJbnRybzoge1xyXG4gICAgdHlwZTogJ251bWJlcicsXHJcbiAgICBkZWZhdWx0VmFsdWU6IDEwMCxcclxuICAgIGlzVmFsaWRWYWx1ZTogdmFsdWUgPT4gdmFsdWUgPiAwICYmIE51bWJlci5pc0ludGVnZXIoIHZhbHVlIClcclxuICB9LFxyXG5cclxuICAvLyBNYXhpbXVtIG51bWJlciBvZiBiYWxscyB0aGF0IGNhbiBiZSBpbiBhbnkgMSBiaW4gaW4gdGhlIExhYiBzY3JlZW4sIGUuZy4gbWF4QmFsbHNMYWI9MTBcclxuICAvLyBVc2UgdGhpcyB0byB0ZXN0IHRoZSAnT3V0IG9mIEJhbGxzIScgZGlhbG9nIHdpdGhvdXQgaGF2aW5nIHRvIHdhaXQgYW4gZXRlcm5pdHkuXHJcbiAgbWF4QmFsbHNMYWI6IHtcclxuICAgIHR5cGU6ICdudW1iZXInLFxyXG4gICAgZGVmYXVsdFZhbHVlOiA5OTk5LFxyXG4gICAgaXNWYWxpZFZhbHVlOiB2YWx1ZSA9PiB2YWx1ZSA+IDAgJiYgTnVtYmVyLmlzSW50ZWdlciggdmFsdWUgKVxyXG4gIH0sXHJcblxyXG4gIC8vIE51bWJlciBvZiBiYWxscyB0byBwdXQgaW4gdGhlIExhYiBzY3JlZW4gaGlzdG9ncmFtIGF0IHN0YXJ0dXAsIGUuZy4gcG9wdWxhdGVIaXN0b2dyYW09MjBcclxuICAvLyBVc2UgdGhpcyB0byBxdWlja2x5IHRlc3QgdGhlIGhpc3RvZ3JhbS5cclxuICBoaXN0b2dyYW1CYWxsc0xhYjoge1xyXG4gICAgdHlwZTogJ251bWJlcicsXHJcbiAgICBkZWZhdWx0VmFsdWU6IDAsXHJcbiAgICBpc1ZhbGlkVmFsdWU6IHZhbHVlID0+IHZhbHVlID49IDAgJiYgTnVtYmVyLmlzSW50ZWdlciggdmFsdWUgKVxyXG4gIH0sXHJcblxyXG4gIC8vIFRPRE86IEJhZCB0aGluZ3Mgd2lsbCBoYXBwZW4gaWYgdGhlIG1pblJvdyBpcyBzZXQgaGlnaGVyIHRoYW4gbWF4Um93LCBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvcGxpbmtvLXByb2JhYmlsaXR5L2lzc3Vlcy84NFxyXG4gIC8vIG1pbmltdW0gbnVtYmVyIG9mIHBlZyByb3dzIG9uIGxhYiBzY3JlZW5cclxuICBtaW5Sb3c6IHtcclxuICAgIHR5cGU6ICdudW1iZXInLFxyXG4gICAgZGVmYXVsdFZhbHVlOiAxLFxyXG4gICAgaXNWYWxpZFZhbHVlOiB2YWx1ZSA9PiB2YWx1ZSA+IDAgJiYgTnVtYmVyLmlzSW50ZWdlciggdmFsdWUgKVxyXG4gIH0sXHJcbiAgLy8gbWF4aW11bSBudW1iZXIgb2YgcGVnIHJvd3Mgb24gbGFiIHNjcmVlblxyXG4gIG1heFJvdzoge1xyXG4gICAgdHlwZTogJ251bWJlcicsXHJcbiAgICBkZWZhdWx0VmFsdWU6IDI2LFxyXG4gICAgaXNWYWxpZFZhbHVlOiB2YWx1ZSA9PiB2YWx1ZSA+IDAgJiYgTnVtYmVyLmlzSW50ZWdlciggdmFsdWUgKVxyXG4gIH0sXHJcbiAgLy8gZGVmYXVsdCBudW1iZXIgb2YgcGVnIHJvd3Mgb24gaW50cm8gYW5kIGxhYiBzY3JlZW5cclxuICBkZWZhdWx0Um93OiB7XHJcbiAgICB0eXBlOiAnbnVtYmVyJyxcclxuICAgIGRlZmF1bHRWYWx1ZTogMTIsXHJcbiAgICBpc1ZhbGlkVmFsdWU6IHZhbHVlID0+IHZhbHVlID4gMCAmJiBOdW1iZXIuaXNJbnRlZ2VyKCB2YWx1ZSApXHJcbiAgfSxcclxuXHJcbiAgLy8gVXNlcyAzRCBhcHBlYXJhbmNlIGZvciB0aGUgUGxheSBidXR0b24sIHNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvcGxpbmtvLXByb2JhYmlsaXR5L2lzc3Vlcy8yNlxyXG4gIHBsYXkzRDogeyB0eXBlOiAnZmxhZycgfVxyXG59ICk7XHJcblxyXG5wbGlua29Qcm9iYWJpbGl0eS5yZWdpc3RlciggJ1BsaW5rb1Byb2JhYmlsaXR5UXVlcnlQYXJhbWV0ZXJzJywgUGxpbmtvUHJvYmFiaWxpdHlRdWVyeVBhcmFtZXRlcnMgKTtcclxuXHJcbi8vIGxvZyB0aGUgdmFsdWVzIG9mIGFsbCBzaW0tc3BlY2lmaWMgcXVlcnkgcGFyYW1ldGVyc1xyXG5waGV0LmxvZyAmJiBwaGV0LmxvZyggYHF1ZXJ5IHBhcmFtZXRlcnM6ICR7SlNPTi5zdHJpbmdpZnkoIFBsaW5rb1Byb2JhYmlsaXR5UXVlcnlQYXJhbWV0ZXJzLCBudWxsLCAyICl9YCApO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgUGxpbmtvUHJvYmFiaWxpdHlRdWVyeVBhcmFtZXRlcnM7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsaUJBQWlCLE1BQU0seUJBQXlCO0FBRXZELE1BQU1DLGdDQUFnQyxHQUFHQyxrQkFBa0IsQ0FBQ0MsTUFBTSxDQUFFO0VBRWxFO0VBQ0E7RUFDQUMsYUFBYSxFQUFFO0lBQ2JDLElBQUksRUFBRSxRQUFRO0lBQ2RDLFlBQVksRUFBRSxHQUFHO0lBQ2pCQyxZQUFZLEVBQUVDLEtBQUssSUFBSUEsS0FBSyxHQUFHLENBQUMsSUFBSUMsTUFBTSxDQUFDQyxTQUFTLENBQUVGLEtBQU07RUFDOUQsQ0FBQztFQUVEO0VBQ0E7RUFDQUcsV0FBVyxFQUFFO0lBQ1hOLElBQUksRUFBRSxRQUFRO0lBQ2RDLFlBQVksRUFBRSxJQUFJO0lBQ2xCQyxZQUFZLEVBQUVDLEtBQUssSUFBSUEsS0FBSyxHQUFHLENBQUMsSUFBSUMsTUFBTSxDQUFDQyxTQUFTLENBQUVGLEtBQU07RUFDOUQsQ0FBQztFQUVEO0VBQ0E7RUFDQUksaUJBQWlCLEVBQUU7SUFDakJQLElBQUksRUFBRSxRQUFRO0lBQ2RDLFlBQVksRUFBRSxDQUFDO0lBQ2ZDLFlBQVksRUFBRUMsS0FBSyxJQUFJQSxLQUFLLElBQUksQ0FBQyxJQUFJQyxNQUFNLENBQUNDLFNBQVMsQ0FBRUYsS0FBTTtFQUMvRCxDQUFDO0VBRUQ7RUFDQTtFQUNBSyxNQUFNLEVBQUU7SUFDTlIsSUFBSSxFQUFFLFFBQVE7SUFDZEMsWUFBWSxFQUFFLENBQUM7SUFDZkMsWUFBWSxFQUFFQyxLQUFLLElBQUlBLEtBQUssR0FBRyxDQUFDLElBQUlDLE1BQU0sQ0FBQ0MsU0FBUyxDQUFFRixLQUFNO0VBQzlELENBQUM7RUFDRDtFQUNBTSxNQUFNLEVBQUU7SUFDTlQsSUFBSSxFQUFFLFFBQVE7SUFDZEMsWUFBWSxFQUFFLEVBQUU7SUFDaEJDLFlBQVksRUFBRUMsS0FBSyxJQUFJQSxLQUFLLEdBQUcsQ0FBQyxJQUFJQyxNQUFNLENBQUNDLFNBQVMsQ0FBRUYsS0FBTTtFQUM5RCxDQUFDO0VBQ0Q7RUFDQU8sVUFBVSxFQUFFO0lBQ1ZWLElBQUksRUFBRSxRQUFRO0lBQ2RDLFlBQVksRUFBRSxFQUFFO0lBQ2hCQyxZQUFZLEVBQUVDLEtBQUssSUFBSUEsS0FBSyxHQUFHLENBQUMsSUFBSUMsTUFBTSxDQUFDQyxTQUFTLENBQUVGLEtBQU07RUFDOUQsQ0FBQztFQUVEO0VBQ0FRLE1BQU0sRUFBRTtJQUFFWCxJQUFJLEVBQUU7RUFBTztBQUN6QixDQUFFLENBQUM7QUFFSEwsaUJBQWlCLENBQUNpQixRQUFRLENBQUUsa0NBQWtDLEVBQUVoQixnQ0FBaUMsQ0FBQzs7QUFFbEc7QUFDQWlCLElBQUksQ0FBQ0MsR0FBRyxJQUFJRCxJQUFJLENBQUNDLEdBQUcsQ0FBRyxxQkFBb0JDLElBQUksQ0FBQ0MsU0FBUyxDQUFFcEIsZ0NBQWdDLEVBQUUsSUFBSSxFQUFFLENBQUUsQ0FBRSxFQUFFLENBQUM7QUFFMUcsZUFBZUEsZ0NBQWdDIn0=