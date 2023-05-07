// Copyright 2016-2023, University of Colorado Boulder

/**
 * Scenery node that holds a set of creator nodes.
 *
 * This is somewhat specific to the Expression Exchange simulation, but could easily be turned into a base class and
 * used more generally.
 *
 * @author John Blanco
 */

import merge from '../../../../phet-core/js/merge.js';
import { Node, Rectangle } from '../../../../scenery/js/imports.js';
import Carousel from '../../../../sun/js/Carousel.js';
import { Shape } from '../../../../kite/js/imports.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import expressionExchange from '../../expressionExchange.js';
class CoinTermCreatorBox extends Node {
  /**
   * @param {Array.<CoinTermCreatorNode>} creatorNodes - set of coin term creator nodes
   * @param {Object} [options]
   */
  constructor(creatorNodes, options) {
    super();
    options = merge({
      itemsPerCarouselPage: 3,
      itemSpacing: 5,
      // empirically determined to work for most cases in this sim
      cornerRadius: 4,
      align: 'center'
    }, options);

    // @public (read-only) {boolean} - a flag that indicates if creator nodes that create coin terms with negative
    // initial values are present
    this.negativeTermsPresent = _.some(creatorNodes, creatorNode => creatorNode.createdCoinTermInitialCount < 0);

    // @public (read-only) {Array.<CoinTermTypeID>} - list of the coin term types present in this creator box
    this.coinTermTypeList = _.uniq(_.map(creatorNodes, 'typeID'));

    // @private {Node}
    this.coinTermCreatorBox = new Carousel(creatorNodes.map(element => {
      return {
        createNode: tandem => {
          // Pick bounds that fit every single thing in the sim.
          const H = 90;
          const W = 140;

          // Could be a Node, but this helps with debugging if you want to see the bounds.
          const panel = new Rectangle(0, 0, W, H, {
            fill: 'transparent',
            children: [element]
          });
          element.center = new Vector2(W / 2, H / 2);

          // Prevent resizing when elements bounds want to go outside the rectangle
          panel.clipArea = Shape.rect(0, 0, W, H);
          return panel;
        }
      };
    }), {
      itemsPerPage: options.itemsPerCarouselPage,
      spacing: 5,
      margin: 5,
      cornerRadius: options.cornerRadius
    });
    this.addChild(this.coinTermCreatorBox);
    this.mutate(options);

    // add a dispose function
    this.disposeCoinTermCreatorBox = () => {
      creatorNodes.forEach(creatorNode => {
        creatorNode.dispose();
      });
    };
  }

  /**
   * @public
   */
  reset() {
    this.coinTermCreatorBox.reset && this.coinTermCreatorBox.reset();
  }

