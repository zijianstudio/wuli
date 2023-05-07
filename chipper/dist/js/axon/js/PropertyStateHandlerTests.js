// Copyright 2020-2023, University of Colorado Boulder

/**
 * Tests for PropertyStateHandler.js
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 * @author Chris Klusendorf (PhET Interactive Simulations)
 */

import Range from '../../dot/js/Range.js';
import Tandem from '../../tandem/js/Tandem.js';
import BooleanProperty from './BooleanProperty.js';
import NumberProperty from './NumberProperty.js';
import Property from './Property.js';
import PropertyStateHandler from './PropertyStateHandler.js';
import propertyStateHandlerSingleton from './propertyStateHandlerSingleton.js';
import PropertyStatePhase from './PropertyStatePhase.js';
QUnit.module('PropertyStateHandler');

// These tests run only in brand=phet-io
if (Tandem.PHET_IO_ENABLED) {
  QUnit.test('Register and unregister order dependency within state engine', assert => {
    window.assert && window.assert(_.hasIn(window, 'phet.phetio.PhetioStateEngine'), 'state engine expected for this test');
    const propertyStateHandler = new PropertyStateHandler();
    assert.ok(!propertyStateHandler['initialized'], 'started not initialized');
    const phetioStateEngine = new phet.phetio.PhetioStateEngine(phet.phetio.phetioEngine, {
      propertyStateHandler: propertyStateHandler
    });
    assert.ok(propertyStateHandler['initialized'], 'should be initialized by phetioStateEngine');
    assert.ok(phetioStateEngine, 'to avoid eslint no new as side-effects');
    const aProperty = new BooleanProperty(false, {
      tandem: Tandem.ROOT_TEST.createTandem('aProperty')
    });
    const bProperty = new BooleanProperty(true, {
      tandem: Tandem.ROOT_TEST.createTandem('bProperty')
    });
    const cProperty = new BooleanProperty(false, {
      tandem: Tandem.ROOT_TEST.createTandem('cProperty')
    });
    const originalOrderDependencyLength = propertyStateHandler.getNumberOfOrderDependencies();
    const getOrderDependencyLength = () => propertyStateHandler.getNumberOfOrderDependencies() - originalOrderDependencyLength;
    propertyStateHandler.registerPhetioOrderDependency(aProperty, PropertyStatePhase.UNDEFER, bProperty, PropertyStatePhase.NOTIFY);
    assert.ok(getOrderDependencyLength() === 1, 'one expected');
    propertyStateHandler.registerPhetioOrderDependency(aProperty, PropertyStatePhase.UNDEFER, cProperty, PropertyStatePhase.NOTIFY);
    assert.ok(getOrderDependencyLength() === 2, 'two expected');
    propertyStateHandler.registerPhetioOrderDependency(bProperty, PropertyStatePhase.UNDEFER, cProperty, PropertyStatePhase.NOTIFY);
    assert.ok(getOrderDependencyLength() === 3, 'three expected');
    propertyStateHandler.unregisterOrderDependenciesForProperty(aProperty);
    assert.ok(getOrderDependencyLength() === 1, 'a was in two');
    propertyStateHandler.unregisterOrderDependenciesForProperty(bProperty);
    assert.ok(getOrderDependencyLength() === 0, 'none now');
    propertyStateHandler.registerPhetioOrderDependency(aProperty, PropertyStatePhase.UNDEFER, cProperty, PropertyStatePhase.NOTIFY);
    propertyStateHandler.registerPhetioOrderDependency(bProperty, PropertyStatePhase.UNDEFER, cProperty, PropertyStatePhase.NOTIFY);
    assert.ok(getOrderDependencyLength() === 2, 'none now');
    propertyStateHandler.unregisterOrderDependenciesForProperty(cProperty);
    assert.ok(getOrderDependencyLength() === 0, 'none now');
    aProperty.dispose();
    bProperty.dispose();
    cProperty.dispose();
    if (window.assert) {
      const uninstrumentedProperty = new Property(2);
      const instrumentedProperty = new BooleanProperty(false, {
        tandem: Tandem.ROOT_TEST.createTandem('instrumentedProperty')
      });
      assert.throws(() => {
        propertyStateHandler.registerPhetioOrderDependency(uninstrumentedProperty, PropertyStatePhase.UNDEFER, instrumentedProperty, PropertyStatePhase.UNDEFER);
      }, 'cannot register with an uninstrumented Property');
      assert.throws(() => {
        propertyStateHandler.registerPhetioOrderDependency(instrumentedProperty, PropertyStatePhase.UNDEFER, instrumentedProperty, PropertyStatePhase.UNDEFER);
      }, 'same Property same phase. . . . no no.');
    }
  });
  QUnit.test('Order dependency between NumberProperty and its Range', assert => {
    assert.ok(true, 'always pass');
    const rangeProperty = new Property(new Range(0, 1), {
      tandem: Tandem.ROOT_TEST.createTandem('rangeProperty'),
      phetioDynamicElement: true,
      phetioValueType: Range.RangeIO
    });
    const numberProperty = new NumberProperty(0, {
      tandem: Tandem.ROOT_TEST.createTandem('numberProperty'),
      phetioDynamicElement: true,
      range: rangeProperty
    });
    const randomDependencyProperty = new BooleanProperty(false, {
      tandem: Tandem.ROOT_TEST.createTandem('randomDependencyProperty'),
      phetioDynamicElement: true
    });

    // This extra order dependency means that numberProperty won't be deferred as eagerly as rangeProperty.
    // NumberProperty should still handle this case for state without erroring validation.
    propertyStateHandlerSingleton.registerPhetioOrderDependency(randomDependencyProperty, PropertyStatePhase.UNDEFER, numberProperty, PropertyStatePhase.UNDEFER);
    const serializedValue = NumberProperty.NumberPropertyIO.toStateObject(numberProperty);
    serializedValue.range.min = 4;
    serializedValue.range.max = 8;
    serializedValue['value'] = 7;
    phet.phetio.phetioEngine.phetioStateEngine.setState({
      'axon.test.numberProperty': serializedValue,
      'axon.test.randomDependencyProperty': {
        value: true,
        validValues: null,
        units: null
      },
      'axon.test.rangeProperty': {
        value: {
          min: 4,
          max: 8
        },
        validValues: null,
        units: null
      }
    }, Tandem.ROOT_TEST);
    rangeProperty.dispose();
    numberProperty.dispose();
    randomDependencyProperty.dispose();
  });
  QUnit.test('unregistering clears out the array', assert => {
    assert.ok(true, 'always pass');
    const propertyStateHandler = new PropertyStateHandler();
    assert.ok(!propertyStateHandler['initialized'], 'started not initialized');
    const phetioStateEngine = new phet.phetio.PhetioStateEngine(phet.phetio.phetioEngine, {
      propertyStateHandler: propertyStateHandler
    });
    assert.ok(phetioStateEngine, 'to avoid eslint no new as side-effects');
    const aProperty = new BooleanProperty(false, {
      tandem: Tandem.ROOT_TEST.createTandem('aProperty')
    });
    const bProperty = new BooleanProperty(true, {
      tandem: Tandem.ROOT_TEST.createTandem('bProperty')
    });
    const cProperty = new BooleanProperty(false, {
      tandem: Tandem.ROOT_TEST.createTandem('cProperty')
    });
    propertyStateHandler.registerPhetioOrderDependency(aProperty, PropertyStatePhase.UNDEFER, bProperty, PropertyStatePhase.NOTIFY);
    propertyStateHandler.unregisterOrderDependenciesForProperty(bProperty);
    assert.ok(propertyStateHandler['undeferBeforeNotifyMapPair'].beforeMap.size === 0, 'empty entries should be cleared');
    propertyStateHandler.registerPhetioOrderDependency(aProperty, PropertyStatePhase.UNDEFER, bProperty, PropertyStatePhase.NOTIFY);
    propertyStateHandler.registerPhetioOrderDependency(aProperty, PropertyStatePhase.UNDEFER, cProperty, PropertyStatePhase.NOTIFY);
    propertyStateHandler.unregisterOrderDependenciesForProperty(aProperty);
    assert.ok(propertyStateHandler['undeferBeforeNotifyMapPair'].beforeMap.size === 0, 'empty entries should be cleared');
    propertyStateHandler.registerPhetioOrderDependency(aProperty, PropertyStatePhase.UNDEFER, bProperty, PropertyStatePhase.NOTIFY);
    propertyStateHandler.registerPhetioOrderDependency(aProperty, PropertyStatePhase.UNDEFER, cProperty, PropertyStatePhase.NOTIFY);
    propertyStateHandler.unregisterOrderDependenciesForProperty(bProperty);
    propertyStateHandler.unregisterOrderDependenciesForProperty(cProperty);
    assert.ok(propertyStateHandler['undeferBeforeNotifyMapPair'].beforeMap.size === 0, 'empty entries should be cleared');
    aProperty.dispose();
    bProperty.dispose();
    cProperty.dispose();
  });
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJSYW5nZSIsIlRhbmRlbSIsIkJvb2xlYW5Qcm9wZXJ0eSIsIk51bWJlclByb3BlcnR5IiwiUHJvcGVydHkiLCJQcm9wZXJ0eVN0YXRlSGFuZGxlciIsInByb3BlcnR5U3RhdGVIYW5kbGVyU2luZ2xldG9uIiwiUHJvcGVydHlTdGF0ZVBoYXNlIiwiUVVuaXQiLCJtb2R1bGUiLCJQSEVUX0lPX0VOQUJMRUQiLCJ0ZXN0IiwiYXNzZXJ0Iiwid2luZG93IiwiXyIsImhhc0luIiwicHJvcGVydHlTdGF0ZUhhbmRsZXIiLCJvayIsInBoZXRpb1N0YXRlRW5naW5lIiwicGhldCIsInBoZXRpbyIsIlBoZXRpb1N0YXRlRW5naW5lIiwicGhldGlvRW5naW5lIiwiYVByb3BlcnR5IiwidGFuZGVtIiwiUk9PVF9URVNUIiwiY3JlYXRlVGFuZGVtIiwiYlByb3BlcnR5IiwiY1Byb3BlcnR5Iiwib3JpZ2luYWxPcmRlckRlcGVuZGVuY3lMZW5ndGgiLCJnZXROdW1iZXJPZk9yZGVyRGVwZW5kZW5jaWVzIiwiZ2V0T3JkZXJEZXBlbmRlbmN5TGVuZ3RoIiwicmVnaXN0ZXJQaGV0aW9PcmRlckRlcGVuZGVuY3kiLCJVTkRFRkVSIiwiTk9USUZZIiwidW5yZWdpc3Rlck9yZGVyRGVwZW5kZW5jaWVzRm9yUHJvcGVydHkiLCJkaXNwb3NlIiwidW5pbnN0cnVtZW50ZWRQcm9wZXJ0eSIsImluc3RydW1lbnRlZFByb3BlcnR5IiwidGhyb3dzIiwicmFuZ2VQcm9wZXJ0eSIsInBoZXRpb0R5bmFtaWNFbGVtZW50IiwicGhldGlvVmFsdWVUeXBlIiwiUmFuZ2VJTyIsIm51bWJlclByb3BlcnR5IiwicmFuZ2UiLCJyYW5kb21EZXBlbmRlbmN5UHJvcGVydHkiLCJzZXJpYWxpemVkVmFsdWUiLCJOdW1iZXJQcm9wZXJ0eUlPIiwidG9TdGF0ZU9iamVjdCIsIm1pbiIsIm1heCIsInNldFN0YXRlIiwidmFsdWUiLCJ2YWxpZFZhbHVlcyIsInVuaXRzIiwiYmVmb3JlTWFwIiwic2l6ZSJdLCJzb3VyY2VzIjpbIlByb3BlcnR5U3RhdGVIYW5kbGVyVGVzdHMudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMjAtMjAyMywgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogVGVzdHMgZm9yIFByb3BlcnR5U3RhdGVIYW5kbGVyLmpzXHJcbiAqXHJcbiAqIEBhdXRob3IgTWljaGFlbCBLYXV6bWFubiAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcclxuICogQGF1dGhvciBDaHJpcyBLbHVzZW5kb3JmIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxyXG4gKi9cclxuXHJcbmltcG9ydCBSYW5nZSBmcm9tICcuLi8uLi9kb3QvanMvUmFuZ2UuanMnO1xyXG5pbXBvcnQgVGFuZGVtIGZyb20gJy4uLy4uL3RhbmRlbS9qcy9UYW5kZW0uanMnO1xyXG5pbXBvcnQgQm9vbGVhblByb3BlcnR5IGZyb20gJy4vQm9vbGVhblByb3BlcnR5LmpzJztcclxuaW1wb3J0IE51bWJlclByb3BlcnR5IGZyb20gJy4vTnVtYmVyUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgUHJvcGVydHkgZnJvbSAnLi9Qcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBQcm9wZXJ0eVN0YXRlSGFuZGxlciBmcm9tICcuL1Byb3BlcnR5U3RhdGVIYW5kbGVyLmpzJztcclxuaW1wb3J0IHByb3BlcnR5U3RhdGVIYW5kbGVyU2luZ2xldG9uIGZyb20gJy4vcHJvcGVydHlTdGF0ZUhhbmRsZXJTaW5nbGV0b24uanMnO1xyXG5pbXBvcnQgUHJvcGVydHlTdGF0ZVBoYXNlIGZyb20gJy4vUHJvcGVydHlTdGF0ZVBoYXNlLmpzJztcclxuXHJcblFVbml0Lm1vZHVsZSggJ1Byb3BlcnR5U3RhdGVIYW5kbGVyJyApO1xyXG5cclxuLy8gVGhlc2UgdGVzdHMgcnVuIG9ubHkgaW4gYnJhbmQ9cGhldC1pb1xyXG5pZiAoIFRhbmRlbS5QSEVUX0lPX0VOQUJMRUQgKSB7XHJcblxyXG4gIFFVbml0LnRlc3QoICdSZWdpc3RlciBhbmQgdW5yZWdpc3RlciBvcmRlciBkZXBlbmRlbmN5IHdpdGhpbiBzdGF0ZSBlbmdpbmUnLCBhc3NlcnQgPT4ge1xyXG4gICAgd2luZG93LmFzc2VydCAmJiB3aW5kb3cuYXNzZXJ0KCBfLmhhc0luKCB3aW5kb3csICdwaGV0LnBoZXRpby5QaGV0aW9TdGF0ZUVuZ2luZScgKSwgJ3N0YXRlIGVuZ2luZSBleHBlY3RlZCBmb3IgdGhpcyB0ZXN0JyApO1xyXG5cclxuICAgIGNvbnN0IHByb3BlcnR5U3RhdGVIYW5kbGVyID0gbmV3IFByb3BlcnR5U3RhdGVIYW5kbGVyKCk7XHJcbiAgICBhc3NlcnQub2soICFwcm9wZXJ0eVN0YXRlSGFuZGxlclsgJ2luaXRpYWxpemVkJyBdLCAnc3RhcnRlZCBub3QgaW5pdGlhbGl6ZWQnICk7XHJcbiAgICBjb25zdCBwaGV0aW9TdGF0ZUVuZ2luZSA9IG5ldyBwaGV0LnBoZXRpby5QaGV0aW9TdGF0ZUVuZ2luZSggcGhldC5waGV0aW8ucGhldGlvRW5naW5lLCB7XHJcbiAgICAgIHByb3BlcnR5U3RhdGVIYW5kbGVyOiBwcm9wZXJ0eVN0YXRlSGFuZGxlclxyXG4gICAgfSApO1xyXG5cclxuICAgIGFzc2VydC5vayggcHJvcGVydHlTdGF0ZUhhbmRsZXJbICdpbml0aWFsaXplZCcgXSwgJ3Nob3VsZCBiZSBpbml0aWFsaXplZCBieSBwaGV0aW9TdGF0ZUVuZ2luZScgKTtcclxuXHJcbiAgICBhc3NlcnQub2soIHBoZXRpb1N0YXRlRW5naW5lLCAndG8gYXZvaWQgZXNsaW50IG5vIG5ldyBhcyBzaWRlLWVmZmVjdHMnICk7XHJcblxyXG4gICAgY29uc3QgYVByb3BlcnR5ID0gbmV3IEJvb2xlYW5Qcm9wZXJ0eSggZmFsc2UsIHtcclxuICAgICAgdGFuZGVtOiBUYW5kZW0uUk9PVF9URVNULmNyZWF0ZVRhbmRlbSggJ2FQcm9wZXJ0eScgKVxyXG4gICAgfSApO1xyXG4gICAgY29uc3QgYlByb3BlcnR5ID0gbmV3IEJvb2xlYW5Qcm9wZXJ0eSggdHJ1ZSwge1xyXG4gICAgICB0YW5kZW06IFRhbmRlbS5ST09UX1RFU1QuY3JlYXRlVGFuZGVtKCAnYlByb3BlcnR5JyApXHJcbiAgICB9ICk7XHJcbiAgICBjb25zdCBjUHJvcGVydHkgPSBuZXcgQm9vbGVhblByb3BlcnR5KCBmYWxzZSwge1xyXG4gICAgICB0YW5kZW06IFRhbmRlbS5ST09UX1RFU1QuY3JlYXRlVGFuZGVtKCAnY1Byb3BlcnR5JyApXHJcbiAgICB9ICk7XHJcblxyXG4gICAgY29uc3Qgb3JpZ2luYWxPcmRlckRlcGVuZGVuY3lMZW5ndGggPSBwcm9wZXJ0eVN0YXRlSGFuZGxlci5nZXROdW1iZXJPZk9yZGVyRGVwZW5kZW5jaWVzKCk7XHJcbiAgICBjb25zdCBnZXRPcmRlckRlcGVuZGVuY3lMZW5ndGggPSAoKSA9PiBwcm9wZXJ0eVN0YXRlSGFuZGxlci5nZXROdW1iZXJPZk9yZGVyRGVwZW5kZW5jaWVzKCkgLSBvcmlnaW5hbE9yZGVyRGVwZW5kZW5jeUxlbmd0aDtcclxuXHJcbiAgICBwcm9wZXJ0eVN0YXRlSGFuZGxlci5yZWdpc3RlclBoZXRpb09yZGVyRGVwZW5kZW5jeSggYVByb3BlcnR5LCBQcm9wZXJ0eVN0YXRlUGhhc2UuVU5ERUZFUiwgYlByb3BlcnR5LCBQcm9wZXJ0eVN0YXRlUGhhc2UuTk9USUZZICk7XHJcbiAgICBhc3NlcnQub2soIGdldE9yZGVyRGVwZW5kZW5jeUxlbmd0aCgpID09PSAxLCAnb25lIGV4cGVjdGVkJyApO1xyXG5cclxuICAgIHByb3BlcnR5U3RhdGVIYW5kbGVyLnJlZ2lzdGVyUGhldGlvT3JkZXJEZXBlbmRlbmN5KCBhUHJvcGVydHksIFByb3BlcnR5U3RhdGVQaGFzZS5VTkRFRkVSLCBjUHJvcGVydHksIFByb3BlcnR5U3RhdGVQaGFzZS5OT1RJRlkgKTtcclxuICAgIGFzc2VydC5vayggZ2V0T3JkZXJEZXBlbmRlbmN5TGVuZ3RoKCkgPT09IDIsICd0d28gZXhwZWN0ZWQnICk7XHJcblxyXG4gICAgcHJvcGVydHlTdGF0ZUhhbmRsZXIucmVnaXN0ZXJQaGV0aW9PcmRlckRlcGVuZGVuY3koIGJQcm9wZXJ0eSwgUHJvcGVydHlTdGF0ZVBoYXNlLlVOREVGRVIsIGNQcm9wZXJ0eSwgUHJvcGVydHlTdGF0ZVBoYXNlLk5PVElGWSApO1xyXG4gICAgYXNzZXJ0Lm9rKCBnZXRPcmRlckRlcGVuZGVuY3lMZW5ndGgoKSA9PT0gMywgJ3RocmVlIGV4cGVjdGVkJyApO1xyXG5cclxuICAgIHByb3BlcnR5U3RhdGVIYW5kbGVyLnVucmVnaXN0ZXJPcmRlckRlcGVuZGVuY2llc0ZvclByb3BlcnR5KCBhUHJvcGVydHkgKTtcclxuICAgIGFzc2VydC5vayggZ2V0T3JkZXJEZXBlbmRlbmN5TGVuZ3RoKCkgPT09IDEsICdhIHdhcyBpbiB0d28nICk7XHJcbiAgICBwcm9wZXJ0eVN0YXRlSGFuZGxlci51bnJlZ2lzdGVyT3JkZXJEZXBlbmRlbmNpZXNGb3JQcm9wZXJ0eSggYlByb3BlcnR5ICk7XHJcbiAgICBhc3NlcnQub2soIGdldE9yZGVyRGVwZW5kZW5jeUxlbmd0aCgpID09PSAwLCAnbm9uZSBub3cnICk7XHJcblxyXG4gICAgcHJvcGVydHlTdGF0ZUhhbmRsZXIucmVnaXN0ZXJQaGV0aW9PcmRlckRlcGVuZGVuY3koIGFQcm9wZXJ0eSwgUHJvcGVydHlTdGF0ZVBoYXNlLlVOREVGRVIsIGNQcm9wZXJ0eSwgUHJvcGVydHlTdGF0ZVBoYXNlLk5PVElGWSApO1xyXG4gICAgcHJvcGVydHlTdGF0ZUhhbmRsZXIucmVnaXN0ZXJQaGV0aW9PcmRlckRlcGVuZGVuY3koIGJQcm9wZXJ0eSwgUHJvcGVydHlTdGF0ZVBoYXNlLlVOREVGRVIsIGNQcm9wZXJ0eSwgUHJvcGVydHlTdGF0ZVBoYXNlLk5PVElGWSApO1xyXG4gICAgYXNzZXJ0Lm9rKCBnZXRPcmRlckRlcGVuZGVuY3lMZW5ndGgoKSA9PT0gMiwgJ25vbmUgbm93JyApO1xyXG5cclxuICAgIHByb3BlcnR5U3RhdGVIYW5kbGVyLnVucmVnaXN0ZXJPcmRlckRlcGVuZGVuY2llc0ZvclByb3BlcnR5KCBjUHJvcGVydHkgKTtcclxuICAgIGFzc2VydC5vayggZ2V0T3JkZXJEZXBlbmRlbmN5TGVuZ3RoKCkgPT09IDAsICdub25lIG5vdycgKTtcclxuXHJcbiAgICBhUHJvcGVydHkuZGlzcG9zZSgpO1xyXG4gICAgYlByb3BlcnR5LmRpc3Bvc2UoKTtcclxuICAgIGNQcm9wZXJ0eS5kaXNwb3NlKCk7XHJcblxyXG4gICAgaWYgKCB3aW5kb3cuYXNzZXJ0ICkge1xyXG4gICAgICBjb25zdCB1bmluc3RydW1lbnRlZFByb3BlcnR5ID0gbmV3IFByb3BlcnR5KCAyICk7XHJcbiAgICAgIGNvbnN0IGluc3RydW1lbnRlZFByb3BlcnR5ID0gbmV3IEJvb2xlYW5Qcm9wZXJ0eSggZmFsc2UsIHtcclxuICAgICAgICB0YW5kZW06IFRhbmRlbS5ST09UX1RFU1QuY3JlYXRlVGFuZGVtKCAnaW5zdHJ1bWVudGVkUHJvcGVydHknIClcclxuICAgICAgfSApO1xyXG4gICAgICBhc3NlcnQudGhyb3dzKCAoKSA9PiB7XHJcblxyXG4gICAgICAgIHByb3BlcnR5U3RhdGVIYW5kbGVyLnJlZ2lzdGVyUGhldGlvT3JkZXJEZXBlbmRlbmN5KCB1bmluc3RydW1lbnRlZFByb3BlcnR5LCBQcm9wZXJ0eVN0YXRlUGhhc2UuVU5ERUZFUiwgaW5zdHJ1bWVudGVkUHJvcGVydHksIFByb3BlcnR5U3RhdGVQaGFzZS5VTkRFRkVSICk7XHJcbiAgICAgIH0sICdjYW5ub3QgcmVnaXN0ZXIgd2l0aCBhbiB1bmluc3RydW1lbnRlZCBQcm9wZXJ0eScgKTtcclxuXHJcbiAgICAgIGFzc2VydC50aHJvd3MoICgpID0+IHtcclxuXHJcbiAgICAgICAgcHJvcGVydHlTdGF0ZUhhbmRsZXIucmVnaXN0ZXJQaGV0aW9PcmRlckRlcGVuZGVuY3koIGluc3RydW1lbnRlZFByb3BlcnR5LCBQcm9wZXJ0eVN0YXRlUGhhc2UuVU5ERUZFUiwgaW5zdHJ1bWVudGVkUHJvcGVydHksIFByb3BlcnR5U3RhdGVQaGFzZS5VTkRFRkVSICk7XHJcbiAgICAgIH0sICdzYW1lIFByb3BlcnR5IHNhbWUgcGhhc2UuIC4gLiAuIG5vIG5vLicgKTtcclxuICAgIH1cclxuICB9ICk7XHJcblxyXG4gIFFVbml0LnRlc3QoICdPcmRlciBkZXBlbmRlbmN5IGJldHdlZW4gTnVtYmVyUHJvcGVydHkgYW5kIGl0cyBSYW5nZScsIGFzc2VydCA9PiB7XHJcbiAgICBhc3NlcnQub2soIHRydWUsICdhbHdheXMgcGFzcycgKTtcclxuICAgIGNvbnN0IHJhbmdlUHJvcGVydHkgPSBuZXcgUHJvcGVydHk8UmFuZ2U+KCBuZXcgUmFuZ2UoIDAsIDEgKSwge1xyXG4gICAgICB0YW5kZW06IFRhbmRlbS5ST09UX1RFU1QuY3JlYXRlVGFuZGVtKCAncmFuZ2VQcm9wZXJ0eScgKSxcclxuICAgICAgcGhldGlvRHluYW1pY0VsZW1lbnQ6IHRydWUsXHJcbiAgICAgIHBoZXRpb1ZhbHVlVHlwZTogUmFuZ2UuUmFuZ2VJT1xyXG4gICAgfSApO1xyXG4gICAgY29uc3QgbnVtYmVyUHJvcGVydHkgPSBuZXcgTnVtYmVyUHJvcGVydHkoIDAsIHtcclxuICAgICAgdGFuZGVtOiBUYW5kZW0uUk9PVF9URVNULmNyZWF0ZVRhbmRlbSggJ251bWJlclByb3BlcnR5JyApLFxyXG4gICAgICBwaGV0aW9EeW5hbWljRWxlbWVudDogdHJ1ZSxcclxuICAgICAgcmFuZ2U6IHJhbmdlUHJvcGVydHlcclxuICAgIH0gKTtcclxuXHJcbiAgICBjb25zdCByYW5kb21EZXBlbmRlbmN5UHJvcGVydHkgPSBuZXcgQm9vbGVhblByb3BlcnR5KCBmYWxzZSwge1xyXG4gICAgICB0YW5kZW06IFRhbmRlbS5ST09UX1RFU1QuY3JlYXRlVGFuZGVtKCAncmFuZG9tRGVwZW5kZW5jeVByb3BlcnR5JyApLFxyXG4gICAgICBwaGV0aW9EeW5hbWljRWxlbWVudDogdHJ1ZVxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIFRoaXMgZXh0cmEgb3JkZXIgZGVwZW5kZW5jeSBtZWFucyB0aGF0IG51bWJlclByb3BlcnR5IHdvbid0IGJlIGRlZmVycmVkIGFzIGVhZ2VybHkgYXMgcmFuZ2VQcm9wZXJ0eS5cclxuICAgIC8vIE51bWJlclByb3BlcnR5IHNob3VsZCBzdGlsbCBoYW5kbGUgdGhpcyBjYXNlIGZvciBzdGF0ZSB3aXRob3V0IGVycm9yaW5nIHZhbGlkYXRpb24uXHJcbiAgICBwcm9wZXJ0eVN0YXRlSGFuZGxlclNpbmdsZXRvbi5yZWdpc3RlclBoZXRpb09yZGVyRGVwZW5kZW5jeShcclxuICAgICAgcmFuZG9tRGVwZW5kZW5jeVByb3BlcnR5LCBQcm9wZXJ0eVN0YXRlUGhhc2UuVU5ERUZFUixcclxuICAgICAgbnVtYmVyUHJvcGVydHksIFByb3BlcnR5U3RhdGVQaGFzZS5VTkRFRkVSXHJcbiAgICApO1xyXG5cclxuICAgIGNvbnN0IHNlcmlhbGl6ZWRWYWx1ZSA9IE51bWJlclByb3BlcnR5Lk51bWJlclByb3BlcnR5SU8udG9TdGF0ZU9iamVjdCggbnVtYmVyUHJvcGVydHkgKTtcclxuICAgIHNlcmlhbGl6ZWRWYWx1ZS5yYW5nZS5taW4gPSA0O1xyXG4gICAgc2VyaWFsaXplZFZhbHVlLnJhbmdlLm1heCA9IDg7XHJcbiAgICBzZXJpYWxpemVkVmFsdWVbICd2YWx1ZScgXSA9IDc7XHJcblxyXG4gICAgcGhldC5waGV0aW8ucGhldGlvRW5naW5lLnBoZXRpb1N0YXRlRW5naW5lLnNldFN0YXRlKCB7XHJcbiAgICAgICdheG9uLnRlc3QubnVtYmVyUHJvcGVydHknOiBzZXJpYWxpemVkVmFsdWUsXHJcbiAgICAgICdheG9uLnRlc3QucmFuZG9tRGVwZW5kZW5jeVByb3BlcnR5JzogeyB2YWx1ZTogdHJ1ZSwgdmFsaWRWYWx1ZXM6IG51bGwsIHVuaXRzOiBudWxsIH0sXHJcbiAgICAgICdheG9uLnRlc3QucmFuZ2VQcm9wZXJ0eSc6IHtcclxuICAgICAgICB2YWx1ZToge1xyXG4gICAgICAgICAgbWluOiA0LCBtYXg6IDhcclxuICAgICAgICB9LFxyXG4gICAgICAgIHZhbGlkVmFsdWVzOiBudWxsLFxyXG4gICAgICAgIHVuaXRzOiBudWxsXHJcbiAgICAgIH1cclxuICAgIH0sIFRhbmRlbS5ST09UX1RFU1QgKTtcclxuXHJcbiAgICByYW5nZVByb3BlcnR5LmRpc3Bvc2UoKTtcclxuICAgIG51bWJlclByb3BlcnR5LmRpc3Bvc2UoKTtcclxuICAgIHJhbmRvbURlcGVuZGVuY3lQcm9wZXJ0eS5kaXNwb3NlKCk7XHJcbiAgfSApO1xyXG5cclxuICBRVW5pdC50ZXN0KCAndW5yZWdpc3RlcmluZyBjbGVhcnMgb3V0IHRoZSBhcnJheScsIGFzc2VydCA9PiB7XHJcbiAgICBhc3NlcnQub2soIHRydWUsICdhbHdheXMgcGFzcycgKTtcclxuXHJcbiAgICBjb25zdCBwcm9wZXJ0eVN0YXRlSGFuZGxlciA9IG5ldyBQcm9wZXJ0eVN0YXRlSGFuZGxlcigpO1xyXG4gICAgYXNzZXJ0Lm9rKCAhcHJvcGVydHlTdGF0ZUhhbmRsZXJbICdpbml0aWFsaXplZCcgXSwgJ3N0YXJ0ZWQgbm90IGluaXRpYWxpemVkJyApO1xyXG4gICAgY29uc3QgcGhldGlvU3RhdGVFbmdpbmUgPSBuZXcgcGhldC5waGV0aW8uUGhldGlvU3RhdGVFbmdpbmUoIHBoZXQucGhldGlvLnBoZXRpb0VuZ2luZSwge1xyXG4gICAgICBwcm9wZXJ0eVN0YXRlSGFuZGxlcjogcHJvcGVydHlTdGF0ZUhhbmRsZXJcclxuICAgIH0gKTtcclxuICAgIGFzc2VydC5vayggcGhldGlvU3RhdGVFbmdpbmUsICd0byBhdm9pZCBlc2xpbnQgbm8gbmV3IGFzIHNpZGUtZWZmZWN0cycgKTtcclxuXHJcbiAgICBjb25zdCBhUHJvcGVydHkgPSBuZXcgQm9vbGVhblByb3BlcnR5KCBmYWxzZSwge1xyXG4gICAgICB0YW5kZW06IFRhbmRlbS5ST09UX1RFU1QuY3JlYXRlVGFuZGVtKCAnYVByb3BlcnR5JyApXHJcbiAgICB9ICk7XHJcbiAgICBjb25zdCBiUHJvcGVydHkgPSBuZXcgQm9vbGVhblByb3BlcnR5KCB0cnVlLCB7XHJcbiAgICAgIHRhbmRlbTogVGFuZGVtLlJPT1RfVEVTVC5jcmVhdGVUYW5kZW0oICdiUHJvcGVydHknIClcclxuICAgIH0gKTtcclxuICAgIGNvbnN0IGNQcm9wZXJ0eSA9IG5ldyBCb29sZWFuUHJvcGVydHkoIGZhbHNlLCB7XHJcbiAgICAgIHRhbmRlbTogVGFuZGVtLlJPT1RfVEVTVC5jcmVhdGVUYW5kZW0oICdjUHJvcGVydHknIClcclxuICAgIH0gKTtcclxuXHJcbiAgICBwcm9wZXJ0eVN0YXRlSGFuZGxlci5yZWdpc3RlclBoZXRpb09yZGVyRGVwZW5kZW5jeSggYVByb3BlcnR5LCBQcm9wZXJ0eVN0YXRlUGhhc2UuVU5ERUZFUiwgYlByb3BlcnR5LCBQcm9wZXJ0eVN0YXRlUGhhc2UuTk9USUZZICk7XHJcbiAgICBwcm9wZXJ0eVN0YXRlSGFuZGxlci51bnJlZ2lzdGVyT3JkZXJEZXBlbmRlbmNpZXNGb3JQcm9wZXJ0eSggYlByb3BlcnR5ICk7XHJcbiAgICBhc3NlcnQub2soIHByb3BlcnR5U3RhdGVIYW5kbGVyWyAndW5kZWZlckJlZm9yZU5vdGlmeU1hcFBhaXInIF0uYmVmb3JlTWFwLnNpemUgPT09IDAsICdlbXB0eSBlbnRyaWVzIHNob3VsZCBiZSBjbGVhcmVkJyApO1xyXG5cclxuICAgIHByb3BlcnR5U3RhdGVIYW5kbGVyLnJlZ2lzdGVyUGhldGlvT3JkZXJEZXBlbmRlbmN5KCBhUHJvcGVydHksIFByb3BlcnR5U3RhdGVQaGFzZS5VTkRFRkVSLCBiUHJvcGVydHksIFByb3BlcnR5U3RhdGVQaGFzZS5OT1RJRlkgKTtcclxuICAgIHByb3BlcnR5U3RhdGVIYW5kbGVyLnJlZ2lzdGVyUGhldGlvT3JkZXJEZXBlbmRlbmN5KCBhUHJvcGVydHksIFByb3BlcnR5U3RhdGVQaGFzZS5VTkRFRkVSLCBjUHJvcGVydHksIFByb3BlcnR5U3RhdGVQaGFzZS5OT1RJRlkgKTtcclxuICAgIHByb3BlcnR5U3RhdGVIYW5kbGVyLnVucmVnaXN0ZXJPcmRlckRlcGVuZGVuY2llc0ZvclByb3BlcnR5KCBhUHJvcGVydHkgKTtcclxuICAgIGFzc2VydC5vayggcHJvcGVydHlTdGF0ZUhhbmRsZXJbICd1bmRlZmVyQmVmb3JlTm90aWZ5TWFwUGFpcicgXS5iZWZvcmVNYXAuc2l6ZSA9PT0gMCwgJ2VtcHR5IGVudHJpZXMgc2hvdWxkIGJlIGNsZWFyZWQnICk7XHJcblxyXG4gICAgcHJvcGVydHlTdGF0ZUhhbmRsZXIucmVnaXN0ZXJQaGV0aW9PcmRlckRlcGVuZGVuY3koIGFQcm9wZXJ0eSwgUHJvcGVydHlTdGF0ZVBoYXNlLlVOREVGRVIsIGJQcm9wZXJ0eSwgUHJvcGVydHlTdGF0ZVBoYXNlLk5PVElGWSApO1xyXG4gICAgcHJvcGVydHlTdGF0ZUhhbmRsZXIucmVnaXN0ZXJQaGV0aW9PcmRlckRlcGVuZGVuY3koIGFQcm9wZXJ0eSwgUHJvcGVydHlTdGF0ZVBoYXNlLlVOREVGRVIsIGNQcm9wZXJ0eSwgUHJvcGVydHlTdGF0ZVBoYXNlLk5PVElGWSApO1xyXG4gICAgcHJvcGVydHlTdGF0ZUhhbmRsZXIudW5yZWdpc3Rlck9yZGVyRGVwZW5kZW5jaWVzRm9yUHJvcGVydHkoIGJQcm9wZXJ0eSApO1xyXG4gICAgcHJvcGVydHlTdGF0ZUhhbmRsZXIudW5yZWdpc3Rlck9yZGVyRGVwZW5kZW5jaWVzRm9yUHJvcGVydHkoIGNQcm9wZXJ0eSApO1xyXG4gICAgYXNzZXJ0Lm9rKCBwcm9wZXJ0eVN0YXRlSGFuZGxlclsgJ3VuZGVmZXJCZWZvcmVOb3RpZnlNYXBQYWlyJyBdLmJlZm9yZU1hcC5zaXplID09PSAwLCAnZW1wdHkgZW50cmllcyBzaG91bGQgYmUgY2xlYXJlZCcgKTtcclxuXHJcbiAgICBhUHJvcGVydHkuZGlzcG9zZSgpO1xyXG4gICAgYlByb3BlcnR5LmRpc3Bvc2UoKTtcclxuICAgIGNQcm9wZXJ0eS5kaXNwb3NlKCk7XHJcbiAgfSApO1xyXG59Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsS0FBSyxNQUFNLHVCQUF1QjtBQUN6QyxPQUFPQyxNQUFNLE1B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