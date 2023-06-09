// Copyright 2020-2022, University of Colorado Boulder

import bamboo from './bamboo.js';

/**
 * Indicates whether objects will be truncated right at the edge of the chart, or beyond the edge of the chart.
 *
 * For objects within the chart, you may need a lenient ClippingStyle so it doesn't flicker off and disappear
 * abruptly when scrolling out of view.
 *
 * For objects outside the chart, you may need a strict ClippingStyle so they don't exceed the bounds of the chart.
 * @author Sam Reid (PhET Interactive Simulations)
 */

const ClippingTypeValues = ['strict', 'lenient'];
bamboo.register('ClippingTypeValues', ClippingTypeValues);
export { ClippingTypeValues };
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJiYW1ib28iLCJDbGlwcGluZ1R5cGVWYWx1ZXMiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIkNsaXBwaW5nVHlwZS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAyMC0yMDIyLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbmltcG9ydCBiYW1ib28gZnJvbSAnLi9iYW1ib28uanMnO1xyXG5cclxuLyoqXHJcbiAqIEluZGljYXRlcyB3aGV0aGVyIG9iamVjdHMgd2lsbCBiZSB0cnVuY2F0ZWQgcmlnaHQgYXQgdGhlIGVkZ2Ugb2YgdGhlIGNoYXJ0LCBvciBiZXlvbmQgdGhlIGVkZ2Ugb2YgdGhlIGNoYXJ0LlxyXG4gKlxyXG4gKiBGb3Igb2JqZWN0cyB3aXRoaW4gdGhlIGNoYXJ0LCB5b3UgbWF5IG5lZWQgYSBsZW5pZW50IENsaXBwaW5nU3R5bGUgc28gaXQgZG9lc24ndCBmbGlja2VyIG9mZiBhbmQgZGlzYXBwZWFyXHJcbiAqIGFicnVwdGx5IHdoZW4gc2Nyb2xsaW5nIG91dCBvZiB2aWV3LlxyXG4gKlxyXG4gKiBGb3Igb2JqZWN0cyBvdXRzaWRlIHRoZSBjaGFydCwgeW91IG1heSBuZWVkIGEgc3RyaWN0IENsaXBwaW5nU3R5bGUgc28gdGhleSBkb24ndCBleGNlZWQgdGhlIGJvdW5kcyBvZiB0aGUgY2hhcnQuXHJcbiAqIEBhdXRob3IgU2FtIFJlaWQgKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXHJcbiAqL1xyXG5cclxuY29uc3QgQ2xpcHBpbmdUeXBlVmFsdWVzID0gWyAnc3RyaWN0JywgJ2xlbmllbnQnIF0gYXMgY29uc3Q7XHJcbnR5cGUgQ2xpcHBpbmdUeXBlID0gdHlwZW9mIENsaXBwaW5nVHlwZVZhbHVlc1tudW1iZXJdO1xyXG5cclxuYmFtYm9vLnJlZ2lzdGVyKCAnQ2xpcHBpbmdUeXBlVmFsdWVzJywgQ2xpcHBpbmdUeXBlVmFsdWVzICk7XHJcblxyXG5leHBvcnQgeyBDbGlwcGluZ1R5cGVWYWx1ZXMgfTtcclxuZXhwb3J0IGRlZmF1bHQgQ2xpcHBpbmdUeXBlOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUEsT0FBT0EsTUFBTSxNQUFNLGFBQWE7O0FBRWhDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxNQUFNQyxrQkFBa0IsR0FBRyxDQUFFLFFBQVEsRUFBRSxTQUFTLENBQVc7QUFHM0RELE1BQU0sQ0FBQ0UsUUFBUSxDQUFFLG9CQUFvQixFQUFFRCxrQkFBbUIsQ0FBQztBQUUzRCxTQUFTQSxrQkFBa0IifQ==