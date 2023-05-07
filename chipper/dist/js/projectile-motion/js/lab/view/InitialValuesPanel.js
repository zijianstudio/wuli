// Copyright 2017-2023, University of Colorado Boulder

/**
 * Control panel that allows users to modify initial values for how the cannon fires a projectile.
 *
 * @author Andrea Lin (PhET Interactive Simulations)
 */

import Utils from '../../../../dot/js/Utils.js';
import merge from '../../../../phet-core/js/merge.js';
import StringUtils from '../../../../phetcommon/js/util/StringUtils.js';
import MathSymbols from '../../../../scenery-phet/js/MathSymbols.js';
import { HStrut, Text, VBox } from '../../../../scenery/js/imports.js';
import Panel from '../../../../sun/js/Panel.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import ProjectileMotionConstants from '../../common/ProjectileMotionConstants.js';
import projectileMotion from '../../projectileMotion.js';
import ProjectileMotionStrings from '../../ProjectileMotionStrings.js';
const angleString = ProjectileMotionStrings.angle;
const heightString = ProjectileMotionStrings.height;
const initialValuesString = ProjectileMotionStrings.initialValues;
const metersPerSecondString = ProjectileMotionStrings.metersPerSecond;
const mString = ProjectileMotionStrings.m;
const pattern0Value1UnitsString = ProjectileMotionStrings.pattern0Value1Units;
const pattern0Value1UnitsWithSpaceString = ProjectileMotionStrings.pattern0Value1UnitsWithSpace;
const speedString = ProjectileMotionStrings.speed;

