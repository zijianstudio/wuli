// Copyright 2023, University of Colorado Boulder
/**
 * Visual Node for the Elliptical Orbit based on the Orbital Parameters
 *
 * @author Agustín Vallejo
 */

import { Shape } from '../../../../kite/js/imports.js';
import EllipticalOrbitEngine from '../model/EllipticalOrbitEngine.js';
import { Circle, Node, Path, RichText, Text, TextOptions } from '../../../../scenery/js/imports.js';
import ModelViewTransform2 from '../../../../phetcommon/js/view/ModelViewTransform2.js';
import Multilink, { UnknownMultilink } from '../../../../axon/js/Multilink.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import KeplersLawsModel from '../model/KeplersLawsModel.js';
import XNode from '../../../../scenery-phet/js/XNode.js';
import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import TReadOnlyProperty from '../../../../axon/js/TReadOnlyProperty.js';
import SolarSystemCommonColors from '../../../../solar-system-common/js/SolarSystemCommonColors.js';
import SolarSystemCommonConstants from '../../../../solar-system-common/js/SolarSystemCommonConstants.js';
import { combineOptions } from '../../../../phet-core/js/optionize.js';
import KeplersLawsStrings from '../../../../keplers-laws/js/KeplersLawsStrings.js';
import keplersLaws from '../../keplersLaws.js';
import NumberDisplay from '../../../../scenery-phet/js/NumberDisplay.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import Range from '../../../../dot/js/Range.js';
import Utils from '../../../../dot/js/Utils.js';
import KeplersLawsConstants from '../../KeplersLawsConstants.js';


export default class EllipticalOrbitNode extends Path {
  private readonly orbit: EllipticalOrbitEngine;
  private readonly shapeMultilink: UnknownMultilink;
  public readonly topLayer: Node;

