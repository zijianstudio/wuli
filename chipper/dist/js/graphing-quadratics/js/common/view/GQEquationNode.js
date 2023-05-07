// Copyright 2019-2023, University of Colorado Boulder

/**
 * Puts a Node on a rectangular background, dynamically sized to fit the Node.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import optionize from '../../../../phet-core/js/optionize.js';
import BackgroundNode from '../../../../scenery-phet/js/BackgroundNode.js';
import { Circle, RichText } from '../../../../scenery/js/imports.js';
import graphingQuadratics from '../../graphingQuadratics.js';
import GQQueryParameters from '../GQQueryParameters.js';
import GQConstants from '../GQConstants.js';
export default class GQEquationNode extends BackgroundNode {
  constructor(providedOptions) {
    const options = optionize()({
      // SelfOptions
      textOptions: {
        font: GQConstants.GRAPHED_EQUATION_FONT
      },
      // BackgroundNodeOptions
      rectangleOptions: {
        fill: GQQueryParameters.equationsBackgroundColor
      }
    }, providedOptions);
    const equationText = new RichText('', options.textOptions);
    super(equationText, options);
    this.equationText = equationText;

    // put a red dot at the origin, for debugging positioning
    if (GQQueryParameters.showOrigin) {
      this.addChild(new Circle(3, {
        fill: 'red'
      }));
    }
  }
  setTextString(value) {
    this.equationText.string = value;
  }
  setTextFill(fill) {
    this.equationText.fill = fill;
  }
}
graphingQuadratics.register('GQEquationNode', GQEquationNode);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJvcHRpb25pemUiLCJCYWNrZ3JvdW5kTm9kZSIsIkNpcmNsZSIsIlJpY2hUZXh0IiwiZ3JhcGhpbmdRdWFkcmF0aWNzIiwiR1FRdWVyeVBhcmFtZXRlcnMiLCJHUUNvbnN0YW50cyIsIkdRRXF1YXRpb25Ob2RlIiwiY29uc3RydWN0b3IiLCJwcm92aWRlZE9wdGlvbnMiLCJvcHRpb25zIiwidGV4dE9wdGlvbnMiLCJmb250IiwiR1JBUEhFRF9FUVVBVElPTl9GT05UIiwicmVjdGFuZ2xlT3B0aW9ucyIsImZpbGwiLCJlcXVhdGlvbnNCYWNrZ3JvdW5kQ29sb3IiLCJlcXVhdGlvblRleHQiLCJzaG93T3JpZ2luIiwiYWRkQ2hpbGQiLCJzZXRUZXh0U3RyaW5nIiwidmFsdWUiLCJzdHJpbmciLCJzZXRUZXh0RmlsbCIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiR1FFcXVhdGlvbk5vZGUudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTktMjAyMywgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogUHV0cyBhIE5vZGUgb24gYSByZWN0YW5ndWxhciBiYWNrZ3JvdW5kLCBkeW5hbWljYWxseSBzaXplZCB0byBmaXQgdGhlIE5vZGUuXHJcbiAqXHJcbiAqIEBhdXRob3IgQ2hyaXMgTWFsbGV5IChQaXhlbFpvb20sIEluYy4pXHJcbiAqL1xyXG5cclxuaW1wb3J0IG9wdGlvbml6ZSBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvb3B0aW9uaXplLmpzJztcclxuaW1wb3J0IFBpY2tPcHRpb25hbCBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvdHlwZXMvUGlja09wdGlvbmFsLmpzJztcclxuaW1wb3J0IEJhY2tncm91bmROb2RlLCB7IEJhY2tncm91bmROb2RlT3B0aW9ucyB9IGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9CYWNrZ3JvdW5kTm9kZS5qcyc7XHJcbmltcG9ydCB7IENpcmNsZSwgUmljaFRleHQsIFJpY2hUZXh0T3B0aW9ucywgVENvbG9yIH0gZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS9qcy9pbXBvcnRzLmpzJztcclxuaW1wb3J0IGdyYXBoaW5nUXVhZHJhdGljcyBmcm9tICcuLi8uLi9ncmFwaGluZ1F1YWRyYXRpY3MuanMnO1xyXG5pbXBvcnQgR1FRdWVyeVBhcmFtZXRlcnMgZnJvbSAnLi4vR1FRdWVyeVBhcmFtZXRlcnMuanMnO1xyXG5pbXBvcnQgR1FDb25zdGFudHMgZnJvbSAnLi4vR1FDb25zdGFudHMuanMnO1xyXG5cclxudHlwZSBTZWxmT3B0aW9ucyA9IHtcclxuICB0ZXh0T3B0aW9ucz86IFJpY2hUZXh0T3B0aW9ucztcclxufTtcclxuXHJcbnR5cGUgR1FCYWNrZ3JvdW5kTm9kZU9wdGlvbnMgPSBTZWxmT3B0aW9ucyAmXHJcbiAgUGlja09wdGlvbmFsPEJhY2tncm91bmROb2RlT3B0aW9ucywgJ3Zpc2libGVQcm9wZXJ0eScgfCAnbWF4V2lkdGgnIHwgJ21heEhlaWdodCc+O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgR1FFcXVhdGlvbk5vZGUgZXh0ZW5kcyBCYWNrZ3JvdW5kTm9kZSB7XHJcblxyXG4gIHByaXZhdGUgcmVhZG9ubHkgZXF1YXRpb25UZXh0OiBSaWNoVGV4dDtcclxuXHJcbiAgcHVibGljIGNvbnN0cnVjdG9yKCBwcm92aWRlZE9wdGlvbnM/OiBHUUJhY2tncm91bmROb2RlT3B0aW9ucyApIHtcclxuXHJcbiAgICBjb25zdCBvcHRpb25zID0gb3B0aW9uaXplPEdRQmFja2dyb3VuZE5vZGVPcHRpb25zLCBTZWxmT3B0aW9ucywgQmFja2dyb3VuZE5vZGVPcHRpb25zPigpKCB7XHJcblxyXG4gICAgICAvLyBTZWxmT3B0aW9uc1xyXG4gICAgICB0ZXh0T3B0aW9uczoge1xyXG4gICAgICAgIGZvbnQ6IEdRQ29uc3RhbnRzLkdSQVBIRURfRVFVQVRJT05fRk9OVFxyXG4gICAgICB9LFxyXG5cclxuICAgICAgLy8gQmFja2dyb3VuZE5vZGVPcHRpb25zXHJcbiAgICAgIHJlY3RhbmdsZU9wdGlvbnM6IHtcclxuICAgICAgICBmaWxsOiBHUVF1ZXJ5UGFyYW1ldGVycy5lcXVhdGlvbnNCYWNrZ3JvdW5kQ29sb3JcclxuICAgICAgfVxyXG4gICAgfSwgcHJvdmlkZWRPcHRpb25zICk7XHJcblxyXG4gICAgY29uc3QgZXF1YXRpb25UZXh0ID0gbmV3IFJpY2hUZXh0KCAnJywgb3B0aW9ucy50ZXh0T3B0aW9ucyApO1xyXG5cclxuICAgIHN1cGVyKCBlcXVhdGlvblRleHQsIG9wdGlvbnMgKTtcclxuXHJcbiAgICB0aGlzLmVxdWF0aW9uVGV4dCA9IGVxdWF0aW9uVGV4dDtcclxuXHJcbiAgICAvLyBwdXQgYSByZWQgZG90IGF0IHRoZSBvcmlnaW4sIGZvciBkZWJ1Z2dpbmcgcG9zaXRpb25pbmdcclxuICAgIGlmICggR1FRdWVyeVBhcmFtZXRlcnMuc2hvd09yaWdpbiApIHtcclxuICAgICAgdGhpcy5hZGRDaGlsZCggbmV3IENpcmNsZSggMywgeyBmaWxsOiAncmVkJyB9ICkgKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHB1YmxpYyBzZXRUZXh0U3RyaW5nKCB2YWx1ZTogc3RyaW5nICk6IHZvaWQge1xyXG4gICAgdGhpcy5lcXVhdGlvblRleHQuc3RyaW5nID0gdmFsdWU7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgc2V0VGV4dEZpbGwoIGZpbGw6IFRDb2xvciApOiB2b2lkIHtcclxuICAgIHRoaXMuZXF1YXRpb25UZXh0LmZpbGwgPSBmaWxsO1xyXG4gIH1cclxufVxyXG5cclxuZ3JhcGhpbmdRdWFkcmF0aWNzLnJlZ2lzdGVyKCAnR1FFcXVhdGlvbk5vZGUnLCBHUUVxdWF0aW9uTm9kZSApOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxTQUFTLE1BQU0sdUNBQXVDO0FBRTdELE9BQU9DLGNBQWMsTUFBaUMsK0NBQStDO0FBQ3JHLFNBQVNDLE1BQU0sRUFBRUMsUUFBUSxRQUFpQyxtQ0FBbUM7QUFDN0YsT0FBT0Msa0JBQWtCLE1BQU0sNkJBQTZCO0FBQzVELE9BQU9DLGlCQUFpQixNQUFNLHlCQUF5QjtBQUN2RCxPQUFPQyxXQUFXLE1BQU0sbUJBQW1CO0FBUzNDLGVBQWUsTUFBTUMsY0FBYyxTQUFTTixjQUFjLENBQUM7RUFJbERPLFdBQVdBLENBQUVDLGVBQXlDLEVBQUc7SUFFOUQsTUFBTUMsT0FBTyxHQUFHVixTQUFTLENBQThELENBQUMsQ0FBRTtNQUV4RjtNQUNBVyxXQUFXLEVBQUU7UUFDWEMsSUFBSSxFQUFFTixXQUFXLENBQUNPO01BQ3BCLENBQUM7TUFFRDtNQUNBQyxnQkFBZ0IsRUFBRTtRQUNoQkMsSUFBSSxFQUFFVixpQkFBaUIsQ0FBQ1c7TUFDMUI7SUFDRixDQUFDLEVBQUVQLGVBQWdCLENBQUM7SUFFcEIsTUFBTVEsWUFBWSxHQUFHLElBQUlkLFFBQVEsQ0FBRSxFQUFFLEVBQUVPLE9BQU8sQ0FBQ0MsV0FBWSxDQUFDO0lBRTVELEtBQUssQ0FBRU0sWUFBWSxFQUFFUCxPQUFRLENBQUM7SUFFOUIsSUFBSSxDQUFDTyxZQUFZLEdBQUdBLFlBQVk7O0lBRWhDO0lBQ0EsSUFBS1osaUJBQWlCLENBQUNhLFVBQVUsRUFBRztNQUNsQyxJQUFJLENBQUNDLFFBQVEsQ0FBRSxJQUFJakIsTUFBTSxDQUFFLENBQUMsRUFBRTtRQUFFYSxJQUFJLEVBQUU7TUFBTSxDQUFFLENBQUUsQ0FBQztJQUNuRDtFQUNGO0VBRU9LLGFBQWFBLENBQUVDLEtBQWEsRUFBUztJQUMxQyxJQUFJLENBQUNKLFlBQVksQ0FBQ0ssTUFBTSxHQUFHRCxLQUFLO0VBQ2xDO0VBRU9FLFdBQVdBLENBQUVSLElBQVksRUFBUztJQUN2QyxJQUFJLENBQUNFLFlBQVksQ0FBQ0YsSUFBSSxHQUFHQSxJQUFJO0VBQy9CO0FBQ0Y7QUFFQVgsa0JBQWtCLENBQUNvQixRQUFRLENBQUUsZ0JBQWdCLEVBQUVqQixjQUFlLENBQUMifQ==