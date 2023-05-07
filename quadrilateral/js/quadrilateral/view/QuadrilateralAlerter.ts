// Copyright 2021-2023, University of Colorado Boulder

/**
 * Responsible for generating the real-time feedback alerts for the simulation and actually voicing them at the right
 * time.
 *
 * This Alerter mostly generates strings by comparing the state of the quadrilateral to a snapshot of
 * the geometric properties that were saved the last time the quadrilateral was described (making heavy use of
 * QuadrilateralShapeSnapshot).
 *
 * @author Jesse Greenberg (PhET Interactive Simulations)
 */

import quadrilateral from '../../quadrilateral.js';
import QuadrilateralModel from '../model/QuadrilateralModel.js';
import Utterance from '../../../../utterance-queue/js/Utterance.js';
import Alerter from '../../../../scenery-phet/js/accessibility/describers/Alerter.js';
import QuadrilateralScreenView from './QuadrilateralScreenView.js';
import { Voicing } from '../../../../scenery/js/imports.js';
import ResponsePacket from '../../../../utterance-queue/js/ResponsePacket.js';
import QuadrilateralStrings from '../../QuadrilateralStrings.js';
import QuadrilateralShapeSnapshot from '../model/QuadrilateralShapeSnapshot.js';
import QuadrilateralSide from '../model/QuadrilateralSide.js';
import QuadrilateralShapeModel from '../model/QuadrilateralShapeModel.js';
import StringUtils from '../../../../phetcommon/js/util/StringUtils.js';
import MovementAlerter from '../../../../scenery-phet/js/accessibility/describers/MovementAlerter.js';
import ModelViewTransform2 from '../../../../phetcommon/js/view/ModelViewTransform2.js';
import QuadrilateralVertex from '../model/QuadrilateralVertex.js';
import Utils from '../../../../dot/js/Utils.js';
import NamedQuadrilateral from '../model/NamedQuadrilateral.js';
import QuadrilateralDescriber, { NullableQuadrilateralStringType } from './QuadrilateralDescriber.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import QuadrilateralVertexDescriber from './QuadrilateralVertexDescriber.js';

// constants - Voicing strings are not translatable so we just use the StringProperty initial value
const foundShapePatternString = QuadrilateralStrings.a11y.voicing.foundShapePatternStringProperty.value;
const aBString = QuadrilateralStrings.a11y.aBStringProperty.value;
const bCString = QuadrilateralStrings.a11y.bCStringProperty.value;
const cDString = QuadrilateralStrings.a11y.cDStringProperty.value;
const dAString = QuadrilateralStrings.a11y.dAStringProperty.value;
const oppositeSidesTiltPatternString = QuadrilateralStrings.a11y.voicing.oppositeSidesTiltPatternStringProperty.value;
const oppositeSidesInParallelPatternString = QuadrilateralStrings.a11y.voicing.oppositeSidesInParallelPatternStringProperty.value;
const oppositeSidesInParallelAsCornersChangeEquallyPatternString = QuadrilateralStrings.a11y.voicing.oppositeSidesInParallelAsCornersChangeEquallyPatternStringProperty.value;
const oppositeSidesTiltAsShapeChangesPatternString = QuadrilateralStrings.a11y.voicing.oppositeSidesTiltAsShapeChangesPatternStringProperty.value;
const oppositeSidesEqualAsShapeChangesPatternString = QuadrilateralStrings.a11y.voicing.oppositeSidesEqualAsShapeChangesPatternStringProperty.value;
const maintainingAParallelogramAngleResponseString = QuadrilateralStrings.a11y.voicing.maintainingAParallelogramAngleResponseStringProperty.value;
const maintainingAParallelogramLengthResponsePatternString = QuadrilateralStrings.a11y.voicing.maintainingAParallelogramLengthResponsePatternStringProperty.value;
const maintainingATrapezoidAsShapeChangesPatternString = QuadrilateralStrings.a11y.voicing.maintainingATrapezoidAsShapeChangesPatternStringProperty.value;
const allRightAnglesAsShapeChangesPatternString = QuadrilateralStrings.a11y.voicing.allRightAnglesAsShapeChangesPatternStringProperty.value;
const maintainingARhombusString = QuadrilateralStrings.a11y.voicing.maintainingARhombusStringProperty.value;
const allSidesEqualAsShapeChangesPatternString = QuadrilateralStrings.a11y.voicing.allSidesEqualAsShapeChangesPatternStringProperty.value;
const cornerFlatAsShapeChangesPatternString = QuadrilateralStrings.a11y.voicing.cornerFlatAsShapeChangesPatternStringProperty.value;
const adjacentSidesChangeEquallyAsShapeChangesPatternString = QuadrilateralStrings.a11y.voicing.adjacentSidesChangeEquallyAsShapeChangesPatternStringProperty.value;
const allSidesTiltAwayFromParallelString = QuadrilateralStrings.a11y.voicing.allSidesTiltAwayFromParallelStringProperty.value;
const allSidesTiltAwayFromParallelAsShapeChangesPatternString = QuadrilateralStrings.a11y.voicing.allSidesTiltAwayFromParallelAsShapeChangesPatternStringProperty.value;
const tiltString = QuadrilateralStrings.a11y.voicing.tiltStringProperty.value;
const straightenString = QuadrilateralStrings.a11y.voicing.straightenStringProperty.value;
const biggerString = QuadrilateralStrings.a11y.voicing.biggerStringProperty.value;
const smallerString = QuadrilateralStrings.a11y.voicing.smallerStringProperty.value;
const vertexAString = QuadrilateralStrings.vertexAStringProperty.value;
const vertexBString = QuadrilateralStrings.vertexBStringProperty.value;
const vertexCString = QuadrilateralStrings.vertexCStringProperty.value;
const vertexDString = QuadrilateralStrings.vertexDStringProperty.value;
const backString = QuadrilateralStrings.a11y.voicing.backStringProperty.value;
const goneString = QuadrilateralStrings.a11y.voicing.goneStringProperty.value;
const cornersBackString = QuadrilateralStrings.a11y.voicing.cornersBackStringProperty.value;
const cornersGoneString = QuadrilateralStrings.a11y.voicing.cornersGoneStringProperty.value;
const cornerDetectedPatternString = QuadrilateralStrings.a11y.voicing.cornerDetectedPatternStringProperty.value;
const shorterString = QuadrilateralStrings.a11y.voicing.sideDragObjectResponse.shorterStringProperty.value;
const longerString = QuadrilateralStrings.a11y.voicing.sideDragObjectResponse.longerStringProperty.value;
const widerString = QuadrilateralStrings.a11y.voicing.vertexDragObjectResponse.widerStringProperty.value;
const vertexDragSmallerString = QuadrilateralStrings.a11y.voicing.vertexDragObjectResponse.smallerStringProperty.value;
const vertexDragObjectResponsePatternString = QuadrilateralStrings.a11y.voicing.vertexDragObjectResponse.vertexDragObjectResponsePatternStringProperty.value;
const adjacentSidesChangePatternString = QuadrilateralStrings.a11y.voicing.sideDragObjectResponse.adjacentSidesChangePatternStringProperty.value;
const rightAngleString = QuadrilateralStrings.a11y.voicing.rightAngleStringProperty.value;
const angleFlatString = QuadrilateralStrings.a11y.voicing.angleFlatStringProperty.value;
const angleComparisonPatternString = QuadrilateralStrings.a11y.voicing.angleComparisonPatternStringProperty.value;
const oppositeCornerString = QuadrilateralStrings.a11y.voicing.oppositeCornerStringProperty.value;
const adjacentCornersEqualString = QuadrilateralStrings.a11y.voicing.adjacentCornersEqualStringProperty.value;
const adjacentCornersRightAnglesString = QuadrilateralStrings.a11y.voicing.adjacentCornersRightAnglesStringProperty.value;
const progressStatePatternString = QuadrilateralStrings.a11y.voicing.progressStatePatternStringProperty.value;
const equalToOppositeCornerEqualToAdjacentCornersString = QuadrilateralStrings.a11y.voicing.equalToOppositeCornerEqualToAdjacentCornersStringProperty.value;
const adjacentSidesInLinePatternString = QuadrilateralStrings.a11y.voicing.adjacentSidesInLinePatternStringProperty.value;
const equalToAdjacentCornersString = QuadrilateralStrings.a11y.voicing.equalToAdjacentCornersStringProperty.value;
const adjacentSidesChangeInLengthString = QuadrilateralStrings.a11y.voicing.sideDragObjectResponse.adjacentSidesChangeInLengthStringProperty.value;
const parallelAdjacentSidesChangePatternString = QuadrilateralStrings.a11y.voicing.sideDragObjectResponse.parallelAdjacentSidesChangePatternStringProperty.value;
const equalAdjacentSidesChangePatternString = QuadrilateralStrings.a11y.voicing.sideDragObjectResponse.equalAdjacentSidesChangePatternStringProperty.value;
const equalToAdjacentSidesString = QuadrilateralStrings.a11y.voicing.sideDragObjectResponse.equalToAdjacentSidesStringProperty.value;
const adjacentSidesEqualString = QuadrilateralStrings.a11y.voicing.sideDragObjectResponse.adjacentSidesEqualStringProperty.value;
const adjacentSidesParallelString = QuadrilateralStrings.a11y.voicing.sideDragObjectResponse.adjacentSidesParallelStringProperty.value;
const equalToOneAdjacentSideString = QuadrilateralStrings.a11y.voicing.sideDragObjectResponse.equalToOneAdjacentSideStringProperty.value;
const twoSidesEqualString = QuadrilateralStrings.a11y.voicing.sideDragObjectResponse.twoSidesEqualStringProperty.value;
const threeSidesEqualString = QuadrilateralStrings.a11y.voicing.sideDragObjectResponse.threeSidesEqualStringProperty.value;

