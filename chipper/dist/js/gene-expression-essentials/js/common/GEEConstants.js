// Copyright 2015-2021, University of Colorado Boulder

/**
 * The constants used in DNAMolecule is referred in multiple external places, so a separate constants file is created
 *
 * @author Sharfudeen Ashraf
 * @author John Blanco
 * @author Aadish Gupta
 */

import Vector2 from '../../../dot/js/Vector2.js';
import ModelViewTransform2 from '../../../phetcommon/js/view/ModelViewTransform2.js';
import { Color } from '../../../scenery/js/imports.js';
import geneExpressionEssentials from '../geneExpressionEssentials.js';

// constants
const LENGTH_PER_TWIST = 340; // In picometers
const BASE_PAIRS_PER_TWIST = 10; // In picometers.
const INTER_POINT_DISTANCE = 75; // In picometers

const GEEConstants = {
  // max DT value, used by all screens now, but this doesn't need to be the case
  MAX_DT: 1 / 60 * 10,
  // constants that define the geometry of the DNA molecule
  DNA_MOLECULE_DIAMETER: 200,
  LENGTH_PER_TWIST: LENGTH_PER_TWIST,
  // In picometers
  BASE_PAIRS_PER_TWIST: BASE_PAIRS_PER_TWIST,
  DISTANCE_BETWEEN_BASE_PAIRS: LENGTH_PER_TWIST / BASE_PAIRS_PER_TWIST,
  INTER_STRAND_OFFSET: LENGTH_PER_TWIST * 0.3,
  DNA_MOLECULE_Y_POS: 0,
  // Y position of the molecule in model space.

  // Standard distance between points that define the shape. This is done to keep the number of points reasonable
  // and make the shape-defining algorithm consistent.
  INTER_POINT_DISTANCE: INTER_POINT_DISTANCE,
  // Length of the "leader segment", which is the portion of the mRNA that sticks out on the upper left side so that
  // a ribosome can be attached.
  LEADER_LENGTH: INTER_POINT_DISTANCE,
  // speed at which the RNA polymerase moves when transcribing DNA into mRNA, in picometers/sec
  TRANSCRIPTION_SPEED: 1000,
  // model-view transform used for transcription factors in the control panels
  TRANSCRIPTION_FACTOR_MVT: ModelViewTransform2.createSinglePointScaleInvertedYMapping(new Vector2(0, 0), new Vector2(0, 0), 0.08),
  // other constants
  FLORESCENT_FILL_COLOR: new Color(200, 255, 58),
  DEFAULT_AFFINITY: 0.05,
  // Default affinity for any given biomolecule,
  CONFORMATIONAL_CHANGE_RATE: 1,
  // proportion per second
  VELOCITY_ON_DNA: 200,
  // Scalar velocity when moving between attachment points on the DNA.
  DEFAULT_ATTACH_TIME: 0.15,
  // // Time for attachment to a site on the DNA, in seconds.
  CORNER_RADIUS: 5 // corner radius for different panels and accordion boxes in the views
};

