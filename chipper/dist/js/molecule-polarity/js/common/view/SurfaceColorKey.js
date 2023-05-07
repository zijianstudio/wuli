// Copyright 2014-2022, University of Colorado Boulder

/**
 * Key for a surface's color scheme. This legend is a rectangular box with a gradient fill that matches the surface
 * in the Molecule. Each label is a unit for a color.
 * Uses static factory methods to supply the needed instances for the sim.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import Dimension2 from '../../../../dot/js/Dimension2.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import { LinearGradient, Node, Rectangle, Text } from '../../../../scenery/js/imports.js';
import moleculePolarity from '../../moleculePolarity.js';
import MoleculePolarityStrings from '../../MoleculePolarityStrings.js';
import MPColors from '../MPColors.js';
import optionize, { combineOptions } from '../../../../phet-core/js/optionize.js';
export default class SurfaceColorKey extends Node {
  constructor(colors, titleStringProperty, leftLabelStringProperty, rightLabelStringProperty, providedOptions) {
    const options = optionize()({
      // SelfOptions
      size: new Dimension2(420, 20),
      titleVisible: true,
      titleFont: new PhetFont({
        size: 16,
        weight: 'bold'
      }),
      rangeFont: new PhetFont(16),
      xMargin: 0,
      ySpacing: 2,
      // NodeOptions
      visiblePropertyOptions: {
        phetioReadOnly: true
      }
    }, providedOptions);
    super();

    // gradient rectangle
    const gradient = new LinearGradient(0, 0, options.size.width, options.size.height);
    for (let i = 0; i < colors.length; i++) {
      // colors are ordered negative to positive, so apply in reverse order
      const color = colors[colors.length - i - 1];
      gradient.addColorStop(i / (colors.length - 1), color);
    }
    const spectrumNode = new Rectangle(0, 0, options.size.width, options.size.height, {
      fill: gradient,
      stroke: 'black'
    });

    // title
    const titleText = new Text(titleStringProperty, {
      fill: 'black',
      font: options.titleFont,
      maxWidth: 0.5 * options.size.width,
      // i18n, determined empirically
      tandem: options.tandem.createTandem('titleText')
    });

    // range labels
    const labelOptions = {
      fill: 'black',
      font: options.rangeFont,
      maxWidth: 0.2 * options.size.width // i18n, determined empirically
    };

    const leftLabelText = new Text(leftLabelStringProperty, combineOptions({}, labelOptions, {
      tandem: options.tandem.createTandem('leftLabelText')
    }));
    const rightLabelText = new Text(rightLabelStringProperty, combineOptions({}, labelOptions, {
      tandem: options.tandem.createTandem('rightLabelText')
    }));

    // rendering order
    this.addChild(spectrumNode);
    this.addChild(leftLabelText);
    this.addChild(rightLabelText);
    if (options.titleVisible) {
      this.addChild(titleText);
    }

    // layout
    const top = spectrumNode.bottom + options.ySpacing;
    titleText.boundsProperty.link(() => {
      titleText.centerX = spectrumNode.centerX;
      titleText.top = top;
    });
    leftLabelText.boundsProperty.link(() => {
      leftLabelText.left = spectrumNode.left + options.xMargin;
      leftLabelText.top = top;
    });
    rightLabelText.boundsProperty.link(() => {
      rightLabelText.right = spectrumNode.right - options.xMargin;
      rightLabelText.top = top;
    });
    this.mutate(options);
  }

  /**
   * Creates the color key for black-&-white gradient.
   */
  static createElectronDensityColorKey(options) {
    return new SurfaceColorKey(MPColors.BW_GRADIENT, MoleculePolarityStrings.electronDensityStringProperty, MoleculePolarityStrings.lessStringProperty, MoleculePolarityStrings.moreStringProperty, options);
  }

  /**
   * Creates the color key for RWB (red-white-blue) gradient.
   */
  static createElectrostaticPotentialRWBColorKey(options) {
    return new SurfaceColorKey(MPColors.RWB_GRADIENT, MoleculePolarityStrings.electrostaticPotentialStringProperty, MoleculePolarityStrings.positiveStringProperty, MoleculePolarityStrings.negativeStringProperty, options);
  }

  /**
   * Creates the color key for ROYGB gradient.
   */
  static createElectrostaticPotentialROYGBColorKey(options) {
    return new SurfaceColorKey(MPColors.ROYGB_GRADIENT, MoleculePolarityStrings.electrostaticPotentialStringProperty, MoleculePolarityStrings.positiveStringProperty, MoleculePolarityStrings.negativeStringProperty, options);
  }
}
moleculePolarity.register('SurfaceColorKey', SurfaceColorKey);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJEaW1lbnNpb24yIiwiUGhldEZvbnQiLCJMaW5lYXJHcmFkaWVudCIsIk5vZGUiLCJSZWN0YW5nbGUiLCJUZXh0IiwibW9sZWN1bGVQb2xhcml0eSIsIk1vbGVjdWxlUG9sYXJpdHlTdHJpbmdzIiwiTVBDb2xvcnMiLCJvcHRpb25pemUiLCJjb21iaW5lT3B0aW9ucyIsIlN1cmZhY2VDb2xvcktleSIsImNvbnN0cnVjdG9yIiwiY29sb3JzIiwidGl0bGVTdHJpbmdQcm9wZXJ0eSIsImxlZnRMYWJlbFN0cmluZ1Byb3BlcnR5IiwicmlnaHRMYWJlbFN0cmluZ1Byb3BlcnR5IiwicHJvdmlkZWRPcHRpb25zIiwib3B0aW9ucyIsInNpemUiLCJ0aXRsZVZpc2libGUiLCJ0aXRsZUZvbnQiLCJ3ZWlnaHQiLCJyYW5nZUZvbnQiLCJ4TWFyZ2luIiwieVNwYWNpbmciLCJ2aXNpYmxlUHJvcGVydHlPcHRpb25zIiwicGhldGlvUmVhZE9ubHkiLCJncmFkaWVudCIsIndpZHRoIiwiaGVpZ2h0IiwiaSIsImxlbmd0aCIsImNvbG9yIiwiYWRkQ29sb3JTdG9wIiwic3BlY3RydW1Ob2RlIiwiZmlsbCIsInN0cm9rZSIsInRpdGxlVGV4dCIsImZvbnQiLCJtYXhXaWR0aCIsInRhbmRlbSIsImNyZWF0ZVRhbmRlbSIsImxhYmVsT3B0aW9ucyIsImxlZnRMYWJlbFRleHQiLCJyaWdodExhYmVsVGV4dCIsImFkZENoaWxkIiwidG9wIiwiYm90dG9tIiwiYm91bmRzUHJvcGVydHkiLCJsaW5rIiwiY2VudGVyWCIsImxlZnQiLCJyaWdodCIsIm11dGF0ZSIsImNyZWF0ZUVsZWN0cm9uRGVuc2l0eUNvbG9yS2V5IiwiQldfR1JBRElFTlQiLCJlbGVjdHJvbkRlbnNpdHlTdHJpbmdQcm9wZXJ0eSIsImxlc3NTdHJpbmdQcm9wZXJ0eSIsIm1vcmVTdHJpbmdQcm9wZXJ0eSIsImNyZWF0ZUVsZWN0cm9zdGF0aWNQb3RlbnRpYWxSV0JDb2xvcktleSIsIlJXQl9HUkFESUVOVCIsImVsZWN0cm9zdGF0aWNQb3RlbnRpYWxTdHJpbmdQcm9wZXJ0eSIsInBvc2l0aXZlU3RyaW5nUHJvcGVydHkiLCJuZWdhdGl2ZVN0cmluZ1Byb3BlcnR5IiwiY3JlYXRlRWxlY3Ryb3N0YXRpY1BvdGVudGlhbFJPWUdCQ29sb3JLZXkiLCJST1lHQl9HUkFESUVOVCIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiU3VyZmFjZUNvbG9yS2V5LnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE0LTIwMjIsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIEtleSBmb3IgYSBzdXJmYWNlJ3MgY29sb3Igc2NoZW1lLiBUaGlzIGxlZ2VuZCBpcyBhIHJlY3Rhbmd1bGFyIGJveCB3aXRoIGEgZ3JhZGllbnQgZmlsbCB0aGF0IG1hdGNoZXMgdGhlIHN1cmZhY2VcclxuICogaW4gdGhlIE1vbGVjdWxlLiBFYWNoIGxhYmVsIGlzIGEgdW5pdCBmb3IgYSBjb2xvci5cclxuICogVXNlcyBzdGF0aWMgZmFjdG9yeSBtZXRob2RzIHRvIHN1cHBseSB0aGUgbmVlZGVkIGluc3RhbmNlcyBmb3IgdGhlIHNpbS5cclxuICpcclxuICogQGF1dGhvciBDaHJpcyBNYWxsZXkgKFBpeGVsWm9vbSwgSW5jLilcclxuICovXHJcblxyXG5pbXBvcnQgRGltZW5zaW9uMiBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvRGltZW5zaW9uMi5qcyc7XHJcbmltcG9ydCBQaGV0Rm9udCBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5LXBoZXQvanMvUGhldEZvbnQuanMnO1xyXG5pbXBvcnQgeyBGb250LCBMaW5lYXJHcmFkaWVudCwgTm9kZSwgTm9kZU9wdGlvbnMsIFJlY3RhbmdsZSwgVENvbG9yLCBUZXh0LCBUZXh0T3B0aW9ucyB9IGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvaW1wb3J0cy5qcyc7XHJcbmltcG9ydCBtb2xlY3VsZVBvbGFyaXR5IGZyb20gJy4uLy4uL21vbGVjdWxlUG9sYXJpdHkuanMnO1xyXG5pbXBvcnQgTW9sZWN1bGVQb2xhcml0eVN0cmluZ3MgZnJvbSAnLi4vLi4vTW9sZWN1bGVQb2xhcml0eVN0cmluZ3MuanMnO1xyXG5pbXBvcnQgTVBDb2xvcnMgZnJvbSAnLi4vTVBDb2xvcnMuanMnO1xyXG5pbXBvcnQgUGlja1JlcXVpcmVkIGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy90eXBlcy9QaWNrUmVxdWlyZWQuanMnO1xyXG5pbXBvcnQgb3B0aW9uaXplLCB7IGNvbWJpbmVPcHRpb25zIH0gZnJvbSAnLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL29wdGlvbml6ZS5qcyc7XHJcbmltcG9ydCBUUmVhZE9ubHlQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL1RSZWFkT25seVByb3BlcnR5LmpzJztcclxuXHJcbnR5cGUgU2VsZk9wdGlvbnMgPSB7XHJcbiAgc2l6ZT86IERpbWVuc2lvbjI7XHJcbiAgdGl0bGVWaXNpYmxlPzogYm9vbGVhbjtcclxuICB0aXRsZUZvbnQ/OiBGb250O1xyXG4gIHJhbmdlRm9udD86IEZvbnQ7XHJcbiAgeE1hcmdpbj86IG51bWJlcjtcclxuICB5U3BhY2luZz86IG51bWJlcjtcclxufTtcclxuXHJcbnR5cGUgU3VyZmFjZUNvbG9yS2V5T3B0aW9ucyA9IFNlbGZPcHRpb25zICYgUGlja1JlcXVpcmVkPE5vZGVPcHRpb25zLCAndGFuZGVtJz47XHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBTdXJmYWNlQ29sb3JLZXkgZXh0ZW5kcyBOb2RlIHtcclxuXHJcbiAgcHVibGljIGNvbnN0cnVjdG9yKCBjb2xvcnM6IFRDb2xvcltdLFxyXG4gICAgICAgICAgICAgICAgICAgICAgdGl0bGVTdHJpbmdQcm9wZXJ0eTogVFJlYWRPbmx5UHJvcGVydHk8c3RyaW5nPixcclxuICAgICAgICAgICAgICAgICAgICAgIGxlZnRMYWJlbFN0cmluZ1Byb3BlcnR5OiBUUmVhZE9ubHlQcm9wZXJ0eTxzdHJpbmc+LFxyXG4gICAgICAgICAgICAgICAgICAgICAgcmlnaHRMYWJlbFN0cmluZ1Byb3BlcnR5OiBUUmVhZE9ubHlQcm9wZXJ0eTxzdHJpbmc+LFxyXG4gICAgICAgICAgICAgICAgICAgICAgcHJvdmlkZWRPcHRpb25zOiBTdXJmYWNlQ29sb3JLZXlPcHRpb25zICkge1xyXG5cclxuICAgIGNvbnN0IG9wdGlvbnMgPSBvcHRpb25pemU8U3VyZmFjZUNvbG9yS2V5T3B0aW9ucywgU2VsZk9wdGlvbnMsIE5vZGVPcHRpb25zPigpKCB7XHJcblxyXG4gICAgICAvLyBTZWxmT3B0aW9uc1xyXG4gICAgICBzaXplOiBuZXcgRGltZW5zaW9uMiggNDIwLCAyMCApLFxyXG4gICAgICB0aXRsZVZpc2libGU6IHRydWUsXHJcbiAgICAgIHRpdGxlRm9udDogbmV3IFBoZXRGb250KCB7IHNpemU6IDE2LCB3ZWlnaHQ6ICdib2xkJyB9ICksXHJcbiAgICAgIHJhbmdlRm9udDogbmV3IFBoZXRGb250KCAxNiApLFxyXG4gICAgICB4TWFyZ2luOiAwLFxyXG4gICAgICB5U3BhY2luZzogMixcclxuXHJcbiAgICAgIC8vIE5vZGVPcHRpb25zXHJcbiAgICAgIHZpc2libGVQcm9wZXJ0eU9wdGlvbnM6IHsgcGhldGlvUmVhZE9ubHk6IHRydWUgfVxyXG4gICAgfSwgcHJvdmlkZWRPcHRpb25zICk7XHJcblxyXG4gICAgc3VwZXIoKTtcclxuXHJcbiAgICAvLyBncmFkaWVudCByZWN0YW5nbGVcclxuICAgIGNvbnN0IGdyYWRpZW50ID0gbmV3IExpbmVhckdyYWRpZW50KCAwLCAwLCBvcHRpb25zLnNpemUud2lkdGgsIG9wdGlvbnMuc2l6ZS5oZWlnaHQgKTtcclxuXHJcbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCBjb2xvcnMubGVuZ3RoOyBpKysgKSB7XHJcblxyXG4gICAgICAvLyBjb2xvcnMgYXJlIG9yZGVyZWQgbmVnYXRpdmUgdG8gcG9zaXRpdmUsIHNvIGFwcGx5IGluIHJldmVyc2Ugb3JkZXJcclxuICAgICAgY29uc3QgY29sb3IgPSBjb2xvcnNbIGNvbG9ycy5sZW5ndGggLSBpIC0gMSBdO1xyXG4gICAgICBncmFkaWVudC5hZGRDb2xvclN0b3AoIGkgLyAoIGNvbG9ycy5sZW5ndGggLSAxICksIGNvbG9yICk7XHJcbiAgICB9XHJcbiAgICBjb25zdCBzcGVjdHJ1bU5vZGUgPSBuZXcgUmVjdGFuZ2xlKCAwLCAwLCBvcHRpb25zLnNpemUud2lkdGgsIG9wdGlvbnMuc2l6ZS5oZWlnaHQsIHtcclxuICAgICAgZmlsbDogZ3JhZGllbnQsXHJcbiAgICAgIHN0cm9rZTogJ2JsYWNrJ1xyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIHRpdGxlXHJcbiAgICBjb25zdCB0aXRsZVRleHQgPSBuZXcgVGV4dCggdGl0bGVTdHJpbmdQcm9wZXJ0eSwge1xyXG4gICAgICBmaWxsOiAnYmxhY2snLFxyXG4gICAgICBmb250OiBvcHRpb25zLnRpdGxlRm9udCxcclxuICAgICAgbWF4V2lkdGg6IDAuNSAqIG9wdGlvbnMuc2l6ZS53aWR0aCwgLy8gaTE4biwgZGV0ZXJtaW5lZCBlbXBpcmljYWxseVxyXG4gICAgICB0YW5kZW06IG9wdGlvbnMudGFuZGVtLmNyZWF0ZVRhbmRlbSggJ3RpdGxlVGV4dCcgKVxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIHJhbmdlIGxhYmVsc1xyXG4gICAgY29uc3QgbGFiZWxPcHRpb25zID0ge1xyXG4gICAgICBmaWxsOiAnYmxhY2snLFxyXG4gICAgICBmb250OiBvcHRpb25zLnJhbmdlRm9udCxcclxuICAgICAgbWF4V2lkdGg6IDAuMiAqIG9wdGlvbnMuc2l6ZS53aWR0aCAvLyBpMThuLCBkZXRlcm1pbmVkIGVtcGlyaWNhbGx5XHJcbiAgICB9O1xyXG4gICAgY29uc3QgbGVmdExhYmVsVGV4dCA9IG5ldyBUZXh0KCBsZWZ0TGFiZWxTdHJpbmdQcm9wZXJ0eSwgY29tYmluZU9wdGlvbnM8VGV4dE9wdGlvbnM+KCB7fSwgbGFiZWxPcHRpb25zLCB7XHJcbiAgICAgIHRhbmRlbTogb3B0aW9ucy50YW5kZW0uY3JlYXRlVGFuZGVtKCAnbGVmdExhYmVsVGV4dCcgKVxyXG4gICAgfSApICk7XHJcbiAgICBjb25zdCByaWdodExhYmVsVGV4dCA9IG5ldyBUZXh0KCByaWdodExhYmVsU3RyaW5nUHJvcGVydHksIGNvbWJpbmVPcHRpb25zPFRleHRPcHRpb25zPigge30sIGxhYmVsT3B0aW9ucywge1xyXG4gICAgICB0YW5kZW06IG9wdGlvbnMudGFuZGVtLmNyZWF0ZVRhbmRlbSggJ3JpZ2h0TGFiZWxUZXh0JyApXHJcbiAgICB9ICkgKTtcclxuXHJcbiAgICAvLyByZW5kZXJpbmcgb3JkZXJcclxuICAgIHRoaXMuYWRkQ2hpbGQoIHNwZWN0cnVtTm9kZSApO1xyXG4gICAgdGhpcy5hZGRDaGlsZCggbGVmdExhYmVsVGV4dCApO1xyXG4gICAgdGhpcy5hZGRDaGlsZCggcmlnaHRMYWJlbFRleHQgKTtcclxuICAgIGlmICggb3B0aW9ucy50aXRsZVZpc2libGUgKSB7XHJcbiAgICAgIHRoaXMuYWRkQ2hpbGQoIHRpdGxlVGV4dCApO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIGxheW91dFxyXG4gICAgY29uc3QgdG9wID0gc3BlY3RydW1Ob2RlLmJvdHRvbSArIG9wdGlvbnMueVNwYWNpbmc7XHJcbiAgICB0aXRsZVRleHQuYm91bmRzUHJvcGVydHkubGluayggKCkgPT4ge1xyXG4gICAgICB0aXRsZVRleHQuY2VudGVyWCA9IHNwZWN0cnVtTm9kZS5jZW50ZXJYO1xyXG4gICAgICB0aXRsZVRleHQudG9wID0gdG9wO1xyXG4gICAgfSApO1xyXG4gICAgbGVmdExhYmVsVGV4dC5ib3VuZHNQcm9wZXJ0eS5saW5rKCAoKSA9PiB7XHJcbiAgICAgIGxlZnRMYWJlbFRleHQubGVmdCA9IHNwZWN0cnVtTm9kZS5sZWZ0ICsgb3B0aW9ucy54TWFyZ2luO1xyXG4gICAgICBsZWZ0TGFiZWxUZXh0LnRvcCA9IHRvcDtcclxuICAgIH0gKTtcclxuICAgIHJpZ2h0TGFiZWxUZXh0LmJvdW5kc1Byb3BlcnR5LmxpbmsoICgpID0+IHtcclxuICAgICAgcmlnaHRMYWJlbFRleHQucmlnaHQgPSBzcGVjdHJ1bU5vZGUucmlnaHQgLSBvcHRpb25zLnhNYXJnaW47XHJcbiAgICAgIHJpZ2h0TGFiZWxUZXh0LnRvcCA9IHRvcDtcclxuICAgIH0gKTtcclxuXHJcbiAgICB0aGlzLm11dGF0ZSggb3B0aW9ucyApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ3JlYXRlcyB0aGUgY29sb3Iga2V5IGZvciBibGFjay0mLXdoaXRlIGdyYWRpZW50LlxyXG4gICAqL1xyXG4gIHB1YmxpYyBzdGF0aWMgY3JlYXRlRWxlY3Ryb25EZW5zaXR5Q29sb3JLZXkoIG9wdGlvbnM6IFN1cmZhY2VDb2xvcktleU9wdGlvbnMgKTogU3VyZmFjZUNvbG9yS2V5IHtcclxuICAgIHJldHVybiBuZXcgU3VyZmFjZUNvbG9yS2V5KCBNUENvbG9ycy5CV19HUkFESUVOVCwgTW9sZWN1bGVQb2xhcml0eVN0cmluZ3MuZWxlY3Ryb25EZW5zaXR5U3RyaW5nUHJvcGVydHksXHJcbiAgICAgIE1vbGVjdWxlUG9sYXJpdHlTdHJpbmdzLmxlc3NTdHJpbmdQcm9wZXJ0eSwgTW9sZWN1bGVQb2xhcml0eVN0cmluZ3MubW9yZVN0cmluZ1Byb3BlcnR5LCBvcHRpb25zICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBDcmVhdGVzIHRoZSBjb2xvciBrZXkgZm9yIFJXQiAocmVkLXdoaXRlLWJsdWUpIGdyYWRpZW50LlxyXG4gICAqL1xyXG4gIHB1YmxpYyBzdGF0aWMgY3JlYXRlRWxlY3Ryb3N0YXRpY1BvdGVudGlhbFJXQkNvbG9yS2V5KCBvcHRpb25zOiBTdXJmYWNlQ29sb3JLZXlPcHRpb25zICk6IFN1cmZhY2VDb2xvcktleSB7XHJcbiAgICByZXR1cm4gbmV3IFN1cmZhY2VDb2xvcktleSggTVBDb2xvcnMuUldCX0dSQURJRU5ULCBNb2xlY3VsZVBvbGFyaXR5U3RyaW5ncy5lbGVjdHJvc3RhdGljUG90ZW50aWFsU3RyaW5nUHJvcGVydHksXHJcbiAgICAgIE1vbGVjdWxlUG9sYXJpdHlTdHJpbmdzLnBvc2l0aXZlU3RyaW5nUHJvcGVydHksIE1vbGVjdWxlUG9sYXJpdHlTdHJpbmdzLm5lZ2F0aXZlU3RyaW5nUHJvcGVydHksIG9wdGlvbnMgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIENyZWF0ZXMgdGhlIGNvbG9yIGtleSBmb3IgUk9ZR0IgZ3JhZGllbnQuXHJcbiAgICovXHJcbiAgcHVibGljIHN0YXRpYyBjcmVhdGVFbGVjdHJvc3RhdGljUG90ZW50aWFsUk9ZR0JDb2xvcktleSggb3B0aW9uczogU3VyZmFjZUNvbG9yS2V5T3B0aW9ucyApOiBTdXJmYWNlQ29sb3JLZXkge1xyXG4gICAgcmV0dXJuIG5ldyBTdXJmYWNlQ29sb3JLZXkoIE1QQ29sb3JzLlJPWUdCX0dSQURJRU5ULCBNb2xlY3VsZVBvbGFyaXR5U3RyaW5ncy5lbGVjdHJvc3RhdGljUG90ZW50aWFsU3RyaW5nUHJvcGVydHksXHJcbiAgICAgIE1vbGVjdWxlUG9sYXJpdHlTdHJpbmdzLnBvc2l0aXZlU3RyaW5nUHJvcGVydHksIE1vbGVjdWxlUG9sYXJpdHlTdHJpbmdzLm5lZ2F0aXZlU3RyaW5nUHJvcGVydHksIG9wdGlvbnMgKTtcclxuICB9XHJcbn1cclxuXHJcbm1vbGVjdWxlUG9sYXJpdHkucmVnaXN0ZXIoICdTdXJmYWNlQ29sb3JLZXknLCBTdXJmYWNlQ29sb3JLZXkgKTsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLFVBQVUsTUFBTSxrQ0FBa0M7QUFDekQsT0FBT0MsUUFBUSxNQUFNLHlDQUF5QztBQUM5RCxTQUFlQyxjQUFjLEVBQUVDLElBQUksRUFBZUMsU0FBUyxFQUFVQyxJQUFJLFFBQXFCLG1DQUFtQztBQUNqSSxPQUFPQyxnQkFBZ0IsTUFBTSwyQkFBMkI7QUFDeEQsT0FBT0MsdUJBQXVCLE1BQU0sa0NBQWtDO0FBQ3RFLE9BQU9DLFFBQVEsTUFBTSxnQkFBZ0I7QUFFckMsT0FB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