// A response may trigger because there is a large enough change in angle or length. The reason for the response
// will have an impact on what information is described.
type ResponseReason = 'angle' | 'length';

// constants
// If any angle changes this much since the last time a context response was generated, it is time to alert a
// new context response.
const ANGLE_RESPONSE_THRESHOLD = Math.PI / 12;

// If any of the angles have changed this much since the last time a context response was generated, angles have
// changed sufficiently to describe changes in angles over other information.
const ANGLE_DIFFERENCES_LARGE_THRESHOLD = Math.PI / 24;

export default class QuadrilateralAlerter extends Alerter {
  private readonly model: QuadrilateralModel;
  private readonly quadrilateralShapeModel: QuadrilateralShapeModel;
  private readonly modelViewTransform: ModelViewTransform2;
  private readonly describer: QuadrilateralDescriber;

  // Tracks whether the side pairs were parallel since the last time a description was generated because of a change
  // to the shape.
  private wasSideABSideCDParallel: boolean;
  private wasSideBCSideDAParallel: boolean;

  // Indicates when it is time to announce an angle/length response because that aspect of the quadrilateral shape
  // has changed enough to describe it.
  private angleResponseReady = false;
  private lengthResponseReady = false;

  // A snapshot of state variables since the last time a response was generated. When a response is generated we need
  // create strings that describe the change to the shape *since the last description*, instead of every Property
  // change.
  private previousContextResponseShapeSnapshot: QuadrilateralShapeSnapshot;
  private previousObjectResponseShapeSnapshot: QuadrilateralShapeSnapshot;

