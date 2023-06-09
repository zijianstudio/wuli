// Copyright 2019-2023, University of Colorado Boulder

/**
 * VectorAdditionGridCheckbox is a specialization of common-code GridCheckbox, styled for this sim.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import merge from '../../../../phet-core/js/merge.js';
import GridCheckbox from '../../../../scenery-phet/js/GridCheckbox.js';
import vectorAddition from '../../vectorAddition.js';
import VectorAdditionConstants from '../VectorAdditionConstants.js';
export default class VectorAdditionGridCheckbox extends GridCheckbox {
  /**
   * @param {Property.<boolean>} gridVisibleProperty
   * @param {Object} [options]
   */
  constructor(gridVisibleProperty, options) {
    options = merge({
      boxWidth: VectorAdditionConstants.CHECKBOX_BOX_WIDTH,
      iconOptions: {
        size: 24
      }
    }, options);
    super(gridVisibleProperty, options);
    this.touchArea = this.localBounds.dilatedXY(5, 1);
  }
}
vectorAddition.register('VectorAdditionGridCheckbox', VectorAdditionGridCheckbox);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJtZXJnZSIsIkdyaWRDaGVja2JveCIsInZlY3RvckFkZGl0aW9uIiwiVmVjdG9yQWRkaXRpb25Db25zdGFudHMiLCJWZWN0b3JBZGRpdGlvbkdyaWRDaGVja2JveCIsImNvbnN0cnVjdG9yIiwiZ3JpZFZpc2libGVQcm9wZXJ0eSIsIm9wdGlvbnMiLCJib3hXaWR0aCIsIkNIRUNLQk9YX0JPWF9XSURUSCIsImljb25PcHRpb25zIiwic2l6ZSIsInRvdWNoQXJlYSIsImxvY2FsQm91bmRzIiwiZGlsYXRlZFhZIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJWZWN0b3JBZGRpdGlvbkdyaWRDaGVja2JveC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxOS0yMDIzLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBWZWN0b3JBZGRpdGlvbkdyaWRDaGVja2JveCBpcyBhIHNwZWNpYWxpemF0aW9uIG9mIGNvbW1vbi1jb2RlIEdyaWRDaGVja2JveCwgc3R5bGVkIGZvciB0aGlzIHNpbS5cclxuICpcclxuICogQGF1dGhvciBDaHJpcyBNYWxsZXkgKFBpeGVsWm9vbSwgSW5jLilcclxuICovXHJcblxyXG5pbXBvcnQgbWVyZ2UgZnJvbSAnLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL21lcmdlLmpzJztcclxuaW1wb3J0IEdyaWRDaGVja2JveCBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5LXBoZXQvanMvR3JpZENoZWNrYm94LmpzJztcclxuaW1wb3J0IHZlY3RvckFkZGl0aW9uIGZyb20gJy4uLy4uL3ZlY3RvckFkZGl0aW9uLmpzJztcclxuaW1wb3J0IFZlY3RvckFkZGl0aW9uQ29uc3RhbnRzIGZyb20gJy4uL1ZlY3RvckFkZGl0aW9uQ29uc3RhbnRzLmpzJztcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFZlY3RvckFkZGl0aW9uR3JpZENoZWNrYm94IGV4dGVuZHMgR3JpZENoZWNrYm94IHtcclxuXHJcbiAgLyoqXHJcbiAgICogQHBhcmFtIHtQcm9wZXJ0eS48Ym9vbGVhbj59IGdyaWRWaXNpYmxlUHJvcGVydHlcclxuICAgKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnNdXHJcbiAgICovXHJcbiAgY29uc3RydWN0b3IoIGdyaWRWaXNpYmxlUHJvcGVydHksIG9wdGlvbnMgKSB7XHJcblxyXG4gICAgb3B0aW9ucyA9IG1lcmdlKCB7XHJcbiAgICAgIGJveFdpZHRoOiBWZWN0b3JBZGRpdGlvbkNvbnN0YW50cy5DSEVDS0JPWF9CT1hfV0lEVEgsXHJcbiAgICAgIGljb25PcHRpb25zOiB7IHNpemU6IDI0IH1cclxuICAgIH0sIG9wdGlvbnMgKTtcclxuXHJcbiAgICBzdXBlciggZ3JpZFZpc2libGVQcm9wZXJ0eSwgb3B0aW9ucyApO1xyXG5cclxuICAgIHRoaXMudG91Y2hBcmVhID0gdGhpcy5sb2NhbEJvdW5kcy5kaWxhdGVkWFkoIDUsIDEgKTtcclxuICB9XHJcbn1cclxuXHJcbnZlY3RvckFkZGl0aW9uLnJlZ2lzdGVyKCAnVmVjdG9yQWRkaXRpb25HcmlkQ2hlY2tib3gnLCBWZWN0b3JBZGRpdGlvbkdyaWRDaGVja2JveCApOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxLQUFLLE1BQU0sbUNBQW1DO0FBQ3JELE9BQU9DLFlBQVksTUFBTSw2Q0FBNkM7QUFDdEUsT0FBT0MsY0FBYyxNQUFNLHlCQUF5QjtBQUNwRCxPQUFPQyx1QkFBdUIsTUFBTSwrQkFBK0I7QUFFbkUsZUFBZSxNQUFNQywwQkFBMEIsU0FBU0gsWUFBWSxDQUFDO0VBRW5FO0FBQ0Y7QUFDQTtBQUNBO0VBQ0VJLFdBQVdBLENBQUVDLG1CQUFtQixFQUFFQyxPQUFPLEVBQUc7SUFFMUNBLE9BQU8sR0FBR1AsS0FBSyxDQUFFO01BQ2ZRLFFBQVEsRUFBRUwsdUJBQXVCLENBQUNNLGtCQUFrQjtNQUNwREMsV0FBVyxFQUFFO1FBQUVDLElBQUksRUFBRTtNQUFHO0lBQzFCLENBQUMsRUFBRUosT0FBUSxDQUFDO0lBRVosS0FBSyxDQUFFRCxtQkFBbUIsRUFBRUMsT0FBUSxDQUFDO0lBRXJDLElBQUksQ0FBQ0ssU0FBUyxHQUFHLElBQUksQ0FBQ0MsV0FBVyxDQUFDQyxTQUFTLENBQUUsQ0FBQyxFQUFFLENBQUUsQ0FBQztFQUNyRDtBQUNGO0FBRUFaLGNBQWMsQ0FBQ2EsUUFBUSxDQUFFLDRCQUE0QixFQUFFWCwwQkFBMkIsQ0FBQyJ9