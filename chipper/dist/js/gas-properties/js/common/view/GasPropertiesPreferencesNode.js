// Copyright 2022, University of Colorado Boulder

/**
 * GasPropertiesPreferencesNode is the user interface for sim-specific preferences, accessed via the Preferences dialog.
 * These preferences are global, and affect all screens.
 *
 * The Preferences dialog is created on demand by joist, using a PhetioCapsule. So GasPropertiesPreferencesNode must
 * implement dispose, and all elements of GasPropertiesPreferencesNode that have tandems must be disposed.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import optionize from '../../../../phet-core/js/optionize.js';
import gasProperties from '../../gasProperties.js';
import GasPropertiesPreferences from '../model/GasPropertiesPreferences.js';
import { PressureNoiseCheckbox } from './PressureNoiseCheckbox.js';
import { VBox } from '../../../../scenery/js/imports.js';
export default class GasPropertiesPreferencesNode extends VBox {
  constructor(providedOptions) {
    const options = optionize()({
      // empty optionize, because we're setting options.children below
    }, providedOptions);
    const children = [];

    // Pressure Noise checkbox
    const pressureNoiseCheckbox = new PressureNoiseCheckbox(GasPropertiesPreferences.pressureNoiseProperty, {
      tandem: options.tandem.createTandem('pressureNoiseCheckbox')
    });
    children.push(pressureNoiseCheckbox);
    options.children = children;
    super(options);
    this.disposeGasPropertiesPreferencesNode = () => {
      children.forEach(child => child.dispose());
    };
  }
  dispose() {
    this.disposeGasPropertiesPreferencesNode();
    super.dispose();
  }
}
gasProperties.register('GasPropertiesPreferencesNode', GasPropertiesPreferencesNode);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJvcHRpb25pemUiLCJnYXNQcm9wZXJ0aWVzIiwiR2FzUHJvcGVydGllc1ByZWZlcmVuY2VzIiwiUHJlc3N1cmVOb2lzZUNoZWNrYm94IiwiVkJveCIsIkdhc1Byb3BlcnRpZXNQcmVmZXJlbmNlc05vZGUiLCJjb25zdHJ1Y3RvciIsInByb3ZpZGVkT3B0aW9ucyIsIm9wdGlvbnMiLCJjaGlsZHJlbiIsInByZXNzdXJlTm9pc2VDaGVja2JveCIsInByZXNzdXJlTm9pc2VQcm9wZXJ0eSIsInRhbmRlbSIsImNyZWF0ZVRhbmRlbSIsInB1c2giLCJkaXNwb3NlR2FzUHJvcGVydGllc1ByZWZlcmVuY2VzTm9kZSIsImZvckVhY2giLCJjaGlsZCIsImRpc3Bvc2UiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIkdhc1Byb3BlcnRpZXNQcmVmZXJlbmNlc05vZGUudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMjIsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIEdhc1Byb3BlcnRpZXNQcmVmZXJlbmNlc05vZGUgaXMgdGhlIHVzZXIgaW50ZXJmYWNlIGZvciBzaW0tc3BlY2lmaWMgcHJlZmVyZW5jZXMsIGFjY2Vzc2VkIHZpYSB0aGUgUHJlZmVyZW5jZXMgZGlhbG9nLlxyXG4gKiBUaGVzZSBwcmVmZXJlbmNlcyBhcmUgZ2xvYmFsLCBhbmQgYWZmZWN0IGFsbCBzY3JlZW5zLlxyXG4gKlxyXG4gKiBUaGUgUHJlZmVyZW5jZXMgZGlhbG9nIGlzIGNyZWF0ZWQgb24gZGVtYW5kIGJ5IGpvaXN0LCB1c2luZyBhIFBoZXRpb0NhcHN1bGUuIFNvIEdhc1Byb3BlcnRpZXNQcmVmZXJlbmNlc05vZGUgbXVzdFxyXG4gKiBpbXBsZW1lbnQgZGlzcG9zZSwgYW5kIGFsbCBlbGVtZW50cyBvZiBHYXNQcm9wZXJ0aWVzUHJlZmVyZW5jZXNOb2RlIHRoYXQgaGF2ZSB0YW5kZW1zIG11c3QgYmUgZGlzcG9zZWQuXHJcbiAqXHJcbiAqIEBhdXRob3IgQ2hyaXMgTWFsbGV5IChQaXhlbFpvb20sIEluYy4pXHJcbiAqL1xyXG5cclxuaW1wb3J0IG9wdGlvbml6ZSwgeyBFbXB0eVNlbGZPcHRpb25zIH0gZnJvbSAnLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL29wdGlvbml6ZS5qcyc7XHJcbmltcG9ydCBQaWNrUmVxdWlyZWQgZnJvbSAnLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL3R5cGVzL1BpY2tSZXF1aXJlZC5qcyc7XHJcbmltcG9ydCBnYXNQcm9wZXJ0aWVzIGZyb20gJy4uLy4uL2dhc1Byb3BlcnRpZXMuanMnO1xyXG5pbXBvcnQgR2FzUHJvcGVydGllc1ByZWZlcmVuY2VzIGZyb20gJy4uL21vZGVsL0dhc1Byb3BlcnRpZXNQcmVmZXJlbmNlcy5qcyc7XHJcbmltcG9ydCB7IFByZXNzdXJlTm9pc2VDaGVja2JveCB9IGZyb20gJy4vUHJlc3N1cmVOb2lzZUNoZWNrYm94LmpzJztcclxuaW1wb3J0IHsgTm9kZSwgVkJveCwgVkJveE9wdGlvbnMgfSBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xyXG5cclxudHlwZSBTZWxmT3B0aW9ucyA9IEVtcHR5U2VsZk9wdGlvbnM7XHJcblxyXG50eXBlIEdhc1Byb3BlcnRpZXNQcmVmZXJlbmNlc05vZGVPcHRpb25zID0gU2VsZk9wdGlvbnMgJiBQaWNrUmVxdWlyZWQ8VkJveE9wdGlvbnMsICd0YW5kZW0nPjtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEdhc1Byb3BlcnRpZXNQcmVmZXJlbmNlc05vZGUgZXh0ZW5kcyBWQm94IHtcclxuXHJcbiAgcHJpdmF0ZSByZWFkb25seSBkaXNwb3NlR2FzUHJvcGVydGllc1ByZWZlcmVuY2VzTm9kZTogKCkgPT4gdm9pZDtcclxuXHJcbiAgcHVibGljIGNvbnN0cnVjdG9yKCBwcm92aWRlZE9wdGlvbnM6IEdhc1Byb3BlcnRpZXNQcmVmZXJlbmNlc05vZGVPcHRpb25zICkge1xyXG5cclxuICAgIGNvbnN0IG9wdGlvbnMgPSBvcHRpb25pemU8R2FzUHJvcGVydGllc1ByZWZlcmVuY2VzTm9kZU9wdGlvbnMsIFNlbGZPcHRpb25zLCBWQm94T3B0aW9ucz4oKSgge1xyXG4gICAgICAvLyBlbXB0eSBvcHRpb25pemUsIGJlY2F1c2Ugd2UncmUgc2V0dGluZyBvcHRpb25zLmNoaWxkcmVuIGJlbG93XHJcbiAgICB9LCBwcm92aWRlZE9wdGlvbnMgKTtcclxuXHJcbiAgICBjb25zdCBjaGlsZHJlbjogTm9kZVtdID0gW107XHJcblxyXG4gICAgLy8gUHJlc3N1cmUgTm9pc2UgY2hlY2tib3hcclxuICAgIGNvbnN0IHByZXNzdXJlTm9pc2VDaGVja2JveCA9IG5ldyBQcmVzc3VyZU5vaXNlQ2hlY2tib3goIEdhc1Byb3BlcnRpZXNQcmVmZXJlbmNlcy5wcmVzc3VyZU5vaXNlUHJvcGVydHksIHtcclxuICAgICAgdGFuZGVtOiBvcHRpb25zLnRhbmRlbS5jcmVhdGVUYW5kZW0oICdwcmVzc3VyZU5vaXNlQ2hlY2tib3gnIClcclxuICAgIH0gKTtcclxuICAgIGNoaWxkcmVuLnB1c2goIHByZXNzdXJlTm9pc2VDaGVja2JveCApO1xyXG5cclxuICAgIG9wdGlvbnMuY2hpbGRyZW4gPSBjaGlsZHJlbjtcclxuXHJcbiAgICBzdXBlciggb3B0aW9ucyApO1xyXG5cclxuICAgIHRoaXMuZGlzcG9zZUdhc1Byb3BlcnRpZXNQcmVmZXJlbmNlc05vZGUgPSAoKSA9PiB7XHJcbiAgICAgIGNoaWxkcmVuLmZvckVhY2goIGNoaWxkID0+IGNoaWxkLmRpc3Bvc2UoKSApO1xyXG4gICAgfTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBvdmVycmlkZSBkaXNwb3NlKCk6IHZvaWQge1xyXG4gICAgdGhpcy5kaXNwb3NlR2FzUHJvcGVydGllc1ByZWZlcmVuY2VzTm9kZSgpO1xyXG4gICAgc3VwZXIuZGlzcG9zZSgpO1xyXG4gIH1cclxufVxyXG5cclxuZ2FzUHJvcGVydGllcy5yZWdpc3RlciggJ0dhc1Byb3BlcnRpZXNQcmVmZXJlbmNlc05vZGUnLCBHYXNQcm9wZXJ0aWVzUHJlZmVyZW5jZXNOb2RlICk7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsU0FBUyxNQUE0Qix1Q0FBdUM7QUFFbkYsT0FBT0MsYUFBYSxNQUFNLHdCQUF3QjtBQUNsRCxPQUFPQyx3QkFBd0IsTUFBTSxzQ0FBc0M7QUFDM0UsU0FBU0MscUJBQXFCLFFBQVEsNEJBQTRCO0FBQ2xFLFNBQWVDLElBQUksUUFBcUIsbUNBQW1DO0FBTTNFLGVBQWUsTUFBTUMsNEJBQTRCLFNBQVNELElBQUksQ0FBQztFQUl0REUsV0FBV0EsQ0FBRUMsZUFBb0QsRUFBRztJQUV6RSxNQUFNQyxPQUFPLEdBQUdSLFNBQVMsQ0FBZ0UsQ0FBQyxDQUFFO01BQzFGO0lBQUEsQ0FDRCxFQUFFTyxlQUFnQixDQUFDO0lBRXBCLE1BQU1FLFFBQWdCLEdBQUcsRUFBRTs7SUFFM0I7SUFDQSxNQUFNQyxxQkFBcUIsR0FBRyxJQUFJUCxxQkFBcUIsQ0FBRUQsd0JBQXdCLENBQUNTLHFCQUFxQixFQUFFO01BQ3ZHQyxNQUFNLEVBQUVKLE9BQU8sQ0FBQ0ksTUFBTSxDQUFDQyxZQUFZLENBQUUsdUJBQXdCO0lBQy9ELENBQUUsQ0FBQztJQUNISixRQUFRLENBQUNLLElBQUksQ0FBRUoscUJBQXNCLENBQUM7SUFFdENGLE9BQU8sQ0FBQ0MsUUFBUSxHQUFHQSxRQUFRO0lBRTNCLEtBQUssQ0FBRUQsT0FBUSxDQUFDO0lBRWhCLElBQUksQ0FBQ08sbUNBQW1DLEdBQUcsTUFBTTtNQUMvQ04sUUFBUSxDQUFDTyxPQUFPLENBQUVDLEtBQUssSUFBSUEsS0FBSyxDQUFDQyxPQUFPLENBQUMsQ0FBRSxDQUFDO0lBQzlDLENBQUM7RUFDSDtFQUVnQkEsT0FBT0EsQ0FBQSxFQUFTO0lBQzlCLElBQUksQ0FBQ0gsbUNBQW1DLENBQUMsQ0FBQztJQUMxQyxLQUFLLENBQUNHLE9BQU8sQ0FBQyxDQUFDO0VBQ2pCO0FBQ0Y7QUFFQWpCLGFBQWEsQ0FBQ2tCLFFBQVEsQ0FBRSw4QkFBOEIsRUFBRWQsNEJBQTZCLENBQUMifQ==