  public constructor( model: QuadrilateralModel, screenView: QuadrilateralScreenView, modelViewTransform: ModelViewTransform2, describer: QuadrilateralDescriber ) {
    super();

    this.quadrilateralShapeModel = model.quadrilateralShapeModel;
    this.model = model;
    this.modelViewTransform = modelViewTransform;
    this.describer = describer;
    this.previousContextResponseShapeSnapshot = new QuadrilateralShapeSnapshot( this.quadrilateralShapeModel );
    this.previousObjectResponseShapeSnapshot = new QuadrilateralShapeSnapshot( this.quadrilateralShapeModel );
    this.wasSideABSideCDParallel = model.quadrilateralShapeModel.sideABSideCDParallelSideChecker.areSidesParallel();
    this.wasSideBCSideDAParallel = model.quadrilateralShapeModel.sideBCSideDAParallelSideChecker.areSidesParallel();

    // The least pedagogically relevant content will alert through this Utterance and will often be interrupted.
    const lowPriorityUtterance = new Utterance( {
      priority: Utterance.LOW_PRIORITY
    } );

    // Alert content that should usually be heard, but should be interrupted by critical information about the shape
    const mediumPriorityUtterance = new Utterance( {
      priority: Utterance.MEDIUM_PRIORITY
    } );

    // Most important information about the shape that should interrupt all other alerts and never be interrupted.
    const highPriorityUtterance = new Utterance( {
      priority: Utterance.HIGH_PRIORITY
    } );

    // Upon simulation reset, reset certain state for description so that next descriptions after reset are correct
    model.resetNotInProgressProperty.link( resetNotInProgress => {
      this.previousContextResponseShapeSnapshot = new QuadrilateralShapeSnapshot( this.quadrilateralShapeModel );
      this.previousObjectResponseShapeSnapshot = new QuadrilateralShapeSnapshot( this.quadrilateralShapeModel );
    } );

    //-----------------------------------------------------------------------------------------
    // Potentially generate and alert new responses when the shape changes.
    //-----------------------------------------------------------------------------------------
    model.quadrilateralShapeModel.shapeChangedEmitter.addListener( () => {

      // Nothing about these should be heard while resetting
      if ( model.resetNotInProgressProperty.value ) {
        const responsePacket = new ResponsePacket();

        // By default, we use the lower priority Utterance that won't interrupt responses that are currently being
        // announced. If we detect a critical state change, we will use a higher priority Utterance for interruption.
        let utterance = lowPriorityUtterance;

        const previousAAngle = this.previousContextResponseShapeSnapshot.vertexAAngle;
        const previousBAngle = this.previousContextResponseShapeSnapshot.vertexBAngle;
        const previousCAngle = this.previousContextResponseShapeSnapshot.vertexCAngle;
        const previousDAngle = this.previousContextResponseShapeSnapshot.vertexDAngle;

        const aAngleDifference = previousAAngle - this.quadrilateralShapeModel.vertexA.angleProperty.value!;
        const bAngleDifference = previousBAngle - this.quadrilateralShapeModel.vertexB.angleProperty.value!;
        const cAngleDifference = previousCAngle - this.quadrilateralShapeModel.vertexC.angleProperty.value!;
        const dAngleDifference = previousDAngle - this.quadrilateralShapeModel.vertexD.angleProperty.value!;
        const angleDifferences = [ aAngleDifference, bAngleDifference, cAngleDifference, dAngleDifference ];

        // Have the angles changed enough to trigger a context response?
        this.angleResponseReady = _.some( angleDifferences, angleDifference => Math.abs( angleDifference ) > ANGLE_RESPONSE_THRESHOLD );

        const previousABLength = this.previousContextResponseShapeSnapshot.sideABLength;
        const previousBCLength = this.previousContextResponseShapeSnapshot.sideBCLength;
        const previousCDLength = this.previousContextResponseShapeSnapshot.sideCDLength;
        const previousDALength = this.previousContextResponseShapeSnapshot.sideDALength;

        const abLengthDifference = previousABLength - this.quadrilateralShapeModel.sideAB.lengthProperty.value;
        const bcLengthDifference = previousBCLength - this.quadrilateralShapeModel.sideBC.lengthProperty.value;
        const cdLengthDifference = previousCDLength - this.quadrilateralShapeModel.sideCD.lengthProperty.value;
        const daLengthDifference = previousDALength - this.quadrilateralShapeModel.sideDA.lengthProperty.value;
        const lengthDifferences = [ abLengthDifference, bcLengthDifference, cdLengthDifference, daLengthDifference ];

        // If angles have changed enough, the response information will describe the changing angles instead
        // of other information (like changing length).
        const angleDifferencesLarge = _.some( angleDifferences, angleDifference => angleDifference > ANGLE_DIFFERENCES_LARGE_THRESHOLD );

        // Have the lengths changed enough to trigger a context response?
        this.lengthResponseReady = _.some( lengthDifferences, lengthDifference => Math.abs( lengthDifference ) > QuadrilateralSide.SIDE_SEGMENT_LENGTH ) && !angleDifferencesLarge;

        const sideABSideCDParallelAfter = this.quadrilateralShapeModel.sideABSideCDParallelSideChecker.areSidesParallel();
        const sideBCSideDAParallelAfter = this.quadrilateralShapeModel.sideBCSideDAParallelSideChecker.areSidesParallel();

        // If we go from zero parallel side pairs to at least one pair, trigger a new context response so that we hear
        // when sides become parallel. These checks have to be relative to every shape change, so state variables are
        // set immediately instead of in a QuadrilateralShapeSnapshot.
        const parallelSideResponseReady = ( !this.wasSideABSideCDParallel && !this.wasSideBCSideDAParallel ) && ( sideABSideCDParallelAfter || sideBCSideDAParallelAfter );
        this.wasSideABSideCDParallel = sideABSideCDParallelAfter;
        this.wasSideBCSideDAParallel = sideBCSideDAParallelAfter;

        //-----------------------------------------------------------------------------------------
        // First, create the context response - the description of the overall shape
        //-----------------------------------------------------------------------------------------
        const shapeNameChangeResponse = this.getShapeNameChangeResponse();
        if ( shapeNameChangeResponse ) {

          // Shape name changed, this is the most important information.
          responsePacket.contextResponse = shapeNameChangeResponse!;
          utterance = highPriorityUtterance;
        }
        else if ( this.angleResponseReady || this.lengthResponseReady || parallelSideResponseReady ) {

          // Shape attributes changed sufficiently to describe changes
          const thisResponseReason = angleDifferencesLarge ? 'angle' : 'length';

          if ( this.previousContextResponseShapeSnapshot.namedQuadrilateral === this.quadrilateralShapeModel.shapeNameProperty.value ) {

            // the shape has changed enough to provide a context response, but the named quadrilateral has not
            // changed, so we provide a unique alert specific to the shape maintenance
            const shapeMaintenanceResponse = this.getShapeMaintenanceContextResponse( this.quadrilateralShapeModel.shapeNameProperty.value, this.previousContextResponseShapeSnapshot, thisResponseReason );
            responsePacket.contextResponse = shapeMaintenanceResponse;

          }
          else {
            const tiltChangeResponse = this.getShapeChangeResponse( this.quadrilateralShapeModel, this.previousContextResponseShapeSnapshot, thisResponseReason );
            responsePacket.contextResponse = tiltChangeResponse!;
          }

          utterance = mediumPriorityUtterance;
        }

        //-----------------------------------------------------------------------------------------
        // Next, create the object response - the description of the particular QuadrilateralVertex or QuadrilateralSide as
        // it is moved by the user.
        //-----------------------------------------------------------------------------------------
        model.quadrilateralShapeModel.sides.forEach( side => {
          if ( side.voicingObjectResponseDirty ) {
            responsePacket.objectResponse = this.getSideChangeObjectResponse( side );
            side.voicingObjectResponseDirty = false;
          }
        } );

        model.quadrilateralShapeModel.vertices.forEach( vertex => {
          if ( vertex.voicingObjectResponseDirty ) {
            responsePacket.objectResponse = this.getVertexChangeObjectResponse( vertex );
            vertex.voicingObjectResponseDirty = false;
          }
        } );

        //-----------------------------------------------------------------------------------------
        // Announce responses if we have generated any content.
        //-----------------------------------------------------------------------------------------
        if ( responsePacket.contextResponse || responsePacket.objectResponse ) {
          utterance.alert = responsePacket;
          this.alert( utterance );

          // save snapshots for next descriptions
          if ( responsePacket.contextResponse ) {
            this.previousContextResponseShapeSnapshot = new QuadrilateralShapeSnapshot( this.quadrilateralShapeModel );
          }
          if ( responsePacket.objectResponse ) {
            this.previousObjectResponseShapeSnapshot = new QuadrilateralShapeSnapshot( this.quadrilateralShapeModel );
          }
        }
      }
    } );

    //-----------------------------------------------------------------------------------------
    // (Prototype) Responses specific to OpenCV - letting the user know when markers become
    // detected or obscured from the camera.
    //-----------------------------------------------------------------------------------------
    const markerResponsePacket = new ResponsePacket();
    const markerUtterance = new Utterance( {
      alert: markerResponsePacket,
      priority: Utterance.LOW_PRIORITY
    } );

    const markerDetectionModel = model.tangibleConnectionModel.markerDetectionModel;
    markerDetectionModel.allVertexMarkersDetectedProperty.link( allVertexMarkersDetected => {
      if ( markerDetectionModel.markerResponsesEnabledProperty.value ) {
        markerResponsePacket.contextResponse = allVertexMarkersDetected ? cornersBackString : cornersGoneString;
        this.alert( markerUtterance );
      }
    } );

    const vertexDetectionResponseListener = ( labelString: string, detected: boolean ) => {
      if ( markerDetectionModel.markerResponsesEnabledProperty.value ) {
        const stateString = detected ? backString : goneString;
        markerResponsePacket.contextResponse = StringUtils.fillIn( cornerDetectedPatternString, {
          label: labelString,
          state: stateString
        } );
        this.alert( markerUtterance );
      }
    };

    markerDetectionModel.vertexAMarkerDetectedProperty.link( detected => { vertexDetectionResponseListener( vertexAString, detected ); } );
    markerDetectionModel.vertexBMarkerDetectedProperty.link( detected => { vertexDetectionResponseListener( vertexBString, detected ); } );
    markerDetectionModel.vertexCMarkerDetectedProperty.link( detected => { vertexDetectionResponseListener( vertexCString, detected ); } );
    markerDetectionModel.vertexDMarkerDetectedProperty.link( detected => { vertexDetectionResponseListener( vertexDString, detected ); } );

    //-----------------------------------------------------------------------------------------
    // Register Utterances to the ScreenView so that they respect visible and voicingVisible
    //-----------------------------------------------------------------------------------------
    Voicing.registerUtteranceToNode( lowPriorityUtterance, screenView );
    Voicing.registerUtteranceToNode( mediumPriorityUtterance, screenView );
    Voicing.registerUtteranceToNode( highPriorityUtterance, screenView );
    Voicing.registerUtteranceToNode( markerUtterance, screenView );
  }

