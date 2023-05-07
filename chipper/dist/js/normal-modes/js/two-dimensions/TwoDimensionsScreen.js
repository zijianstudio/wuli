// Copyright 2020-2022, University of Colorado Boulder

/**
 * The 'Two Dimemsions' Screen.
 *
 * @author Thiago de Mendonça Mildemberger (UTFPR)
 * @author Franco Barpp Gomes (UTFPR)
 */

import Property from '../../../axon/js/Property.js';
import Screen from '../../../joist/js/Screen.js';
import NormalModesColors from '../common/NormalModesColors.js';
import NormalModesIconFactory from '../common/view/NormalModesIconFactory.js';
import normalModes from '../normalModes.js';
import NormalModesStrings from '../NormalModesStrings.js';
import TwoDimensionsModel from './model/TwoDimensionsModel.js';
import TwoDimensionsScreenView from './view/TwoDimensionsScreenView.js';
class TwoDimensionsScreen extends Screen {
  /**
   * @param {Tandem} tandem
   */
  constructor(tandem) {
    const options = {
      name: NormalModesStrings.screen.twoDimensionsStringProperty,
      backgroundColorProperty: new Property(NormalModesColors.SCREEN_BACKGROUND),
      homeScreenIcon: NormalModesIconFactory.createTwoDimensionsScreenIcon(),
      tandem: tandem
    };
    super(() => new TwoDimensionsModel({
      tandem: tandem.createTandem('model')
    }), model => new TwoDimensionsScreenView(model, {
      tandem: tandem.createTandem('view')
    }), options);
  }
}
normalModes.register('TwoDimensionsScreen', TwoDimensionsScreen);
export default TwoDimensionsScreen;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJQcm9wZXJ0eSIsIlNjcmVlbiIsIk5vcm1hbE1vZGVzQ29sb3JzIiwiTm9ybWFsTW9kZXNJY29uRmFjdG9yeSIsIm5vcm1hbE1vZGVzIiwiTm9ybWFsTW9kZXNTdHJpbmdzIiwiVHdvRGltZW5zaW9uc01vZGVsIiwiVHdvRGltZW5zaW9uc1NjcmVlblZpZXciLCJUd29EaW1lbnNpb25zU2NyZWVuIiwiY29uc3RydWN0b3IiLCJ0YW5kZW0iLCJvcHRpb25zIiwibmFtZSIsInNjcmVlbiIsInR3b0RpbWVuc2lvbnNTdHJpbmdQcm9wZXJ0eSIsImJhY2tncm91bmRDb2xvclByb3BlcnR5IiwiU0NSRUVOX0JBQ0tHUk9VTkQiLCJob21lU2NyZWVuSWNvbiIsImNyZWF0ZVR3b0RpbWVuc2lvbnNTY3JlZW5JY29uIiwiY3JlYXRlVGFuZGVtIiwibW9kZWwiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIlR3b0RpbWVuc2lvbnNTY3JlZW4uanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMjAtMjAyMiwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogVGhlICdUd28gRGltZW1zaW9ucycgU2NyZWVuLlxyXG4gKlxyXG4gKiBAYXV0aG9yIFRoaWFnbyBkZSBNZW5kb27Dp2EgTWlsZGVtYmVyZ2VyIChVVEZQUilcclxuICogQGF1dGhvciBGcmFuY28gQmFycHAgR29tZXMgKFVURlBSKVxyXG4gKi9cclxuXHJcbmltcG9ydCBQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi9heG9uL2pzL1Byb3BlcnR5LmpzJztcclxuaW1wb3J0IFNjcmVlbiBmcm9tICcuLi8uLi8uLi9qb2lzdC9qcy9TY3JlZW4uanMnO1xyXG5pbXBvcnQgTm9ybWFsTW9kZXNDb2xvcnMgZnJvbSAnLi4vY29tbW9uL05vcm1hbE1vZGVzQ29sb3JzLmpzJztcclxuaW1wb3J0IE5vcm1hbE1vZGVzSWNvbkZhY3RvcnkgZnJvbSAnLi4vY29tbW9uL3ZpZXcvTm9ybWFsTW9kZXNJY29uRmFjdG9yeS5qcyc7XHJcbmltcG9ydCBub3JtYWxNb2RlcyBmcm9tICcuLi9ub3JtYWxNb2Rlcy5qcyc7XHJcbmltcG9ydCBOb3JtYWxNb2Rlc1N0cmluZ3MgZnJvbSAnLi4vTm9ybWFsTW9kZXNTdHJpbmdzLmpzJztcclxuaW1wb3J0IFR3b0RpbWVuc2lvbnNNb2RlbCBmcm9tICcuL21vZGVsL1R3b0RpbWVuc2lvbnNNb2RlbC5qcyc7XHJcbmltcG9ydCBUd29EaW1lbnNpb25zU2NyZWVuVmlldyBmcm9tICcuL3ZpZXcvVHdvRGltZW5zaW9uc1NjcmVlblZpZXcuanMnO1xyXG5cclxuY2xhc3MgVHdvRGltZW5zaW9uc1NjcmVlbiBleHRlbmRzIFNjcmVlbiB7XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwYXJhbSB7VGFuZGVtfSB0YW5kZW1cclxuICAgKi9cclxuICBjb25zdHJ1Y3RvciggdGFuZGVtICkge1xyXG5cclxuICAgIGNvbnN0IG9wdGlvbnMgPSB7XHJcbiAgICAgIG5hbWU6IE5vcm1hbE1vZGVzU3RyaW5ncy5zY3JlZW4udHdvRGltZW5zaW9uc1N0cmluZ1Byb3BlcnR5LFxyXG4gICAgICBiYWNrZ3JvdW5kQ29sb3JQcm9wZXJ0eTogbmV3IFByb3BlcnR5KCBOb3JtYWxNb2Rlc0NvbG9ycy5TQ1JFRU5fQkFDS0dST1VORCApLFxyXG4gICAgICBob21lU2NyZWVuSWNvbjogTm9ybWFsTW9kZXNJY29uRmFjdG9yeS5jcmVhdGVUd29EaW1lbnNpb25zU2NyZWVuSWNvbigpLFxyXG4gICAgICB0YW5kZW06IHRhbmRlbVxyXG4gICAgfTtcclxuXHJcbiAgICBzdXBlcihcclxuICAgICAgKCkgPT4gbmV3IFR3b0RpbWVuc2lvbnNNb2RlbCggeyB0YW5kZW06IHRhbmRlbS5jcmVhdGVUYW5kZW0oICdtb2RlbCcgKSB9ICksXHJcbiAgICAgIG1vZGVsID0+IG5ldyBUd29EaW1lbnNpb25zU2NyZWVuVmlldyggbW9kZWwsIHsgdGFuZGVtOiB0YW5kZW0uY3JlYXRlVGFuZGVtKCAndmlldycgKSB9ICksXHJcbiAgICAgIG9wdGlvbnNcclxuICAgICk7XHJcbiAgfVxyXG59XHJcblxyXG5ub3JtYWxNb2Rlcy5yZWdpc3RlciggJ1R3b0RpbWVuc2lvbnNTY3JlZW4nLCBUd29EaW1lbnNpb25zU2NyZWVuICk7XHJcbmV4cG9ydCBkZWZhdWx0IFR3b0RpbWVuc2lvbnNTY3JlZW47Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsUUFBUSxNQUFNLDhCQUE4QjtBQUNuRCxPQUFPQyxNQUFNLE1BQU0sNkJBQTZCO0FBQ2hELE9BQU9DLGlCQUFpQixNQUFNLGdDQUFnQztBQUM5RCxPQUFPQyxzQkFBc0IsTUFBTSwwQ0FBMEM7QUFDN0UsT0FBT0MsV0FBVyxNQUFNLG1CQUFtQjtBQUMzQyxPQUFPQyxrQkFBa0IsTUFBTSwwQkFBMEI7QUFDekQsT0FBT0Msa0JBQWtCLE1BQU0sK0JBQStCO0FBQzlELE9BQU9DLHVCQUF1QixNQUFNLG1DQUFtQztBQUV2RSxNQUFNQyxtQkFBbUIsU0FBU1AsTUFBTSxDQUFDO0VBRXZDO0FBQ0Y7QUFDQTtFQUNFUSxXQUFXQSxDQUFFQyxNQUFNLEVBQUc7SUFFcEIsTUFBTUMsT0FBTyxHQUFHO01BQ2RDLElBQUksRUFBRVAsa0JBQWtCLENBQUNRLE1BQU0sQ0FBQ0MsMkJBQTJCO01BQzNEQyx1QkFBdUIsRUFBRSxJQUFJZixRQUFRLENBQUVFLGlCQUFpQixDQUFDYyxpQkFBa0IsQ0FBQztNQUM1RUMsY0FBYyxFQUFFZCxzQkFBc0IsQ0FBQ2UsNkJBQTZCLENBQUMsQ0FBQztNQUN0RVIsTUFBTSxFQUFFQTtJQUNWLENBQUM7SUFFRCxLQUFLLENBQ0gsTUFBTSxJQUFJSixrQkFBa0IsQ0FBRTtNQUFFSSxNQUFNLEVBQUVBLE1BQU0sQ0FBQ1MsWUFBWSxDQUFFLE9BQVE7SUFBRSxDQUFFLENBQUMsRUFDMUVDLEtBQUssSUFBSSxJQUFJYix1QkFBdUIsQ0FBRWEsS0FBSyxFQUFFO01BQUVWLE1BQU0sRUFBRUEsTUFBTSxDQUFDUyxZQUFZLENBQUUsTUFBTztJQUFFLENBQUUsQ0FBQyxFQUN4RlIsT0FDRixDQUFDO0VBQ0g7QUFDRjtBQUVBUCxXQUFXLENBQUNpQixRQUFRLENBQUUscUJBQXFCLEVBQUViLG1CQUFvQixDQUFDO0FBQ2xFLGVBQWVBLG1CQUFtQiJ9