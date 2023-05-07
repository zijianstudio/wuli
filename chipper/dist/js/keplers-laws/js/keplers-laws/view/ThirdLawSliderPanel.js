// Copyright 2023, University of Colorado Boulder

/**
 * Slider that controls the main body mass for the Third Law.
 *
 * @author Agustín Vallejo
 */

import Panel from '../../../../sun/js/Panel.js';
import SolarSystemCommonNumberControl from '../../../../solar-system-common/js/view/SolarSystemCommonNumberControl.js';
import RangeWithValue from '../../../../dot/js/RangeWithValue.js';
import Dimension2 from '../../../../dot/js/Dimension2.js';
import SolarSystemCommonColors from '../../../../solar-system-common/js/SolarSystemCommonColors.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import { Text, VBox } from '../../../../scenery/js/imports.js';
import SolarSystemCommonConstants from '../../../../solar-system-common/js/SolarSystemCommonConstants.js';
import KeplersLawsStrings from '../../../../keplers-laws/js/KeplersLawsStrings.js';
import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import keplersLaws from '../../keplersLaws.js';

// constants
const SNAP_TOLERANCE = 0.05;
const THUMB_SIZE = new Dimension2(14, 24);
const NUM_TICKS = 4;
const WIDTH = 150;
const SPACING = (WIDTH - NUM_TICKS) / (NUM_TICKS - 1);
export default class ThirdLawSliderPanel extends Panel {
  constructor(model) {
    const colorProperty = SolarSystemCommonColors.firstBodyColorProperty;
    const defaultLabelValue = model.bodies[0].massProperty.value;
    const massRange = new RangeWithValue(defaultLabelValue / 2, 2 * defaultLabelValue, defaultLabelValue);
    const slider = new SolarSystemCommonNumberControl(model.bodies[0].massProperty, massRange, {
      sliderOptions: {
        constrainValue: mass => Math.abs(mass - defaultLabelValue) / defaultLabelValue < SNAP_TOLERANCE ? defaultLabelValue : mass,
        trackSize: new Dimension2(WIDTH, 1),
        thumbSize: THUMB_SIZE,
        thumbTouchAreaXDilation: THUMB_SIZE.width,
        thumbTouchAreaYDilation: THUMB_SIZE.height,
        trackStroke: SolarSystemCommonColors.foregroundProperty,
        // ticks
        tickLabelSpacing: 3,
        majorTickLength: 13,
        majorTickStroke: SolarSystemCommonColors.foregroundProperty,
        // custom thumb
        thumbFill: colorProperty,
        thumbFillHighlighted: new DerivedProperty([colorProperty], color => color.colorUtilsBrighter(0.7))
      },
      // snap to default value if close
      startCallback: () => {
        model.bodies[0].userControlledMassProperty.value = true;
      },
      endCallback: () => {
        model.bodies[0].userControlledMassProperty.value = false;
      }
      // tandem: tandem
    });

    super(new VBox({
      spacing: 10,
      children: [new Text(KeplersLawsStrings.starMassStringProperty, SolarSystemCommonConstants.TITLE_OPTIONS), slider]
    }), {
      fill: SolarSystemCommonColors.controlPanelFillProperty,
      stroke: null
    });

    // add ticks and labels
    // const defaultLabel = new Text( valueLabel, {
    const defaultLabel = new Text(KeplersLawsStrings.ourSunStringProperty, {
      top: 10,
      centerX: SPACING,
      font: new PhetFont(13),
      fill: SolarSystemCommonColors.foregroundProperty,
      maxWidth: 80
    });

    // create a label for the default value
    // @param - string for the label text
    const createNumberLabel = value => new Text(value, {
      font: new PhetFont(13),
      fill: SolarSystemCommonColors.foregroundProperty,
      maxWidth: 110
    });
    const labels = [createNumberLabel('0.5'), defaultLabel, createNumberLabel('1.5'), createNumberLabel('2.0')];
    for (let i = 0; i < labels.length; i++) {
      const tickValue = (i + 1) / labels.length * massRange.max;
      slider.slider.addMajorTick(tickValue, labels[i]);
    }
  }
}
keplersLaws.register('ThirdLawSliderPanel', ThirdLawSliderPanel);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJQYW5lbCIsIlNvbGFyU3lzdGVtQ29tbW9uTnVtYmVyQ29udHJvbCIsIlJhbmdlV2l0aFZhbHVlIiwiRGltZW5zaW9uMiIsIlNvbGFyU3lzdGVtQ29tbW9uQ29sb3JzIiwiUGhldEZvbnQiLCJUZXh0IiwiVkJveCIsIlNvbGFyU3lzdGVtQ29tbW9uQ29uc3RhbnRzIiwiS2VwbGVyc0xhd3NTdHJpbmdzIiwiRGVyaXZlZFByb3BlcnR5Iiwia2VwbGVyc0xhd3MiLCJTTkFQX1RPTEVSQU5DRSIsIlRIVU1CX1NJWkUiLCJOVU1fVElDS1MiLCJXSURUSCIsIlNQQUNJTkciLCJUaGlyZExhd1NsaWRlclBhbmVsIiwiY29uc3RydWN0b3IiLCJtb2RlbCIsImNvbG9yUHJvcGVydHkiLCJmaXJzdEJvZHlDb2xvclByb3BlcnR5IiwiZGVmYXVsdExhYmVsVmFsdWUiLCJib2RpZXMiLCJtYXNzUHJvcGVydHkiLCJ2YWx1ZSIsIm1hc3NSYW5nZSIsInNsaWRlciIsInNsaWRlck9wdGlvbnMiLCJjb25zdHJhaW5WYWx1ZSIsIm1hc3MiLCJNYXRoIiwiYWJzIiwidHJhY2tTaXplIiwidGh1bWJTaXplIiwidGh1bWJUb3VjaEFyZWFYRGlsYXRpb24iLCJ3aWR0aCIsInRodW1iVG91Y2hBcmVhWURpbGF0aW9uIiwiaGVpZ2h0IiwidHJhY2tTdHJva2UiLCJmb3JlZ3JvdW5kUHJvcGVydHkiLCJ0aWNrTGFiZWxTcGFjaW5nIiwibWFqb3JUaWNrTGVuZ3RoIiwibWFqb3JUaWNrU3Ryb2tlIiwidGh1bWJGaWxsIiwidGh1bWJGaWxsSGlnaGxpZ2h0ZWQiLCJjb2xvciIsImNvbG9yVXRpbHNCcmlnaHRlciIsInN0YXJ0Q2FsbGJhY2siLCJ1c2VyQ29udHJvbGxlZE1hc3NQcm9wZXJ0eSIsImVuZENhbGxiYWNrIiwic3BhY2luZyIsImNoaWxkcmVuIiwic3Rhck1hc3NTdHJpbmdQcm9wZXJ0eSIsIlRJVExFX09QVElPTlMiLCJmaWxsIiwiY29udHJvbFBhbmVsRmlsbFByb3BlcnR5Iiwic3Ryb2tlIiwiZGVmYXVsdExhYmVsIiwib3VyU3VuU3RyaW5nUHJvcGVydHkiLCJ0b3AiLCJjZW50ZXJYIiwiZm9udCIsIm1heFdpZHRoIiwiY3JlYXRlTnVtYmVyTGFiZWwiLCJsYWJlbHMiLCJpIiwibGVuZ3RoIiwidGlja1ZhbHVlIiwibWF4IiwiYWRkTWFqb3JUaWNrIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJUaGlyZExhd1NsaWRlclBhbmVsLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDIzLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBTbGlkZXIgdGhhdCBjb250cm9scyB0aGUgbWFpbiBib2R5IG1hc3MgZm9yIHRoZSBUaGlyZCBMYXcuXHJcbiAqXHJcbiAqIEBhdXRob3IgQWd1c3TDrW4gVmFsbGVqb1xyXG4gKi9cclxuXHJcbmltcG9ydCBQYW5lbCBmcm9tICcuLi8uLi8uLi8uLi9zdW4vanMvUGFuZWwuanMnO1xyXG5pbXBvcnQgS2VwbGVyc0xhd3NNb2RlbCBmcm9tICcuLi9tb2RlbC9LZXBsZXJzTGF3c01vZGVsLmpzJztcclxuaW1wb3J0IFNvbGFyU3lzdGVtQ29tbW9uTnVtYmVyQ29udHJvbCBmcm9tICcuLi8uLi8uLi8uLi9zb2xhci1zeXN0ZW0tY29tbW9uL2pzL3ZpZXcvU29sYXJTeXN0ZW1Db21tb25OdW1iZXJDb250cm9sLmpzJztcclxuaW1wb3J0IFJhbmdlV2l0aFZhbHVlIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9SYW5nZVdpdGhWYWx1ZS5qcyc7XHJcbmltcG9ydCBEaW1lbnNpb24yIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9EaW1lbnNpb24yLmpzJztcclxuaW1wb3J0IFNvbGFyU3lzdGVtQ29tbW9uQ29sb3JzIGZyb20gJy4uLy4uLy4uLy4uL3NvbGFyLXN5c3RlbS1jb21tb24vanMvU29sYXJTeXN0ZW1Db21tb25Db2xvcnMuanMnO1xyXG5pbXBvcnQgUGhldEZvbnQgZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS1waGV0L2pzL1BoZXRGb250LmpzJztcclxuaW1wb3J0IHsgVGV4dCwgVkJveCB9IGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvaW1wb3J0cy5qcyc7XHJcbmltcG9ydCBTb2xhclN5c3RlbUNvbW1vbkNvbnN0YW50cyBmcm9tICcuLi8uLi8uLi8uLi9zb2xhci1zeXN0ZW0tY29tbW9uL2pzL1NvbGFyU3lzdGVtQ29tbW9uQ29uc3RhbnRzLmpzJztcclxuaW1wb3J0IEtlcGxlcnNMYXdzU3RyaW5ncyBmcm9tICcuLi8uLi8uLi8uLi9rZXBsZXJzLWxhd3MvanMvS2VwbGVyc0xhd3NTdHJpbmdzLmpzJztcclxuaW1wb3J0IERlcml2ZWRQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL0Rlcml2ZWRQcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBrZXBsZXJzTGF3cyBmcm9tICcuLi8uLi9rZXBsZXJzTGF3cy5qcyc7XHJcblxyXG4vLyBjb25zdGFudHNcclxuY29uc3QgU05BUF9UT0xFUkFOQ0UgPSAwLjA1O1xyXG5jb25zdCBUSFVNQl9TSVpFID0gbmV3IERpbWVuc2lvbjIoIDE0LCAyNCApO1xyXG5jb25zdCBOVU1fVElDS1MgPSA0O1xyXG5jb25zdCBXSURUSCA9IDE1MDtcclxuY29uc3QgU1BBQ0lORyA9ICggV0lEVEggLSBOVU1fVElDS1MgKSAvICggTlVNX1RJQ0tTIC0gMSApO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgVGhpcmRMYXdTbGlkZXJQYW5lbCBleHRlbmRzIFBhbmVsIHtcclxuICBwdWJsaWMgY29uc3RydWN0b3IoIG1vZGVsOiBLZXBsZXJzTGF3c01vZGVsICkge1xyXG4gICAgY29uc3QgY29sb3JQcm9wZXJ0eSA9IFNvbGFyU3lzdGVtQ29tbW9uQ29sb3JzLmZpcnN0Qm9keUNvbG9yUHJvcGVydHk7XHJcbiAgICBjb25zdCBkZWZhdWx0TGFiZWxWYWx1ZSA9IG1vZGVsLmJvZGllc1sgMCBdLm1hc3NQcm9wZXJ0eS52YWx1ZTtcclxuICAgIGNvbnN0IG1hc3NSYW5nZSA9IG5ldyBSYW5nZVdpdGhWYWx1ZSggZGVmYXVsdExhYmVsVmFsdWUgLyAyLCAyICogZGVmYXVsdExhYmVsVmFsdWUsIGRlZmF1bHRMYWJlbFZhbHVlICk7XHJcbiAgICBjb25zdCBzbGlkZXIgPSBuZXcgU29sYXJTeXN0ZW1Db21tb25OdW1iZXJDb250cm9sKFxyXG4gICAgICBtb2RlbC5ib2RpZXNbIDAgXS5tYXNzUHJvcGVydHksXHJcbiAgICAgIG1hc3NSYW5nZSwge1xyXG4gICAgICAgIHNsaWRlck9wdGlvbnM6IHtcclxuICAgICAgICAgIGNvbnN0cmFpblZhbHVlOiAoIG1hc3M6IG51bWJlciApID0+IE1hdGguYWJzKCBtYXNzIC0gZGVmYXVsdExhYmVsVmFsdWUgKSAvIGRlZmF1bHRMYWJlbFZhbHVlIDwgU05BUF9UT0xFUkFOQ0UgPyBkZWZhdWx0TGFiZWxWYWx1ZSA6IG1hc3MsXHJcblxyXG4gICAgICAgICAgdHJhY2tTaXplOiBuZXcgRGltZW5zaW9uMiggV0lEVEgsIDEgKSxcclxuICAgICAgICAgIHRodW1iU2l6ZTogVEhVTUJfU0laRSxcclxuICAgICAgICAgIHRodW1iVG91Y2hBcmVhWERpbGF0aW9uOiBUSFVNQl9TSVpFLndpZHRoLFxyXG4gICAgICAgICAgdGh1bWJUb3VjaEFyZWFZRGlsYXRpb246IFRIVU1CX1NJWkUuaGVpZ2h0LFxyXG4gICAgICAgICAgdHJhY2tTdHJva2U6IFNvbGFyU3lzdGVtQ29tbW9uQ29sb3JzLmZvcmVncm91bmRQcm9wZXJ0eSxcclxuXHJcbiAgICAgICAgICAvLyB0aWNrc1xyXG4gICAgICAgICAgdGlja0xhYmVsU3BhY2luZzogMyxcclxuICAgICAgICAgIG1ham9yVGlja0xlbmd0aDogMTMsXHJcbiAgICAgICAgICBtYWpvclRpY2tTdHJva2U6IFNvbGFyU3lzdGVtQ29tbW9uQ29sb3JzLmZvcmVncm91bmRQcm9wZXJ0eSxcclxuXHJcbiAgICAgICAgICAvLyBjdXN0b20gdGh1bWJcclxuICAgICAgICAgIHRodW1iRmlsbDogY29sb3JQcm9wZXJ0eSxcclxuICAgICAgICAgIHRodW1iRmlsbEhpZ2hsaWdodGVkOiBuZXcgRGVyaXZlZFByb3BlcnR5KCBbIGNvbG9yUHJvcGVydHkgXSwgY29sb3IgPT4gY29sb3IuY29sb3JVdGlsc0JyaWdodGVyKCAwLjcgKSApXHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgLy8gc25hcCB0byBkZWZhdWx0IHZhbHVlIGlmIGNsb3NlXHJcbiAgICAgICAgc3RhcnRDYWxsYmFjazogKCkgPT4geyBtb2RlbC5ib2RpZXNbIDAgXS51c2VyQ29udHJvbGxlZE1hc3NQcm9wZXJ0eS52YWx1ZSA9IHRydWU7IH0sXHJcbiAgICAgICAgZW5kQ2FsbGJhY2s6ICgpID0+IHtcclxuICAgICAgICAgIG1vZGVsLmJvZGllc1sgMCBdLnVzZXJDb250cm9sbGVkTWFzc1Byb3BlcnR5LnZhbHVlID0gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vIHRhbmRlbTogdGFuZGVtXHJcbiAgICAgIH1cclxuICAgICk7XHJcbiAgICBzdXBlciggbmV3IFZCb3goIHtcclxuICAgICAgc3BhY2luZzogMTAsXHJcbiAgICAgIGNoaWxkcmVuOiBbXHJcbiAgICAgICAgbmV3IFRleHQoIEtlcGxlcnNMYXdzU3RyaW5ncy5zdGFyTWFzc1N0cmluZ1Byb3BlcnR5LCBTb2xhclN5c3RlbUNvbW1vbkNvbnN0YW50cy5USVRMRV9PUFRJT05TICksXHJcbiAgICAgICAgc2xpZGVyXHJcbiAgICAgIF1cclxuICAgIH0gKSwge1xyXG4gICAgICBmaWxsOiBTb2xhclN5c3RlbUNvbW1vbkNvbG9ycy5jb250cm9sUGFuZWxGaWxsUHJvcGVydHksXHJcbiAgICAgIHN0cm9rZTogbnVsbFxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIGFkZCB0aWNrcyBhbmQgbGFiZWxzXHJcbiAgICAvLyBjb25zdCBkZWZhdWx0TGFiZWwgPSBuZXcgVGV4dCggdmFsdWVMYWJlbCwge1xyXG4gICAgY29uc3QgZGVmYXVsdExhYmVsID0gbmV3IFRleHQoIEtlcGxlcnNMYXdzU3RyaW5ncy5vdXJTdW5TdHJpbmdQcm9wZXJ0eSwge1xyXG4gICAgICB0b3A6IDEwLFxyXG4gICAgICBjZW50ZXJYOiBTUEFDSU5HLFxyXG4gICAgICBmb250OiBuZXcgUGhldEZvbnQoIDEzICksXHJcbiAgICAgIGZpbGw6IFNvbGFyU3lzdGVtQ29tbW9uQ29sb3JzLmZvcmVncm91bmRQcm9wZXJ0eSxcclxuICAgICAgbWF4V2lkdGg6IDgwXHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gY3JlYXRlIGEgbGFiZWwgZm9yIHRoZSBkZWZhdWx0IHZhbHVlXHJcbiAgICAvLyBAcGFyYW0gLSBzdHJpbmcgZm9yIHRoZSBsYWJlbCB0ZXh0XHJcbiAgICBjb25zdCBjcmVhdGVOdW1iZXJMYWJlbCA9ICggdmFsdWU6IHN0cmluZyApID0+IG5ldyBUZXh0KCB2YWx1ZSwge1xyXG4gICAgICBmb250OiBuZXcgUGhldEZvbnQoIDEzICksXHJcbiAgICAgIGZpbGw6IFNvbGFyU3lzdGVtQ29tbW9uQ29sb3JzLmZvcmVncm91bmRQcm9wZXJ0eSxcclxuICAgICAgbWF4V2lkdGg6IDExMFxyXG4gICAgfSApO1xyXG5cclxuICAgIGNvbnN0IGxhYmVscyA9IFsgY3JlYXRlTnVtYmVyTGFiZWwoICcwLjUnICksIGRlZmF1bHRMYWJlbCwgY3JlYXRlTnVtYmVyTGFiZWwoICcxLjUnICksIGNyZWF0ZU51bWJlckxhYmVsKCAnMi4wJyApIF07XHJcbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCBsYWJlbHMubGVuZ3RoOyBpKysgKSB7XHJcbiAgICAgIGNvbnN0IHRpY2tWYWx1ZSA9ICggaSArIDEgKSAvIGxhYmVscy5sZW5ndGggKiBtYXNzUmFuZ2UubWF4O1xyXG4gICAgICBzbGlkZXIuc2xpZGVyLmFkZE1ham9yVGljayggdGlja1ZhbHVlLCBsYWJlbHNbIGkgXSApO1xyXG4gICAgfVxyXG4gIH1cclxufVxyXG5cclxua2VwbGVyc0xhd3MucmVnaXN0ZXIoICdUaGlyZExhd1NsaWRlclBhbmVsJywgVGhpcmRMYXdTbGlkZXJQYW5lbCApOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxLQUFLLE1BQU0sNkJBQTZCO0FBRS9DLE9BQU9DLDhCQUE4QixNQUFNLDJFQUEyRTtBQUN0SCxPQUFPQyxjQUFjLE1BQU0sc0NBQXNDO0FBQ2pFLE9BQU9DLFVBQVUsTUFBTSxrQ0FBa0M7QUFDekQsT0FBT0MsdUJBQXVCLE1BQU0sK0RBQStEO0FBQ25HLE9BQU9DLFFBQVEsTUFBTSx5Q0FBeUM7QUFDOUQsU0FBU0MsSUFBSSxFQUFFQyxJQUFJLFFBQVEsbUNBQW1DO0FBQzlELE9BQU9DLDBCQUEwQixNQUFNLGtFQUFrRTtBQUN6RyxPQUFPQyxrQkFBa0IsTUFBTSxtREFBbUQ7QUFDbEYsT0FBT0MsZUFBZSxNQUFNLHdDQUF3QztBQUNwRSxPQUFPQyxXQUFXLE1BQU0sc0JBQXNCOztBQUU5QztBQUNBLE1BQU1DLGNBQWMsR0FBRyxJQUFJO0FBQzNCLE1BQU1DLFVBQVUsR0FBRyxJQUFJVixVQUFVLENBQUUsRUFBRSxFQUFFLEVBQUcsQ0FBQztBQUMzQyxNQUFNVyxTQUFTLEdBQUcsQ0FBQztBQUNuQixNQUFNQyxLQUFLLEdBQUcsR0FBRztBQUNqQixNQUFNQyxPQUFPLEdBQUcsQ0FBRUQsS0FBSyxHQUFHRCxTQUFTLEtBQU9BLFNBQVMsR0FBRyxDQUFDLENBQUU7QUFFekQsZUFBZSxNQUFNRyxtQkFBbUIsU0FBU2pCLEtBQUssQ0FBQztFQUM5Q2tCLFdBQVdBLENBQUVDLEtBQXVCLEVBQUc7SUFDNUMsTUFBTUMsYUFBYSxHQUFHaEIsdUJBQXVCLENBQUNpQixzQkFBc0I7SUFDcEUsTUFBTUMsaUJBQWlCLEdBQUdILEtBQUssQ0FBQ0ksTUFBTSxDQUFFLENBQUMsQ0FBRSxDQUFDQyxZQUFZLENBQUNDLEtBQUs7SUFDOUQsTUFBTUMsU0FBUyxHQUFHLElBQUl4QixjQUFjLENBQUVvQixpQkFBaUIsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHQSxpQkFBaUIsRUFBRUEsaUJBQWtCLENBQUM7SUFDdkcsTUFBTUssTUFBTSxHQUFHLElBQUkxQiw4QkFBOEIsQ0FDL0NrQixLQUFLLENBQUNJLE1BQU0sQ0FBRSxDQUFDLENBQUUsQ0FBQ0MsWUFBWSxFQUM5QkUsU0FBUyxFQUFFO01BQ1RFLGFBQWEsRUFBRTtRQUNiQyxjQUFjLEVBQUlDLElBQVksSUFBTUMsSUFBSSxDQUFDQyxHQUFHLENBQUVGLElBQUksR0FBR1IsaUJBQWtCLENBQUMsR0FBR0EsaUJBQWlCLEdBQUdWLGNBQWMsR0FBR1UsaUJBQWlCLEdBQUdRLElBQUk7UUFFeElHLFNBQVMsRUFBRSxJQUFJOUIsVUFBVSxDQUFFWSxLQUFLLEVBQUUsQ0FBRSxDQUFDO1FBQ3JDbUIsU0FBUyxFQUFFckIsVUFBVTtRQUNyQnNCLHVCQUF1QixFQUFFdEIsVUFBVSxDQUFDdUIsS0FBSztRQUN6Q0MsdUJBQXVCLEVBQUV4QixVQUFVLENBQUN5QixNQUFNO1FBQzFDQyxXQUFXLEVBQUVuQyx1QkFBdUIsQ0FBQ29DLGtCQUFrQjtRQUV2RDtRQUNBQyxnQkFBZ0IsRUFBRSxDQUFDO1FBQ25CQyxlQUFlLEVBQUUsRUFBRTtRQUNuQkMsZUFBZSxFQUFFdkMsdUJBQXVCLENBQUNvQyxrQkFBa0I7UUFFM0Q7UUFDQUksU0FBUyxFQUFFeEIsYUFBYTtRQUN4QnlCLG9CQUFvQixFQUFFLElBQUluQyxlQUFlLENBQUUsQ0FBRVUsYUFBYSxDQUFFLEVBQUUwQixLQUFLLElBQUlBLEtBQUssQ0FBQ0Msa0JBQWtCLENBQUUsR0FBSSxDQUFFO01BQ3pHLENBQUM7TUFFRDtNQUNBQyxhQUFhLEVBQUVBLENBQUEsS0FBTTtRQUFFN0IsS0FBSyxDQUFDSSxNQUFNLENBQUUsQ0FBQyxDQUFFLENBQUMwQiwwQkFBMEIsQ0FBQ3hCLEtBQUssR0FBRyxJQUFJO01BQUUsQ0FBQztNQUNuRnlCLFdBQVcsRUFBRUEsQ0FBQSxLQUFNO1FBQ2pCL0IsS0FBSyxDQUFDSSxNQUFNLENBQUUsQ0FBQyxDQUFFLENBQUMwQiwwQkFBMEIsQ0FBQ3hCLEtBQUssR0FBRyxLQUFLO01BQzVEO01BQ0E7SUFDRixDQUNGLENBQUM7O0lBQ0QsS0FBSyxDQUFFLElBQUlsQixJQUFJLENBQUU7TUFDZjRDLE9BQU8sRUFBRSxFQUFFO01BQ1hDLFFBQVEsRUFBRSxDQUNSLElBQUk5QyxJQUFJLENBQUVHLGtCQUFrQixDQUFDNEMsc0JBQXNCLEVBQUU3QywwQkFBMEIsQ0FBQzhDLGFBQWMsQ0FBQyxFQUMvRjNCLE1BQU07SUFFVixDQUFFLENBQUMsRUFBRTtNQUNINEIsSUFBSSxFQUFFbkQsdUJBQXVCLENBQUNvRCx3QkFBd0I7TUFDdERDLE1BQU0sRUFBRTtJQUNWLENBQUUsQ0FBQzs7SUFFSDtJQUNBO0lBQ0EsTUFBTUMsWUFBWSxHQUFHLElBQUlwRCxJQUFJLENBQUVHLGtCQUFrQixDQUFDa0Qsb0JBQW9CLEVBQUU7TUFDdEVDLEdBQUcsRUFBRSxFQUFFO01BQ1BDLE9BQU8sRUFBRTdDLE9BQU87TUFDaEI4QyxJQUFJLEVBQUUsSUFBSXpELFFBQVEsQ0FBRSxFQUFHLENBQUM7TUFDeEJrRCxJQUFJLEVBQUVuRCx1QkFBdUIsQ0FBQ29DLGtCQUFrQjtNQUNoRHVCLFFBQVEsRUFBRTtJQUNaLENBQUUsQ0FBQzs7SUFFSDtJQUNBO0lBQ0EsTUFBTUMsaUJBQWlCLEdBQUt2QyxLQUFhLElBQU0sSUFBSW5CLElBQUksQ0FBRW1CLEtBQUssRUFBRTtNQUM5RHFDLElBQUksRUFBRSxJQUFJekQsUUFBUSxDQUFFLEVBQUcsQ0FBQztNQUN4QmtELElBQUksRUFBRW5ELHVCQUF1QixDQUFDb0Msa0JBQWtCO01BQ2hEdUIsUUFBUSxFQUFFO0lBQ1osQ0FBRSxDQUFDO0lBRUgsTUFBTUUsTUFBTSxHQUFHLENBQUVELGlCQUFpQixDQUFFLEtBQU0sQ0FBQyxFQUFFTixZQUFZLEVBQUVNLGlCQUFpQixDQUFFLEtBQU0sQ0FBQyxFQUFFQSxpQkFBaUIsQ0FBRSxLQUFNLENBQUMsQ0FBRTtJQUNuSCxLQUFNLElBQUlFLENBQUMsR0FBRyxDQUFDLEVBQUVBLENBQUMsR0FBR0QsTUFBTSxDQUFDRSxNQUFNLEVBQUVELENBQUMsRUFBRSxFQUFHO01BQ3hDLE1BQU1FLFNBQVMsR0FBRyxDQUFFRixDQUFDLEdBQUcsQ0FBQyxJQUFLRCxNQUFNLENBQUNFLE1BQU0sR0FBR3pDLFNBQVMsQ0FBQzJDLEdBQUc7TUFDM0QxQyxNQUFNLENBQUNBLE1BQU0sQ0FBQzJDLFlBQVksQ0FBRUYsU0FBUyxFQUFFSCxNQUFNLENBQUVDLENBQUMsQ0FBRyxDQUFDO0lBQ3REO0VBQ0Y7QUFDRjtBQUVBdkQsV0FBVyxDQUFDNEQsUUFBUSxDQUFFLHFCQUFxQixFQUFFdEQsbUJBQW9CLENBQUMifQ==