geneExpressionEssentials.register('GEEConstants', GEEConstants);
export default GEEConstants;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJWZWN0b3IyIiwiTW9kZWxWaWV3VHJhbnNmb3JtMiIsIkNvbG9yIiwiZ2VuZUV4cHJlc3Npb25Fc3NlbnRpYWxzIiwiTEVOR1RIX1BFUl9UV0lTVCIsIkJBU0VfUEFJUlNfUEVSX1RXSVNUIiwiSU5URVJfUE9JTlRfRElTVEFOQ0UiLCJHRUVDb25zdGFudHMiLCJNQVhfRFQiLCJETkFfTU9MRUNVTEVfRElBTUVURVIiLCJESVNUQU5DRV9CRVRXRUVOX0JBU0VfUEFJUlMiLCJJTlRFUl9TVFJBTkRfT0ZGU0VUIiwiRE5BX01PTEVDVUxFX1lfUE9TIiwiTEVBREVSX0xFTkdUSCIsIlRSQU5TQ1JJUFRJT05fU1BFRUQiLCJUUkFOU0NSSVBUSU9OX0ZBQ1RPUl9NVlQiLCJjcmVhdGVTaW5nbGVQb2ludFNjYWxlSW52ZXJ0ZWRZTWFwcGluZyIsIkZMT1JFU0NFTlRfRklMTF9DT0xPUiIsIkRFRkFVTFRfQUZGSU5JVFkiLCJDT05GT1JNQVRJT05BTF9DSEFOR0VfUkFURSIsIlZFTE9DSVRZX09OX0ROQSIsIkRFRkFVTFRfQVRUQUNIX1RJTUUiLCJDT1JORVJfUkFESVVTIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJHRUVDb25zdGFudHMuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTUtMjAyMSwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogVGhlIGNvbnN0YW50cyB1c2VkIGluIEROQU1vbGVjdWxlIGlzIHJlZmVycmVkIGluIG11bHRpcGxlIGV4dGVybmFsIHBsYWNlcywgc28gYSBzZXBhcmF0ZSBjb25zdGFudHMgZmlsZSBpcyBjcmVhdGVkXHJcbiAqXHJcbiAqIEBhdXRob3IgU2hhcmZ1ZGVlbiBBc2hyYWZcclxuICogQGF1dGhvciBKb2huIEJsYW5jb1xyXG4gKiBAYXV0aG9yIEFhZGlzaCBHdXB0YVxyXG4gKi9cclxuXHJcbmltcG9ydCBWZWN0b3IyIGZyb20gJy4uLy4uLy4uL2RvdC9qcy9WZWN0b3IyLmpzJztcclxuaW1wb3J0IE1vZGVsVmlld1RyYW5zZm9ybTIgZnJvbSAnLi4vLi4vLi4vcGhldGNvbW1vbi9qcy92aWV3L01vZGVsVmlld1RyYW5zZm9ybTIuanMnO1xyXG5pbXBvcnQgeyBDb2xvciB9IGZyb20gJy4uLy4uLy4uL3NjZW5lcnkvanMvaW1wb3J0cy5qcyc7XHJcbmltcG9ydCBnZW5lRXhwcmVzc2lvbkVzc2VudGlhbHMgZnJvbSAnLi4vZ2VuZUV4cHJlc3Npb25Fc3NlbnRpYWxzLmpzJztcclxuXHJcbi8vIGNvbnN0YW50c1xyXG5jb25zdCBMRU5HVEhfUEVSX1RXSVNUID0gMzQwOy8vIEluIHBpY29tZXRlcnNcclxuY29uc3QgQkFTRV9QQUlSU19QRVJfVFdJU1QgPSAxMDsvLyBJbiBwaWNvbWV0ZXJzLlxyXG5jb25zdCBJTlRFUl9QT0lOVF9ESVNUQU5DRSA9IDc1Oy8vIEluIHBpY29tZXRlcnNcclxuXHJcbmNvbnN0IEdFRUNvbnN0YW50cyA9IHtcclxuXHJcbiAgLy8gbWF4IERUIHZhbHVlLCB1c2VkIGJ5IGFsbCBzY3JlZW5zIG5vdywgYnV0IHRoaXMgZG9lc24ndCBuZWVkIHRvIGJlIHRoZSBjYXNlXHJcbiAgTUFYX0RUOiAoIDEgLyA2MCApICogMTAsXHJcblxyXG4gIC8vIGNvbnN0YW50cyB0aGF0IGRlZmluZSB0aGUgZ2VvbWV0cnkgb2YgdGhlIEROQSBtb2xlY3VsZVxyXG4gIEROQV9NT0xFQ1VMRV9ESUFNRVRFUjogMjAwLFxyXG4gIExFTkdUSF9QRVJfVFdJU1Q6IExFTkdUSF9QRVJfVFdJU1QsIC8vIEluIHBpY29tZXRlcnNcclxuICBCQVNFX1BBSVJTX1BFUl9UV0lTVDogQkFTRV9QQUlSU19QRVJfVFdJU1QsXHJcbiAgRElTVEFOQ0VfQkVUV0VFTl9CQVNFX1BBSVJTOiBMRU5HVEhfUEVSX1RXSVNUIC8gQkFTRV9QQUlSU19QRVJfVFdJU1QsXHJcbiAgSU5URVJfU1RSQU5EX09GRlNFVDogTEVOR1RIX1BFUl9UV0lTVCAqIDAuMyxcclxuICBETkFfTU9MRUNVTEVfWV9QT1M6IDAsIC8vIFkgcG9zaXRpb24gb2YgdGhlIG1vbGVjdWxlIGluIG1vZGVsIHNwYWNlLlxyXG5cclxuICAvLyBTdGFuZGFyZCBkaXN0YW5jZSBiZXR3ZWVuIHBvaW50cyB0aGF0IGRlZmluZSB0aGUgc2hhcGUuIFRoaXMgaXMgZG9uZSB0byBrZWVwIHRoZSBudW1iZXIgb2YgcG9pbnRzIHJlYXNvbmFibGVcclxuICAvLyBhbmQgbWFrZSB0aGUgc2hhcGUtZGVmaW5pbmcgYWxnb3JpdGhtIGNvbnNpc3RlbnQuXHJcbiAgSU5URVJfUE9JTlRfRElTVEFOQ0U6IElOVEVSX1BPSU5UX0RJU1RBTkNFLFxyXG5cclxuICAvLyBMZW5ndGggb2YgdGhlIFwibGVhZGVyIHNlZ21lbnRcIiwgd2hpY2ggaXMgdGhlIHBvcnRpb24gb2YgdGhlIG1STkEgdGhhdCBzdGlja3Mgb3V0IG9uIHRoZSB1cHBlciBsZWZ0IHNpZGUgc28gdGhhdFxyXG4gIC8vIGEgcmlib3NvbWUgY2FuIGJlIGF0dGFjaGVkLlxyXG4gIExFQURFUl9MRU5HVEg6IElOVEVSX1BPSU5UX0RJU1RBTkNFLFxyXG5cclxuICAvLyBzcGVlZCBhdCB3aGljaCB0aGUgUk5BIHBvbHltZXJhc2UgbW92ZXMgd2hlbiB0cmFuc2NyaWJpbmcgRE5BIGludG8gbVJOQSwgaW4gcGljb21ldGVycy9zZWNcclxuICBUUkFOU0NSSVBUSU9OX1NQRUVEOiAxMDAwLFxyXG5cclxuICAvLyBtb2RlbC12aWV3IHRyYW5zZm9ybSB1c2VkIGZvciB0cmFuc2NyaXB0aW9uIGZhY3RvcnMgaW4gdGhlIGNvbnRyb2wgcGFuZWxzXHJcbiAgVFJBTlNDUklQVElPTl9GQUNUT1JfTVZUOiBNb2RlbFZpZXdUcmFuc2Zvcm0yLmNyZWF0ZVNpbmdsZVBvaW50U2NhbGVJbnZlcnRlZFlNYXBwaW5nKFxyXG4gICAgbmV3IFZlY3RvcjIoIDAsIDAgKSxcclxuICAgIG5ldyBWZWN0b3IyKCAwLCAwICksIDAuMDhcclxuICApLFxyXG5cclxuICAvLyBvdGhlciBjb25zdGFudHNcclxuICBGTE9SRVNDRU5UX0ZJTExfQ09MT1I6IG5ldyBDb2xvciggMjAwLCAyNTUsIDU4ICksXHJcbiAgREVGQVVMVF9BRkZJTklUWTogMC4wNSwgLy8gRGVmYXVsdCBhZmZpbml0eSBmb3IgYW55IGdpdmVuIGJpb21vbGVjdWxlLFxyXG4gIENPTkZPUk1BVElPTkFMX0NIQU5HRV9SQVRFOiAxLCAvLyBwcm9wb3J0aW9uIHBlciBzZWNvbmRcclxuICBWRUxPQ0lUWV9PTl9ETkE6IDIwMCwgLy8gU2NhbGFyIHZlbG9jaXR5IHdoZW4gbW92aW5nIGJldHdlZW4gYXR0YWNobWVudCBwb2ludHMgb24gdGhlIEROQS5cclxuICBERUZBVUxUX0FUVEFDSF9USU1FOiAwLjE1LCAvLyAvLyBUaW1lIGZvciBhdHRhY2htZW50IHRvIGEgc2l0ZSBvbiB0aGUgRE5BLCBpbiBzZWNvbmRzLlxyXG4gIENPUk5FUl9SQURJVVM6IDUgLy8gY29ybmVyIHJhZGl1cyBmb3IgZGlmZmVyZW50IHBhbmVscyBhbmQgYWNjb3JkaW9uIGJveGVzIGluIHRoZSB2aWV3c1xyXG59O1xyXG5cclxuZ2VuZUV4cHJlc3Npb25Fc3NlbnRpYWxzLnJlZ2lzdGVyKCAnR0VFQ29uc3RhbnRzJywgR0VFQ29uc3RhbnRzICk7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBHRUVDb25zdGFudHM7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxPQUFPLE1BQU0sNEJBQTRCO0FBQ2hELE9BQU9DLG1CQUFtQixNQUFNLG9EQUFvRDtBQUNwRixTQUFTQyxLQUFLLFFBQVEsZ0NBQWdDO0FBQ3RELE9BQU9DLHdCQUF3QixNQUFNLGdDQUFnQzs7QUFFckU7QUFDQSxNQUFNQyxnQkFBZ0IsR0FBRyxHQUFHLENBQUM7QUFDN0IsTUFBTUMsb0JBQW9CLEdBQUcsRUFBRSxDQUFDO0FBQ2hDLE1BQU1DLG9CQUFvQixHQUFHLEVBQUUsQ0FBQzs7QUFFaEMsTUFBTUMsWUFBWSxHQUFHO0VBRW5CO0VBQ0FDLE1BQU0sRUFBSSxDQUFDLEdBQUcsRUFBRSxHQUFLLEVBQUU7RUFFdkI7RUFDQUMscUJBQXFCLEVBQUUsR0FBRztFQUMxQkwsZ0JBQWdCLEVBQUVBLGdCQUFnQjtFQUFFO0VBQ3BDQyxvQkFBb0IsRUFBRUEsb0JBQW9CO0VBQzFDSywyQkFBMkIsRUFBRU4sZ0JBQWdCLEdBQUdDLG9CQUFvQjtFQUNwRU0sbUJBQW1CLEVBQUVQLGdCQUFnQixHQUFHLEdBQUc7RUFDM0NRLGtCQUFrQixFQUFFLENBQUM7RUFBRTs7RUFFdkI7RUFDQTtFQUNBTixvQkFBb0IsRUFBRUEsb0JBQW9CO0VBRTFDO0VBQ0E7RUFDQU8sYUFBYSxFQUFFUCxvQkFBb0I7RUFFbkM7RUFDQVEsbUJBQW1CLEVBQUUsSUFBSTtFQUV6QjtFQUNBQyx3QkFBd0IsRUFBRWQsbUJBQW1CLENBQUNlLHNDQUFzQyxDQUNsRixJQUFJaEIsT0FBTyxDQUFFLENBQUMsRUFBRSxDQUFFLENBQUMsRUFDbkIsSUFBSUEsT0FBTyxDQUFFLENBQUMsRUFBRSxDQUFFLENBQUMsRUFBRSxJQUN2QixDQUFDO0VBRUQ7RUFDQWlCLHFCQUFxQixFQUFFLElBQUlmLEtBQUssQ0FBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEVBQUcsQ0FBQztFQUNoRGdCLGdCQUFnQixFQUFFLElBQUk7RUFBRTtFQUN4QkMsMEJBQTBCLEVBQUUsQ0FBQztFQUFFO0VBQy9CQyxlQUFlLEVBQUUsR0FBRztFQUFFO0VBQ3RCQyxtQkFBbUIsRUFBRSxJQUFJO0VBQUU7RUFDM0JDLGFBQWEsRUFBRSxDQUFDLENBQUM7QUFDbkIsQ0FBQzs7QUFFRG5CLHdCQUF3QixDQUFDb0IsUUFBUSxDQUFFLGNBQWMsRUFBRWhCLFlBQWEsQ0FBQztBQUVqRSxlQUFlQSxZQUFZIn0=