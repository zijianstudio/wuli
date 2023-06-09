// Copyright 2021-2022, University of Colorado Boulder

/**
 * LightPropagationToggleButton is a toggle button used to turn light propagation on and off.
 *
 * @author Sarah Chang (Swarthmore College)
 * @author Chris Malley (PixelZoom, Inc.)
 */

import SceneryPhetConstants from '../../../../scenery-phet/js/SceneryPhetConstants.js';
import { Image } from '../../../../scenery/js/imports.js';
import BooleanRoundToggleButton from '../../../../sun/js/buttons/BooleanRoundToggleButton.js';
import lightPropagationOffIcon_png from '../../../images/lightPropagationOffIcon_png.js';
import lightPropagationOnIcon_png from '../../../images/lightPropagationOnIcon_png.js';
import geometricOptics from '../../geometricOptics.js';
import GOColors from '../GOColors.js';
import optionize from '../../../../phet-core/js/optionize.js';
export default class LightPropagationToggleButton extends BooleanRoundToggleButton {
  constructor(booleanProperty, providedOptions) {
    const options = optionize()({
      // BooleanRoundToggleButtonOptions
      radius: SceneryPhetConstants.DEFAULT_BUTTON_RADIUS,
      // so that this button will be the same size as ResetAllButton
      xMargin: 4,
      yMargin: 4,
      touchAreaDilation: 5.2,
      // same as ResetAllButton
      baseColor: GOColors.lightPropagationToggleButtonFillProperty
    }, providedOptions);

    // create nodes for open and closed eye icons
    const onNode = new Image(lightPropagationOnIcon_png);
    const offNode = new Image(lightPropagationOffIcon_png);
    super(booleanProperty, onNode, offNode, options);
  }
  dispose() {
    assert && assert(false, 'dispose is not supported, exists for the lifetime of the sim');
    super.dispose();
  }
}
geometricOptics.register('LightPropagationToggleButton', LightPropagationToggleButton);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJTY2VuZXJ5UGhldENvbnN0YW50cyIsIkltYWdlIiwiQm9vbGVhblJvdW5kVG9nZ2xlQnV0dG9uIiwibGlnaHRQcm9wYWdhdGlvbk9mZkljb25fcG5nIiwibGlnaHRQcm9wYWdhdGlvbk9uSWNvbl9wbmciLCJnZW9tZXRyaWNPcHRpY3MiLCJHT0NvbG9ycyIsIm9wdGlvbml6ZSIsIkxpZ2h0UHJvcGFnYXRpb25Ub2dnbGVCdXR0b24iLCJjb25zdHJ1Y3RvciIsImJvb2xlYW5Qcm9wZXJ0eSIsInByb3ZpZGVkT3B0aW9ucyIsIm9wdGlvbnMiLCJyYWRpdXMiLCJERUZBVUxUX0JVVFRPTl9SQURJVVMiLCJ4TWFyZ2luIiwieU1hcmdpbiIsInRvdWNoQXJlYURpbGF0aW9uIiwiYmFzZUNvbG9yIiwibGlnaHRQcm9wYWdhdGlvblRvZ2dsZUJ1dHRvbkZpbGxQcm9wZXJ0eSIsIm9uTm9kZSIsIm9mZk5vZGUiLCJkaXNwb3NlIiwiYXNzZXJ0IiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJMaWdodFByb3BhZ2F0aW9uVG9nZ2xlQnV0dG9uLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDIxLTIwMjIsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIExpZ2h0UHJvcGFnYXRpb25Ub2dnbGVCdXR0b24gaXMgYSB0b2dnbGUgYnV0dG9uIHVzZWQgdG8gdHVybiBsaWdodCBwcm9wYWdhdGlvbiBvbiBhbmQgb2ZmLlxyXG4gKlxyXG4gKiBAYXV0aG9yIFNhcmFoIENoYW5nIChTd2FydGhtb3JlIENvbGxlZ2UpXHJcbiAqIEBhdXRob3IgQ2hyaXMgTWFsbGV5IChQaXhlbFpvb20sIEluYy4pXHJcbiAqL1xyXG5cclxuaW1wb3J0IFNjZW5lcnlQaGV0Q29uc3RhbnRzIGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9TY2VuZXJ5UGhldENvbnN0YW50cy5qcyc7XHJcbmltcG9ydCB7IEltYWdlIH0gZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS9qcy9pbXBvcnRzLmpzJztcclxuaW1wb3J0IEJvb2xlYW5Sb3VuZFRvZ2dsZUJ1dHRvbiwgeyBCb29sZWFuUm91bmRUb2dnbGVCdXR0b25PcHRpb25zIH0gZnJvbSAnLi4vLi4vLi4vLi4vc3VuL2pzL2J1dHRvbnMvQm9vbGVhblJvdW5kVG9nZ2xlQnV0dG9uLmpzJztcclxuaW1wb3J0IGxpZ2h0UHJvcGFnYXRpb25PZmZJY29uX3BuZyBmcm9tICcuLi8uLi8uLi9pbWFnZXMvbGlnaHRQcm9wYWdhdGlvbk9mZkljb25fcG5nLmpzJztcclxuaW1wb3J0IGxpZ2h0UHJvcGFnYXRpb25Pbkljb25fcG5nIGZyb20gJy4uLy4uLy4uL2ltYWdlcy9saWdodFByb3BhZ2F0aW9uT25JY29uX3BuZy5qcyc7XHJcbmltcG9ydCBnZW9tZXRyaWNPcHRpY3MgZnJvbSAnLi4vLi4vZ2VvbWV0cmljT3B0aWNzLmpzJztcclxuaW1wb3J0IEdPQ29sb3JzIGZyb20gJy4uL0dPQ29sb3JzLmpzJztcclxuaW1wb3J0IFBpY2tSZXF1aXJlZCBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvdHlwZXMvUGlja1JlcXVpcmVkLmpzJztcclxuaW1wb3J0IG9wdGlvbml6ZSwgeyBFbXB0eVNlbGZPcHRpb25zIH0gZnJvbSAnLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL29wdGlvbml6ZS5qcyc7XHJcbmltcG9ydCBQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL1Byb3BlcnR5LmpzJztcclxuXHJcbnR5cGUgU2VsZk9wdGlvbnMgPSBFbXB0eVNlbGZPcHRpb25zO1xyXG5cclxudHlwZSBMaWdodFByb3BhZ2F0aW9uVG9nZ2xlQnV0dG9uT3B0aW9ucyA9IFNlbGZPcHRpb25zICYgUGlja1JlcXVpcmVkPEJvb2xlYW5Sb3VuZFRvZ2dsZUJ1dHRvbk9wdGlvbnMsICd0YW5kZW0nPjtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIExpZ2h0UHJvcGFnYXRpb25Ub2dnbGVCdXR0b24gZXh0ZW5kcyBCb29sZWFuUm91bmRUb2dnbGVCdXR0b24ge1xyXG5cclxuICBwdWJsaWMgY29uc3RydWN0b3IoIGJvb2xlYW5Qcm9wZXJ0eTogUHJvcGVydHk8Ym9vbGVhbj4sIHByb3ZpZGVkT3B0aW9uczogTGlnaHRQcm9wYWdhdGlvblRvZ2dsZUJ1dHRvbk9wdGlvbnMgKSB7XHJcblxyXG4gICAgY29uc3Qgb3B0aW9ucyA9IG9wdGlvbml6ZTxMaWdodFByb3BhZ2F0aW9uVG9nZ2xlQnV0dG9uT3B0aW9ucywgU2VsZk9wdGlvbnMsIEJvb2xlYW5Sb3VuZFRvZ2dsZUJ1dHRvbk9wdGlvbnM+KCkoIHtcclxuXHJcbiAgICAgIC8vIEJvb2xlYW5Sb3VuZFRvZ2dsZUJ1dHRvbk9wdGlvbnNcclxuICAgICAgcmFkaXVzOiBTY2VuZXJ5UGhldENvbnN0YW50cy5ERUZBVUxUX0JVVFRPTl9SQURJVVMsIC8vIHNvIHRoYXQgdGhpcyBidXR0b24gd2lsbCBiZSB0aGUgc2FtZSBzaXplIGFzIFJlc2V0QWxsQnV0dG9uXHJcbiAgICAgIHhNYXJnaW46IDQsXHJcbiAgICAgIHlNYXJnaW46IDQsXHJcbiAgICAgIHRvdWNoQXJlYURpbGF0aW9uOiA1LjIsIC8vIHNhbWUgYXMgUmVzZXRBbGxCdXR0b25cclxuICAgICAgYmFzZUNvbG9yOiBHT0NvbG9ycy5saWdodFByb3BhZ2F0aW9uVG9nZ2xlQnV0dG9uRmlsbFByb3BlcnR5XHJcbiAgICB9LCBwcm92aWRlZE9wdGlvbnMgKTtcclxuXHJcbiAgICAvLyBjcmVhdGUgbm9kZXMgZm9yIG9wZW4gYW5kIGNsb3NlZCBleWUgaWNvbnNcclxuICAgIGNvbnN0IG9uTm9kZSA9IG5ldyBJbWFnZSggbGlnaHRQcm9wYWdhdGlvbk9uSWNvbl9wbmcgKTtcclxuICAgIGNvbnN0IG9mZk5vZGUgPSBuZXcgSW1hZ2UoIGxpZ2h0UHJvcGFnYXRpb25PZmZJY29uX3BuZyApO1xyXG5cclxuICAgIHN1cGVyKCBib29sZWFuUHJvcGVydHksIG9uTm9kZSwgb2ZmTm9kZSwgb3B0aW9ucyApO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIG92ZXJyaWRlIGRpc3Bvc2UoKTogdm9pZCB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBmYWxzZSwgJ2Rpc3Bvc2UgaXMgbm90IHN1cHBvcnRlZCwgZXhpc3RzIGZvciB0aGUgbGlmZXRpbWUgb2YgdGhlIHNpbScgKTtcclxuICAgIHN1cGVyLmRpc3Bvc2UoKTtcclxuICB9XHJcbn1cclxuXHJcbmdlb21ldHJpY09wdGljcy5yZWdpc3RlciggJ0xpZ2h0UHJvcGFnYXRpb25Ub2dnbGVCdXR0b24nLCBMaWdodFByb3BhZ2F0aW9uVG9nZ2xlQnV0dG9uICk7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0Esb0JBQW9CLE1BQU0scURBQXFEO0FBQ3RGLFNBQVNDLEtBQUssUUFBUSxtQ0FBbUM7QUFDekQsT0FBT0Msd0JBQXdCLE1BQTJDLHdEQUF3RDtBQUNsSSxPQUFPQywyQkFBMkIsTUFBTSxnREFBZ0Q7QUFDeEYsT0FBT0MsMEJBQTBCLE1BQU0sK0NBQStDO0FBQ3RGLE9BQU9DLGVBQWUsTUFBTSwwQkFBMEI7QUFDdEQsT0FBT0MsUUFBUSxNQUFNLGdCQUFnQjtBQUVyQyxPQUFPQyxTQUFTLE1BQTRCLHVDQUF1QztBQU9uRixlQUFlLE1BQU1DLDRCQUE0QixTQUFTTix3QkFBd0IsQ0FBQztFQUUxRU8sV0FBV0EsQ0FBRUMsZUFBa0MsRUFBRUMsZUFBb0QsRUFBRztJQUU3RyxNQUFNQyxPQUFPLEdBQUdMLFNBQVMsQ0FBb0YsQ0FBQyxDQUFFO01BRTlHO01BQ0FNLE1BQU0sRUFBRWIsb0JBQW9CLENBQUNjLHFCQUFxQjtNQUFFO01BQ3BEQyxPQUFPLEVBQUUsQ0FBQztNQUNWQyxPQUFPLEVBQUUsQ0FBQztNQUNWQyxpQkFBaUIsRUFBRSxHQUFHO01BQUU7TUFDeEJDLFNBQVMsRUFBRVosUUFBUSxDQUFDYTtJQUN0QixDQUFDLEVBQUVSLGVBQWdCLENBQUM7O0lBRXBCO0lBQ0EsTUFBTVMsTUFBTSxHQUFHLElBQUluQixLQUFLLENBQUVHLDBCQUEyQixDQUFDO0lBQ3RELE1BQU1pQixPQUFPLEdBQUcsSUFBSXBCLEtBQUssQ0FBRUUsMkJBQTRCLENBQUM7SUFFeEQsS0FBSyxDQUFFTyxlQUFlLEVBQUVVLE1BQU0sRUFBRUMsT0FBTyxFQUFFVCxPQUFRLENBQUM7RUFDcEQ7RUFFZ0JVLE9BQU9BLENBQUEsRUFBUztJQUM5QkMsTUFBTSxJQUFJQSxNQUFNLENBQUUsS0FBSyxFQUFFLDhEQUErRCxDQUFDO0lBQ3pGLEtBQUssQ0FBQ0QsT0FBTyxDQUFDLENBQUM7RUFDakI7QUFDRjtBQUVBakIsZUFBZSxDQUFDbUIsUUFBUSxDQUFFLDhCQUE4QixFQUFFaEIsNEJBQTZCLENBQUMifQ==