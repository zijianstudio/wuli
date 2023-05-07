// Copyright 2018-2021, University of Colorado Boulder

/**
 * Common logic for where we have a variable number of nodes that need to be used.
 *
 * This is helpful in the situation (that occurs 3 times in this sim) where you need to have a layer with a variable
 * number of objects (where, for memory/performance needs, you need to pool them). So given a maximum number N, you'll
 * have a current number X <= N that are used. We don't create new ones, we just reuse a pool of nodes, having
 * X be visible, and any other nodes beyond will be hidden.
 *
 * NOTE: This type is designed to be persistent, and will not need to release references to avoid memory leaks.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import merge from '../../../../phet-core/js/merge.js';
import { Node } from '../../../../scenery/js/imports.js';
import areaModelCommon from '../../areaModelCommon.js';
class PoolableLayerNode extends Node {
  /**
   * So you have a Property.<Array.<Item>>, and you want to lazily create ItemNodes for each? And say each ItemNode
   * has something like itemNode.itemProperty which controls which item it displays? And if the property is null, it
   * doesn't display? Do I have the incredibly-specific helper type for you! For the LOW LOW price of moving it to a
   * common repo, YOU COULD HAVE IT TOO!
   *
   * Hopefully this doesn't become a common pattern. We have 3+ usages of it, and it cleans things up overall to have
   * the not-super-simple logic in one place. Enjoy.
   *
   * @param {Object} config
   */
  constructor(config) {
    config = merge({
      // required
      arrayProperty: null,
      // {Property.<Array.<*>>} - Property that has an array of items
      createNode: null,
      // {function} - function( {*} item ): {Node} - Create a node from an item
      getItemProperty: null,
      // {function} - function( {*} itemNode ): {Property.<*>} - ItemNode => Item Property

      // Allow providing references
      usedArray: [],
      unusedArray: [],
      // Called after we run an update.
      updatedCallback: null
    }, config);
    super();
    const usedArray = config.usedArray;
    const unusedArray = config.unusedArray;
    config.arrayProperty.link(items => {
      // Unuse all of the item nodes (set their property to null, hiding them, and put them in the unused array)
      while (usedArray.length) {
        const oldItemNode = usedArray.pop();
        config.getItemProperty(oldItemNode).value = null;
        unusedArray.push(oldItemNode);
      }
      items.forEach(item => {
        let itemNode;

        // Grab one from the pool
        if (unusedArray.length) {
          itemNode = unusedArray.pop();
          config.getItemProperty(itemNode).value = item;
        }

        // Or create a new one
        else {
          itemNode = config.createNode(item);
          this.addChild(itemNode);
        }
        usedArray.push(itemNode);
      });
      config.updatedCallback && config.updatedCallback();
    });
  }
}
areaModelCommon.register('PoolableLayerNode', PoolableLayerNode);
export default PoolableLayerNode;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJtZXJnZSIsIk5vZGUiLCJhcmVhTW9kZWxDb21tb24iLCJQb29sYWJsZUxheWVyTm9kZSIsImNvbnN0cnVjdG9yIiwiY29uZmlnIiwiYXJyYXlQcm9wZXJ0eSIsImNyZWF0ZU5vZGUiLCJnZXRJdGVtUHJvcGVydHkiLCJ1c2VkQXJyYXkiLCJ1bnVzZWRBcnJheSIsInVwZGF0ZWRDYWxsYmFjayIsImxpbmsiLCJpdGVtcyIsImxlbmd0aCIsIm9sZEl0ZW1Ob2RlIiwicG9wIiwidmFsdWUiLCJwdXNoIiwiZm9yRWFjaCIsIml0ZW0iLCJpdGVtTm9kZSIsImFkZENoaWxkIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJQb29sYWJsZUxheWVyTm9kZS5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxOC0yMDIxLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBDb21tb24gbG9naWMgZm9yIHdoZXJlIHdlIGhhdmUgYSB2YXJpYWJsZSBudW1iZXIgb2Ygbm9kZXMgdGhhdCBuZWVkIHRvIGJlIHVzZWQuXHJcbiAqXHJcbiAqIFRoaXMgaXMgaGVscGZ1bCBpbiB0aGUgc2l0dWF0aW9uICh0aGF0IG9jY3VycyAzIHRpbWVzIGluIHRoaXMgc2ltKSB3aGVyZSB5b3UgbmVlZCB0byBoYXZlIGEgbGF5ZXIgd2l0aCBhIHZhcmlhYmxlXHJcbiAqIG51bWJlciBvZiBvYmplY3RzICh3aGVyZSwgZm9yIG1lbW9yeS9wZXJmb3JtYW5jZSBuZWVkcywgeW91IG5lZWQgdG8gcG9vbCB0aGVtKS4gU28gZ2l2ZW4gYSBtYXhpbXVtIG51bWJlciBOLCB5b3UnbGxcclxuICogaGF2ZSBhIGN1cnJlbnQgbnVtYmVyIFggPD0gTiB0aGF0IGFyZSB1c2VkLiBXZSBkb24ndCBjcmVhdGUgbmV3IG9uZXMsIHdlIGp1c3QgcmV1c2UgYSBwb29sIG9mIG5vZGVzLCBoYXZpbmdcclxuICogWCBiZSB2aXNpYmxlLCBhbmQgYW55IG90aGVyIG5vZGVzIGJleW9uZCB3aWxsIGJlIGhpZGRlbi5cclxuICpcclxuICogTk9URTogVGhpcyB0eXBlIGlzIGRlc2lnbmVkIHRvIGJlIHBlcnNpc3RlbnQsIGFuZCB3aWxsIG5vdCBuZWVkIHRvIHJlbGVhc2UgcmVmZXJlbmNlcyB0byBhdm9pZCBtZW1vcnkgbGVha3MuXHJcbiAqXHJcbiAqIEBhdXRob3IgSm9uYXRoYW4gT2xzb24gPGpvbmF0aGFuLm9sc29uQGNvbG9yYWRvLmVkdT5cclxuICovXHJcblxyXG5pbXBvcnQgbWVyZ2UgZnJvbSAnLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL21lcmdlLmpzJztcclxuaW1wb3J0IHsgTm9kZSB9IGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvaW1wb3J0cy5qcyc7XHJcbmltcG9ydCBhcmVhTW9kZWxDb21tb24gZnJvbSAnLi4vLi4vYXJlYU1vZGVsQ29tbW9uLmpzJztcclxuXHJcbmNsYXNzIFBvb2xhYmxlTGF5ZXJOb2RlIGV4dGVuZHMgTm9kZSB7XHJcbiAgLyoqXHJcbiAgICogU28geW91IGhhdmUgYSBQcm9wZXJ0eS48QXJyYXkuPEl0ZW0+PiwgYW5kIHlvdSB3YW50IHRvIGxhemlseSBjcmVhdGUgSXRlbU5vZGVzIGZvciBlYWNoPyBBbmQgc2F5IGVhY2ggSXRlbU5vZGVcclxuICAgKiBoYXMgc29tZXRoaW5nIGxpa2UgaXRlbU5vZGUuaXRlbVByb3BlcnR5IHdoaWNoIGNvbnRyb2xzIHdoaWNoIGl0ZW0gaXQgZGlzcGxheXM/IEFuZCBpZiB0aGUgcHJvcGVydHkgaXMgbnVsbCwgaXRcclxuICAgKiBkb2Vzbid0IGRpc3BsYXk/IERvIEkgaGF2ZSB0aGUgaW5jcmVkaWJseS1zcGVjaWZpYyBoZWxwZXIgdHlwZSBmb3IgeW91ISBGb3IgdGhlIExPVyBMT1cgcHJpY2Ugb2YgbW92aW5nIGl0IHRvIGFcclxuICAgKiBjb21tb24gcmVwbywgWU9VIENPVUxEIEhBVkUgSVQgVE9PIVxyXG4gICAqXHJcbiAgICogSG9wZWZ1bGx5IHRoaXMgZG9lc24ndCBiZWNvbWUgYSBjb21tb24gcGF0dGVybi4gV2UgaGF2ZSAzKyB1c2FnZXMgb2YgaXQsIGFuZCBpdCBjbGVhbnMgdGhpbmdzIHVwIG92ZXJhbGwgdG8gaGF2ZVxyXG4gICAqIHRoZSBub3Qtc3VwZXItc2ltcGxlIGxvZ2ljIGluIG9uZSBwbGFjZS4gRW5qb3kuXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge09iamVjdH0gY29uZmlnXHJcbiAgICovXHJcbiAgY29uc3RydWN0b3IoIGNvbmZpZyApIHtcclxuXHJcbiAgICBjb25maWcgPSBtZXJnZSgge1xyXG4gICAgICAvLyByZXF1aXJlZFxyXG4gICAgICBhcnJheVByb3BlcnR5OiBudWxsLCAvLyB7UHJvcGVydHkuPEFycmF5LjwqPj59IC0gUHJvcGVydHkgdGhhdCBoYXMgYW4gYXJyYXkgb2YgaXRlbXNcclxuICAgICAgY3JlYXRlTm9kZTogbnVsbCwgLy8ge2Z1bmN0aW9ufSAtIGZ1bmN0aW9uKCB7Kn0gaXRlbSApOiB7Tm9kZX0gLSBDcmVhdGUgYSBub2RlIGZyb20gYW4gaXRlbVxyXG4gICAgICBnZXRJdGVtUHJvcGVydHk6IG51bGwsIC8vIHtmdW5jdGlvbn0gLSBmdW5jdGlvbiggeyp9IGl0ZW1Ob2RlICk6IHtQcm9wZXJ0eS48Kj59IC0gSXRlbU5vZGUgPT4gSXRlbSBQcm9wZXJ0eVxyXG5cclxuICAgICAgLy8gQWxsb3cgcHJvdmlkaW5nIHJlZmVyZW5jZXNcclxuICAgICAgdXNlZEFycmF5OiBbXSxcclxuICAgICAgdW51c2VkQXJyYXk6IFtdLFxyXG5cclxuICAgICAgLy8gQ2FsbGVkIGFmdGVyIHdlIHJ1biBhbiB1cGRhdGUuXHJcbiAgICAgIHVwZGF0ZWRDYWxsYmFjazogbnVsbFxyXG4gICAgfSwgY29uZmlnICk7XHJcblxyXG4gICAgc3VwZXIoKTtcclxuXHJcbiAgICBjb25zdCB1c2VkQXJyYXkgPSBjb25maWcudXNlZEFycmF5O1xyXG4gICAgY29uc3QgdW51c2VkQXJyYXkgPSBjb25maWcudW51c2VkQXJyYXk7XHJcblxyXG4gICAgY29uZmlnLmFycmF5UHJvcGVydHkubGluayggaXRlbXMgPT4ge1xyXG5cclxuICAgICAgLy8gVW51c2UgYWxsIG9mIHRoZSBpdGVtIG5vZGVzIChzZXQgdGhlaXIgcHJvcGVydHkgdG8gbnVsbCwgaGlkaW5nIHRoZW0sIGFuZCBwdXQgdGhlbSBpbiB0aGUgdW51c2VkIGFycmF5KVxyXG4gICAgICB3aGlsZSAoIHVzZWRBcnJheS5sZW5ndGggKSB7XHJcbiAgICAgICAgY29uc3Qgb2xkSXRlbU5vZGUgPSB1c2VkQXJyYXkucG9wKCk7XHJcbiAgICAgICAgY29uZmlnLmdldEl0ZW1Qcm9wZXJ0eSggb2xkSXRlbU5vZGUgKS52YWx1ZSA9IG51bGw7XHJcbiAgICAgICAgdW51c2VkQXJyYXkucHVzaCggb2xkSXRlbU5vZGUgKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgaXRlbXMuZm9yRWFjaCggaXRlbSA9PiB7XHJcbiAgICAgICAgbGV0IGl0ZW1Ob2RlO1xyXG5cclxuICAgICAgICAvLyBHcmFiIG9uZSBmcm9tIHRoZSBwb29sXHJcbiAgICAgICAgaWYgKCB1bnVzZWRBcnJheS5sZW5ndGggKSB7XHJcbiAgICAgICAgICBpdGVtTm9kZSA9IHVudXNlZEFycmF5LnBvcCgpO1xyXG4gICAgICAgICAgY29uZmlnLmdldEl0ZW1Qcm9wZXJ0eSggaXRlbU5vZGUgKS52YWx1ZSA9IGl0ZW07XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBPciBjcmVhdGUgYSBuZXcgb25lXHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICBpdGVtTm9kZSA9IGNvbmZpZy5jcmVhdGVOb2RlKCBpdGVtICk7XHJcbiAgICAgICAgICB0aGlzLmFkZENoaWxkKCBpdGVtTm9kZSApO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdXNlZEFycmF5LnB1c2goIGl0ZW1Ob2RlICk7XHJcbiAgICAgIH0gKTtcclxuXHJcbiAgICAgIGNvbmZpZy51cGRhdGVkQ2FsbGJhY2sgJiYgY29uZmlnLnVwZGF0ZWRDYWxsYmFjaygpO1xyXG4gICAgfSApO1xyXG4gIH1cclxufVxyXG5cclxuYXJlYU1vZGVsQ29tbW9uLnJlZ2lzdGVyKCAnUG9vbGFibGVMYXllck5vZGUnLCBQb29sYWJsZUxheWVyTm9kZSApO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgUG9vbGFibGVMYXllck5vZGU7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsS0FBSyxNQUFNLG1DQUFtQztBQUNyRCxTQUFTQyxJQUFJLFFBQVEsbUNBQW1DO0FBQ3hELE9BQU9DLGVBQWUsTUFBTSwwQkFBMEI7QUFFdEQsTUFBTUMsaUJBQWlCLFNBQVNGLElBQUksQ0FBQztFQUNuQztBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ0VHLFdBQVdBLENBQUVDLE1BQU0sRUFBRztJQUVwQkEsTUFBTSxHQUFHTCxLQUFLLENBQUU7TUFDZDtNQUNBTSxhQUFhLEVBQUUsSUFBSTtNQUFFO01BQ3JCQyxVQUFVLEVBQUUsSUFBSTtNQUFFO01BQ2xCQyxlQUFlLEVBQUUsSUFBSTtNQUFFOztNQUV2QjtNQUNBQyxTQUFTLEVBQUUsRUFBRTtNQUNiQyxXQUFXLEVBQUUsRUFBRTtNQUVmO01BQ0FDLGVBQWUsRUFBRTtJQUNuQixDQUFDLEVBQUVOLE1BQU8sQ0FBQztJQUVYLEtBQUssQ0FBQyxDQUFDO0lBRVAsTUFBTUksU0FBUyxHQUFHSixNQUFNLENBQUNJLFNBQVM7SUFDbEMsTUFBTUMsV0FBVyxHQUFHTCxNQUFNLENBQUNLLFdBQVc7SUFFdENMLE1BQU0sQ0FBQ0MsYUFBYSxDQUFDTSxJQUFJLENBQUVDLEtBQUssSUFBSTtNQUVsQztNQUNBLE9BQVFKLFNBQVMsQ0FBQ0ssTUFBTSxFQUFHO1FBQ3pCLE1BQU1DLFdBQVcsR0FBR04sU0FBUyxDQUFDTyxHQUFHLENBQUMsQ0FBQztRQUNuQ1gsTUFBTSxDQUFDRyxlQUFlLENBQUVPLFdBQVksQ0FBQyxDQUFDRSxLQUFLLEdBQUcsSUFBSTtRQUNsRFAsV0FBVyxDQUFDUSxJQUFJLENBQUVILFdBQVksQ0FBQztNQUNqQztNQUVBRixLQUFLLENBQUNNLE9BQU8sQ0FBRUMsSUFBSSxJQUFJO1FBQ3JCLElBQUlDLFFBQVE7O1FBRVo7UUFDQSxJQUFLWCxXQUFXLENBQUNJLE1BQU0sRUFBRztVQUN4Qk8sUUFBUSxHQUFHWCxXQUFXLENBQUNNLEdBQUcsQ0FBQyxDQUFDO1VBQzVCWCxNQUFNLENBQUNHLGVBQWUsQ0FBRWEsUUFBUyxDQUFDLENBQUNKLEtBQUssR0FBR0csSUFBSTtRQUNqRDs7UUFFQTtRQUFBLEtBQ0s7VUFDSEMsUUFBUSxHQUFHaEIsTUFBTSxDQUFDRSxVQUFVLENBQUVhLElBQUssQ0FBQztVQUNwQyxJQUFJLENBQUNFLFFBQVEsQ0FBRUQsUUFBUyxDQUFDO1FBQzNCO1FBRUFaLFNBQVMsQ0FBQ1MsSUFBSSxDQUFFRyxRQUFTLENBQUM7TUFDNUIsQ0FBRSxDQUFDO01BRUhoQixNQUFNLENBQUNNLGVBQWUsSUFBSU4sTUFBTSxDQUFDTSxlQUFlLENBQUMsQ0FBQztJQUNwRCxDQUFFLENBQUM7RUFDTDtBQUNGO0FBRUFULGVBQWUsQ0FBQ3FCLFFBQVEsQ0FBRSxtQkFBbUIsRUFBRXBCLGlCQUFrQixDQUFDO0FBRWxFLGVBQWVBLGlCQUFpQiJ9