  /**
   * Returns the object response for the side as it changes from user input like dragging. Describes the change in
   * length of adjacent side. Amount of content in the response depends on whether the adjacent sides change the same
   * amount, and how much the length of adjacent sides changed. Will return something like
   *
   * "adjacent sides equal" or
   * "equal to one adjacent side" or
   * "parallel adjacent sides longer" or
   * "equal adjacent sides shorter" or
   * "adjacent sides longer" or
   * "left" or
   * "up"
   *
   * The design for this function is outlined in https://github.com/phetsims/quadrilateral/issues/253
   */
  private getSideChangeObjectResponse( side: QuadrilateralSide ): string {
    let response = '';

    const lengthTolerance = this.model.quadrilateralShapeModel.interLengthToleranceInterval;
    const shapeModel = this.model.quadrilateralShapeModel;

    const toleranceForDescribingLengthChange = lengthTolerance / 3;

    const currentShapeSnapshot = new QuadrilateralShapeSnapshot( this.model.quadrilateralShapeModel );

    // previous snapshot variables
    const previousAdjacentLengths = this.previousObjectResponseShapeSnapshot.getAdjacentSideLengthsFromSideLabel( side.sideLabel );
    const firstPreviousAdjacentSideLength = previousAdjacentLengths[ 0 ];
    const secondPreviousAdjacentSideLength = previousAdjacentLengths[ 1 ];
    const previousAdjacentSidesEqual = Utils.equalsEpsilon( firstPreviousAdjacentSideLength, secondPreviousAdjacentSideLength, lengthTolerance );
    const previousAdjacentSidesParallel = this.previousObjectResponseShapeSnapshot.getAdjacentSidesParallelFromSideLabel( side.sideLabel );
    const previousLength = this.previousObjectResponseShapeSnapshot.getLengthFromSideLabel( side.sideLabel );
    const previousEqualToFirstAdjacent = shapeModel.isInterLengthEqualToOther( previousLength, firstPreviousAdjacentSideLength );
    const previousEqualToSecondAdjacent = shapeModel.isInterLengthEqualToOther( previousLength, secondPreviousAdjacentSideLength );
    const previousEqualToOneAdjacent = previousEqualToFirstAdjacent !== previousEqualToSecondAdjacent;
    const previousNumberOfEqualSides = this.previousObjectResponseShapeSnapshot.countNumberOfEqualSides();

    // current shape variables
    const adjacentSides = currentShapeSnapshot.getAdjacentSideLengthsFromSideLabel( side.sideLabel );
    const firstAdjacentSideLength = adjacentSides[ 0 ];
    const secondAdjacentSideLength = adjacentSides[ 1 ];
    const adjacentSidesEqual = Utils.equalsEpsilon( firstAdjacentSideLength, secondAdjacentSideLength, lengthTolerance );
    const adjacentSidesParallel = currentShapeSnapshot.getAdjacentSidesParallelFromSideLabel( side.sideLabel );
    const sideLength = currentShapeSnapshot.getLengthFromSideLabel( side.sideLabel );
    const equalToFirstAdjacent = shapeModel.isInterLengthEqualToOther( sideLength, firstAdjacentSideLength );
    const equalToSecondAdjacent = shapeModel.isInterLengthEqualToOther( sideLength, secondAdjacentSideLength );
    const equalToOneAdjacent = equalToFirstAdjacent !== equalToSecondAdjacent;
    const numberOfEqualSides = currentShapeSnapshot.countNumberOfEqualSides();

    const firstAdjacentSideLengthDifference = firstAdjacentSideLength - firstPreviousAdjacentSideLength;
    const secondAdjacentSideLengthDifference = secondAdjacentSideLength - secondPreviousAdjacentSideLength;

    const firstSideAbsoluteDifference = Math.abs( firstAdjacentSideLengthDifference );
    const secondSideAbsoluteDifference = Math.abs( secondAdjacentSideLengthDifference );

    // Flow of this logic and priority of the content determined by design team
    if ( adjacentSidesEqual && ( ( equalToFirstAdjacent && !previousEqualToFirstAdjacent ) || ( equalToSecondAdjacent && !previousEqualToSecondAdjacent ) ) ) {

      // side just became equal to both adjacent sides
      response = equalToAdjacentSidesString;
    }
    else if ( adjacentSidesEqual && !previousAdjacentSidesEqual ) {

      // adjacent sides just became equal
      response = adjacentSidesEqualString;
    }
    else if ( adjacentSidesParallel && !previousAdjacentSidesParallel ) {

      // adjacent sides just became parallel, describe that next
      response = adjacentSidesParallelString;
    }
    else if ( equalToOneAdjacent && !previousEqualToOneAdjacent ) {

      // the moving side just became equal to ONE of its adjacent sides, call that out
      response = equalToOneAdjacentSideString;
    }
    else if ( numberOfEqualSides === 3 && previousNumberOfEqualSides < 3 ) {

      // we just found a shape with three equal sides (moving from two equal sides)
      response = threeSidesEqualString;
    }
    else if ( numberOfEqualSides === 2 && previousNumberOfEqualSides < 2 ) {

      // we just found a shape with two equal sides (moving from no equal sides)
      response = twoSidesEqualString;
    }
    else if ( firstSideAbsoluteDifference > toleranceForDescribingLengthChange || secondSideAbsoluteDifference > toleranceForDescribingLengthChange ) {
      if ( Math.sign( firstAdjacentSideLengthDifference ) === Math.sign( secondAdjacentSideLengthDifference ) ) {

        const adjacentSidesLonger = firstAdjacentSideLengthDifference > 0;
        const changeString = adjacentSidesLonger ? longerString : shorterString;

        // adjacent sides have changed in the same way as the side moves, this is a class of important things to
        // describe
        if ( adjacentSidesParallel ) {
          response = StringUtils.fillIn( parallelAdjacentSidesChangePatternString, {
            lengthChange: changeString
          } );
        }
        else if ( adjacentSidesEqual ) {
          response = StringUtils.fillIn( equalAdjacentSidesChangePatternString, {
            lengthChange: changeString
          } );
        }
        else {
          response = StringUtils.fillIn( adjacentSidesChangePatternString, {
            lengthChange: changeString
          } );
        }
      }
      else {

        // they are changing by a large amount, but in different ways so describe them generally
        response = adjacentSidesChangeInLengthString;
      }
    }
    else {

      // adjacent sides did not change enough, just include a direction description
      const currentVertex1Position = side.vertex1.positionProperty.value;
      const previousVertex1Position = this.previousObjectResponseShapeSnapshot.getVertexPositionsFromSideLabel( side.sideLabel )[ 0 ];
      response = QuadrilateralAlerter.getDirectionDescription( previousVertex1Position, currentVertex1Position, this.modelViewTransform );
    }

    return response;
  }

