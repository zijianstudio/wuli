// Copyright 2018-2023, University of Colorado Boulder

/**
 * A dialog that the client displays when the user gets a specific number of stars.
 * See specification in https://github.com/phetsims/vegas/issues/59.
 *
 * @author Andrea Lin
 * @author Chris Malley (PixelZoom, Inc.)
 */

import NumberProperty from '../../axon/js/NumberProperty.js';
import optionize, { combineOptions } from '../../phet-core/js/optionize.js';
import PhetColorScheme from '../../scenery-phet/js/PhetColorScheme.js';
import PhetFont from '../../scenery-phet/js/PhetFont.js';
import { HBox, Image, Text, VBox } from '../../scenery/js/imports.js';
import RectangularPushButton from '../../sun/js/buttons/RectangularPushButton.js';
import Dialog from '../../sun/js/Dialog.js';
import phetGirlJugglingStars_png from '../images/phetGirlJugglingStars_png.js';
import ScoreDisplayNumberAndStar from './ScoreDisplayNumberAndStar.js';
import vegas from './vegas.js';
import VegasStrings from './VegasStrings.js';
import Tandem from '../../tandem/js/Tandem.js';

// constants
const DEFAULT_BUTTONS_FONT = new PhetFont(20);
const DEFAULT_SCORE_DISPLAY_FONT = new PhetFont({
  size: 38,
  weight: 'bold'
});
export default class RewardDialog extends Dialog {
  constructor(score, providedOptions) {
    const options = optionize()({
      // RewardDialogOptions
      phetGirlScale: 0.6,
      buttonsFont: DEFAULT_BUTTONS_FONT,
      buttonsWidth: 145,
      buttonsYSpacing: 20,
      keepGoingButtonListener: _.noop,
      newLevelButtonListener: _.noop,
      scoreDisplayOptions: {
        font: DEFAULT_SCORE_DISPLAY_FONT,
        spacing: 8,
        starNodeOptions: {
          starShapeOptions: {
            outerRadius: 20,
            innerRadius: 10
          },
          filledLineWidth: 2
        }
      },
      // DialogOptions
      // pdom - Since we are setting the focusOnShowNode to be the first element in content, put the closeButton last
      closeButtonLastInPDOM: true,
      tandem: Tandem.OPTIONAL
    }, providedOptions);
    const phetGirlNode = new Image(phetGirlJugglingStars_png, {
      scale: options.phetGirlScale
    });
    const scoreProperty = typeof score === 'number' ? new NumberProperty(score) : score;
    const scoreDisplay = new ScoreDisplayNumberAndStar(scoreProperty, options.scoreDisplayOptions);
    const buttonOptions = {
      font: options.buttonsFont,
      minWidth: options.buttonsWidth,
      maxWidth: options.buttonsWidth
    };
    const textOptions = {
      font: DEFAULT_BUTTONS_FONT,
      maxWidth: options.buttonsWidth * 0.9
    };
    const newLevelButton = new RectangularPushButton(combineOptions({}, buttonOptions, {
      content: new Text(VegasStrings.newLevelStringProperty, textOptions),
      listener: options.newLevelButtonListener,
      baseColor: PhetColorScheme.PHET_LOGO_YELLOW,
      tandem: options.tandem.createTandem('newLevelButton')
    }));
    const keepGoingButton = new RectangularPushButton(combineOptions({}, buttonOptions, {
      content: new Text(VegasStrings.keepGoingStringProperty, textOptions),
      listener: options.keepGoingButtonListener,
      baseColor: 'white',
      tandem: options.tandem.createTandem('keepGoingButton')
    }));
    const buttons = new VBox({
      children: [newLevelButton, keepGoingButton],
      spacing: options.buttonsYSpacing
    });

    // half the remaining height, so that scoreDisplay will be centered in the negative space above the buttons.
    const scoreSpacing = (phetGirlNode.height - scoreDisplay.height - buttons.height) / 2;
    assert && assert(scoreSpacing > 0, 'phetGirlNode is scaled down too much');
    const rightSideNode = new VBox({
      children: [scoreDisplay, buttons],
      align: 'center',
      spacing: scoreSpacing
    });
    const content = new HBox({
      align: 'bottom',
      children: [phetGirlNode, rightSideNode],
      spacing: 52
    });
    options.focusOnShowNode = newLevelButton;
    super(content, options);
  }
}
vegas.register('RewardDialog', RewardDialog);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJOdW1iZXJQcm9wZXJ0eSIsIm9wdGlvbml6ZSIsImNvbWJpbmVPcHRpb25zIiwiUGhldENvbG9yU2NoZW1lIiwiUGhldEZvbnQiLCJIQm94IiwiSW1hZ2UiLCJUZXh0IiwiVkJveCIsIlJlY3Rhbmd1bGFyUHVzaEJ1dHRvbiIsIkRpYWxvZyIsInBoZXRHaXJsSnVnZ2xpbmdTdGFyc19wbmciLCJTY29yZURpc3BsYXlOdW1iZXJBbmRTdGFyIiwidmVnYXMiLCJWZWdhc1N0cmluZ3MiLCJUYW5kZW0iLCJERUZBVUxUX0JVVFRPTlNfRk9OVCIsIkRFRkFVTFRfU0NPUkVfRElTUExBWV9GT05UIiwic2l6ZSIsIndlaWdodCIsIlJld2FyZERpYWxvZyIsImNvbnN0cnVjdG9yIiwic2NvcmUiLCJwcm92aWRlZE9wdGlvbnMiLCJvcHRpb25zIiwicGhldEdpcmxTY2FsZSIsImJ1dHRvbnNGb250IiwiYnV0dG9uc1dpZHRoIiwiYnV0dG9uc1lTcGFjaW5nIiwia2VlcEdvaW5nQnV0dG9uTGlzdGVuZXIiLCJfIiwibm9vcCIsIm5ld0xldmVsQnV0dG9uTGlzdGVuZXIiLCJzY29yZURpc3BsYXlPcHRpb25zIiwiZm9udCIsInNwYWNpbmciLCJzdGFyTm9kZU9wdGlvbnMiLCJzdGFyU2hhcGVPcHRpb25zIiwib3V0ZXJSYWRpdXMiLCJpbm5lclJhZGl1cyIsImZpbGxlZExpbmVXaWR0aCIsImNsb3NlQnV0dG9uTGFzdEluUERPTSIsInRhbmRlbSIsIk9QVElPTkFMIiwicGhldEdpcmxOb2RlIiwic2NhbGUiLCJzY29yZVByb3BlcnR5Iiwic2NvcmVEaXNwbGF5IiwiYnV0dG9uT3B0aW9ucyIsIm1pbldpZHRoIiwibWF4V2lkdGgiLCJ0ZXh0T3B0aW9ucyIsIm5ld0xldmVsQnV0dG9uIiwiY29udGVudCIsIm5ld0xldmVsU3RyaW5nUHJvcGVydHkiLCJsaXN0ZW5lciIsImJhc2VDb2xvciIsIlBIRVRfTE9HT19ZRUxMT1ciLCJjcmVhdGVUYW5kZW0iLCJrZWVwR29pbmdCdXR0b24iLCJrZWVwR29pbmdTdHJpbmdQcm9wZXJ0eSIsImJ1dHRvbnMiLCJjaGlsZHJlbiIsInNjb3JlU3BhY2luZyIsImhlaWdodCIsImFzc2VydCIsInJpZ2h0U2lkZU5vZGUiLCJhbGlnbiIsImZvY3VzT25TaG93Tm9kZSIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiUmV3YXJkRGlhbG9nLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE4LTIwMjMsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIEEgZGlhbG9nIHRoYXQgdGhlIGNsaWVudCBkaXNwbGF5cyB3aGVuIHRoZSB1c2VyIGdldHMgYSBzcGVjaWZpYyBudW1iZXIgb2Ygc3RhcnMuXHJcbiAqIFNlZSBzcGVjaWZpY2F0aW9uIGluIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy92ZWdhcy9pc3N1ZXMvNTkuXHJcbiAqXHJcbiAqIEBhdXRob3IgQW5kcmVhIExpblxyXG4gKiBAYXV0aG9yIENocmlzIE1hbGxleSAoUGl4ZWxab29tLCBJbmMuKVxyXG4gKi9cclxuXHJcbmltcG9ydCBOdW1iZXJQcm9wZXJ0eSBmcm9tICcuLi8uLi9heG9uL2pzL051bWJlclByb3BlcnR5LmpzJztcclxuaW1wb3J0IFN0cmljdE9taXQgZnJvbSAnLi4vLi4vcGhldC1jb3JlL2pzL3R5cGVzL1N0cmljdE9taXQuanMnO1xyXG5pbXBvcnQgb3B0aW9uaXplLCB7IGNvbWJpbmVPcHRpb25zIH0gZnJvbSAnLi4vLi4vcGhldC1jb3JlL2pzL29wdGlvbml6ZS5qcyc7XHJcbmltcG9ydCBQaGV0Q29sb3JTY2hlbWUgZnJvbSAnLi4vLi4vc2NlbmVyeS1waGV0L2pzL1BoZXRDb2xvclNjaGVtZS5qcyc7XHJcbmltcG9ydCBQaGV0Rm9udCBmcm9tICcuLi8uLi9zY2VuZXJ5LXBoZXQvanMvUGhldEZvbnQuanMnO1xyXG5pbXBvcnQgeyBGb250LCBIQm94LCBJbWFnZSwgVGV4dCwgVkJveCB9IGZyb20gJy4uLy4uL3NjZW5lcnkvanMvaW1wb3J0cy5qcyc7XHJcbmltcG9ydCB7IFB1c2hCdXR0b25MaXN0ZW5lciB9IGZyb20gJy4uLy4uL3N1bi9qcy9idXR0b25zL1B1c2hCdXR0b25Nb2RlbC5qcyc7XHJcbmltcG9ydCBSZWN0YW5ndWxhclB1c2hCdXR0b24sIHsgUmVjdGFuZ3VsYXJQdXNoQnV0dG9uT3B0aW9ucyB9IGZyb20gJy4uLy4uL3N1bi9qcy9idXR0b25zL1JlY3Rhbmd1bGFyUHVzaEJ1dHRvbi5qcyc7XHJcbmltcG9ydCBEaWFsb2csIHsgRGlhbG9nT3B0aW9ucyB9IGZyb20gJy4uLy4uL3N1bi9qcy9EaWFsb2cuanMnO1xyXG5pbXBvcnQgcGhldEdpcmxKdWdnbGluZ1N0YXJzX3BuZyBmcm9tICcuLi9pbWFnZXMvcGhldEdpcmxKdWdnbGluZ1N0YXJzX3BuZy5qcyc7XHJcbmltcG9ydCBTY29yZURpc3BsYXlOdW1iZXJBbmRTdGFyLCB7IFNjb3JlRGlzcGxheU51bWJlckFuZFN0YXJPcHRpb25zIH0gZnJvbSAnLi9TY29yZURpc3BsYXlOdW1iZXJBbmRTdGFyLmpzJztcclxuaW1wb3J0IHZlZ2FzIGZyb20gJy4vdmVnYXMuanMnO1xyXG5pbXBvcnQgVmVnYXNTdHJpbmdzIGZyb20gJy4vVmVnYXNTdHJpbmdzLmpzJztcclxuaW1wb3J0IFRSZWFkT25seVByb3BlcnR5IGZyb20gJy4uLy4uL2F4b24vanMvVFJlYWRPbmx5UHJvcGVydHkuanMnO1xyXG5pbXBvcnQgVGFuZGVtIGZyb20gJy4uLy4uL3RhbmRlbS9qcy9UYW5kZW0uanMnO1xyXG5cclxuLy8gY29uc3RhbnRzXHJcbmNvbnN0IERFRkFVTFRfQlVUVE9OU19GT05UID0gbmV3IFBoZXRGb250KCAyMCApO1xyXG5jb25zdCBERUZBVUxUX1NDT1JFX0RJU1BMQVlfRk9OVCA9IG5ldyBQaGV0Rm9udCggeyBzaXplOiAzOCwgd2VpZ2h0OiAnYm9sZCcgfSApO1xyXG5cclxudHlwZSBTZWxmT3B0aW9ucyA9IHtcclxuICBwaGV0R2lybFNjYWxlPzogbnVtYmVyO1xyXG4gIGJ1dHRvbnNGb250PzogRm9udDtcclxuICBidXR0b25zV2lkdGg/OiBudW1iZXI7IC8vIGZpeGVkIHdpZHRoIGZvciBib3RoIGJ1dHRvbnNcclxuICBidXR0b25zWVNwYWNpbmc/OiBudW1iZXI7XHJcbiAga2VlcEdvaW5nQnV0dG9uTGlzdGVuZXI/OiBQdXNoQnV0dG9uTGlzdGVuZXI7IC8vIGNhbGxlZCB3aGVuICdLZWVwIEdvaW5nJyBidXR0b24gaXMgcHJlc3NlZFxyXG4gIG5ld0xldmVsQnV0dG9uTGlzdGVuZXI/OiBQdXNoQnV0dG9uTGlzdGVuZXI7IC8vIGNhbGxlZCB3aGVuICdOZXcgTGV2ZWwnIGJ1dHRvbiBpcyBwcmVzc2VkXHJcbiAgc2NvcmVEaXNwbGF5T3B0aW9ucz86IFNjb3JlRGlzcGxheU51bWJlckFuZFN0YXJPcHRpb25zO1xyXG59O1xyXG5cclxuZXhwb3J0IHR5cGUgUmV3YXJkRGlhbG9nT3B0aW9ucyA9IFNlbGZPcHRpb25zICYgU3RyaWN0T21pdDxEaWFsb2dPcHRpb25zLCAnZm9jdXNPblNob3dOb2RlJz47XHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBSZXdhcmREaWFsb2cgZXh0ZW5kcyBEaWFsb2cge1xyXG5cclxuICBwdWJsaWMgY29uc3RydWN0b3IoIHNjb3JlOiBudW1iZXIgfCBUUmVhZE9ubHlQcm9wZXJ0eTxudW1iZXI+LCBwcm92aWRlZE9wdGlvbnM/OiBSZXdhcmREaWFsb2dPcHRpb25zICkge1xyXG5cclxuICAgIGNvbnN0IG9wdGlvbnMgPSBvcHRpb25pemU8UmV3YXJkRGlhbG9nT3B0aW9ucywgU2VsZk9wdGlvbnMsIERpYWxvZ09wdGlvbnM+KCkoIHtcclxuXHJcbiAgICAgIC8vIFJld2FyZERpYWxvZ09wdGlvbnNcclxuICAgICAgcGhldEdpcmxTY2FsZTogMC42LFxyXG4gICAgICBidXR0b25zRm9udDogREVGQVVMVF9CVVRUT05TX0ZPTlQsXHJcbiAgICAgIGJ1dHRvbnNXaWR0aDogMTQ1LFxyXG4gICAgICBidXR0b25zWVNwYWNpbmc6IDIwLFxyXG4gICAgICBrZWVwR29pbmdCdXR0b25MaXN0ZW5lcjogXy5ub29wLFxyXG4gICAgICBuZXdMZXZlbEJ1dHRvbkxpc3RlbmVyOiBfLm5vb3AsXHJcbiAgICAgIHNjb3JlRGlzcGxheU9wdGlvbnM6IHtcclxuICAgICAgICBmb250OiBERUZBVUxUX1NDT1JFX0RJU1BMQVlfRk9OVCxcclxuICAgICAgICBzcGFjaW5nOiA4LFxyXG4gICAgICAgIHN0YXJOb2RlT3B0aW9uczoge1xyXG4gICAgICAgICAgc3RhclNoYXBlT3B0aW9uczoge1xyXG4gICAgICAgICAgICBvdXRlclJhZGl1czogMjAsXHJcbiAgICAgICAgICAgIGlubmVyUmFkaXVzOiAxMFxyXG4gICAgICAgICAgfSxcclxuICAgICAgICAgIGZpbGxlZExpbmVXaWR0aDogMlxyXG4gICAgICAgIH1cclxuICAgICAgfSxcclxuXHJcbiAgICAgIC8vIERpYWxvZ09wdGlvbnNcclxuICAgICAgLy8gcGRvbSAtIFNpbmNlIHdlIGFyZSBzZXR0aW5nIHRoZSBmb2N1c09uU2hvd05vZGUgdG8gYmUgdGhlIGZpcnN0IGVsZW1lbnQgaW4gY29udGVudCwgcHV0IHRoZSBjbG9zZUJ1dHRvbiBsYXN0XHJcbiAgICAgIGNsb3NlQnV0dG9uTGFzdEluUERPTTogdHJ1ZSxcclxuICAgICAgdGFuZGVtOiBUYW5kZW0uT1BUSU9OQUxcclxuICAgIH0sIHByb3ZpZGVkT3B0aW9ucyApO1xyXG5cclxuICAgIGNvbnN0IHBoZXRHaXJsTm9kZSA9IG5ldyBJbWFnZSggcGhldEdpcmxKdWdnbGluZ1N0YXJzX3BuZywge1xyXG4gICAgICBzY2FsZTogb3B0aW9ucy5waGV0R2lybFNjYWxlXHJcbiAgICB9ICk7XHJcblxyXG4gICAgY29uc3Qgc2NvcmVQcm9wZXJ0eSA9ICggdHlwZW9mIHNjb3JlID09PSAnbnVtYmVyJyApID8gbmV3IE51bWJlclByb3BlcnR5KCBzY29yZSApIDogc2NvcmU7XHJcbiAgICBjb25zdCBzY29yZURpc3BsYXkgPSBuZXcgU2NvcmVEaXNwbGF5TnVtYmVyQW5kU3Rhciggc2NvcmVQcm9wZXJ0eSwgb3B0aW9ucy5zY29yZURpc3BsYXlPcHRpb25zICk7XHJcblxyXG4gICAgY29uc3QgYnV0dG9uT3B0aW9ucyA9IHtcclxuICAgICAgZm9udDogb3B0aW9ucy5idXR0b25zRm9udCxcclxuICAgICAgbWluV2lkdGg6IG9wdGlvbnMuYnV0dG9uc1dpZHRoLFxyXG4gICAgICBtYXhXaWR0aDogb3B0aW9ucy5idXR0b25zV2lkdGhcclxuICAgIH07XHJcblxyXG4gICAgY29uc3QgdGV4dE9wdGlvbnMgPSB7IGZvbnQ6IERFRkFVTFRfQlVUVE9OU19GT05ULCBtYXhXaWR0aDogb3B0aW9ucy5idXR0b25zV2lkdGggKiAwLjkgfTtcclxuXHJcbiAgICBjb25zdCBuZXdMZXZlbEJ1dHRvbiA9IG5ldyBSZWN0YW5ndWxhclB1c2hCdXR0b24oXHJcbiAgICAgIGNvbWJpbmVPcHRpb25zPFJlY3Rhbmd1bGFyUHVzaEJ1dHRvbk9wdGlvbnM+KCB7fSwgYnV0dG9uT3B0aW9ucywge1xyXG4gICAgICAgIGNvbnRlbnQ6IG5ldyBUZXh0KCBWZWdhc1N0cmluZ3MubmV3TGV2ZWxTdHJpbmdQcm9wZXJ0eSwgdGV4dE9wdGlvbnMgKSxcclxuICAgICAgICBsaXN0ZW5lcjogb3B0aW9ucy5uZXdMZXZlbEJ1dHRvbkxpc3RlbmVyLFxyXG4gICAgICAgIGJhc2VDb2xvcjogUGhldENvbG9yU2NoZW1lLlBIRVRfTE9HT19ZRUxMT1csXHJcbiAgICAgICAgdGFuZGVtOiBvcHRpb25zLnRhbmRlbS5jcmVhdGVUYW5kZW0oICduZXdMZXZlbEJ1dHRvbicgKVxyXG4gICAgICB9ICkgKTtcclxuXHJcbiAgICBjb25zdCBrZWVwR29pbmdCdXR0b24gPSBuZXcgUmVjdGFuZ3VsYXJQdXNoQnV0dG9uKFxyXG4gICAgICBjb21iaW5lT3B0aW9uczxSZWN0YW5ndWxhclB1c2hCdXR0b25PcHRpb25zPigge30sIGJ1dHRvbk9wdGlvbnMsIHtcclxuICAgICAgICBjb250ZW50OiBuZXcgVGV4dCggVmVnYXNTdHJpbmdzLmtlZXBHb2luZ1N0cmluZ1Byb3BlcnR5LCB0ZXh0T3B0aW9ucyApLFxyXG4gICAgICAgIGxpc3RlbmVyOiBvcHRpb25zLmtlZXBHb2luZ0J1dHRvbkxpc3RlbmVyLFxyXG4gICAgICAgIGJhc2VDb2xvcjogJ3doaXRlJyxcclxuICAgICAgICB0YW5kZW06IG9wdGlvbnMudGFuZGVtLmNyZWF0ZVRhbmRlbSggJ2tlZXBHb2luZ0J1dHRvbicgKVxyXG4gICAgICB9ICkgKTtcclxuXHJcbiAgICBjb25zdCBidXR0b25zID0gbmV3IFZCb3goIHtcclxuICAgICAgY2hpbGRyZW46IFsgbmV3TGV2ZWxCdXR0b24sIGtlZXBHb2luZ0J1dHRvbiBdLFxyXG4gICAgICBzcGFjaW5nOiBvcHRpb25zLmJ1dHRvbnNZU3BhY2luZ1xyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIGhhbGYgdGhlIHJlbWFpbmluZyBoZWlnaHQsIHNvIHRoYXQgc2NvcmVEaXNwbGF5IHdpbGwgYmUgY2VudGVyZWQgaW4gdGhlIG5lZ2F0aXZlIHNwYWNlIGFib3ZlIHRoZSBidXR0b25zLlxyXG4gICAgY29uc3Qgc2NvcmVTcGFjaW5nID0gKCBwaGV0R2lybE5vZGUuaGVpZ2h0IC0gc2NvcmVEaXNwbGF5LmhlaWdodCAtIGJ1dHRvbnMuaGVpZ2h0ICkgLyAyO1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggc2NvcmVTcGFjaW5nID4gMCwgJ3BoZXRHaXJsTm9kZSBpcyBzY2FsZWQgZG93biB0b28gbXVjaCcgKTtcclxuXHJcbiAgICBjb25zdCByaWdodFNpZGVOb2RlID0gbmV3IFZCb3goIHtcclxuICAgICAgY2hpbGRyZW46IFsgc2NvcmVEaXNwbGF5LCBidXR0b25zIF0sXHJcbiAgICAgIGFsaWduOiAnY2VudGVyJyxcclxuICAgICAgc3BhY2luZzogc2NvcmVTcGFjaW5nXHJcbiAgICB9ICk7XHJcblxyXG4gICAgY29uc3QgY29udGVudCA9IG5ldyBIQm94KCB7XHJcbiAgICAgIGFsaWduOiAnYm90dG9tJyxcclxuICAgICAgY2hpbGRyZW46IFsgcGhldEdpcmxOb2RlLCByaWdodFNpZGVOb2RlIF0sXHJcbiAgICAgIHNwYWNpbmc6IDUyXHJcbiAgICB9ICk7XHJcblxyXG4gICAgb3B0aW9ucy5mb2N1c09uU2hvd05vZGUgPSBuZXdMZXZlbEJ1dHRvbjtcclxuXHJcbiAgICBzdXBlciggY29udGVudCwgb3B0aW9ucyApO1xyXG4gIH1cclxufVxyXG5cclxudmVnYXMucmVnaXN0ZXIoICdSZXdhcmREaWFsb2cnLCBSZXdhcmREaWFsb2cgKTsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLGNBQWMsTUFBTSxpQ0FBaUM7QUFFNUQsT0FBT0MsU0FBUyxJQUFJQyxjQUFjLFFBQVEsaUNBQWlDO0FBQzNFLE9BQU9DLGVBQWUsTUFBTSwwQ0FBMEM7QUFDdEUsT0FBT0MsUUFBUSxNQUFNLG1DQUFtQztBQUN4RCxTQUFlQyxJQUFJLEVBQUVDLEtBQUssRUFBRUMsSUFBSSxFQUFFQyxJQUFJLFFBQVEsNkJBQTZCO0FBRTNFLE9BQU9DLHFCQUFxQixNQUF3QywrQ0FBK0M7QUFDbkgsT0FBT0MsTUFBTSxNQUF5Qix3QkFBd0I7QUFDOUQsT0FBT0MseUJBQXlCLE1BQU0sd0NBQXdDO0FBQzlFLE9BQU9DLHlCQUF5QixNQUE0QyxnQ0FBZ0M7QUFDNUcsT0FBT0MsS0FBSyxNQUFNLFlBQVk7QUFDOUIsT0FBT0MsWUFBWSxNQUFNLG1CQUFtQjtBQUU1QyxPQUFPQyxNQUFNLE1BQU0sMkJBQTJCOztBQUU5QztBQUNBLE1BQU1DLG9CQUFvQixHQUFHLElBQUlaLFFBQVEsQ0FBRSxFQUFHLENBQUM7QUFDL0MsTUFBTWEsMEJBQTBCLEdBQUcsSUFBSWIsUUFBUSxDQUFFO0VBQUVjLElBQUksRUFBRSxFQUFFO0VBQUVDLE1BQU0sRUFBRTtBQUFPLENBQUUsQ0FBQztBQWMvRSxlQUFlLE1BQU1DLFlBQVksU0FBU1YsTUFBTSxDQUFD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