  public constructor(
    model: KeplersLawsModel,
    modelViewTransformProperty: TReadOnlyProperty<ModelViewTransform2>
  ) {

    // Passing in a null shape, since it will be updated later
    super( null, {
      lineWidth: 3,
      stroke: SolarSystemCommonColors.orbitColorProperty
    } );

    this.orbit = model.engine;

    // Top layer is a field because it has to be accessed from the ScreenView and added as a child there
    this.topLayer = new Node( { visibleProperty: this.orbit.allowedOrbitProperty } );
    const labelsLayer = new Node( { visibleProperty: this.orbit.allowedOrbitProperty } );
    const firstLawLayer = new Node( { visibleProperty: this.orbit.allowedOrbitProperty } );
    const secondLawLayer = new Node( { visibleProperty: this.orbit.allowedOrbitProperty } );
    const thirdLawLayer = new Node( { visibleProperty: this.orbit.allowedOrbitProperty } );

    // Also Top Layer is not added as child because it's a child of the ScreenView, just controlled in here
    this.addChild( labelsLayer );
    this.addChild( firstLawLayer );
    this.addChild( secondLawLayer );
    this.addChild( thirdLawLayer );

    // Text Nodes
    const aLabelNode = new Text( KeplersLawsStrings.symbols.semiMajorAxisStringProperty, combineOptions<TextOptions>( {
      visibleProperty: DerivedProperty.or(
        [ model.semiaxisVisibleProperty, model.semiMajorAxisVisibleProperty, model.eccentricityVisibleProperty ]
      )
    }, SolarSystemCommonConstants.TEXT_OPTIONS, {
      scale: 1.5,
      stroke: 'orange',
      fill: 'orange'
    } ) );
    const bLabelNode = new Text( KeplersLawsStrings.symbols.semiMinorAxisStringProperty, combineOptions<TextOptions>(
      {
        visibleProperty: model.semiaxisVisibleProperty
      }, SolarSystemCommonConstants.TEXT_OPTIONS, {
        scale: 1.5,
        stroke: 'orange',
        fill: 'orange'
      } ) );
    const cLabelNode = new Text( KeplersLawsStrings.symbols.focalDistanceStringProperty, combineOptions<TextOptions>(
      {
        visibleProperty: new DerivedProperty(
          [
            model.eccentricityVisibleProperty,
            model.engine.eccentricityProperty
          ],
          ( visible, e ) => {
            return visible && ( e > 0 );
          }
        )
      }, SolarSystemCommonConstants.TEXT_OPTIONS, {
        scale: 1.5,
        stroke: SolarSystemCommonColors.thirdBodyColorProperty,
        fill: SolarSystemCommonColors.thirdBodyColorProperty
      } ) );
    const stringLabelNode1 = new RichText( 'd<sub>1', combineOptions<TextOptions>(
      {
        visibleProperty: new DerivedProperty(
          [
            model.stringsVisibleProperty,
            model.engine.eccentricityProperty
          ],
          ( visible, e ) => {
            return visible && ( e > 0 );
          }
        )
      }, SolarSystemCommonConstants.TEXT_OPTIONS, {
        scale: 1.5,
        stroke: '#ccb285',
        fill: '#ccb285'
      } ) );
    const stringLabelNode2 = new RichText( 'd<sub>2', combineOptions<TextOptions>(
      {
        visibleProperty: new DerivedProperty(
          [
            model.stringsVisibleProperty,
            model.engine.eccentricityProperty
          ],
          ( visible, e ) => {
            return visible && ( e > 0 );
          }
        )
      }, SolarSystemCommonConstants.TEXT_OPTIONS, {
        scale: 1.5,
        stroke: '#ccb285',
        fill: '#ccb285'
      } ) );
    const radiusLabelNode = new RichText( 'r', combineOptions<TextOptions>( {
      visibleProperty: new DerivedProperty(
        [
          model.stringsVisibleProperty,
          model.engine.eccentricityProperty
        ],
        ( visible, e ) => {
          return visible && ( e === 0 );
        }
      )
    }, SolarSystemCommonConstants.TEXT_OPTIONS, {
      scale: 1.5,
      stroke: '#ccb285',
      fill: '#ccb285'
    } ) );

    // FIRST LAW: Axis, foci, and Ellipse definition lines
    const axisPath = new Path( null, {
      stroke: SolarSystemCommonColors.foregroundProperty,
      lineWidth: 2,
      visibleProperty: DerivedProperty.or(
        [ model.axisVisibleProperty, model.semiMajorAxisVisibleProperty ]
      )
    } );
    const semiAxisPath = new Path( null, {
      stroke: 'orange',
      lineWidth: 3,
      visibleProperty: model.semiaxisVisibleProperty
    } );
    const focalDistancePath = new Path( null, {
      stroke: SolarSystemCommonColors.thirdBodyColorProperty,
      lineWidth: 3,
      visibleProperty: model.eccentricityVisibleProperty
    } );
    const stringsPath = new Path( null, {
      stroke: '#ccb285',
      lineWidth: 3,
      visibleProperty: model.stringsVisibleProperty,
      lineDash: [ 10, 2 ]
    } );
    const fociOptions = {
      fill: '#29ABE2',
      stroke: SolarSystemCommonColors.backgroundProperty,
      scale: 0.8,
      center: Vector2.ZERO,
      visibleProperty: model.fociVisibleProperty
    };
    const foci = [
      new XNode( fociOptions ),
      new XNode( fociOptions )
    ];

    // SECOND LAW: Periapsis and Apoapsis
    const periapsis = new XNode( {
      fill: 'gold',
      stroke: SolarSystemCommonColors.foregroundProperty,
      center: Vector2.ZERO,
      visibleProperty: new DerivedProperty(
        [ model.periapsisVisibleProperty, this.orbit.eccentricityProperty ],
        ( visible, e ) => {
          return visible && ( e > 0 );
        } )
    } );
    const apoapsis = new XNode( {
      fill: SolarSystemCommonColors.thirdBodyColorProperty,
      stroke: SolarSystemCommonColors.foregroundProperty,
      center: Vector2.ZERO,
      visibleProperty: new DerivedProperty(
        [ model.apoapsisVisibleProperty, this.orbit.eccentricityProperty ],
        ( visible, e ) => {
          return visible && ( e > 0 );
        } )
    } );

    // Arrays of orbital divisions' dots and areas
    const orbitDivisions: Circle[] = [];
    const areaPaths: Path[] = [];
    const areaValueProperties: NumberProperty[] = [];
    const areaValueNumberDisplays: Node[] = [];

    const areaValueRange = new Range( 0, 1 );

    for ( let i = 0; i < KeplersLawsConstants.MAX_ORBITAL_DIVISIONS; i++ ) {
      orbitDivisions.push( new Circle( 4, {
        fill: 'black',
        stroke: SolarSystemCommonColors.orbitColorProperty,
        lineWidth: 3,
        center: Vector2.ZERO,
        visible: false
      } ) );
      areaPaths.push( new Path( null, {
        fill: SolarSystemCommonColors.orbitColorProperty
      } ) );
      const areaValueProperty = new NumberProperty( 0 );
      areaValueProperties.push( areaValueProperty );
      areaValueNumberDisplays.push( new NumberDisplay( areaValueProperty, areaValueRange, {
        scale: 0.7,
        opacity: 0.8,
        numberFormatter: ( value: number ) => {
          return Utils.toFixed( value, 2 ) + 'AU²';
        }
      } ) );
    }

    // Nodes for the orbital divisions' dots and areas
    // There are Nodes and arrays separately to access them by index
    const orbitDivisionsNode = new Node();
    const areaPathsNode = new Node( {
      visibleProperty: model.isSecondLawProperty
    } );
    const areaValuesNode = new Node( {
      visibleProperty: DerivedProperty.and( [ model.isSecondLawProperty, model.areaValuesVisibleProperty ] )
    } );
    orbitDivisions.forEach( node => { orbitDivisionsNode.addChild( node ); } );
    areaPaths.forEach( node => { areaPathsNode.addChild( node ); } );
    areaValueNumberDisplays.forEach( node => { areaValuesNode.addChild( node ); } );

    // THIRD LAW: SemiMajor axis
    const semiMajorAxisPath = new Path( null, {
      stroke: 'orange',
      lineWidth: 3,
      visibleProperty: DerivedProperty.or(
        [ model.semiaxisVisibleProperty, model.semiMajorAxisVisibleProperty, model.eccentricityVisibleProperty ]
      )
    } );
    const trackPath = new Path( null, {
      stroke: SolarSystemCommonColors.thirdBodyColorProperty,
      lineWidth: 5,
      visibleProperty: model.periodVisibleProperty
    } );

    // Text Nodes
    labelsLayer.addChild( aLabelNode );
    labelsLayer.addChild( bLabelNode );
    labelsLayer.addChild( cLabelNode );
    labelsLayer.addChild( stringLabelNode1 );
    labelsLayer.addChild( stringLabelNode2 );
    labelsLayer.addChild( radiusLabelNode );


    // First Law: Axis, foci, and Ellipse definition lines
    firstLawLayer.addChild( axisPath );
    firstLawLayer.addChild( semiAxisPath );
    firstLawLayer.addChild( stringsPath );
    firstLawLayer.addChild( focalDistancePath );

    // Second Law: Periapsis, Apoapsis and orbital division dots and areas
    secondLawLayer.addChild( areaPathsNode );
    secondLawLayer.addChild( periapsis );
    secondLawLayer.addChild( apoapsis );
    secondLawLayer.addChild( orbitDivisionsNode );
    secondLawLayer.addChild( areaValuesNode );

    // Third Law: SemiMajor axis, and track
    thirdLawLayer.addChild( semiMajorAxisPath );
    thirdLawLayer.addChild( trackPath );

    this.topLayer.addChild( foci[ 0 ] );
    this.topLayer.addChild( foci[ 1 ] );

    const updatedOrbit = () => {
      // Non allowed orbits will show up as dashed lines
      this.lineDash = this.orbit.allowedOrbitProperty.value ? [ 0 ] : [ 5 ];

      const scale = modelViewTransformProperty.value.modelToViewDeltaX( 1 );

      // Ellipse distances in model coordinates
      const a = this.orbit.a;
      const b = this.orbit.b;
      const c = this.orbit.c;
      const e = this.orbit.e;
      const center = new Vector2( -c, 0 ).times( scale );

      const radiusX = scale * a;
      const radiusY = scale * b;
      const radiusC = scale * c; // Focal point

      const applyTransformation = ( point: Node ) => {
        point.translation = modelViewTransformProperty.value.modelToViewPosition( center.times( 1 / scale ) );
        point.rotation = 0;
        point.rotateAround( point.translation.add( center.times( -1 ) ), -this.orbit.w );
      };

      // The ellipse is translated and rotated so its children can use local coordinates
      applyTransformation( this );
      this.shape = new Shape().ellipse( 0, 0, radiusX, radiusY, 0 );

      // Same transformations set to TopLayer because it's not directly a child of this
      applyTransformation( this.topLayer );

      // The Number Display for areas is scaled according to the orbit size
      const numberDisplayPositionScaling = ( vectorMagnitude: number ) => {
        // Scaling the vector sum of the dot positions
        const minScaling = 1.2;
        const maxScaling = 2.0;

        // Here, a1 and a2 are the semi-major and semi-minor axes of the ellipse
        return Math.pow( Utils.clamp(
          Utils.linear( 50, 200, maxScaling, minScaling, vectorMagnitude ),
          minScaling, maxScaling ), ( 1 - model.engine.e * model.engine.e ) );
      };

      // FIRST LAW -------------------------------------------
      // Axis of the ellipse
      const axis = new Shape().moveTo( -radiusX, 0 ).lineTo( radiusX, 0 );
      axis.moveTo( 0, -radiusY ).lineTo( 0, radiusY );
      axisPath.shape = axis;

      // Semi-axis of the ellipse
      const semiAxis = new Shape().moveTo( 0, 0 ).lineTo( -radiusX, 0 );
      // const semiAxis = new ArrowShape( 0, 0, -radiusX, 0, {} );
      semiAxis.moveTo( 0, 0 ).lineTo( 0, radiusY );
      semiAxisPath.shape = semiAxis;
      aLabelNode.center = new Vector2( -radiusX / 2, 10 );
      aLabelNode.rotation = this.orbit.w;
      bLabelNode.center = new Vector2( -15, radiusY / 2 );
      bLabelNode.rotation = this.orbit.w;

      focalDistancePath.shape = new Shape().moveTo( 0, 0 ).lineTo( e * radiusX, 0 );
      cLabelNode.center = new Vector2( e * radiusX / 2, 10 );
      cLabelNode.rotation = this.orbit.w;

      // Strings of the foci
      const bodyPosition = this.orbit.createPolar( -this.orbit.nu ).times( scale );
      const stringsShape = new Shape().moveTo( -radiusC, 0 ).lineTo( ( bodyPosition.x + radiusC ), bodyPosition.y );
      stringsShape.moveTo( radiusC, 0 ).lineTo( ( bodyPosition.x + radiusC ), bodyPosition.y );
      stringsPath.shape = stringsShape;

      const labelsYPosition = bodyPosition.y / 2;
      const offsetVector = new Vector2( 0, 15 ).rotated( bodyPosition.angle );
      stringLabelNode1.center = new Vector2( ( bodyPosition.x / 2 + radiusC ), labelsYPosition ).add( offsetVector );
      stringLabelNode1.rotation = this.orbit.w;
      stringLabelNode2.center = new Vector2( ( bodyPosition.x / 2 ), labelsYPosition ).add( offsetVector );
      stringLabelNode2.rotation = this.orbit.w;
      radiusLabelNode.center = new Vector2( ( bodyPosition.x / 2 ), labelsYPosition ).add( offsetVector );
      radiusLabelNode.rotation = this.orbit.w;

      //Foci
      foci[ 0 ].rotation = this.orbit.w + Math.PI / 4;
      foci[ 0 ].center = new Vector2( -radiusC, 0 );

      foci[ 1 ].rotation = this.orbit.w + Math.PI / 4;
      foci[ 1 ].center = new Vector2( radiusC, 0 );

      // SECOND LAW -------------------------------------------
      // Periapsis and apoapsis
      periapsis.center = new Vector2( scale * ( a * ( 1 - e ) + c ), 0 );
      apoapsis.center = new Vector2( -scale * ( a * ( 1 + e ) - c ), 0 );

      // Drawing orbital divisions and areas
      this.orbit.orbitalAreas.forEach( ( area, i ) => {
        orbitDivisions[ i ].visible = model.isSecondLawProperty.value && area.active;
        areaPaths[ i ].visible = model.isSecondLawProperty.value && area.active;
        areaValueNumberDisplays[ i ].visible = model.isSecondLawProperty.value && area.active;

        let numberDisplayPosition = new Vector2( 0, 0 );
        let numberDisplayScaling = 1;

        if ( i < model.periodDivisionProperty.value ) {
          // Set the center of the orbit's divisions dot
          const dotPosition = area.dotPosition.times( scale ).minus( center );
          orbitDivisions[ i ].center = dotPosition;
          orbitDivisions[ i ].fill = SolarSystemCommonColors.orbitColorProperty.value.darkerColor( Math.pow( 1 - area.completion, 10 ) );

          const start = area.startPosition.times( scale ).minus( center );
          const end = area.endPosition.times( scale ).minus( center );
          const startAngle = Math.atan2( start.y / radiusY, start.x / radiusX );
          const endAngle = Math.atan2( end.y / radiusY, end.x / radiusX );

          // Mean value between start and end
          numberDisplayPosition = model.engine.createPolar( ( area.startAngle + area.endAngle ) / 2 ).times( scale ).minus( center );

          if ( model.periodDivisionProperty.value === 2 ) {
            numberDisplayPosition = new Vector2( 0, radiusY * Math.pow( -1, i ) );
          }

          numberDisplayScaling = numberDisplayPositionScaling( numberDisplayPosition.magnitude );
          areaValueNumberDisplays[ i ].center = numberDisplayPosition.times( numberDisplayScaling );
          areaValueNumberDisplays[ i ].rotation = this.orbit.w;

          // Calculates the total area of the ellipse / the number of divisions
          const fullSegmentArea = this.orbit.segmentArea * SolarSystemCommonConstants.POSITION_MULTIPLIER * SolarSystemCommonConstants.POSITION_MULTIPLIER;
          areaValueProperties[ i ].value = area.alreadyEntered ?
                                           ( area.insideProperty.value ? fullSegmentArea * area.completion : fullSegmentArea )
                                                               : 0;

          // Activate area path
          // Opacity lowered down to 0.8 for stylistic purposes
          areaPaths[ i ].opacity = area.alreadyEntered ? area.insideProperty.value ? 1 : 0.7 * area.completion + 0.1 : 0;
          areaPaths[ i ].shape = new Shape().moveTo( radiusC, 0 ).ellipticalArc(
            0, 0, radiusX, radiusY, 0, startAngle, endAngle, false
          ).close();
        }
      } );


      // THIRD LAW -------------------------------------------
      // Semi-major axis
      semiMajorAxisPath.shape = new Shape().moveTo( 0, 0 ).lineTo( -radiusX, 0 );

      bodyPosition.subtract( center );
      const endAngle = Math.atan2( bodyPosition.y / radiusY, bodyPosition.x / radiusX );
      // applyTransformation( trackPath );
      const trackShape = new Shape().ellipticalArc( 0, 0, radiusX, radiusY, 0, 0, endAngle, this.orbit.retrograde );
      trackPath.shape = trackShape;
    };

    this.orbit.changedEmitter.addListener( updatedOrbit );

    this.shapeMultilink = Multilink.multilink(
      [
        modelViewTransformProperty,
        model.periodDivisionProperty,
        model.selectedLawProperty
      ],
      () => updatedOrbit() );
  }
}

keplersLaws.register( 'EllipticalOrbitNode', EllipticalOrbitNode );