  /**
   * Returns the Object Response that is announced every movement with keyboard dragging. This
   * is unique to keyboard input. With mouse/touch input, the less frequent rate of context responses
   * are sufficient for the Voicing output to describe the changing shape. With keyboard, the user
   * needs a response every key press to know that changes are happening.
   *
   * This function is absurdly complicated, see https://github.com/phetsims/quadrilateral/issues/237 for
   * the request.
   *
   * Note that since this is dependent on angles and not just position Properties, this must be called after
   * shapeChangedEmitter emits when we know that all angle and shape Properties have been updated. See
   * QuadrilateralShapeModel.updateOrderDependentProperties for more information.
   */
  private getVertexChangeObjectResponse( vertex: QuadrilateralVertex ): string {
    let response;

    // The phrase like the direction change, how the vertex angle changes, or whether the vertex angle is at
    // a critical value like 90/180 degrees
    let progressResponse: string | null = null;

    // Additional state information about other vertices, or how wide the moving vertex is relative to others in the
    // shape.
    let stateResponse: string | null = null;

    const shapeModel = this.quadrilateralShapeModel;
    const vertexDescriber = this.describer.getVertexDescriberForLabel( vertex.vertexLabel );

    const currentAngle = vertex.angleProperty.value!;
    const previousAngle = this.previousObjectResponseShapeSnapshot.getAngleFromVertexLabel( vertex.vertexLabel );

    const oppositeVertex = shapeModel.oppositeVertexMap.get( vertex )!;
    const oppositeVertexAngle = oppositeVertex.angleProperty.value!;

    const adjacentVertices = shapeModel.adjacentVertexMap.get( vertex )!;
    const firstAdjacentVertex = adjacentVertices[ 0 ];
    const firstAdjacentAngle = firstAdjacentVertex.angleProperty.value!;
    const secondAdjacentVertex = adjacentVertices[ 1 ];
    const secondAdjacentAngle = secondAdjacentVertex.angleProperty.value!;

    // whether the moving vertex angle becomes equal to any of the other vertices (within interAngleToleranceInterval)
    const angleEqualToFirstAdjacent = shapeModel.isInterAngleEqualToOther( currentAngle, firstAdjacentAngle );
    const angleEqualToSecondAdjacent = shapeModel.isInterAngleEqualToOther( currentAngle, secondAdjacentAngle );
    const angleEqualToOpposite = shapeModel.isInterAngleEqualToOther( currentAngle, oppositeVertexAngle );

    // Get the "progress" portion of the object response, describing how this vertex has changed or if it has
    // reached some critical angle. This portion of the description is always included.
    if ( previousAngle === currentAngle ) {

      // Moving around symmetric shapes, it is possible to move the vertex into a new position where the angle
      // stayed the same. In this case, only describe the direction of movement.
      const currentPosition = vertex.positionProperty.value;
      const previousPosition = this.previousObjectResponseShapeSnapshot.getPositionFromVertexLabel( vertex.vertexLabel );
      progressResponse = QuadrilateralAlerter.getDirectionDescription( previousPosition, currentPosition, this.modelViewTransform );
    }
    else if ( shapeModel.isRightAngle( currentAngle ) ) {
      progressResponse = rightAngleString;
    }
    else if ( shapeModel.isFlatAngle( currentAngle ) ) {
      progressResponse = angleFlatString;
    }
    else if ( !angleEqualToFirstAdjacent && !angleEqualToSecondAdjacent && !angleEqualToOpposite ) {

      // fallback case, just 'angle wider' or 'angle smaller' - but only if the angle is not equal to any other
      // to prevent the alert from getting too long
      const angleChangeString = currentAngle > previousAngle ? widerString : vertexDragSmallerString;
      progressResponse = StringUtils.fillIn( vertexDragObjectResponsePatternString, {
        angleChange: angleChangeString
      } );
    }

    const shapeName = shapeModel.shapeNameProperty.value;

    // get the "state" portion of the object response, which describes important state information about the
    // quadrilateral like when a pair of adjacent angles are equal, or when the moving angle is twice/half of another
    // angle in the shape. There may not always be important state information.
    if ( previousAngle !== currentAngle ) {
      if ( shapeModel.getAreAllAnglesRight() ) {

        // important state described when a square
        stateResponse = equalToOppositeCornerEqualToAdjacentCornersString;
      }
      else if ( angleEqualToFirstAdjacent && angleEqualToSecondAdjacent ) {

        // the moving angle just became equal to its two adjacent corners
        stateResponse = equalToAdjacentCornersString;
      }
      else if ( angleEqualToFirstAdjacent || angleEqualToOpposite || angleEqualToSecondAdjacent ) {

        // If vertex the angle just became equal to another, that is the most important information and should be
        // described
        const otherVertex = angleEqualToFirstAdjacent ? firstAdjacentVertex :
                            angleEqualToOpposite ? oppositeVertex :
                            secondAdjacentVertex;

        // if equal to the opposite corner, just say "opposite corner" instead of the corner label
        const otherCornerLabelString = angleEqualToOpposite ? oppositeCornerString :
                                       QuadrilateralVertexDescriber.VERTEX_CORNER_LABEL_MAP.get( otherVertex.vertexLabel );

        const comparisonDescription = vertexDescriber.getAngleComparisonDescription( otherVertex, shapeName );
        stateResponse = StringUtils.fillIn( angleComparisonPatternString, {
          comparison: comparisonDescription,
          cornerLabel: otherCornerLabelString
        } );
      }
      else if ( this.shouldUseAngleComparisonDescription( currentAngle, oppositeVertexAngle ) ) {

        // describe relative size to opposite vertex
        const comparisonDescription = vertexDescriber.getAngleComparisonDescription( oppositeVertex, shapeName );
        stateResponse = StringUtils.fillIn( angleComparisonPatternString, {
          comparison: comparisonDescription,
          cornerLabel: oppositeCornerString
        } );
      }
      else if ( shapeModel.isInterAngleEqualToOther( firstAdjacentAngle, secondAdjacentAngle ) ) {

        // The adjacent angles just became equal to eachother, describe that next (after opposite in priority)
        if ( shapeModel.isRightAngle( firstAdjacentAngle ) ) {
          stateResponse = adjacentCornersRightAnglesString;
        }
        else {
          stateResponse = adjacentCornersEqualString;
        }
      }
      else if ( this.shouldUseAngleComparisonDescription( currentAngle, firstAdjacentAngle ) ) {

        // decribe relative size (half or twice as large as) to the first adjacent vertex
        const comparisonDescription = vertexDescriber.getAngleComparisonDescription( firstAdjacentVertex, shapeName );
        stateResponse = StringUtils.fillIn( angleComparisonPatternString, {
          comparison: comparisonDescription,
          cornerLabel: QuadrilateralVertexDescriber.VERTEX_CORNER_LABEL_MAP.get( firstAdjacentVertex.vertexLabel )
        } );
      }
      else if ( this.shouldUseAngleComparisonDescription( currentAngle, secondAdjacentAngle ) ) {

        // decribe relative size (half or twice as large as) to the second adjacent vertex
        const comparisonDescription = vertexDescriber.getAngleComparisonDescription( secondAdjacentVertex, shapeName );
        stateResponse = StringUtils.fillIn( angleComparisonPatternString, {
          comparison: comparisonDescription,
          cornerLabel: QuadrilateralVertexDescriber.VERTEX_CORNER_LABEL_MAP.get( secondAdjacentVertex.vertexLabel )
        } );
      }
    }

    assert && assert( progressResponse || stateResponse, 'There needs to be a response, we have a case that is not described.' );
    if ( progressResponse && stateResponse ) {

      response = StringUtils.fillIn( progressStatePatternString, {
        progress: progressResponse,
        state: stateResponse
      } );
    }
    else if ( stateResponse ) {
      response = stateResponse;
    }
    else {
      response = progressResponse;
    }

    return response!;
  }

