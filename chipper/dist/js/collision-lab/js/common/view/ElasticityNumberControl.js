// Copyright 2020-2022, University of Colorado Boulder

/**
 * ElasticityNumberControl is a NumberControl sub-type to display and allow the user to manipulate the elasticity
 * of all ball collisions in a system. It appears inside of control-panels on all screens.
 *
 * The ElasticityNumberControl is labeled with 'Inelastic' and 'Elastic' instead of the percentages as ticks. Some
 * screens use the enabledRangeProperty to disable perfectly inelastic collisions, while some screens use it to
 * only allow perfectly inelastic collisions.
 *
 * ElasticityNumberControls are created at the start of the sim and are never disposed.
 *
 * @author Brandon Li
 */

import Dimension2 from '../../../../dot/js/Dimension2.js';
import Utils from '../../../../dot/js/Utils.js';
import merge from '../../../../phet-core/js/merge.js';
import AssertUtils from '../../../../phetcommon/js/AssertUtils.js';
import StringUtils from '../../../../phetcommon/js/util/StringUtils.js';
import NumberControl from '../../../../scenery-phet/js/NumberControl.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import { Color, Text } from '../../../../scenery/js/imports.js';
import collisionLab from '../../collisionLab.js';
import CollisionLabStrings from '../../CollisionLabStrings.js';
import CollisionLabConstants from '../CollisionLabConstants.js';

