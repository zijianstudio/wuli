// Copyright 2018-2022, University of Colorado Boulder

/**
 * A Checkbox in EnergySkatePark, which includes a label and an icon. Icons are generally aligned with other checkboxes
 * in the group, and this is handled by collecting all icons into a shared AlignGroup.
 *
 * @author Jesse Greenberg (PhET Interactive Simulations)
 */

import Property from '../../../../axon/js/Property.js';
import Range from '../../../../dot/js/Range.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import { Shape } from '../../../../kite/js/imports.js';
import merge from '../../../../phet-core/js/merge.js';
import GaugeNode from '../../../../scenery-phet/js/GaugeNode.js';
import { Circle, Line, Node, Path, PressListener, Rectangle } from '../../../../scenery/js/imports.js';
import Checkbox from '../../../../sun/js/Checkbox.js';
import energySkatePark from '../../energySkatePark.js';
import EnergySkateParkStrings from '../../EnergySkateParkStrings.js';
import EnergySkateParkColorScheme from './EnergySkateParkColorScheme.js';

const propertiesSpeedStringProperty = EnergySkateParkStrings.speedometer.labelStringProperty;

class EnergySkateParkCheckboxItem extends Checkbox {

  /**
   * @param {Property} property - the checkbox will update this Property
   * @param {Node} icon
   * @param {Tandem} tandem
   * @param {Object} [options]
   */
  constructor( property, icon, tandem, options ) {

    options = merge( {

      // {BooleanProperty|null} - whether or not the user has controlled this checkbox
      // we set to true if we detect input on this control. The simulation has
      // different behavior for when the user directly controls the Checkbox Property
      // vs whether the Property gets set internally by the simulation
      userControlledProperty: null,

      // {Tandem}
      tandem: tandem
    }, options );

    super( property, icon, options );

    if ( options.userControlledProperty ) {

      // add a listener to the Checkbox that resets the data upon user interaction
      const userControlledListener = new PressListener( {
        press: () => options.userControlledProperty.set( true ),
        release: () => options.userControlledProperty.set( false )
      } );
      this.addInputListener( userControlledListener );
    }
  }

  /**
   * In icon for the pie chart.
   * @public
   *
   * @param {Tandem} tandem
   * @param {Object} [options]
   * @returns {Node}
   */
  static createPieChartIcon( tandem, options ) {
    options = merge( {
      scale: 1
    }, options );

    const radius = 10;
    const arc = new Shape().moveTo( 0, 0 ).ellipticalArc( 0, 0, radius, radius, 0, -Math.PI / 2, 0, false ).lineTo( 0, 0 );
    return new Node( {
      tandem: tandem,
      children: [
        new Circle( radius, { fill: EnergySkateParkColorScheme.potentialEnergy, lineWidth: 0.5, stroke: 'black' } ),
        new Path( arc, {
          tandem: tandem.createTandem( 'kineticEnergyArc' ),
          fill: EnergySkateParkColorScheme.kineticEnergy, lineWidth: 0.5, stroke: 'black'
        } )
      ],
      scale: options.scale
    } );
  }

  /**
   * An icon for the grid.
   * @public
   *
   * @param {Tandem} tandem
   * @param {Object} [options]
   * @returns {Node}
   */
  static createGridIcon( tandem, options ) {
    options = merge( {
      scale: 1
    }, options );
    return new Node( {
      tandem: tandem,
      children: [
        new Rectangle( 0, 0, 20, 20, { fill: 'white', stroke: 'black', lineWidth: 0.5 } ),
        new Line( 0, 10, 20, 10, { stroke: 'black', lineWidth: 1 } ),
        new Line( 0, 5, 20, 5, { stroke: 'black', lineWidth: 0.5 } ),
        new Line( 0, 15, 20, 15, { stroke: 'black', lineWidth: 0.5 } ),
        new Line( 10, 0, 10, 20, { stroke: 'black', lineWidth: 1 } ),
        new Line( 5, 0, 5, 20, { stroke: 'black', lineWidth: 0.5 } ),
        new Line( 15, 0, 15, 20, { stroke: 'black', lineWidth: 0.5 } )
      ],
      scale: options.scale
    } );
  }