  /**
   * Returns whether the changing vertex object response should include a description of the angle compared to another.
   * This is only included if the changingVertexAngle is around half, twice, or equal to the other angle. The other
   * angle might be an opposite or adjacent angle.
   */
  private shouldUseAngleComparisonDescription( changingVertexAngle: number, otherVertexAngle: number ): boolean {
    return QuadrilateralVertexDescriber.isAngleAboutHalfOther( changingVertexAngle, otherVertexAngle ) ||
           QuadrilateralVertexDescriber.isAngleAboutTwiceOther( changingVertexAngle, otherVertexAngle ) ||
           this.quadrilateralShapeModel.isInterAngleEqualToOther( changingVertexAngle, otherVertexAngle );
  }

  /**
   * Get a response description for the shape change from previous state to current. Will describe parallel sides,
   * shape area, and side tilt during changes and interaction. The logic of this function is as described in the
   * design doc, see
   * https://docs.google.com/document/d/1jXayebAWnnNzsT3l6o72YPw4-YtiQaHQNuAi64eiguc/edit#heading=h.ap2d0jqvt5et
   *
   * Will return something like
   * "Opposite sides AB and CD tilt in parallel as shape gets bigger." or
   * "All sides tilt away from parallel as opposite corners change unequally." or
   * "Opposite sides straighten in parallel as opposite corners change equally." or
   *
   * @param shapeModel
   * @param previousShapeSnapshot - Object holding shape fields from the previous time this function was used
   * @param responseReason - This response happens when angles or lengths change enough to trigger a new description,
   *                         the triggering case will determine parts of the response string.
   */
  private getShapeChangeResponse( shapeModel: QuadrilateralShapeModel, previousShapeSnapshot: QuadrilateralShapeSnapshot, responseReason: ResponseReason ): string | null {
    let response: string | null = null;

    const areaDifference = shapeModel.areaProperty.value - previousShapeSnapshot.area;
    const areaChangeString = areaDifference > 0 ? biggerString : smallerString;

    if ( shapeModel.isParallelogram() && previousShapeSnapshot.isParallelogram ) {

      // remained a parallelogram through changes
      if ( responseReason === 'angle' ) {

        // angle is the dominant response and caused the change, we are describing change in side tilt
        const tiltChangeString = this.getTiltOrStraightenDescription( previousShapeSnapshot );
        response = StringUtils.fillIn( oppositeSidesTiltPatternString, {
          tiltChange: tiltChangeString
        } );
      }
      else if ( responseReason === 'length' ) {

        // lengths changed enough while in parallel to describe length without describing tilt
        const patternString = oppositeSidesInParallelPatternString;
        response = StringUtils.fillIn( patternString, {
          areaChange: areaChangeString
        } );
      }
    }
    else {

      const sideABsideCDParallelBefore = previousShapeSnapshot.sideABsideCDParallel;
      const sideBCSideDAParallelBefore = previousShapeSnapshot.sideBCsideDAParallel;

      const sideABSideCDParallelAfter = shapeModel.sideABSideCDParallelSideChecker.areSidesParallel();
      const sideBCSideDAParallelAfter = shapeModel.sideBCSideDAParallelSideChecker.areSidesParallel();

      // for readability, cases are determined by current and change in side parallel state of sides
      const onlyOneParallelAfter = sideABSideCDParallelAfter !== sideBCSideDAParallelAfter;
      const neitherParallelBefore = !sideABsideCDParallelBefore && !sideBCSideDAParallelBefore;
      const neitherParallelAfter = !sideABSideCDParallelAfter && !sideBCSideDAParallelAfter;
      const atLeastOneParallelBefore = sideABsideCDParallelBefore || sideBCSideDAParallelBefore;

      // Any remaining parallel sides are described, determine which opposite sides to use
      let firstSideString;
      let secondSideString;
      if ( sideABSideCDParallelAfter ) {
        firstSideString = aBString;
        secondSideString = cDString;
      }
      else {
        firstSideString = bCString;
        secondSideString = dAString;
      }

      if ( neitherParallelBefore && onlyOneParallelAfter ) {
        const patternString = oppositeSidesInParallelAsCornersChangeEquallyPatternString;

        response = StringUtils.fillIn( patternString, {
          firstSide: firstSideString,
          secondSide: secondSideString
        } );
      }
      else if ( onlyOneParallelAfter ) {

        // if one pair of sides remains in parallel after the change, and it is the same side pair
        const patternString = oppositeSidesTiltAsShapeChangesPatternString;
        response = StringUtils.fillIn( patternString, {
          firstSide: firstSideString,
          secondSide: secondSideString,
          areaChange: areaChangeString
        } );
      }
      else if ( atLeastOneParallelBefore && neitherParallelAfter ) {

        // at least one to zero parallel side pairs
        response = allSidesTiltAwayFromParallelString;
      }
      else if ( neitherParallelBefore && neitherParallelAfter ) {

        // no parallel side pairs before and after
        const patternString = allSidesTiltAwayFromParallelAsShapeChangesPatternString;
        response = StringUtils.fillIn( patternString, {
          areaChange: areaChangeString
        } );
      }
    }

    return response;
  }

