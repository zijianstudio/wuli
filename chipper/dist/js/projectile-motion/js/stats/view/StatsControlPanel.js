// Copyright 2022, University of Colorado Boulder

/**
 * Control panel for choosing which vectors are visible.
 *
 * @author Andrea Lin(PhET Interactive Simulations)
 * @author Matthew Blackman(PhET Interactive Simulations)
 */

import merge from '../../../../phet-core/js/merge.js';
import { Text, VBox, VStrut } from '../../../../scenery/js/imports.js';
import Panel from '../../../../sun/js/Panel.js';
import Checkbox from '../../../../sun/js/Checkbox.js';
import Range from '../../../../dot/js/Range.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import ProjectileMotionConstants from '../../common/ProjectileMotionConstants.js';
import ProjectileMotionStrings from '../../ProjectileMotionStrings.js';
import MathSymbols from '../../../../scenery-phet/js/MathSymbols.js';
import Dimension2 from '../../../../dot/js/Dimension2.js';
import Utils from '../../../../dot/js/Utils.js';
import StringUtils from '../../../../phetcommon/js/util/StringUtils.js';
import ArrowlessNumberControl from '../../common/view/ArrowlessNumberControl.js';
import NumberControl from '../../../../scenery-phet/js/NumberControl.js';
import projectileMotion from '../../projectileMotion.js';
const TEXT_FONT = ProjectileMotionConstants.PANEL_LABEL_OPTIONS.font;
const READOUT_X_MARGIN = ProjectileMotionConstants.RIGHTSIDE_PANEL_OPTIONS.readoutXMargin;
const degreesString = MathSymbols.DEGREES;
const metersPerSecondString = ProjectileMotionStrings.metersPerSecond;
const angleStandardDeviationString = ProjectileMotionStrings.angleStandardDeviation;
const speedStandardDeviationString = ProjectileMotionStrings.speedStandardDeviation;
const pattern0Value1UnitsString = ProjectileMotionStrings.pattern0Value1Units;
const pattern0Value1UnitsWithSpaceString = ProjectileMotionStrings.pattern0Value1UnitsWithSpace;
class StatsControlPanel extends Panel {
  /**
   * @param {NumberProperty} groupSizeProperty - the property for the number of simultaneously launched projectiles
   * @param {NumberProperty} initialSpeedStandardDeviationProperty
   * @param {NumberProperty} initialAngleStandardDeviationProperty
   * @param {BooleanProperty} rapidFireModeProperty
   * @param {Object} [options]
   */
  constructor(groupSizeProperty, initialSpeedStandardDeviationProperty, initialAngleStandardDeviationProperty, rapidFireModeProperty, viewProperties, options) {
    // The first object is a placeholder so none of the others get mutated
    // The second object is the default, in the constants files
    // The third object is options specific to this panel, which overrides the defaults
    // The fourth object is options given at time of construction, which overrides all the others
    options = merge({}, ProjectileMotionConstants.RIGHTSIDE_PANEL_OPTIONS, {
      align: 'left',
      tandem: Tandem.REQUIRED
    }, options);

    // create group size number control
    const groupSizeNumberControl = new ArrowlessNumberControl(ProjectileMotionStrings.projectileGroupSize, '', groupSizeProperty, new Range(ProjectileMotionConstants.GROUP_SIZE_INCREMENT, ProjectileMotionConstants.GROUP_SIZE_MAX), ProjectileMotionConstants.GROUP_SIZE_INCREMENT, {
      containerWidth: options.minWidth,
      xMargin: options.xMargin,
      numberDisplayMaxWidth: options.numberDisplayMaxWidth,
      tandem: options.tandem.createTandem('groupSizeNumberControl'),
      phetioDocumentation: 'UI control to adjust the number of simultaneously launched projectiles'
    });

    //standard deviation sliders
    const defaultNumberControlOptions = {
      numberDisplayOptions: {
        align: 'right',
        maxWidth: options.numberDisplayMaxWidth + options.readoutXMargin * 2,
        xMargin: READOUT_X_MARGIN,
        yMargin: 4,
        textOptions: {
          font: TEXT_FONT
        }
      },
      titleNodeOptions: {
        font: TEXT_FONT,
        maxWidth: options.minWidth - options.numberDisplayMaxWidth - 3 * options.readoutXMargin - 2 * options.xMargin
      },
      sliderOptions: {
        trackSize: new Dimension2(options.minWidth - 2 * options.xMargin - 80, 0.5),
        thumbSize: new Dimension2(13, 22),
        thumbTouchAreaXDilation: 6,
        thumbTouchAreaYDilation: 4
      },
      arrowButtonOptions: {
        scale: 0.56,
        touchAreaXDilation: 20,
        touchAreaYDilation: 20
      }
    };

    // results in '{{value}} m/s'
    const valuePatternSpeed = StringUtils.fillIn(pattern0Value1UnitsWithSpaceString, {
      units: metersPerSecondString
    });

    // results in '{{value}} degrees'
    const valuePatternAngle = StringUtils.fillIn(pattern0Value1UnitsString, {
      units: degreesString
    });

    // create speed standard deviation number control
    const speedStandardDeviationNumberControl = new NumberControl(speedStandardDeviationString, initialSpeedStandardDeviationProperty, ProjectileMotionConstants.SPEED_STANDARD_DEVIATION_RANGE, merge({}, defaultNumberControlOptions, {
      numberDisplayOptions: {
        valuePattern: valuePatternSpeed,
        xMargin: 8,
        textOptions: {
          font: TEXT_FONT
        }
      },
      sliderOptions: {
        constrainValue: value => Utils.roundToInterval(value, 1)
      },
      delta: 1,
      layoutFunction: NumberControl.createLayoutFunction4({
        arrowButtonSpacing: 10
      }),
      tandem: options.tandem.createTandem('speedStandardDeviationNumberControl'),
      phetioDocumentation: 'UI control to adjust the standard deviation of the launch speed'
    }));

    // create angle standard deviation number control
    const angleStandardDeviationNumberControl = new NumberControl(angleStandardDeviationString, initialAngleStandardDeviationProperty, ProjectileMotionConstants.ANGLE_STANDARD_DEVIATION_RANGE, merge({}, defaultNumberControlOptions, {
      numberDisplayOptions: {
        valuePattern: valuePatternAngle,
        xMargin: 8,
        textOptions: {
          font: TEXT_FONT
        }
      },
      sliderOptions: {
        constrainValue: value => Utils.roundToInterval(value, 1)
      },
      delta: 1,
      layoutFunction: NumberControl.createLayoutFunction4({
        arrowButtonSpacing: 10
      }),
      tandem: options.tandem.createTandem('angleStandardDeviationNumberControl'),
      phetioDocumentation: 'UI control to adjust the standard deviation of the launch angle'
    }));
    const checkboxTitleOptions = ProjectileMotionConstants.PANEL_TITLE_OPTIONS;
    const checkboxOptions = {
      maxWidth: checkboxTitleOptions.maxWidth,
      boxWidth: 18
    };
    const rapidFireModeLabel = new Text('Rapid fire', ProjectileMotionConstants.LABEL_TEXT_OPTIONS);
    const rapidFireModeCheckbox = new Checkbox(rapidFireModeProperty, rapidFireModeLabel, merge({
      tandem: options.tandem.createTandem('rapidFireCheckbox')
    }, checkboxOptions));

    // The contents of the control panel
    const content = new VBox({
      align: 'left',
      spacing: options.controlsVerticalSpace,
      children: [new VBox({
        align: 'center',
        spacing: options.controlsVerticalSpace,
        children: [groupSizeNumberControl, new VStrut(1), speedStandardDeviationNumberControl, angleStandardDeviationNumberControl, new VStrut(6)]
      }), new VBox({
        align: 'left',
        spacing: options.controlsVerticalSpace,
        children: [rapidFireModeCheckbox]
      })]
    });
    super(content, options);
  }
}
projectileMotion.register('StatsControlPanel', StatsControlPanel);
export default StatsControlPanel;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJtZXJnZSIsIlRleHQiLCJWQm94IiwiVlN0cnV0IiwiUGFuZWwiLCJDaGVja2JveCIsIlJhbmdlIiwiVGFuZGVtIiwiUHJvamVjdGlsZU1vdGlvbkNvbnN0YW50cyIsIlByb2plY3RpbGVNb3Rpb25TdHJpbmdzIiwiTWF0aFN5bWJvbHMiLCJEaW1lbnNpb24yIiwiVXRpbHMiLCJTdHJpbmdVdGlscyIsIkFycm93bGVzc051bWJlckNvbnRyb2wiLCJOdW1iZXJDb250cm9sIiwicHJvamVjdGlsZU1vdGlvbiIsIlRFWFRfRk9OVCIsIlBBTkVMX0xBQkVMX09QVElPTlMiLCJmb250IiwiUkVBRE9VVF9YX01BUkdJTiIsIlJJR0hUU0lERV9QQU5FTF9PUFRJT05TIiwicmVhZG91dFhNYXJnaW4iLCJkZWdyZWVzU3RyaW5nIiwiREVHUkVFUyIsIm1ldGVyc1BlclNlY29uZFN0cmluZyIsIm1ldGVyc1BlclNlY29uZCIsImFuZ2xlU3RhbmRhcmREZXZpYXRpb25TdHJpbmciLCJhbmdsZVN0YW5kYXJkRGV2aWF0aW9uIiwic3BlZWRTdGFuZGFyZERldmlhdGlvblN0cmluZyIsInNwZWVkU3RhbmRhcmREZXZpYXRpb24iLCJwYXR0ZXJuMFZhbHVlMVVuaXRzU3RyaW5nIiwicGF0dGVybjBWYWx1ZTFVbml0cyIsInBhdHRlcm4wVmFsdWUxVW5pdHNXaXRoU3BhY2VTdHJpbmciLCJwYXR0ZXJuMFZhbHVlMVVuaXRzV2l0aFNwYWNlIiwiU3RhdHNDb250cm9sUGFuZWwiLCJjb25zdHJ1Y3RvciIsImdyb3VwU2l6ZVByb3BlcnR5IiwiaW5pdGlhbFNwZWVkU3RhbmRhcmREZXZpYXRpb25Qcm9wZXJ0eSIsImluaXRpYWxBbmdsZVN0YW5kYXJkRGV2aWF0aW9uUHJvcGVydHkiLCJyYXBpZEZpcmVNb2RlUHJvcGVydHkiLCJ2aWV3UHJvcGVydGllcyIsIm9wdGlvbnMiLCJhbGlnbiIsInRhbmRlbSIsIlJFUVVJUkVEIiwiZ3JvdXBTaXplTnVtYmVyQ29udHJvbCIsInByb2plY3RpbGVHcm91cFNpemUiLCJHUk9VUF9TSVpFX0lOQ1JFTUVOVCIsIkdST1VQX1NJWkVfTUFYIiwiY29udGFpbmVyV2lkdGgiLCJtaW5XaWR0aCIsInhNYXJnaW4iLCJudW1iZXJEaXNwbGF5TWF4V2lkdGgiLCJjcmVhdGVUYW5kZW0iLCJwaGV0aW9Eb2N1bWVudGF0aW9uIiwiZGVmYXVsdE51bWJlckNvbnRyb2xPcHRpb25zIiwibnVtYmVyRGlzcGxheU9wdGlvbnMiLCJtYXhXaWR0aCIsInlNYXJnaW4iLCJ0ZXh0T3B0aW9ucyIsInRpdGxlTm9kZU9wdGlvbnMiLCJzbGlkZXJPcHRpb25zIiwidHJhY2tTaXplIiwidGh1bWJTaXplIiwidGh1bWJUb3VjaEFyZWFYRGlsYXRpb24iLCJ0aHVtYlRvdWNoQXJlYVlEaWxhdGlvbiIsImFycm93QnV0dG9uT3B0aW9ucyIsInNjYWxlIiwidG91Y2hBcmVhWERpbGF0aW9uIiwidG91Y2hBcmVhWURpbGF0aW9uIiwidmFsdWVQYXR0ZXJuU3BlZWQiLCJmaWxsSW4iLCJ1bml0cyIsInZhbHVlUGF0dGVybkFuZ2xlIiwic3BlZWRTdGFuZGFyZERldmlhdGlvbk51bWJlckNvbnRyb2wiLCJTUEVFRF9TVEFOREFSRF9ERVZJQVRJT05fUkFOR0UiLCJ2YWx1ZVBhdHRlcm4iLCJjb25zdHJhaW5WYWx1ZSIsInZhbHVlIiwicm91bmRUb0ludGVydmFsIiwiZGVsdGEiLCJsYXlvdXRGdW5jdGlvbiIsImNyZWF0ZUxheW91dEZ1bmN0aW9uNCIsImFycm93QnV0dG9uU3BhY2luZyIsImFuZ2xlU3RhbmRhcmREZXZpYXRpb25OdW1iZXJDb250cm9sIiwiQU5HTEVfU1RBTkRBUkRfREVWSUFUSU9OX1JBTkdFIiwiY2hlY2tib3hUaXRsZU9wdGlvbnMiLCJQQU5FTF9USVRMRV9PUFRJT05TIiwiY2hlY2tib3hPcHRpb25zIiwiYm94V2lkdGgiLCJyYXBpZEZpcmVNb2RlTGFiZWwiLCJMQUJFTF9URVhUX09QVElPTlMiLCJyYXBpZEZpcmVNb2RlQ2hlY2tib3giLCJjb250ZW50Iiwic3BhY2luZyIsImNvbnRyb2xzVmVydGljYWxTcGFjZSIsImNoaWxkcmVuIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJTdGF0c0NvbnRyb2xQYW5lbC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAyMiwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogQ29udHJvbCBwYW5lbCBmb3IgY2hvb3Npbmcgd2hpY2ggdmVjdG9ycyBhcmUgdmlzaWJsZS5cclxuICpcclxuICogQGF1dGhvciBBbmRyZWEgTGluKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXHJcbiAqIEBhdXRob3IgTWF0dGhldyBCbGFja21hbihQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxyXG4gKi9cclxuXHJcbmltcG9ydCBtZXJnZSBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvbWVyZ2UuanMnO1xyXG5pbXBvcnQgeyBUZXh0LCBWQm94LCBWU3RydXQgfSBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgUGFuZWwgZnJvbSAnLi4vLi4vLi4vLi4vc3VuL2pzL1BhbmVsLmpzJztcclxuaW1wb3J0IENoZWNrYm94IGZyb20gJy4uLy4uLy4uLy4uL3N1bi9qcy9DaGVja2JveC5qcyc7XHJcbmltcG9ydCBSYW5nZSBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvUmFuZ2UuanMnO1xyXG5pbXBvcnQgVGFuZGVtIGZyb20gJy4uLy4uLy4uLy4uL3RhbmRlbS9qcy9UYW5kZW0uanMnO1xyXG5pbXBvcnQgUHJvamVjdGlsZU1vdGlvbkNvbnN0YW50cyBmcm9tICcuLi8uLi9jb21tb24vUHJvamVjdGlsZU1vdGlvbkNvbnN0YW50cy5qcyc7XHJcbmltcG9ydCBQcm9qZWN0aWxlTW90aW9uU3RyaW5ncyBmcm9tICcuLi8uLi9Qcm9qZWN0aWxlTW90aW9uU3RyaW5ncy5qcyc7XHJcbmltcG9ydCBNYXRoU3ltYm9scyBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5LXBoZXQvanMvTWF0aFN5bWJvbHMuanMnO1xyXG5pbXBvcnQgRGltZW5zaW9uMiBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvRGltZW5zaW9uMi5qcyc7XHJcbmltcG9ydCBVdGlscyBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvVXRpbHMuanMnO1xyXG5pbXBvcnQgU3RyaW5nVXRpbHMgZnJvbSAnLi4vLi4vLi4vLi4vcGhldGNvbW1vbi9qcy91dGlsL1N0cmluZ1V0aWxzLmpzJztcclxuaW1wb3J0IEFycm93bGVzc051bWJlckNvbnRyb2wgZnJvbSAnLi4vLi4vY29tbW9uL3ZpZXcvQXJyb3dsZXNzTnVtYmVyQ29udHJvbC5qcyc7XHJcbmltcG9ydCBOdW1iZXJDb250cm9sIGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9OdW1iZXJDb250cm9sLmpzJztcclxuaW1wb3J0IHByb2plY3RpbGVNb3Rpb24gZnJvbSAnLi4vLi4vcHJvamVjdGlsZU1vdGlvbi5qcyc7XHJcblxyXG5jb25zdCBURVhUX0ZPTlQgPSBQcm9qZWN0aWxlTW90aW9uQ29uc3RhbnRzLlBBTkVMX0xBQkVMX09QVElPTlMuZm9udDtcclxuY29uc3QgUkVBRE9VVF9YX01BUkdJTiA9IFByb2plY3RpbGVNb3Rpb25Db25zdGFudHMuUklHSFRTSURFX1BBTkVMX09QVElPTlMucmVhZG91dFhNYXJnaW47XHJcbmNvbnN0IGRlZ3JlZXNTdHJpbmcgPSBNYXRoU3ltYm9scy5ERUdSRUVTO1xyXG5jb25zdCBtZXRlcnNQZXJTZWNvbmRTdHJpbmcgPSBQcm9qZWN0aWxlTW90aW9uU3RyaW5ncy5tZXRlcnNQZXJTZWNvbmQ7XHJcbmNvbnN0IGFuZ2xlU3RhbmRhcmREZXZpYXRpb25TdHJpbmcgPSBQcm9qZWN0aWxlTW90aW9uU3RyaW5ncy5hbmdsZVN0YW5kYXJkRGV2aWF0aW9uO1xyXG5jb25zdCBzcGVlZFN0YW5kYXJkRGV2aWF0aW9uU3RyaW5nID0gUHJvamVjdGlsZU1vdGlvblN0cmluZ3Muc3BlZWRTdGFuZGFyZERldmlhdGlvbjtcclxuY29uc3QgcGF0dGVybjBWYWx1ZTFVbml0c1N0cmluZyA9IFByb2plY3RpbGVNb3Rpb25TdHJpbmdzLnBhdHRlcm4wVmFsdWUxVW5pdHM7XHJcbmNvbnN0IHBhdHRlcm4wVmFsdWUxVW5pdHNXaXRoU3BhY2VTdHJpbmcgPSBQcm9qZWN0aWxlTW90aW9uU3RyaW5ncy5wYXR0ZXJuMFZhbHVlMVVuaXRzV2l0aFNwYWNlO1xyXG5cclxuY2xhc3MgU3RhdHNDb250cm9sUGFuZWwgZXh0ZW5kcyBQYW5lbCB7XHJcbiAgLyoqXHJcbiAgICogQHBhcmFtIHtOdW1iZXJQcm9wZXJ0eX0gZ3JvdXBTaXplUHJvcGVydHkgLSB0aGUgcHJvcGVydHkgZm9yIHRoZSBudW1iZXIgb2Ygc2ltdWx0YW5lb3VzbHkgbGF1bmNoZWQgcHJvamVjdGlsZXNcclxuICAgKiBAcGFyYW0ge051bWJlclByb3BlcnR5fSBpbml0aWFsU3BlZWRTdGFuZGFyZERldmlhdGlvblByb3BlcnR5XHJcbiAgICogQHBhcmFtIHtOdW1iZXJQcm9wZXJ0eX0gaW5pdGlhbEFuZ2xlU3RhbmRhcmREZXZpYXRpb25Qcm9wZXJ0eVxyXG4gICAqIEBwYXJhbSB7Qm9vbGVhblByb3BlcnR5fSByYXBpZEZpcmVNb2RlUHJvcGVydHlcclxuICAgKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnNdXHJcbiAgICovXHJcbiAgY29uc3RydWN0b3IoIGdyb3VwU2l6ZVByb3BlcnR5LCBpbml0aWFsU3BlZWRTdGFuZGFyZERldmlhdGlvblByb3BlcnR5LCBpbml0aWFsQW5nbGVTdGFuZGFyZERldmlhdGlvblByb3BlcnR5LCByYXBpZEZpcmVNb2RlUHJvcGVydHksIHZpZXdQcm9wZXJ0aWVzLCBvcHRpb25zICkge1xyXG4gICAgLy8gVGhlIGZpcnN0IG9iamVjdCBpcyBhIHBsYWNlaG9sZGVyIHNvIG5vbmUgb2YgdGhlIG90aGVycyBnZXQgbXV0YXRlZFxyXG4gICAgLy8gVGhlIHNlY29uZCBvYmplY3QgaXMgdGhlIGRlZmF1bHQsIGluIHRoZSBjb25zdGFudHMgZmlsZXNcclxuICAgIC8vIFRoZSB0aGlyZCBvYmplY3QgaXMgb3B0aW9ucyBzcGVjaWZpYyB0byB0aGlzIHBhbmVsLCB3aGljaCBvdmVycmlkZXMgdGhlIGRlZmF1bHRzXHJcbiAgICAvLyBUaGUgZm91cnRoIG9iamVjdCBpcyBvcHRpb25zIGdpdmVuIGF0IHRpbWUgb2YgY29uc3RydWN0aW9uLCB3aGljaCBvdmVycmlkZXMgYWxsIHRoZSBvdGhlcnNcclxuICAgIG9wdGlvbnMgPSBtZXJnZShcclxuICAgICAge30sXHJcbiAgICAgIFByb2plY3RpbGVNb3Rpb25Db25zdGFudHMuUklHSFRTSURFX1BBTkVMX09QVElPTlMsXHJcbiAgICAgIHtcclxuICAgICAgICBhbGlnbjogJ2xlZnQnLFxyXG4gICAgICAgIHRhbmRlbTogVGFuZGVtLlJFUVVJUkVEXHJcbiAgICAgIH0sXHJcbiAgICAgIG9wdGlvbnNcclxuICAgICk7XHJcblxyXG4gICAgLy8gY3JlYXRlIGdyb3VwIHNpemUgbnVtYmVyIGNvbnRyb2xcclxuICAgIGNvbnN0IGdyb3VwU2l6ZU51bWJlckNvbnRyb2wgPSBuZXcgQXJyb3dsZXNzTnVtYmVyQ29udHJvbChcclxuICAgICAgUHJvamVjdGlsZU1vdGlvblN0cmluZ3MucHJvamVjdGlsZUdyb3VwU2l6ZSwgJycsIGdyb3VwU2l6ZVByb3BlcnR5LFxyXG4gICAgICBuZXcgUmFuZ2UoIFByb2plY3RpbGVNb3Rpb25Db25zdGFudHMuR1JPVVBfU0laRV9JTkNSRU1FTlQsIFByb2plY3RpbGVNb3Rpb25Db25zdGFudHMuR1JPVVBfU0laRV9NQVggKSxcclxuICAgICAgUHJvamVjdGlsZU1vdGlvbkNvbnN0YW50cy5HUk9VUF9TSVpFX0lOQ1JFTUVOVCxcclxuICAgICAge1xyXG4gICAgICAgIGNvbnRhaW5lcldpZHRoOiBvcHRpb25zLm1pbldpZHRoLFxyXG4gICAgICAgIHhNYXJnaW46IG9wdGlvbnMueE1hcmdpbixcclxuICAgICAgICBudW1iZXJEaXNwbGF5TWF4V2lkdGg6IG9wdGlvbnMubnVtYmVyRGlzcGxheU1heFdpZHRoLFxyXG4gICAgICAgIHRhbmRlbTogb3B0aW9ucy50YW5kZW0uY3JlYXRlVGFuZGVtKCAnZ3JvdXBTaXplTnVtYmVyQ29udHJvbCcgKSxcclxuICAgICAgICBwaGV0aW9Eb2N1bWVudGF0aW9uOiAnVUkgY29udHJvbCB0byBhZGp1c3QgdGhlIG51bWJlciBvZiBzaW11bHRhbmVvdXNseSBsYXVuY2hlZCBwcm9qZWN0aWxlcydcclxuICAgICAgfVxyXG4gICAgKTtcclxuXHJcbiAgICAvL3N0YW5kYXJkIGRldmlhdGlvbiBzbGlkZXJzXHJcbiAgICBjb25zdCBkZWZhdWx0TnVtYmVyQ29udHJvbE9wdGlvbnMgPSB7XHJcbiAgICAgIG51bWJlckRpc3BsYXlPcHRpb25zOiB7XHJcbiAgICAgICAgYWxpZ246ICdyaWdodCcsXHJcbiAgICAgICAgbWF4V2lkdGg6IG9wdGlvbnMubnVtYmVyRGlzcGxheU1heFdpZHRoICsgb3B0aW9ucy5yZWFkb3V0WE1hcmdpbiAqIDIsXHJcbiAgICAgICAgeE1hcmdpbjogUkVBRE9VVF9YX01BUkdJTixcclxuICAgICAgICB5TWFyZ2luOiA0LFxyXG4gICAgICAgIHRleHRPcHRpb25zOiB7XHJcbiAgICAgICAgICBmb250OiBURVhUX0ZPTlRcclxuICAgICAgICB9XHJcbiAgICAgIH0sXHJcbiAgICAgIHRpdGxlTm9kZU9wdGlvbnM6IHtcclxuICAgICAgICBmb250OiBURVhUX0ZPTlQsXHJcbiAgICAgICAgbWF4V2lkdGg6IG9wdGlvbnMubWluV2lkdGggLSBvcHRpb25zLm51bWJlckRpc3BsYXlNYXhXaWR0aCAtIDMgKiBvcHRpb25zLnJlYWRvdXRYTWFyZ2luIC0gMiAqIG9wdGlvbnMueE1hcmdpblxyXG4gICAgICB9LFxyXG4gICAgICBzbGlkZXJPcHRpb25zOiB7XHJcbiAgICAgICAgdHJhY2tTaXplOiBuZXcgRGltZW5zaW9uMiggb3B0aW9ucy5taW5XaWR0aCAtIDIgKiBvcHRpb25zLnhNYXJnaW4gLSA4MCwgMC41ICksXHJcbiAgICAgICAgdGh1bWJTaXplOiBuZXcgRGltZW5zaW9uMiggMTMsIDIyICksXHJcbiAgICAgICAgdGh1bWJUb3VjaEFyZWFYRGlsYXRpb246IDYsXHJcbiAgICAgICAgdGh1bWJUb3VjaEFyZWFZRGlsYXRpb246IDRcclxuICAgICAgfSxcclxuICAgICAgYXJyb3dCdXR0b25PcHRpb25zOiB7XHJcbiAgICAgICAgc2NhbGU6IDAuNTYsXHJcbiAgICAgICAgdG91Y2hBcmVhWERpbGF0aW9uOiAyMCxcclxuICAgICAgICB0b3VjaEFyZWFZRGlsYXRpb246IDIwXHJcbiAgICAgIH1cclxuICAgIH07XHJcblxyXG4gICAgLy8gcmVzdWx0cyBpbiAne3t2YWx1ZX19IG0vcydcclxuICAgIGNvbnN0IHZhbHVlUGF0dGVyblNwZWVkID0gU3RyaW5nVXRpbHMuZmlsbEluKFxyXG4gICAgICBwYXR0ZXJuMFZhbHVlMVVuaXRzV2l0aFNwYWNlU3RyaW5nLFxyXG4gICAgICB7XHJcbiAgICAgICAgdW5pdHM6IG1ldGVyc1BlclNlY29uZFN0cmluZ1xyXG4gICAgICB9XHJcbiAgICApO1xyXG5cclxuICAgIC8vIHJlc3VsdHMgaW4gJ3t7dmFsdWV9fSBkZWdyZWVzJ1xyXG4gICAgY29uc3QgdmFsdWVQYXR0ZXJuQW5nbGUgPSBTdHJpbmdVdGlscy5maWxsSW4oXHJcbiAgICAgIHBhdHRlcm4wVmFsdWUxVW5pdHNTdHJpbmcsXHJcbiAgICAgIHtcclxuICAgICAgICB1bml0czogZGVncmVlc1N0cmluZ1xyXG4gICAgICB9XHJcbiAgICApO1xyXG5cclxuICAgIC8vIGNyZWF0ZSBzcGVlZCBzdGFuZGFyZCBkZXZpYXRpb24gbnVtYmVyIGNvbnRyb2xcclxuICAgIGNvbnN0IHNwZWVkU3RhbmRhcmREZXZpYXRpb25OdW1iZXJDb250cm9sID0gbmV3IE51bWJlckNvbnRyb2woXHJcbiAgICAgIHNwZWVkU3RhbmRhcmREZXZpYXRpb25TdHJpbmcsIGluaXRpYWxTcGVlZFN0YW5kYXJkRGV2aWF0aW9uUHJvcGVydHksXHJcbiAgICAgIFByb2plY3RpbGVNb3Rpb25Db25zdGFudHMuU1BFRURfU1RBTkRBUkRfREVWSUFUSU9OX1JBTkdFLFxyXG4gICAgICBtZXJnZSgge30sIGRlZmF1bHROdW1iZXJDb250cm9sT3B0aW9ucywge1xyXG4gICAgICAgIG51bWJlckRpc3BsYXlPcHRpb25zOiB7XHJcbiAgICAgICAgICB2YWx1ZVBhdHRlcm46IHZhbHVlUGF0dGVyblNwZWVkLFxyXG4gICAgICAgICAgeE1hcmdpbjogOCxcclxuICAgICAgICAgIHRleHRPcHRpb25zOiB7XHJcbiAgICAgICAgICAgIGZvbnQ6IFRFWFRfRk9OVFxyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgc2xpZGVyT3B0aW9uczoge1xyXG4gICAgICAgICAgY29uc3RyYWluVmFsdWU6IHZhbHVlID0+IFV0aWxzLnJvdW5kVG9JbnRlcnZhbCggdmFsdWUsIDEgKVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZGVsdGE6IDEsXHJcbiAgICAgICAgbGF5b3V0RnVuY3Rpb246IE51bWJlckNvbnRyb2wuY3JlYXRlTGF5b3V0RnVuY3Rpb240KCB7XHJcbiAgICAgICAgICBhcnJvd0J1dHRvblNwYWNpbmc6IDEwXHJcbiAgICAgICAgfSApLFxyXG4gICAgICAgIHRhbmRlbTogb3B0aW9ucy50YW5kZW0uY3JlYXRlVGFuZGVtKCAnc3BlZWRTdGFuZGFyZERldmlhdGlvbk51bWJlckNvbnRyb2wnICksXHJcbiAgICAgICAgcGhldGlvRG9jdW1lbnRhdGlvbjogJ1VJIGNvbnRyb2wgdG8gYWRqdXN0IHRoZSBzdGFuZGFyZCBkZXZpYXRpb24gb2YgdGhlIGxhdW5jaCBzcGVlZCdcclxuICAgICAgfSApXHJcbiAgICApO1xyXG5cclxuICAgIC8vIGNyZWF0ZSBhbmdsZSBzdGFuZGFyZCBkZXZpYXRpb24gbnVtYmVyIGNvbnRyb2xcclxuICAgIGNvbnN0IGFuZ2xlU3RhbmRhcmREZXZpYXRpb25OdW1iZXJDb250cm9sID0gbmV3IE51bWJlckNvbnRyb2woXHJcbiAgICAgIGFuZ2xlU3RhbmRhcmREZXZpYXRpb25TdHJpbmcsIGluaXRpYWxBbmdsZVN0YW5kYXJkRGV2aWF0aW9uUHJvcGVydHksXHJcbiAgICAgIFByb2plY3RpbGVNb3Rpb25Db25zdGFudHMuQU5HTEVfU1RBTkRBUkRfREVWSUFUSU9OX1JBTkdFLFxyXG4gICAgICBtZXJnZSgge30sIGRlZmF1bHROdW1iZXJDb250cm9sT3B0aW9ucywge1xyXG4gICAgICAgIG51bWJlckRpc3BsYXlPcHRpb25zOiB7XHJcbiAgICAgICAgICB2YWx1ZVBhdHRlcm46IHZhbHVlUGF0dGVybkFuZ2xlLFxyXG4gICAgICAgICAgeE1hcmdpbjogOCxcclxuICAgICAgICAgIHRleHRPcHRpb25zOiB7XHJcbiAgICAgICAgICAgIGZvbnQ6IFRFWFRfRk9OVFxyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgc2xpZGVyT3B0aW9uczoge1xyXG4gICAgICAgICAgY29uc3RyYWluVmFsdWU6IHZhbHVlID0+IFV0aWxzLnJvdW5kVG9JbnRlcnZhbCggdmFsdWUsIDEgKVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZGVsdGE6IDEsXHJcbiAgICAgICAgbGF5b3V0RnVuY3Rpb246IE51bWJlckNvbnRyb2wuY3JlYXRlTGF5b3V0RnVuY3Rpb240KCB7XHJcbiAgICAgICAgICBhcnJvd0J1dHRvblNwYWNpbmc6IDEwXHJcbiAgICAgICAgfSApLFxyXG4gICAgICAgIHRhbmRlbTogb3B0aW9ucy50YW5kZW0uY3JlYXRlVGFuZGVtKCAnYW5nbGVTdGFuZGFyZERldmlhdGlvbk51bWJlckNvbnRyb2wnICksXHJcbiAgICAgICAgcGhldGlvRG9jdW1lbnRhdGlvbjogJ1VJIGNvbnRyb2wgdG8gYWRqdXN0IHRoZSBzdGFuZGFyZCBkZXZpYXRpb24gb2YgdGhlIGxhdW5jaCBhbmdsZSdcclxuICAgICAgfSApXHJcbiAgICApO1xyXG5cclxuICAgIGNvbnN0IGNoZWNrYm94VGl0bGVPcHRpb25zID0gUHJvamVjdGlsZU1vdGlvbkNvbnN0YW50cy5QQU5FTF9USVRMRV9PUFRJT05TO1xyXG4gICAgY29uc3QgY2hlY2tib3hPcHRpb25zID0geyBtYXhXaWR0aDogY2hlY2tib3hUaXRsZU9wdGlvbnMubWF4V2lkdGgsIGJveFdpZHRoOiAxOCB9O1xyXG4gICAgY29uc3QgcmFwaWRGaXJlTW9kZUxhYmVsID0gbmV3IFRleHQoICdSYXBpZCBmaXJlJywgUHJvamVjdGlsZU1vdGlvbkNvbnN0YW50cy5MQUJFTF9URVhUX09QVElPTlMgKTtcclxuICAgIGNvbnN0IHJhcGlkRmlyZU1vZGVDaGVja2JveCA9IG5ldyBDaGVja2JveCggcmFwaWRGaXJlTW9kZVByb3BlcnR5LCByYXBpZEZpcmVNb2RlTGFiZWwsXHJcbiAgICAgIG1lcmdlKCB7IHRhbmRlbTogb3B0aW9ucy50YW5kZW0uY3JlYXRlVGFuZGVtKCAncmFwaWRGaXJlQ2hlY2tib3gnICkgfSwgY2hlY2tib3hPcHRpb25zIClcclxuICAgICk7XHJcblxyXG4gICAgLy8gVGhlIGNvbnRlbnRzIG9mIHRoZSBjb250cm9sIHBhbmVsXHJcbiAgICBjb25zdCBjb250ZW50ID0gbmV3IFZCb3goIHtcclxuICAgICAgYWxpZ246ICdsZWZ0JyxcclxuICAgICAgc3BhY2luZzogb3B0aW9ucy5jb250cm9sc1ZlcnRpY2FsU3BhY2UsXHJcbiAgICAgIGNoaWxkcmVuOiBbXHJcbiAgICAgICAgbmV3IFZCb3goIHtcclxuICAgICAgICAgIGFsaWduOiAnY2VudGVyJyxcclxuICAgICAgICAgIHNwYWNpbmc6IG9wdGlvbnMuY29udHJvbHNWZXJ0aWNhbFNwYWNlLFxyXG4gICAgICAgICAgY2hpbGRyZW46IFtcclxuICAgICAgICAgICAgZ3JvdXBTaXplTnVtYmVyQ29udHJvbCxcclxuICAgICAgICAgICAgbmV3IFZTdHJ1dCggMSApLFxyXG4gICAgICAgICAgICBzcGVlZFN0YW5kYXJkRGV2aWF0aW9uTnVtYmVyQ29udHJvbCxcclxuICAgICAgICAgICAgYW5nbGVTdGFuZGFyZERldmlhdGlvbk51bWJlckNvbnRyb2wsXHJcbiAgICAgICAgICAgIG5ldyBWU3RydXQoIDYgKVxyXG4gICAgICAgICAgXVxyXG4gICAgICAgIH0gKSxcclxuICAgICAgICBuZXcgVkJveCgge1xyXG4gICAgICAgICAgYWxpZ246ICdsZWZ0JyxcclxuICAgICAgICAgIHNwYWNpbmc6IG9wdGlvbnMuY29udHJvbHNWZXJ0aWNhbFNwYWNlLFxyXG4gICAgICAgICAgY2hpbGRyZW46IFsgcmFwaWRGaXJlTW9kZUNoZWNrYm94IF1cclxuICAgICAgICB9IClcclxuICAgICAgXVxyXG4gICAgfSApO1xyXG5cclxuICAgIHN1cGVyKCBjb250ZW50LCBvcHRpb25zICk7XHJcbiAgfVxyXG59XHJcblxyXG5wcm9qZWN0aWxlTW90aW9uLnJlZ2lzdGVyKCAnU3RhdHNDb250cm9sUGFuZWwnLCBTdGF0c0NvbnRyb2xQYW5lbCApO1xyXG5leHBvcnQgZGVmYXVsdCBTdGF0c0NvbnRyb2xQYW5lbDtcclxuIl0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsS0FBSyxNQUFNLG1DQUFtQztBQUNyRCxTQUFTQyxJQUFJLEVBQUVDLElBQUksRUFBRUMsTUFBTSxRQUFRLG1DQUFtQztBQUN0RSxPQUFPQyxLQUFLLE1BQU0sNkJBQTZCO0FBQy9DLE9BQU9DLFFBQVEsTUFBTSxnQ0FBZ0M7QUFDckQsT0FBT0MsS0FBSyxNQUFNLDZCQUE2QjtBQUMvQyxPQUFPQyxNQUFNLE1BQU0saUNBQWlDO0FBQ3BELE9BQU9DLHlCQUF5QixNQUFNLDJDQUEyQztBQUNqRixPQUFPQyx1QkFBdUIsTUFBTSxrQ0FBa0M7QUFDdEUsT0FBT0MsV0FBVyxNQUFNLDRDQUE0QztBQUNwRSxPQUFPQyxVQUFVLE1BQU0sa0NBQWtDO0FBQ3pELE9BQU9DLEtBQUssTUFBTSw2QkFBNkI7QUFDL0MsT0FBT0MsV0FBVyxNQUFNLCtDQUErQztB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