// constants
const TITLE_OPTIONS = ProjectileMotionConstants.PANEL_TITLE_OPTIONS;
const LABEL_OPTIONS = ProjectileMotionConstants.PANEL_LABEL_OPTIONS;
const DEGREES = MathSymbols.DEGREES;
class InitialValuesPanel extends Panel {
  /**
   * @param {Property.<number>} cannonHeightProperty - height of the cannon
   * @param {Property.<number>} cannonAngleProperty - angle of the cannon, in degrees
   * @param {Property.<number>} initialSpeedProperty - velocity of next projectile to be fired
   * @param {Object} [options]
   */
  constructor(cannonHeightProperty, cannonAngleProperty, initialSpeedProperty, options) {
    // The first object is a placeholder so none of the others get mutated
    // The second object is the default, in the constants files
    // The third object is options specific to this panel, which overrides the defaults
    // The fourth object is options given at time of construction, which overrides all the others
    options = merge({}, ProjectileMotionConstants.RIGHTSIDE_PANEL_OPTIONS, {
      yMargin: 5,
      tandem: Tandem.REQUIRED
    }, options);

    // Max width for all components in this panel
    const maxWidth = options.minWidth - 2 * options.xMargin;

    /**
     * Auxiliary function that creates VBox for a parameter label and slider
     * @param {string} labelString - label for the parameter
     * @param {string} unitsString - units
     * @param {Property.<number>} valueProperty - the Property that is set and linked to
     * @param {Range} range - range for the valueProperty value
     * @param {Tandem} tandem
     * @param {string} [degreeString] - just for the angle
     * @returns {VBox}
     */
    function createReadout(labelString, unitsString, valueProperty, range, tandem, degreeString) {
      const parameterLabel = new Text('', merge({}, LABEL_OPTIONS, {
        maxWidth: maxWidth,
        // phet-io
        tandem: tandem,
        stringPropertyOptions: {
          phetioReadOnly: true
        }
      }));
      valueProperty.link(value => {
        const valueReadout = degreeString ? StringUtils.fillIn(pattern0Value1UnitsString, {
          value: Utils.toFixedNumber(value, 2),
          units: degreeString
        }) : StringUtils.fillIn(pattern0Value1UnitsWithSpaceString, {
          value: Utils.toFixedNumber(value, 2),
          units: unitsString
        });
        parameterLabel.setString(`${labelString}: ${valueReadout}`);
      });
      return new VBox({
        align: 'left',
        children: [parameterLabel, new HStrut(maxWidth)]
      });
    }
    const heightText = createReadout(heightString, mString, cannonHeightProperty, ProjectileMotionConstants.CANNON_HEIGHT_RANGE, options.tandem.createTandem('heightText'));
    const angleText = createReadout(angleString, null, cannonAngleProperty, ProjectileMotionConstants.CANNON_ANGLE_RANGE, options.tandem.createTandem('angleText'), DEGREES);
    const velocityText = createReadout(speedString, metersPerSecondString, initialSpeedProperty, ProjectileMotionConstants.LAUNCH_VELOCITY_RANGE, options.tandem.createTandem('velocityText'));

    // contents of the panel
    const content = new VBox({
      align: 'left',
      spacing: options.controlsVerticalSpace / 3,
      children: [heightText, angleText, velocityText]
    });
    const titleText = new Text(initialValuesString, _.merge({}, TITLE_OPTIONS, {
      maxWidth: maxWidth,
      tandem: options.tandem.createTandem('titleText')
    }));
    const initialValuesVBox = new VBox({
      align: 'center',
      spacing: 0,
      children: [titleText, content]
    });
    super(initialValuesVBox, options);
  }
}
projectileMotion.register('InitialValuesPanel', InitialValuesPanel);
export default InitialValuesPanel;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJVdGlscyIsIm1lcmdlIiwiU3RyaW5nVXRpbHMiLCJNYXRoU3ltYm9scyIsIkhTdHJ1dCIsIlRleHQiLCJWQm94IiwiUGFuZWwiLCJUYW5kZW0iLCJQcm9qZWN0aWxlTW90aW9uQ29uc3RhbnRzIiwicHJvamVjdGlsZU1vdGlvbiIsIlByb2plY3RpbGVNb3Rpb25TdHJpbmdzIiwiYW5nbGVTdHJpbmciLCJhbmdsZSIsImhlaWdodFN0cmluZyIsImhlaWdodCIsImluaXRpYWxWYWx1ZXNTdHJpbmciLCJpbml0aWFsVmFsdWVzIiwibWV0ZXJzUGVyU2Vjb25kU3RyaW5nIiwibWV0ZXJzUGVyU2Vjb25kIiwibVN0cmluZyIsIm0iLCJwYXR0ZXJuMFZhbHVlMVVuaXRzU3RyaW5nIiwicGF0dGVybjBWYWx1ZTFVbml0cyIsInBhdHRlcm4wVmFsdWUxVW5pdHNXaXRoU3BhY2VTdHJpbmciLCJwYXR0ZXJuMFZhbHVlMVVuaXRzV2l0aFNwYWNlIiwic3BlZWRTdHJpbmciLCJzcGVlZCIsIlRJVExFX09QVElPTlMiLCJQQU5FTF9USVRMRV9PUFRJT05TIiwiTEFCRUxfT1BUSU9OUyIsIlBBTkVMX0xBQkVMX09QVElPTlMiLCJERUdSRUVTIiwiSW5pdGlhbFZhbHVlc1BhbmVsIiwiY29uc3RydWN0b3IiLCJjYW5ub25IZWlnaHRQcm9wZXJ0eSIsImNhbm5vbkFuZ2xlUHJvcGVydHkiLCJpbml0aWFsU3BlZWRQcm9wZXJ0eSIsIm9wdGlvbnMiLCJSSUdIVFNJREVfUEFORUxfT1BUSU9OUyIsInlNYXJnaW4iLCJ0YW5kZW0iLCJSRVFVSVJFRCIsIm1heFdpZHRoIiwibWluV2lkdGgiLCJ4TWFyZ2luIiwiY3JlYXRlUmVhZG91dCIsImxhYmVsU3RyaW5nIiwidW5pdHNTdHJpbmciLCJ2YWx1ZVByb3BlcnR5IiwicmFuZ2UiLCJkZWdyZWVTdHJpbmciLCJwYXJhbWV0ZXJMYWJlbCIsInN0cmluZ1Byb3BlcnR5T3B0aW9ucyIsInBoZXRpb1JlYWRPbmx5IiwibGluayIsInZhbHVlIiwidmFsdWVSZWFkb3V0IiwiZmlsbEluIiwidG9GaXhlZE51bWJlciIsInVuaXRzIiwic2V0U3RyaW5nIiwiYWxpZ24iLCJjaGlsZHJlbiIsImhlaWdodFRleHQiLCJDQU5OT05fSEVJR0hUX1JBTkdFIiwiY3JlYXRlVGFuZGVtIiwiYW5nbGVUZXh0IiwiQ0FOTk9OX0FOR0xFX1JBTkdFIiwidmVsb2NpdHlUZXh0IiwiTEFVTkNIX1ZFTE9DSVRZX1JBTkdFIiwiY29udGVudCIsInNwYWNpbmciLCJjb250cm9sc1ZlcnRpY2FsU3BhY2UiLCJ0aXRsZVRleHQiLCJfIiwiaW5pdGlhbFZhbHVlc1ZCb3giLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIkluaXRpYWxWYWx1ZXNQYW5lbC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNy0yMDIzLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBDb250cm9sIHBhbmVsIHRoYXQgYWxsb3dzIHVzZXJzIHRvIG1vZGlmeSBpbml0aWFsIHZhbHVlcyBmb3IgaG93IHRoZSBjYW5ub24gZmlyZXMgYSBwcm9qZWN0aWxlLlxyXG4gKlxyXG4gKiBAYXV0aG9yIEFuZHJlYSBMaW4gKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXHJcbiAqL1xyXG5cclxuaW1wb3J0IFV0aWxzIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9VdGlscy5qcyc7XHJcbmltcG9ydCBtZXJnZSBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvbWVyZ2UuanMnO1xyXG5pbXBvcnQgU3RyaW5nVXRpbHMgZnJvbSAnLi4vLi4vLi4vLi4vcGhldGNvbW1vbi9qcy91dGlsL1N0cmluZ1V0aWxzLmpzJztcclxuaW1wb3J0IE1hdGhTeW1ib2xzIGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9NYXRoU3ltYm9scy5qcyc7XHJcbmltcG9ydCB7IEhTdHJ1dCwgVGV4dCwgVkJveCB9IGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvaW1wb3J0cy5qcyc7XHJcbmltcG9ydCBQYW5lbCBmcm9tICcuLi8uLi8uLi8uLi9zdW4vanMvUGFuZWwuanMnO1xyXG5pbXBvcnQgVGFuZGVtIGZyb20gJy4uLy4uLy4uLy4uL3RhbmRlbS9qcy9UYW5kZW0uanMnO1xyXG5pbXBvcnQgUHJvamVjdGlsZU1vdGlvbkNvbnN0YW50cyBmcm9tICcuLi8uLi9jb21tb24vUHJvamVjdGlsZU1vdGlvbkNvbnN0YW50cy5qcyc7XHJcbmltcG9ydCBwcm9qZWN0aWxlTW90aW9uIGZyb20gJy4uLy4uL3Byb2plY3RpbGVNb3Rpb24uanMnO1xyXG5pbXBvcnQgUHJvamVjdGlsZU1vdGlvblN0cmluZ3MgZnJvbSAnLi4vLi4vUHJvamVjdGlsZU1vdGlvblN0cmluZ3MuanMnO1xyXG5cclxuY29uc3QgYW5nbGVTdHJpbmcgPSBQcm9qZWN0aWxlTW90aW9uU3RyaW5ncy5hbmdsZTtcclxuY29uc3QgaGVpZ2h0U3RyaW5nID0gUHJvamVjdGlsZU1vdGlvblN0cmluZ3MuaGVpZ2h0O1xyXG5jb25zdCBpbml0aWFsVmFsdWVzU3RyaW5nID0gUHJvamVjdGlsZU1vdGlvblN0cmluZ3MuaW5pdGlhbFZhbHVlcztcclxuY29uc3QgbWV0ZXJzUGVyU2Vjb25kU3RyaW5nID0gUHJvamVjdGlsZU1vdGlvblN0cmluZ3MubWV0ZXJzUGVyU2Vjb25kO1xyXG5jb25zdCBtU3RyaW5nID0gUHJvamVjdGlsZU1vdGlvblN0cmluZ3MubTtcclxuY29uc3QgcGF0dGVybjBWYWx1ZTFVbml0c1N0cmluZyA9IFByb2plY3RpbGVNb3Rpb25TdHJpbmdzLnBhdHRlcm4wVmFsdWUxVW5pdHM7XHJcbmNvbnN0IHBhdHRlcm4wVmFsdWUxVW5pdHNXaXRoU3BhY2VTdHJpbmcgPSBQcm9qZWN0aWxlTW90aW9uU3RyaW5ncy5wYXR0ZXJuMFZhbHVlMVVuaXRzV2l0aFNwYWNlO1xyXG5jb25zdCBzcGVlZFN0cmluZyA9IFByb2plY3RpbGVNb3Rpb25TdHJpbmdzLnNwZWVkO1xyXG5cclxuLy8gY29uc3RhbnRzXHJcbmNvbnN0IFRJVExFX09QVElPTlMgPSBQcm9qZWN0aWxlTW90aW9uQ29uc3RhbnRzLlBBTkVMX1RJVExFX09QVElPTlM7XHJcbmNvbnN0IExBQkVMX09QVElPTlMgPSBQcm9qZWN0aWxlTW90aW9uQ29uc3RhbnRzLlBBTkVMX0xBQkVMX09QVElPTlM7XHJcbmNvbnN0IERFR1JFRVMgPSBNYXRoU3ltYm9scy5ERUdSRUVTO1xyXG5cclxuY2xhc3MgSW5pdGlhbFZhbHVlc1BhbmVsIGV4dGVuZHMgUGFuZWwge1xyXG5cclxuICAvKipcclxuICAgKiBAcGFyYW0ge1Byb3BlcnR5LjxudW1iZXI+fSBjYW5ub25IZWlnaHRQcm9wZXJ0eSAtIGhlaWdodCBvZiB0aGUgY2Fubm9uXHJcbiAgICogQHBhcmFtIHtQcm9wZXJ0eS48bnVtYmVyPn0gY2Fubm9uQW5nbGVQcm9wZXJ0eSAtIGFuZ2xlIG9mIHRoZSBjYW5ub24sIGluIGRlZ3JlZXNcclxuICAgKiBAcGFyYW0ge1Byb3BlcnR5LjxudW1iZXI+fSBpbml0aWFsU3BlZWRQcm9wZXJ0eSAtIHZlbG9jaXR5IG9mIG5leHQgcHJvamVjdGlsZSB0byBiZSBmaXJlZFxyXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9uc11cclxuICAgKi9cclxuICBjb25zdHJ1Y3RvciggY2Fubm9uSGVpZ2h0UHJvcGVydHksIGNhbm5vbkFuZ2xlUHJvcGVydHksIGluaXRpYWxTcGVlZFByb3BlcnR5LCBvcHRpb25zICkge1xyXG5cclxuICAgIC8vIFRoZSBmaXJzdCBvYmplY3QgaXMgYSBwbGFjZWhvbGRlciBzbyBub25lIG9mIHRoZSBvdGhlcnMgZ2V0IG11dGF0ZWRcclxuICAgIC8vIFRoZSBzZWNvbmQgb2JqZWN0IGlzIHRoZSBkZWZhdWx0LCBpbiB0aGUgY29uc3RhbnRzIGZpbGVzXHJcbiAgICAvLyBUaGUgdGhpcmQgb2JqZWN0IGlzIG9wdGlvbnMgc3BlY2lmaWMgdG8gdGhpcyBwYW5lbCwgd2hpY2ggb3ZlcnJpZGVzIHRoZSBkZWZhdWx0c1xyXG4gICAgLy8gVGhlIGZvdXJ0aCBvYmplY3QgaXMgb3B0aW9ucyBnaXZlbiBhdCB0aW1lIG9mIGNvbnN0cnVjdGlvbiwgd2hpY2ggb3ZlcnJpZGVzIGFsbCB0aGUgb3RoZXJzXHJcbiAgICBvcHRpb25zID0gbWVyZ2UoIHt9LCBQcm9qZWN0aWxlTW90aW9uQ29uc3RhbnRzLlJJR0hUU0lERV9QQU5FTF9PUFRJT05TLCB7XHJcbiAgICAgIHlNYXJnaW46IDUsXHJcbiAgICAgIHRhbmRlbTogVGFuZGVtLlJFUVVJUkVEXHJcbiAgICB9LCBvcHRpb25zICk7XHJcblxyXG4gICAgLy8gTWF4IHdpZHRoIGZvciBhbGwgY29tcG9uZW50cyBpbiB0aGlzIHBhbmVsXHJcbiAgICBjb25zdCBtYXhXaWR0aCA9IG9wdGlvbnMubWluV2lkdGggLSAyICogb3B0aW9ucy54TWFyZ2luO1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogQXV4aWxpYXJ5IGZ1bmN0aW9uIHRoYXQgY3JlYXRlcyBWQm94IGZvciBhIHBhcmFtZXRlciBsYWJlbCBhbmQgc2xpZGVyXHJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gbGFiZWxTdHJpbmcgLSBsYWJlbCBmb3IgdGhlIHBhcmFtZXRlclxyXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHVuaXRzU3RyaW5nIC0gdW5pdHNcclxuICAgICAqIEBwYXJhbSB7UHJvcGVydHkuPG51bWJlcj59IHZhbHVlUHJvcGVydHkgLSB0aGUgUHJvcGVydHkgdGhhdCBpcyBzZXQgYW5kIGxpbmtlZCB0b1xyXG4gICAgICogQHBhcmFtIHtSYW5nZX0gcmFuZ2UgLSByYW5nZSBmb3IgdGhlIHZhbHVlUHJvcGVydHkgdmFsdWVcclxuICAgICAqIEBwYXJhbSB7VGFuZGVtfSB0YW5kZW1cclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBbZGVncmVlU3RyaW5nXSAtIGp1c3QgZm9yIHRoZSBhbmdsZVxyXG4gICAgICogQHJldHVybnMge1ZCb3h9XHJcbiAgICAgKi9cclxuICAgIGZ1bmN0aW9uIGNyZWF0ZVJlYWRvdXQoIGxhYmVsU3RyaW5nLCB1bml0c1N0cmluZywgdmFsdWVQcm9wZXJ0eSwgcmFuZ2UsIHRhbmRlbSwgZGVncmVlU3RyaW5nICkge1xyXG4gICAgICBjb25zdCBwYXJhbWV0ZXJMYWJlbCA9IG5ldyBUZXh0KCAnJywgbWVyZ2UoIHt9LCBMQUJFTF9PUFRJT05TLCB7XHJcbiAgICAgICAgbWF4V2lkdGg6IG1heFdpZHRoLFxyXG5cclxuICAgICAgICAvLyBwaGV0LWlvXHJcbiAgICAgICAgdGFuZGVtOiB0YW5kZW0sXHJcbiAgICAgICAgc3RyaW5nUHJvcGVydHlPcHRpb25zOiB7IHBoZXRpb1JlYWRPbmx5OiB0cnVlIH1cclxuICAgICAgfSApICk7XHJcblxyXG4gICAgICB2YWx1ZVByb3BlcnR5LmxpbmsoIHZhbHVlID0+IHtcclxuICAgICAgICBjb25zdCB2YWx1ZVJlYWRvdXQgPSBkZWdyZWVTdHJpbmcgP1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIFN0cmluZ1V0aWxzLmZpbGxJbiggcGF0dGVybjBWYWx1ZTFVbml0c1N0cmluZywge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6IFV0aWxzLnRvRml4ZWROdW1iZXIoIHZhbHVlLCAyICksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB1bml0czogZGVncmVlU3RyaW5nXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSApIDpcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICBTdHJpbmdVdGlscy5maWxsSW4oIHBhdHRlcm4wVmFsdWUxVW5pdHNXaXRoU3BhY2VTdHJpbmcsIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiBVdGlscy50b0ZpeGVkTnVtYmVyKCB2YWx1ZSwgMiApLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdW5pdHM6IHVuaXRzU3RyaW5nXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSApO1xyXG4gICAgICAgIHBhcmFtZXRlckxhYmVsLnNldFN0cmluZyggYCR7bGFiZWxTdHJpbmd9OiAke3ZhbHVlUmVhZG91dH1gICk7XHJcbiAgICAgIH0gKTtcclxuXHJcbiAgICAgIHJldHVybiBuZXcgVkJveCgge1xyXG4gICAgICAgIGFsaWduOiAnbGVmdCcsXHJcbiAgICAgICAgY2hpbGRyZW46IFsgcGFyYW1ldGVyTGFiZWwsIG5ldyBIU3RydXQoIG1heFdpZHRoICkgXVxyXG4gICAgICB9ICk7XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgaGVpZ2h0VGV4dCA9IGNyZWF0ZVJlYWRvdXQoXHJcbiAgICAgIGhlaWdodFN0cmluZyxcclxuICAgICAgbVN0cmluZyxcclxuICAgICAgY2Fubm9uSGVpZ2h0UHJvcGVydHksXHJcbiAgICAgIFByb2plY3RpbGVNb3Rpb25Db25zdGFudHMuQ0FOTk9OX0hFSUdIVF9SQU5HRSxcclxuICAgICAgb3B0aW9ucy50YW5kZW0uY3JlYXRlVGFuZGVtKCAnaGVpZ2h0VGV4dCcgKVxyXG4gICAgKTtcclxuXHJcbiAgICBjb25zdCBhbmdsZVRleHQgPSBjcmVhdGVSZWFkb3V0KFxyXG4gICAgICBhbmdsZVN0cmluZyxcclxuICAgICAgbnVsbCxcclxuICAgICAgY2Fubm9uQW5nbGVQcm9wZXJ0eSxcclxuICAgICAgUHJvamVjdGlsZU1vdGlvbkNvbnN0YW50cy5DQU5OT05fQU5HTEVfUkFOR0UsXHJcbiAgICAgIG9wdGlvbnMudGFuZGVtLmNyZWF0ZVRhbmRlbSggJ2FuZ2xlVGV4dCcgKSxcclxuICAgICAgREVHUkVFU1xyXG4gICAgKTtcclxuXHJcbiAgICBjb25zdCB2ZWxvY2l0eVRleHQgPSBjcmVhdGVSZWFkb3V0KFxyXG4gICAgICBzcGVlZFN0cmluZyxcclxuICAgICAgbWV0ZXJzUGVyU2Vjb25kU3RyaW5nLFxyXG4gICAgICBpbml0aWFsU3BlZWRQcm9wZXJ0eSxcclxuICAgICAgUHJvamVjdGlsZU1vdGlvbkNvbnN0YW50cy5MQVVOQ0hfVkVMT0NJVFlfUkFOR0UsXHJcbiAgICAgIG9wdGlvbnMudGFuZGVtLmNyZWF0ZVRhbmRlbSggJ3ZlbG9jaXR5VGV4dCcgKVxyXG4gICAgKTtcclxuXHJcbiAgICAvLyBjb250ZW50cyBvZiB0aGUgcGFuZWxcclxuICAgIGNvbnN0IGNvbnRlbnQgPSBuZXcgVkJveCgge1xyXG4gICAgICBhbGlnbjogJ2xlZnQnLFxyXG4gICAgICBzcGFjaW5nOiBvcHRpb25zLmNvbnRyb2xzVmVydGljYWxTcGFjZSAvIDMsXHJcbiAgICAgIGNoaWxkcmVuOiBbXHJcbiAgICAgICAgaGVpZ2h0VGV4dCxcclxuICAgICAgICBhbmdsZVRleHQsXHJcbiAgICAgICAgdmVsb2NpdHlUZXh0XHJcbiAgICAgIF1cclxuICAgIH0gKTtcclxuXHJcbiAgICBjb25zdCB0aXRsZVRleHQgPSBuZXcgVGV4dCggaW5pdGlhbFZhbHVlc1N0cmluZywgXy5tZXJnZSgge30sIFRJVExFX09QVElPTlMsIHtcclxuICAgICAgbWF4V2lkdGg6IG1heFdpZHRoLFxyXG4gICAgICB0YW5kZW06IG9wdGlvbnMudGFuZGVtLmNyZWF0ZVRhbmRlbSggJ3RpdGxlVGV4dCcgKVxyXG4gICAgfSApICk7XHJcblxyXG4gICAgY29uc3QgaW5pdGlhbFZhbHVlc1ZCb3ggPSBuZXcgVkJveCgge1xyXG4gICAgICBhbGlnbjogJ2NlbnRlcicsXHJcbiAgICAgIHNwYWNpbmc6IDAsXHJcbiAgICAgIGNoaWxkcmVuOiBbXHJcbiAgICAgICAgdGl0bGVUZXh0LFxyXG4gICAgICAgIGNvbnRlbnRcclxuICAgICAgXVxyXG4gICAgfSApO1xyXG5cclxuICAgIHN1cGVyKCBpbml0aWFsVmFsdWVzVkJveCwgb3B0aW9ucyApO1xyXG4gIH1cclxufVxyXG5cclxucHJvamVjdGlsZU1vdGlvbi5yZWdpc3RlciggJ0luaXRpYWxWYWx1ZXNQYW5lbCcsIEluaXRpYWxWYWx1ZXNQYW5lbCApO1xyXG5leHBvcnQgZGVmYXVsdCBJbml0aWFsVmFsdWVzUGFuZWw7Il0sIm1hcHBpbmdz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