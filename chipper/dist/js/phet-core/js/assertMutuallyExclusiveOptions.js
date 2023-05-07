// Copyright 2019-2020, University of Colorado Boulder

/**
 * Throws an assertion error if mutually exclusive options are specified.
 *
 * @example
 * assertMutuallyExclusiveOptions( { tree:1, flower:2 }, [ 'tree' ], [ 'flower' ] ) => error
 * assertMutuallyExclusiveOptions( { flower:2 }, [ 'tree' ], [ 'flower' ] ) => no error
 * assertMutuallyExclusiveOptions( { tree:1 }, [ 'tree' ], [ 'flower' ] ) => no error
 * assertMutuallyExclusiveOptions( { tree:1, mountain:2 }, [ 'tree', 'mountain' ], [ 'flower' ] ) => no error
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import phetCore from './phetCore.js';

/**
 * @param {Object|null|undefined} options - an options object.  Could be before or after merge, and may therefore
 *                                        - be null or undefined
 * @param {...string[]} sets - families of mutually exclusive option keys, see examples above.
 */
const assertMutuallyExclusiveOptions = function (options, ...sets) {
  if (assert && options) {
    // Determine which options are used from each set
    const usedElementsFromEachSet = sets.map(set => Object.keys(_.pick(options, ...set)));

    // If any element is used from more than one set...
    if (usedElementsFromEachSet.filter(usedElements => usedElements.length > 0).length > 1) {
      // Output the errant options.
      assert && assert(false, `Cannot simultaneously specify ${usedElementsFromEachSet.join(' and ')}`);
    }
  }
};
phetCore.register('assertMutuallyExclusiveOptions', assertMutuallyExclusiveOptions);
export default assertMutuallyExclusiveOptions;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJwaGV0Q29yZSIsImFzc2VydE11dHVhbGx5RXhjbHVzaXZlT3B0aW9ucyIsIm9wdGlvbnMiLCJzZXRzIiwiYXNzZXJ0IiwidXNlZEVsZW1lbnRzRnJvbUVhY2hTZXQiLCJtYXAiLCJzZXQiLCJPYmplY3QiLCJrZXlzIiwiXyIsInBpY2siLCJmaWx0ZXIiLCJ1c2VkRWxlbWVudHMiLCJsZW5ndGgiLCJqb2luIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJhc3NlcnRNdXR1YWxseUV4Y2x1c2l2ZU9wdGlvbnMuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTktMjAyMCwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogVGhyb3dzIGFuIGFzc2VydGlvbiBlcnJvciBpZiBtdXR1YWxseSBleGNsdXNpdmUgb3B0aW9ucyBhcmUgc3BlY2lmaWVkLlxyXG4gKlxyXG4gKiBAZXhhbXBsZVxyXG4gKiBhc3NlcnRNdXR1YWxseUV4Y2x1c2l2ZU9wdGlvbnMoIHsgdHJlZToxLCBmbG93ZXI6MiB9LCBbICd0cmVlJyBdLCBbICdmbG93ZXInIF0gKSA9PiBlcnJvclxyXG4gKiBhc3NlcnRNdXR1YWxseUV4Y2x1c2l2ZU9wdGlvbnMoIHsgZmxvd2VyOjIgfSwgWyAndHJlZScgXSwgWyAnZmxvd2VyJyBdICkgPT4gbm8gZXJyb3JcclxuICogYXNzZXJ0TXV0dWFsbHlFeGNsdXNpdmVPcHRpb25zKCB7IHRyZWU6MSB9LCBbICd0cmVlJyBdLCBbICdmbG93ZXInIF0gKSA9PiBubyBlcnJvclxyXG4gKiBhc3NlcnRNdXR1YWxseUV4Y2x1c2l2ZU9wdGlvbnMoIHsgdHJlZToxLCBtb3VudGFpbjoyIH0sIFsgJ3RyZWUnLCAnbW91bnRhaW4nIF0sIFsgJ2Zsb3dlcicgXSApID0+IG5vIGVycm9yXHJcbiAqXHJcbiAqIEBhdXRob3IgU2FtIFJlaWQgKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXHJcbiAqL1xyXG5cclxuaW1wb3J0IHBoZXRDb3JlIGZyb20gJy4vcGhldENvcmUuanMnO1xyXG5cclxuLyoqXHJcbiAqIEBwYXJhbSB7T2JqZWN0fG51bGx8dW5kZWZpbmVkfSBvcHRpb25zIC0gYW4gb3B0aW9ucyBvYmplY3QuICBDb3VsZCBiZSBiZWZvcmUgb3IgYWZ0ZXIgbWVyZ2UsIGFuZCBtYXkgdGhlcmVmb3JlXHJcbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC0gYmUgbnVsbCBvciB1bmRlZmluZWRcclxuICogQHBhcmFtIHsuLi5zdHJpbmdbXX0gc2V0cyAtIGZhbWlsaWVzIG9mIG11dHVhbGx5IGV4Y2x1c2l2ZSBvcHRpb24ga2V5cywgc2VlIGV4YW1wbGVzIGFib3ZlLlxyXG4gKi9cclxuY29uc3QgYXNzZXJ0TXV0dWFsbHlFeGNsdXNpdmVPcHRpb25zID0gZnVuY3Rpb24oIG9wdGlvbnMsIC4uLnNldHMgKSB7XHJcbiAgaWYgKCBhc3NlcnQgJiYgb3B0aW9ucyApIHtcclxuXHJcbiAgICAvLyBEZXRlcm1pbmUgd2hpY2ggb3B0aW9ucyBhcmUgdXNlZCBmcm9tIGVhY2ggc2V0XHJcbiAgICBjb25zdCB1c2VkRWxlbWVudHNGcm9tRWFjaFNldCA9IHNldHMubWFwKCBzZXQgPT4gT2JqZWN0LmtleXMoIF8ucGljayggb3B0aW9ucywgLi4uc2V0ICkgKSApO1xyXG5cclxuICAgIC8vIElmIGFueSBlbGVtZW50IGlzIHVzZWQgZnJvbSBtb3JlIHRoYW4gb25lIHNldC4uLlxyXG4gICAgaWYgKCB1c2VkRWxlbWVudHNGcm9tRWFjaFNldC5maWx0ZXIoIHVzZWRFbGVtZW50cyA9PiB1c2VkRWxlbWVudHMubGVuZ3RoID4gMCApLmxlbmd0aCA+IDEgKSB7XHJcblxyXG4gICAgICAvLyBPdXRwdXQgdGhlIGVycmFudCBvcHRpb25zLlxyXG4gICAgICBhc3NlcnQgJiYgYXNzZXJ0KCBmYWxzZSwgYENhbm5vdCBzaW11bHRhbmVvdXNseSBzcGVjaWZ5ICR7dXNlZEVsZW1lbnRzRnJvbUVhY2hTZXQuam9pbiggJyBhbmQgJyApfWAgKTtcclxuICAgIH1cclxuICB9XHJcbn07XHJcblxyXG5waGV0Q29yZS5yZWdpc3RlciggJ2Fzc2VydE11dHVhbGx5RXhjbHVzaXZlT3B0aW9ucycsIGFzc2VydE11dHVhbGx5RXhjbHVzaXZlT3B0aW9ucyApO1xyXG5leHBvcnQgZGVmYXVsdCBhc3NlcnRNdXR1YWxseUV4Y2x1c2l2ZU9wdGlvbnM7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLFFBQVEsTUFBTSxlQUFlOztBQUVwQztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsTUFBTUMsOEJBQThCLEdBQUcsU0FBQUEsQ0FBVUMsT0FBTyxFQUFFLEdBQUdDLElBQUksRUFBRztFQUNsRSxJQUFLQyxNQUFNLElBQUlGLE9BQU8sRUFBRztJQUV2QjtJQUNBLE1BQU1HLHVCQUF1QixHQUFHRixJQUFJLENBQUNHLEdBQUcsQ0FBRUMsR0FBRyxJQUFJQyxNQUFNLENBQUNDLElBQUksQ0FBRUMsQ0FBQyxDQUFDQyxJQUFJLENBQUVULE9BQU8sRUFBRSxHQUFHSyxHQUFJLENBQUUsQ0FBRSxDQUFDOztJQUUzRjtJQUNBLElBQUtGLHVCQUF1QixDQUFDTyxNQUFNLENBQUVDLFlBQVksSUFBSUEsWUFBWSxDQUFDQyxNQUFNLEdBQUcsQ0FBRSxDQUFDLENBQUNBLE1BQU0sR0FBRyxDQUFDLEVBQUc7TUFFMUY7TUFDQVYsTUFBTSxJQUFJQSxNQUFNLENBQUUsS0FBSyxFQUFHLGlDQUFnQ0MsdUJBQXVCLENBQUNVLElBQUksQ0FBRSxPQUFRLENBQUUsRUFBRSxDQUFDO0lBQ3ZHO0VBQ0Y7QUFDRixDQUFDO0FBRURmLFFBQVEsQ0FBQ2dCLFFBQVEsQ0FBRSxnQ0FBZ0MsRUFBRWYsOEJBQStCLENBQUM7QUFDckYsZUFBZUEsOEJBQThCIn0=