  /**
   * @public
   */
  dispose() {
    this.disposeCoinTermCreatorBox();
    super.dispose();
  }
}
expressionExchange.register('CoinTermCreatorBox', CoinTermCreatorBox);
export default CoinTermCreatorBox;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJtZXJnZSIsIk5vZGUiLCJSZWN0YW5nbGUiLCJDYXJvdXNlbCIsIlNoYXBlIiwiVmVjdG9yMiIsImV4cHJlc3Npb25FeGNoYW5nZSIsIkNvaW5UZXJtQ3JlYXRvckJveCIsImNvbnN0cnVjdG9yIiwiY3JlYXRvck5vZGVzIiwib3B0aW9ucyIsIml0ZW1zUGVyQ2Fyb3VzZWxQYWdlIiwiaXRlbVNwYWNpbmciLCJjb3JuZXJSYWRpdXMiLCJhbGlnbiIsIm5lZ2F0aXZlVGVybXNQcmVzZW50IiwiXyIsInNvbWUiLCJjcmVhdG9yTm9kZSIsImNyZWF0ZWRDb2luVGVybUluaXRpYWxDb3VudCIsImNvaW5UZXJtVHlwZUxpc3QiLCJ1bmlxIiwibWFwIiwiY29pblRlcm1DcmVhdG9yQm94IiwiZWxlbWVudCIsImNyZWF0ZU5vZGUiLCJ0YW5kZW0iLCJIIiwiVyIsInBhbmVsIiwiZmlsbCIsImNoaWxkcmVuIiwiY2VudGVyIiwiY2xpcEFyZWEiLCJyZWN0IiwiaXRlbXNQZXJQYWdlIiwic3BhY2luZyIsIm1hcmdpbiIsImFkZENoaWxkIiwibXV0YXRlIiwiZGlzcG9zZUNvaW5UZXJtQ3JlYXRvckJveCIsImZvckVhY2giLCJkaXNwb3NlIiwicmVzZXQiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIkNvaW5UZXJtQ3JlYXRvckJveC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNi0yMDIzLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBTY2VuZXJ5IG5vZGUgdGhhdCBob2xkcyBhIHNldCBvZiBjcmVhdG9yIG5vZGVzLlxyXG4gKlxyXG4gKiBUaGlzIGlzIHNvbWV3aGF0IHNwZWNpZmljIHRvIHRoZSBFeHByZXNzaW9uIEV4Y2hhbmdlIHNpbXVsYXRpb24sIGJ1dCBjb3VsZCBlYXNpbHkgYmUgdHVybmVkIGludG8gYSBiYXNlIGNsYXNzIGFuZFxyXG4gKiB1c2VkIG1vcmUgZ2VuZXJhbGx5LlxyXG4gKlxyXG4gKiBAYXV0aG9yIEpvaG4gQmxhbmNvXHJcbiAqL1xyXG5cclxuaW1wb3J0IG1lcmdlIGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9tZXJnZS5qcyc7XHJcbmltcG9ydCB7IE5vZGUsIFJlY3RhbmdsZSB9IGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvaW1wb3J0cy5qcyc7XHJcbmltcG9ydCBDYXJvdXNlbCBmcm9tICcuLi8uLi8uLi8uLi9zdW4vanMvQ2Fyb3VzZWwuanMnO1xyXG5pbXBvcnQgeyBTaGFwZSB9IGZyb20gJy4uLy4uLy4uLy4uL2tpdGUvanMvaW1wb3J0cy5qcyc7XHJcbmltcG9ydCBWZWN0b3IyIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9WZWN0b3IyLmpzJztcclxuaW1wb3J0IGV4cHJlc3Npb25FeGNoYW5nZSBmcm9tICcuLi8uLi9leHByZXNzaW9uRXhjaGFuZ2UuanMnO1xyXG5cclxuY2xhc3MgQ29pblRlcm1DcmVhdG9yQm94IGV4dGVuZHMgTm9kZSB7XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwYXJhbSB7QXJyYXkuPENvaW5UZXJtQ3JlYXRvck5vZGU+fSBjcmVhdG9yTm9kZXMgLSBzZXQgb2YgY29pbiB0ZXJtIGNyZWF0b3Igbm9kZXNcclxuICAgKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnNdXHJcbiAgICovXHJcbiAgY29uc3RydWN0b3IoIGNyZWF0b3JOb2Rlcywgb3B0aW9ucyApIHtcclxuXHJcbiAgICBzdXBlcigpO1xyXG5cclxuICAgIG9wdGlvbnMgPSBtZXJnZSgge1xyXG4gICAgICBpdGVtc1BlckNhcm91c2VsUGFnZTogMyxcclxuICAgICAgaXRlbVNwYWNpbmc6IDUsIC8vIGVtcGlyaWNhbGx5IGRldGVybWluZWQgdG8gd29yayBmb3IgbW9zdCBjYXNlcyBpbiB0aGlzIHNpbVxyXG4gICAgICBjb3JuZXJSYWRpdXM6IDQsXHJcbiAgICAgIGFsaWduOiAnY2VudGVyJ1xyXG4gICAgfSwgb3B0aW9ucyApO1xyXG5cclxuICAgIC8vIEBwdWJsaWMgKHJlYWQtb25seSkge2Jvb2xlYW59IC0gYSBmbGFnIHRoYXQgaW5kaWNhdGVzIGlmIGNyZWF0b3Igbm9kZXMgdGhhdCBjcmVhdGUgY29pbiB0ZXJtcyB3aXRoIG5lZ2F0aXZlXHJcbiAgICAvLyBpbml0aWFsIHZhbHVlcyBhcmUgcHJlc2VudFxyXG4gICAgdGhpcy5uZWdhdGl2ZVRlcm1zUHJlc2VudCA9IF8uc29tZSggY3JlYXRvck5vZGVzLCBjcmVhdG9yTm9kZSA9PiBjcmVhdG9yTm9kZS5jcmVhdGVkQ29pblRlcm1Jbml0aWFsQ291bnQgPCAwICk7XHJcblxyXG4gICAgLy8gQHB1YmxpYyAocmVhZC1vbmx5KSB7QXJyYXkuPENvaW5UZXJtVHlwZUlEPn0gLSBsaXN0IG9mIHRoZSBjb2luIHRlcm0gdHlwZXMgcHJlc2VudCBpbiB0aGlzIGNyZWF0b3IgYm94XHJcbiAgICB0aGlzLmNvaW5UZXJtVHlwZUxpc3QgPSBfLnVuaXEoIF8ubWFwKCBjcmVhdG9yTm9kZXMsICd0eXBlSUQnICkgKTtcclxuXHJcbiAgICAvLyBAcHJpdmF0ZSB7Tm9kZX1cclxuICAgIHRoaXMuY29pblRlcm1DcmVhdG9yQm94ID0gbmV3IENhcm91c2VsKCBjcmVhdG9yTm9kZXMubWFwKCBlbGVtZW50ID0+IHtcclxuICAgICAgcmV0dXJuIHtcclxuICAgICAgICBjcmVhdGVOb2RlOiB0YW5kZW0gPT4ge1xyXG5cclxuICAgICAgICAgIC8vIFBpY2sgYm91bmRzIHRoYXQgZml0IGV2ZXJ5IHNpbmdsZSB0aGluZyBpbiB0aGUgc2ltLlxyXG4gICAgICAgICAgY29uc3QgSCA9IDkwO1xyXG4gICAgICAgICAgY29uc3QgVyA9IDE0MDtcclxuXHJcbiAgICAgICAgICAvLyBDb3VsZCBiZSBhIE5vZGUsIGJ1dCB0aGlzIGhlbHBzIHdpdGggZGVidWdnaW5nIGlmIHlvdSB3YW50IHRvIHNlZSB0aGUgYm91bmRzLlxyXG4gICAgICAgICAgY29uc3QgcGFuZWwgPSBuZXcgUmVjdGFuZ2xlKCAwLCAwLCBXLCBILCB7XHJcbiAgICAgICAgICAgIGZpbGw6ICd0cmFuc3BhcmVudCcsXHJcbiAgICAgICAgICAgIGNoaWxkcmVuOiBbIGVsZW1lbnQgXVxyXG4gICAgICAgICAgfSApO1xyXG4gICAgICAgICAgZWxlbWVudC5jZW50ZXIgPSBuZXcgVmVjdG9yMiggVyAvIDIsIEggLyAyICk7XHJcblxyXG4gICAgICAgICAgLy8gUHJldmVudCByZXNpemluZyB3aGVuIGVsZW1lbnRzIGJvdW5kcyB3YW50IHRvIGdvIG91dHNpZGUgdGhlIHJlY3RhbmdsZVxyXG4gICAgICAgICAgcGFuZWwuY2xpcEFyZWEgPSBTaGFwZS5yZWN0KCAwLCAwLCBXLCBIICk7XHJcblxyXG4gICAgICAgICAgcmV0dXJuIHBhbmVsO1xyXG4gICAgICAgIH1cclxuICAgICAgfTtcclxuICAgIH0gKSwge1xyXG4gICAgICBpdGVtc1BlclBhZ2U6IG9wdGlvbnMuaXRlbXNQZXJDYXJvdXNlbFBhZ2UsXHJcbiAgICAgIHNwYWNpbmc6IDUsXHJcbiAgICAgIG1hcmdpbjogNSxcclxuICAgICAgY29ybmVyUmFkaXVzOiBvcHRpb25zLmNvcm5lclJhZGl1c1xyXG4gICAgfSApO1xyXG4gICAgdGhpcy5hZGRDaGlsZCggdGhpcy5jb2luVGVybUNyZWF0b3JCb3ggKTtcclxuXHJcbiAgICB0aGlzLm11dGF0ZSggb3B0aW9ucyApO1xyXG5cclxuICAgIC8vIGFkZCBhIGRpc3Bvc2UgZnVuY3Rpb25cclxuICAgIHRoaXMuZGlzcG9zZUNvaW5UZXJtQ3JlYXRvckJveCA9ICgpID0+IHtcclxuICAgICAgY3JlYXRvck5vZGVzLmZvckVhY2goIGNyZWF0b3JOb2RlID0+IHsgY3JlYXRvck5vZGUuZGlzcG9zZSgpOyB9ICk7XHJcbiAgICB9O1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIHJlc2V0KCkge1xyXG4gICAgdGhpcy5jb2luVGVybUNyZWF0b3JCb3gucmVzZXQgJiYgdGhpcy5jb2luVGVybUNyZWF0b3JCb3gucmVzZXQoKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICBkaXNwb3NlKCkge1xyXG4gICAgdGhpcy5kaXNwb3NlQ29pblRlcm1DcmVhdG9yQm94KCk7XHJcbiAgICBzdXBlci5kaXNwb3NlKCk7XHJcbiAgfVxyXG59XHJcblxyXG5leHByZXNzaW9uRXhjaGFuZ2UucmVnaXN0ZXIoICdDb2luVGVybUNyZWF0b3JCb3gnLCBDb2luVGVybUNyZWF0b3JCb3ggKTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IENvaW5UZXJtQ3JlYXRvckJveDsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsS0FBSyxNQUFNLG1DQUFtQztBQUNyRCxTQUFTQyxJQUFJLEVBQUVDLFNBQVMsUUFBUSxtQ0FBbUM7QUFDbkUsT0FBT0MsUUFBUSxNQUFNLGdDQUFnQztBQUNyRCxTQUFTQyxLQUFLLFFBQVEsZ0NBQWdDO0FBQ3RELE9BQU9DLE9BQU8sTUFBTSwrQkFBK0I7QUFDbkQsT0FBT0Msa0JBQWtCLE1BQU0sNkJBQTZCO0FBRTVELE1BQU1DLGtCQUFrQixTQUFTTixJQUFJLENBQUM7RUFFcEM7QUFDRjtBQUNBO0FBQ0E7RUFDRU8sV0FBV0EsQ0FBRUMsWUFBWSxFQUFFQyxPQUFPLEVBQUc7SUFFbkMsS0FBSyxDQUFDLENBQUM7SUFFUEEsT0FBTyxHQUFHVixLQUFLLENBQUU7TUFDZlcsb0JBQW9CLEVBQUUsQ0FBQztNQUN2QkMsV0FBVyxFQUFFLENBQUM7TUFBRTtNQUNoQkMsWUFBWSxFQUFFLENBQUM7TUFDZkMsS0FBSyxFQUFFO0lBQ1QsQ0FBQyxFQUFFSixPQUFRLENBQUM7O0lBRVo7SUFDQTtJQUNBLElBQUksQ0FBQ0ssb0JBQW9CLEdBQUdDLENBQUMsQ0FBQ0MsSUFBSSxDQUFFUixZQUFZLEVBQUVTLFdBQVcsSUFBSUEsV0FBVyxDQUFDQywyQkFBMkIsR0FBRyxDQUFFLENBQUM7O0lBRTlHO0lBQ0EsSUFBSSxDQUFDQyxnQkFBZ0IsR0FBR0osQ0FBQyxDQUFDSyxJQUFJLENBQUVMLENBQUMsQ0FBQ00sR0FBRyxDQUFFYixZQUFZLEVBQUUsUUFBUyxDQUFFLENBQUM7O0lBRWpFO0lBQ0EsSUFBSSxDQUFDYyxrQkFBa0IsR0FBRyxJQUFJcEIsUUFBUSxDQUFFTSxZQUFZLENBQUNhLEdBQUcsQ0FBRUUsT0FBTyxJQUFJO01BQ25FLE9BQU87UUFDTEMsVUFBVSxFQUFFQyxNQUFNLElBQUk7VUFFcEI7VUFDQSxNQUFNQyxDQUFDLEdBQUcsRUFBRTtVQUNaLE1BQU1DLENBQUMsR0FBRyxHQUFHOztVQUViO1VBQ0EsTUFBTUMsS0FBSyxHQUFHLElBQUkzQixTQUFTLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRTBCLENBQUMsRUFBRUQsQ0FBQyxFQUFFO1lBQ3ZDRyxJQUFJLEVBQUUsYUFBYTtZQUNuQkMsUUFBUSxFQUFFLENBQUVQLE9BQU87VUFDckIsQ0FBRSxDQUFDO1VBQ0hBLE9BQU8sQ0FBQ1EsTUFBTSxHQUFHLElBQUkzQixPQUFPLENBQUV1QixDQUFDLEdBQUcsQ0FBQyxFQUFFRCxDQUFDLEdBQUcsQ0FBRSxDQUFDOztVQUU1QztVQUNBRSxLQUFLLENBQUNJLFFBQVEsR0FBRzdCLEtBQUssQ0FBQzhCLElBQUksQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFTixDQUFDLEVBQUVELENBQUUsQ0FBQztVQUV6QyxPQUFPRSxLQUFLO1FBQ2Q7TUFDRixDQUFDO0lBQ0gsQ0FBRSxDQUFDLEVBQUU7TUFDSE0sWUFBWSxFQUFFekIsT0FBTyxDQUFDQyxvQkFBb0I7TUFDMUN5QixPQUFPLEVBQUUsQ0FBQztNQUNWQyxNQUFNLEVBQUUsQ0FBQztNQUNUeEIsWUFBWSxFQUFFSCxPQUFPLENBQUNHO0lBQ3hCLENBQUUsQ0FBQztJQUNILElBQUksQ0FBQ3lCLFFBQVEsQ0FBRSxJQUFJLENBQUNmLGtCQUFtQixDQUFDO0lBRXhDLElBQUksQ0FBQ2dCLE1BQU0sQ0FBRTdCLE9BQVEsQ0FBQzs7SUFFdEI7SUFDQSxJQUFJLENBQUM4Qix5QkFBeUIsR0FBRyxNQUFNO01BQ3JDL0IsWUFBWSxDQUFDZ0MsT0FBTyxDQUFFdkIsV0FBVyxJQUFJO1FBQUVBLFdBQVcsQ0FBQ3dCLE9BQU8sQ0FBQyxDQUFDO01BQUUsQ0FBRSxDQUFDO0lBQ25FLENBQUM7RUFDSDs7RUFFQTtBQUNGO0FBQ0E7RUFDRUMsS0FBS0EsQ0FBQSxFQUFHO0lBQ04sSUFBSSxDQUFDcEIsa0JBQWtCLENBQUNvQixLQUFLLElBQUksSUFBSSxDQUFDcEIsa0JBQWtCLENBQUNvQixLQUFLLENBQUMsQ0FBQztFQUNsRTs7RUFFQTtBQUNGO0FBQ0E7RUFDRUQsT0FBT0EsQ0FBQSxFQUFHO0lBQ1IsSUFBSSxDQUFDRix5QkFBeUIsQ0FBQyxDQUFDO0lBQ2hDLEtBQUssQ0FBQ0UsT0FBTyxDQUFDLENBQUM7RUFDakI7QUFDRjtBQUVBcEMsa0JBQWtCLENBQUNzQyxRQUFRLENBQUUsb0JBQW9CLEVBQUVyQyxrQkFBbUIsQ0FBQztBQUV2RSxlQUFlQSxrQkFBa0IifQ==