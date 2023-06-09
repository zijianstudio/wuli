// Copyright 2020-2022, University of Colorado Boulder

/**
 * slider with a title over the top
 *
 * @author John Blanco (PhET Interactive Simulations)
 */

import Dimension2 from '../../../../dot/js/Dimension2.js';
import merge from '../../../../phet-core/js/merge.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import { Color, Text, VBox } from '../../../../scenery/js/imports.js';
import HSlider from '../../../../sun/js/HSlider.js';
import statesOfMatter from '../../statesOfMatter.js';

// constants
const DEFAULT_TITLE_FONT = new PhetFont(12);
class TitledSlider extends VBox {
  /**
   * @param {NumberProperty} valueProperty - value property that will be controlled by the slider
   * @param {Range} range - range for the value property
   * @param {string} titleText - the text string that will be used to create the title
   * @param {Tandem} tandem
   * @param [options]
   */
  constructor(valueProperty, range, titleText, tandem, options) {
    options = merge({
      spacing: 5,
      align: 'center',
      tandem: tandem,
      titleOptions: {
        font: DEFAULT_TITLE_FONT,
        fill: Color.BLACK,
        tandem: tandem.createTandem('titleText')
      },
      sliderOptions: {
        trackSize: new Dimension2(140, 5),
        // empirically determined for this sim
        tandem: tandem.createTandem('slider')
      }
    }, options);
    const title = new Text(titleText, options.titleOptions);
    const slider = new HSlider(valueProperty, range, options.sliderOptions);

    // VBox is used to make it easy to add additional options
    super(merge(options, {
      children: [title, slider]
    }));

    // @public (read-only) - accessible so that tick marks and titles can be manipulated after creation
    this.slider = slider;
  }
}
statesOfMatter.register('TitledSlider', TitledSlider);
export default TitledSlider;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJEaW1lbnNpb24yIiwibWVyZ2UiLCJQaGV0Rm9udCIsIkNvbG9yIiwiVGV4dCIsIlZCb3giLCJIU2xpZGVyIiwic3RhdGVzT2ZNYXR0ZXIiLCJERUZBVUxUX1RJVExFX0ZPTlQiLCJUaXRsZWRTbGlkZXIiLCJjb25zdHJ1Y3RvciIsInZhbHVlUHJvcGVydHkiLCJyYW5nZSIsInRpdGxlVGV4dCIsInRhbmRlbSIsIm9wdGlvbnMiLCJzcGFjaW5nIiwiYWxpZ24iLCJ0aXRsZU9wdGlvbnMiLCJmb250IiwiZmlsbCIsIkJMQUNLIiwiY3JlYXRlVGFuZGVtIiwic2xpZGVyT3B0aW9ucyIsInRyYWNrU2l6ZSIsInRpdGxlIiwic2xpZGVyIiwiY2hpbGRyZW4iLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIlRpdGxlZFNsaWRlci5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAyMC0yMDIyLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBzbGlkZXIgd2l0aCBhIHRpdGxlIG92ZXIgdGhlIHRvcFxyXG4gKlxyXG4gKiBAYXV0aG9yIEpvaG4gQmxhbmNvIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxyXG4gKi9cclxuXHJcbmltcG9ydCBEaW1lbnNpb24yIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9EaW1lbnNpb24yLmpzJztcclxuaW1wb3J0IG1lcmdlIGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9tZXJnZS5qcyc7XHJcbmltcG9ydCBQaGV0Rm9udCBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5LXBoZXQvanMvUGhldEZvbnQuanMnO1xyXG5pbXBvcnQgeyBDb2xvciwgVGV4dCwgVkJveCB9IGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvaW1wb3J0cy5qcyc7XHJcbmltcG9ydCBIU2xpZGVyIGZyb20gJy4uLy4uLy4uLy4uL3N1bi9qcy9IU2xpZGVyLmpzJztcclxuaW1wb3J0IHN0YXRlc09mTWF0dGVyIGZyb20gJy4uLy4uL3N0YXRlc09mTWF0dGVyLmpzJztcclxuXHJcbi8vIGNvbnN0YW50c1xyXG5jb25zdCBERUZBVUxUX1RJVExFX0ZPTlQgPSBuZXcgUGhldEZvbnQoIDEyICk7XHJcblxyXG5jbGFzcyBUaXRsZWRTbGlkZXIgZXh0ZW5kcyBWQm94IHtcclxuXHJcbiAgLyoqXHJcbiAgICogQHBhcmFtIHtOdW1iZXJQcm9wZXJ0eX0gdmFsdWVQcm9wZXJ0eSAtIHZhbHVlIHByb3BlcnR5IHRoYXQgd2lsbCBiZSBjb250cm9sbGVkIGJ5IHRoZSBzbGlkZXJcclxuICAgKiBAcGFyYW0ge1JhbmdlfSByYW5nZSAtIHJhbmdlIGZvciB0aGUgdmFsdWUgcHJvcGVydHlcclxuICAgKiBAcGFyYW0ge3N0cmluZ30gdGl0bGVUZXh0IC0gdGhlIHRleHQgc3RyaW5nIHRoYXQgd2lsbCBiZSB1c2VkIHRvIGNyZWF0ZSB0aGUgdGl0bGVcclxuICAgKiBAcGFyYW0ge1RhbmRlbX0gdGFuZGVtXHJcbiAgICogQHBhcmFtIFtvcHRpb25zXVxyXG4gICAqL1xyXG4gIGNvbnN0cnVjdG9yKCB2YWx1ZVByb3BlcnR5LCByYW5nZSwgdGl0bGVUZXh0LCB0YW5kZW0sIG9wdGlvbnMgKSB7XHJcblxyXG4gICAgb3B0aW9ucyA9IG1lcmdlKCB7XHJcbiAgICAgIHNwYWNpbmc6IDUsXHJcbiAgICAgIGFsaWduOiAnY2VudGVyJyxcclxuICAgICAgdGFuZGVtOiB0YW5kZW0sXHJcbiAgICAgIHRpdGxlT3B0aW9uczoge1xyXG4gICAgICAgIGZvbnQ6IERFRkFVTFRfVElUTEVfRk9OVCxcclxuICAgICAgICBmaWxsOiBDb2xvci5CTEFDSyxcclxuICAgICAgICB0YW5kZW06IHRhbmRlbS5jcmVhdGVUYW5kZW0oICd0aXRsZVRleHQnIClcclxuICAgICAgfSxcclxuICAgICAgc2xpZGVyT3B0aW9uczoge1xyXG4gICAgICAgIHRyYWNrU2l6ZTogbmV3IERpbWVuc2lvbjIoIDE0MCwgNSApLCAvLyBlbXBpcmljYWxseSBkZXRlcm1pbmVkIGZvciB0aGlzIHNpbVxyXG4gICAgICAgIHRhbmRlbTogdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ3NsaWRlcicgKVxyXG4gICAgICB9XHJcbiAgICB9LCBvcHRpb25zICk7XHJcblxyXG4gICAgY29uc3QgdGl0bGUgPSBuZXcgVGV4dCggdGl0bGVUZXh0LCBvcHRpb25zLnRpdGxlT3B0aW9ucyApO1xyXG4gICAgY29uc3Qgc2xpZGVyID0gbmV3IEhTbGlkZXIoIHZhbHVlUHJvcGVydHksIHJhbmdlLCBvcHRpb25zLnNsaWRlck9wdGlvbnMgKTtcclxuXHJcbiAgICAvLyBWQm94IGlzIHVzZWQgdG8gbWFrZSBpdCBlYXN5IHRvIGFkZCBhZGRpdGlvbmFsIG9wdGlvbnNcclxuICAgIHN1cGVyKCBtZXJnZSggb3B0aW9ucywge1xyXG4gICAgICBjaGlsZHJlbjogWyB0aXRsZSwgc2xpZGVyIF1cclxuICAgIH0gKSApO1xyXG5cclxuICAgIC8vIEBwdWJsaWMgKHJlYWQtb25seSkgLSBhY2Nlc3NpYmxlIHNvIHRoYXQgdGljayBtYXJrcyBhbmQgdGl0bGVzIGNhbiBiZSBtYW5pcHVsYXRlZCBhZnRlciBjcmVhdGlvblxyXG4gICAgdGhpcy5zbGlkZXIgPSBzbGlkZXI7XHJcbiAgfVxyXG59XHJcblxyXG5zdGF0ZXNPZk1hdHRlci5yZWdpc3RlciggJ1RpdGxlZFNsaWRlcicsIFRpdGxlZFNsaWRlciApO1xyXG5leHBvcnQgZGVmYXVsdCBUaXRsZWRTbGlkZXI7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLFVBQVUsTUFBTSxrQ0FBa0M7QUFDekQsT0FBT0MsS0FBSyxNQUFNLG1DQUFtQztBQUNyRCxPQUFPQyxRQUFRLE1BQU0seUNBQXlDO0FBQzlELFNBQVNDLEtBQUssRUFBRUMsSUFBSSxFQUFFQyxJQUFJLFFBQVEsbUNBQW1DO0FBQ3JFLE9BQU9DLE9BQU8sTUFBTSwrQkFBK0I7QUFDbkQsT0FBT0MsY0FBYyxNQUFNLHlCQUF5Qjs7QUFFcEQ7QUFDQSxNQUFNQyxrQkFBa0IsR0FBRyxJQUFJTixRQUFRLENBQUUsRUFBRyxDQUFDO0FBRTdDLE1BQU1PLFlBQVksU0FBU0osSUFBSSxDQUFDO0VBRTlCO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ0VLLFdBQVdBLENBQUVDLGFBQWEsRUFBRUMsS0FBSyxFQUFFQyxTQUFTLEVBQUVDLE1BQU0sRUFBRUMsT0FBTyxFQUFHO0lBRTlEQSxPQUFPLEdBQUdkLEtBQUssQ0FBRTtNQUNmZSxPQUFPLEVBQUUsQ0FBQztNQUNWQyxLQUFLLEVBQUUsUUFBUTtNQUNmSCxNQUFNLEVBQUVBLE1BQU07TUFDZEksWUFBWSxFQUFFO1FBQ1pDLElBQUksRUFBRVgsa0JBQWtCO1FBQ3hCWSxJQUFJLEVBQUVqQixLQUFLLENBQUNrQixLQUFLO1FBQ2pCUCxNQUFNLEVBQUVBLE1BQU0sQ0FBQ1EsWUFBWSxDQUFFLFdBQVk7TUFDM0MsQ0FBQztNQUNEQyxhQUFhLEVBQUU7UUFDYkMsU0FBUyxFQUFFLElBQUl4QixVQUFVLENBQUUsR0FBRyxFQUFFLENBQUUsQ0FBQztRQUFFO1FBQ3JDYyxNQUFNLEVBQUVBLE1BQU0sQ0FBQ1EsWUFBWSxDQUFFLFFBQVM7TUFDeEM7SUFDRixDQUFDLEVBQUVQLE9BQVEsQ0FBQztJQUVaLE1BQU1VLEtBQUssR0FBRyxJQUFJckIsSUFBSSxDQUFFUyxTQUFTLEVBQUVFLE9BQU8sQ0FBQ0csWUFBYSxDQUFDO0lBQ3pELE1BQU1RLE1BQU0sR0FBRyxJQUFJcEIsT0FBTyxDQUFFSyxhQUFhLEVBQUVDLEtBQUssRUFBRUcsT0FBTyxDQUFDUSxhQUFjLENBQUM7O0lBRXpFO0lBQ0EsS0FBSyxDQUFFdEIsS0FBSyxDQUFFYyxPQUFPLEVBQUU7TUFDckJZLFFBQVEsRUFBRSxDQUFFRixLQUFLLEVBQUVDLE1BQU07SUFDM0IsQ0FBRSxDQUFFLENBQUM7O0lBRUw7SUFDQSxJQUFJLENBQUNBLE1BQU0sR0FBR0EsTUFBTTtFQUN0QjtBQUNGO0FBRUFuQixjQUFjLENBQUNxQixRQUFRLENBQUUsY0FBYyxFQUFFbkIsWUFBYSxDQUFDO0FBQ3ZELGVBQWVBLFlBQVkifQ==