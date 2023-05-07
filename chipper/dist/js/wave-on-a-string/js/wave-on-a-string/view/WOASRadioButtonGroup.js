// Copyright 2020-2023, University of Colorado Boulder

/**
 * Control WOASRadioButtonGroup view
 *
 * @author Anton Ulyanov (Mlearner)
 */

import merge from '../../../../phet-core/js/merge.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import { Text } from '../../../../scenery/js/imports.js';
import VerticalAquaRadioButtonGroup from '../../../../sun/js/VerticalAquaRadioButtonGroup.js';
import waveOnAString from '../../waveOnAString.js';
import Constants from '../Constants.js';
class WOASRadioButtonGroup extends VerticalAquaRadioButtonGroup {
  /**
   * @param {Property.<*>} property
   * @param {Tandem} tandem
   * @param {Object} [options]
   */
  constructor(property, tandem, options) {
    const length = options.radio.length;
    const group = [];
    for (let i = 0; i < length; i++) {
      group.push({
        createNode: () => new Text(options.text[i], {
          font: new PhetFont(20),
          maxWidth: 250
        }),
        value: options.radio[i],
        tandemName: options.tandemNames[i]
      });
    }
    super(property, group, merge({
      spacing: 16,
      touchAreaXDilation: 10,
      radioButtonOptions: {
        radius: 12,
        selectedColor: Constants.radioColor.toCSS()
      },
      scale: 0.5,
      tandem: tandem
    }, options));
  }
}
waveOnAString.register('WOASRadioButtonGroup', WOASRadioButtonGroup);
export default WOASRadioButtonGroup;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJtZXJnZSIsIlBoZXRGb250IiwiVGV4dCIsIlZlcnRpY2FsQXF1YVJhZGlvQnV0dG9uR3JvdXAiLCJ3YXZlT25BU3RyaW5nIiwiQ29uc3RhbnRzIiwiV09BU1JhZGlvQnV0dG9uR3JvdXAiLCJjb25zdHJ1Y3RvciIsInByb3BlcnR5IiwidGFuZGVtIiwib3B0aW9ucyIsImxlbmd0aCIsInJhZGlvIiwiZ3JvdXAiLCJpIiwicHVzaCIsImNyZWF0ZU5vZGUiLCJ0ZXh0IiwiZm9udCIsIm1heFdpZHRoIiwidmFsdWUiLCJ0YW5kZW1OYW1lIiwidGFuZGVtTmFtZXMiLCJzcGFjaW5nIiwidG91Y2hBcmVhWERpbGF0aW9uIiwicmFkaW9CdXR0b25PcHRpb25zIiwicmFkaXVzIiwic2VsZWN0ZWRDb2xvciIsInJhZGlvQ29sb3IiLCJ0b0NTUyIsInNjYWxlIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJXT0FTUmFkaW9CdXR0b25Hcm91cC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAyMC0yMDIzLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBDb250cm9sIFdPQVNSYWRpb0J1dHRvbkdyb3VwIHZpZXdcclxuICpcclxuICogQGF1dGhvciBBbnRvbiBVbHlhbm92IChNbGVhcm5lcilcclxuICovXHJcblxyXG5pbXBvcnQgbWVyZ2UgZnJvbSAnLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL21lcmdlLmpzJztcclxuaW1wb3J0IFBoZXRGb250IGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9QaGV0Rm9udC5qcyc7XHJcbmltcG9ydCB7IFRleHQgfSBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgVmVydGljYWxBcXVhUmFkaW9CdXR0b25Hcm91cCBmcm9tICcuLi8uLi8uLi8uLi9zdW4vanMvVmVydGljYWxBcXVhUmFkaW9CdXR0b25Hcm91cC5qcyc7XHJcbmltcG9ydCB3YXZlT25BU3RyaW5nIGZyb20gJy4uLy4uL3dhdmVPbkFTdHJpbmcuanMnO1xyXG5pbXBvcnQgQ29uc3RhbnRzIGZyb20gJy4uL0NvbnN0YW50cy5qcyc7XHJcblxyXG5jbGFzcyBXT0FTUmFkaW9CdXR0b25Hcm91cCBleHRlbmRzIFZlcnRpY2FsQXF1YVJhZGlvQnV0dG9uR3JvdXAge1xyXG4gIC8qKlxyXG4gICAqIEBwYXJhbSB7UHJvcGVydHkuPCo+fSBwcm9wZXJ0eVxyXG4gICAqIEBwYXJhbSB7VGFuZGVtfSB0YW5kZW1cclxuICAgKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnNdXHJcbiAgICovXHJcbiAgY29uc3RydWN0b3IoIHByb3BlcnR5LCB0YW5kZW0sIG9wdGlvbnMgKSB7XHJcbiAgICBjb25zdCBsZW5ndGggPSBvcHRpb25zLnJhZGlvLmxlbmd0aDtcclxuICAgIGNvbnN0IGdyb3VwID0gW107XHJcblxyXG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwgbGVuZ3RoOyBpKysgKSB7XHJcbiAgICAgIGdyb3VwLnB1c2goIHtcclxuICAgICAgICBjcmVhdGVOb2RlOiAoKSA9PiBuZXcgVGV4dCggb3B0aW9ucy50ZXh0WyBpIF0sIHtcclxuICAgICAgICAgIGZvbnQ6IG5ldyBQaGV0Rm9udCggMjAgKSxcclxuICAgICAgICAgIG1heFdpZHRoOiAyNTBcclxuICAgICAgICB9ICksXHJcbiAgICAgICAgdmFsdWU6IG9wdGlvbnMucmFkaW9bIGkgXSxcclxuICAgICAgICB0YW5kZW1OYW1lOiBvcHRpb25zLnRhbmRlbU5hbWVzWyBpIF1cclxuICAgICAgfSApO1xyXG4gICAgfVxyXG5cclxuICAgIHN1cGVyKCBwcm9wZXJ0eSwgZ3JvdXAsIG1lcmdlKCB7XHJcbiAgICAgIHNwYWNpbmc6IDE2LFxyXG4gICAgICB0b3VjaEFyZWFYRGlsYXRpb246IDEwLFxyXG4gICAgICByYWRpb0J1dHRvbk9wdGlvbnM6IHtcclxuICAgICAgICByYWRpdXM6IDEyLFxyXG4gICAgICAgIHNlbGVjdGVkQ29sb3I6IENvbnN0YW50cy5yYWRpb0NvbG9yLnRvQ1NTKClcclxuICAgICAgfSxcclxuICAgICAgc2NhbGU6IDAuNSxcclxuICAgICAgdGFuZGVtOiB0YW5kZW1cclxuICAgIH0sIG9wdGlvbnMgKSApO1xyXG4gIH1cclxufVxyXG5cclxud2F2ZU9uQVN0cmluZy5yZWdpc3RlciggJ1dPQVNSYWRpb0J1dHRvbkdyb3VwJywgV09BU1JhZGlvQnV0dG9uR3JvdXAgKTtcclxuZXhwb3J0IGRlZmF1bHQgV09BU1JhZGlvQnV0dG9uR3JvdXA7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLEtBQUssTUFBTSxtQ0FBbUM7QUFDckQsT0FBT0MsUUFBUSxNQUFNLHlDQUF5QztBQUM5RCxTQUFTQyxJQUFJLFFBQVEsbUNBQW1DO0FBQ3hELE9BQU9DLDRCQUE0QixNQUFNLG9EQUFvRDtBQUM3RixPQUFPQyxhQUFhLE1BQU0sd0JBQXdCO0FBQ2xELE9BQU9DLFNBQVMsTUFBTSxpQkFBaUI7QUFFdkMsTUFBTUMsb0JBQW9CLFNBQVNILDRCQUE0QixDQUFDO0VBQzlEO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7RUFDRUksV0FBV0EsQ0FBRUMsUUFBUSxFQUFFQyxNQUFNLEVBQUVDLE9BQU8sRUFBRztJQUN2QyxNQUFNQyxNQUFNLEdBQUdELE9BQU8sQ0FBQ0UsS0FBSyxDQUFDRCxNQUFNO0lBQ25DLE1BQU1FLEtBQUssR0FBRyxFQUFFO0lBRWhCLEtBQU0sSUFBSUMsQ0FBQyxHQUFHLENBQUMsRUFBRUEsQ0FBQyxHQUFHSCxNQUFNLEVBQUVHLENBQUMsRUFBRSxFQUFHO01BQ2pDRCxLQUFLLENBQUNFLElBQUksQ0FBRTtRQUNWQyxVQUFVLEVBQUVBLENBQUEsS0FBTSxJQUFJZCxJQUFJLENBQUVRLE9BQU8sQ0FBQ08sSUFBSSxDQUFFSCxDQUFDLENBQUUsRUFBRTtVQUM3Q0ksSUFBSSxFQUFFLElBQUlqQixRQUFRLENBQUUsRUFBRyxDQUFDO1VBQ3hCa0IsUUFBUSxFQUFFO1FBQ1osQ0FBRSxDQUFDO1FBQ0hDLEtBQUssRUFBRVYsT0FBTyxDQUFDRSxLQUFLLENBQUVFLENBQUMsQ0FBRTtRQUN6Qk8sVUFBVSxFQUFFWCxPQUFPLENBQUNZLFdBQVcsQ0FBRVIsQ0FBQztNQUNwQyxDQUFFLENBQUM7SUFDTDtJQUVBLEtBQUssQ0FBRU4sUUFBUSxFQUFFSyxLQUFLLEVBQUViLEtBQUssQ0FBRTtNQUM3QnVCLE9BQU8sRUFBRSxFQUFFO01BQ1hDLGtCQUFrQixFQUFFLEVBQUU7TUFDdEJDLGtCQUFrQixFQUFFO1FBQ2xCQyxNQUFNLEVBQUUsRUFBRTtRQUNWQyxhQUFhLEVBQUV0QixTQUFTLENBQUN1QixVQUFVLENBQUNDLEtBQUssQ0FBQztNQUM1QyxDQUFDO01BQ0RDLEtBQUssRUFBRSxHQUFHO01BQ1ZyQixNQUFNLEVBQUVBO0lBQ1YsQ0FBQyxFQUFFQyxPQUFRLENBQUUsQ0FBQztFQUNoQjtBQUNGO0FBRUFOLGFBQWEsQ0FBQzJCLFFBQVEsQ0FBRSxzQkFBc0IsRUFBRXpCLG9CQUFxQixDQUFDO0FBQ3RFLGVBQWVBLG9CQUFvQiJ9