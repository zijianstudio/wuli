// Copyright 2016-2023, University of Colorado Boulder

/**
 * View for the 'Shopping' screen.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import ScreenView from '../../../../joist/js/ScreenView.js';
import merge from '../../../../phet-core/js/merge.js';
import ResetAllButton from '../../../../scenery-phet/js/buttons/ResetAllButton.js';
import { Node } from '../../../../scenery/js/imports.js';
import URConstants from '../../common/URConstants.js';
import KeypadLayer from '../../common/view/KeypadLayer.js';
import unitRates from '../../unitRates.js';
import ShoppingCategoryNode from './ShoppingCategoryNode.js';
import ShoppingCategoryRadioButtonGroup from './ShoppingCategoryRadioButtonGroup.js';
import ShoppingViewProperties from './ShoppingViewProperties.js';
export default class ShoppingScreenView extends ScreenView {
  /**
   * @param {ShoppingModel} model
   * @param {Object} [options]
   */
  constructor(model, options) {
    options = merge({
      /**
       * Creates a Node for a category.
       * @param {ShoppingCategory} category
       * @param {Property.<ShoppingCategory>} categoryProperty
       * @param {Bounds2} layoutBounds
       * @param {KeypadLayer} keypadLayer
       * @param {ShoppingViewProperties} viewProperties
       * @returns {Node}
       */
      createCategoryNode: (category, categoryProperty, layoutBounds, keypadLayer, viewProperties) => new ShoppingCategoryNode(category, categoryProperty, layoutBounds, keypadLayer, viewProperties)
    }, options);
    super(options);

    // Properties that are specific to the view
    const viewProperties = new ShoppingViewProperties();

    // parent for everything expect the keypad
    const playAreaLayer = new Node();
    this.addChild(playAreaLayer);

    // separate layer for model keypad
    const keypadLayer = new KeypadLayer();
    this.addChild(keypadLayer);

    // create the view for each category
    model.categories.forEach(category => {
      const categoryNode = options.createCategoryNode(category, model.categoryProperty, this.layoutBounds, keypadLayer, viewProperties);
      playAreaLayer.addChild(categoryNode);
    });

    // Category radio button group
    const categoryRadioButtonGroup = new ShoppingCategoryRadioButtonGroup(model.categories, model.categoryProperty, {
      left: this.layoutBounds.left + URConstants.SCREEN_X_MARGIN,
      bottom: this.layoutBounds.bottom - 2 * URConstants.SCREEN_Y_MARGIN
    });
    playAreaLayer.addChild(categoryRadioButtonGroup);

    // Reset All button
    const resetAllButton = new ResetAllButton({
      listener: () => {
        this.interruptSubtreeInput();
        model.reset();
        viewProperties.reset();
      },
      right: this.layoutBounds.maxX - URConstants.SCREEN_X_MARGIN,
      bottom: this.layoutBounds.maxY - URConstants.SCREEN_Y_MARGIN
    });
    playAreaLayer.addChild(resetAllButton);
  }
}
unitRates.register('ShoppingScreenView', ShoppingScreenView);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJTY3JlZW5WaWV3IiwibWVyZ2UiLCJSZXNldEFsbEJ1dHRvbiIsIk5vZGUiLCJVUkNvbnN0YW50cyIsIktleXBhZExheWVyIiwidW5pdFJhdGVzIiwiU2hvcHBpbmdDYXRlZ29yeU5vZGUiLCJTaG9wcGluZ0NhdGVnb3J5UmFkaW9CdXR0b25Hcm91cCIsIlNob3BwaW5nVmlld1Byb3BlcnRpZXMiLCJTaG9wcGluZ1NjcmVlblZpZXciLCJjb25zdHJ1Y3RvciIsIm1vZGVsIiwib3B0aW9ucyIsImNyZWF0ZUNhdGVnb3J5Tm9kZSIsImNhdGVnb3J5IiwiY2F0ZWdvcnlQcm9wZXJ0eSIsImxheW91dEJvdW5kcyIsImtleXBhZExheWVyIiwidmlld1Byb3BlcnRpZXMiLCJwbGF5QXJlYUxheWVyIiwiYWRkQ2hpbGQiLCJjYXRlZ29yaWVzIiwiZm9yRWFjaCIsImNhdGVnb3J5Tm9kZSIsImNhdGVnb3J5UmFkaW9CdXR0b25Hcm91cCIsImxlZnQiLCJTQ1JFRU5fWF9NQVJHSU4iLCJib3R0b20iLCJTQ1JFRU5fWV9NQVJHSU4iLCJyZXNldEFsbEJ1dHRvbiIsImxpc3RlbmVyIiwiaW50ZXJydXB0U3VidHJlZUlucHV0IiwicmVzZXQiLCJyaWdodCIsIm1heFgiLCJtYXhZIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJTaG9wcGluZ1NjcmVlblZpZXcuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTYtMjAyMywgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogVmlldyBmb3IgdGhlICdTaG9wcGluZycgc2NyZWVuLlxyXG4gKlxyXG4gKiBAYXV0aG9yIENocmlzIE1hbGxleSAoUGl4ZWxab29tLCBJbmMuKVxyXG4gKi9cclxuXHJcbmltcG9ydCBTY3JlZW5WaWV3IGZyb20gJy4uLy4uLy4uLy4uL2pvaXN0L2pzL1NjcmVlblZpZXcuanMnO1xyXG5pbXBvcnQgbWVyZ2UgZnJvbSAnLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL21lcmdlLmpzJztcclxuaW1wb3J0IFJlc2V0QWxsQnV0dG9uIGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9idXR0b25zL1Jlc2V0QWxsQnV0dG9uLmpzJztcclxuaW1wb3J0IHsgTm9kZSB9IGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvaW1wb3J0cy5qcyc7XHJcbmltcG9ydCBVUkNvbnN0YW50cyBmcm9tICcuLi8uLi9jb21tb24vVVJDb25zdGFudHMuanMnO1xyXG5pbXBvcnQgS2V5cGFkTGF5ZXIgZnJvbSAnLi4vLi4vY29tbW9uL3ZpZXcvS2V5cGFkTGF5ZXIuanMnO1xyXG5pbXBvcnQgdW5pdFJhdGVzIGZyb20gJy4uLy4uL3VuaXRSYXRlcy5qcyc7XHJcbmltcG9ydCBTaG9wcGluZ0NhdGVnb3J5Tm9kZSBmcm9tICcuL1Nob3BwaW5nQ2F0ZWdvcnlOb2RlLmpzJztcclxuaW1wb3J0IFNob3BwaW5nQ2F0ZWdvcnlSYWRpb0J1dHRvbkdyb3VwIGZyb20gJy4vU2hvcHBpbmdDYXRlZ29yeVJhZGlvQnV0dG9uR3JvdXAuanMnO1xyXG5pbXBvcnQgU2hvcHBpbmdWaWV3UHJvcGVydGllcyBmcm9tICcuL1Nob3BwaW5nVmlld1Byb3BlcnRpZXMuanMnO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgU2hvcHBpbmdTY3JlZW5WaWV3IGV4dGVuZHMgU2NyZWVuVmlldyB7XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwYXJhbSB7U2hvcHBpbmdNb2RlbH0gbW9kZWxcclxuICAgKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnNdXHJcbiAgICovXHJcbiAgY29uc3RydWN0b3IoIG1vZGVsLCBvcHRpb25zICkge1xyXG5cclxuICAgIG9wdGlvbnMgPSBtZXJnZSgge1xyXG5cclxuICAgICAgLyoqXHJcbiAgICAgICAqIENyZWF0ZXMgYSBOb2RlIGZvciBhIGNhdGVnb3J5LlxyXG4gICAgICAgKiBAcGFyYW0ge1Nob3BwaW5nQ2F0ZWdvcnl9IGNhdGVnb3J5XHJcbiAgICAgICAqIEBwYXJhbSB7UHJvcGVydHkuPFNob3BwaW5nQ2F0ZWdvcnk+fSBjYXRlZ29yeVByb3BlcnR5XHJcbiAgICAgICAqIEBwYXJhbSB7Qm91bmRzMn0gbGF5b3V0Qm91bmRzXHJcbiAgICAgICAqIEBwYXJhbSB7S2V5cGFkTGF5ZXJ9IGtleXBhZExheWVyXHJcbiAgICAgICAqIEBwYXJhbSB7U2hvcHBpbmdWaWV3UHJvcGVydGllc30gdmlld1Byb3BlcnRpZXNcclxuICAgICAgICogQHJldHVybnMge05vZGV9XHJcbiAgICAgICAqL1xyXG4gICAgICBjcmVhdGVDYXRlZ29yeU5vZGU6ICggY2F0ZWdvcnksIGNhdGVnb3J5UHJvcGVydHksIGxheW91dEJvdW5kcywga2V5cGFkTGF5ZXIsIHZpZXdQcm9wZXJ0aWVzICkgPT5cclxuICAgICAgICBuZXcgU2hvcHBpbmdDYXRlZ29yeU5vZGUoIGNhdGVnb3J5LCBjYXRlZ29yeVByb3BlcnR5LCBsYXlvdXRCb3VuZHMsIGtleXBhZExheWVyLCB2aWV3UHJvcGVydGllcyApXHJcblxyXG4gICAgfSwgb3B0aW9ucyApO1xyXG5cclxuICAgIHN1cGVyKCBvcHRpb25zICk7XHJcblxyXG4gICAgLy8gUHJvcGVydGllcyB0aGF0IGFyZSBzcGVjaWZpYyB0byB0aGUgdmlld1xyXG4gICAgY29uc3Qgdmlld1Byb3BlcnRpZXMgPSBuZXcgU2hvcHBpbmdWaWV3UHJvcGVydGllcygpO1xyXG5cclxuICAgIC8vIHBhcmVudCBmb3IgZXZlcnl0aGluZyBleHBlY3QgdGhlIGtleXBhZFxyXG4gICAgY29uc3QgcGxheUFyZWFMYXllciA9IG5ldyBOb2RlKCk7XHJcbiAgICB0aGlzLmFkZENoaWxkKCBwbGF5QXJlYUxheWVyICk7XHJcblxyXG4gICAgLy8gc2VwYXJhdGUgbGF5ZXIgZm9yIG1vZGVsIGtleXBhZFxyXG4gICAgY29uc3Qga2V5cGFkTGF5ZXIgPSBuZXcgS2V5cGFkTGF5ZXIoKTtcclxuICAgIHRoaXMuYWRkQ2hpbGQoIGtleXBhZExheWVyICk7XHJcblxyXG4gICAgLy8gY3JlYXRlIHRoZSB2aWV3IGZvciBlYWNoIGNhdGVnb3J5XHJcbiAgICBtb2RlbC5jYXRlZ29yaWVzLmZvckVhY2goIGNhdGVnb3J5ID0+IHtcclxuICAgICAgY29uc3QgY2F0ZWdvcnlOb2RlID0gb3B0aW9ucy5jcmVhdGVDYXRlZ29yeU5vZGUoIGNhdGVnb3J5LCBtb2RlbC5jYXRlZ29yeVByb3BlcnR5LCB0aGlzLmxheW91dEJvdW5kcywga2V5cGFkTGF5ZXIsIHZpZXdQcm9wZXJ0aWVzICk7XHJcbiAgICAgIHBsYXlBcmVhTGF5ZXIuYWRkQ2hpbGQoIGNhdGVnb3J5Tm9kZSApO1xyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIENhdGVnb3J5IHJhZGlvIGJ1dHRvbiBncm91cFxyXG4gICAgY29uc3QgY2F0ZWdvcnlSYWRpb0J1dHRvbkdyb3VwID0gbmV3IFNob3BwaW5nQ2F0ZWdvcnlSYWRpb0J1dHRvbkdyb3VwKCBtb2RlbC5jYXRlZ29yaWVzLCBtb2RlbC5jYXRlZ29yeVByb3BlcnR5LCB7XHJcbiAgICAgIGxlZnQ6IHRoaXMubGF5b3V0Qm91bmRzLmxlZnQgKyBVUkNvbnN0YW50cy5TQ1JFRU5fWF9NQVJHSU4sXHJcbiAgICAgIGJvdHRvbTogdGhpcy5sYXlvdXRCb3VuZHMuYm90dG9tIC0gKCAyICogVVJDb25zdGFudHMuU0NSRUVOX1lfTUFSR0lOIClcclxuICAgIH0gKTtcclxuICAgIHBsYXlBcmVhTGF5ZXIuYWRkQ2hpbGQoIGNhdGVnb3J5UmFkaW9CdXR0b25Hcm91cCApO1xyXG5cclxuICAgIC8vIFJlc2V0IEFsbCBidXR0b25cclxuICAgIGNvbnN0IHJlc2V0QWxsQnV0dG9uID0gbmV3IFJlc2V0QWxsQnV0dG9uKCB7XHJcbiAgICAgIGxpc3RlbmVyOiAoKSA9PiB7XHJcbiAgICAgICAgdGhpcy5pbnRlcnJ1cHRTdWJ0cmVlSW5wdXQoKTtcclxuICAgICAgICBtb2RlbC5yZXNldCgpO1xyXG4gICAgICAgIHZpZXdQcm9wZXJ0aWVzLnJlc2V0KCk7XHJcbiAgICAgIH0sXHJcbiAgICAgIHJpZ2h0OiB0aGlzLmxheW91dEJvdW5kcy5tYXhYIC0gVVJDb25zdGFudHMuU0NSRUVOX1hfTUFSR0lOLFxyXG4gICAgICBib3R0b206IHRoaXMubGF5b3V0Qm91bmRzLm1heFkgLSBVUkNvbnN0YW50cy5TQ1JFRU5fWV9NQVJHSU5cclxuICAgIH0gKTtcclxuICAgIHBsYXlBcmVhTGF5ZXIuYWRkQ2hpbGQoIHJlc2V0QWxsQnV0dG9uICk7XHJcbiAgfVxyXG59XHJcblxyXG51bml0UmF0ZXMucmVnaXN0ZXIoICdTaG9wcGluZ1NjcmVlblZpZXcnLCBTaG9wcGluZ1NjcmVlblZpZXcgKTsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsVUFBVSxNQUFNLG9DQUFvQztBQUMzRCxPQUFPQyxLQUFLLE1BQU0sbUNBQW1DO0FBQ3JELE9BQU9DLGNBQWMsTUFBTSx1REFBdUQ7QUFDbEYsU0FBU0MsSUFBSSxRQUFRLG1DQUFtQztBQUN4RCxPQUFPQyxXQUFXLE1BQU0sNkJBQTZCO0FBQ3JELE9BQU9DLFdBQVcsTUFBTSxrQ0FBa0M7QUFDMUQsT0FBT0MsU0FBUyxNQUFNLG9CQUFvQjtBQUMxQyxPQUFPQyxvQkFBb0IsTUFBTSwyQkFBMkI7QUFDNUQsT0FBT0MsZ0NBQWdDLE1BQU0sdUNBQXVDO0FBQ3BGLE9BQU9DLHNCQUFzQixNQUFNLDZCQUE2QjtBQUVoRSxlQUFlLE1BQU1DLGtCQUFrQixTQUFTVixVQUFVLENBQUM7RUFFekQ7QUFDRjtBQUNBO0FBQ0E7RUFDRVcsV0FBV0EsQ0FBRUMsS0FBSyxFQUFFQyxPQUFPLEVBQUc7SUFFNUJBLE9BQU8sR0FBR1osS0FBSyxDQUFFO01BRWY7QUFDTjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO01BQ01hLGtCQUFrQixFQUFFQSxDQUFFQyxRQUFRLEVBQUVDLGdCQUFnQixFQUFFQyxZQUFZLEVBQUVDLFdBQVcsRUFBRUMsY0FBYyxLQUN6RixJQUFJWixvQkFBb0IsQ0FBRVEsUUFBUSxFQUFFQyxnQkFBZ0IsRUFBRUMsWUFBWSxFQUFFQyxXQUFXLEVBQUVDLGNBQWU7SUFFcEcsQ0FBQyxFQUFFTixPQUFRLENBQUM7SUFFWixLQUFLLENBQUVBLE9BQVEsQ0FBQzs7SUFFaEI7SUFDQSxNQUFNTSxjQUFjLEdBQUcsSUFBSVYsc0JBQXNCLENBQUMsQ0FBQzs7SUFFbkQ7SUFDQSxNQUFNVyxhQUFhLEdBQUcsSUFBSWpCLElBQUksQ0FBQyxDQUFDO0lBQ2hDLElBQUksQ0FBQ2tCLFFBQVEsQ0FBRUQsYUFBYyxDQUFDOztJQUU5QjtJQUNBLE1BQU1GLFdBQVcsR0FBRyxJQUFJYixXQUFXLENBQUMsQ0FBQztJQUNyQyxJQUFJLENBQUNnQixRQUFRLENBQUVILFdBQVksQ0FBQzs7SUFFNUI7SUFDQU4sS0FBSyxDQUFDVSxVQUFVLENBQUNDLE9BQU8sQ0FBRVIsUUFBUSxJQUFJO01BQ3BDLE1BQU1TLFlBQVksR0FBR1gsT0FBTyxDQUFDQyxrQkFBa0IsQ0FBRUMsUUFBUSxFQUFFSCxLQUFLLENBQUNJLGdCQUFnQixFQUFFLElBQUksQ0FBQ0MsWUFBWSxFQUFFQyxXQUFXLEVBQUVDLGNBQWUsQ0FBQztNQUNuSUMsYUFBYSxDQUFDQyxRQUFRLENBQUVHLFlBQWEsQ0FBQztJQUN4QyxDQUFFLENBQUM7O0lBRUg7SUFDQSxNQUFNQyx3QkFBd0IsR0FBRyxJQUFJakIsZ0NBQWdDLENBQUVJLEtBQUssQ0FBQ1UsVUFBVSxFQUFFVixLQUFLLENBQUNJLGdCQUFnQixFQUFFO01BQy9HVSxJQUFJLEVBQUUsSUFBSSxDQUFDVCxZQUFZLENBQUNTLElBQUksR0FBR3RCLFdBQVcsQ0FBQ3VCLGVBQWU7TUFDMURDLE1BQU0sRUFBRSxJQUFJLENBQUNYLFlBQVksQ0FBQ1csTUFBTSxHQUFLLENBQUMsR0FBR3hCLFdBQVcsQ0FBQ3lCO0lBQ3ZELENBQUUsQ0FBQztJQUNIVCxhQUFhLENBQUNDLFFBQVEsQ0FBRUksd0JBQXlCLENBQUM7O0lBRWxEO0lBQ0EsTUFBTUssY0FBYyxHQUFHLElBQUk1QixjQUFjLENBQUU7TUFDekM2QixRQUFRLEVBQUVBLENBQUEsS0FBTTtRQUNkLElBQUksQ0FBQ0MscUJBQXFCLENBQUMsQ0FBQztRQUM1QnBCLEtBQUssQ0FBQ3FCLEtBQUssQ0FBQyxDQUFDO1FBQ2JkLGNBQWMsQ0FBQ2MsS0FBSyxDQUFDLENBQUM7TUFDeEIsQ0FBQztNQUNEQyxLQUFLLEVBQUUsSUFBSSxDQUFDakIsWUFBWSxDQUFDa0IsSUFBSSxHQUFHL0IsV0FBVyxDQUFDdUIsZUFBZTtNQUMzREMsTUFBTSxFQUFFLElBQUksQ0FBQ1gsWUFBWSxDQUFDbUIsSUFBSSxHQUFHaEMsV0FBVyxDQUFDeUI7SUFDL0MsQ0FBRSxDQUFDO0lBQ0hULGFBQWEsQ0FBQ0MsUUFBUSxDQUFFUyxjQUFlLENBQUM7RUFDMUM7QUFDRjtBQUVBeEIsU0FBUyxDQUFDK0IsUUFBUSxDQUFFLG9CQUFvQixFQUFFM0Isa0JBQW1CLENBQUMifQ==