// constants
const ELASTICITY_PERCENT_RANGE = CollisionLabConstants.ELASTICITY_PERCENT_RANGE;
const ELASTICITY_PERCENT_INTERVAL = CollisionLabConstants.ELASTICITY_PERCENT_INTERVAL;
class ElasticityNumberControl extends NumberControl {
  /**
   * @param {Property.<number>} elasticityPercentProperty
   * @param {Object} [options]
   */
  constructor(elasticityPercentProperty, options) {
    assert && AssertUtils.assertPropertyOf(elasticityPercentProperty, 'number');
    options = merge({
      // {Object} - passed to the tick Text instances.
      tickTextOptions: {
        font: new PhetFont(12),
        maxWidth: 45 // constrain width for i18n, determined empirically
      },

      // {number} - the height of the track of the Slider.
      trackHeight: 0.1,
      // superclass options
      layoutFunction: NumberControl.createLayoutFunction4(),
      includeArrowButtons: false,
      sliderOptions: {
        constrainValue: value => Utils.roundToInterval(value, ELASTICITY_PERCENT_INTERVAL),
        majorTickLength: 5,
        tickLabelSpacing: 10,
        thumbSize: new Dimension2(14, 24)
      },
      numberDisplayOptions: {
        valuePattern: StringUtils.fillIn(CollisionLabStrings.pattern.valueUnits, {
          units: CollisionLabStrings.units.percent
        }),
        textOptions: {
          font: CollisionLabConstants.DISPLAY_FONT,
          maxWidth: 90
        },
        backgroundStroke: Color.BLACK,
        backgroundLineWidth: 0.5
      },
      titleNodeOptions: {
        font: CollisionLabConstants.PANEL_TITLE_FONT,
        maxWidth: 90 // constrain width for i18n, determined empirically
      }
    }, options);

    //----------------------------------------------------------------------------------------

    assert && assert(!options.sliderOptions.majorTicks, 'ElasticityNumberControl sets majorTicks');
    assert && assert(!options.sliderOptions.trackSize, 'ElasticityNumberControl sets trackSize');

    // Create the 'Inelastic' and 'Elastic' tick labels.
    const inelasticLabel = new Text(CollisionLabStrings.inelastic, options.tickTextOptions);
    const elasticLabel = new Text(CollisionLabStrings.elastic, options.tickTextOptions);

    // Compute the width of the track to ensure the NumberControl fits in control-panels.
    const trackWidth = CollisionLabConstants.CONTROL_PANEL_CONTENT_WIDTH - (inelasticLabel.width + elasticLabel.width) / 2;

    // Set options that cannot be overridden.
    options.sliderOptions.trackSize = new Dimension2(trackWidth, options.trackHeight);
    options.sliderOptions.majorTicks = [{
      value: ELASTICITY_PERCENT_RANGE.min,
      label: inelasticLabel
    }, {
      value: ELASTICITY_PERCENT_RANGE.max,
      label: elasticLabel
    }];
    super(CollisionLabStrings.elasticity, elasticityPercentProperty, ELASTICITY_PERCENT_RANGE, options);
  }
}
collisionLab.register('ElasticityNumberControl', ElasticityNumberControl);
export default ElasticityNumberControl;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJEaW1lbnNpb24yIiwiVXRpbHMiLCJtZXJnZSIsIkFzc2VydFV0aWxzIiwiU3RyaW5nVXRpbHMiLCJOdW1iZXJDb250cm9sIiwiUGhldEZvbnQiLCJDb2xvciIsIlRleHQiLCJjb2xsaXNpb25MYWIiLCJDb2xsaXNpb25MYWJTdHJpbmdzIiwiQ29sbGlzaW9uTGFiQ29uc3RhbnRzIiwiRUxBU1RJQ0lUWV9QRVJDRU5UX1JBTkdFIiwiRUxBU1RJQ0lUWV9QRVJDRU5UX0lOVEVSVkFMIiwiRWxhc3RpY2l0eU51bWJlckNvbnRyb2wiLCJjb25zdHJ1Y3RvciIsImVsYXN0aWNpdHlQZXJjZW50UHJvcGVydHkiLCJvcHRpb25zIiwiYXNzZXJ0IiwiYXNzZXJ0UHJvcGVydHlPZiIsInRpY2tUZXh0T3B0aW9ucyIsImZvbnQiLCJtYXhXaWR0aCIsInRyYWNrSGVpZ2h0IiwibGF5b3V0RnVuY3Rpb24iLCJjcmVhdGVMYXlvdXRGdW5jdGlvbjQiLCJpbmNsdWRlQXJyb3dCdXR0b25zIiwic2xpZGVyT3B0aW9ucyIsImNvbnN0cmFpblZhbHVlIiwidmFsdWUiLCJyb3VuZFRvSW50ZXJ2YWwiLCJtYWpvclRpY2tMZW5ndGgiLCJ0aWNrTGFiZWxTcGFjaW5nIiwidGh1bWJTaXplIiwibnVtYmVyRGlzcGxheU9wdGlvbnMiLCJ2YWx1ZVBhdHRlcm4iLCJmaWxsSW4iLCJwYXR0ZXJuIiwidmFsdWVVbml0cyIsInVuaXRzIiwicGVyY2VudCIsInRleHRPcHRpb25zIiwiRElTUExBWV9GT05UIiwiYmFja2dyb3VuZFN0cm9rZSIsIkJMQUNLIiwiYmFja2dyb3VuZExpbmVXaWR0aCIsInRpdGxlTm9kZU9wdGlvbnMiLCJQQU5FTF9USVRMRV9GT05UIiwibWFqb3JUaWNrcyIsInRyYWNrU2l6ZSIsImluZWxhc3RpY0xhYmVsIiwiaW5lbGFzdGljIiwiZWxhc3RpY0xhYmVsIiwiZWxhc3RpYyIsInRyYWNrV2lkdGgiLCJDT05UUk9MX1BBTkVMX0NPTlRFTlRfV0lEVEgiLCJ3aWR0aCIsIm1pbiIsImxhYmVsIiwibWF4IiwiZWxhc3RpY2l0eSIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiRWxhc3RpY2l0eU51bWJlckNvbnRyb2wuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMjAtMjAyMiwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogRWxhc3RpY2l0eU51bWJlckNvbnRyb2wgaXMgYSBOdW1iZXJDb250cm9sIHN1Yi10eXBlIHRvIGRpc3BsYXkgYW5kIGFsbG93IHRoZSB1c2VyIHRvIG1hbmlwdWxhdGUgdGhlIGVsYXN0aWNpdHlcclxuICogb2YgYWxsIGJhbGwgY29sbGlzaW9ucyBpbiBhIHN5c3RlbS4gSXQgYXBwZWFycyBpbnNpZGUgb2YgY29udHJvbC1wYW5lbHMgb24gYWxsIHNjcmVlbnMuXHJcbiAqXHJcbiAqIFRoZSBFbGFzdGljaXR5TnVtYmVyQ29udHJvbCBpcyBsYWJlbGVkIHdpdGggJ0luZWxhc3RpYycgYW5kICdFbGFzdGljJyBpbnN0ZWFkIG9mIHRoZSBwZXJjZW50YWdlcyBhcyB0aWNrcy4gU29tZVxyXG4gKiBzY3JlZW5zIHVzZSB0aGUgZW5hYmxlZFJhbmdlUHJvcGVydHkgdG8gZGlzYWJsZSBwZXJmZWN0bHkgaW5lbGFzdGljIGNvbGxpc2lvbnMsIHdoaWxlIHNvbWUgc2NyZWVucyB1c2UgaXQgdG9cclxuICogb25seSBhbGxvdyBwZXJmZWN0bHkgaW5lbGFzdGljIGNvbGxpc2lvbnMuXHJcbiAqXHJcbiAqIEVsYXN0aWNpdHlOdW1iZXJDb250cm9scyBhcmUgY3JlYXRlZCBhdCB0aGUgc3RhcnQgb2YgdGhlIHNpbSBhbmQgYXJlIG5ldmVyIGRpc3Bvc2VkLlxyXG4gKlxyXG4gKiBAYXV0aG9yIEJyYW5kb24gTGlcclxuICovXHJcblxyXG5pbXBvcnQgRGltZW5zaW9uMiBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvRGltZW5zaW9uMi5qcyc7XHJcbmltcG9ydCBVdGlscyBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvVXRpbHMuanMnO1xyXG5pbXBvcnQgbWVyZ2UgZnJvbSAnLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL21lcmdlLmpzJztcclxuaW1wb3J0IEFzc2VydFV0aWxzIGZyb20gJy4uLy4uLy4uLy4uL3BoZXRjb21tb24vanMvQXNzZXJ0VXRpbHMuanMnO1xyXG5pbXBvcnQgU3RyaW5nVXRpbHMgZnJvbSAnLi4vLi4vLi4vLi4vcGhldGNvbW1vbi9qcy91dGlsL1N0cmluZ1V0aWxzLmpzJztcclxuaW1wb3J0IE51bWJlckNvbnRyb2wgZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS1waGV0L2pzL051bWJlckNvbnRyb2wuanMnO1xyXG5pbXBvcnQgUGhldEZvbnQgZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS1waGV0L2pzL1BoZXRGb250LmpzJztcclxuaW1wb3J0IHsgQ29sb3IsIFRleHQgfSBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgY29sbGlzaW9uTGFiIGZyb20gJy4uLy4uL2NvbGxpc2lvbkxhYi5qcyc7XHJcbmltcG9ydCBDb2xsaXNpb25MYWJTdHJpbmdzIGZyb20gJy4uLy4uL0NvbGxpc2lvbkxhYlN0cmluZ3MuanMnO1xyXG5pbXBvcnQgQ29sbGlzaW9uTGFiQ29uc3RhbnRzIGZyb20gJy4uL0NvbGxpc2lvbkxhYkNvbnN0YW50cy5qcyc7XHJcblxyXG4vLyBjb25zdGFudHNcclxuY29uc3QgRUxBU1RJQ0lUWV9QRVJDRU5UX1JBTkdFID0gQ29sbGlzaW9uTGFiQ29uc3RhbnRzLkVMQVNUSUNJVFlfUEVSQ0VOVF9SQU5HRTtcclxuY29uc3QgRUxBU1RJQ0lUWV9QRVJDRU5UX0lOVEVSVkFMID0gQ29sbGlzaW9uTGFiQ29uc3RhbnRzLkVMQVNUSUNJVFlfUEVSQ0VOVF9JTlRFUlZBTDtcclxuXHJcbmNsYXNzIEVsYXN0aWNpdHlOdW1iZXJDb250cm9sIGV4dGVuZHMgTnVtYmVyQ29udHJvbCB7XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwYXJhbSB7UHJvcGVydHkuPG51bWJlcj59IGVsYXN0aWNpdHlQZXJjZW50UHJvcGVydHlcclxuICAgKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnNdXHJcbiAgICovXHJcbiAgY29uc3RydWN0b3IoIGVsYXN0aWNpdHlQZXJjZW50UHJvcGVydHksIG9wdGlvbnMgKSB7XHJcbiAgICBhc3NlcnQgJiYgQXNzZXJ0VXRpbHMuYXNzZXJ0UHJvcGVydHlPZiggZWxhc3RpY2l0eVBlcmNlbnRQcm9wZXJ0eSwgJ251bWJlcicgKTtcclxuXHJcbiAgICBvcHRpb25zID0gbWVyZ2UoIHtcclxuXHJcbiAgICAgIC8vIHtPYmplY3R9IC0gcGFzc2VkIHRvIHRoZSB0aWNrIFRleHQgaW5zdGFuY2VzLlxyXG4gICAgICB0aWNrVGV4dE9wdGlvbnM6IHtcclxuICAgICAgICBmb250OiBuZXcgUGhldEZvbnQoIDEyICksXHJcbiAgICAgICAgbWF4V2lkdGg6IDQ1IC8vIGNvbnN0cmFpbiB3aWR0aCBmb3IgaTE4biwgZGV0ZXJtaW5lZCBlbXBpcmljYWxseVxyXG4gICAgICB9LFxyXG5cclxuICAgICAgLy8ge251bWJlcn0gLSB0aGUgaGVpZ2h0IG9mIHRoZSB0cmFjayBvZiB0aGUgU2xpZGVyLlxyXG4gICAgICB0cmFja0hlaWdodDogMC4xLFxyXG5cclxuICAgICAgLy8gc3VwZXJjbGFzcyBvcHRpb25zXHJcbiAgICAgIGxheW91dEZ1bmN0aW9uOiBOdW1iZXJDb250cm9sLmNyZWF0ZUxheW91dEZ1bmN0aW9uNCgpLFxyXG4gICAgICBpbmNsdWRlQXJyb3dCdXR0b25zOiBmYWxzZSxcclxuICAgICAgc2xpZGVyT3B0aW9uczoge1xyXG4gICAgICAgIGNvbnN0cmFpblZhbHVlOiB2YWx1ZSA9PiBVdGlscy5yb3VuZFRvSW50ZXJ2YWwoIHZhbHVlLCBFTEFTVElDSVRZX1BFUkNFTlRfSU5URVJWQUwgKSxcclxuICAgICAgICBtYWpvclRpY2tMZW5ndGg6IDUsXHJcbiAgICAgICAgdGlja0xhYmVsU3BhY2luZzogMTAsXHJcbiAgICAgICAgdGh1bWJTaXplOiBuZXcgRGltZW5zaW9uMiggMTQsIDI0IClcclxuICAgICAgfSxcclxuICAgICAgbnVtYmVyRGlzcGxheU9wdGlvbnM6IHtcclxuICAgICAgICB2YWx1ZVBhdHRlcm46IFN0cmluZ1V0aWxzLmZpbGxJbiggQ29sbGlzaW9uTGFiU3RyaW5ncy5wYXR0ZXJuLnZhbHVlVW5pdHMsIHtcclxuICAgICAgICAgIHVuaXRzOiBDb2xsaXNpb25MYWJTdHJpbmdzLnVuaXRzLnBlcmNlbnRcclxuICAgICAgICB9ICksXHJcbiAgICAgICAgdGV4dE9wdGlvbnM6IHsgZm9udDogQ29sbGlzaW9uTGFiQ29uc3RhbnRzLkRJU1BMQVlfRk9OVCwgbWF4V2lkdGg6IDkwIH0sXHJcbiAgICAgICAgYmFja2dyb3VuZFN0cm9rZTogQ29sb3IuQkxBQ0ssXHJcbiAgICAgICAgYmFja2dyb3VuZExpbmVXaWR0aDogMC41XHJcbiAgICAgIH0sXHJcbiAgICAgIHRpdGxlTm9kZU9wdGlvbnM6IHtcclxuICAgICAgICBmb250OiBDb2xsaXNpb25MYWJDb25zdGFudHMuUEFORUxfVElUTEVfRk9OVCxcclxuICAgICAgICBtYXhXaWR0aDogOTAgLy8gY29uc3RyYWluIHdpZHRoIGZvciBpMThuLCBkZXRlcm1pbmVkIGVtcGlyaWNhbGx5XHJcbiAgICAgIH1cclxuICAgIH0sIG9wdGlvbnMgKTtcclxuXHJcbiAgICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCAhb3B0aW9ucy5zbGlkZXJPcHRpb25zLm1ham9yVGlja3MsICdFbGFzdGljaXR5TnVtYmVyQ29udHJvbCBzZXRzIG1ham9yVGlja3MnICk7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCAhb3B0aW9ucy5zbGlkZXJPcHRpb25zLnRyYWNrU2l6ZSwgJ0VsYXN0aWNpdHlOdW1iZXJDb250cm9sIHNldHMgdHJhY2tTaXplJyApO1xyXG5cclxuICAgIC8vIENyZWF0ZSB0aGUgJ0luZWxhc3RpYycgYW5kICdFbGFzdGljJyB0aWNrIGxhYmVscy5cclxuICAgIGNvbnN0IGluZWxhc3RpY0xhYmVsID0gbmV3IFRleHQoIENvbGxpc2lvbkxhYlN0cmluZ3MuaW5lbGFzdGljLCBvcHRpb25zLnRpY2tUZXh0T3B0aW9ucyApO1xyXG4gICAgY29uc3QgZWxhc3RpY0xhYmVsID0gbmV3IFRleHQoIENvbGxpc2lvbkxhYlN0cmluZ3MuZWxhc3RpYywgb3B0aW9ucy50aWNrVGV4dE9wdGlvbnMgKTtcclxuXHJcbiAgICAvLyBDb21wdXRlIHRoZSB3aWR0aCBvZiB0aGUgdHJhY2sgdG8gZW5zdXJlIHRoZSBOdW1iZXJDb250cm9sIGZpdHMgaW4gY29udHJvbC1wYW5lbHMuXHJcbiAgICBjb25zdCB0cmFja1dpZHRoID0gQ29sbGlzaW9uTGFiQ29uc3RhbnRzLkNPTlRST0xfUEFORUxfQ09OVEVOVF9XSURUSFxyXG4gICAgICAgICAgICAgICAgICAgICAgIC0gKCBpbmVsYXN0aWNMYWJlbC53aWR0aCArIGVsYXN0aWNMYWJlbC53aWR0aCApIC8gMjtcclxuXHJcbiAgICAvLyBTZXQgb3B0aW9ucyB0aGF0IGNhbm5vdCBiZSBvdmVycmlkZGVuLlxyXG4gICAgb3B0aW9ucy5zbGlkZXJPcHRpb25zLnRyYWNrU2l6ZSA9IG5ldyBEaW1lbnNpb24yKCB0cmFja1dpZHRoLCBvcHRpb25zLnRyYWNrSGVpZ2h0ICk7XHJcbiAgICBvcHRpb25zLnNsaWRlck9wdGlvbnMubWFqb3JUaWNrcyA9IFtcclxuICAgICAgeyB2YWx1ZTogRUxBU1RJQ0lUWV9QRVJDRU5UX1JBTkdFLm1pbiwgbGFiZWw6IGluZWxhc3RpY0xhYmVsIH0sXHJcbiAgICAgIHsgdmFsdWU6IEVMQVNUSUNJVFlfUEVSQ0VOVF9SQU5HRS5tYXgsIGxhYmVsOiBlbGFzdGljTGFiZWwgfVxyXG4gICAgXTtcclxuXHJcbiAgICBzdXBlciggQ29sbGlzaW9uTGFiU3RyaW5ncy5lbGFzdGljaXR5LCBlbGFzdGljaXR5UGVyY2VudFByb3BlcnR5LCBFTEFTVElDSVRZX1BFUkNFTlRfUkFOR0UsIG9wdGlvbnMgKTtcclxuICB9XHJcbn1cclxuXHJcbmNvbGxpc2lvbkxhYi5yZWdpc3RlciggJ0VsYXN0aWNpdHlOdW1iZXJDb250cm9sJywgRWxhc3RpY2l0eU51bWJlckNvbnRyb2wgKTtcclxuZXhwb3J0IGRlZmF1bHQgRWxhc3RpY2l0eU51bWJlckNvbnRyb2w7XHJcbiJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLFVBQVUsTUFBTSxrQ0FBa0M7QUFDekQsT0FBT0MsS0FBSyxNQUFNLDZCQUE2QjtBQUMvQyxPQUFPQyxLQUFLLE1BQU0sbUNBQW1DO0FBQ3JELE9BQU9DLFdBQVcsTUFBTSwwQ0FBMEM7QUFDbEUsT0FBT0MsV0FBVyxNQUFNLCtDQUErQztBQUN2RSxPQUFPQyxhQUFhLE1BQU0sOENBQThDO0FBQ3hFLE9BQU9DLFFBQVEsTUFBTSx5Q0FBeUM7QUFDOUQsU0FBU0MsS0FBSyxFQUFFQyxJQUFJLFFBQVEsbUNBQW1DO0FBQy9ELE9BQU9DLFlBQVksTUFBTSx1QkFBdUI7QUFDaEQsT0FBT0MsbUJBQW1CLE1BQU0sOEJBQThCO0FBQzlELE9BQU9DLHFCQUFxQixNQUFNLDZCQUE2Qjs7QUFFL0Q7QUFDQSxNQUFNQyx3QkFBd0IsR0FBR0QscUJBQXFCLENBQUNDLHdCQUF3QjtBQUMvRSxNQUFNQywyQkFBMkIsR0FBR0YscUJBQXFCLENBQUNFLDJCQUEyQjtBQUVyRixNQUFNQyx1QkFBdUIsU0FBU1QsYUFBYSxDQUFDO0VBRWxEO0FBQ0Y7QUFDQTtBQUNBO0VBQ0VVLFdBQVdBLENBQUVDLHlCQUF5QixFQUFFQyxPQUFPLEVBQUc7SUFDaERDLE1BQU0sSUFBSWYsV0FBVyxDQUFDZ0IsZ0JBQWdCLENBQUVILHlCQUF5QixF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