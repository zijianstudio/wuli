// Copyright 2014-2023, University of Colorado Boulder

/**
 * Scenery node for the Attach/Detach toggle buttons which determine whether the skater can fly off the track or not.
 * This was formerly called "roller coaster mode"
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import merge from '../../../../phet-core/js/merge.js';
import { Image } from '../../../../scenery/js/imports.js';
import RectangularRadioButtonGroup from '../../../../sun/js/buttons/RectangularRadioButtonGroup.js';
import Panel from '../../../../sun/js/Panel.js';
import attach_png from '../../../images/attach_png.js';
import detach_png from '../../../images/detach_png.js';
import energySkatePark from '../../energySkatePark.js';
import EnergySkateParkConstants from '../EnergySkateParkConstants.js';

// constants
const SELECTED_LINE_WIDTH = 2.3;
class AttachDetachToggleButtons extends Panel {
  /**
   * Constructor for the AttachDetachToggleButtons
   * @param {Property.<Boolean>} stickingToTrackProperty Axon property that is false if the model state allows the skater to detach
   * @param {Property.<Boolean>} enabledProperty Axon property that is true if the control is enabled
   * @param {number} contentWidth Width for the control panel, to match the layout of the rest of the controls.
   * @param {Tandem} tandem
   * @param {Object} [options]
   */
  constructor(stickingToTrackProperty, enabledProperty, contentWidth, tandem, options) {
    // Match the style of the EnergySkateParkControlPanel
    options = merge({
      xMargin: 15,
      yMargin: 5
    }, EnergySkateParkConstants.PANEL_OPTIONS, options);

    // This is sort of hack to pass through the tandem of the radioButtonGroupMember to its child.
    const attachRadioButtonTandemName = 'attachRadioButton';
    const detachRadioButtonTandemName = 'detachRadioButton';
    const radioButtonGroupTandem = tandem.createTandem('radioButtonGroup');

    // @param {image} image - data for an Image Node
    // @param {string} tandemName
    const createButtonContent = (image, tandemName) => {
      return new Image(image, {
        scale: 0.4,
        tandem: radioButtonGroupTandem.createTandem(attachRadioButtonTandemName).createTandem(tandemName)
      });
    };
    const buttonContent0 = createButtonContent(attach_png, 'attachIcon');
    const radioButtonsContent = [{
      value: true,
      createNode: () => buttonContent0,
      tandemName: attachRadioButtonTandemName
    }, {
      value: false,
      createNode: () => createButtonContent(detach_png, 'detachIcon'),
      tandemName: detachRadioButtonTandemName
    }];
    const buttonSpacing = contentWidth - options.xMargin * 2 - buttonContent0.width * 2 - SELECTED_LINE_WIDTH * 2;
    assert && assert(buttonSpacing > 0, 'buttons must have non zero spacing');
    const radioButtonGroup = new RectangularRadioButtonGroup(stickingToTrackProperty, radioButtonsContent, {
      orientation: 'horizontal',
      spacing: buttonSpacing,
      radioButtonOptions: {
        xMargin: 0,
        yMargin: 0,
        baseColor: 'white',
        cornerRadius: 6,
        buttonAppearanceStrategyOptions: {
          selectedLineWidth: SELECTED_LINE_WIDTH,
          selectedStroke: '#3291b8',
          deselectedStroke: 'gray'
        }
      },
      tandem: radioButtonGroupTandem
    });
    const panelOptions = merge({
      tandem: tandem
    }, options);
    super(radioButtonGroup, panelOptions);
  }
}
energySkatePark.register('AttachDetachToggleButtons', AttachDetachToggleButtons);
export default AttachDetachToggleButtons;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJtZXJnZSIsIkltYWdlIiwiUmVjdGFuZ3VsYXJSYWRpb0J1dHRvbkdyb3VwIiwiUGFuZWwiLCJhdHRhY2hfcG5nIiwiZGV0YWNoX3BuZyIsImVuZXJneVNrYXRlUGFyayIsIkVuZXJneVNrYXRlUGFya0NvbnN0YW50cyIsIlNFTEVDVEVEX0xJTkVfV0lEVEgiLCJBdHRhY2hEZXRhY2hUb2dnbGVCdXR0b25zIiwiY29uc3RydWN0b3IiLCJzdGlja2luZ1RvVHJhY2tQcm9wZXJ0eSIsImVuYWJsZWRQcm9wZXJ0eSIsImNvbnRlbnRXaWR0aCIsInRhbmRlbSIsIm9wdGlvbnMiLCJ4TWFyZ2luIiwieU1hcmdpbiIsIlBBTkVMX09QVElPTlMiLCJhdHRhY2hSYWRpb0J1dHRvblRhbmRlbU5hbWUiLCJkZXRhY2hSYWRpb0J1dHRvblRhbmRlbU5hbWUiLCJyYWRpb0J1dHRvbkdyb3VwVGFuZGVtIiwiY3JlYXRlVGFuZGVtIiwiY3JlYXRlQnV0dG9uQ29udGVudCIsImltYWdlIiwidGFuZGVtTmFtZSIsInNjYWxlIiwiYnV0dG9uQ29udGVudDAiLCJyYWRpb0J1dHRvbnNDb250ZW50IiwidmFsdWUiLCJjcmVhdGVOb2RlIiwiYnV0dG9uU3BhY2luZyIsIndpZHRoIiwiYXNzZXJ0IiwicmFkaW9CdXR0b25Hcm91cCIsIm9yaWVudGF0aW9uIiwic3BhY2luZyIsInJhZGlvQnV0dG9uT3B0aW9ucyIsImJhc2VDb2xvciIsImNvcm5lclJhZGl1cyIsImJ1dHRvbkFwcGVhcmFuY2VTdHJhdGVneU9wdGlvbnMiLCJzZWxlY3RlZExpbmVXaWR0aCIsInNlbGVjdGVkU3Ryb2tlIiwiZGVzZWxlY3RlZFN0cm9rZSIsInBhbmVsT3B0aW9ucyIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiQXR0YWNoRGV0YWNoVG9nZ2xlQnV0dG9ucy5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNC0yMDIzLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBTY2VuZXJ5IG5vZGUgZm9yIHRoZSBBdHRhY2gvRGV0YWNoIHRvZ2dsZSBidXR0b25zIHdoaWNoIGRldGVybWluZSB3aGV0aGVyIHRoZSBza2F0ZXIgY2FuIGZseSBvZmYgdGhlIHRyYWNrIG9yIG5vdC5cclxuICogVGhpcyB3YXMgZm9ybWVybHkgY2FsbGVkIFwicm9sbGVyIGNvYXN0ZXIgbW9kZVwiXHJcbiAqXHJcbiAqIEBhdXRob3IgU2FtIFJlaWQgKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXHJcbiAqL1xyXG5cclxuaW1wb3J0IG1lcmdlIGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9tZXJnZS5qcyc7XHJcbmltcG9ydCB7IEltYWdlIH0gZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS9qcy9pbXBvcnRzLmpzJztcclxuaW1wb3J0IFJlY3Rhbmd1bGFyUmFkaW9CdXR0b25Hcm91cCBmcm9tICcuLi8uLi8uLi8uLi9zdW4vanMvYnV0dG9ucy9SZWN0YW5ndWxhclJhZGlvQnV0dG9uR3JvdXAuanMnO1xyXG5pbXBvcnQgUGFuZWwgZnJvbSAnLi4vLi4vLi4vLi4vc3VuL2pzL1BhbmVsLmpzJztcclxuaW1wb3J0IGF0dGFjaF9wbmcgZnJvbSAnLi4vLi4vLi4vaW1hZ2VzL2F0dGFjaF9wbmcuanMnO1xyXG5pbXBvcnQgZGV0YWNoX3BuZyBmcm9tICcuLi8uLi8uLi9pbWFnZXMvZGV0YWNoX3BuZy5qcyc7XHJcbmltcG9ydCBlbmVyZ3lTa2F0ZVBhcmsgZnJvbSAnLi4vLi4vZW5lcmd5U2thdGVQYXJrLmpzJztcclxuaW1wb3J0IEVuZXJneVNrYXRlUGFya0NvbnN0YW50cyBmcm9tICcuLi9FbmVyZ3lTa2F0ZVBhcmtDb25zdGFudHMuanMnO1xyXG5cclxuLy8gY29uc3RhbnRzXHJcbmNvbnN0IFNFTEVDVEVEX0xJTkVfV0lEVEggPSAyLjM7XHJcblxyXG5jbGFzcyBBdHRhY2hEZXRhY2hUb2dnbGVCdXR0b25zIGV4dGVuZHMgUGFuZWwge1xyXG5cclxuICAvKipcclxuICAgKiBDb25zdHJ1Y3RvciBmb3IgdGhlIEF0dGFjaERldGFjaFRvZ2dsZUJ1dHRvbnNcclxuICAgKiBAcGFyYW0ge1Byb3BlcnR5LjxCb29sZWFuPn0gc3RpY2tpbmdUb1RyYWNrUHJvcGVydHkgQXhvbiBwcm9wZXJ0eSB0aGF0IGlzIGZhbHNlIGlmIHRoZSBtb2RlbCBzdGF0ZSBhbGxvd3MgdGhlIHNrYXRlciB0byBkZXRhY2hcclxuICAgKiBAcGFyYW0ge1Byb3BlcnR5LjxCb29sZWFuPn0gZW5hYmxlZFByb3BlcnR5IEF4b24gcHJvcGVydHkgdGhhdCBpcyB0cnVlIGlmIHRoZSBjb250cm9sIGlzIGVuYWJsZWRcclxuICAgKiBAcGFyYW0ge251bWJlcn0gY29udGVudFdpZHRoIFdpZHRoIGZvciB0aGUgY29udHJvbCBwYW5lbCwgdG8gbWF0Y2ggdGhlIGxheW91dCBvZiB0aGUgcmVzdCBvZiB0aGUgY29udHJvbHMuXHJcbiAgICogQHBhcmFtIHtUYW5kZW19IHRhbmRlbVxyXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9uc11cclxuICAgKi9cclxuICBjb25zdHJ1Y3Rvciggc3RpY2tpbmdUb1RyYWNrUHJvcGVydHksIGVuYWJsZWRQcm9wZXJ0eSwgY29udGVudFdpZHRoLCB0YW5kZW0sIG9wdGlvbnMgKSB7XHJcblxyXG4gICAgLy8gTWF0Y2ggdGhlIHN0eWxlIG9mIHRoZSBFbmVyZ3lTa2F0ZVBhcmtDb250cm9sUGFuZWxcclxuICAgIG9wdGlvbnMgPSBtZXJnZSgge1xyXG4gICAgICB4TWFyZ2luOiAxNSxcclxuICAgICAgeU1hcmdpbjogNVxyXG4gICAgfSwgRW5lcmd5U2thdGVQYXJrQ29uc3RhbnRzLlBBTkVMX09QVElPTlMsIG9wdGlvbnMgKTtcclxuXHJcbiAgICAvLyBUaGlzIGlzIHNvcnQgb2YgaGFjayB0byBwYXNzIHRocm91Z2ggdGhlIHRhbmRlbSBvZiB0aGUgcmFkaW9CdXR0b25Hcm91cE1lbWJlciB0byBpdHMgY2hpbGQuXHJcbiAgICBjb25zdCBhdHRhY2hSYWRpb0J1dHRvblRhbmRlbU5hbWUgPSAnYXR0YWNoUmFkaW9CdXR0b24nO1xyXG4gICAgY29uc3QgZGV0YWNoUmFkaW9CdXR0b25UYW5kZW1OYW1lID0gJ2RldGFjaFJhZGlvQnV0dG9uJztcclxuICAgIGNvbnN0IHJhZGlvQnV0dG9uR3JvdXBUYW5kZW0gPSB0YW5kZW0uY3JlYXRlVGFuZGVtKCAncmFkaW9CdXR0b25Hcm91cCcgKTtcclxuXHJcbiAgICAvLyBAcGFyYW0ge2ltYWdlfSBpbWFnZSAtIGRhdGEgZm9yIGFuIEltYWdlIE5vZGVcclxuICAgIC8vIEBwYXJhbSB7c3RyaW5nfSB0YW5kZW1OYW1lXHJcbiAgICBjb25zdCBjcmVhdGVCdXR0b25Db250ZW50ID0gKCBpbWFnZSwgdGFuZGVtTmFtZSApID0+IHtcclxuICAgICAgcmV0dXJuIG5ldyBJbWFnZSggaW1hZ2UsIHtcclxuICAgICAgICBzY2FsZTogMC40LFxyXG4gICAgICAgIHRhbmRlbTogcmFkaW9CdXR0b25Hcm91cFRhbmRlbS5jcmVhdGVUYW5kZW0oIGF0dGFjaFJhZGlvQnV0dG9uVGFuZGVtTmFtZSApLmNyZWF0ZVRhbmRlbSggdGFuZGVtTmFtZSApXHJcbiAgICAgIH0gKTtcclxuICAgIH07XHJcblxyXG4gICAgY29uc3QgYnV0dG9uQ29udGVudDAgPSBjcmVhdGVCdXR0b25Db250ZW50KCBhdHRhY2hfcG5nLCAnYXR0YWNoSWNvbicgKTtcclxuXHJcbiAgICBjb25zdCByYWRpb0J1dHRvbnNDb250ZW50ID0gW1xyXG4gICAgICB7XHJcbiAgICAgICAgdmFsdWU6IHRydWUsXHJcbiAgICAgICAgY3JlYXRlTm9kZTogKCkgPT4gYnV0dG9uQ29udGVudDAsXHJcbiAgICAgICAgdGFuZGVtTmFtZTogYXR0YWNoUmFkaW9CdXR0b25UYW5kZW1OYW1lXHJcbiAgICAgIH0sXHJcbiAgICAgIHtcclxuICAgICAgICB2YWx1ZTogZmFsc2UsXHJcbiAgICAgICAgY3JlYXRlTm9kZTogKCkgPT4gY3JlYXRlQnV0dG9uQ29udGVudCggZGV0YWNoX3BuZywgJ2RldGFjaEljb24nICksXHJcbiAgICAgICAgdGFuZGVtTmFtZTogZGV0YWNoUmFkaW9CdXR0b25UYW5kZW1OYW1lXHJcbiAgICAgIH1cclxuICAgIF07XHJcblxyXG4gICAgY29uc3QgYnV0dG9uU3BhY2luZyA9IGNvbnRlbnRXaWR0aCAtICggb3B0aW9ucy54TWFyZ2luICogMiApIC0gKCBidXR0b25Db250ZW50MC53aWR0aCAqIDIgKSAtIFNFTEVDVEVEX0xJTkVfV0lEVEggKiAyO1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggYnV0dG9uU3BhY2luZyA+IDAsICdidXR0b25zIG11c3QgaGF2ZSBub24gemVybyBzcGFjaW5nJyApO1xyXG5cclxuICAgIGNvbnN0IHJhZGlvQnV0dG9uR3JvdXAgPSBuZXcgUmVjdGFuZ3VsYXJSYWRpb0J1dHRvbkdyb3VwKCBzdGlja2luZ1RvVHJhY2tQcm9wZXJ0eSwgcmFkaW9CdXR0b25zQ29udGVudCwge1xyXG4gICAgICBvcmllbnRhdGlvbjogJ2hvcml6b250YWwnLFxyXG4gICAgICBzcGFjaW5nOiBidXR0b25TcGFjaW5nLFxyXG4gICAgICByYWRpb0J1dHRvbk9wdGlvbnM6IHtcclxuICAgICAgICB4TWFyZ2luOiAwLFxyXG4gICAgICAgIHlNYXJnaW46IDAsXHJcbiAgICAgICAgYmFzZUNvbG9yOiAnd2hpdGUnLFxyXG4gICAgICAgIGNvcm5lclJhZGl1czogNixcclxuICAgICAgICBidXR0b25BcHBlYXJhbmNlU3RyYXRlZ3lPcHRpb25zOiB7XHJcbiAgICAgICAgICBzZWxlY3RlZExpbmVXaWR0aDogU0VMRUNURURfTElORV9XSURUSCxcclxuICAgICAgICAgIHNlbGVjdGVkU3Ryb2tlOiAnIzMyOTFiOCcsXHJcbiAgICAgICAgICBkZXNlbGVjdGVkU3Ryb2tlOiAnZ3JheSdcclxuICAgICAgICB9XHJcbiAgICAgIH0sXHJcbiAgICAgIHRhbmRlbTogcmFkaW9CdXR0b25Hcm91cFRhbmRlbVxyXG4gICAgfSApO1xyXG5cclxuICAgIGNvbnN0IHBhbmVsT3B0aW9ucyA9IG1lcmdlKCB7IHRhbmRlbTogdGFuZGVtIH0sIG9wdGlvbnMgKTtcclxuICAgIHN1cGVyKCByYWRpb0J1dHRvbkdyb3VwLCBwYW5lbE9wdGlvbnMgKTtcclxuICB9XHJcbn1cclxuXHJcbmVuZXJneVNrYXRlUGFyay5yZWdpc3RlciggJ0F0dGFjaERldGFjaFRvZ2dsZUJ1dHRvbnMnLCBBdHRhY2hEZXRhY2hUb2dnbGVCdXR0b25zICk7XHJcbmV4cG9ydCBkZWZhdWx0IEF0dGFjaERldGFjaFRvZ2dsZUJ1dHRvbnM7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsS0FBSyxNQUFNLG1DQUFtQztBQUNyRCxTQUFTQyxLQUFLLFFBQVEsbUNBQW1DO0FBQ3pELE9BQU9DLDJCQUEyQixNQUFNLDJEQUEyRDtBQUNuRyxPQUFPQyxLQUFLLE1BQU0sNkJBQTZCO0FBQy9DLE9BQU9DLFVBQVUsTUFBTSwrQkFBK0I7QUFDdEQsT0FBT0MsVUFBVSxNQUFNLCtCQUErQjtBQUN0RCxPQUFPQyxlQUFlLE1BQU0sMEJBQTBCO0FBQ3RELE9BQU9DLHdCQUF3QixNQUFNLGdDQUFnQzs7QUFFckU7QUFDQSxNQUFNQyxtQkFBbUIsR0FBRyxHQUFHO0FBRS9CLE1BQU1DLHlCQUF5QixTQUFTTixLQUFLLENBQUM7RUFFNUM7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNFTyxXQUFXQSxDQUFFQyx1QkFBdUIsRUFBRUMsZUFBZSxFQUFFQyxZQUFZLEVBQUVDLE1BQU0sRUFBRUMsT0FBTyxFQUFHO0lBRXJGO0lBQ0FBLE9BQU8sR0FBR2YsS0FBSyxDQUFFO01BQ2ZnQixPQUFPLEVBQUUsRUFBRTtNQUNYQyxPQUFPLEVBQUU7SUFDWCxDQUFDLEVBQUVWLHdCQUF3QixDQUFDVyxhQUFhLEVBQUVILE9BQVEsQ0FBQzs7SUFFcEQ7SUFDQSxNQUFNSSwyQkFBMkIsR0FBRyxtQkFBbUI7SUFDdkQsTUFBTUMsMkJBQTJCLEdBQUcsbUJBQW1CO0lBQ3ZELE1BQU1DLHNCQUFzQixHQUFHUCxNQUFNLENBQUNRLFlBQVksQ0FBRSxrQkFBbUIsQ0FBQzs7SUFFeEU7SUFDQTtJQUNBLE1BQU1DLG1CQUFtQixHQUFHQSxDQUFFQyxLQUFLLEVBQUVDLFVBQVUsS0FBTTtNQUNuRCxPQUFPLElBQUl4QixLQUFLLENBQUV1QixLQUFLLEVBQUU7UUFDdkJFLEtBQUssRUFBRSxHQUFHO1FBQ1ZaLE1BQU0sRUFBRU8sc0JBQXNCLENBQUNDLFlBQVksQ0FBRUgsMkJBQTRCLENBQUMsQ0FBQ0csWUFBWSxDQUFFRyxVQUFXO01BQ3RHLENBQUUsQ0FBQztJQUNMLENBQUM7SUFFRCxNQUFNRSxjQUFjLEdBQUdKLG1CQUFtQixDQUFFbkIsVUFBVSxFQUFFLFlBQWEsQ0FBQztJQUV0RSxNQUFNd0IsbUJBQW1CLEdBQUcsQ0FDMUI7TUFDRUMsS0FBSyxFQUFFLElBQUk7TUFDWEMsVUFBVSxFQUFFQSxDQUFBLEtBQU1ILGNBQWM7TUFDaENGLFVBQVUsRUFBRU47SUFDZCxDQUFDLEVBQ0Q7TUFDRVUsS0FBSyxFQUFFLEtBQUs7TUFDWkMsVUFBVSxFQUFFQSxDQUFBLEtBQU1QLG1CQUFtQixDQUFFbEIsVUFBVSxFQUFFLFlBQWEsQ0FBQztNQUNqRW9CLFVBQVUsRUFBRUw7SUFDZCxDQUFDLENBQ0Y7SUFFRCxNQUFNVyxhQUFhLEdBQUdsQixZQUFZLEdBQUtFLE9BQU8sQ0FBQ0MsT0FBTyxHQUFHLENBQUcsR0FBS1csY0FBYyxDQUFDSyxLQUFLLEdBQUcsQ0FBRyxHQUFHeEIsbUJBQW1CLEdBQUcsQ0FBQztJQUNySHlCLE1BQU0sSUFBSUEsTUFBTSxDQUFFRixhQUFhLEdBQUcsQ0FBQyxFQUFFLG9DQUFxQyxDQUFDO0lBRTNFLE1BQU1HLGdCQUFnQixHQUFHLElBQUloQywyQkFBMkIsQ0FBRVMsdUJBQXVCLEVBQUVpQixtQkFBbUIsRUFBRTtNQUN0R08sV0FBVyxFQUFFLFlBQVk7TUFDekJDLE9BQU8sRUFBRUwsYUFBYTtNQUN0Qk0sa0JBQWtCLEVBQUU7UUFDbEJyQixPQUFPLEVBQUUsQ0FBQztRQUNWQyxPQUFPLEVBQUUsQ0FBQztRQUNWcUIsU0FBUyxFQUFFLE9BQU87UUFDbEJDLFlBQVksRUFBRSxDQUFDO1FBQ2ZDLCtCQUErQixFQUFFO1VBQy9CQyxpQkFBaUIsRUFBRWpDLG1CQUFtQjtVQUN0Q2tDLGNBQWMsRUFBRSxTQUFTO1VBQ3pCQyxnQkFBZ0IsRUFBRTtRQUNwQjtNQUNGLENBQUM7TUFDRDdCLE1BQU0sRUFBRU87SUFDVixDQUFFLENBQUM7SUFFSCxNQUFNdUIsWUFBWSxHQUFHNUMsS0FBSyxDQUFFO01BQUVjLE1BQU0sRUFBRUE7SUFBTyxDQUFDLEVBQUVDLE9BQVEsQ0FBQztJQUN6RCxLQUFLLENBQUVtQixnQkFBZ0IsRUFBRVUsWUFBYSxDQUFDO0VBQ3pDO0FBQ0Y7QUFFQXRDLGVBQWUsQ0FBQ3VDLFFBQVEsQ0FBRSwyQkFBMkIsRUFBRXBDLHlCQUEwQixDQUFDO0FBQ2xGLGVBQWVBLHlCQUF5QiJ9