// Copyright 2017-2022, University of Colorado Boulder

/**
 * Colored background area for generic partitioned areas.
 *
 * NOTE: This type is designed to be persistent, and will not need to release references to avoid memory leaks.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import DynamicProperty from '../../../../axon/js/DynamicProperty.js';
import Multilink from '../../../../axon/js/Multilink.js';
import { Rectangle } from '../../../../scenery/js/imports.js';
import areaModelCommon from '../../areaModelCommon.js';
import AreaModelCommonColors from '../../common/view/AreaModelCommonColors.js';
class GenericPartitionedAreaNode extends Rectangle {
  /**
   * @param {Property.<PartitionedArea>} partitionedAreaProperty
   * @param {Property.<ModelViewTransform2>} modelViewTransformProperty
   */
  constructor(partitionedAreaProperty, modelViewTransformProperty) {
    // We'll set the fill/size/etc. below.
    super({});

    // @public {Property.<PartitionedArea>} - Exposed so it can be set later
    this.partitionedAreaProperty = partitionedAreaProperty;

    // Fill
    new DynamicProperty(partitionedAreaProperty, {
      derive: 'areaProperty'
    }).link(area => {
      if (area === null || area.coefficient === 0) {
        this.fill = null;
      } else if (area.coefficient > 0) {
        this.fill = AreaModelCommonColors.genericPositiveBackgroundProperty;
      } else {
        this.fill = AreaModelCommonColors.genericNegativeBackgroundProperty;
      }
    });

    // Visibility
    new DynamicProperty(partitionedAreaProperty, {
      derive: 'visibleProperty',
      defaultValue: false
    }).linkAttribute(this, 'visible');

    // Adjust our rectangle dimension/position so that we take up the bounds defined by the partitioned area. Our area
    // can change, so we need to swap out or multilink when the area changes (kept so we can dispose it)
    let rangeMultilinks = null; // {OrientationPair.<Multilink>|null}
    partitionedAreaProperty.link(partitionedArea => {
      // Release any previous references
      rangeMultilinks && rangeMultilinks.forEach(rangeMultilink => {
        rangeMultilink.dispose();
      });
      rangeMultilinks = null;
      if (partitionedArea) {
        rangeMultilinks = partitionedArea.partitions.map((partition, orientation) => Multilink.multilink([partition.coordinateRangeProperty, modelViewTransformProperty], (range, modelViewTransform) => {
          if (range !== null) {
            this[orientation.rectCoordinate] = modelViewTransform.modelToViewX(range.min);
            this[orientation.rectSize] = modelViewTransform.modelToViewX(range.getLength());
          }
        }));
      }
    });
  }
}
areaModelCommon.register('GenericPartitionedAreaNode', GenericPartitionedAreaNode);
export default GenericPartitionedAreaNode;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJEeW5hbWljUHJvcGVydHkiLCJNdWx0aWxpbmsiLCJSZWN0YW5nbGUiLCJhcmVhTW9kZWxDb21tb24iLCJBcmVhTW9kZWxDb21tb25Db2xvcnMiLCJHZW5lcmljUGFydGl0aW9uZWRBcmVhTm9kZSIsImNvbnN0cnVjdG9yIiwicGFydGl0aW9uZWRBcmVhUHJvcGVydHkiLCJtb2RlbFZpZXdUcmFuc2Zvcm1Qcm9wZXJ0eSIsImRlcml2ZSIsImxpbmsiLCJhcmVhIiwiY29lZmZpY2llbnQiLCJmaWxsIiwiZ2VuZXJpY1Bvc2l0aXZlQmFja2dyb3VuZFByb3BlcnR5IiwiZ2VuZXJpY05lZ2F0aXZlQmFja2dyb3VuZFByb3BlcnR5IiwiZGVmYXVsdFZhbHVlIiwibGlua0F0dHJpYnV0ZSIsInJhbmdlTXVsdGlsaW5rcyIsInBhcnRpdGlvbmVkQXJlYSIsImZvckVhY2giLCJyYW5nZU11bHRpbGluayIsImRpc3Bvc2UiLCJwYXJ0aXRpb25zIiwibWFwIiwicGFydGl0aW9uIiwib3JpZW50YXRpb24iLCJtdWx0aWxpbmsiLCJjb29yZGluYXRlUmFuZ2VQcm9wZXJ0eSIsInJhbmdlIiwibW9kZWxWaWV3VHJhbnNmb3JtIiwicmVjdENvb3JkaW5hdGUiLCJtb2RlbFRvVmlld1giLCJtaW4iLCJyZWN0U2l6ZSIsImdldExlbmd0aCIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiR2VuZXJpY1BhcnRpdGlvbmVkQXJlYU5vZGUuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTctMjAyMiwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogQ29sb3JlZCBiYWNrZ3JvdW5kIGFyZWEgZm9yIGdlbmVyaWMgcGFydGl0aW9uZWQgYXJlYXMuXHJcbiAqXHJcbiAqIE5PVEU6IFRoaXMgdHlwZSBpcyBkZXNpZ25lZCB0byBiZSBwZXJzaXN0ZW50LCBhbmQgd2lsbCBub3QgbmVlZCB0byByZWxlYXNlIHJlZmVyZW5jZXMgdG8gYXZvaWQgbWVtb3J5IGxlYWtzLlxyXG4gKlxyXG4gKiBAYXV0aG9yIEpvbmF0aGFuIE9sc29uIDxqb25hdGhhbi5vbHNvbkBjb2xvcmFkby5lZHU+XHJcbiAqL1xyXG5cclxuaW1wb3J0IER5bmFtaWNQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL0R5bmFtaWNQcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBNdWx0aWxpbmsgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9NdWx0aWxpbmsuanMnO1xyXG5pbXBvcnQgeyBSZWN0YW5nbGUgfSBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgYXJlYU1vZGVsQ29tbW9uIGZyb20gJy4uLy4uL2FyZWFNb2RlbENvbW1vbi5qcyc7XHJcbmltcG9ydCBBcmVhTW9kZWxDb21tb25Db2xvcnMgZnJvbSAnLi4vLi4vY29tbW9uL3ZpZXcvQXJlYU1vZGVsQ29tbW9uQ29sb3JzLmpzJztcclxuXHJcbmNsYXNzIEdlbmVyaWNQYXJ0aXRpb25lZEFyZWFOb2RlIGV4dGVuZHMgUmVjdGFuZ2xlIHtcclxuICAvKipcclxuICAgKiBAcGFyYW0ge1Byb3BlcnR5LjxQYXJ0aXRpb25lZEFyZWE+fSBwYXJ0aXRpb25lZEFyZWFQcm9wZXJ0eVxyXG4gICAqIEBwYXJhbSB7UHJvcGVydHkuPE1vZGVsVmlld1RyYW5zZm9ybTI+fSBtb2RlbFZpZXdUcmFuc2Zvcm1Qcm9wZXJ0eVxyXG4gICAqL1xyXG4gIGNvbnN0cnVjdG9yKCBwYXJ0aXRpb25lZEFyZWFQcm9wZXJ0eSwgbW9kZWxWaWV3VHJhbnNmb3JtUHJvcGVydHkgKSB7XHJcblxyXG4gICAgLy8gV2UnbGwgc2V0IHRoZSBmaWxsL3NpemUvZXRjLiBiZWxvdy5cclxuICAgIHN1cGVyKCB7fSApO1xyXG5cclxuICAgIC8vIEBwdWJsaWMge1Byb3BlcnR5LjxQYXJ0aXRpb25lZEFyZWE+fSAtIEV4cG9zZWQgc28gaXQgY2FuIGJlIHNldCBsYXRlclxyXG4gICAgdGhpcy5wYXJ0aXRpb25lZEFyZWFQcm9wZXJ0eSA9IHBhcnRpdGlvbmVkQXJlYVByb3BlcnR5O1xyXG5cclxuICAgIC8vIEZpbGxcclxuICAgIG5ldyBEeW5hbWljUHJvcGVydHkoIHBhcnRpdGlvbmVkQXJlYVByb3BlcnR5LCB7XHJcbiAgICAgIGRlcml2ZTogJ2FyZWFQcm9wZXJ0eSdcclxuICAgIH0gKS5saW5rKCBhcmVhID0+IHtcclxuICAgICAgaWYgKCBhcmVhID09PSBudWxsIHx8IGFyZWEuY29lZmZpY2llbnQgPT09IDAgKSB7XHJcbiAgICAgICAgdGhpcy5maWxsID0gbnVsbDtcclxuICAgICAgfVxyXG4gICAgICBlbHNlIGlmICggYXJlYS5jb2VmZmljaWVudCA+IDAgKSB7XHJcbiAgICAgICAgdGhpcy5maWxsID0gQXJlYU1vZGVsQ29tbW9uQ29sb3JzLmdlbmVyaWNQb3NpdGl2ZUJhY2tncm91bmRQcm9wZXJ0eTtcclxuICAgICAgfVxyXG4gICAgICBlbHNlIHtcclxuICAgICAgICB0aGlzLmZpbGwgPSBBcmVhTW9kZWxDb21tb25Db2xvcnMuZ2VuZXJpY05lZ2F0aXZlQmFja2dyb3VuZFByb3BlcnR5O1xyXG4gICAgICB9XHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gVmlzaWJpbGl0eVxyXG4gICAgbmV3IER5bmFtaWNQcm9wZXJ0eSggcGFydGl0aW9uZWRBcmVhUHJvcGVydHksIHtcclxuICAgICAgZGVyaXZlOiAndmlzaWJsZVByb3BlcnR5JyxcclxuICAgICAgZGVmYXVsdFZhbHVlOiBmYWxzZVxyXG4gICAgfSApLmxpbmtBdHRyaWJ1dGUoIHRoaXMsICd2aXNpYmxlJyApO1xyXG5cclxuICAgIC8vIEFkanVzdCBvdXIgcmVjdGFuZ2xlIGRpbWVuc2lvbi9wb3NpdGlvbiBzbyB0aGF0IHdlIHRha2UgdXAgdGhlIGJvdW5kcyBkZWZpbmVkIGJ5IHRoZSBwYXJ0aXRpb25lZCBhcmVhLiBPdXIgYXJlYVxyXG4gICAgLy8gY2FuIGNoYW5nZSwgc28gd2UgbmVlZCB0byBzd2FwIG91dCBvciBtdWx0aWxpbmsgd2hlbiB0aGUgYXJlYSBjaGFuZ2VzIChrZXB0IHNvIHdlIGNhbiBkaXNwb3NlIGl0KVxyXG4gICAgbGV0IHJhbmdlTXVsdGlsaW5rcyA9IG51bGw7IC8vIHtPcmllbnRhdGlvblBhaXIuPE11bHRpbGluaz58bnVsbH1cclxuICAgIHBhcnRpdGlvbmVkQXJlYVByb3BlcnR5LmxpbmsoIHBhcnRpdGlvbmVkQXJlYSA9PiB7XHJcbiAgICAgIC8vIFJlbGVhc2UgYW55IHByZXZpb3VzIHJlZmVyZW5jZXNcclxuICAgICAgcmFuZ2VNdWx0aWxpbmtzICYmIHJhbmdlTXVsdGlsaW5rcy5mb3JFYWNoKCByYW5nZU11bHRpbGluayA9PiB7XHJcbiAgICAgICAgcmFuZ2VNdWx0aWxpbmsuZGlzcG9zZSgpO1xyXG4gICAgICB9ICk7XHJcbiAgICAgIHJhbmdlTXVsdGlsaW5rcyA9IG51bGw7XHJcbiAgICAgIGlmICggcGFydGl0aW9uZWRBcmVhICkge1xyXG4gICAgICAgIHJhbmdlTXVsdGlsaW5rcyA9IHBhcnRpdGlvbmVkQXJlYS5wYXJ0aXRpb25zLm1hcCggKCBwYXJ0aXRpb24sIG9yaWVudGF0aW9uICkgPT4gTXVsdGlsaW5rLm11bHRpbGluayhcclxuICAgICAgICAgIFsgcGFydGl0aW9uLmNvb3JkaW5hdGVSYW5nZVByb3BlcnR5LCBtb2RlbFZpZXdUcmFuc2Zvcm1Qcm9wZXJ0eSBdLFxyXG4gICAgICAgICAgKCByYW5nZSwgbW9kZWxWaWV3VHJhbnNmb3JtICkgPT4ge1xyXG4gICAgICAgICAgICBpZiAoIHJhbmdlICE9PSBudWxsICkge1xyXG4gICAgICAgICAgICAgIHRoaXNbIG9yaWVudGF0aW9uLnJlY3RDb29yZGluYXRlIF0gPSBtb2RlbFZpZXdUcmFuc2Zvcm0ubW9kZWxUb1ZpZXdYKCByYW5nZS5taW4gKTtcclxuICAgICAgICAgICAgICB0aGlzWyBvcmllbnRhdGlvbi5yZWN0U2l6ZSBdID0gbW9kZWxWaWV3VHJhbnNmb3JtLm1vZGVsVG9WaWV3WCggcmFuZ2UuZ2V0TGVuZ3RoKCkgKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfSApICk7XHJcbiAgICAgIH1cclxuICAgIH0gKTtcclxuICB9XHJcbn1cclxuXHJcbmFyZWFNb2RlbENvbW1vbi5yZWdpc3RlciggJ0dlbmVyaWNQYXJ0aXRpb25lZEFyZWFOb2RlJywgR2VuZXJpY1BhcnRpdGlvbmVkQXJlYU5vZGUgKTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IEdlbmVyaWNQYXJ0aXRpb25lZEFyZWFOb2RlO1xyXG4iXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLGVBQWUsTUFBTSx3Q0FBd0M7QUFDcEUsT0FBT0MsU0FBUyxNQUFNLGtDQUFrQztBQUN4RCxTQUFTQyxTQUFTLFFBQVEsbUNBQW1DO0FBQzdELE9BQU9DLGVBQWUsTUFBTSwwQkFBMEI7QUFDdEQsT0FBT0MscUJBQXFCLE1BQU0sNENBQTRDO0FBRTlFLE1BQU1DLDBCQUEwQixTQUFTSCxTQUFTLENBQUM7RUFDakQ7QUFDRjtBQUNBO0FBQ0E7RUFDRUksV0FBV0EsQ0FBRUMsdUJBQXVCLEVBQUVDLDBCQUEwQixFQUFHO0lBRWpFO0lBQ0EsS0FBSyxDQUFFLENBQUMsQ0FBRSxDQUFDOztJQUVYO0lBQ0EsSUFBSSxDQUFDRCx1QkFBdUIsR0FBR0EsdUJBQXVCOztJQUV0RDtJQUNBLElBQUlQLGVBQWUsQ0FBRU8sdUJBQXVCLEVBQUU7TUFDNUNFLE1BQU0sRUFBRTtJQUNWLENBQUUsQ0FBQyxDQUFDQyxJQUFJLENBQUVDLElBQUksSUFBSTtNQUNoQixJQUFLQSxJQUFJLEtBQUssSUFBSSxJQUFJQSxJQUFJLENBQUNDLFdBQVcsS0FBSyxDQUFDLEVBQUc7UUFDN0MsSUFBSSxDQUFDQyxJQUFJLEdBQUcsSUFBSTtNQUNsQixDQUFDLE1BQ0ksSUFBS0YsSUFBSSxDQUFDQyxXQUFXLEdBQUcsQ0FBQyxFQUFHO1FBQy9CLElBQUksQ0FBQ0MsSUFBSSxHQUFHVCxxQkFBcUIsQ0FBQ1UsaUNBQWlDO01BQ3JFLENBQUMsTUFDSTtRQUNILElBQUksQ0FBQ0QsSUFBSSxHQUFHVCxxQkFBcUIsQ0FBQ1csaUNBQWlDO01BQ3JFO0lBQ0YsQ0FBRSxDQUFDOztJQUVIO0lBQ0EsSUFBSWYsZUFBZSxDQUFFTyx1QkFBdUIsRUFBRTtNQUM1Q0UsTUFBTSxFQUFFLGlCQUFpQjtNQUN6Qk8sWUFBWSxFQUFFO0lBQ2hCLENBQUUsQ0FBQyxDQUFDQyxhQUFhLENBQUUsSUFBSSxFQUFFLFNBQVUsQ0FBQzs7SUFFcEM7SUFDQTtJQUNBLElBQUlDLGVBQWUsR0FBRyxJQUFJLENBQUMsQ0FBQztJQUM1QlgsdUJBQXVCLENBQUNHLElBQUksQ0FBRVMsZUFBZSxJQUFJO01BQy9DO01BQ0FELGVBQWUsSUFBSUEsZUFBZSxDQUFDRSxPQUFPLENBQUVDLGNBQWMsSUFBSTtRQUM1REEsY0FBYyxDQUFDQyxPQUFPLENBQUMsQ0FBQztNQUMxQixDQUFFLENBQUM7TUFDSEosZUFBZSxHQUFHLElBQUk7TUFDdEIsSUFBS0MsZUFBZSxFQUFHO1FBQ3JCRCxlQUFlLEdBQUdDLGVBQWUsQ0FBQ0ksVUFBVSxDQUFDQyxHQUFHLENBQUUsQ0FBRUMsU0FBUyxFQUFFQyxXQUFXLEtBQU16QixTQUFTLENBQUMwQixTQUFTLENBQ2pHLENBQUVGLFNBQVMsQ0FBQ0csdUJBQXVCLEVBQUVwQiwwQkFBMEIsQ0FBRSxFQUNqRSxDQUFFcUIsS0FBSyxFQUFFQyxrQkFBa0IsS0FBTTtVQUMvQixJQUFLRCxLQUFLLEtBQUssSUFBSSxFQUFHO1lBQ3BCLElBQUksQ0FBRUgsV0FBVyxDQUFDSyxjQUFjLENBQUUsR0FBR0Qsa0JBQWtCLENBQUNFLFlBQVksQ0FBRUgsS0FBSyxDQUFDSSxHQUFJLENBQUM7WUFDakYsSUFBSSxDQUFFUCxXQUFXLENBQUNRLFFBQVEsQ0FBRSxHQUFHSixrQkFBa0IsQ0FBQ0UsWUFBWSxDQUFFSCxLQUFLLENBQUNNLFNBQVMsQ0FBQyxDQUFFLENBQUM7VUFDckY7UUFDRixDQUFFLENBQUUsQ0FBQztNQUNUO0lBQ0YsQ0FBRSxDQUFDO0VBQ0w7QUFDRjtBQUVBaEMsZUFBZSxDQUFDaUMsUUFBUSxDQUFFLDRCQUE0QixFQUFFL0IsMEJBQTJCLENBQUM7QUFFcEYsZUFBZUEsMEJBQTBCIn0=