  /**
   * Returns a description of the shape for a context response as movements occur that maintain the same
   * named shape. For example, moving one side to make a longer rectangle. See
   * https://github.com/phetsims/quadrilateral/issues/198 for more information about the design for this function.
   *
   * Will return something like:
   * "All right angles as shape gets bigger." or
   * "Opposite sides BC and DA equal as shape gets bigger." or
   * "Opposite sides in parallel as opposite corners change equally."
   */
  private getShapeMaintenanceContextResponse( shapeName: NamedQuadrilateral, previousShapeSnapshot: QuadrilateralShapeSnapshot, thisResponseReason: ResponseReason ): string | null {
    let response: string | null = null;

    const areaDifference = this.quadrilateralShapeModel.areaProperty.value - previousShapeSnapshot.area;
    const areaChangeString = areaDifference > 0 ? biggerString : smallerString;

    if ( shapeName === NamedQuadrilateral.CONVEX_QUADRILATERAL || shapeName === NamedQuadrilateral.CONCAVE_QUADRILATERAL ) {
      response = StringUtils.fillIn( allSidesTiltAwayFromParallelAsShapeChangesPatternString, {
        areaChange: areaChangeString
      } );
    }
    else if ( shapeName === NamedQuadrilateral.TRIANGLE ) {
      const flatVertex = _.find(
        this.quadrilateralShapeModel.vertices,
        vertex => this.quadrilateralShapeModel.isStaticAngleEqualToOther( vertex.angleProperty.value!, Math.PI )
      );

      // consider small enough values as 'constant area' because the area might change by negligible values within
      // precision error
      if ( areaDifference < 1e-5 ) {

        // We have a triangle one vertex is 180 degrees and the shape is moving such that the area
        // is not changing. Describe the "flat" vertex and how its adjacent sides get longer or shorter
        response = StringUtils.fillIn( cornerFlatAsShapeChangesPatternString, {
          cornerLabel: QuadrilateralVertexDescriber.VERTEX_CORNER_LABEL_MAP.get( flatVertex!.vertexLabel )
        } );
      }
      else {

        // We have a triangle being maintained but the area is changing, so we describe how it the adjacent
        // sides remain in line as the shape gets bigger or smaller

        // find the sides that are connected to the flat vertex
        const flatSides = _.filter( this.quadrilateralShapeModel.sides, side => side.vertex1 === flatVertex || side.vertex2 === flatVertex );
        assert && assert( flatSides.length === 2, 'We should have found two sides connected to the flat vertex' );

        response = StringUtils.fillIn( adjacentSidesInLinePatternString, {
          firstSide: QuadrilateralDescriber.getSideLabelString( flatSides[ 0 ].sideLabel ),
          secondSide: QuadrilateralDescriber.getSideLabelString( flatSides[ 1 ].sideLabel ),
          areaChange: areaChangeString
        } );
      }
    }
    else if ( shapeName === NamedQuadrilateral.DART || shapeName === NamedQuadrilateral.KITE ) {
      response = StringUtils.fillIn( adjacentSidesChangeEquallyAsShapeChangesPatternString, {
        areaChange: areaChangeString
      } );
    }
    else if ( shapeName === NamedQuadrilateral.TRAPEZOID ) {
      const sideABSideCDParallel = previousShapeSnapshot.sideABsideCDParallel;

      let firstSideString;
      let secondSideString;
      if ( sideABSideCDParallel ) {
        firstSideString = aBString;
        secondSideString = cDString;
      }
      else {
        firstSideString = bCString;
        secondSideString = dAString;
      }

      response = StringUtils.fillIn( maintainingATrapezoidAsShapeChangesPatternString, {
        firstSide: firstSideString,
        secondSide: secondSideString,
        areaChange: areaChangeString
      } );
    }
    else if ( shapeName === NamedQuadrilateral.ISOSCELES_TRAPEZOID ) {

      // For an isosceles trapezoid, describe the sides that remain equal in length
      const sideABSideCDParallel = previousShapeSnapshot.sideABsideCDParallel;

      // For an isosceles trapezoid, the non-parallel sides are the equal ones in length - we can use that without
      // searching through model Properties
      let firstSideString;
      let secondSideString;
      if ( sideABSideCDParallel ) {
        firstSideString = bCString;
        secondSideString = dAString;
      }
      else {
        firstSideString = aBString;
        secondSideString = cDString;
      }

      response = StringUtils.fillIn( oppositeSidesEqualAsShapeChangesPatternString, {
        firstSide: firstSideString,
        secondSide: secondSideString,
        areaChange: areaChangeString
      } );
    }
    else if ( shapeName === NamedQuadrilateral.PARALLELOGRAM ) {
      if ( thisResponseReason === 'angle' ) {
        response = StringUtils.fillIn( maintainingAParallelogramAngleResponseString, {
          areaChange: areaChangeString
        } );
      }
      else {
        response = StringUtils.fillIn( maintainingAParallelogramLengthResponsePatternString, {
          areaChange: areaChangeString
        } );
      }
    }
    else if ( shapeName === NamedQuadrilateral.RECTANGLE ) {
      response = StringUtils.fillIn( allRightAnglesAsShapeChangesPatternString, {
        areaChange: areaChangeString
      } );
    }
    else if ( shapeName === NamedQuadrilateral.RHOMBUS ) {
      response = maintainingARhombusString;
    }
    else if ( shapeName === NamedQuadrilateral.SQUARE ) {
      response = StringUtils.fillIn( allSidesEqualAsShapeChangesPatternString, {
        areaChange: areaChangeString
      } );
    }

    return response;
  }

