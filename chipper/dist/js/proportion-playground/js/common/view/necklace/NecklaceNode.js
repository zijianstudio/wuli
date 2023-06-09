// Copyright 2016-2020, University of Colorado Boulder

/**
 * Non-interactive node that displays the necklace.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import proportionPlayground from '../../../proportionPlayground.js';
import SceneRatioNode from '../SceneRatioNode.js';
import NecklaceGraphicNode from './NecklaceGraphicNode.js';
class NecklaceNode extends SceneRatioNode {
  /**
   * @param {Necklace} necklace - the model
   */
  constructor(necklace) {
    super(necklace);
    this.addChild(new NecklaceGraphicNode(necklace.layoutProperty, {
      y: 256,
      // Override bounds so that expensive recomputation isn't needed
      localBounds: NecklaceGraphicNode.createStaticNecklace(20, 20).localBounds.dilated(15),
      preventFit: true,
      pickable: false
    }));
  }
}
proportionPlayground.register('NecklaceNode', NecklaceNode);
export default NecklaceNode;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJwcm9wb3J0aW9uUGxheWdyb3VuZCIsIlNjZW5lUmF0aW9Ob2RlIiwiTmVja2xhY2VHcmFwaGljTm9kZSIsIk5lY2tsYWNlTm9kZSIsImNvbnN0cnVjdG9yIiwibmVja2xhY2UiLCJhZGRDaGlsZCIsImxheW91dFByb3BlcnR5IiwieSIsImxvY2FsQm91bmRzIiwiY3JlYXRlU3RhdGljTmVja2xhY2UiLCJkaWxhdGVkIiwicHJldmVudEZpdCIsInBpY2thYmxlIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJOZWNrbGFjZU5vZGUuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTYtMjAyMCwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogTm9uLWludGVyYWN0aXZlIG5vZGUgdGhhdCBkaXNwbGF5cyB0aGUgbmVja2xhY2UuXHJcbiAqXHJcbiAqIEBhdXRob3IgU2FtIFJlaWQgKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXHJcbiAqL1xyXG5cclxuaW1wb3J0IHByb3BvcnRpb25QbGF5Z3JvdW5kIGZyb20gJy4uLy4uLy4uL3Byb3BvcnRpb25QbGF5Z3JvdW5kLmpzJztcclxuaW1wb3J0IFNjZW5lUmF0aW9Ob2RlIGZyb20gJy4uL1NjZW5lUmF0aW9Ob2RlLmpzJztcclxuaW1wb3J0IE5lY2tsYWNlR3JhcGhpY05vZGUgZnJvbSAnLi9OZWNrbGFjZUdyYXBoaWNOb2RlLmpzJztcclxuXHJcbmNsYXNzIE5lY2tsYWNlTm9kZSBleHRlbmRzIFNjZW5lUmF0aW9Ob2RlIHtcclxuICAvKipcclxuICAgKiBAcGFyYW0ge05lY2tsYWNlfSBuZWNrbGFjZSAtIHRoZSBtb2RlbFxyXG4gICAqL1xyXG4gIGNvbnN0cnVjdG9yKCBuZWNrbGFjZSApIHtcclxuICAgIHN1cGVyKCBuZWNrbGFjZSApO1xyXG5cclxuICAgIHRoaXMuYWRkQ2hpbGQoIG5ldyBOZWNrbGFjZUdyYXBoaWNOb2RlKCBuZWNrbGFjZS5sYXlvdXRQcm9wZXJ0eSwge1xyXG4gICAgICB5OiAyNTYsXHJcbiAgICAgIC8vIE92ZXJyaWRlIGJvdW5kcyBzbyB0aGF0IGV4cGVuc2l2ZSByZWNvbXB1dGF0aW9uIGlzbid0IG5lZWRlZFxyXG4gICAgICBsb2NhbEJvdW5kczogTmVja2xhY2VHcmFwaGljTm9kZS5jcmVhdGVTdGF0aWNOZWNrbGFjZSggMjAsIDIwICkubG9jYWxCb3VuZHMuZGlsYXRlZCggMTUgKSxcclxuICAgICAgcHJldmVudEZpdDogdHJ1ZSxcclxuICAgICAgcGlja2FibGU6IGZhbHNlXHJcbiAgICB9ICkgKTtcclxuICB9XHJcbn1cclxuXHJcbnByb3BvcnRpb25QbGF5Z3JvdW5kLnJlZ2lzdGVyKCAnTmVja2xhY2VOb2RlJywgTmVja2xhY2VOb2RlICk7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBOZWNrbGFjZU5vZGU7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLG9CQUFvQixNQUFNLGtDQUFrQztBQUNuRSxPQUFPQyxjQUFjLE1BQU0sc0JBQXNCO0FBQ2pELE9BQU9DLG1CQUFtQixNQUFNLDBCQUEwQjtBQUUxRCxNQUFNQyxZQUFZLFNBQVNGLGNBQWMsQ0FBQztFQUN4QztBQUNGO0FBQ0E7RUFDRUcsV0FBV0EsQ0FBRUMsUUFBUSxFQUFHO0lBQ3RCLEtBQUssQ0FBRUEsUUFBUyxDQUFDO0lBRWpCLElBQUksQ0FBQ0MsUUFBUSxDQUFFLElBQUlKLG1CQUFtQixDQUFFRyxRQUFRLENBQUNFLGNBQWMsRUFBRTtNQUMvREMsQ0FBQyxFQUFFLEdBQUc7TUFDTjtNQUNBQyxXQUFXLEVBQUVQLG1CQUFtQixDQUFDUSxvQkFBb0IsQ0FBRSxFQUFFLEVBQUUsRUFBRyxDQUFDLENBQUNELFdBQVcsQ0FBQ0UsT0FBTyxDQUFFLEVBQUcsQ0FBQztNQUN6RkMsVUFBVSxFQUFFLElBQUk7TUFDaEJDLFFBQVEsRUFBRTtJQUNaLENBQUUsQ0FBRSxDQUFDO0VBQ1A7QUFDRjtBQUVBYixvQkFBb0IsQ0FBQ2MsUUFBUSxDQUFFLGNBQWMsRUFBRVgsWUFBYSxDQUFDO0FBRTdELGVBQWVBLFlBQVkifQ==