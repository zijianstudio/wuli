// Copyright 2022, University of Colorado Boulder

/**
 * Creates a sticky toggle button with the info icon on it.
 *
 * @author Marla Schulz (PhET Interactive Simulations)
 *
 */

import BooleanRoundStickyToggleButton from '../../../../sun/js/buttons/BooleanRoundStickyToggleButton.js';
import meanShareAndBalance from '../../meanShareAndBalance.js';
import { Path } from '../../../../scenery/js/imports.js';
import infoCircleSolidShape from '../../../../sherpa/js/fontawesome-5/infoCircleSolidShape.js';
export default class InfoBooleanStickyToggleButton extends BooleanRoundStickyToggleButton {
  constructor(dialogVisibleProperty, tandem) {
    const infoIcon = new Path(infoCircleSolidShape, {
      scale: 0.08,
      fill: 'midnightBlue'
    });
    const options = {
      content: infoIcon,
      baseColor: 'rgb( 238, 238, 238 )',
      radius: 18,
      // phet-io
      tandem: tandem.createTandem('infoStickyToggleButton')
    };
    super(dialogVisibleProperty, options);
  }
}
meanShareAndBalance.register('InfoBooleanStickyToggleButton', InfoBooleanStickyToggleButton);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJCb29sZWFuUm91bmRTdGlja3lUb2dnbGVCdXR0b24iLCJtZWFuU2hhcmVBbmRCYWxhbmNlIiwiUGF0aCIsImluZm9DaXJjbGVTb2xpZFNoYXBlIiwiSW5mb0Jvb2xlYW5TdGlja3lUb2dnbGVCdXR0b24iLCJjb25zdHJ1Y3RvciIsImRpYWxvZ1Zpc2libGVQcm9wZXJ0eSIsInRhbmRlbSIsImluZm9JY29uIiwic2NhbGUiLCJmaWxsIiwib3B0aW9ucyIsImNvbnRlbnQiLCJiYXNlQ29sb3IiLCJyYWRpdXMiLCJjcmVhdGVUYW5kZW0iLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIkluZm9Cb29sZWFuU3RpY2t5VG9nZ2xlQnV0dG9uLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDIyLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBDcmVhdGVzIGEgc3RpY2t5IHRvZ2dsZSBidXR0b24gd2l0aCB0aGUgaW5mbyBpY29uIG9uIGl0LlxyXG4gKlxyXG4gKiBAYXV0aG9yIE1hcmxhIFNjaHVseiAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcclxuICpcclxuICovXHJcblxyXG5pbXBvcnQgUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9Qcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBCb29sZWFuUm91bmRTdGlja3lUb2dnbGVCdXR0b24gZnJvbSAnLi4vLi4vLi4vLi4vc3VuL2pzL2J1dHRvbnMvQm9vbGVhblJvdW5kU3RpY2t5VG9nZ2xlQnV0dG9uLmpzJztcclxuaW1wb3J0IG1lYW5TaGFyZUFuZEJhbGFuY2UgZnJvbSAnLi4vLi4vbWVhblNoYXJlQW5kQmFsYW5jZS5qcyc7XHJcbmltcG9ydCB7IFBhdGggfSBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgaW5mb0NpcmNsZVNvbGlkU2hhcGUgZnJvbSAnLi4vLi4vLi4vLi4vc2hlcnBhL2pzL2ZvbnRhd2Vzb21lLTUvaW5mb0NpcmNsZVNvbGlkU2hhcGUuanMnO1xyXG5pbXBvcnQgVGFuZGVtIGZyb20gJy4uLy4uLy4uLy4uL3RhbmRlbS9qcy9UYW5kZW0uanMnO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgSW5mb0Jvb2xlYW5TdGlja3lUb2dnbGVCdXR0b24gZXh0ZW5kcyBCb29sZWFuUm91bmRTdGlja3lUb2dnbGVCdXR0b24ge1xyXG5cclxuICBwdWJsaWMgY29uc3RydWN0b3IoIGRpYWxvZ1Zpc2libGVQcm9wZXJ0eTogUHJvcGVydHk8Ym9vbGVhbj4sIHRhbmRlbTogVGFuZGVtICkge1xyXG5cclxuICAgIGNvbnN0IGluZm9JY29uID0gbmV3IFBhdGgoIGluZm9DaXJjbGVTb2xpZFNoYXBlLCB7XHJcbiAgICAgIHNjYWxlOiAwLjA4LFxyXG4gICAgICBmaWxsOiAnbWlkbmlnaHRCbHVlJ1xyXG4gICAgfSApO1xyXG5cclxuICAgIGNvbnN0IG9wdGlvbnMgPSB7XHJcbiAgICAgIGNvbnRlbnQ6IGluZm9JY29uLFxyXG4gICAgICBiYXNlQ29sb3I6ICdyZ2IoIDIzOCwgMjM4LCAyMzggKScsXHJcbiAgICAgIHJhZGl1czogMTgsXHJcblxyXG4gICAgICAvLyBwaGV0LWlvXHJcbiAgICAgIHRhbmRlbTogdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ2luZm9TdGlja3lUb2dnbGVCdXR0b24nIClcclxuICAgIH07XHJcblxyXG4gICBzdXBlciggZGlhbG9nVmlzaWJsZVByb3BlcnR5LCBvcHRpb25zICk7XHJcbiAgfVxyXG59XHJcblxyXG5tZWFuU2hhcmVBbmRCYWxhbmNlLnJlZ2lzdGVyKCAnSW5mb0Jvb2xlYW5TdGlja3lUb2dnbGVCdXR0b24nLCBJbmZvQm9vbGVhblN0aWNreVRvZ2dsZUJ1dHRvbiApOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUdBLE9BQU9BLDhCQUE4QixNQUFNLDhEQUE4RDtBQUN6RyxPQUFPQyxtQkFBbUIsTUFBTSw4QkFBOEI7QUFDOUQsU0FBU0MsSUFBSSxRQUFRLG1DQUFtQztBQUN4RCxPQUFPQyxvQkFBb0IsTUFBTSw2REFBNkQ7QUFHOUYsZUFBZSxNQUFNQyw2QkFBNkIsU0FBU0osOEJBQThCLENBQUM7RUFFakZLLFdBQVdBLENBQUVDLHFCQUF3QyxFQUFFQyxNQUFjLEVBQUc7SUFFN0UsTUFBTUMsUUFBUSxHQUFHLElBQUlOLElBQUksQ0FBRUMsb0JBQW9CLEVBQUU7TUFDL0NNLEtBQUssRUFBRSxJQUFJO01BQ1hDLElBQUksRUFBRTtJQUNSLENBQUUsQ0FBQztJQUVILE1BQU1DLE9BQU8sR0FBRztNQUNkQyxPQUFPLEVBQUVKLFFBQVE7TUFDakJLLFNBQVMsRUFBRSxzQkFBc0I7TUFDakNDLE1BQU0sRUFBRSxFQUFFO01BRVY7TUFDQVAsTUFBTSxFQUFFQSxNQUFNLENBQUNRLFlBQVksQ0FBRSx3QkFBeUI7SUFDeEQsQ0FBQztJQUVGLEtBQUssQ0FBRVQscUJBQXFCLEVBQUVLLE9BQVEsQ0FBQztFQUN4QztBQUNGO0FBRUFWLG1CQUFtQixDQUFDZSxRQUFRLENBQUUsK0JBQStCLEVBQUVaLDZCQUE4QixDQUFDIn0=