  /**
   * Returns a description about whether the shape is "tilting" or "straightening" based on how the angles at each
   * vertex changed from the previous snapshot.
   */
  private getTiltOrStraightenDescription( previousShapeSnapshot: QuadrilateralShapeSnapshot ): string {

    // angle is the dominant response and caused the change, we are describing change in side tilt
    const currentDistancesToRight = [
      this.quadrilateralShapeModel.vertexA.angleProperty.value!,
      this.quadrilateralShapeModel.vertexB.angleProperty.value!,
      this.quadrilateralShapeModel.vertexC.angleProperty.value!,
      this.quadrilateralShapeModel.vertexD.angleProperty.value!
    ].map( QuadrilateralAlerter.distanceFromRightAngle );

    const previousDistancesToRight = [
      previousShapeSnapshot.vertexAAngle,
      previousShapeSnapshot.vertexBAngle,
      previousShapeSnapshot.vertexCAngle,
      previousShapeSnapshot.vertexDAngle
    ].map( QuadrilateralAlerter.distanceFromRightAngle );

    const differences = [];
    for ( let i = 0; i < currentDistancesToRight.length; i++ ) {
      differences.push( currentDistancesToRight[ i ]! - previousDistancesToRight[ i ] );
    }

    // If the distances to pi for every angle have gotten smaller, we are getting closer to right angles, that is
    // described as "straighten"
    return _.every( differences, difference => difference > 0 ) ? tiltString : straightenString;
  }

  /**
   * Return distance (absolute value) of an angle against a right angle (pi/2).
   */
  private static distanceFromRightAngle( angle: number ): number {
    return Math.abs( Math.PI / 2 - angle );
  }

  /**
   * Returns a direction description for the change in position as an object moves from position1 to position2.
   * Positions in model coordinates.
   */
  private static getDirectionDescription( previousPosition: Vector2, currentPosition: Vector2, modelViewTransform: ModelViewTransform2 ): string {
    const translationVector = currentPosition.minus( previousPosition );
    const movementAngle = translationVector.angle;
    return MovementAlerter.getDirectionDescriptionFromAngle( movementAngle, {
      modelViewTransform: modelViewTransform
    } );
  }

  /**
   * Get a response that describes changes to the detected shape name. As decided by design/pedagogy, this is the most
   * important information to describe as things change.
   */
  private getShapeNameChangeResponse(): NullableQuadrilateralStringType {
    const currentShapeName = this.model.quadrilateralShapeModel.shapeNameProperty.value;

    let contextResponse: NullableQuadrilateralStringType = null;
    if ( currentShapeName !== this.previousContextResponseShapeSnapshot.namedQuadrilateral ) {
      if ( this.model.visibilityModel.shapeNameVisibleProperty.value ) {
        contextResponse = this.getFoundShapeResponse( currentShapeName );
      }
      else {
        contextResponse = this.describer.getShapePropertiesDescription();
      }
    }

    return contextResponse;
  }

  /**
   * Returns a string describing a newly found shape. Returns something like
   * "Found a square." or
   * "Found an isosceles trapezoid."
   */
  private getFoundShapeResponse( namedQuadrilateral: NamedQuadrilateral ): string {
    return StringUtils.fillIn( foundShapePatternString, {
      shapeName: QuadrilateralDescriber.getShapeNameWithArticlesDescription( namedQuadrilateral )
    } );
  }
}

quadrilateral.register( 'QuadrilateralAlerter', QuadrilateralAlerter );
