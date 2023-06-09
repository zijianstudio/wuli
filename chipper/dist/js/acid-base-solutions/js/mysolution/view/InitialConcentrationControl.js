// Copyright 2022, University of Colorado Boulder

/**
 * InitialConcentrationControl is the control for 'Initial Concentration' in MySolutionPanel.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import { Text, VBox } from '../../../../scenery/js/imports.js';
import acidBaseSolutions from '../../acidBaseSolutions.js';
import AcidBaseSolutionsStrings from '../../AcidBaseSolutionsStrings.js';
import ABSConstants from '../../common/ABSConstants.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import Property from '../../../../axon/js/Property.js';
import NumberSpinner from '../../../../sun/js/NumberSpinner.js';
import InitialConcentrationSlider from './InitialConcentrationSlider.js';
const CONCENTRATION_DECIMALS = 3;
export default class InitialConcentrationControl extends VBox {
  constructor(concentrationProperty, tandem) {
    const titleText = new Text(AcidBaseSolutionsStrings.initialConcentrationStringProperty, {
      font: ABSConstants.SUBTITLE_FONT,
      maxWidth: 180,
      // determined empirically,
      layoutOptions: {
        align: 'left'
      },
      tandem: tandem.createTandem('titleText')
    });
    const spinner = new NumberSpinner(concentrationProperty, new Property(ABSConstants.CONCENTRATION_RANGE), {
      arrowsPosition: 'leftRight',
      xSpacing: 8,
      deltaValue: Math.pow(10, -CONCENTRATION_DECIMALS),
      numberDisplayOptions: {
        decimalPlaces: CONCENTRATION_DECIMALS,
        textOptions: {
          font: new PhetFont(14)
        },
        cornerRadius: 4,
        phetioVisiblePropertyInstrumented: false
      },
      touchAreaXDilation: 6,
      touchAreaYDilation: 6,
      tandem: tandem.createTandem('spinner')
    });
    const slider = new InitialConcentrationSlider(concentrationProperty, ABSConstants.CONCENTRATION_RANGE, tandem.createTandem('slider'));
    super({
      children: [titleText, spinner, slider],
      spacing: 6,
      layoutOptions: {
        stretch: true
      },
      // so that titleText will be left-aligned in MySolutionsPanel
      tandem: tandem
    });
  }
  dispose() {
    assert && assert(false, 'dispose is not supported, exists for the lifetime of the sim');
    super.dispose();
  }
}
acidBaseSolutions.register('InitialConcentrationControl', InitialConcentrationControl);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJUZXh0IiwiVkJveCIsImFjaWRCYXNlU29sdXRpb25zIiwiQWNpZEJhc2VTb2x1dGlvbnNTdHJpbmdzIiwiQUJTQ29uc3RhbnRzIiwiUGhldEZvbnQiLCJQcm9wZXJ0eSIsIk51bWJlclNwaW5uZXIiLCJJbml0aWFsQ29uY2VudHJhdGlvblNsaWRlciIsIkNPTkNFTlRSQVRJT05fREVDSU1BTFMiLCJJbml0aWFsQ29uY2VudHJhdGlvbkNvbnRyb2wiLCJjb25zdHJ1Y3RvciIsImNvbmNlbnRyYXRpb25Qcm9wZXJ0eSIsInRhbmRlbSIsInRpdGxlVGV4dCIsImluaXRpYWxDb25jZW50cmF0aW9uU3RyaW5nUHJvcGVydHkiLCJmb250IiwiU1VCVElUTEVfRk9OVCIsIm1heFdpZHRoIiwibGF5b3V0T3B0aW9ucyIsImFsaWduIiwiY3JlYXRlVGFuZGVtIiwic3Bpbm5lciIsIkNPTkNFTlRSQVRJT05fUkFOR0UiLCJhcnJvd3NQb3NpdGlvbiIsInhTcGFjaW5nIiwiZGVsdGFWYWx1ZSIsIk1hdGgiLCJwb3ciLCJudW1iZXJEaXNwbGF5T3B0aW9ucyIsImRlY2ltYWxQbGFjZXMiLCJ0ZXh0T3B0aW9ucyIsImNvcm5lclJhZGl1cyIsInBoZXRpb1Zpc2libGVQcm9wZXJ0eUluc3RydW1lbnRlZCIsInRvdWNoQXJlYVhEaWxhdGlvbiIsInRvdWNoQXJlYVlEaWxhdGlvbiIsInNsaWRlciIsImNoaWxkcmVuIiwic3BhY2luZyIsInN0cmV0Y2giLCJkaXNwb3NlIiwiYXNzZXJ0IiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJJbml0aWFsQ29uY2VudHJhdGlvbkNvbnRyb2wudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMjIsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIEluaXRpYWxDb25jZW50cmF0aW9uQ29udHJvbCBpcyB0aGUgY29udHJvbCBmb3IgJ0luaXRpYWwgQ29uY2VudHJhdGlvbicgaW4gTXlTb2x1dGlvblBhbmVsLlxyXG4gKlxyXG4gKiBAYXV0aG9yIENocmlzIE1hbGxleSAoUGl4ZWxab29tLCBJbmMuKVxyXG4gKi9cclxuXHJcbmltcG9ydCB7IFRleHQsIFZCb3ggfSBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgYWNpZEJhc2VTb2x1dGlvbnMgZnJvbSAnLi4vLi4vYWNpZEJhc2VTb2x1dGlvbnMuanMnO1xyXG5pbXBvcnQgQWNpZEJhc2VTb2x1dGlvbnNTdHJpbmdzIGZyb20gJy4uLy4uL0FjaWRCYXNlU29sdXRpb25zU3RyaW5ncy5qcyc7XHJcbmltcG9ydCBBQlNDb25zdGFudHMgZnJvbSAnLi4vLi4vY29tbW9uL0FCU0NvbnN0YW50cy5qcyc7XHJcbmltcG9ydCBQaGV0Rm9udCBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5LXBoZXQvanMvUGhldEZvbnQuanMnO1xyXG5pbXBvcnQgUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9Qcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBOdW1iZXJTcGlubmVyIGZyb20gJy4uLy4uLy4uLy4uL3N1bi9qcy9OdW1iZXJTcGlubmVyLmpzJztcclxuaW1wb3J0IFRhbmRlbSBmcm9tICcuLi8uLi8uLi8uLi90YW5kZW0vanMvVGFuZGVtLmpzJztcclxuaW1wb3J0IEluaXRpYWxDb25jZW50cmF0aW9uU2xpZGVyIGZyb20gJy4vSW5pdGlhbENvbmNlbnRyYXRpb25TbGlkZXIuanMnO1xyXG5cclxuY29uc3QgQ09OQ0VOVFJBVElPTl9ERUNJTUFMUyA9IDM7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBJbml0aWFsQ29uY2VudHJhdGlvbkNvbnRyb2wgZXh0ZW5kcyBWQm94IHtcclxuXHJcbiAgcHVibGljIGNvbnN0cnVjdG9yKCBjb25jZW50cmF0aW9uUHJvcGVydHk6IFByb3BlcnR5PG51bWJlcj4sIHRhbmRlbTogVGFuZGVtICkge1xyXG5cclxuICAgIGNvbnN0IHRpdGxlVGV4dCA9IG5ldyBUZXh0KCBBY2lkQmFzZVNvbHV0aW9uc1N0cmluZ3MuaW5pdGlhbENvbmNlbnRyYXRpb25TdHJpbmdQcm9wZXJ0eSwge1xyXG4gICAgICBmb250OiBBQlNDb25zdGFudHMuU1VCVElUTEVfRk9OVCxcclxuICAgICAgbWF4V2lkdGg6IDE4MCwgLy8gZGV0ZXJtaW5lZCBlbXBpcmljYWxseSxcclxuICAgICAgbGF5b3V0T3B0aW9uczogeyBhbGlnbjogJ2xlZnQnIH0sXHJcbiAgICAgIHRhbmRlbTogdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ3RpdGxlVGV4dCcgKVxyXG4gICAgfSApO1xyXG5cclxuICAgIGNvbnN0IHNwaW5uZXIgPSBuZXcgTnVtYmVyU3Bpbm5lciggY29uY2VudHJhdGlvblByb3BlcnR5LCBuZXcgUHJvcGVydHkoIEFCU0NvbnN0YW50cy5DT05DRU5UUkFUSU9OX1JBTkdFICksIHtcclxuICAgICAgYXJyb3dzUG9zaXRpb246ICdsZWZ0UmlnaHQnLFxyXG4gICAgICB4U3BhY2luZzogOCxcclxuICAgICAgZGVsdGFWYWx1ZTogTWF0aC5wb3coIDEwLCAtQ09OQ0VOVFJBVElPTl9ERUNJTUFMUyApLFxyXG4gICAgICBudW1iZXJEaXNwbGF5T3B0aW9uczoge1xyXG4gICAgICAgIGRlY2ltYWxQbGFjZXM6IENPTkNFTlRSQVRJT05fREVDSU1BTFMsXHJcbiAgICAgICAgdGV4dE9wdGlvbnM6IHtcclxuICAgICAgICAgIGZvbnQ6IG5ldyBQaGV0Rm9udCggMTQgKVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgY29ybmVyUmFkaXVzOiA0LFxyXG4gICAgICAgIHBoZXRpb1Zpc2libGVQcm9wZXJ0eUluc3RydW1lbnRlZDogZmFsc2VcclxuICAgICAgfSxcclxuICAgICAgdG91Y2hBcmVhWERpbGF0aW9uOiA2LFxyXG4gICAgICB0b3VjaEFyZWFZRGlsYXRpb246IDYsXHJcbiAgICAgIHRhbmRlbTogdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ3NwaW5uZXInIClcclxuICAgIH0gKTtcclxuXHJcbiAgICBjb25zdCBzbGlkZXIgPSBuZXcgSW5pdGlhbENvbmNlbnRyYXRpb25TbGlkZXIoIGNvbmNlbnRyYXRpb25Qcm9wZXJ0eSwgQUJTQ29uc3RhbnRzLkNPTkNFTlRSQVRJT05fUkFOR0UsXHJcbiAgICAgIHRhbmRlbS5jcmVhdGVUYW5kZW0oICdzbGlkZXInICkgKTtcclxuXHJcbiAgICBzdXBlcigge1xyXG4gICAgICBjaGlsZHJlbjogW1xyXG4gICAgICAgIHRpdGxlVGV4dCxcclxuICAgICAgICBzcGlubmVyLFxyXG4gICAgICAgIHNsaWRlclxyXG4gICAgICBdLFxyXG4gICAgICBzcGFjaW5nOiA2LFxyXG4gICAgICBsYXlvdXRPcHRpb25zOiB7IHN0cmV0Y2g6IHRydWUgfSwgLy8gc28gdGhhdCB0aXRsZVRleHQgd2lsbCBiZSBsZWZ0LWFsaWduZWQgaW4gTXlTb2x1dGlvbnNQYW5lbFxyXG4gICAgICB0YW5kZW06IHRhbmRlbVxyXG4gICAgfSApO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIG92ZXJyaWRlIGRpc3Bvc2UoKTogdm9pZCB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBmYWxzZSwgJ2Rpc3Bvc2UgaXMgbm90IHN1cHBvcnRlZCwgZXhpc3RzIGZvciB0aGUgbGlmZXRpbWUgb2YgdGhlIHNpbScgKTtcclxuICAgIHN1cGVyLmRpc3Bvc2UoKTtcclxuICB9XHJcbn1cclxuXHJcbmFjaWRCYXNlU29sdXRpb25zLnJlZ2lzdGVyKCAnSW5pdGlhbENvbmNlbnRyYXRpb25Db250cm9sJywgSW5pdGlhbENvbmNlbnRyYXRpb25Db250cm9sICk7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLFNBQVNBLElBQUksRUFBRUMsSUFBSSxRQUFRLG1DQUFtQztBQUM5RCxPQUFPQyxpQkFBaUIsTUFBTSw0QkFBNEI7QUFDMUQsT0FBT0Msd0JBQXdCLE1BQU0sbUNBQW1DO0FBQ3hFLE9BQU9DLFlBQVksTUFBTSw4QkFBOEI7QUFDdkQsT0FBT0MsUUFBUSxNQUFNLHlDQUF5QztBQUM5RCxPQUFPQyxRQUFRLE1BQU0saUNBQWlDO0FBQ3RELE9BQU9DLGFBQWEsTUFBTSxxQ0FBcUM7QUFFL0QsT0FBT0MsMEJBQTBCLE1BQU0saUNBQWlDO0FBRXhFLE1BQU1DLHNCQUFzQixHQUFHLENBQUM7QUFFaEMsZUFBZSxNQUFNQywyQkFBMkIsU0FBU1QsSUFBSSxDQUFDO0VBRXJEVSxXQUFXQSxDQUFFQyxxQkFBdUMsRUFBRUMsTUFBYyxFQUFHO0lBRTVFLE1BQU1DLFNBQVMsR0FBRyxJQUFJZCxJQUFJLENBQUVHLHdCQUF3QixDQUFDWSxrQ0FBa0MsRUFBRTtNQUN2RkMsSUFBSSxFQUFFWixZQUFZLENBQUNhLGFBQWE7TUFDaENDLFFBQVEsRUFBRSxHQUFHO01BQUU7TUFDZkMsYUFBYSxFQUFFO1FBQUVDLEtBQUssRUFBRTtNQUFPLENBQUM7TUFDaENQLE1BQU0sRUFBRUEsTUFBTSxDQUFDUSxZQUFZLENBQUUsV0FBWTtJQUMzQyxDQUFFLENBQUM7SUFFSCxNQUFNQyxPQUFPLEdBQUcsSUFBSWYsYUFBYSxDQUFFSyxxQkFBcUIsRUFBRSxJQUFJTixRQUFRLENBQUVGLFlBQVksQ0FBQ21CLG1CQUFvQixDQUFDLEVBQUU7TUFDMUdDLGNBQWMsRUFBRSxXQUFXO01BQzNCQyxRQUFRLEVBQUUsQ0FBQztNQUNYQyxVQUFVLEVBQUVDLElBQUksQ0FBQ0MsR0FBRyxDQUFFLEVBQUUsRUFBRSxDQUFDbkIsc0JBQXVCLENBQUM7TUFDbkRvQixvQkFBb0IsRUFBRTtRQUNwQkMsYUFBYSxFQUFFckIsc0JBQXNCO1FBQ3JDc0IsV0FBVyxFQUFFO1VBQ1hmLElBQUksRUFBRSxJQUFJWCxRQUFRLENBQUUsRUFBRztRQUN6QixDQUFDO1FBQ0QyQixZQUFZLEVBQUUsQ0FBQztRQUNmQyxpQ0FBaUMsRUFBRTtNQUNyQyxDQUFDO01BQ0RDLGtCQUFrQixFQUFFLENBQUM7TUFDckJDLGtCQUFrQixFQUFFLENBQUM7TUFDckJ0QixNQUFNLEVBQUVBLE1BQU0sQ0FBQ1EsWUFBWSxDQUFFLFNBQVU7SUFDekMsQ0FBRSxDQUFDO0lBRUgsTUFBTWUsTUFBTSxHQUFHLElBQUk1QiwwQkFBMEIsQ0FBRUkscUJBQXFCLEVBQUVSLFlBQVksQ0FBQ21CLG1CQUFtQixFQUNwR1YsTUFBTSxDQUFDUSxZQUFZLENBQUUsUUFBUyxDQUFFLENBQUM7SUFFbkMsS0FBSyxDQUFFO01BQ0xnQixRQUFRLEVBQUUsQ0FDUnZCLFNBQVMsRUFDVFEsT0FBTyxFQUNQYyxNQUFNLENBQ1A7TUFDREUsT0FBTyxFQUFFLENBQUM7TUFDVm5CLGFBQWEsRUFBRTtRQUFFb0IsT0FBTyxFQUFFO01BQUssQ0FBQztNQUFFO01BQ2xDMUIsTUFBTSxFQUFFQTtJQUNWLENBQUUsQ0FBQztFQUNMO0VBRWdCMkIsT0FBT0EsQ0FBQSxFQUFTO0lBQzlCQyxNQUFNLElBQUlBLE1BQU0sQ0FBRSxLQUFLLEVBQUUsOERBQStELENBQUM7SUFDekYsS0FBSyxDQUFDRCxPQUFPLENBQUMsQ0FBQztFQUNqQjtBQUNGO0FBRUF0QyxpQkFBaUIsQ0FBQ3dDLFFBQVEsQ0FBRSw2QkFBNkIsRUFBRWhDLDJCQUE0QixDQUFDIn0=