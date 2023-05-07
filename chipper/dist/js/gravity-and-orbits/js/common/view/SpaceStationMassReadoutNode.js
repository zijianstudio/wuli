// Copyright 2014-2022, University of Colorado Boulder

/**
 * Shows the mass of a Body in terms of space station masses.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Aaron Davis (PhET Interactive Simulations)
 */

import Utils from '../../../../dot/js/Utils.js';
import StringUtils from '../../../../phetcommon/js/util/StringUtils.js';
import gravityAndOrbits from '../../gravityAndOrbits.js';
import GravityAndOrbitsStrings from '../../GravityAndOrbitsStrings.js';
import GravityAndOrbitsConstants from '../GravityAndOrbitsConstants.js';
import MassReadoutNode from './MassReadoutNode.js';
const billionBillionSpaceStationMassesStringProperty = GravityAndOrbitsStrings.billionBillionSpaceStationMassesStringProperty;
const pattern0Value1UnitsStringProperty = GravityAndOrbitsStrings.pattern['0value']['1unitsStringProperty'];
const spaceStationMassStringProperty = GravityAndOrbitsStrings.spaceStationMassStringProperty;
class SpaceStationMassReadoutNode extends MassReadoutNode {
  constructor(bodyNode, visibleProperty) {
    super(bodyNode, visibleProperty, bodyNode.body.type === 'planet' ? {
      textMaxWidth: 400
    } : {});

    /**
     * Create a text label for the space station, modified so that it will be quantitative
     * or qualitative depending on the mass of the station.  For instance, if larger than
     * a specific mass, the label will be in something like 'billions of station masses'.
     */
    const updateText = () => {
      const massKG = this.bodyNode.body.massProperty.get();
      const spaceStationMasses = massKG / GravityAndOrbitsConstants.SPACE_STATION_MASS;

      // Show the readout in terms of space station masses (or billions of billions of space station masses)
      let value;
      let units = spaceStationMassStringProperty.value;
      if (spaceStationMasses > 1E18) {
        value = Utils.toFixed(spaceStationMasses / 1E18, 0);
        units = billionBillionSpaceStationMassesStringProperty.value;
      } else if (Math.abs(spaceStationMasses - 1) < 1E-2) {
        value = '1';
      } else if (spaceStationMasses < 1) {
        value = Utils.toFixed(spaceStationMasses, 3);
      } else {
        value = Utils.toFixed(spaceStationMasses, 2); // use one less decimal point here
      }

      this.stringProperty.value = StringUtils.format(pattern0Value1UnitsStringProperty.value, value, units);
    };
    this.bodyNode.body.massProperty.lazyLink(updateText);
    billionBillionSpaceStationMassesStringProperty.lazyLink(updateText);
    spaceStationMassStringProperty.lazyLink(updateText);
    pattern0Value1UnitsStringProperty.lazyLink(updateText);
    updateText();
  }
}
gravityAndOrbits.register('SpaceStationMassReadoutNode', SpaceStationMassReadoutNode);
export default SpaceStationMassReadoutNode;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJVdGlscyIsIlN0cmluZ1V0aWxzIiwiZ3Jhdml0eUFuZE9yYml0cyIsIkdyYXZpdHlBbmRPcmJpdHNTdHJpbmdzIiwiR3Jhdml0eUFuZE9yYml0c0NvbnN0YW50cyIsIk1hc3NSZWFkb3V0Tm9kZSIsImJpbGxpb25CaWxsaW9uU3BhY2VTdGF0aW9uTWFzc2VzU3RyaW5nUHJvcGVydHkiLCJwYXR0ZXJuMFZhbHVlMVVuaXRzU3RyaW5nUHJvcGVydHkiLCJwYXR0ZXJuIiwic3BhY2VTdGF0aW9uTWFzc1N0cmluZ1Byb3BlcnR5IiwiU3BhY2VTdGF0aW9uTWFzc1JlYWRvdXROb2RlIiwiY29uc3RydWN0b3IiLCJib2R5Tm9kZSIsInZpc2libGVQcm9wZXJ0eSIsImJvZHkiLCJ0eXBlIiwidGV4dE1heFdpZHRoIiwidXBkYXRlVGV4dCIsIm1hc3NLRyIsIm1hc3NQcm9wZXJ0eSIsImdldCIsInNwYWNlU3RhdGlvbk1hc3NlcyIsIlNQQUNFX1NUQVRJT05fTUFTUyIsInZhbHVlIiwidW5pdHMiLCJ0b0ZpeGVkIiwiTWF0aCIsImFicyIsInN0cmluZ1Byb3BlcnR5IiwiZm9ybWF0IiwibGF6eUxpbmsiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIlNwYWNlU3RhdGlvbk1hc3NSZWFkb3V0Tm9kZS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNC0yMDIyLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBTaG93cyB0aGUgbWFzcyBvZiBhIEJvZHkgaW4gdGVybXMgb2Ygc3BhY2Ugc3RhdGlvbiBtYXNzZXMuXHJcbiAqXHJcbiAqIEBhdXRob3IgU2FtIFJlaWQgKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXHJcbiAqIEBhdXRob3IgQWFyb24gRGF2aXMgKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXHJcbiAqL1xyXG5cclxuaW1wb3J0IFV0aWxzIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9VdGlscy5qcyc7XHJcbmltcG9ydCBTdHJpbmdVdGlscyBmcm9tICcuLi8uLi8uLi8uLi9waGV0Y29tbW9uL2pzL3V0aWwvU3RyaW5nVXRpbHMuanMnO1xyXG5pbXBvcnQgZ3Jhdml0eUFuZE9yYml0cyBmcm9tICcuLi8uLi9ncmF2aXR5QW5kT3JiaXRzLmpzJztcclxuaW1wb3J0IEdyYXZpdHlBbmRPcmJpdHNTdHJpbmdzIGZyb20gJy4uLy4uL0dyYXZpdHlBbmRPcmJpdHNTdHJpbmdzLmpzJztcclxuaW1wb3J0IEdyYXZpdHlBbmRPcmJpdHNDb25zdGFudHMgZnJvbSAnLi4vR3Jhdml0eUFuZE9yYml0c0NvbnN0YW50cy5qcyc7XHJcbmltcG9ydCBCb2R5Tm9kZSBmcm9tICcuL0JvZHlOb2RlLmpzJztcclxuaW1wb3J0IE1hc3NSZWFkb3V0Tm9kZSBmcm9tICcuL01hc3NSZWFkb3V0Tm9kZS5qcyc7XHJcbmltcG9ydCBUUmVhZE9ubHlQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL1RSZWFkT25seVByb3BlcnR5LmpzJztcclxuXHJcbmNvbnN0IGJpbGxpb25CaWxsaW9uU3BhY2VTdGF0aW9uTWFzc2VzU3RyaW5nUHJvcGVydHkgPSBHcmF2aXR5QW5kT3JiaXRzU3RyaW5ncy5iaWxsaW9uQmlsbGlvblNwYWNlU3RhdGlvbk1hc3Nlc1N0cmluZ1Byb3BlcnR5O1xyXG5cclxuY29uc3QgcGF0dGVybjBWYWx1ZTFVbml0c1N0cmluZ1Byb3BlcnR5ID0gR3Jhdml0eUFuZE9yYml0c1N0cmluZ3MucGF0dGVyblsgJzB2YWx1ZScgXVsgJzF1bml0c1N0cmluZ1Byb3BlcnR5JyBdO1xyXG5jb25zdCBzcGFjZVN0YXRpb25NYXNzU3RyaW5nUHJvcGVydHkgPSBHcmF2aXR5QW5kT3JiaXRzU3RyaW5ncy5zcGFjZVN0YXRpb25NYXNzU3RyaW5nUHJvcGVydHk7XHJcblxyXG5jbGFzcyBTcGFjZVN0YXRpb25NYXNzUmVhZG91dE5vZGUgZXh0ZW5kcyBNYXNzUmVhZG91dE5vZGUge1xyXG5cclxuICBwdWJsaWMgY29uc3RydWN0b3IoIGJvZHlOb2RlOiBCb2R5Tm9kZSwgdmlzaWJsZVByb3BlcnR5OiBUUmVhZE9ubHlQcm9wZXJ0eTxib29sZWFuPiApIHtcclxuICAgIHN1cGVyKCBib2R5Tm9kZSwgdmlzaWJsZVByb3BlcnR5LCBib2R5Tm9kZS5ib2R5LnR5cGUgPT09ICdwbGFuZXQnID8ge1xyXG4gICAgICB0ZXh0TWF4V2lkdGg6IDQwMFxyXG4gICAgfSA6IHt9ICk7XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBDcmVhdGUgYSB0ZXh0IGxhYmVsIGZvciB0aGUgc3BhY2Ugc3RhdGlvbiwgbW9kaWZpZWQgc28gdGhhdCBpdCB3aWxsIGJlIHF1YW50aXRhdGl2ZVxyXG4gICAgICogb3IgcXVhbGl0YXRpdmUgZGVwZW5kaW5nIG9uIHRoZSBtYXNzIG9mIHRoZSBzdGF0aW9uLiAgRm9yIGluc3RhbmNlLCBpZiBsYXJnZXIgdGhhblxyXG4gICAgICogYSBzcGVjaWZpYyBtYXNzLCB0aGUgbGFiZWwgd2lsbCBiZSBpbiBzb21ldGhpbmcgbGlrZSAnYmlsbGlvbnMgb2Ygc3RhdGlvbiBtYXNzZXMnLlxyXG4gICAgICovXHJcbiAgICBjb25zdCB1cGRhdGVUZXh0ID0gKCkgPT4ge1xyXG4gICAgICBjb25zdCBtYXNzS0cgPSB0aGlzLmJvZHlOb2RlLmJvZHkubWFzc1Byb3BlcnR5LmdldCgpO1xyXG4gICAgICBjb25zdCBzcGFjZVN0YXRpb25NYXNzZXMgPSBtYXNzS0cgLyBHcmF2aXR5QW5kT3JiaXRzQ29uc3RhbnRzLlNQQUNFX1NUQVRJT05fTUFTUztcclxuXHJcbiAgICAgIC8vIFNob3cgdGhlIHJlYWRvdXQgaW4gdGVybXMgb2Ygc3BhY2Ugc3RhdGlvbiBtYXNzZXMgKG9yIGJpbGxpb25zIG9mIGJpbGxpb25zIG9mIHNwYWNlIHN0YXRpb24gbWFzc2VzKVxyXG4gICAgICBsZXQgdmFsdWU7XHJcbiAgICAgIGxldCB1bml0cyA9IHNwYWNlU3RhdGlvbk1hc3NTdHJpbmdQcm9wZXJ0eS52YWx1ZTtcclxuICAgICAgaWYgKCBzcGFjZVN0YXRpb25NYXNzZXMgPiAxRTE4ICkge1xyXG4gICAgICAgIHZhbHVlID0gVXRpbHMudG9GaXhlZCggc3BhY2VTdGF0aW9uTWFzc2VzIC8gMUUxOCwgMCApO1xyXG4gICAgICAgIHVuaXRzID0gYmlsbGlvbkJpbGxpb25TcGFjZVN0YXRpb25NYXNzZXNTdHJpbmdQcm9wZXJ0eS52YWx1ZTtcclxuICAgICAgfVxyXG4gICAgICBlbHNlIGlmICggTWF0aC5hYnMoIHNwYWNlU3RhdGlvbk1hc3NlcyAtIDEgKSA8IDFFLTIgKSB7XHJcbiAgICAgICAgdmFsdWUgPSAnMSc7XHJcbiAgICAgIH1cclxuICAgICAgZWxzZSBpZiAoIHNwYWNlU3RhdGlvbk1hc3NlcyA8IDEgKSB7XHJcbiAgICAgICAgdmFsdWUgPSBVdGlscy50b0ZpeGVkKCBzcGFjZVN0YXRpb25NYXNzZXMsIDMgKTtcclxuICAgICAgfVxyXG4gICAgICBlbHNlIHtcclxuICAgICAgICB2YWx1ZSA9IFV0aWxzLnRvRml4ZWQoIHNwYWNlU3RhdGlvbk1hc3NlcywgMiApOyAvLyB1c2Ugb25lIGxlc3MgZGVjaW1hbCBwb2ludCBoZXJlXHJcbiAgICAgIH1cclxuICAgICAgdGhpcy5zdHJpbmdQcm9wZXJ0eS52YWx1ZSA9IFN0cmluZ1V0aWxzLmZvcm1hdCggcGF0dGVybjBWYWx1ZTFVbml0c1N0cmluZ1Byb3BlcnR5LnZhbHVlLCB2YWx1ZSwgdW5pdHMgKTtcclxuICAgIH07XHJcbiAgICB0aGlzLmJvZHlOb2RlLmJvZHkubWFzc1Byb3BlcnR5LmxhenlMaW5rKCB1cGRhdGVUZXh0ICk7XHJcbiAgICBiaWxsaW9uQmlsbGlvblNwYWNlU3RhdGlvbk1hc3Nlc1N0cmluZ1Byb3BlcnR5LmxhenlMaW5rKCB1cGRhdGVUZXh0ICk7XHJcbiAgICBzcGFjZVN0YXRpb25NYXNzU3RyaW5nUHJvcGVydHkubGF6eUxpbmsoIHVwZGF0ZVRleHQgKTtcclxuICAgIHBhdHRlcm4wVmFsdWUxVW5pdHNTdHJpbmdQcm9wZXJ0eS5sYXp5TGluayggdXBkYXRlVGV4dCApO1xyXG4gICAgdXBkYXRlVGV4dCgpO1xyXG4gIH1cclxufVxyXG5cclxuZ3Jhdml0eUFuZE9yYml0cy5yZWdpc3RlciggJ1NwYWNlU3RhdGlvbk1hc3NSZWFkb3V0Tm9kZScsIFNwYWNlU3RhdGlvbk1hc3NSZWFkb3V0Tm9kZSApO1xyXG5leHBvcnQgZGVmYXVsdCBTcGFjZVN0YXRpb25NYXNzUmVhZG91dE5vZGU7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsS0FBSyxNQUFNLDZCQUE2QjtBQUMvQyxPQUFPQyxXQUFXLE1BQU0sK0NBQStDO0FBQ3ZFLE9BQU9DLGdCQUFnQixNQUFNLDJCQUEyQjtBQUN4RCxPQUFPQyx1QkFBdUIsTUFBTSxrQ0FBa0M7QUFDdEUsT0FBT0MseUJBQXlCLE1BQU0saUNBQWlDO0FBRXZFLE9BQU9DLGVBQWUsTUFBTSxzQkFBc0I7QUFHbEQsTUFBTUMsOENBQThDLEdBQUdILHVCQUF1QixDQUFDRyw4Q0FBOEM7QUFFN0gsTUFBTUMsaUNBQWlDLEdBQUdKLHVCQUF1QixDQUFDSyxPQUFPLENBQUUsUUFBUSxDQUFFLENBQUUsc0JBQXNCLENBQUU7QUFDL0csTUFBTUMsOEJBQThCLEdBQUdOLHVCQUF1QixDQUFDTSw4QkFBOEI7QUFFN0YsTUFBTUMsMkJBQTJCLFNBQVNMLGVBQWUsQ0FBQztFQUVqRE0sV0FBV0EsQ0FBRUMsUUFBa0IsRUFBRUMsZUFBMkMsRUFBRztJQUNwRixLQUFLLENBQUVELFFBQVEsRUFBRUMsZUFBZSxFQUFFRCxRQUFRLENBQUNFLElBQUksQ0FBQ0MsSUFBSSxLQUFLLFFBQVEsR0FBRztNQUNsRUMsWUFBWSxFQUFFO0lBQ2hCLENBQUMsR0FBRyxDQUFDLENBQUUsQ0FBQzs7SUFFUjtBQUNKO0FBQ0E7QUFDQTtBQUNBO0lBQ0ksTUFBTUMsVUFBVSxHQUFHQSxDQUFBLEtBQU07TUFDdkIsTUFBTUMsTUFBTSxHQUFHLElBQUksQ0FBQ04sUUFBUSxDQUFDRSxJQUFJLENBQUNLLFlBQVksQ0FBQ0MsR0FBRyxDQUFDLENBQUM7TUFDcEQsTUFBTUMsa0JBQWtCLEdBQUdILE1BQU0sR0FBR2QseUJBQXlCLENBQUNrQixrQkFBa0I7O01BRWhGO01BQ0EsSUFBSUMsS0FBSztNQUNULElBQUlDLEtBQUssR0FBR2YsOEJBQThCLENBQUNjLEtBQUs7TUFDaEQsSUFBS0Ysa0JBQWtCLEdBQUcsSUFBSSxFQUFHO1FBQy9CRSxLQUFLLEdBQUd2QixLQUFLLENBQUN5QixPQUFPLENBQUVKLGtCQUFrQixHQUFHLElBQUksRUFBRSxDQUFFLENBQUM7UUFDckRHLEtBQUssR0FBR2xCLDhDQUE4QyxDQUFDaUIsS0FBSztNQUM5RCxDQUFDLE1BQ0ksSUFBS0csSUFBSSxDQUFDQyxHQUFHLENBQUVOLGtCQUFrQixHQUFHLENBQUUsQ0FBQyxHQUFHLElBQUksRUFBRztRQUNwREUsS0FBSyxHQUFHLEdBQUc7TUFDYixDQUFDLE1BQ0ksSUFBS0Ysa0JBQWtCLEdBQUcsQ0FBQyxFQUFHO1FBQ2pDRSxLQUFLLEdBQUd2QixLQUFLLENBQUN5QixPQUFPLENBQUVKLGtCQUFrQixFQUFFLENBQUUsQ0FBQztNQUNoRCxDQUFDLE1BQ0k7UUFDSEUsS0FBSyxHQUFHdkIsS0FBSyxDQUFDeUIsT0FBTyxDQUFFSixrQkFBa0IsRUFBRSxDQUFFLENBQUMsQ0FBQyxDQUFDO01BQ2xEOztNQUNBLElBQUksQ0FBQ08sY0FBYyxDQUFDTCxLQUFLLEdBQUd0QixXQUFXLENBQUM0QixNQUFNLENBQUV0QixpQ0FBaUMsQ0FBQ2dCLEtBQUssRUFBRUEsS0FBSyxFQUFFQyxLQUFNLENBQUM7SUFDekcsQ0FBQztJQUNELElBQUksQ0FBQ1osUUFBUSxDQUFDRSxJQUFJLENBQUNLLFlBQVksQ0FBQ1csUUFBUSxDQUFFYixVQUFXLENBQUM7SUFDdERYLDhDQUE4QyxDQUFDd0IsUUFBUSxDQUFFYixVQUFXLENBQUM7SUFDckVSLDhCQUE4QixDQUFDcUIsUUFBUSxDQUFFYixVQUFXLENBQUM7SUFDckRWLGlDQUFpQyxDQUFDdUIsUUFBUSxDQUFFYixVQUFXLENBQUM7SUFDeERBLFVBQVUsQ0FBQyxDQUFDO0VBQ2Q7QUFDRjtBQUVBZixnQkFBZ0IsQ0FBQzZCLFFBQVEsQ0FBRSw2QkFBNkIsRUFBRXJCLDJCQUE0QixDQUFDO0FBQ3ZGLGVBQWVBLDJCQUEyQiJ9