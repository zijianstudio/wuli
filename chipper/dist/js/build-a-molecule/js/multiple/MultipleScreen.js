// Copyright 2013-2022, University of Colorado Boulder

/**
 * 2nd screen: Collection boxes take multiple molecules of the same type.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 * @author Denzell Barnett (PhET Interactive Simulations)
 */

import Property from '../../../axon/js/Property.js';
import buildAMolecule from '../buildAMolecule.js';
import BuildAMoleculeStrings from '../BuildAMoleculeStrings.js';
import BAMConstants from '../common/BAMConstants.js';
import BAMIconFactory from '../common/view/BAMIconFactory.js';
import BAMScreen from '../common/view/BAMScreen.js';
import MoleculeCollectingScreenView from '../common/view/MoleculeCollectingScreenView.js';
import MultipleModel from './model/MultipleModel.js';
class MultipleScreen extends BAMScreen {
  constructor() {
    const options = {
      name: BuildAMoleculeStrings.title.multipleStringProperty,
      backgroundColorProperty: new Property(BAMConstants.PLAY_AREA_BACKGROUND_COLOR),
      homeScreenIcon: BAMIconFactory.createMultipleScreenIcon()
    };
    super(() => new MultipleModel(), model => new MoleculeCollectingScreenView(model, false), options);
  }
}
buildAMolecule.register('MultipleScreen', MultipleScreen);
export default MultipleScreen;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJQcm9wZXJ0eSIsImJ1aWxkQU1vbGVjdWxlIiwiQnVpbGRBTW9sZWN1bGVTdHJpbmdzIiwiQkFNQ29uc3RhbnRzIiwiQkFNSWNvbkZhY3RvcnkiLCJCQU1TY3JlZW4iLCJNb2xlY3VsZUNvbGxlY3RpbmdTY3JlZW5WaWV3IiwiTXVsdGlwbGVNb2RlbCIsIk11bHRpcGxlU2NyZWVuIiwiY29uc3RydWN0b3IiLCJvcHRpb25zIiwibmFtZSIsInRpdGxlIiwibXVsdGlwbGVTdHJpbmdQcm9wZXJ0eSIsImJhY2tncm91bmRDb2xvclByb3BlcnR5IiwiUExBWV9BUkVBX0JBQ0tHUk9VTkRfQ09MT1IiLCJob21lU2NyZWVuSWNvbiIsImNyZWF0ZU11bHRpcGxlU2NyZWVuSWNvbiIsIm1vZGVsIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJNdWx0aXBsZVNjcmVlbi5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxMy0yMDIyLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiAybmQgc2NyZWVuOiBDb2xsZWN0aW9uIGJveGVzIHRha2UgbXVsdGlwbGUgbW9sZWN1bGVzIG9mIHRoZSBzYW1lIHR5cGUuXHJcbiAqXHJcbiAqIEBhdXRob3IgSm9uYXRoYW4gT2xzb24gPGpvbmF0aGFuLm9sc29uQGNvbG9yYWRvLmVkdT5cclxuICogQGF1dGhvciBEZW56ZWxsIEJhcm5ldHQgKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXHJcbiAqL1xyXG5cclxuaW1wb3J0IFByb3BlcnR5IGZyb20gJy4uLy4uLy4uL2F4b24vanMvUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgYnVpbGRBTW9sZWN1bGUgZnJvbSAnLi4vYnVpbGRBTW9sZWN1bGUuanMnO1xyXG5pbXBvcnQgQnVpbGRBTW9sZWN1bGVTdHJpbmdzIGZyb20gJy4uL0J1aWxkQU1vbGVjdWxlU3RyaW5ncy5qcyc7XHJcbmltcG9ydCBCQU1Db25zdGFudHMgZnJvbSAnLi4vY29tbW9uL0JBTUNvbnN0YW50cy5qcyc7XHJcbmltcG9ydCBCQU1JY29uRmFjdG9yeSBmcm9tICcuLi9jb21tb24vdmlldy9CQU1JY29uRmFjdG9yeS5qcyc7XHJcbmltcG9ydCBCQU1TY3JlZW4gZnJvbSAnLi4vY29tbW9uL3ZpZXcvQkFNU2NyZWVuLmpzJztcclxuaW1wb3J0IE1vbGVjdWxlQ29sbGVjdGluZ1NjcmVlblZpZXcgZnJvbSAnLi4vY29tbW9uL3ZpZXcvTW9sZWN1bGVDb2xsZWN0aW5nU2NyZWVuVmlldy5qcyc7XHJcbmltcG9ydCBNdWx0aXBsZU1vZGVsIGZyb20gJy4vbW9kZWwvTXVsdGlwbGVNb2RlbC5qcyc7XHJcblxyXG5jbGFzcyBNdWx0aXBsZVNjcmVlbiBleHRlbmRzIEJBTVNjcmVlbiB7XHJcbiAgY29uc3RydWN0b3IoKSB7XHJcbiAgICBjb25zdCBvcHRpb25zID0ge1xyXG4gICAgICBuYW1lOiBCdWlsZEFNb2xlY3VsZVN0cmluZ3MudGl0bGUubXVsdGlwbGVTdHJpbmdQcm9wZXJ0eSxcclxuICAgICAgYmFja2dyb3VuZENvbG9yUHJvcGVydHk6IG5ldyBQcm9wZXJ0eSggQkFNQ29uc3RhbnRzLlBMQVlfQVJFQV9CQUNLR1JPVU5EX0NPTE9SICksXHJcbiAgICAgIGhvbWVTY3JlZW5JY29uOiBCQU1JY29uRmFjdG9yeS5jcmVhdGVNdWx0aXBsZVNjcmVlbkljb24oKVxyXG4gICAgfTtcclxuICAgIHN1cGVyKFxyXG4gICAgICAoKSA9PiBuZXcgTXVsdGlwbGVNb2RlbCgpLFxyXG4gICAgICBtb2RlbCA9PiBuZXcgTW9sZWN1bGVDb2xsZWN0aW5nU2NyZWVuVmlldyggbW9kZWwsIGZhbHNlICksXHJcbiAgICAgIG9wdGlvbnMgKTtcclxuICB9XHJcbn1cclxuXHJcbmJ1aWxkQU1vbGVjdWxlLnJlZ2lzdGVyKCAnTXVsdGlwbGVTY3JlZW4nLCBNdWx0aXBsZVNjcmVlbiApO1xyXG5leHBvcnQgZGVmYXVsdCBNdWx0aXBsZVNjcmVlbjsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxRQUFRLE1BQU0sOEJBQThCO0FBQ25ELE9BQU9DLGNBQWMsTUFBTSxzQkFBc0I7QUFDakQsT0FBT0MscUJBQXFCLE1BQU0sNkJBQTZCO0FBQy9ELE9BQU9DLFlBQVksTUFBTSwyQkFBMkI7QUFDcEQsT0FBT0MsY0FBYyxNQUFNLGtDQUFrQztBQUM3RCxPQUFPQyxTQUFTLE1BQU0sNkJBQTZCO0FBQ25ELE9BQU9DLDRCQUE0QixNQUFNLGdEQUFnRDtBQUN6RixPQUFPQyxhQUFhLE1BQU0sMEJBQTBCO0FBRXBELE1BQU1DLGNBQWMsU0FBU0gsU0FBUyxDQUFDO0VBQ3JDSSxXQUFXQSxDQUFBLEVBQUc7SUFDWixNQUFNQyxPQUFPLEdBQUc7TUFDZEMsSUFBSSxFQUFFVCxxQkFBcUIsQ0FBQ1UsS0FBSyxDQUFDQyxzQkFBc0I7TUFDeERDLHVCQUF1QixFQUFFLElBQUlkLFFBQVEsQ0FBRUcsWUFBWSxDQUFDWSwwQkFBMkIsQ0FBQztNQUNoRkMsY0FBYyxFQUFFWixjQUFjLENBQUNhLHdCQUF3QixDQUFDO0lBQzFELENBQUM7SUFDRCxLQUFLLENBQ0gsTUFBTSxJQUFJVixhQUFhLENBQUMsQ0FBQyxFQUN6QlcsS0FBSyxJQUFJLElBQUlaLDRCQUE0QixDQUFFWSxLQUFLLEVBQUUsS0FBTSxDQUFDLEVBQ3pEUixPQUFRLENBQUM7RUFDYjtBQUNGO0FBRUFULGNBQWMsQ0FBQ2tCLFFBQVEsQ0FBRSxnQkFBZ0IsRUFBRVgsY0FBZSxDQUFDO0FBQzNELGVBQWVBLGNBQWMifQ==