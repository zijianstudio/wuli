// Copyright 2021-2023, University of Colorado Boulder

/**
 * WavePacketMeasurementToolNode is the base class for measurement tools in the 'Wave Packet' screen.
 * Origin is at the tip of the caliper's left jaw.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import EnumerationProperty from '../../../../axon/js/EnumerationProperty.js';
import Multilink from '../../../../axon/js/Multilink.js';
import Property from '../../../../axon/js/Property.js';
import ChartTransform from '../../../../bamboo/js/ChartTransform.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import Vector2Property from '../../../../dot/js/Vector2Property.js';
import merge from '../../../../phet-core/js/merge.js';
import AssertUtils from '../../../../phetcommon/js/AssertUtils.js';
import BackgroundNode from '../../../../scenery-phet/js/BackgroundNode.js';
import { Circle, DragListener, KeyboardDragListener, Node, RichText } from '../../../../scenery/js/imports.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import FMWConstants from '../../common/FMWConstants.js';
import FMWQueryParameters from '../../common/FMWQueryParameters.js';
import FMWSymbols from '../../common/FMWSymbols.js';
import Domain from '../../common/model/Domain.js';
import CalipersNode from '../../common/view/CalipersNode.js';
import fourierMakingWaves from '../../fourierMakingWaves.js';
export default class WavePacketMeasurementToolNode extends Node {
  /**
   * @param {ReadOnlyProperty.<number>} property - the Property of the wave packet that we're measuring
   * @param {ChartTransform} chartTransform
   * @param {EnumerationProperty.<Domain>} domainProperty
   * @param {TReadOnlyProperty.<string>} spaceSymbolStringProperty
   * @param {TReadOnlyProperty.<string>} timeSymbolStringProperty
   * @param {Object} [options]
   */
  constructor(property, chartTransform, domainProperty, spaceSymbolStringProperty, timeSymbolStringProperty, options) {
    assert && AssertUtils.assertAbstractPropertyOf(property, 'number');
    assert && assert(chartTransform instanceof ChartTransform);
    assert && assert(domainProperty instanceof EnumerationProperty);
    options = merge({
      position: new Vector2(0, 0),
      dragBounds: null,
      // {Bounds2|null}
      cursor: 'pointer',
      // CalipersNode options
      calipersNodeOptions: {
        pathOptions: {
          fill: 'white'
        },
        richTextOptions: {
          font: FMWConstants.TOOL_LABEL_FONT,
          maxWidth: 75
        }
      },
      // pdom
      tagName: 'div',
      focusable: true,
      // phet-io options
      tandem: Tandem.REQUIRED
    }, options);

    // Calipers, shown when the value is not Infinity.
    const calipersNode = new CalipersNode(options.calipersNodeOptions);

    // Shown when the value is Infinity.
    const infinityText = new RichText('', options.calipersNodeOptions.richTextOptions);
    const infinityBackgroundNode = new BackgroundNode(infinityText, {
      xMargin: 5,
      yMargin: 2,
      rectangleOptions: {
        cornerRadius: 3,
        fill: options.calipersNodeOptions.pathOptions.fill
      }
    });
    assert && assert(!options.children);
    options.children = [infinityBackgroundNode, calipersNode];

    // Show a red dot at the tool's origin.
    if (FMWQueryParameters.debugTools) {
      options.children.push(new Circle(2, {
        fill: 'red'
      }));
    }
    super(options);
    const update = () => {
      // Doing StringProperty.value is OK here, because we're observing these StringProperties via Multilink below.
      const symbol = domainProperty.value === Domain.SPACE ? spaceSymbolStringProperty.value : timeSymbolStringProperty.value;
      if (property.value === Infinity) {
        // Make the calipers invisible, and as small as possible,
        // see https://github.com/phetsims/fourier-making-waves/issues/181
        calipersNode.visible = false;
        calipersNode.setMeasuredWidth(0);
        infinityBackgroundNode.visible = true;
        infinityText.string = `${symbol} = ${FMWSymbols.infinity}`;
      } else {
        calipersNode.visible = true;
        calipersNode.setMeasuredWidth(chartTransform.modelToViewDeltaX(property.value));
        infinityBackgroundNode.visible = false;
        if (property.value === 0) {
          calipersNode.setLabel(`${symbol} = 0`); // ... so there is no question that the caliper jaws are fully closed.
        } else {
          calipersNode.setLabel(symbol);
        }
      }

      // Locate infinity display at the capliper's origin.
      infinityBackgroundNode.centerX = calipersNode.x;
      infinityBackgroundNode.bottom = calipersNode.y;
    };
    chartTransform.changedEmitter.addListener(() => update());
    Multilink.multilink([property, domainProperty, spaceSymbolStringProperty, timeSymbolStringProperty], () => update());
    const positionProperty = new Vector2Property(options.position, {
      tandem: options.tandem.createTandem('positionProperty'),
      phetioDocumentation: 'position of this tool, in view coordinates'
    });
    positionProperty.link(position => {
      this.translation = position;
    });

    // This is a fixed value, but DragListener requires a Property.
    const dragBoundsProperty = new Property(options.dragBounds, {
      validValues: [options.dragBounds]
    });

    // Dragging, constrained to bounds.
    this.addInputListener(new DragListener({
      positionProperty: positionProperty,
      dragBoundsProperty: dragBoundsProperty,
      tandem: options.tandem.createTandem('dragListener'),
      phetioEnabledPropertyInstrumented: true
    }));

    // pdom - dragging using the keyboard
    const keyboardDragListener = new KeyboardDragListener({
      positionProperty: positionProperty,
      dragBoundsProperty: dragBoundsProperty,
      dragVelocity: 100,
      // velocity - change in position per second
      shiftDragVelocity: 20,
      // finer-grained
      tandem: options.tandem.createTandem('keyboardDragListener')
    });
    this.addInputListener(keyboardDragListener);

    // @private
    this.positionProperty = positionProperty; // {Property.<Vector2>}
  }

  /**
   * @public
   */
  reset() {
    this.positionProperty.reset();
  }

  /**
   * @public
   * @override
   */
  dispose() {
    assert && assert(false, 'dispose is not supported, exists for the lifetime of the sim');
    super.dispose();
  }
}
fourierMakingWaves.register('WavePacketMeasurementToolNode', WavePacketMeasurementToolNode);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJFbnVtZXJhdGlvblByb3BlcnR5IiwiTXVsdGlsaW5rIiwiUHJvcGVydHkiLCJDaGFydFRyYW5zZm9ybSIsIlZlY3RvcjIiLCJWZWN0b3IyUHJvcGVydHkiLCJtZXJnZSIsIkFzc2VydFV0aWxzIiwiQmFja2dyb3VuZE5vZGUiLCJDaXJjbGUiLCJEcmFnTGlzdGVuZXIiLCJLZXlib2FyZERyYWdMaXN0ZW5lciIsIk5vZGUiLCJSaWNoVGV4dCIsIlRhbmRlbSIsIkZNV0NvbnN0YW50cyIsIkZNV1F1ZXJ5UGFyYW1ldGVycyIsIkZNV1N5bWJvbHMiLCJEb21haW4iLCJDYWxpcGVyc05vZGUiLCJmb3VyaWVyTWFraW5nV2F2ZXMiLCJXYXZlUGFja2V0TWVhc3VyZW1lbnRUb29sTm9kZSIsImNvbnN0cnVjdG9yIiwicHJvcGVydHkiLCJjaGFydFRyYW5zZm9ybSIsImRvbWFpblByb3BlcnR5Iiwic3BhY2VTeW1ib2xTdHJpbmdQcm9wZXJ0eSIsInRpbWVTeW1ib2xTdHJpbmdQcm9wZXJ0eSIsIm9wdGlvbnMiLCJhc3NlcnQiLCJhc3NlcnRBYnN0cmFjdFByb3BlcnR5T2YiLCJwb3NpdGlvbiIsImRyYWdCb3VuZHMiLCJjdXJzb3IiLCJjYWxpcGVyc05vZGVPcHRpb25zIiwicGF0aE9wdGlvbnMiLCJmaWxsIiwicmljaFRleHRPcHRpb25zIiwiZm9udCIsIlRPT0xfTEFCRUxfRk9OVCIsIm1heFdpZHRoIiwidGFnTmFtZSIsImZvY3VzYWJsZSIsInRhbmRlbSIsIlJFUVVJUkVEIiwiY2FsaXBlcnNOb2RlIiwiaW5maW5pdHlUZXh0IiwiaW5maW5pdHlCYWNrZ3JvdW5kTm9kZSIsInhNYXJnaW4iLCJ5TWFyZ2luIiwicmVjdGFuZ2xlT3B0aW9ucyIsImNvcm5lclJhZGl1cyIsImNoaWxkcmVuIiwiZGVidWdUb29scyIsInB1c2giLCJ1cGRhdGUiLCJzeW1ib2wiLCJ2YWx1ZSIsIlNQQUNFIiwiSW5maW5pdHkiLCJ2aXNpYmxlIiwic2V0TWVhc3VyZWRXaWR0aCIsInN0cmluZyIsImluZmluaXR5IiwibW9kZWxUb1ZpZXdEZWx0YVgiLCJzZXRMYWJlbCIsImNlbnRlclgiLCJ4IiwiYm90dG9tIiwieSIsImNoYW5nZWRFbWl0dGVyIiwiYWRkTGlzdGVuZXIiLCJtdWx0aWxpbmsiLCJwb3NpdGlvblByb3BlcnR5IiwiY3JlYXRlVGFuZGVtIiwicGhldGlvRG9jdW1lbnRhdGlvbiIsImxpbmsiLCJ0cmFuc2xhdGlvbiIsImRyYWdCb3VuZHNQcm9wZXJ0eSIsInZhbGlkVmFsdWVzIiwiYWRkSW5wdXRMaXN0ZW5lciIsInBoZXRpb0VuYWJsZWRQcm9wZXJ0eUluc3RydW1lbnRlZCIsImtleWJvYXJkRHJhZ0xpc3RlbmVyIiwiZHJhZ1ZlbG9jaXR5Iiwic2hpZnREcmFnVmVsb2NpdHkiLCJyZXNldCIsImRpc3Bvc2UiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIldhdmVQYWNrZXRNZWFzdXJlbWVudFRvb2xOb2RlLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDIxLTIwMjMsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIFdhdmVQYWNrZXRNZWFzdXJlbWVudFRvb2xOb2RlIGlzIHRoZSBiYXNlIGNsYXNzIGZvciBtZWFzdXJlbWVudCB0b29scyBpbiB0aGUgJ1dhdmUgUGFja2V0JyBzY3JlZW4uXHJcbiAqIE9yaWdpbiBpcyBhdCB0aGUgdGlwIG9mIHRoZSBjYWxpcGVyJ3MgbGVmdCBqYXcuXHJcbiAqXHJcbiAqIEBhdXRob3IgQ2hyaXMgTWFsbGV5IChQaXhlbFpvb20sIEluYy4pXHJcbiAqL1xyXG5cclxuaW1wb3J0IEVudW1lcmF0aW9uUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9FbnVtZXJhdGlvblByb3BlcnR5LmpzJztcclxuaW1wb3J0IE11bHRpbGluayBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL011bHRpbGluay5qcyc7XHJcbmltcG9ydCBQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL1Byb3BlcnR5LmpzJztcclxuaW1wb3J0IENoYXJ0VHJhbnNmb3JtIGZyb20gJy4uLy4uLy4uLy4uL2JhbWJvby9qcy9DaGFydFRyYW5zZm9ybS5qcyc7XHJcbmltcG9ydCBWZWN0b3IyIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9WZWN0b3IyLmpzJztcclxuaW1wb3J0IFZlY3RvcjJQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvVmVjdG9yMlByb3BlcnR5LmpzJztcclxuaW1wb3J0IG1lcmdlIGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9tZXJnZS5qcyc7XHJcbmltcG9ydCBBc3NlcnRVdGlscyBmcm9tICcuLi8uLi8uLi8uLi9waGV0Y29tbW9uL2pzL0Fzc2VydFV0aWxzLmpzJztcclxuaW1wb3J0IEJhY2tncm91bmROb2RlIGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9CYWNrZ3JvdW5kTm9kZS5qcyc7XHJcbmltcG9ydCB7IENpcmNsZSwgRHJhZ0xpc3RlbmVyLCBLZXlib2FyZERyYWdMaXN0ZW5lciwgTm9kZSwgUmljaFRleHQgfSBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgVGFuZGVtIGZyb20gJy4uLy4uLy4uLy4uL3RhbmRlbS9qcy9UYW5kZW0uanMnO1xyXG5pbXBvcnQgRk1XQ29uc3RhbnRzIGZyb20gJy4uLy4uL2NvbW1vbi9GTVdDb25zdGFudHMuanMnO1xyXG5pbXBvcnQgRk1XUXVlcnlQYXJhbWV0ZXJzIGZyb20gJy4uLy4uL2NvbW1vbi9GTVdRdWVyeVBhcmFtZXRlcnMuanMnO1xyXG5pbXBvcnQgRk1XU3ltYm9scyBmcm9tICcuLi8uLi9jb21tb24vRk1XU3ltYm9scy5qcyc7XHJcbmltcG9ydCBEb21haW4gZnJvbSAnLi4vLi4vY29tbW9uL21vZGVsL0RvbWFpbi5qcyc7XHJcbmltcG9ydCBDYWxpcGVyc05vZGUgZnJvbSAnLi4vLi4vY29tbW9uL3ZpZXcvQ2FsaXBlcnNOb2RlLmpzJztcclxuaW1wb3J0IGZvdXJpZXJNYWtpbmdXYXZlcyBmcm9tICcuLi8uLi9mb3VyaWVyTWFraW5nV2F2ZXMuanMnO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgV2F2ZVBhY2tldE1lYXN1cmVtZW50VG9vbE5vZGUgZXh0ZW5kcyBOb2RlIHtcclxuXHJcbiAgLyoqXHJcbiAgICogQHBhcmFtIHtSZWFkT25seVByb3BlcnR5LjxudW1iZXI+fSBwcm9wZXJ0eSAtIHRoZSBQcm9wZXJ0eSBvZiB0aGUgd2F2ZSBwYWNrZXQgdGhhdCB3ZSdyZSBtZWFzdXJpbmdcclxuICAgKiBAcGFyYW0ge0NoYXJ0VHJhbnNmb3JtfSBjaGFydFRyYW5zZm9ybVxyXG4gICAqIEBwYXJhbSB7RW51bWVyYXRpb25Qcm9wZXJ0eS48RG9tYWluPn0gZG9tYWluUHJvcGVydHlcclxuICAgKiBAcGFyYW0ge1RSZWFkT25seVByb3BlcnR5LjxzdHJpbmc+fSBzcGFjZVN5bWJvbFN0cmluZ1Byb3BlcnR5XHJcbiAgICogQHBhcmFtIHtUUmVhZE9ubHlQcm9wZXJ0eS48c3RyaW5nPn0gdGltZVN5bWJvbFN0cmluZ1Byb3BlcnR5XHJcbiAgICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25zXVxyXG4gICAqL1xyXG4gIGNvbnN0cnVjdG9yKCBwcm9wZXJ0eSwgY2hhcnRUcmFuc2Zvcm0sIGRvbWFpblByb3BlcnR5LCBzcGFjZVN5bWJvbFN0cmluZ1Byb3BlcnR5LCB0aW1lU3ltYm9sU3RyaW5nUHJvcGVydHksIG9wdGlvbnMgKSB7XHJcblxyXG4gICAgYXNzZXJ0ICYmIEFzc2VydFV0aWxzLmFzc2VydEFic3RyYWN0UHJvcGVydHlPZiggcHJvcGVydHksICdudW1iZXInICk7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBjaGFydFRyYW5zZm9ybSBpbnN0YW5jZW9mIENoYXJ0VHJhbnNmb3JtICk7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBkb21haW5Qcm9wZXJ0eSBpbnN0YW5jZW9mIEVudW1lcmF0aW9uUHJvcGVydHkgKTtcclxuXHJcbiAgICBvcHRpb25zID0gbWVyZ2UoIHtcclxuICAgICAgcG9zaXRpb246IG5ldyBWZWN0b3IyKCAwLCAwICksXHJcbiAgICAgIGRyYWdCb3VuZHM6IG51bGwsIC8vIHtCb3VuZHMyfG51bGx9XHJcbiAgICAgIGN1cnNvcjogJ3BvaW50ZXInLFxyXG5cclxuICAgICAgLy8gQ2FsaXBlcnNOb2RlIG9wdGlvbnNcclxuICAgICAgY2FsaXBlcnNOb2RlT3B0aW9uczoge1xyXG4gICAgICAgIHBhdGhPcHRpb25zOiB7XHJcbiAgICAgICAgICBmaWxsOiAnd2hpdGUnXHJcbiAgICAgICAgfSxcclxuICAgICAgICByaWNoVGV4dE9wdGlvbnM6IHtcclxuICAgICAgICAgIGZvbnQ6IEZNV0NvbnN0YW50cy5UT09MX0xBQkVMX0ZPTlQsXHJcbiAgICAgICAgICBtYXhXaWR0aDogNzVcclxuICAgICAgICB9XHJcbiAgICAgIH0sXHJcblxyXG4gICAgICAvLyBwZG9tXHJcbiAgICAgIHRhZ05hbWU6ICdkaXYnLFxyXG4gICAgICBmb2N1c2FibGU6IHRydWUsXHJcblxyXG4gICAgICAvLyBwaGV0LWlvIG9wdGlvbnNcclxuICAgICAgdGFuZGVtOiBUYW5kZW0uUkVRVUlSRURcclxuICAgIH0sIG9wdGlvbnMgKTtcclxuXHJcbiAgICAvLyBDYWxpcGVycywgc2hvd24gd2hlbiB0aGUgdmFsdWUgaXMgbm90IEluZmluaXR5LlxyXG4gICAgY29uc3QgY2FsaXBlcnNOb2RlID0gbmV3IENhbGlwZXJzTm9kZSggb3B0aW9ucy5jYWxpcGVyc05vZGVPcHRpb25zICk7XHJcblxyXG4gICAgLy8gU2hvd24gd2hlbiB0aGUgdmFsdWUgaXMgSW5maW5pdHkuXHJcbiAgICBjb25zdCBpbmZpbml0eVRleHQgPSBuZXcgUmljaFRleHQoICcnLCBvcHRpb25zLmNhbGlwZXJzTm9kZU9wdGlvbnMucmljaFRleHRPcHRpb25zICk7XHJcbiAgICBjb25zdCBpbmZpbml0eUJhY2tncm91bmROb2RlID0gbmV3IEJhY2tncm91bmROb2RlKCBpbmZpbml0eVRleHQsIHtcclxuICAgICAgeE1hcmdpbjogNSxcclxuICAgICAgeU1hcmdpbjogMixcclxuICAgICAgcmVjdGFuZ2xlT3B0aW9uczoge1xyXG4gICAgICAgIGNvcm5lclJhZGl1czogMyxcclxuICAgICAgICBmaWxsOiBvcHRpb25zLmNhbGlwZXJzTm9kZU9wdGlvbnMucGF0aE9wdGlvbnMuZmlsbFxyXG4gICAgICB9XHJcbiAgICB9ICk7XHJcblxyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggIW9wdGlvbnMuY2hpbGRyZW4gKTtcclxuICAgIG9wdGlvbnMuY2hpbGRyZW4gPSBbIGluZmluaXR5QmFja2dyb3VuZE5vZGUsIGNhbGlwZXJzTm9kZSBdO1xyXG5cclxuICAgIC8vIFNob3cgYSByZWQgZG90IGF0IHRoZSB0b29sJ3Mgb3JpZ2luLlxyXG4gICAgaWYgKCBGTVdRdWVyeVBhcmFtZXRlcnMuZGVidWdUb29scyApIHtcclxuICAgICAgb3B0aW9ucy5jaGlsZHJlbi5wdXNoKCBuZXcgQ2lyY2xlKCAyLCB7IGZpbGw6ICdyZWQnIH0gKSApO1xyXG4gICAgfVxyXG5cclxuICAgIHN1cGVyKCBvcHRpb25zICk7XHJcblxyXG4gICAgY29uc3QgdXBkYXRlID0gKCkgPT4ge1xyXG5cclxuICAgICAgLy8gRG9pbmcgU3RyaW5nUHJvcGVydHkudmFsdWUgaXMgT0sgaGVyZSwgYmVjYXVzZSB3ZSdyZSBvYnNlcnZpbmcgdGhlc2UgU3RyaW5nUHJvcGVydGllcyB2aWEgTXVsdGlsaW5rIGJlbG93LlxyXG4gICAgICBjb25zdCBzeW1ib2wgPSAoIGRvbWFpblByb3BlcnR5LnZhbHVlID09PSBEb21haW4uU1BBQ0UgKSA/IHNwYWNlU3ltYm9sU3RyaW5nUHJvcGVydHkudmFsdWUgOiB0aW1lU3ltYm9sU3RyaW5nUHJvcGVydHkudmFsdWU7XHJcblxyXG4gICAgICBpZiAoIHByb3BlcnR5LnZhbHVlID09PSBJbmZpbml0eSApIHtcclxuXHJcbiAgICAgICAgLy8gTWFrZSB0aGUgY2FsaXBlcnMgaW52aXNpYmxlLCBhbmQgYXMgc21hbGwgYXMgcG9zc2libGUsXHJcbiAgICAgICAgLy8gc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9mb3VyaWVyLW1ha2luZy13YXZlcy9pc3N1ZXMvMTgxXHJcbiAgICAgICAgY2FsaXBlcnNOb2RlLnZpc2libGUgPSBmYWxzZTtcclxuICAgICAgICBjYWxpcGVyc05vZGUuc2V0TWVhc3VyZWRXaWR0aCggMCApO1xyXG4gICAgICAgIGluZmluaXR5QmFja2dyb3VuZE5vZGUudmlzaWJsZSA9IHRydWU7XHJcbiAgICAgICAgaW5maW5pdHlUZXh0LnN0cmluZyA9IGAke3N5bWJvbH0gPSAke0ZNV1N5bWJvbHMuaW5maW5pdHl9YDtcclxuICAgICAgfVxyXG4gICAgICBlbHNlIHtcclxuICAgICAgICBjYWxpcGVyc05vZGUudmlzaWJsZSA9IHRydWU7XHJcbiAgICAgICAgY2FsaXBlcnNOb2RlLnNldE1lYXN1cmVkV2lkdGgoIGNoYXJ0VHJhbnNmb3JtLm1vZGVsVG9WaWV3RGVsdGFYKCBwcm9wZXJ0eS52YWx1ZSApICk7XHJcbiAgICAgICAgaW5maW5pdHlCYWNrZ3JvdW5kTm9kZS52aXNpYmxlID0gZmFsc2U7XHJcbiAgICAgICAgaWYgKCBwcm9wZXJ0eS52YWx1ZSA9PT0gMCApIHtcclxuICAgICAgICAgIGNhbGlwZXJzTm9kZS5zZXRMYWJlbCggYCR7c3ltYm9sfSA9IDBgICk7IC8vIC4uLiBzbyB0aGVyZSBpcyBubyBxdWVzdGlvbiB0aGF0IHRoZSBjYWxpcGVyIGphd3MgYXJlIGZ1bGx5IGNsb3NlZC5cclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICBjYWxpcGVyc05vZGUuc2V0TGFiZWwoIHN5bWJvbCApO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gTG9jYXRlIGluZmluaXR5IGRpc3BsYXkgYXQgdGhlIGNhcGxpcGVyJ3Mgb3JpZ2luLlxyXG4gICAgICBpbmZpbml0eUJhY2tncm91bmROb2RlLmNlbnRlclggPSBjYWxpcGVyc05vZGUueDtcclxuICAgICAgaW5maW5pdHlCYWNrZ3JvdW5kTm9kZS5ib3R0b20gPSBjYWxpcGVyc05vZGUueTtcclxuICAgIH07XHJcblxyXG4gICAgY2hhcnRUcmFuc2Zvcm0uY2hhbmdlZEVtaXR0ZXIuYWRkTGlzdGVuZXIoICgpID0+IHVwZGF0ZSgpICk7XHJcbiAgICBNdWx0aWxpbmsubXVsdGlsaW5rKCBbIHByb3BlcnR5LCBkb21haW5Qcm9wZXJ0eSwgc3BhY2VTeW1ib2xTdHJpbmdQcm9wZXJ0eSwgdGltZVN5bWJvbFN0cmluZ1Byb3BlcnR5IF0sICgpID0+IHVwZGF0ZSgpICk7XHJcblxyXG4gICAgY29uc3QgcG9zaXRpb25Qcm9wZXJ0eSA9IG5ldyBWZWN0b3IyUHJvcGVydHkoIG9wdGlvbnMucG9zaXRpb24sIHtcclxuICAgICAgdGFuZGVtOiBvcHRpb25zLnRhbmRlbS5jcmVhdGVUYW5kZW0oICdwb3NpdGlvblByb3BlcnR5JyApLFxyXG4gICAgICBwaGV0aW9Eb2N1bWVudGF0aW9uOiAncG9zaXRpb24gb2YgdGhpcyB0b29sLCBpbiB2aWV3IGNvb3JkaW5hdGVzJ1xyXG4gICAgfSApO1xyXG4gICAgcG9zaXRpb25Qcm9wZXJ0eS5saW5rKCBwb3NpdGlvbiA9PiB7XHJcbiAgICAgIHRoaXMudHJhbnNsYXRpb24gPSBwb3NpdGlvbjtcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBUaGlzIGlzIGEgZml4ZWQgdmFsdWUsIGJ1dCBEcmFnTGlzdGVuZXIgcmVxdWlyZXMgYSBQcm9wZXJ0eS5cclxuICAgIGNvbnN0IGRyYWdCb3VuZHNQcm9wZXJ0eSA9IG5ldyBQcm9wZXJ0eSggb3B0aW9ucy5kcmFnQm91bmRzLCB7XHJcbiAgICAgIHZhbGlkVmFsdWVzOiBbIG9wdGlvbnMuZHJhZ0JvdW5kcyBdXHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gRHJhZ2dpbmcsIGNvbnN0cmFpbmVkIHRvIGJvdW5kcy5cclxuICAgIHRoaXMuYWRkSW5wdXRMaXN0ZW5lciggbmV3IERyYWdMaXN0ZW5lcigge1xyXG4gICAgICBwb3NpdGlvblByb3BlcnR5OiBwb3NpdGlvblByb3BlcnR5LFxyXG4gICAgICBkcmFnQm91bmRzUHJvcGVydHk6IGRyYWdCb3VuZHNQcm9wZXJ0eSxcclxuICAgICAgdGFuZGVtOiBvcHRpb25zLnRhbmRlbS5jcmVhdGVUYW5kZW0oICdkcmFnTGlzdGVuZXInICksXHJcbiAgICAgIHBoZXRpb0VuYWJsZWRQcm9wZXJ0eUluc3RydW1lbnRlZDogdHJ1ZVxyXG4gICAgfSApICk7XHJcblxyXG4gICAgLy8gcGRvbSAtIGRyYWdnaW5nIHVzaW5nIHRoZSBrZXlib2FyZFxyXG4gICAgY29uc3Qga2V5Ym9hcmREcmFnTGlzdGVuZXIgPSBuZXcgS2V5Ym9hcmREcmFnTGlzdGVuZXIoIHtcclxuICAgICAgcG9zaXRpb25Qcm9wZXJ0eTogcG9zaXRpb25Qcm9wZXJ0eSxcclxuICAgICAgZHJhZ0JvdW5kc1Byb3BlcnR5OiBkcmFnQm91bmRzUHJvcGVydHksXHJcbiAgICAgIGRyYWdWZWxvY2l0eTogMTAwLCAvLyB2ZWxvY2l0eSAtIGNoYW5nZSBpbiBwb3NpdGlvbiBwZXIgc2Vjb25kXHJcbiAgICAgIHNoaWZ0RHJhZ1ZlbG9jaXR5OiAyMCwgLy8gZmluZXItZ3JhaW5lZFxyXG4gICAgICB0YW5kZW06IG9wdGlvbnMudGFuZGVtLmNyZWF0ZVRhbmRlbSggJ2tleWJvYXJkRHJhZ0xpc3RlbmVyJyApXHJcbiAgICB9ICk7XHJcbiAgICB0aGlzLmFkZElucHV0TGlzdGVuZXIoIGtleWJvYXJkRHJhZ0xpc3RlbmVyICk7XHJcblxyXG4gICAgLy8gQHByaXZhdGVcclxuICAgIHRoaXMucG9zaXRpb25Qcm9wZXJ0eSA9IHBvc2l0aW9uUHJvcGVydHk7IC8vIHtQcm9wZXJ0eS48VmVjdG9yMj59XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgcmVzZXQoKSB7XHJcbiAgICB0aGlzLnBvc2l0aW9uUHJvcGVydHkucmVzZXQoKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwdWJsaWNcclxuICAgKiBAb3ZlcnJpZGVcclxuICAgKi9cclxuICBkaXNwb3NlKCkge1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggZmFsc2UsICdkaXNwb3NlIGlzIG5vdCBzdXBwb3J0ZWQsIGV4aXN0cyBmb3IgdGhlIGxpZmV0aW1lIG9mIHRoZSBzaW0nICk7XHJcbiAgICBzdXBlci5kaXNwb3NlKCk7XHJcbiAgfVxyXG59XHJcblxyXG5mb3VyaWVyTWFraW5nV2F2ZXMucmVnaXN0ZXIoICdXYXZlUGFja2V0TWVhc3VyZW1lbnRUb29sTm9kZScsIFdhdmVQYWNrZXRNZWFzdXJlbWVudFRvb2xOb2RlICk7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsbUJBQW1CLE1BQU0sNENBQTRDO0FBQzVFLE9BQU9DLFNBQVMsTUFBTSxrQ0FBa0M7QUFDeEQsT0FBT0MsUUFBUSxNQUFNLGlDQUFpQztBQUN0RCxPQUFPQyxjQUFjLE1BQU0seUNBQXlDO0FBQ3BFLE9BQU9DLE9BQU8sTUFBTSwrQkFBK0I7QUFDbkQsT0FBT0MsZUFBZSxNQUFNLHVDQUF1QztBQUNuRSxPQUFPQyxLQUFLLE1BQU0sbUNBQW1DO0FBQ3JELE9BQU9DLFdBQVcsTUFBTSwwQ0FBMEM7QUFDbEUsT0FBT0MsY0FBYyxNQUFNLCtDQUErQztBQUMxRSxTQUFTQyxNQUFNLEVBQUVDLFlBQVksRUFBRUMsb0JBQW9CLEVBQUVDLElBQUksRUFBRUMsUUFBUSxRQUFRLG1DQUFtQztBQUM5RyxPQUFPQyxNQUFNLE1BQU0saUNBQWlDO0FBQ3BELE9BQU9DLFlBQVksTUFBTSw4QkFBOEI7QUFDdkQsT0FBT0Msa0JBQWtCLE1BQU0sb0NBQW9DO0FBQ25FLE9BQU9DLFVBQVUsTUFBTSw0QkFBNEI7QUFDbkQsT0FBT0MsTUFBTSxNQUFNLDhCQUE4QjtBQUNqRCxPQUFPQyxZQUFZLE1BQU0sbUNBQW1DO0FB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