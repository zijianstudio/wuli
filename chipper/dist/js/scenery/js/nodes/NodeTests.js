// Copyright 2017-2023, University of Colorado Boulder

/**
 * Node tests
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import BooleanProperty from '../../../axon/js/BooleanProperty.js';
import Bounds2 from '../../../dot/js/Bounds2.js';
import Vector2 from '../../../dot/js/Vector2.js';
import { Shape } from '../../../kite/js/imports.js';
import Tandem from '../../../tandem/js/Tandem.js';
import Touch from '../input/Touch.js';
import Node from './Node.js';
import Rectangle from './Rectangle.js';
QUnit.module('Node');
function fakeTouchPointer(vector) {
  return new Touch(0, vector, {});
}
QUnit.test('Mouse and Touch areas', assert => {
  const node = new Node();
  const rect = new Rectangle(0, 0, 100, 50);
  rect.pickable = true;
  node.addChild(rect);
  assert.ok(!!rect.hitTest(new Vector2(10, 10)), 'Rectangle intersection');
  assert.ok(!!rect.hitTest(new Vector2(90, 10)), 'Rectangle intersection');
  assert.ok(!rect.hitTest(new Vector2(-10, 10)), 'Rectangle no intersection');
  node.touchArea = Shape.rectangle(-50, -50, 100, 100);
  assert.ok(!!node.hitTest(new Vector2(10, 10)), 'Node intersection');
  assert.ok(!!node.hitTest(new Vector2(90, 10)), 'Node intersection');
  assert.ok(!node.hitTest(new Vector2(-10, 10)), 'Node no intersection');
  assert.ok(!!node.trailUnderPointer(fakeTouchPointer(new Vector2(10, 10))), 'Node intersection (isTouch)');
  assert.ok(!!node.trailUnderPointer(fakeTouchPointer(new Vector2(90, 10))), 'Node intersection (isTouch)');
  assert.ok(!!node.trailUnderPointer(fakeTouchPointer(new Vector2(-10, 10))), 'Node intersection (isTouch)');
  node.clipArea = Shape.rectangle(0, 0, 50, 50);

  // points outside the clip area shouldn't register as hits
  assert.ok(!!node.trailUnderPointer(fakeTouchPointer(new Vector2(10, 10))), 'Node intersection (isTouch with clipArea)');
  assert.ok(!node.trailUnderPointer(fakeTouchPointer(new Vector2(90, 10))), 'Node no intersection (isTouch with clipArea)');
  assert.ok(!node.trailUnderPointer(fakeTouchPointer(new Vector2(-10, 10))), 'Node no intersection (isTouch with clipArea)');
});
const epsilon = 0.000000001;
QUnit.test('Points (parent and child)', assert => {
  const a = new Node();
  const b = new Node();
  a.addChild(b);
  a.x = 10;
  b.y = 10;
  assert.ok(new Vector2(5, 15).equalsEpsilon(b.localToParentPoint(new Vector2(5, 5)), epsilon), 'localToParentPoint on child');
  assert.ok(new Vector2(15, 5).equalsEpsilon(a.localToParentPoint(new Vector2(5, 5)), epsilon), 'localToParentPoint on root');
  assert.ok(new Vector2(5, -5).equalsEpsilon(b.parentToLocalPoint(new Vector2(5, 5)), epsilon), 'parentToLocalPoint on child');
  assert.ok(new Vector2(-5, 5).equalsEpsilon(a.parentToLocalPoint(new Vector2(5, 5)), epsilon), 'parentToLocalPoint on root');
  assert.ok(new Vector2(15, 15).equalsEpsilon(b.localToGlobalPoint(new Vector2(5, 5)), epsilon), 'localToGlobalPoint on child');
  assert.ok(new Vector2(15, 5).equalsEpsilon(a.localToGlobalPoint(new Vector2(5, 5)), epsilon), 'localToGlobalPoint on root (same as localToparent)');
  assert.ok(new Vector2(-5, -5).equalsEpsilon(b.globalToLocalPoint(new Vector2(5, 5)), epsilon), 'globalToLocalPoint on child');
  assert.ok(new Vector2(-5, 5).equalsEpsilon(a.globalToLocalPoint(new Vector2(5, 5)), epsilon), 'globalToLocalPoint on root (same as localToparent)');
  assert.ok(new Vector2(15, 5).equalsEpsilon(b.parentToGlobalPoint(new Vector2(5, 5)), epsilon), 'parentToGlobalPoint on child');
  assert.ok(new Vector2(5, 5).equalsEpsilon(a.parentToGlobalPoint(new Vector2(5, 5)), epsilon), 'parentToGlobalPoint on root');
  assert.ok(new Vector2(-5, 5).equalsEpsilon(b.globalToParentPoint(new Vector2(5, 5)), epsilon), 'globalToParentPoint on child');
  assert.ok(new Vector2(5, 5).equalsEpsilon(a.globalToParentPoint(new Vector2(5, 5)), epsilon), 'globalToParentPoint on root');
});
QUnit.test('Bounds (parent and child)', assert => {
  const a = new Node();
  const b = new Node();
  a.addChild(b);
  a.x = 10;
  b.y = 10;
  const bounds = new Bounds2(4, 4, 20, 30);
  assert.ok(new Bounds2(4, 14, 20, 40).equalsEpsilon(b.localToParentBounds(bounds), epsilon), 'localToParentBounds on child');
  assert.ok(new Bounds2(14, 4, 30, 30).equalsEpsilon(a.localToParentBounds(bounds), epsilon), 'localToParentBounds on root');
  assert.ok(new Bounds2(4, -6, 20, 20).equalsEpsilon(b.parentToLocalBounds(bounds), epsilon), 'parentToLocalBounds on child');
  assert.ok(new Bounds2(-6, 4, 10, 30).equalsEpsilon(a.parentToLocalBounds(bounds), epsilon), 'parentToLocalBounds on root');
  assert.ok(new Bounds2(14, 14, 30, 40).equalsEpsilon(b.localToGlobalBounds(bounds), epsilon), 'localToGlobalBounds on child');
  assert.ok(new Bounds2(14, 4, 30, 30).equalsEpsilon(a.localToGlobalBounds(bounds), epsilon), 'localToGlobalBounds on root (same as localToParent)');
  assert.ok(new Bounds2(-6, -6, 10, 20).equalsEpsilon(b.globalToLocalBounds(bounds), epsilon), 'globalToLocalBounds on child');
  assert.ok(new Bounds2(-6, 4, 10, 30).equalsEpsilon(a.globalToLocalBounds(bounds), epsilon), 'globalToLocalBounds on root (same as localToParent)');
  assert.ok(new Bounds2(14, 4, 30, 30).equalsEpsilon(b.parentToGlobalBounds(bounds), epsilon), 'parentToGlobalBounds on child');
  assert.ok(new Bounds2(4, 4, 20, 30).equalsEpsilon(a.parentToGlobalBounds(bounds), epsilon), 'parentToGlobalBounds on root');
  assert.ok(new Bounds2(-6, 4, 10, 30).equalsEpsilon(b.globalToParentBounds(bounds), epsilon), 'globalToParentBounds on child');
  assert.ok(new Bounds2(4, 4, 20, 30).equalsEpsilon(a.globalToParentBounds(bounds), epsilon), 'globalToParentBounds on root');
});
QUnit.test('Points (order of transforms)', assert => {
  const a = new Node();
  const b = new Node();
  const c = new Node();
  a.addChild(b);
  b.addChild(c);
  a.x = 10;
  b.scale(2);
  c.y = 10;
  assert.ok(new Vector2(20, 30).equalsEpsilon(c.localToGlobalPoint(new Vector2(5, 5)), epsilon), 'localToGlobalPoint');
  assert.ok(new Vector2(-2.5, -7.5).equalsEpsilon(c.globalToLocalPoint(new Vector2(5, 5)), epsilon), 'globalToLocalPoint');
  assert.ok(new Vector2(20, 10).equalsEpsilon(c.parentToGlobalPoint(new Vector2(5, 5)), epsilon), 'parentToGlobalPoint');
  assert.ok(new Vector2(-2.5, 2.5).equalsEpsilon(c.globalToParentPoint(new Vector2(5, 5)), epsilon), 'globalToParentPoint');
});
QUnit.test('Bounds (order of transforms)', assert => {
  const a = new Node();
  const b = new Node();
  const c = new Node();
  a.addChild(b);
  b.addChild(c);
  a.x = 10;
  b.scale(2);
  c.y = 10;
  const bounds = new Bounds2(4, 4, 20, 30);
  assert.ok(new Bounds2(18, 28, 50, 80).equalsEpsilon(c.localToGlobalBounds(bounds), epsilon), 'localToGlobalBounds');
  assert.ok(new Bounds2(-3, -8, 5, 5).equalsEpsilon(c.globalToLocalBounds(bounds), epsilon), 'globalToLocalBounds');
  assert.ok(new Bounds2(18, 8, 50, 60).equalsEpsilon(c.parentToGlobalBounds(bounds), epsilon), 'parentToGlobalBounds');
  assert.ok(new Bounds2(-3, 2, 5, 15).equalsEpsilon(c.globalToParentBounds(bounds), epsilon), 'globalToParentBounds');
});
QUnit.test('Trail and Node transform equivalence', assert => {
  const a = new Node();
  const b = new Node();
  const c = new Node();
  a.addChild(b);
  b.addChild(c);
  a.x = 10;
  b.scale(2);
  c.y = 10;
  const trailMatrix = c.getUniqueTrail().getMatrix();
  const nodeMatrix = c.getUniqueTransform().getMatrix();
  assert.ok(trailMatrix.equalsEpsilon(nodeMatrix, epsilon), 'Trail and Node transform equivalence');
});
QUnit.test('Mutually exclusive options', assert => {
  assert.ok(true, 'always true, even when assertions are not on.');
  const visibleProperty = new BooleanProperty(true);
  window.assert && assert.throws(() => {
    return new Node({
      visible: false,
      visibleProperty: visibleProperty
    });
  }, 'visible and visibleProperty values do not match');
  const pickableProperty = new BooleanProperty(true);
  window.assert && assert.throws(() => {
    return new Node({
      pickable: false,
      pickableProperty: pickableProperty
    });
  }, 'pickable and pickableProperty values do not match');
  const enabledProperty = new BooleanProperty(true);
  window.assert && assert.throws(() => {
    return new Node({
      enabled: false,
      enabledProperty: enabledProperty
    });
  }, 'enabled and enabledProperty values do not match');
  const inputEnabledProperty = new BooleanProperty(true);
  window.assert && assert.throws(() => {
    return new Node({
      inputEnabled: false,
      inputEnabledProperty: inputEnabledProperty
    });
  }, 'inputEnabled and inputEnabledProperty values do not match');
});
if (Tandem.PHET_IO_ENABLED) {
  QUnit.test('Node instrumented visibleProperty', assert => testInstrumentedNodeProperty(assert, 'visible', 'visibleProperty', 'setVisibleProperty', true, 'phetioVisiblePropertyInstrumented'));
  QUnit.test('Node instrumented enabledProperty', assert => testInstrumentedNodeProperty(assert, 'enabled', 'enabledProperty', 'setEnabledProperty', Node.DEFAULT_NODE_OPTIONS.phetioEnabledPropertyInstrumented, 'phetioEnabledPropertyInstrumented'));
  QUnit.test('Node instrumented inputEnabledProperty', assert => testInstrumentedNodeProperty(assert, 'inputEnabled', 'inputEnabledProperty', 'setInputEnabledProperty', Node.DEFAULT_NODE_OPTIONS.phetioInputEnabledPropertyInstrumented, 'phetioInputEnabledPropertyInstrumented'));

  /**
   * Factor out a way to test added Properties to Node and their PhET-iO instrumentation
   * @param assert - from qunit test
   * @param nodeField - name of getter/setter, like `visible`
   * @param nodeProperty - name of public property, like `visibleProperty`
   * @param nodePropertySetter - name of setter function, like `setVisibleProperty`
   * @param ownedPropertyInstrumented - default value of phetioNodePropertyInstrumentedKeyName option in Node.
   * @param phetioNodePropertyInstrumentedKeyName - key name for setting opt-in PhET-iO instrumentation
   */
  const testInstrumentedNodeProperty = (assert, nodeField, nodeProperty, nodePropertySetter, ownedPropertyInstrumented, phetioNodePropertyInstrumentedKeyName) => {
    const apiValidation = phet.tandem.phetioAPIValidation;
    const previousAPIValidationEnabled = apiValidation.enabled;
    const previousSimStarted = apiValidation.simHasStarted;
    apiValidation.simHasStarted = false;
    const testNodeAndProperty = (node, property) => {
      const initialValue = node[nodeField];
      assert.ok(property.value === node[nodeField], 'initial values should be the same');
      // @ts-expect-error - no sure now to do this well in typescript
      node[nodeField] = !initialValue;
      assert.ok(property.value === !initialValue, 'property should reflect node change');
      property.value = initialValue;
      assert.ok(node[nodeField] === initialValue, 'node should reflect property change');

      // @ts-expect-error - no sure now to do this well in typescript
      node[nodeField] = initialValue;
    };
    const instrumentedProperty = new BooleanProperty(false, {
      tandem: Tandem.ROOT_TEST.createTandem(`${nodeField}MyProperty`)
    });
    const otherInstrumentedProperty = new BooleanProperty(false, {
      tandem: Tandem.ROOT_TEST.createTandem(`${nodeField}MyOtherProperty`)
    });
    const uninstrumentedProperty = new BooleanProperty(false);

    /***************************************
     /* Testing uninstrumented Nodes
     */

    // uninstrumentedNode => no property (before startup)
    let uninstrumented = new Node();
    // @ts-expect-error - no sure now to do this well in typescript
    assert.ok(uninstrumented[nodeProperty]['targetProperty'] === undefined);
    // @ts-expect-error - no sure now to do this well in typescript
    testNodeAndProperty(uninstrumented, uninstrumented[nodeProperty]);

    // uninstrumentedNode => uninstrumented property (before startup)
    uninstrumented = new Node({
      [nodeProperty]: uninstrumentedProperty
    });
    // @ts-expect-error - no sure now to do this well in typescript
    assert.ok(uninstrumented[nodeProperty]['targetProperty'] === uninstrumentedProperty);
    testNodeAndProperty(uninstrumented, uninstrumentedProperty);

    //uninstrumentedNode => instrumented property (before startup)
    uninstrumented = new Node();
    uninstrumented.mutate({
      [nodeProperty]: instrumentedProperty
    });
    // @ts-expect-error - no sure now to do this well in typescript
    assert.ok(uninstrumented[nodeProperty]['targetProperty'] === instrumentedProperty);
    testNodeAndProperty(uninstrumented, instrumentedProperty);

    //  uninstrumentedNode => instrumented property => instrument the Node (before startup) OK
    uninstrumented = new Node();
    uninstrumented.mutate({
      [nodeProperty]: instrumentedProperty
    });
    uninstrumented.mutate({
      tandem: Tandem.ROOT_TEST.createTandem(`${nodeField}MyNode`)
    });
    // @ts-expect-error - no sure now to do this well in typescript
    assert.ok(uninstrumented[nodeProperty]['targetProperty'] === instrumentedProperty);
    testNodeAndProperty(uninstrumented, instrumentedProperty);
    uninstrumented.dispose();

    //////////////////////////////////////////////////
    apiValidation.simHasStarted = true;

    // uninstrumentedNode => no property (before startup)
    uninstrumented = new Node();
    // @ts-expect-error - no sure now to do this well in typescript
    assert.ok(uninstrumented[nodeProperty]['targetProperty'] === undefined);
    // @ts-expect-error - no sure now to do this well in typescript
    testNodeAndProperty(uninstrumented, uninstrumented[nodeProperty]);

    // uninstrumentedNode => uninstrumented property (before startup)
    uninstrumented = new Node({
      [nodeProperty]: uninstrumentedProperty
    });
    // @ts-expect-error - no sure now to do this well in typescript
    assert.ok(uninstrumented[nodeProperty]['targetProperty'] === uninstrumentedProperty);
    testNodeAndProperty(uninstrumented, uninstrumentedProperty);

    //uninstrumentedNode => instrumented property (before startup)
    uninstrumented = new Node();
    uninstrumented.mutate({
      [nodeProperty]: instrumentedProperty
    });
    // @ts-expect-error - no sure now to do this well in typescript
    assert.ok(uninstrumented[nodeProperty]['targetProperty'] === instrumentedProperty);
    testNodeAndProperty(uninstrumented, instrumentedProperty);

    //  uninstrumentedNode => instrumented property => instrument the Node (before startup) OK
    uninstrumented = new Node();
    uninstrumented.mutate({
      [nodeProperty]: instrumentedProperty
    });
    uninstrumented.mutate({
      tandem: Tandem.ROOT_TEST.createTandem(`${nodeField}MyNode`)
    });
    // @ts-expect-error - no sure now to do this well in typescript
    assert.ok(uninstrumented[nodeProperty]['targetProperty'] === instrumentedProperty);
    testNodeAndProperty(uninstrumented, instrumentedProperty);
    uninstrumented.dispose();
    apiValidation.simHasStarted = false;

    /***************************************
     /* Testing instrumented nodes
     */

    // instrumentedNodeWithDefaultInstrumentedProperty => instrumented property (before startup)
    let instrumented = new Node({
      tandem: Tandem.ROOT_TEST.createTandem(`${nodeField}MyNode`),
      [phetioNodePropertyInstrumentedKeyName]: true
    });
    // @ts-expect-error - no sure now to do this well in typescript
    assert.ok(instrumented[nodeProperty]['targetProperty'] === instrumented[nodeProperty].ownedPhetioProperty);
    // @ts-expect-error - no sure now to do this well in typescript
    assert.ok(instrumented['linkedElements'].length === 0, `no linked elements for default ${nodeProperty}`);
    // @ts-expect-error - no sure now to do this well in typescript
    testNodeAndProperty(instrumented, instrumented[nodeProperty]);
    instrumented.dispose();

    // instrumentedNodeWithDefaultInstrumentedProperty => uninstrumented property (before startup)
    instrumented = new Node({
      tandem: Tandem.ROOT_TEST.createTandem(`${nodeField}MyNode`),
      [phetioNodePropertyInstrumentedKeyName]: true
    });
    // @ts-expect-error - no sure now to do this well in typescript
    instrumented.hasOwnProperty('phetioNodePropertyInstrumentedKeyName') && assert.ok(instrumented[phetioNodePropertyInstrumentedKeyName] === true, 'getter should work');
    window.assert && assert.throws(() => {
      instrumented.mutate({
        [nodeProperty]: uninstrumentedProperty
      });
    }, `cannot remove instrumentation from the Node's ${nodeProperty}`);
    instrumented.dispose();

    // instrumentedNodeWithPassedInInstrumentedProperty => instrumented property (before startup)
    instrumented = new Node({
      tandem: Tandem.ROOT_TEST.createTandem(`${nodeField}MyNode`),
      [phetioNodePropertyInstrumentedKeyName]: true
    });
    instrumented.mutate({
      [nodeProperty]: instrumentedProperty
    });
    // @ts-expect-error - no sure now to do this well in typescript
    assert.ok(instrumented[nodeProperty]['targetProperty'] === instrumentedProperty);
    // @ts-expect-error - no sure now to do this well in typescript
    assert.ok(instrumented['linkedElements'].length === 1, 'added linked element');
    // @ts-expect-error - no sure now to do this well in typescript
    assert.ok(instrumented['linkedElements'][0].element === instrumentedProperty, `added linked element should be for ${nodeProperty}`);
    testNodeAndProperty(instrumented, instrumentedProperty);
    instrumented.dispose();
    instrumented = new Node({
      tandem: Tandem.ROOT_TEST.createTandem(`${nodeField}MyNode`),
      [nodeProperty]: instrumentedProperty
    });
    // @ts-expect-error - no sure now to do this well in typescript
    assert.ok(instrumented[nodeProperty]['targetProperty'] === instrumentedProperty);
    // @ts-expect-error - no sure now to do this well in typescript
    assert.ok(instrumented['linkedElements'].length === 1, 'added linked element');
    // @ts-expect-error - no sure now to do this well in typescript
    assert.ok(instrumented['linkedElements'][0].element === instrumentedProperty, `added linked element should be for ${nodeProperty}`);
    testNodeAndProperty(instrumented, instrumentedProperty);
    instrumented.dispose();

    // instrumentedNodeWithPassedInInstrumentedProperty => uninstrumented property (before startup)
    instrumented = new Node({
      tandem: Tandem.ROOT_TEST.createTandem(`${nodeField}MyNode`),
      [nodeProperty]: instrumentedProperty
    });
    window.assert && assert.throws(() => {
      instrumented.mutate({
        [nodeProperty]: uninstrumentedProperty
      });
    }, `cannot remove instrumentation from the Node's ${nodeProperty}`);
    instrumented.dispose();
    instrumented = new Node({
      tandem: Tandem.ROOT_TEST.createTandem(`${nodeField}MyNode`)
    });
    instrumented.mutate({
      [nodeProperty]: instrumentedProperty
    });
    window.assert && assert.throws(() => {
      instrumented.mutate({
        [nodeProperty]: uninstrumentedProperty
      });
    }, `cannot remove instrumentation from the Node's ${nodeProperty}`);
    instrumented.dispose();
    apiValidation.enabled = true;
    apiValidation.simHasStarted = true;
    // instrumentedNodeWithDefaultInstrumentedProperty => instrumented property (after startup)
    const instrumented1 = new Node({
      tandem: Tandem.ROOT_TEST.createTandem(`${nodeField}MyUniquelyNamedNodeThatWillNotBeDuplicated1`),
      [phetioNodePropertyInstrumentedKeyName]: true
    });
    // @ts-expect-error - no sure now to do this well in typescript
    assert.ok(instrumented1[nodeProperty]['targetProperty'] === instrumented1[nodeProperty].ownedPhetioProperty);
    // @ts-expect-error - no sure now to do this well in typescript
    assert.ok(instrumented1['linkedElements'].length === 0, `no linked elements for default ${nodeProperty}`);
    // @ts-expect-error - no sure now to do this well in typescript
    testNodeAndProperty(instrumented1, instrumented1[nodeProperty]);

    // instrumentedNodeWithDefaultInstrumentedProperty => uninstrumented property (after startup)
    const instrumented2 = new Node({
      tandem: Tandem.ROOT_TEST.createTandem(`${nodeField}MyUniquelyNamedNodeThatWillNotBeDuplicated2`),
      [phetioNodePropertyInstrumentedKeyName]: true
    });
    window.assert && assert.throws(() => {
      // @ts-expect-error - no sure now to do this well in typescript
      instrumented2[nodePropertySetter](uninstrumentedProperty);
    }, `cannot remove instrumentation from the Node's ${nodeProperty}`);

    // instrumentedNodeWithPassedInInstrumentedProperty => instrumented property (after startup)
    const instrumented3 = new Node({
      tandem: Tandem.ROOT_TEST.createTandem(`${nodeField}MyUniquelyNamedNodeThatWillNotBeDuplicated3`),
      [nodeProperty]: instrumentedProperty
    });
    window.assert && assert.throws(() => {
      instrumented3.mutate({
        [nodeProperty]: otherInstrumentedProperty
      });
    }, 'cannot swap out one instrumented for another');

    // instrumentedNodeWithPassedInInstrumentedProperty => uninstrumented property (after startup)
    const instrumented4 = new Node({
      tandem: Tandem.ROOT_TEST.createTandem(`${nodeField}MyUniquelyNamedNodeThatWillNotBeDuplicated4`),
      [nodeProperty]: instrumentedProperty
    });
    window.assert && assert.throws(() => {
      instrumented4.mutate({
        [nodeProperty]: uninstrumentedProperty
      });
    }, `cannot remove instrumentation from the Node's ${nodeProperty}`);
    const instrumented5 = new Node({});
    instrumented5.mutate({
      [nodeProperty]: instrumentedProperty
    });
    instrumented5.mutate({
      tandem: Tandem.ROOT_TEST.createTandem(`${nodeField}MyUniquelyNamedNodeThatWillNotBeDuplicated5`)
    });
    window.assert && assert.throws(() => {
      instrumented5.mutate({
        [nodeProperty]: uninstrumentedProperty
      });
    }, `cannot remove instrumentation from the Node's ${nodeProperty}`);
    apiValidation.enabled = false;
    apiValidation.enabled = true;
    apiValidation.simHasStarted = false;

    // instrumentedNodeOptsOutOfDefault => instrumented Property set later (but before startup)
    const instrumented6 = new Node({
      tandem: Tandem.ROOT_TEST.createTandem(`${nodeField}MyNode6`),
      [phetioNodePropertyInstrumentedKeyName]: false // required when passing in an instrumented one later
    });

    // @ts-expect-error - no sure now to do this well in typescript
    instrumented6[nodeProperty] = new BooleanProperty(false, {
      tandem: Tandem.ROOT_TEST.createTandem(`${nodeField}MyBooleanProperty`)
    });
    apiValidation.enabled = false;
    instrumented6.dispose();
    instrumented1.dispose();

    // These can't be disposed because they were broken while creating (on purpose in an assert.throws()). These elements
    // have special Tandem component names to make sure that they don't interfere with other tests (since they can't be
    // removed from the registry
    // instrumented2.dispose();
    // instrumented3.dispose();
    // instrumented4.dispose();
    // instrumented5.dispose();

    instrumented = new Node({
      tandem: Tandem.ROOT_TEST.createTandem(`${nodeField}MyNode`),
      [phetioNodePropertyInstrumentedKeyName]: true
    });
    window.assert && assert.throws(() => {
      // @ts-expect-error - no sure now to do this well in typescript
      instrumented[nodePropertySetter](null);
    }, `cannot clear out an instrumented ${nodeProperty}`);
    instrumented.dispose();

    // If by default this property isn't instrumented, then this should cause an error
    if (!ownedPropertyInstrumented) {
      instrumented = new Node({
        tandem: Tandem.ROOT_TEST.createTandem(`${nodeField}MyNode`)
      });
      window.assert && assert.throws(() => {
        // @ts-expect-error - no sure now to do this well in typescript
        instrumented[phetioNodePropertyInstrumentedKeyName] = true;
      }, `cannot set ${phetioNodePropertyInstrumentedKeyName} after instrumentation`);
      instrumented.dispose();
    }
    instrumentedProperty.dispose();
    otherInstrumentedProperty.dispose();
    apiValidation.simHasStarted = previousSimStarted;
    apiValidation.enabled = previousAPIValidationEnabled;
  };
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJCb29sZWFuUHJvcGVydHkiLCJCb3VuZHMyIiwiVmVjdG9yMiIsIlNoYXBlIiwiVGFuZGVtIiwiVG91Y2giLCJOb2RlIiwiUmVjdGFuZ2xlIiwiUVVuaXQiLCJtb2R1bGUiLCJmYWtlVG91Y2hQb2ludGVyIiwidmVjdG9yIiwidGVzdCIsImFzc2VydCIsIm5vZGUiLCJyZWN0IiwicGlja2FibGUiLCJhZGRDaGlsZCIsIm9rIiwiaGl0VGVzdCIsInRvdWNoQXJlYSIsInJlY3RhbmdsZSIsInRyYWlsVW5kZXJQb2ludGVyIiwiY2xpcEFyZWEiLCJlcHNpbG9uIiwiYSIsImIiLCJ4IiwieSIsImVxdWFsc0Vwc2lsb24iLCJsb2NhbFRvUGFyZW50UG9pbnQiLCJwYXJlbnRUb0xvY2FsUG9pbnQiLCJsb2NhbFRvR2xvYmFsUG9pbnQiLCJnbG9iYWxUb0xvY2FsUG9pbnQiLCJwYXJlbnRUb0dsb2JhbFBvaW50IiwiZ2xvYmFsVG9QYXJlbnRQb2ludCIsImJvdW5kcyIsImxvY2FsVG9QYXJlbnRCb3VuZHMiLCJwYXJlbnRUb0xvY2FsQm91bmRzIiwibG9jYWxUb0dsb2JhbEJvdW5kcyIsImdsb2JhbFRvTG9jYWxCb3VuZHMiLCJwYXJlbnRUb0dsb2JhbEJvdW5kcyIsImdsb2JhbFRvUGFyZW50Qm91bmRzIiwiYyIsInNjYWxlIiwidHJhaWxNYXRyaXgiLCJnZXRVbmlxdWVUcmFpbCIsImdldE1hdHJpeCIsIm5vZGVNYXRyaXgiLCJnZXRVbmlxdWVUcmFuc2Zvcm0iLCJ2aXNpYmxlUHJvcGVydHkiLCJ3aW5kb3ciLCJ0aHJvd3MiLCJ2aXNpYmxlIiwicGlja2FibGVQcm9wZXJ0eSIsImVuYWJsZWRQcm9wZXJ0eSIsImVuYWJsZWQiLCJpbnB1dEVuYWJsZWRQcm9wZXJ0eSIsImlucHV0RW5hYmxlZCIsIlBIRVRfSU9fRU5BQkxFRCIsInRlc3RJbnN0cnVtZW50ZWROb2RlUHJvcGVydHkiLCJERUZBVUxUX05PREVfT1BUSU9OUyIsInBoZXRpb0VuYWJsZWRQcm9wZXJ0eUluc3RydW1lbnRlZCIsInBoZXRpb0lucHV0RW5hYmxlZFByb3BlcnR5SW5zdHJ1bWVudGVkIiwibm9kZUZpZWxkIiwibm9kZVByb3BlcnR5Iiwibm9kZVByb3BlcnR5U2V0dGVyIiwib3duZWRQcm9wZXJ0eUluc3RydW1lbnRlZCIsInBoZXRpb05vZGVQcm9wZXJ0eUluc3RydW1lbnRlZEtleU5hbWUiLCJhcGlWYWxpZGF0aW9uIiwicGhldCIsInRhbmRlbSIsInBoZXRpb0FQSVZhbGlkYXRpb24iLCJwcmV2aW91c0FQSVZhbGlkYXRpb25FbmFibGVkIiwicHJldmlvdXNTaW1TdGFydGVkIiwic2ltSGFzU3RhcnRlZCIsInRlc3ROb2RlQW5kUHJvcGVydHkiLCJwcm9wZXJ0eSIsImluaXRpYWxWYWx1ZSIsInZhbHVlIiwiaW5zdHJ1bWVudGVkUHJvcGVydHkiLCJST09UX1RFU1QiLCJjcmVhdGVUYW5kZW0iLCJvdGhlckluc3RydW1lbnRlZFByb3BlcnR5IiwidW5pbnN0cnVtZW50ZWRQcm9wZXJ0eSIsInVuaW5zdHJ1bWVudGVkIiwidW5kZWZpbmVkIiwibXV0YXRlIiwiZGlzcG9zZSIsImluc3RydW1lbnRlZCIsIm93bmVkUGhldGlvUHJvcGVydHkiLCJsZW5ndGgiLCJoYXNPd25Qcm9wZXJ0eSIsImVsZW1lbnQiLCJpbnN0cnVtZW50ZWQxIiwiaW5zdHJ1bWVudGVkMiIsImluc3RydW1lbnRlZDMiLCJpbnN0cnVtZW50ZWQ0IiwiaW5zdHJ1bWVudGVkNSIsImluc3RydW1lbnRlZDYiXSwic291cmNlcyI6WyJOb2RlVGVzdHMudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTctMjAyMywgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogTm9kZSB0ZXN0c1xyXG4gKlxyXG4gKiBAYXV0aG9yIFNhbSBSZWlkIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxyXG4gKi9cclxuXHJcbmltcG9ydCBCb29sZWFuUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vYXhvbi9qcy9Cb29sZWFuUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgVFByb3BlcnR5IGZyb20gJy4uLy4uLy4uL2F4b24vanMvVFByb3BlcnR5LmpzJztcclxuaW1wb3J0IEJvdW5kczIgZnJvbSAnLi4vLi4vLi4vZG90L2pzL0JvdW5kczIuanMnO1xyXG5pbXBvcnQgVmVjdG9yMiBmcm9tICcuLi8uLi8uLi9kb3QvanMvVmVjdG9yMi5qcyc7XHJcbmltcG9ydCB7IFNoYXBlIH0gZnJvbSAnLi4vLi4vLi4va2l0ZS9qcy9pbXBvcnRzLmpzJztcclxuaW1wb3J0IEludGVudGlvbmFsQW55IGZyb20gJy4uLy4uLy4uL3BoZXQtY29yZS9qcy90eXBlcy9JbnRlbnRpb25hbEFueS5qcyc7XHJcbmltcG9ydCBUYW5kZW0gZnJvbSAnLi4vLi4vLi4vdGFuZGVtL2pzL1RhbmRlbS5qcyc7XHJcbmltcG9ydCBUb3VjaCBmcm9tICcuLi9pbnB1dC9Ub3VjaC5qcyc7XHJcbmltcG9ydCBOb2RlIGZyb20gJy4vTm9kZS5qcyc7XHJcbmltcG9ydCBSZWN0YW5nbGUgZnJvbSAnLi9SZWN0YW5nbGUuanMnO1xyXG5cclxuUVVuaXQubW9kdWxlKCAnTm9kZScgKTtcclxuXHJcbmZ1bmN0aW9uIGZha2VUb3VjaFBvaW50ZXIoIHZlY3RvcjogVmVjdG9yMiApOiBUb3VjaCB7XHJcbiAgcmV0dXJuIG5ldyBUb3VjaCggMCwgdmVjdG9yLCB7fSBhcyBFdmVudCApO1xyXG59XHJcblxyXG5RVW5pdC50ZXN0KCAnTW91c2UgYW5kIFRvdWNoIGFyZWFzJywgYXNzZXJ0ID0+IHtcclxuICBjb25zdCBub2RlID0gbmV3IE5vZGUoKTtcclxuICBjb25zdCByZWN0ID0gbmV3IFJlY3RhbmdsZSggMCwgMCwgMTAwLCA1MCApO1xyXG4gIHJlY3QucGlja2FibGUgPSB0cnVlO1xyXG5cclxuICBub2RlLmFkZENoaWxkKCByZWN0ICk7XHJcblxyXG4gIGFzc2VydC5vayggISFyZWN0LmhpdFRlc3QoIG5ldyBWZWN0b3IyKCAxMCwgMTAgKSApLCAnUmVjdGFuZ2xlIGludGVyc2VjdGlvbicgKTtcclxuICBhc3NlcnQub2soICEhcmVjdC5oaXRUZXN0KCBuZXcgVmVjdG9yMiggOTAsIDEwICkgKSwgJ1JlY3RhbmdsZSBpbnRlcnNlY3Rpb24nICk7XHJcbiAgYXNzZXJ0Lm9rKCAhcmVjdC5oaXRUZXN0KCBuZXcgVmVjdG9yMiggLTEwLCAxMCApICksICdSZWN0YW5nbGUgbm8gaW50ZXJzZWN0aW9uJyApO1xyXG5cclxuICBub2RlLnRvdWNoQXJlYSA9IFNoYXBlLnJlY3RhbmdsZSggLTUwLCAtNTAsIDEwMCwgMTAwICk7XHJcblxyXG4gIGFzc2VydC5vayggISFub2RlLmhpdFRlc3QoIG5ldyBWZWN0b3IyKCAxMCwgMTAgKSApLCAnTm9kZSBpbnRlcnNlY3Rpb24nICk7XHJcbiAgYXNzZXJ0Lm9rKCAhIW5vZGUuaGl0VGVzdCggbmV3IFZlY3RvcjIoIDkwLCAxMCApICksICdOb2RlIGludGVyc2VjdGlvbicgKTtcclxuICBhc3NlcnQub2soICFub2RlLmhpdFRlc3QoIG5ldyBWZWN0b3IyKCAtMTAsIDEwICkgKSwgJ05vZGUgbm8gaW50ZXJzZWN0aW9uJyApO1xyXG5cclxuICBhc3NlcnQub2soICEhbm9kZS50cmFpbFVuZGVyUG9pbnRlciggZmFrZVRvdWNoUG9pbnRlciggbmV3IFZlY3RvcjIoIDEwLCAxMCApICkgKSwgJ05vZGUgaW50ZXJzZWN0aW9uIChpc1RvdWNoKScgKTtcclxuICBhc3NlcnQub2soICEhbm9kZS50cmFpbFVuZGVyUG9pbnRlciggZmFrZVRvdWNoUG9pbnRlciggbmV3IFZlY3RvcjIoIDkwLCAxMCApICkgKSwgJ05vZGUgaW50ZXJzZWN0aW9uIChpc1RvdWNoKScgKTtcclxuICBhc3NlcnQub2soICEhbm9kZS50cmFpbFVuZGVyUG9pbnRlciggZmFrZVRvdWNoUG9pbnRlciggbmV3IFZlY3RvcjIoIC0xMCwgMTAgKSApICksICdOb2RlIGludGVyc2VjdGlvbiAoaXNUb3VjaCknICk7XHJcblxyXG4gIG5vZGUuY2xpcEFyZWEgPSBTaGFwZS5yZWN0YW5nbGUoIDAsIDAsIDUwLCA1MCApO1xyXG5cclxuICAvLyBwb2ludHMgb3V0c2lkZSB0aGUgY2xpcCBhcmVhIHNob3VsZG4ndCByZWdpc3RlciBhcyBoaXRzXHJcbiAgYXNzZXJ0Lm9rKCAhIW5vZGUudHJhaWxVbmRlclBvaW50ZXIoIGZha2VUb3VjaFBvaW50ZXIoIG5ldyBWZWN0b3IyKCAxMCwgMTAgKSApICksICdOb2RlIGludGVyc2VjdGlvbiAoaXNUb3VjaCB3aXRoIGNsaXBBcmVhKScgKTtcclxuICBhc3NlcnQub2soICFub2RlLnRyYWlsVW5kZXJQb2ludGVyKCBmYWtlVG91Y2hQb2ludGVyKCBuZXcgVmVjdG9yMiggOTAsIDEwICkgKSApLCAnTm9kZSBubyBpbnRlcnNlY3Rpb24gKGlzVG91Y2ggd2l0aCBjbGlwQXJlYSknICk7XHJcbiAgYXNzZXJ0Lm9rKCAhbm9kZS50cmFpbFVuZGVyUG9pbnRlciggZmFrZVRvdWNoUG9pbnRlciggbmV3IFZlY3RvcjIoIC0xMCwgMTAgKSApICksICdOb2RlIG5vIGludGVyc2VjdGlvbiAoaXNUb3VjaCB3aXRoIGNsaXBBcmVhKScgKTtcclxufSApO1xyXG5cclxuXHJcbmNvbnN0IGVwc2lsb24gPSAwLjAwMDAwMDAwMTtcclxuXHJcblFVbml0LnRlc3QoICdQb2ludHMgKHBhcmVudCBhbmQgY2hpbGQpJywgYXNzZXJ0ID0+IHtcclxuICBjb25zdCBhID0gbmV3IE5vZGUoKTtcclxuICBjb25zdCBiID0gbmV3IE5vZGUoKTtcclxuICBhLmFkZENoaWxkKCBiICk7XHJcbiAgYS54ID0gMTA7XHJcbiAgYi55ID0gMTA7XHJcblxyXG4gIGFzc2VydC5vayggbmV3IFZlY3RvcjIoIDUsIDE1ICkuZXF1YWxzRXBzaWxvbiggYi5sb2NhbFRvUGFyZW50UG9pbnQoIG5ldyBWZWN0b3IyKCA1LCA1ICkgKSwgZXBzaWxvbiApLCAnbG9jYWxUb1BhcmVudFBvaW50IG9uIGNoaWxkJyApO1xyXG4gIGFzc2VydC5vayggbmV3IFZlY3RvcjIoIDE1LCA1ICkuZXF1YWxzRXBzaWxvbiggYS5sb2NhbFRvUGFyZW50UG9pbnQoIG5ldyBWZWN0b3IyKCA1LCA1ICkgKSwgZXBzaWxvbiApLCAnbG9jYWxUb1BhcmVudFBvaW50IG9uIHJvb3QnICk7XHJcblxyXG4gIGFzc2VydC5vayggbmV3IFZlY3RvcjIoIDUsIC01ICkuZXF1YWxzRXBzaWxvbiggYi5wYXJlbnRUb0xvY2FsUG9pbnQoIG5ldyBWZWN0b3IyKCA1LCA1ICkgKSwgZXBzaWxvbiApLCAncGFyZW50VG9Mb2NhbFBvaW50IG9uIGNoaWxkJyApO1xyXG4gIGFzc2VydC5vayggbmV3IFZlY3RvcjIoIC01LCA1ICkuZXF1YWxzRXBzaWxvbiggYS5wYXJlbnRUb0xvY2FsUG9pbnQoIG5ldyBWZWN0b3IyKCA1LCA1ICkgKSwgZXBzaWxvbiApLCAncGFyZW50VG9Mb2NhbFBvaW50IG9uIHJvb3QnICk7XHJcblxyXG4gIGFzc2VydC5vayggbmV3IFZlY3RvcjIoIDE1LCAxNSApLmVxdWFsc0Vwc2lsb24oIGIubG9jYWxUb0dsb2JhbFBvaW50KCBuZXcgVmVjdG9yMiggNSwgNSApICksIGVwc2lsb24gKSwgJ2xvY2FsVG9HbG9iYWxQb2ludCBvbiBjaGlsZCcgKTtcclxuICBhc3NlcnQub2soIG5ldyBWZWN0b3IyKCAxNSwgNSApLmVxdWFsc0Vwc2lsb24oIGEubG9jYWxUb0dsb2JhbFBvaW50KCBuZXcgVmVjdG9yMiggNSwgNSApICksIGVwc2lsb24gKSwgJ2xvY2FsVG9HbG9iYWxQb2ludCBvbiByb290IChzYW1lIGFzIGxvY2FsVG9wYXJlbnQpJyApO1xyXG5cclxuICBhc3NlcnQub2soIG5ldyBWZWN0b3IyKCAtNSwgLTUgKS5lcXVhbHNFcHNpbG9uKCBiLmdsb2JhbFRvTG9jYWxQb2ludCggbmV3IFZlY3RvcjIoIDUsIDUgKSApLCBlcHNpbG9uICksICdnbG9iYWxUb0xvY2FsUG9pbnQgb24gY2hpbGQnICk7XHJcbiAgYXNzZXJ0Lm9rKCBuZXcgVmVjdG9yMiggLTUsIDUgKS5lcXVhbHNFcHNpbG9uKCBhLmdsb2JhbFRvTG9jYWxQb2ludCggbmV3IFZlY3RvcjIoIDUsIDUgKSApLCBlcHNpbG9uICksICdnbG9iYWxUb0xvY2FsUG9pbnQgb24gcm9vdCAoc2FtZSBhcyBsb2NhbFRvcGFyZW50KScgKTtcclxuXHJcbiAgYXNzZXJ0Lm9rKCBuZXcgVmVjdG9yMiggMTUsIDUgKS5lcXVhbHNFcHNpbG9uKCBiLnBhcmVudFRvR2xvYmFsUG9pbnQoIG5ldyBWZWN0b3IyKCA1LCA1ICkgKSwgZXBzaWxvbiApLCAncGFyZW50VG9HbG9iYWxQb2ludCBvbiBjaGlsZCcgKTtcclxuICBhc3NlcnQub2soIG5ldyBWZWN0b3IyKCA1LCA1ICkuZXF1YWxzRXBzaWxvbiggYS5wYXJlbnRUb0dsb2JhbFBvaW50KCBuZXcgVmVjdG9yMiggNSwgNSApICksIGVwc2lsb24gKSwgJ3BhcmVudFRvR2xvYmFsUG9pbnQgb24gcm9vdCcgKTtcclxuXHJcbiAgYXNzZXJ0Lm9rKCBuZXcgVmVjdG9yMiggLTUsIDUgKS5lcXVhbHNFcHNpbG9uKCBiLmdsb2JhbFRvUGFyZW50UG9pbnQoIG5ldyBWZWN0b3IyKCA1LCA1ICkgKSwgZXBzaWxvbiApLCAnZ2xvYmFsVG9QYXJlbnRQb2ludCBvbiBjaGlsZCcgKTtcclxuICBhc3NlcnQub2soIG5ldyBWZWN0b3IyKCA1LCA1ICkuZXF1YWxzRXBzaWxvbiggYS5nbG9iYWxUb1BhcmVudFBvaW50KCBuZXcgVmVjdG9yMiggNSwgNSApICksIGVwc2lsb24gKSwgJ2dsb2JhbFRvUGFyZW50UG9pbnQgb24gcm9vdCcgKTtcclxuXHJcbn0gKTtcclxuXHJcblFVbml0LnRlc3QoICdCb3VuZHMgKHBhcmVudCBhbmQgY2hpbGQpJywgYXNzZXJ0ID0+IHtcclxuICBjb25zdCBhID0gbmV3IE5vZGUoKTtcclxuICBjb25zdCBiID0gbmV3IE5vZGUoKTtcclxuICBhLmFkZENoaWxkKCBiICk7XHJcbiAgYS54ID0gMTA7XHJcbiAgYi55ID0gMTA7XHJcblxyXG4gIGNvbnN0IGJvdW5kcyA9IG5ldyBCb3VuZHMyKCA0LCA0LCAyMCwgMzAgKTtcclxuXHJcbiAgYXNzZXJ0Lm9rKCBuZXcgQm91bmRzMiggNCwgMTQsIDIwLCA0MCApLmVxdWFsc0Vwc2lsb24oIGIubG9jYWxUb1BhcmVudEJvdW5kcyggYm91bmRzICksIGVwc2lsb24gKSwgJ2xvY2FsVG9QYXJlbnRCb3VuZHMgb24gY2hpbGQnICk7XHJcbiAgYXNzZXJ0Lm9rKCBuZXcgQm91bmRzMiggMTQsIDQsIDMwLCAzMCApLmVxdWFsc0Vwc2lsb24oIGEubG9jYWxUb1BhcmVudEJvdW5kcyggYm91bmRzICksIGVwc2lsb24gKSwgJ2xvY2FsVG9QYXJlbnRCb3VuZHMgb24gcm9vdCcgKTtcclxuXHJcbiAgYXNzZXJ0Lm9rKCBuZXcgQm91bmRzMiggNCwgLTYsIDIwLCAyMCApLmVxdWFsc0Vwc2lsb24oIGIucGFyZW50VG9Mb2NhbEJvdW5kcyggYm91bmRzICksIGVwc2lsb24gKSwgJ3BhcmVudFRvTG9jYWxCb3VuZHMgb24gY2hpbGQnICk7XHJcbiAgYXNzZXJ0Lm9rKCBuZXcgQm91bmRzMiggLTYsIDQsIDEwLCAzMCApLmVxdWFsc0Vwc2lsb24oIGEucGFyZW50VG9Mb2NhbEJvdW5kcyggYm91bmRzICksIGVwc2lsb24gKSwgJ3BhcmVudFRvTG9jYWxCb3VuZHMgb24gcm9vdCcgKTtcclxuXHJcbiAgYXNzZXJ0Lm9rKCBuZXcgQm91bmRzMiggMTQsIDE0LCAzMCwgNDAgKS5lcXVhbHNFcHNpbG9uKCBiLmxvY2FsVG9HbG9iYWxCb3VuZHMoIGJvdW5kcyApLCBlcHNpbG9uICksICdsb2NhbFRvR2xvYmFsQm91bmRzIG9uIGNoaWxkJyApO1xyXG4gIGFzc2VydC5vayggbmV3IEJvdW5kczIoIDE0LCA0LCAzMCwgMzAgKS5lcXVhbHNFcHNpbG9uKCBhLmxvY2FsVG9HbG9iYWxCb3VuZHMoIGJvdW5kcyApLCBlcHNpbG9uICksICdsb2NhbFRvR2xvYmFsQm91bmRzIG9uIHJvb3QgKHNhbWUgYXMgbG9jYWxUb1BhcmVudCknICk7XHJcblxyXG4gIGFzc2VydC5vayggbmV3IEJvdW5kczIoIC02LCAtNiwgMTAsIDIwICkuZXF1YWxzRXBzaWxvbiggYi5nbG9iYWxUb0xvY2FsQm91bmRzKCBib3VuZHMgKSwgZXBzaWxvbiApLCAnZ2xvYmFsVG9Mb2NhbEJvdW5kcyBvbiBjaGlsZCcgKTtcclxuICBhc3NlcnQub2soIG5ldyBCb3VuZHMyKCAtNiwgNCwgMTAsIDMwICkuZXF1YWxzRXBzaWxvbiggYS5nbG9iYWxUb0xvY2FsQm91bmRzKCBib3VuZHMgKSwgZXBzaWxvbiApLCAnZ2xvYmFsVG9Mb2NhbEJvdW5kcyBvbiByb290IChzYW1lIGFzIGxvY2FsVG9QYXJlbnQpJyApO1xyXG5cclxuICBhc3NlcnQub2soIG5ldyBCb3VuZHMyKCAxNCwgNCwgMzAsIDMwICkuZXF1YWxzRXBzaWxvbiggYi5wYXJlbnRUb0dsb2JhbEJvdW5kcyggYm91bmRzICksIGVwc2lsb24gKSwgJ3BhcmVudFRvR2xvYmFsQm91bmRzIG9uIGNoaWxkJyApO1xyXG4gIGFzc2VydC5vayggbmV3IEJvdW5kczIoIDQsIDQsIDIwLCAzMCApLmVxdWFsc0Vwc2lsb24oIGEucGFyZW50VG9HbG9iYWxCb3VuZHMoIGJvdW5kcyApLCBlcHNpbG9uICksICdwYXJlbnRUb0dsb2JhbEJvdW5kcyBvbiByb290JyApO1xyXG5cclxuICBhc3NlcnQub2soIG5ldyBCb3VuZHMyKCAtNiwgNCwgMTAsIDMwICkuZXF1YWxzRXBzaWxvbiggYi5nbG9iYWxUb1BhcmVudEJvdW5kcyggYm91bmRzICksIGVwc2lsb24gKSwgJ2dsb2JhbFRvUGFyZW50Qm91bmRzIG9uIGNoaWxkJyApO1xyXG4gIGFzc2VydC5vayggbmV3IEJvdW5kczIoIDQsIDQsIDIwLCAzMCApLmVxdWFsc0Vwc2lsb24oIGEuZ2xvYmFsVG9QYXJlbnRCb3VuZHMoIGJvdW5kcyApLCBlcHNpbG9uICksICdnbG9iYWxUb1BhcmVudEJvdW5kcyBvbiByb290JyApO1xyXG59ICk7XHJcblxyXG5RVW5pdC50ZXN0KCAnUG9pbnRzIChvcmRlciBvZiB0cmFuc2Zvcm1zKScsIGFzc2VydCA9PiB7XHJcbiAgY29uc3QgYSA9IG5ldyBOb2RlKCk7XHJcbiAgY29uc3QgYiA9IG5ldyBOb2RlKCk7XHJcbiAgY29uc3QgYyA9IG5ldyBOb2RlKCk7XHJcbiAgYS5hZGRDaGlsZCggYiApO1xyXG4gIGIuYWRkQ2hpbGQoIGMgKTtcclxuICBhLnggPSAxMDtcclxuICBiLnNjYWxlKCAyICk7XHJcbiAgYy55ID0gMTA7XHJcblxyXG4gIGFzc2VydC5vayggbmV3IFZlY3RvcjIoIDIwLCAzMCApLmVxdWFsc0Vwc2lsb24oIGMubG9jYWxUb0dsb2JhbFBvaW50KCBuZXcgVmVjdG9yMiggNSwgNSApICksIGVwc2lsb24gKSwgJ2xvY2FsVG9HbG9iYWxQb2ludCcgKTtcclxuICBhc3NlcnQub2soIG5ldyBWZWN0b3IyKCAtMi41LCAtNy41ICkuZXF1YWxzRXBzaWxvbiggYy5nbG9iYWxUb0xvY2FsUG9pbnQoIG5ldyBWZWN0b3IyKCA1LCA1ICkgKSwgZXBzaWxvbiApLCAnZ2xvYmFsVG9Mb2NhbFBvaW50JyApO1xyXG4gIGFzc2VydC5vayggbmV3IFZlY3RvcjIoIDIwLCAxMCApLmVxdWFsc0Vwc2lsb24oIGMucGFyZW50VG9HbG9iYWxQb2ludCggbmV3IFZlY3RvcjIoIDUsIDUgKSApLCBlcHNpbG9uICksICdwYXJlbnRUb0dsb2JhbFBvaW50JyApO1xyXG4gIGFzc2VydC5vayggbmV3IFZlY3RvcjIoIC0yLjUsIDIuNSApLmVxdWFsc0Vwc2lsb24oIGMuZ2xvYmFsVG9QYXJlbnRQb2ludCggbmV3IFZlY3RvcjIoIDUsIDUgKSApLCBlcHNpbG9uICksICdnbG9iYWxUb1BhcmVudFBvaW50JyApO1xyXG59ICk7XHJcblxyXG5RVW5pdC50ZXN0KCAnQm91bmRzIChvcmRlciBvZiB0cmFuc2Zvcm1zKScsIGFzc2VydCA9PiB7XHJcbiAgY29uc3QgYSA9IG5ldyBOb2RlKCk7XHJcbiAgY29uc3QgYiA9IG5ldyBOb2RlKCk7XHJcbiAgY29uc3QgYyA9IG5ldyBOb2RlKCk7XHJcbiAgYS5hZGRDaGlsZCggYiApO1xyXG4gIGIuYWRkQ2hpbGQoIGMgKTtcclxuICBhLnggPSAxMDtcclxuICBiLnNjYWxlKCAyICk7XHJcbiAgYy55ID0gMTA7XHJcblxyXG4gIGNvbnN0IGJvdW5kcyA9IG5ldyBCb3VuZHMyKCA0LCA0LCAyMCwgMzAgKTtcclxuXHJcbiAgYXNzZXJ0Lm9rKCBuZXcgQm91bmRzMiggMTgsIDI4LCA1MCwgODAgKS5lcXVhbHNFcHNpbG9uKCBjLmxvY2FsVG9HbG9iYWxCb3VuZHMoIGJvdW5kcyApLCBlcHNpbG9uICksICdsb2NhbFRvR2xvYmFsQm91bmRzJyApO1xyXG4gIGFzc2VydC5vayggbmV3IEJvdW5kczIoIC0zLCAtOCwgNSwgNSApLmVxdWFsc0Vwc2lsb24oIGMuZ2xvYmFsVG9Mb2NhbEJvdW5kcyggYm91bmRzICksIGVwc2lsb24gKSwgJ2dsb2JhbFRvTG9jYWxCb3VuZHMnICk7XHJcbiAgYXNzZXJ0Lm9rKCBuZXcgQm91bmRzMiggMTgsIDgsIDUwLCA2MCApLmVxdWFsc0Vwc2lsb24oIGMucGFyZW50VG9HbG9iYWxCb3VuZHMoIGJvdW5kcyApLCBlcHNpbG9uICksICdwYXJlbnRUb0dsb2JhbEJvdW5kcycgKTtcclxuICBhc3NlcnQub2soIG5ldyBCb3VuZHMyKCAtMywgMiwgNSwgMTUgKS5lcXVhbHNFcHNpbG9uKCBjLmdsb2JhbFRvUGFyZW50Qm91bmRzKCBib3VuZHMgKSwgZXBzaWxvbiApLCAnZ2xvYmFsVG9QYXJlbnRCb3VuZHMnICk7XHJcbn0gKTtcclxuXHJcblFVbml0LnRlc3QoICdUcmFpbCBhbmQgTm9kZSB0cmFuc2Zvcm0gZXF1aXZhbGVuY2UnLCBhc3NlcnQgPT4ge1xyXG4gIGNvbnN0IGEgPSBuZXcgTm9kZSgpO1xyXG4gIGNvbnN0IGIgPSBuZXcgTm9kZSgpO1xyXG4gIGNvbnN0IGMgPSBuZXcgTm9kZSgpO1xyXG4gIGEuYWRkQ2hpbGQoIGIgKTtcclxuICBiLmFkZENoaWxkKCBjICk7XHJcbiAgYS54ID0gMTA7XHJcbiAgYi5zY2FsZSggMiApO1xyXG4gIGMueSA9IDEwO1xyXG5cclxuICBjb25zdCB0cmFpbE1hdHJpeCA9IGMuZ2V0VW5pcXVlVHJhaWwoKS5nZXRNYXRyaXgoKTtcclxuICBjb25zdCBub2RlTWF0cml4ID0gYy5nZXRVbmlxdWVUcmFuc2Zvcm0oKS5nZXRNYXRyaXgoKTtcclxuICBhc3NlcnQub2soIHRyYWlsTWF0cml4LmVxdWFsc0Vwc2lsb24oIG5vZGVNYXRyaXgsIGVwc2lsb24gKSwgJ1RyYWlsIGFuZCBOb2RlIHRyYW5zZm9ybSBlcXVpdmFsZW5jZScgKTtcclxufSApO1xyXG5cclxuUVVuaXQudGVzdCggJ011dHVhbGx5IGV4Y2x1c2l2ZSBvcHRpb25zJywgYXNzZXJ0ID0+IHtcclxuXHJcbiAgYXNzZXJ0Lm9rKCB0cnVlLCAnYWx3YXlzIHRydWUsIGV2ZW4gd2hlbiBhc3NlcnRpb25zIGFyZSBub3Qgb24uJyApO1xyXG5cclxuICBjb25zdCB2aXNpYmxlUHJvcGVydHkgPSBuZXcgQm9vbGVhblByb3BlcnR5KCB0cnVlICk7XHJcbiAgd2luZG93LmFzc2VydCAmJiBhc3NlcnQudGhyb3dzKCAoKSA9PiB7XHJcbiAgICByZXR1cm4gbmV3IE5vZGUoIHtcclxuICAgICAgdmlzaWJsZTogZmFsc2UsXHJcbiAgICAgIHZpc2libGVQcm9wZXJ0eTogdmlzaWJsZVByb3BlcnR5XHJcbiAgICB9ICk7XHJcbiAgfSwgJ3Zpc2libGUgYW5kIHZpc2libGVQcm9wZXJ0eSB2YWx1ZXMgZG8gbm90IG1hdGNoJyApO1xyXG5cclxuICBjb25zdCBwaWNrYWJsZVByb3BlcnR5ID0gbmV3IEJvb2xlYW5Qcm9wZXJ0eSggdHJ1ZSApO1xyXG4gIHdpbmRvdy5hc3NlcnQgJiYgYXNzZXJ0LnRocm93cyggKCkgPT4ge1xyXG4gICAgcmV0dXJuIG5ldyBOb2RlKCB7XHJcbiAgICAgIHBpY2thYmxlOiBmYWxzZSxcclxuICAgICAgcGlja2FibGVQcm9wZXJ0eTogcGlja2FibGVQcm9wZXJ0eVxyXG4gICAgfSApO1xyXG4gIH0sICdwaWNrYWJsZSBhbmQgcGlja2FibGVQcm9wZXJ0eSB2YWx1ZXMgZG8gbm90IG1hdGNoJyApO1xyXG5cclxuICBjb25zdCBlbmFibGVkUHJvcGVydHkgPSBuZXcgQm9vbGVhblByb3BlcnR5KCB0cnVlICk7XHJcbiAgd2luZG93LmFzc2VydCAmJiBhc3NlcnQudGhyb3dzKCAoKSA9PiB7XHJcbiAgICByZXR1cm4gbmV3IE5vZGUoIHtcclxuICAgICAgZW5hYmxlZDogZmFsc2UsXHJcbiAgICAgIGVuYWJsZWRQcm9wZXJ0eTogZW5hYmxlZFByb3BlcnR5XHJcbiAgICB9ICk7XHJcbiAgfSwgJ2VuYWJsZWQgYW5kIGVuYWJsZWRQcm9wZXJ0eSB2YWx1ZXMgZG8gbm90IG1hdGNoJyApO1xyXG5cclxuICBjb25zdCBpbnB1dEVuYWJsZWRQcm9wZXJ0eSA9IG5ldyBCb29sZWFuUHJvcGVydHkoIHRydWUgKTtcclxuICB3aW5kb3cuYXNzZXJ0ICYmIGFzc2VydC50aHJvd3MoICgpID0+IHtcclxuICAgIHJldHVybiBuZXcgTm9kZSgge1xyXG4gICAgICBpbnB1dEVuYWJsZWQ6IGZhbHNlLFxyXG4gICAgICBpbnB1dEVuYWJsZWRQcm9wZXJ0eTogaW5wdXRFbmFibGVkUHJvcGVydHlcclxuICAgIH0gKTtcclxuICB9LCAnaW5wdXRFbmFibGVkIGFuZCBpbnB1dEVuYWJsZWRQcm9wZXJ0eSB2YWx1ZXMgZG8gbm90IG1hdGNoJyApO1xyXG5cclxufSApO1xyXG5cclxuaWYgKCBUYW5kZW0uUEhFVF9JT19FTkFCTEVEICkge1xyXG5cclxuICBRVW5pdC50ZXN0KCAnTm9kZSBpbnN0cnVtZW50ZWQgdmlzaWJsZVByb3BlcnR5JywgYXNzZXJ0ID0+IHRlc3RJbnN0cnVtZW50ZWROb2RlUHJvcGVydHkoIGFzc2VydCwgJ3Zpc2libGUnLFxyXG4gICAgJ3Zpc2libGVQcm9wZXJ0eScsICdzZXRWaXNpYmxlUHJvcGVydHknLFxyXG4gICAgdHJ1ZSwgJ3BoZXRpb1Zpc2libGVQcm9wZXJ0eUluc3RydW1lbnRlZCcgKSApO1xyXG5cclxuICBRVW5pdC50ZXN0KCAnTm9kZSBpbnN0cnVtZW50ZWQgZW5hYmxlZFByb3BlcnR5JywgYXNzZXJ0ID0+IHRlc3RJbnN0cnVtZW50ZWROb2RlUHJvcGVydHkoIGFzc2VydCwgJ2VuYWJsZWQnLFxyXG4gICAgJ2VuYWJsZWRQcm9wZXJ0eScsICdzZXRFbmFibGVkUHJvcGVydHknLFxyXG4gICAgTm9kZS5ERUZBVUxUX05PREVfT1BUSU9OUy5waGV0aW9FbmFibGVkUHJvcGVydHlJbnN0cnVtZW50ZWQsICdwaGV0aW9FbmFibGVkUHJvcGVydHlJbnN0cnVtZW50ZWQnICkgKTtcclxuXHJcbiAgUVVuaXQudGVzdCggJ05vZGUgaW5zdHJ1bWVudGVkIGlucHV0RW5hYmxlZFByb3BlcnR5JywgYXNzZXJ0ID0+IHRlc3RJbnN0cnVtZW50ZWROb2RlUHJvcGVydHkoIGFzc2VydCwgJ2lucHV0RW5hYmxlZCcsXHJcbiAgICAnaW5wdXRFbmFibGVkUHJvcGVydHknLCAnc2V0SW5wdXRFbmFibGVkUHJvcGVydHknLFxyXG4gICAgTm9kZS5ERUZBVUxUX05PREVfT1BUSU9OUy5waGV0aW9JbnB1dEVuYWJsZWRQcm9wZXJ0eUluc3RydW1lbnRlZCwgJ3BoZXRpb0lucHV0RW5hYmxlZFByb3BlcnR5SW5zdHJ1bWVudGVkJyApICk7XHJcblxyXG4gIC8qKlxyXG4gICAqIEZhY3RvciBvdXQgYSB3YXkgdG8gdGVzdCBhZGRlZCBQcm9wZXJ0aWVzIHRvIE5vZGUgYW5kIHRoZWlyIFBoRVQtaU8gaW5zdHJ1bWVudGF0aW9uXHJcbiAgICogQHBhcmFtIGFzc2VydCAtIGZyb20gcXVuaXQgdGVzdFxyXG4gICAqIEBwYXJhbSBub2RlRmllbGQgLSBuYW1lIG9mIGdldHRlci9zZXR0ZXIsIGxpa2UgYHZpc2libGVgXHJcbiAgICogQHBhcmFtIG5vZGVQcm9wZXJ0eSAtIG5hbWUgb2YgcHVibGljIHByb3BlcnR5LCBsaWtlIGB2aXNpYmxlUHJvcGVydHlgXHJcbiAgICogQHBhcmFtIG5vZGVQcm9wZXJ0eVNldHRlciAtIG5hbWUgb2Ygc2V0dGVyIGZ1bmN0aW9uLCBsaWtlIGBzZXRWaXNpYmxlUHJvcGVydHlgXHJcbiAgICogQHBhcmFtIG93bmVkUHJvcGVydHlJbnN0cnVtZW50ZWQgLSBkZWZhdWx0IHZhbHVlIG9mIHBoZXRpb05vZGVQcm9wZXJ0eUluc3RydW1lbnRlZEtleU5hbWUgb3B0aW9uIGluIE5vZGUuXHJcbiAgICogQHBhcmFtIHBoZXRpb05vZGVQcm9wZXJ0eUluc3RydW1lbnRlZEtleU5hbWUgLSBrZXkgbmFtZSBmb3Igc2V0dGluZyBvcHQtaW4gUGhFVC1pTyBpbnN0cnVtZW50YXRpb25cclxuICAgKi9cclxuICBjb25zdCB0ZXN0SW5zdHJ1bWVudGVkTm9kZVByb3BlcnR5ID0gKCBhc3NlcnQ6IEFzc2VydCwgbm9kZUZpZWxkOiBrZXlvZiBOb2RlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5vZGVQcm9wZXJ0eTogc3RyaW5nLCBub2RlUHJvcGVydHlTZXR0ZXI6IHN0cmluZyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvd25lZFByb3BlcnR5SW5zdHJ1bWVudGVkOiBib29sZWFuLCBwaGV0aW9Ob2RlUHJvcGVydHlJbnN0cnVtZW50ZWRLZXlOYW1lOiBzdHJpbmcgKTogdm9pZCA9PiB7XHJcblxyXG4gICAgY29uc3QgYXBpVmFsaWRhdGlvbiA9IHBoZXQudGFuZGVtLnBoZXRpb0FQSVZhbGlkYXRpb247XHJcbiAgICBjb25zdCBwcmV2aW91c0FQSVZhbGlkYXRpb25FbmFibGVkID0gYXBpVmFsaWRhdGlvbi5lbmFibGVkO1xyXG4gICAgY29uc3QgcHJldmlvdXNTaW1TdGFydGVkID0gYXBpVmFsaWRhdGlvbi5zaW1IYXNTdGFydGVkO1xyXG5cclxuICAgIGFwaVZhbGlkYXRpb24uc2ltSGFzU3RhcnRlZCA9IGZhbHNlO1xyXG5cclxuICAgIGNvbnN0IHRlc3ROb2RlQW5kUHJvcGVydHkgPSAoIG5vZGU6IE5vZGUsIHByb3BlcnR5OiBUUHJvcGVydHk8SW50ZW50aW9uYWxBbnk+ICkgPT4ge1xyXG4gICAgICBjb25zdCBpbml0aWFsVmFsdWUgPSBub2RlWyBub2RlRmllbGQgXTtcclxuICAgICAgYXNzZXJ0Lm9rKCBwcm9wZXJ0eS52YWx1ZSA9PT0gbm9kZVsgbm9kZUZpZWxkIF0sICdpbml0aWFsIHZhbHVlcyBzaG91bGQgYmUgdGhlIHNhbWUnICk7XHJcbiAgICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgLSBubyBzdXJlIG5vdyB0byBkbyB0aGlzIHdlbGwgaW4gdHlwZXNjcmlwdFxyXG4gICAgICBub2RlWyBub2RlRmllbGQgXSA9ICFpbml0aWFsVmFsdWU7XHJcbiAgICAgIGFzc2VydC5vayggcHJvcGVydHkudmFsdWUgPT09ICFpbml0aWFsVmFsdWUsICdwcm9wZXJ0eSBzaG91bGQgcmVmbGVjdCBub2RlIGNoYW5nZScgKTtcclxuICAgICAgcHJvcGVydHkudmFsdWUgPSBpbml0aWFsVmFsdWU7XHJcbiAgICAgIGFzc2VydC5vayggbm9kZVsgbm9kZUZpZWxkIF0gPT09IGluaXRpYWxWYWx1ZSwgJ25vZGUgc2hvdWxkIHJlZmxlY3QgcHJvcGVydHkgY2hhbmdlJyApO1xyXG5cclxuICAgICAgLy8gQHRzLWV4cGVjdC1lcnJvciAtIG5vIHN1cmUgbm93IHRvIGRvIHRoaXMgd2VsbCBpbiB0eXBlc2NyaXB0XHJcbiAgICAgIG5vZGVbIG5vZGVGaWVsZCBdID0gaW5pdGlhbFZhbHVlO1xyXG4gICAgfTtcclxuXHJcbiAgICBjb25zdCBpbnN0cnVtZW50ZWRQcm9wZXJ0eSA9IG5ldyBCb29sZWFuUHJvcGVydHkoIGZhbHNlLCB7IHRhbmRlbTogVGFuZGVtLlJPT1RfVEVTVC5jcmVhdGVUYW5kZW0oIGAke25vZGVGaWVsZH1NeVByb3BlcnR5YCApIH0gKTtcclxuICAgIGNvbnN0IG90aGVySW5zdHJ1bWVudGVkUHJvcGVydHkgPSBuZXcgQm9vbGVhblByb3BlcnR5KCBmYWxzZSwgeyB0YW5kZW06IFRhbmRlbS5ST09UX1RFU1QuY3JlYXRlVGFuZGVtKCBgJHtub2RlRmllbGR9TXlPdGhlclByb3BlcnR5YCApIH0gKTtcclxuICAgIGNvbnN0IHVuaW5zdHJ1bWVudGVkUHJvcGVydHkgPSBuZXcgQm9vbGVhblByb3BlcnR5KCBmYWxzZSApO1xyXG5cclxuICAgIC8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcclxuICAgICAvKiBUZXN0aW5nIHVuaW5zdHJ1bWVudGVkIE5vZGVzXHJcbiAgICAgKi9cclxuXHJcblxyXG4gICAgICAvLyB1bmluc3RydW1lbnRlZE5vZGUgPT4gbm8gcHJvcGVydHkgKGJlZm9yZSBzdGFydHVwKVxyXG4gICAgbGV0IHVuaW5zdHJ1bWVudGVkID0gbmV3IE5vZGUoKTtcclxuICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgLSBubyBzdXJlIG5vdyB0byBkbyB0aGlzIHdlbGwgaW4gdHlwZXNjcmlwdFxyXG4gICAgYXNzZXJ0Lm9rKCB1bmluc3RydW1lbnRlZFsgbm9kZVByb3BlcnR5IF1bICd0YXJnZXRQcm9wZXJ0eScgXSA9PT0gdW5kZWZpbmVkICk7XHJcbiAgICAvLyBAdHMtZXhwZWN0LWVycm9yIC0gbm8gc3VyZSBub3cgdG8gZG8gdGhpcyB3ZWxsIGluIHR5cGVzY3JpcHRcclxuICAgIHRlc3ROb2RlQW5kUHJvcGVydHkoIHVuaW5zdHJ1bWVudGVkLCB1bmluc3RydW1lbnRlZFsgbm9kZVByb3BlcnR5IF0gKTtcclxuXHJcbiAgICAvLyB1bmluc3RydW1lbnRlZE5vZGUgPT4gdW5pbnN0cnVtZW50ZWQgcHJvcGVydHkgKGJlZm9yZSBzdGFydHVwKVxyXG4gICAgdW5pbnN0cnVtZW50ZWQgPSBuZXcgTm9kZSggeyBbIG5vZGVQcm9wZXJ0eSBdOiB1bmluc3RydW1lbnRlZFByb3BlcnR5IH0gKTtcclxuICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgLSBubyBzdXJlIG5vdyB0byBkbyB0aGlzIHdlbGwgaW4gdHlwZXNjcmlwdFxyXG4gICAgYXNzZXJ0Lm9rKCB1bmluc3RydW1lbnRlZFsgbm9kZVByb3BlcnR5IF1bICd0YXJnZXRQcm9wZXJ0eScgXSA9PT0gdW5pbnN0cnVtZW50ZWRQcm9wZXJ0eSApO1xyXG4gICAgdGVzdE5vZGVBbmRQcm9wZXJ0eSggdW5pbnN0cnVtZW50ZWQsIHVuaW5zdHJ1bWVudGVkUHJvcGVydHkgKTtcclxuXHJcbiAgICAvL3VuaW5zdHJ1bWVudGVkTm9kZSA9PiBpbnN0cnVtZW50ZWQgcHJvcGVydHkgKGJlZm9yZSBzdGFydHVwKVxyXG4gICAgdW5pbnN0cnVtZW50ZWQgPSBuZXcgTm9kZSgpO1xyXG4gICAgdW5pbnN0cnVtZW50ZWQubXV0YXRlKCB7XHJcbiAgICAgIFsgbm9kZVByb3BlcnR5IF06IGluc3RydW1lbnRlZFByb3BlcnR5XHJcbiAgICB9ICk7XHJcbiAgICAvLyBAdHMtZXhwZWN0LWVycm9yIC0gbm8gc3VyZSBub3cgdG8gZG8gdGhpcyB3ZWxsIGluIHR5cGVzY3JpcHRcclxuICAgIGFzc2VydC5vayggdW5pbnN0cnVtZW50ZWRbIG5vZGVQcm9wZXJ0eSBdWyAndGFyZ2V0UHJvcGVydHknIF0gPT09IGluc3RydW1lbnRlZFByb3BlcnR5ICk7XHJcbiAgICB0ZXN0Tm9kZUFuZFByb3BlcnR5KCB1bmluc3RydW1lbnRlZCwgaW5zdHJ1bWVudGVkUHJvcGVydHkgKTtcclxuXHJcbiAgICAvLyAgdW5pbnN0cnVtZW50ZWROb2RlID0+IGluc3RydW1lbnRlZCBwcm9wZXJ0eSA9PiBpbnN0cnVtZW50IHRoZSBOb2RlIChiZWZvcmUgc3RhcnR1cCkgT0tcclxuICAgIHVuaW5zdHJ1bWVudGVkID0gbmV3IE5vZGUoKTtcclxuICAgIHVuaW5zdHJ1bWVudGVkLm11dGF0ZSgge1xyXG4gICAgICBbIG5vZGVQcm9wZXJ0eSBdOiBpbnN0cnVtZW50ZWRQcm9wZXJ0eVxyXG4gICAgfSApO1xyXG4gICAgdW5pbnN0cnVtZW50ZWQubXV0YXRlKCB7IHRhbmRlbTogVGFuZGVtLlJPT1RfVEVTVC5jcmVhdGVUYW5kZW0oIGAke25vZGVGaWVsZH1NeU5vZGVgICkgfSApO1xyXG4gICAgLy8gQHRzLWV4cGVjdC1lcnJvciAtIG5vIHN1cmUgbm93IHRvIGRvIHRoaXMgd2VsbCBpbiB0eXBlc2NyaXB0XHJcbiAgICBhc3NlcnQub2soIHVuaW5zdHJ1bWVudGVkWyBub2RlUHJvcGVydHkgXVsgJ3RhcmdldFByb3BlcnR5JyBdID09PSBpbnN0cnVtZW50ZWRQcm9wZXJ0eSApO1xyXG4gICAgdGVzdE5vZGVBbmRQcm9wZXJ0eSggdW5pbnN0cnVtZW50ZWQsIGluc3RydW1lbnRlZFByb3BlcnR5ICk7XHJcbiAgICB1bmluc3RydW1lbnRlZC5kaXNwb3NlKCk7XHJcblxyXG4gICAgLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cclxuICAgIGFwaVZhbGlkYXRpb24uc2ltSGFzU3RhcnRlZCA9IHRydWU7XHJcblxyXG4gICAgLy8gdW5pbnN0cnVtZW50ZWROb2RlID0+IG5vIHByb3BlcnR5IChiZWZvcmUgc3RhcnR1cClcclxuICAgIHVuaW5zdHJ1bWVudGVkID0gbmV3IE5vZGUoKTtcclxuICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgLSBubyBzdXJlIG5vdyB0byBkbyB0aGlzIHdlbGwgaW4gdHlwZXNjcmlwdFxyXG4gICAgYXNzZXJ0Lm9rKCB1bmluc3RydW1lbnRlZFsgbm9kZVByb3BlcnR5IF1bICd0YXJnZXRQcm9wZXJ0eScgXSA9PT0gdW5kZWZpbmVkICk7XHJcbiAgICAvLyBAdHMtZXhwZWN0LWVycm9yIC0gbm8gc3VyZSBub3cgdG8gZG8gdGhpcyB3ZWxsIGluIHR5cGVzY3JpcHRcclxuICAgIHRlc3ROb2RlQW5kUHJvcGVydHkoIHVuaW5zdHJ1bWVudGVkLCB1bmluc3RydW1lbnRlZFsgbm9kZVByb3BlcnR5IF0gKTtcclxuXHJcbiAgICAvLyB1bmluc3RydW1lbnRlZE5vZGUgPT4gdW5pbnN0cnVtZW50ZWQgcHJvcGVydHkgKGJlZm9yZSBzdGFydHVwKVxyXG4gICAgdW5pbnN0cnVtZW50ZWQgPSBuZXcgTm9kZSggeyBbIG5vZGVQcm9wZXJ0eSBdOiB1bmluc3RydW1lbnRlZFByb3BlcnR5IH0gKTtcclxuICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgLSBubyBzdXJlIG5vdyB0byBkbyB0aGlzIHdlbGwgaW4gdHlwZXNjcmlwdFxyXG4gICAgYXNzZXJ0Lm9rKCB1bmluc3RydW1lbnRlZFsgbm9kZVByb3BlcnR5IF1bICd0YXJnZXRQcm9wZXJ0eScgXSA9PT0gdW5pbnN0cnVtZW50ZWRQcm9wZXJ0eSApO1xyXG4gICAgdGVzdE5vZGVBbmRQcm9wZXJ0eSggdW5pbnN0cnVtZW50ZWQsIHVuaW5zdHJ1bWVudGVkUHJvcGVydHkgKTtcclxuXHJcbiAgICAvL3VuaW5zdHJ1bWVudGVkTm9kZSA9PiBpbnN0cnVtZW50ZWQgcHJvcGVydHkgKGJlZm9yZSBzdGFydHVwKVxyXG4gICAgdW5pbnN0cnVtZW50ZWQgPSBuZXcgTm9kZSgpO1xyXG4gICAgdW5pbnN0cnVtZW50ZWQubXV0YXRlKCB7XHJcbiAgICAgIFsgbm9kZVByb3BlcnR5IF06IGluc3RydW1lbnRlZFByb3BlcnR5XHJcbiAgICB9ICk7XHJcbiAgICAvLyBAdHMtZXhwZWN0LWVycm9yIC0gbm8gc3VyZSBub3cgdG8gZG8gdGhpcyB3ZWxsIGluIHR5cGVzY3JpcHRcclxuICAgIGFzc2VydC5vayggdW5pbnN0cnVtZW50ZWRbIG5vZGVQcm9wZXJ0eSBdWyAndGFyZ2V0UHJvcGVydHknIF0gPT09IGluc3RydW1lbnRlZFByb3BlcnR5ICk7XHJcbiAgICB0ZXN0Tm9kZUFuZFByb3BlcnR5KCB1bmluc3RydW1lbnRlZCwgaW5zdHJ1bWVudGVkUHJvcGVydHkgKTtcclxuXHJcbiAgICAvLyAgdW5pbnN0cnVtZW50ZWROb2RlID0+IGluc3RydW1lbnRlZCBwcm9wZXJ0eSA9PiBpbnN0cnVtZW50IHRoZSBOb2RlIChiZWZvcmUgc3RhcnR1cCkgT0tcclxuICAgIHVuaW5zdHJ1bWVudGVkID0gbmV3IE5vZGUoKTtcclxuICAgIHVuaW5zdHJ1bWVudGVkLm11dGF0ZSgge1xyXG4gICAgICBbIG5vZGVQcm9wZXJ0eSBdOiBpbnN0cnVtZW50ZWRQcm9wZXJ0eVxyXG4gICAgfSApO1xyXG5cclxuICAgIHVuaW5zdHJ1bWVudGVkLm11dGF0ZSggeyB0YW5kZW06IFRhbmRlbS5ST09UX1RFU1QuY3JlYXRlVGFuZGVtKCBgJHtub2RlRmllbGR9TXlOb2RlYCApIH0gKTtcclxuICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgLSBubyBzdXJlIG5vdyB0byBkbyB0aGlzIHdlbGwgaW4gdHlwZXNjcmlwdFxyXG4gICAgYXNzZXJ0Lm9rKCB1bmluc3RydW1lbnRlZFsgbm9kZVByb3BlcnR5IF1bICd0YXJnZXRQcm9wZXJ0eScgXSA9PT0gaW5zdHJ1bWVudGVkUHJvcGVydHkgKTtcclxuICAgIHRlc3ROb2RlQW5kUHJvcGVydHkoIHVuaW5zdHJ1bWVudGVkLCBpbnN0cnVtZW50ZWRQcm9wZXJ0eSApO1xyXG4gICAgdW5pbnN0cnVtZW50ZWQuZGlzcG9zZSgpO1xyXG4gICAgYXBpVmFsaWRhdGlvbi5zaW1IYXNTdGFydGVkID0gZmFsc2U7XHJcblxyXG5cclxuICAgIC8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcclxuICAgICAvKiBUZXN0aW5nIGluc3RydW1lbnRlZCBub2Rlc1xyXG4gICAgICovXHJcblxyXG4gICAgICAvLyBpbnN0cnVtZW50ZWROb2RlV2l0aERlZmF1bHRJbnN0cnVtZW50ZWRQcm9wZXJ0eSA9PiBpbnN0cnVtZW50ZWQgcHJvcGVydHkgKGJlZm9yZSBzdGFydHVwKVxyXG4gICAgbGV0IGluc3RydW1lbnRlZCA9IG5ldyBOb2RlKCB7XHJcbiAgICAgICAgdGFuZGVtOiBUYW5kZW0uUk9PVF9URVNULmNyZWF0ZVRhbmRlbSggYCR7bm9kZUZpZWxkfU15Tm9kZWAgKSxcclxuICAgICAgICBbIHBoZXRpb05vZGVQcm9wZXJ0eUluc3RydW1lbnRlZEtleU5hbWUgXTogdHJ1ZVxyXG4gICAgICB9ICk7XHJcbiAgICAvLyBAdHMtZXhwZWN0LWVycm9yIC0gbm8gc3VyZSBub3cgdG8gZG8gdGhpcyB3ZWxsIGluIHR5cGVzY3JpcHRcclxuICAgIGFzc2VydC5vayggaW5zdHJ1bWVudGVkWyBub2RlUHJvcGVydHkgXVsgJ3RhcmdldFByb3BlcnR5JyBdID09PSBpbnN0cnVtZW50ZWRbIG5vZGVQcm9wZXJ0eSBdLm93bmVkUGhldGlvUHJvcGVydHkgKTtcclxuICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgLSBubyBzdXJlIG5vdyB0byBkbyB0aGlzIHdlbGwgaW4gdHlwZXNjcmlwdFxyXG4gICAgYXNzZXJ0Lm9rKCBpbnN0cnVtZW50ZWRbICdsaW5rZWRFbGVtZW50cycgXS5sZW5ndGggPT09IDAsIGBubyBsaW5rZWQgZWxlbWVudHMgZm9yIGRlZmF1bHQgJHtub2RlUHJvcGVydHl9YCApO1xyXG4gICAgLy8gQHRzLWV4cGVjdC1lcnJvciAtIG5vIHN1cmUgbm93IHRvIGRvIHRoaXMgd2VsbCBpbiB0eXBlc2NyaXB0XHJcbiAgICB0ZXN0Tm9kZUFuZFByb3BlcnR5KCBpbnN0cnVtZW50ZWQsIGluc3RydW1lbnRlZFsgbm9kZVByb3BlcnR5IF0gKTtcclxuICAgIGluc3RydW1lbnRlZC5kaXNwb3NlKCk7XHJcblxyXG4gICAgLy8gaW5zdHJ1bWVudGVkTm9kZVdpdGhEZWZhdWx0SW5zdHJ1bWVudGVkUHJvcGVydHkgPT4gdW5pbnN0cnVtZW50ZWQgcHJvcGVydHkgKGJlZm9yZSBzdGFydHVwKVxyXG4gICAgaW5zdHJ1bWVudGVkID0gbmV3IE5vZGUoIHtcclxuICAgICAgdGFuZGVtOiBUYW5kZW0uUk9PVF9URVNULmNyZWF0ZVRhbmRlbSggYCR7bm9kZUZpZWxkfU15Tm9kZWAgKSxcclxuICAgICAgWyBwaGV0aW9Ob2RlUHJvcGVydHlJbnN0cnVtZW50ZWRLZXlOYW1lIF06IHRydWVcclxuICAgIH0gKTtcclxuICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgLSBubyBzdXJlIG5vdyB0byBkbyB0aGlzIHdlbGwgaW4gdHlwZXNjcmlwdFxyXG4gICAgaW5zdHJ1bWVudGVkLmhhc093blByb3BlcnR5KCAncGhldGlvTm9kZVByb3BlcnR5SW5zdHJ1bWVudGVkS2V5TmFtZScgKSAmJiBhc3NlcnQub2soIGluc3RydW1lbnRlZFsgcGhldGlvTm9kZVByb3BlcnR5SW5zdHJ1bWVudGVkS2V5TmFtZSBdID09PSB0cnVlLCAnZ2V0dGVyIHNob3VsZCB3b3JrJyApO1xyXG4gICAgd2luZG93LmFzc2VydCAmJiBhc3NlcnQudGhyb3dzKCAoKSA9PiB7XHJcbiAgICAgIGluc3RydW1lbnRlZC5tdXRhdGUoIHsgWyBub2RlUHJvcGVydHkgXTogdW5pbnN0cnVtZW50ZWRQcm9wZXJ0eSB9ICk7XHJcbiAgICB9LCBgY2Fubm90IHJlbW92ZSBpbnN0cnVtZW50YXRpb24gZnJvbSB0aGUgTm9kZSdzICR7bm9kZVByb3BlcnR5fWAgKTtcclxuICAgIGluc3RydW1lbnRlZC5kaXNwb3NlKCk7XHJcblxyXG4gICAgLy8gaW5zdHJ1bWVudGVkTm9kZVdpdGhQYXNzZWRJbkluc3RydW1lbnRlZFByb3BlcnR5ID0+IGluc3RydW1lbnRlZCBwcm9wZXJ0eSAoYmVmb3JlIHN0YXJ0dXApXHJcbiAgICBpbnN0cnVtZW50ZWQgPSBuZXcgTm9kZSgge1xyXG4gICAgICB0YW5kZW06IFRhbmRlbS5ST09UX1RFU1QuY3JlYXRlVGFuZGVtKCBgJHtub2RlRmllbGR9TXlOb2RlYCApLFxyXG4gICAgICBbIHBoZXRpb05vZGVQcm9wZXJ0eUluc3RydW1lbnRlZEtleU5hbWUgXTogdHJ1ZVxyXG4gICAgfSApO1xyXG4gICAgaW5zdHJ1bWVudGVkLm11dGF0ZSggeyBbIG5vZGVQcm9wZXJ0eSBdOiBpbnN0cnVtZW50ZWRQcm9wZXJ0eSB9ICk7XHJcbiAgICAvLyBAdHMtZXhwZWN0LWVycm9yIC0gbm8gc3VyZSBub3cgdG8gZG8gdGhpcyB3ZWxsIGluIHR5cGVzY3JpcHRcclxuICAgIGFzc2VydC5vayggaW5zdHJ1bWVudGVkWyBub2RlUHJvcGVydHkgXVsgJ3RhcmdldFByb3BlcnR5JyBdID09PSBpbnN0cnVtZW50ZWRQcm9wZXJ0eSApO1xyXG4gICAgLy8gQHRzLWV4cGVjdC1lcnJvciAtIG5vIHN1cmUgbm93IHRvIGRvIHRoaXMgd2VsbCBpbiB0eXBlc2NyaXB0XHJcbiAgICBhc3NlcnQub2soIGluc3RydW1lbnRlZFsgJ2xpbmtlZEVsZW1lbnRzJyBdLmxlbmd0aCA9PT0gMSwgJ2FkZGVkIGxpbmtlZCBlbGVtZW50JyApO1xyXG4gICAgLy8gQHRzLWV4cGVjdC1lcnJvciAtIG5vIHN1cmUgbm93IHRvIGRvIHRoaXMgd2VsbCBpbiB0eXBlc2NyaXB0XHJcbiAgICBhc3NlcnQub2soIGluc3RydW1lbnRlZFsgJ2xpbmtlZEVsZW1lbnRzJyBdWyAwIF0uZWxlbWVudCA9PT0gaW5zdHJ1bWVudGVkUHJvcGVydHksXHJcbiAgICAgIGBhZGRlZCBsaW5rZWQgZWxlbWVudCBzaG91bGQgYmUgZm9yICR7bm9kZVByb3BlcnR5fWAgKTtcclxuICAgIHRlc3ROb2RlQW5kUHJvcGVydHkoIGluc3RydW1lbnRlZCwgaW5zdHJ1bWVudGVkUHJvcGVydHkgKTtcclxuICAgIGluc3RydW1lbnRlZC5kaXNwb3NlKCk7XHJcblxyXG4gICAgaW5zdHJ1bWVudGVkID0gbmV3IE5vZGUoIHtcclxuICAgICAgdGFuZGVtOiBUYW5kZW0uUk9PVF9URVNULmNyZWF0ZVRhbmRlbSggYCR7bm9kZUZpZWxkfU15Tm9kZWAgKSxcclxuICAgICAgWyBub2RlUHJvcGVydHkgXTogaW5zdHJ1bWVudGVkUHJvcGVydHlcclxuICAgIH0gKTtcclxuICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgLSBubyBzdXJlIG5vdyB0byBkbyB0aGlzIHdlbGwgaW4gdHlwZXNjcmlwdFxyXG4gICAgYXNzZXJ0Lm9rKCBpbnN0cnVtZW50ZWRbIG5vZGVQcm9wZXJ0eSBdWyAndGFyZ2V0UHJvcGVydHknIF0gPT09IGluc3RydW1lbnRlZFByb3BlcnR5ICk7XHJcbiAgICAvLyBAdHMtZXhwZWN0LWVycm9yIC0gbm8gc3VyZSBub3cgdG8gZG8gdGhpcyB3ZWxsIGluIHR5cGVzY3JpcHRcclxuICAgIGFzc2VydC5vayggaW5zdHJ1bWVudGVkWyAnbGlua2VkRWxlbWVudHMnIF0ubGVuZ3RoID09PSAxLCAnYWRkZWQgbGlua2VkIGVsZW1lbnQnICk7XHJcbiAgICAvLyBAdHMtZXhwZWN0LWVycm9yIC0gbm8gc3VyZSBub3cgdG8gZG8gdGhpcyB3ZWxsIGluIHR5cGVzY3JpcHRcclxuICAgIGFzc2VydC5vayggaW5zdHJ1bWVudGVkWyAnbGlua2VkRWxlbWVudHMnIF1bIDAgXS5lbGVtZW50ID09PSBpbnN0cnVtZW50ZWRQcm9wZXJ0eSxcclxuICAgICAgYGFkZGVkIGxpbmtlZCBlbGVtZW50IHNob3VsZCBiZSBmb3IgJHtub2RlUHJvcGVydHl9YCApO1xyXG4gICAgdGVzdE5vZGVBbmRQcm9wZXJ0eSggaW5zdHJ1bWVudGVkLCBpbnN0cnVtZW50ZWRQcm9wZXJ0eSApO1xyXG4gICAgaW5zdHJ1bWVudGVkLmRpc3Bvc2UoKTtcclxuXHJcbiAgICAvLyBpbnN0cnVtZW50ZWROb2RlV2l0aFBhc3NlZEluSW5zdHJ1bWVudGVkUHJvcGVydHkgPT4gdW5pbnN0cnVtZW50ZWQgcHJvcGVydHkgKGJlZm9yZSBzdGFydHVwKVxyXG4gICAgaW5zdHJ1bWVudGVkID0gbmV3IE5vZGUoIHtcclxuICAgICAgdGFuZGVtOiBUYW5kZW0uUk9PVF9URVNULmNyZWF0ZVRhbmRlbSggYCR7bm9kZUZpZWxkfU15Tm9kZWAgKSxcclxuICAgICAgWyBub2RlUHJvcGVydHkgXTogaW5zdHJ1bWVudGVkUHJvcGVydHlcclxuICAgIH0gKTtcclxuICAgIHdpbmRvdy5hc3NlcnQgJiYgYXNzZXJ0LnRocm93cyggKCkgPT4ge1xyXG4gICAgICBpbnN0cnVtZW50ZWQubXV0YXRlKCB7IFsgbm9kZVByb3BlcnR5IF06IHVuaW5zdHJ1bWVudGVkUHJvcGVydHkgfSApO1xyXG4gICAgfSwgYGNhbm5vdCByZW1vdmUgaW5zdHJ1bWVudGF0aW9uIGZyb20gdGhlIE5vZGUncyAke25vZGVQcm9wZXJ0eX1gICk7XHJcbiAgICBpbnN0cnVtZW50ZWQuZGlzcG9zZSgpO1xyXG4gICAgaW5zdHJ1bWVudGVkID0gbmV3IE5vZGUoIHtcclxuICAgICAgdGFuZGVtOiBUYW5kZW0uUk9PVF9URVNULmNyZWF0ZVRhbmRlbSggYCR7bm9kZUZpZWxkfU15Tm9kZWAgKVxyXG4gICAgfSApO1xyXG4gICAgaW5zdHJ1bWVudGVkLm11dGF0ZSggeyBbIG5vZGVQcm9wZXJ0eSBdOiBpbnN0cnVtZW50ZWRQcm9wZXJ0eSB9ICk7XHJcbiAgICB3aW5kb3cuYXNzZXJ0ICYmIGFzc2VydC50aHJvd3MoICgpID0+IHtcclxuICAgICAgaW5zdHJ1bWVudGVkLm11dGF0ZSggeyBbIG5vZGVQcm9wZXJ0eSBdOiB1bmluc3RydW1lbnRlZFByb3BlcnR5IH0gKTtcclxuICAgIH0sIGBjYW5ub3QgcmVtb3ZlIGluc3RydW1lbnRhdGlvbiBmcm9tIHRoZSBOb2RlJ3MgJHtub2RlUHJvcGVydHl9YCApO1xyXG4gICAgaW5zdHJ1bWVudGVkLmRpc3Bvc2UoKTtcclxuXHJcbiAgICBhcGlWYWxpZGF0aW9uLmVuYWJsZWQgPSB0cnVlO1xyXG4gICAgYXBpVmFsaWRhdGlvbi5zaW1IYXNTdGFydGVkID0gdHJ1ZTtcclxuICAgIC8vIGluc3RydW1lbnRlZE5vZGVXaXRoRGVmYXVsdEluc3RydW1lbnRlZFByb3BlcnR5ID0+IGluc3RydW1lbnRlZCBwcm9wZXJ0eSAoYWZ0ZXIgc3RhcnR1cClcclxuICAgIGNvbnN0IGluc3RydW1lbnRlZDEgPSBuZXcgTm9kZSgge1xyXG4gICAgICB0YW5kZW06IFRhbmRlbS5ST09UX1RFU1QuY3JlYXRlVGFuZGVtKCBgJHtub2RlRmllbGR9TXlVbmlxdWVseU5hbWVkTm9kZVRoYXRXaWxsTm90QmVEdXBsaWNhdGVkMWAgKSxcclxuICAgICAgWyBwaGV0aW9Ob2RlUHJvcGVydHlJbnN0cnVtZW50ZWRLZXlOYW1lIF06IHRydWVcclxuICAgIH0gKTtcclxuICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgLSBubyBzdXJlIG5vdyB0byBkbyB0aGlzIHdlbGwgaW4gdHlwZXNjcmlwdFxyXG4gICAgYXNzZXJ0Lm9rKCBpbnN0cnVtZW50ZWQxWyBub2RlUHJvcGVydHkgXVsgJ3RhcmdldFByb3BlcnR5JyBdID09PSBpbnN0cnVtZW50ZWQxWyBub2RlUHJvcGVydHkgXS5vd25lZFBoZXRpb1Byb3BlcnR5ICk7XHJcbiAgICAvLyBAdHMtZXhwZWN0LWVycm9yIC0gbm8gc3VyZSBub3cgdG8gZG8gdGhpcyB3ZWxsIGluIHR5cGVzY3JpcHRcclxuICAgIGFzc2VydC5vayggaW5zdHJ1bWVudGVkMVsgJ2xpbmtlZEVsZW1lbnRzJyBdLmxlbmd0aCA9PT0gMCwgYG5vIGxpbmtlZCBlbGVtZW50cyBmb3IgZGVmYXVsdCAke25vZGVQcm9wZXJ0eX1gICk7XHJcbiAgICAvLyBAdHMtZXhwZWN0LWVycm9yIC0gbm8gc3VyZSBub3cgdG8gZG8gdGhpcyB3ZWxsIGluIHR5cGVzY3JpcHRcclxuICAgIHRlc3ROb2RlQW5kUHJvcGVydHkoIGluc3RydW1lbnRlZDEsIGluc3RydW1lbnRlZDFbIG5vZGVQcm9wZXJ0eSBdICk7XHJcblxyXG4gICAgLy8gaW5zdHJ1bWVudGVkTm9kZVdpdGhEZWZhdWx0SW5zdHJ1bWVudGVkUHJvcGVydHkgPT4gdW5pbnN0cnVtZW50ZWQgcHJvcGVydHkgKGFmdGVyIHN0YXJ0dXApXHJcbiAgICBjb25zdCBpbnN0cnVtZW50ZWQyID0gbmV3IE5vZGUoIHtcclxuICAgICAgdGFuZGVtOiBUYW5kZW0uUk9PVF9URVNULmNyZWF0ZVRhbmRlbSggYCR7bm9kZUZpZWxkfU15VW5pcXVlbHlOYW1lZE5vZGVUaGF0V2lsbE5vdEJlRHVwbGljYXRlZDJgICksXHJcbiAgICAgIFsgcGhldGlvTm9kZVByb3BlcnR5SW5zdHJ1bWVudGVkS2V5TmFtZSBdOiB0cnVlXHJcbiAgICB9ICk7XHJcbiAgICB3aW5kb3cuYXNzZXJ0ICYmIGFzc2VydC50aHJvd3MoICgpID0+IHtcclxuICAgICAgLy8gQHRzLWV4cGVjdC1lcnJvciAtIG5vIHN1cmUgbm93IHRvIGRvIHRoaXMgd2VsbCBpbiB0eXBlc2NyaXB0XHJcbiAgICAgIGluc3RydW1lbnRlZDJbIG5vZGVQcm9wZXJ0eVNldHRlciBdKCB1bmluc3RydW1lbnRlZFByb3BlcnR5ICk7XHJcbiAgICB9LCBgY2Fubm90IHJlbW92ZSBpbnN0cnVtZW50YXRpb24gZnJvbSB0aGUgTm9kZSdzICR7bm9kZVByb3BlcnR5fWAgKTtcclxuXHJcbiAgICAvLyBpbnN0cnVtZW50ZWROb2RlV2l0aFBhc3NlZEluSW5zdHJ1bWVudGVkUHJvcGVydHkgPT4gaW5zdHJ1bWVudGVkIHByb3BlcnR5IChhZnRlciBzdGFydHVwKVxyXG4gICAgY29uc3QgaW5zdHJ1bWVudGVkMyA9IG5ldyBOb2RlKCB7XHJcbiAgICAgIHRhbmRlbTogVGFuZGVtLlJPT1RfVEVTVC5jcmVhdGVUYW5kZW0oIGAke25vZGVGaWVsZH1NeVVuaXF1ZWx5TmFtZWROb2RlVGhhdFdpbGxOb3RCZUR1cGxpY2F0ZWQzYCApLFxyXG4gICAgICBbIG5vZGVQcm9wZXJ0eSBdOiBpbnN0cnVtZW50ZWRQcm9wZXJ0eVxyXG4gICAgfSApO1xyXG5cclxuICAgIHdpbmRvdy5hc3NlcnQgJiYgYXNzZXJ0LnRocm93cyggKCkgPT4ge1xyXG4gICAgICBpbnN0cnVtZW50ZWQzLm11dGF0ZSggeyBbIG5vZGVQcm9wZXJ0eSBdOiBvdGhlckluc3RydW1lbnRlZFByb3BlcnR5IH0gKTtcclxuICAgIH0sICdjYW5ub3Qgc3dhcCBvdXQgb25lIGluc3RydW1lbnRlZCBmb3IgYW5vdGhlcicgKTtcclxuXHJcbiAgICAvLyBpbnN0cnVtZW50ZWROb2RlV2l0aFBhc3NlZEluSW5zdHJ1bWVudGVkUHJvcGVydHkgPT4gdW5pbnN0cnVtZW50ZWQgcHJvcGVydHkgKGFmdGVyIHN0YXJ0dXApXHJcbiAgICBjb25zdCBpbnN0cnVtZW50ZWQ0ID0gbmV3IE5vZGUoIHtcclxuICAgICAgdGFuZGVtOiBUYW5kZW0uUk9PVF9URVNULmNyZWF0ZVRhbmRlbSggYCR7bm9kZUZpZWxkfU15VW5pcXVlbHlOYW1lZE5vZGVUaGF0V2lsbE5vdEJlRHVwbGljYXRlZDRgICksXHJcbiAgICAgIFsgbm9kZVByb3BlcnR5IF06IGluc3RydW1lbnRlZFByb3BlcnR5XHJcbiAgICB9ICk7XHJcbiAgICB3aW5kb3cuYXNzZXJ0ICYmIGFzc2VydC50aHJvd3MoICgpID0+IHtcclxuICAgICAgaW5zdHJ1bWVudGVkNC5tdXRhdGUoIHsgWyBub2RlUHJvcGVydHkgXTogdW5pbnN0cnVtZW50ZWRQcm9wZXJ0eSB9ICk7XHJcbiAgICB9LCBgY2Fubm90IHJlbW92ZSBpbnN0cnVtZW50YXRpb24gZnJvbSB0aGUgTm9kZSdzICR7bm9kZVByb3BlcnR5fWAgKTtcclxuICAgIGNvbnN0IGluc3RydW1lbnRlZDUgPSBuZXcgTm9kZSgge30gKTtcclxuICAgIGluc3RydW1lbnRlZDUubXV0YXRlKCB7IFsgbm9kZVByb3BlcnR5IF06IGluc3RydW1lbnRlZFByb3BlcnR5IH0gKTtcclxuICAgIGluc3RydW1lbnRlZDUubXV0YXRlKCB7IHRhbmRlbTogVGFuZGVtLlJPT1RfVEVTVC5jcmVhdGVUYW5kZW0oIGAke25vZGVGaWVsZH1NeVVuaXF1ZWx5TmFtZWROb2RlVGhhdFdpbGxOb3RCZUR1cGxpY2F0ZWQ1YCApIH0gKTtcclxuICAgIHdpbmRvdy5hc3NlcnQgJiYgYXNzZXJ0LnRocm93cyggKCkgPT4ge1xyXG4gICAgICBpbnN0cnVtZW50ZWQ1Lm11dGF0ZSggeyBbIG5vZGVQcm9wZXJ0eSBdOiB1bmluc3RydW1lbnRlZFByb3BlcnR5IH0gKTtcclxuICAgIH0sIGBjYW5ub3QgcmVtb3ZlIGluc3RydW1lbnRhdGlvbiBmcm9tIHRoZSBOb2RlJ3MgJHtub2RlUHJvcGVydHl9YCApO1xyXG4gICAgYXBpVmFsaWRhdGlvbi5lbmFibGVkID0gZmFsc2U7XHJcblxyXG4gICAgYXBpVmFsaWRhdGlvbi5lbmFibGVkID0gdHJ1ZTtcclxuXHJcbiAgICBhcGlWYWxpZGF0aW9uLnNpbUhhc1N0YXJ0ZWQgPSBmYWxzZTtcclxuXHJcbiAgICAvLyBpbnN0cnVtZW50ZWROb2RlT3B0c091dE9mRGVmYXVsdCA9PiBpbnN0cnVtZW50ZWQgUHJvcGVydHkgc2V0IGxhdGVyIChidXQgYmVmb3JlIHN0YXJ0dXApXHJcbiAgICBjb25zdCBpbnN0cnVtZW50ZWQ2ID0gbmV3IE5vZGUoIHtcclxuICAgICAgdGFuZGVtOiBUYW5kZW0uUk9PVF9URVNULmNyZWF0ZVRhbmRlbSggYCR7bm9kZUZpZWxkfU15Tm9kZTZgICksXHJcbiAgICAgIFsgcGhldGlvTm9kZVByb3BlcnR5SW5zdHJ1bWVudGVkS2V5TmFtZSBdOiBmYWxzZSAvLyByZXF1aXJlZCB3aGVuIHBhc3NpbmcgaW4gYW4gaW5zdHJ1bWVudGVkIG9uZSBsYXRlclxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgLSBubyBzdXJlIG5vdyB0byBkbyB0aGlzIHdlbGwgaW4gdHlwZXNjcmlwdFxyXG4gICAgaW5zdHJ1bWVudGVkNlsgbm9kZVByb3BlcnR5IF0gPSBuZXcgQm9vbGVhblByb3BlcnR5KCBmYWxzZSwge1xyXG4gICAgICB0YW5kZW06IFRhbmRlbS5ST09UX1RFU1QuY3JlYXRlVGFuZGVtKCBgJHtub2RlRmllbGR9TXlCb29sZWFuUHJvcGVydHlgIClcclxuICAgIH0gKTtcclxuICAgIGFwaVZhbGlkYXRpb24uZW5hYmxlZCA9IGZhbHNlO1xyXG5cclxuICAgIGluc3RydW1lbnRlZDYuZGlzcG9zZSgpO1xyXG4gICAgaW5zdHJ1bWVudGVkMS5kaXNwb3NlKCk7XHJcblxyXG4gICAgLy8gVGhlc2UgY2FuJ3QgYmUgZGlzcG9zZWQgYmVjYXVzZSB0aGV5IHdlcmUgYnJva2VuIHdoaWxlIGNyZWF0aW5nIChvbiBwdXJwb3NlIGluIGFuIGFzc2VydC50aHJvd3MoKSkuIFRoZXNlIGVsZW1lbnRzXHJcbiAgICAvLyBoYXZlIHNwZWNpYWwgVGFuZGVtIGNvbXBvbmVudCBuYW1lcyB0byBtYWtlIHN1cmUgdGhhdCB0aGV5IGRvbid0IGludGVyZmVyZSB3aXRoIG90aGVyIHRlc3RzIChzaW5jZSB0aGV5IGNhbid0IGJlXHJcbiAgICAvLyByZW1vdmVkIGZyb20gdGhlIHJlZ2lzdHJ5XHJcbiAgICAvLyBpbnN0cnVtZW50ZWQyLmRpc3Bvc2UoKTtcclxuICAgIC8vIGluc3RydW1lbnRlZDMuZGlzcG9zZSgpO1xyXG4gICAgLy8gaW5zdHJ1bWVudGVkNC5kaXNwb3NlKCk7XHJcbiAgICAvLyBpbnN0cnVtZW50ZWQ1LmRpc3Bvc2UoKTtcclxuXHJcbiAgICBpbnN0cnVtZW50ZWQgPSBuZXcgTm9kZSgge1xyXG4gICAgICB0YW5kZW06IFRhbmRlbS5ST09UX1RFU1QuY3JlYXRlVGFuZGVtKCBgJHtub2RlRmllbGR9TXlOb2RlYCApLFxyXG4gICAgICBbIHBoZXRpb05vZGVQcm9wZXJ0eUluc3RydW1lbnRlZEtleU5hbWUgXTogdHJ1ZVxyXG4gICAgfSApO1xyXG4gICAgd2luZG93LmFzc2VydCAmJiBhc3NlcnQudGhyb3dzKCAoKSA9PiB7XHJcbiAgICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgLSBubyBzdXJlIG5vdyB0byBkbyB0aGlzIHdlbGwgaW4gdHlwZXNjcmlwdFxyXG4gICAgICBpbnN0cnVtZW50ZWRbIG5vZGVQcm9wZXJ0eVNldHRlciBdKCBudWxsICk7XHJcbiAgICB9LCBgY2Fubm90IGNsZWFyIG91dCBhbiBpbnN0cnVtZW50ZWQgJHtub2RlUHJvcGVydHl9YCApO1xyXG4gICAgaW5zdHJ1bWVudGVkLmRpc3Bvc2UoKTtcclxuXHJcblxyXG4gICAgLy8gSWYgYnkgZGVmYXVsdCB0aGlzIHByb3BlcnR5IGlzbid0IGluc3RydW1lbnRlZCwgdGhlbiB0aGlzIHNob3VsZCBjYXVzZSBhbiBlcnJvclxyXG4gICAgaWYgKCAhb3duZWRQcm9wZXJ0eUluc3RydW1lbnRlZCApIHtcclxuXHJcbiAgICAgIGluc3RydW1lbnRlZCA9IG5ldyBOb2RlKCB7XHJcbiAgICAgICAgdGFuZGVtOiBUYW5kZW0uUk9PVF9URVNULmNyZWF0ZVRhbmRlbSggYCR7bm9kZUZpZWxkfU15Tm9kZWAgKVxyXG4gICAgICB9ICk7XHJcbiAgICAgIHdpbmRvdy5hc3NlcnQgJiYgYXNzZXJ0LnRocm93cyggKCkgPT4ge1xyXG5cclxuICAgICAgICAvLyBAdHMtZXhwZWN0LWVycm9yIC0gbm8gc3VyZSBub3cgdG8gZG8gdGhpcyB3ZWxsIGluIHR5cGVzY3JpcHRcclxuICAgICAgICBpbnN0cnVtZW50ZWRbIHBoZXRpb05vZGVQcm9wZXJ0eUluc3RydW1lbnRlZEtleU5hbWUgXSA9IHRydWU7XHJcbiAgICAgIH0sIGBjYW5ub3Qgc2V0ICR7cGhldGlvTm9kZVByb3BlcnR5SW5zdHJ1bWVudGVkS2V5TmFtZX0gYWZ0ZXIgaW5zdHJ1bWVudGF0aW9uYCApO1xyXG4gICAgICBpbnN0cnVtZW50ZWQuZGlzcG9zZSgpO1xyXG4gICAgfVxyXG5cclxuXHJcbiAgICBpbnN0cnVtZW50ZWRQcm9wZXJ0eS5kaXNwb3NlKCk7XHJcbiAgICBvdGhlckluc3RydW1lbnRlZFByb3BlcnR5LmRpc3Bvc2UoKTtcclxuICAgIGFwaVZhbGlkYXRpb24uc2ltSGFzU3RhcnRlZCA9IHByZXZpb3VzU2ltU3RhcnRlZDtcclxuICAgIGFwaVZhbGlkYXRpb24uZW5hYmxlZCA9IHByZXZpb3VzQVBJVmFsaWRhdGlvbkVuYWJsZWQ7XHJcbiAgfTtcclxufVxyXG4iXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsZUFBZSxNQUFNLHFDQUFxQztBQUVqRSxPQUFPQyxPQUFPLE1BQU0sNEJBQTRCO0FBQ2hELE9BQU9DLE9BQU8sTUFBTSw0QkFBNEI7QUFDaEQsU0FBU0MsS0FBSyxRQUFRLDZCQUE2QjtBQUVuRCxPQUFPQyxNQUFNLE1BQU0sOEJBQThCO0FBQ2pELE9BQU9DLEtBQUssTUFBTSxtQkFBbUI7QUFDckMsT0FBT0MsSUFBSSxNQUFNLFdBQVc7QUFDNUIsT0FBT0MsU0FBUyxNQUFNLGdCQUFnQjtBQUV0Q0MsS0FBSyxDQUFDQyxNQUFNLENBQUUsTUFBTyxDQUFDO0FBRXRCLFNBQVNDLGdC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