  /**
   * An icon for the speedometer.
   * @public
   *
   * @param {Tandem} tandem
   * @param {Object} [options]
   * @returns {Node}
   */
  static createSpeedometerIcon( tandem, options ) {
    options = merge( {
      scale: 1
    }, options );
    const node = new GaugeNode( new Property( 0 ), propertiesSpeedStringProperty, new Range( 0, 10 ),
      {
        pickable: false,
        tandem: tandem.createTandem( 'gaugeNode' )
      } );
    node.scale( ( 20 / node.width ) * options.scale );
    return node;
  }

  /**
   * An icon for the reference height control.
   * @public
   *
   * @param {Tandem} tandem
   * @returns {Node}
   */
  static createReferenceHeightIcon( tandem ) {

    // a dashed, stroked line will be drawn with overlapping rectangles, the background rectangle is slightly taller
    // to mimic stroke
    const width = 19.65;
    const height = 3.7;
    const lineDash = [ width / 5, width / 5 ]; // produces 3 segments
    const lineShape = Shape.lineSegment( 0, 0, width, 0 );
    const backgroundLine = new Path( lineShape, {
      lineDash: lineDash,
      lineWidth: height,
      stroke: EnergySkateParkColorScheme.referenceLineStroke
    } );
    const foregroundLine = new Path( lineShape, {
      lineDash: lineDash,
      lineWidth: height * 0.8,
      stroke: EnergySkateParkColorScheme.referenceLineFill
    } );

    return new Node( { children: [ backgroundLine, foregroundLine ] } );
  }

  /**
   * An icon for the "Path" control.
   * @public
   *
   * @param {Tandem} tandem
   * @returns {Node}
   */
  static createSamplesIcon( tandem ) {

    const circleRadius = 3;

    // positions of circles, for circles and path
    const pointDistance = 3 * circleRadius;
    const firstCenter = new Vector2( -pointDistance, -pointDistance );
    const secondCenter = new Vector2( 0, 0 );
    const thirdCenter = new Vector2( pointDistance, -pointDistance );

    // create three circles
    const circleShape = new Shape();
    circleShape.circle( firstCenter, circleRadius ).newSubpath()
      .circle( secondCenter, circleRadius ).newSubpath()
      .circle( thirdCenter, circleRadius );
    const circlesPath = new Path( circleShape, {
      fill: EnergySkateParkColorScheme.pathFill,
      stroke: EnergySkateParkColorScheme.pathStroke
    } );

    // line connecting each circle
    const lineShape = new Shape().moveToPoint( firstCenter )
      .quadraticCurveToPoint( firstCenter.plusXY( 0, pointDistance ), secondCenter )
      .quadraticCurveToPoint( thirdCenter.plusXY( 0, pointDistance ), thirdCenter );
    const linePath = new Path( lineShape, {
      stroke: EnergySkateParkColorScheme.pathStroke,
      lineWidth: 1
    } );

    return new Node( { children: [ linePath, circlesPath ] } );
  }

  /**
   * Create an icon for the "Sticking to Track" checkbox, a small section of track with the skater's center of
   * mass dot on it.
   * @public
   *
   * @param {Tandem} tandem
   * @returns {Node}
   */
  static createStickingToTrackIcon() {
    const iconWidth = 19;

    const trackRectangle = new Rectangle( 0, 0, iconWidth, 6.8, {
      fill: EnergySkateParkColorScheme.roadFill
    } );

    const trackDashes = new Line( 0, 0, iconWidth, 0, {
      fill: EnergySkateParkColorScheme.roadLine,
      stroke: EnergySkateParkColorScheme.roadLine,
      center: trackRectangle.center,
      lineWidth: 1,
      lineDash: [ 2.5, 1.8 ]
    } );

    const centerOfMassCircle = new Circle( 2, {
      fill: EnergySkateParkColorScheme.particleCircle,
      opacity: 0.7,
      center: trackRectangle.center
    } );

    return new Node( { children: [ trackRectangle, trackDashes, centerOfMassCircle ] } );
  }
}

energySkatePark.register( 'EnergySkateParkCheckboxItem', EnergySkateParkCheckboxItem );
export default EnergySkateParkCheckboxItem;