// Copyright 2021-2023, University of Colorado Boulder

/**
 * Button in the NavigationBar that opens the PreferencesDialog.
 *
 * @author Jesse Greenberg (PhET Interactive Simulations)
 */

import optionize from '../../../phet-core/js/optionize.js';
import { Color, Image } from '../../../scenery/js/imports.js';
import preferencesIconOnWhite_png from '../../images/preferencesIconOnWhite_png.js'; // on a white navbar
import preferencesIcon_png from '../../images/preferencesIcon_png.js'; // on a black navbar
import Dialog from '../../../sun/js/Dialog.js';
import PhetioCapsule from '../../../tandem/js/PhetioCapsule.js';
import joist from '../joist.js';
import JoistButton from '../JoistButton.js';
import JoistStrings from '../JoistStrings.js';
import PreferencesDialog from './PreferencesDialog.js';
// // empirically determined to similarly match the height of the P in PhET button, see https://github.com/phetsims/joist/issues/919
const DESIRED_ICON_HEIGHT = 18.85;
class NavigationBarPreferencesButton extends JoistButton {
  constructor(preferencesModel, backgroundColorProperty, providedOptions) {
    const options = optionize()({
      listener: () => {
        const preferencesDialog = preferencesDialogCapsule.getElement();
        preferencesDialog.show();
        preferencesDialog.focusSelectedTab();
      },
      highlightExtensionWidth: 5 + 3.6,
      highlightExtensionHeight: 10,
      // pdom
      innerContent: JoistStrings.preferences.titleStringProperty,
      positionInPDOM: true,
      // voicing
      voicingNameResponse: JoistStrings.preferences.titleStringProperty,
      visiblePropertyOptions: {
        phetioFeatured: true
      }
    }, providedOptions);
    const icon = new Image(preferencesIcon_png, {
      scale: DESIRED_ICON_HEIGHT / preferencesIcon_png.height,
      pickable: false
    });
    super(icon, backgroundColorProperty, options);
    const preferencesDialogCapsule = new PhetioCapsule(tandem => {
      return new PreferencesDialog(preferencesModel, {
        tandem: tandem,
        focusOnHideNode: this
      });
    }, [], {
      tandem: options.tandem.createTandem('preferencesDialogCapsule'),
      phetioType: PhetioCapsule.PhetioCapsuleIO(Dialog.DialogIO)
    });

    // change the icon so that it is visible when the background changes from dark to light
    backgroundColorProperty.link(backgroundColor => {
      icon.image = backgroundColor.equals(Color.BLACK) ? preferencesIcon_png : preferencesIconOnWhite_png;
    });

    // pdom - Signal to screen readers that the button will open a dialog. For some reason, this also seems to
    // prevent a bug in iOS Safari where two events are dispatched to the screen on activation instead of one.
    // The result was that one press would open the dialog and the second buggy press would immediately close it.
    // Make sure that the dialog can be opened on iOS Safari before removing this.
    this.setPDOMAttribute('aria-haspopup', true);
  }
}
joist.register('NavigationBarPreferencesButton', NavigationBarPreferencesButton);
export default NavigationBarPreferencesButton;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJvcHRpb25pemUiLCJDb2xvciIsIkltYWdlIiwicHJlZmVyZW5jZXNJY29uT25XaGl0ZV9wbmciLCJwcmVmZXJlbmNlc0ljb25fcG5nIiwiRGlhbG9nIiwiUGhldGlvQ2Fwc3VsZSIsImpvaXN0IiwiSm9pc3RCdXR0b24iLCJKb2lzdFN0cmluZ3MiLCJQcmVmZXJlbmNlc0RpYWxvZyIsIkRFU0lSRURfSUNPTl9IRUlHSFQiLCJOYXZpZ2F0aW9uQmFyUHJlZmVyZW5jZXNCdXR0b24iLCJjb25zdHJ1Y3RvciIsInByZWZlcmVuY2VzTW9kZWwiLCJiYWNrZ3JvdW5kQ29sb3JQcm9wZXJ0eSIsInByb3ZpZGVkT3B0aW9ucyIsIm9wdGlvbnMiLCJsaXN0ZW5lciIsInByZWZlcmVuY2VzRGlhbG9nIiwicHJlZmVyZW5jZXNEaWFsb2dDYXBzdWxlIiwiZ2V0RWxlbWVudCIsInNob3ciLCJmb2N1c1NlbGVjdGVkVGFiIiwiaGlnaGxpZ2h0RXh0ZW5zaW9uV2lkdGgiLCJoaWdobGlnaHRFeHRlbnNpb25IZWlnaHQiLCJpbm5lckNvbnRlbnQiLCJwcmVmZXJlbmNlcyIsInRpdGxlU3RyaW5nUHJvcGVydHkiLCJwb3NpdGlvbkluUERPTSIsInZvaWNpbmdOYW1lUmVzcG9uc2UiLCJ2aXNpYmxlUHJvcGVydHlPcHRpb25zIiwicGhldGlvRmVhdHVyZWQiLCJpY29uIiwic2NhbGUiLCJoZWlnaHQiLCJwaWNrYWJsZSIsInRhbmRlbSIsImZvY3VzT25IaWRlTm9kZSIsImNyZWF0ZVRhbmRlbSIsInBoZXRpb1R5cGUiLCJQaGV0aW9DYXBzdWxlSU8iLCJEaWFsb2dJTyIsImxpbmsiLCJiYWNrZ3JvdW5kQ29sb3IiLCJpbWFnZSIsImVxdWFscyIsIkJMQUNLIiwic2V0UERPTUF0dHJpYnV0ZSIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiTmF2aWdhdGlvbkJhclByZWZlcmVuY2VzQnV0dG9uLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDIxLTIwMjMsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIEJ1dHRvbiBpbiB0aGUgTmF2aWdhdGlvbkJhciB0aGF0IG9wZW5zIHRoZSBQcmVmZXJlbmNlc0RpYWxvZy5cclxuICpcclxuICogQGF1dGhvciBKZXNzZSBHcmVlbmJlcmcgKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXHJcbiAqL1xyXG5cclxuaW1wb3J0IG9wdGlvbml6ZSwgeyBFbXB0eVNlbGZPcHRpb25zIH0gZnJvbSAnLi4vLi4vLi4vcGhldC1jb3JlL2pzL29wdGlvbml6ZS5qcyc7XHJcbmltcG9ydCB7IENvbG9yLCBJbWFnZSB9IGZyb20gJy4uLy4uLy4uL3NjZW5lcnkvanMvaW1wb3J0cy5qcyc7XHJcbmltcG9ydCBwcmVmZXJlbmNlc0ljb25PbldoaXRlX3BuZyBmcm9tICcuLi8uLi9pbWFnZXMvcHJlZmVyZW5jZXNJY29uT25XaGl0ZV9wbmcuanMnOyAvLyBvbiBhIHdoaXRlIG5hdmJhclxyXG5pbXBvcnQgcHJlZmVyZW5jZXNJY29uX3BuZyBmcm9tICcuLi8uLi9pbWFnZXMvcHJlZmVyZW5jZXNJY29uX3BuZy5qcyc7IC8vIG9uIGEgYmxhY2sgbmF2YmFyXHJcbmltcG9ydCBEaWFsb2cgZnJvbSAnLi4vLi4vLi4vc3VuL2pzL0RpYWxvZy5qcyc7XHJcbmltcG9ydCBQaGV0aW9DYXBzdWxlIGZyb20gJy4uLy4uLy4uL3RhbmRlbS9qcy9QaGV0aW9DYXBzdWxlLmpzJztcclxuaW1wb3J0IGpvaXN0IGZyb20gJy4uL2pvaXN0LmpzJztcclxuaW1wb3J0IEpvaXN0QnV0dG9uLCB7IEpvaXN0QnV0dG9uT3B0aW9ucyB9IGZyb20gJy4uL0pvaXN0QnV0dG9uLmpzJztcclxuaW1wb3J0IEpvaXN0U3RyaW5ncyBmcm9tICcuLi9Kb2lzdFN0cmluZ3MuanMnO1xyXG5pbXBvcnQgUHJlZmVyZW5jZXNEaWFsb2cgZnJvbSAnLi9QcmVmZXJlbmNlc0RpYWxvZy5qcyc7XHJcbmltcG9ydCBQcmVmZXJlbmNlc01vZGVsIGZyb20gJy4vUHJlZmVyZW5jZXNNb2RlbC5qcyc7XHJcbmltcG9ydCBQaWNrUmVxdWlyZWQgZnJvbSAnLi4vLi4vLi4vcGhldC1jb3JlL2pzL3R5cGVzL1BpY2tSZXF1aXJlZC5qcyc7XHJcbmltcG9ydCBUUmVhZE9ubHlQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi9heG9uL2pzL1RSZWFkT25seVByb3BlcnR5LmpzJztcclxuXHJcbnR5cGUgU2VsZk9wdGlvbnMgPSBFbXB0eVNlbGZPcHRpb25zO1xyXG5leHBvcnQgdHlwZSBOYXZpZ2F0aW9uQmFyUHJlZmVyZW5jZXNCdXR0b25PcHRpb25zID0gU2VsZk9wdGlvbnMgJiBQaWNrUmVxdWlyZWQ8Sm9pc3RCdXR0b25PcHRpb25zLCAndGFuZGVtJz4gJiBQaWNrPEpvaXN0QnV0dG9uT3B0aW9ucywgJ3BvaW50ZXJBcmVhRGlsYXRpb25YJyB8ICdwb2ludGVyQXJlYURpbGF0aW9uWSc+O1xyXG5cclxuLy8gLy8gZW1waXJpY2FsbHkgZGV0ZXJtaW5lZCB0byBzaW1pbGFybHkgbWF0Y2ggdGhlIGhlaWdodCBvZiB0aGUgUCBpbiBQaEVUIGJ1dHRvbiwgc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9qb2lzdC9pc3N1ZXMvOTE5XHJcbmNvbnN0IERFU0lSRURfSUNPTl9IRUlHSFQgPSAxOC44NTtcclxuXHJcbmNsYXNzIE5hdmlnYXRpb25CYXJQcmVmZXJlbmNlc0J1dHRvbiBleHRlbmRzIEpvaXN0QnV0dG9uIHtcclxuXHJcbiAgcHVibGljIGNvbnN0cnVjdG9yKCBwcmVmZXJlbmNlc01vZGVsOiBQcmVmZXJlbmNlc01vZGVsLCBiYWNrZ3JvdW5kQ29sb3JQcm9wZXJ0eTogVFJlYWRPbmx5UHJvcGVydHk8Q29sb3I+LFxyXG4gICAgICAgICAgICAgICAgICAgICAgcHJvdmlkZWRPcHRpb25zOiBOYXZpZ2F0aW9uQmFyUHJlZmVyZW5jZXNCdXR0b25PcHRpb25zICkge1xyXG5cclxuICAgIGNvbnN0IG9wdGlvbnMgPSBvcHRpb25pemU8TmF2aWdhdGlvbkJhclByZWZlcmVuY2VzQnV0dG9uT3B0aW9ucywgU2VsZk9wdGlvbnMsIEpvaXN0QnV0dG9uT3B0aW9ucz4oKSgge1xyXG5cclxuICAgICAgbGlzdGVuZXI6ICgpID0+IHtcclxuICAgICAgICBjb25zdCBwcmVmZXJlbmNlc0RpYWxvZyA9IHByZWZlcmVuY2VzRGlhbG9nQ2Fwc3VsZS5nZXRFbGVtZW50KCk7XHJcbiAgICAgICAgcHJlZmVyZW5jZXNEaWFsb2cuc2hvdygpO1xyXG4gICAgICAgIHByZWZlcmVuY2VzRGlhbG9nLmZvY3VzU2VsZWN0ZWRUYWIoKTtcclxuICAgICAgfSxcclxuICAgICAgaGlnaGxpZ2h0RXh0ZW5zaW9uV2lkdGg6IDUgKyAzLjYsXHJcbiAgICAgIGhpZ2hsaWdodEV4dGVuc2lvbkhlaWdodDogMTAsXHJcblxyXG4gICAgICAvLyBwZG9tXHJcbiAgICAgIGlubmVyQ29udGVudDogSm9pc3RTdHJpbmdzLnByZWZlcmVuY2VzLnRpdGxlU3RyaW5nUHJvcGVydHksXHJcbiAgICAgIHBvc2l0aW9uSW5QRE9NOiB0cnVlLFxyXG5cclxuICAgICAgLy8gdm9pY2luZ1xyXG4gICAgICB2b2ljaW5nTmFtZVJlc3BvbnNlOiBKb2lzdFN0cmluZ3MucHJlZmVyZW5jZXMudGl0bGVTdHJpbmdQcm9wZXJ0eSxcclxuXHJcbiAgICAgIHZpc2libGVQcm9wZXJ0eU9wdGlvbnM6IHtcclxuICAgICAgICBwaGV0aW9GZWF0dXJlZDogdHJ1ZVxyXG4gICAgICB9XHJcbiAgICB9LCBwcm92aWRlZE9wdGlvbnMgKTtcclxuXHJcbiAgICBjb25zdCBpY29uID0gbmV3IEltYWdlKCBwcmVmZXJlbmNlc0ljb25fcG5nLCB7XHJcbiAgICAgIHNjYWxlOiBERVNJUkVEX0lDT05fSEVJR0hUIC8gcHJlZmVyZW5jZXNJY29uX3BuZy5oZWlnaHQsXHJcbiAgICAgIHBpY2thYmxlOiBmYWxzZVxyXG4gICAgfSApO1xyXG5cclxuICAgIHN1cGVyKCBpY29uLCBiYWNrZ3JvdW5kQ29sb3JQcm9wZXJ0eSwgb3B0aW9ucyApO1xyXG5cclxuICAgIGNvbnN0IHByZWZlcmVuY2VzRGlhbG9nQ2Fwc3VsZSA9IG5ldyBQaGV0aW9DYXBzdWxlPFByZWZlcmVuY2VzRGlhbG9nPiggdGFuZGVtID0+IHtcclxuICAgICAgcmV0dXJuIG5ldyBQcmVmZXJlbmNlc0RpYWxvZyggcHJlZmVyZW5jZXNNb2RlbCwge1xyXG4gICAgICAgIHRhbmRlbTogdGFuZGVtLFxyXG4gICAgICAgIGZvY3VzT25IaWRlTm9kZTogdGhpc1xyXG4gICAgICB9ICk7XHJcbiAgICB9LCBbXSwge1xyXG4gICAgICB0YW5kZW06IG9wdGlvbnMudGFuZGVtLmNyZWF0ZVRhbmRlbSggJ3ByZWZlcmVuY2VzRGlhbG9nQ2Fwc3VsZScgKSxcclxuICAgICAgcGhldGlvVHlwZTogUGhldGlvQ2Fwc3VsZS5QaGV0aW9DYXBzdWxlSU8oIERpYWxvZy5EaWFsb2dJTyApXHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gY2hhbmdlIHRoZSBpY29uIHNvIHRoYXQgaXQgaXMgdmlzaWJsZSB3aGVuIHRoZSBiYWNrZ3JvdW5kIGNoYW5nZXMgZnJvbSBkYXJrIHRvIGxpZ2h0XHJcbiAgICBiYWNrZ3JvdW5kQ29sb3JQcm9wZXJ0eS5saW5rKCBiYWNrZ3JvdW5kQ29sb3IgPT4ge1xyXG4gICAgICBpY29uLmltYWdlID0gYmFja2dyb3VuZENvbG9yLmVxdWFscyggQ29sb3IuQkxBQ0sgKSA/IHByZWZlcmVuY2VzSWNvbl9wbmcgOiBwcmVmZXJlbmNlc0ljb25PbldoaXRlX3BuZztcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBwZG9tIC0gU2lnbmFsIHRvIHNjcmVlbiByZWFkZXJzIHRoYXQgdGhlIGJ1dHRvbiB3aWxsIG9wZW4gYSBkaWFsb2cuIEZvciBzb21lIHJlYXNvbiwgdGhpcyBhbHNvIHNlZW1zIHRvXHJcbiAgICAvLyBwcmV2ZW50IGEgYnVnIGluIGlPUyBTYWZhcmkgd2hlcmUgdHdvIGV2ZW50cyBhcmUgZGlzcGF0Y2hlZCB0byB0aGUgc2NyZWVuIG9uIGFjdGl2YXRpb24gaW5zdGVhZCBvZiBvbmUuXHJcbiAgICAvLyBUaGUgcmVzdWx0IHdhcyB0aGF0IG9uZSBwcmVzcyB3b3VsZCBvcGVuIHRoZSBkaWFsb2cgYW5kIHRoZSBzZWNvbmQgYnVnZ3kgcHJlc3Mgd291bGQgaW1tZWRpYXRlbHkgY2xvc2UgaXQuXHJcbiAgICAvLyBNYWtlIHN1cmUgdGhhdCB0aGUgZGlhbG9nIGNhbiBiZSBvcGVuZWQgb24gaU9TIFNhZmFyaSBiZWZvcmUgcmVtb3ZpbmcgdGhpcy5cclxuICAgIHRoaXMuc2V0UERPTUF0dHJpYnV0ZSggJ2FyaWEtaGFzcG9wdXAnLCB0cnVlICk7XHJcbiAgfVxyXG59XHJcblxyXG5qb2lzdC5yZWdpc3RlciggJ05hdmlnYXRpb25CYXJQcmVmZXJlbmNlc0J1dHRvbicsIE5hdmlnYXRpb25CYXJQcmVmZXJlbmNlc0J1dHRvbiApO1xyXG5leHBvcnQgZGVmYXVsdCBOYXZpZ2F0aW9uQmFyUHJlZmVyZW5jZXNCdXR0b247XHJcbiJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxTQUFTLE1BQTRCLG9DQUFvQztBQUNoRixTQUFTQyxLQUFLLEVBQUVDLEtBQUssUUFBUSxnQ0FBZ0M7QUFDN0QsT0FBT0MsMEJBQTBCLE1BQU0sNENBQTRDLENBQUMsQ0FBQztBQUNyRixPQUFPQyxtQkFBbUIsTUFBTSxxQ0FBcUMsQ0FBQyxDQUFDO0FBQ3ZFLE9BQU9DLE1BQU0sTUFBTSwyQkFBMkI7QUFDOUMsT0FBT0MsYUFBYSxNQUFNLHFDQUFxQztBQUMvRCxPQUFPQyxLQUFLLE1BQU0sYUFBYTtBQUMvQixPQUFPQyxXQUFXLE1BQThCLG1CQUFtQjtBQUNuRSxPQUFPQyxZQUFZLE1BQU0sb0JBQW9CO0FBQzdDLE9BQU9DLGlCQUFpQixNQUFNLHdCQUF3QjtBQVF0RDtBQUNBLE1BQU1DLG1CQUFtQixHQUFHLEtBQUs7QUFFakMsTUFBTUMsOEJBQThCLFNBQVNKLFdBQVcsQ0FBQztFQUVoREssV0FBV0EsQ0FBRUMsZ0JBQWtDLEVBQUVDLHVCQUFpRCxFQUNyRkMsZUFBc0QsRUFBRztJQUUzRSxNQUFNQyxPQUFPLEdBQUdqQixTQUFTLENBQXlFLENBQUMsQ0FBRTtNQUVuR2tCLFFBQVEsRUFBRUEsQ0FBQSxLQUFNO1FBQ2QsTUFBTUMsaUJBQWlCLEdBQUdDLHdCQUF3QixDQUFDQyxVQUFVLENBQUMsQ0FBQztRQUMvREYsaUJBQWlCLENBQUNHLElBQUksQ0FBQyxDQUFDO1FBQ3hCSCxpQkFBaUIsQ0FBQ0ksZ0JBQWdCLENBQUMsQ0FBQztNQUN0QyxDQUFDO01BQ0RDLHVCQUF1QixFQUFFLENBQUMsR0FBRyxHQUFHO01BQ2hDQyx3QkFBd0IsRUFBRSxFQUFFO01BRTVCO01BQ0FDLFlBQVksRUFBRWpCLFlBQVksQ0FBQ2tCLFdBQVcsQ0FBQ0MsbUJBQW1CO01BQzFEQyxjQUFjLEVBQUUsSUFBSTtNQUVwQjtNQUNBQyxtQkFBbUIsRUFBRXJCLFlBQVksQ0FBQ2tCLFdBQVcsQ0FBQ0MsbUJBQW1CO01BRWpFRyxzQkFBc0IsRUFBRTtRQUN0QkMsY0FBYyxFQUFFO01BQ2xCO0lBQ0YsQ0FBQyxFQUFFaEIsZUFBZ0IsQ0FBQztJQUVwQixNQUFNaUIsSUFBSSxHQUFHLElBQUkvQixLQUFLLENBQUVFLG1CQUFtQixFQUFFO01BQzNDOEIsS0FBSyxFQUFFdkIsbUJBQW1CLEdBQUdQLG1CQUFtQixDQUFDK0IsTUFBTTtNQUN2REMsUUFBUSxFQUFFO0lBQ1osQ0FBRSxDQUFDO0lBRUgsS0FBSyxDQUFFSCxJQUFJLEVBQUVsQix1QkFBdUIsRUFBRUUsT0FBUSxDQUFDO0lBRS9DLE1BQU1HLHdCQUF3QixHQUFHLElBQUlkLGFBQWEsQ0FBcUIrQixNQUFNLElBQUk7TUFDL0UsT0FBTyxJQUFJM0IsaUJBQWlCLENBQUVJLGdCQUFnQixFQUFFO1FBQzlDdUIsTUFBTSxFQUFFQSxNQUFNO1FBQ2RDLGVBQWUsRUFBRTtNQUNuQixDQUFFLENBQUM7SUFDTCxDQUFDLEVBQUUsRUFBRSxFQUFFO01BQ0xELE1BQU0sRUFBRXBCLE9BQU8sQ0FBQ29CLE1BQU0sQ0FBQ0UsWUFBWSxDQUFFLDBCQUEyQixDQUFDO01BQ2pFQyxVQUFVLEVBQUVsQyxhQUFhLENBQUNtQyxlQUFlLENBQUVwQyxNQUFNLENBQUNxQyxRQUFTO0lBQzdELENBQUUsQ0FBQzs7SUFFSDtJQUNBM0IsdUJBQXVCLENBQUM0QixJQUFJLENBQUVDLGVBQWUsSUFBSTtNQUMvQ1gsSUFBSSxDQUFDWSxLQUFLLEdBQUdELGVBQWUsQ0FBQ0UsTUFBTSxDQUFFN0MsS0FBSyxDQUFDOEMsS0FBTSxDQUFDLEdBQUczQyxtQkFBbUIsR0FBR0QsMEJBQTBCO0lBQ3ZHLENBQUUsQ0FBQzs7SUFFSDtJQUNBO0lBQ0E7SUFDQTtJQUNBLElBQUksQ0FBQzZDLGdCQUFnQixDQUFFLGVBQWUsRUFBRSxJQUFLLENBQUM7RUFDaEQ7QUFDRjtBQUVBekMsS0FBSyxDQUFDMEMsUUFBUSxDQUFFLGdDQUFnQyxFQUFFckMsOEJBQStCLENBQUM7QUFDbEYsZUFBZUEsOEJBQThCIn0=