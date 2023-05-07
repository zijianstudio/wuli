// Copyright 2015-2022, University of Colorado Boulder

/**
 * A model that allows users to move coin terms around, combine them into expressions, edit the expressions, change the
 * values of the underlying variables, and track different view modes.  This is the main model type used in all of the
 * explore screens and for each of the game challenges.  Options are used to support the different restrictions for
 * each screen.
 *
 * @author John Blanco
 */

import createObservableArray from '../../../../axon/js/createObservableArray.js';
import Multilink from '../../../../axon/js/Multilink.js';
import Property from '../../../../axon/js/Property.js';
import StringProperty from '../../../../axon/js/StringProperty.js';
import Bounds2 from '../../../../dot/js/Bounds2.js';
import dotRandom from '../../../../dot/js/dotRandom.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import merge from '../../../../phet-core/js/merge.js';
import expressionExchange from '../../expressionExchange.js';
import EESharedConstants from '../EESharedConstants.js';
import AllowedRepresentations from '../enum/AllowedRepresentations.js';
import CoinTermTypeID from '../enum/CoinTermTypeID.js';
import ViewMode from '../enum/ViewMode.js';
import CoinTermFactory from './CoinTermFactory.js';
import Expression from './Expression.js';
import ExpressionHint from './ExpressionHint.js';

// constants
const BREAK_APART_SPACING = 10;
const RETRIEVED_COIN_TERMS_X_SPACING = 100;
const RETRIEVED_COIN_TERMS_Y_SPACING = 60;
const RETRIEVED_COIN_TERM_FIRST_POSITION = new Vector2(250, 50); // upper left, doesn't overlap with control panels
const NUM_RETRIEVED_COIN_TERM_COLUMNS = 6;
const MIN_RETRIEVAL_PLACEMENT_DISTANCE = 30; // empirically determined

class ExpressionManipulationModel {
  /**
   * @param {Object} [options]
   */
  constructor(options) {
    options = merge({
      // defines whether to present just coins, just variables, or both to the user
      allowedRepresentations: AllowedRepresentations.COINS_AND_VARIABLES,
      // flag that controls how cancellation is handled in cases where coin terms don't completely cancel each other out
      partialCancellationEnabled: true,
      // flag that controls whether the 'simplify negatives' setting is on or off by default
      simplifyNegativesDefault: false
    }, options);
    const initialViewMode = options.allowedRepresentations === AllowedRepresentations.VARIABLES_ONLY ? ViewMode.VARIABLES : ViewMode.COINS;

    // @public {Property.<ViewMode>}
    this.viewModeProperty = new StringProperty(initialViewMode);

    // @public {Property.<boolean>}
    this.showCoinValuesProperty = new Property(false);
    this.showVariableValuesProperty = new Property(false);
    this.showAllCoefficientsProperty = new Property(false);

    // @public {Property.<number>}
    this.xTermValueProperty = new Property(2);
    this.yTermValueProperty = new Property(5);
    this.zTermValueProperty = new Property(10);

    // @public (read-only) {Property.<number>}
    this.totalValueProperty = new Property(0);

    // @public (read-only) {Property.<Expression>} - null when no expression is being edited
    this.expressionBeingEditedProperty = new Property(null);

    // @public {Property.<boolean>}
    this.simplifyNegativesProperty = new Property(options.simplifyNegativesDefault);

    // @public (read-only) {CoinTermFactory} - factory used to create coin terms
    this.coinTermFactory = new CoinTermFactory(this.xTermValueProperty, this.yTermValueProperty, this.zTermValueProperty);

    // @public (read-only) {AllowedRepresentations} - options that control what is available to the user to manipulate
    this.allowedRepresentations = options.allowedRepresentations;

    // @public (read/listen-only) {ObservableArrayDef.<CoinTerm>} - list of all coin terms in the model
    this.coinTerms = createObservableArray();

    // @public (read/listen-only) {ObservableArrayDef.<Expression>} - list of expressions in the model
    this.expressions = createObservableArray();

    // @public (read/listen-only) {ObservableArrayDef.<ExpressionHint} - list of expression hints in the model
    this.expressionHints = createObservableArray();

    // @public (read-only) {Bounds2} - coin terms and expression that end up outside these bounds are moved back inside
    this.retrievalBounds = Bounds2.EVERYTHING;

    // @public (read-only) {Array.<EECollectionArea>} - areas where expressions or coin terms can be collected, used
    // only in game
    this.collectionAreas = [];

    /*
     * @private, with some elements accessible via methods define below - This is a populated data structure that
     * contains counts for the various possible combinations of coin term types and minimum decomposition.  For
     * instance, it keeps track of the number of 2X values that can't be further decomposed.
     * {CoinTermTypeID} => {Array.<{ count: {number}, countProperty: {Property.<number>|null} }>}
     *
     * This is structured as an object with each of the possible coin term types as the keys.  Each of the values is
     * an array that is indexed by the minimum decomposibility, but is offset to account for the fact that the values
     * can be negative, such as for the number of instances of -2x.  Each element of the array is an object that has
     * a count value and a count property.  The counts are updated any time a coin term is added or removed.  The count
     * properties are created lazily when requested via methods defined below, and are updated at the same time as the
     * counts if they exist.
     */
    this.coinTermCounts = {};
    const countObjectsPerCoinTermType = EESharedConstants.MAX_NON_DECOMPOSABLE_AMOUNT * 2 + 1;
    _.keys(CoinTermTypeID).forEach(coinTermType => {
      this.coinTermCounts[coinTermType] = new Array(countObjectsPerCoinTermType);
      _.times(countObjectsPerCoinTermType, index => {
        this.coinTermCounts[coinTermType][index] = {
          count: 0,
          countProperty: null
        };
      });
    });

    // @public {@Bounds2} - should be set by view, generally just once.  Used to determine when to remove a coin term
    // because the user has essentially put it away
    this.creatorBoxBounds = Bounds2.NOTHING;

    // @private {boolean} - make this option available to methods
    this.partialCancellationEnabled = options.partialCancellationEnabled;

    // add a listener that resets the coin term values when the view mode switches from variables to coins
    this.viewModeProperty.link((newViewMode, oldViewMode) => {
      if (newViewMode === ViewMode.COINS && oldViewMode === ViewMode.VARIABLES) {
        this.xTermValueProperty.reset();
        this.yTermValueProperty.reset();
        this.zTermValueProperty.reset();
      }
    });

    // add a listener that updates the total whenever one of the term value properties change
    Multilink.multilink([this.xTermValueProperty, this.yTermValueProperty, this.zTermValueProperty, this.coinTerms.lengthProperty], () => {
      let total = 0;
      this.coinTerms.forEach(coinTerm => {
        total += coinTerm.valueProperty.value * coinTerm.totalCountProperty.get();
      });
      this.totalValueProperty.set(total);
    });

    // add a listener that handles the addition of coin terms
    this.coinTerms.addItemAddedListener(this.coinTermAddedListener.bind(this));

    // add a listener that handles the addition of an expression
    this.expressions.addItemAddedListener(this.expressionAddedListener.bind(this));
  }

  /**
   * main step function for this model, should only be called by the framework
   * @param {number} dt
   * @public
   */
  step(dt) {
    let userControlledCoinTerms;
    const coinTermsWithHalos = [];

    // step all the coin terms
    this.coinTerms.forEach(coinTerm => {
      coinTerm.step(dt);
    });

    // Update the state of the hints and halos.  This has to be done in the step function rather than in the
    // event listeners, where much of the other action occurs, because the code needs to figure out which hints and
    // halos should be activated and deactivated based on the positions of all coin terms and expressions.
    if (!this.expressionBeingEditedProperty.get()) {
      // clear the hovering lists for all expressions - they will then be updated below
      this.expressions.forEach(expression => {
        expression.clearHoveringCoinTerms();
        expression.clearHoveringExpressions();
      });

      // get a list of user controlled expressions, max of one on mouse based systems, any number on touch devices
      const userControlledExpressions = _.filter(this.expressions, expression => expression.userControlledProperty.get());
      const collectionAreasWhoseHalosShouldBeActive = [];

      // Update hints for expressions and collection areas.
      userControlledExpressions.forEach(userControlledExpression => {
        const expressionIsOverCreatorBox = userControlledExpression.getBounds().intersectsBounds(this.creatorBoxBounds);
        const mostOverlappingCollectionArea = this.getMostOverlappingCollectionAreaForExpression(userControlledExpression);
        const mostOverlappingExpression = this.getExpressionMostOverlappingWithExpression(userControlledExpression);
        const mostOverlappingCoinTerm = this.getFreeCoinTermMostOverlappingWithExpression(userControlledExpression);
        let expressionOverWhichThisExpressionIsHovering = null;
        let coinTermOverWhichThisExpressionIsHovering = null;
        if (expressionIsOverCreatorBox) {
          // The expression is at least partially over the creator box, which takes precedence over everything else,
          // so don't activate any hints or halos.
        } else if (mostOverlappingCollectionArea) {
          // activate the halo if the collection area is empty
          if (mostOverlappingCollectionArea.collectedItemProperty.get() === null) {
            collectionAreasWhoseHalosShouldBeActive.push(mostOverlappingCollectionArea);
          }
        } else if (mostOverlappingExpression) {
          expressionOverWhichThisExpressionIsHovering = mostOverlappingExpression;
        } else if (mostOverlappingCoinTerm) {
          coinTermOverWhichThisExpressionIsHovering = mostOverlappingCoinTerm;
        }

        // update hover info for each of the other expressions with respect to this one
        this.expressions.forEach(expression => {
          if (expression === userControlledExpression) {
            // skip self
            return;
          }
          if (expression === expressionOverWhichThisExpressionIsHovering) {
            expression.addHoveringExpression(userControlledExpression);
          }
        });

        // update overlap info with respect to free coin terms
        userControlledExpression.clearHoveringCoinTerms();
        if (coinTermOverWhichThisExpressionIsHovering) {
          // there can only be one most overlapping coin term, so out with the old, in with the new
          userControlledExpression.addHoveringCoinTerm(mostOverlappingCoinTerm);
        }
      });

      // get a list of all user controlled coin terms, max of one coin on mouse-based systems, any number on touch devices
      userControlledCoinTerms = _.filter(this.coinTerms, coin => coin.userControlledProperty.get());

      // check each user-controlled coin term to see if it's in a position to combine with an expression or another
      // coin term
      const neededExpressionHints = [];
      userControlledCoinTerms.forEach(userControlledCoinTerm => {
        const coinTermIsOverCreatorBox = userControlledCoinTerm.getViewBounds().intersectsBounds(this.creatorBoxBounds);
        const mostOverlappingCollectionArea = this.getMostOverlappingCollectionAreaForCoinTerm(userControlledCoinTerm);
        const mostOverlappingExpression = this.getExpressionMostOverlappingWithCoinTerm(userControlledCoinTerm);
        const mostOverlappingLikeCoinTerm = this.getMostOverlappingLikeCoinTerm(userControlledCoinTerm);
        const joinableFreeCoinTerm = this.checkForJoinableFreeCoinTerm(userControlledCoinTerm);
        let expressionOverWhichCoinTermIsHovering = null;
        if (coinTermIsOverCreatorBox) {
          // The coin term is over the creator box, which takes precedence over everything else, so don't activate any
          // hints or halos.
        } else if (mostOverlappingCollectionArea) {
          // the coin term is over a collection area, so activate that collection area's hint (if it is empty)
          if (mostOverlappingCollectionArea.collectedItemProperty.get() === null) {
            collectionAreasWhoseHalosShouldBeActive.push(mostOverlappingCollectionArea);
          }
        } else if (mostOverlappingExpression) {
          // the coin term is over an expression, so add this coin term to the list of those hovering
          expressionOverWhichCoinTermIsHovering = mostOverlappingExpression;
        } else if (mostOverlappingLikeCoinTerm) {
          // activate halos for overlapping coin terms
          coinTermsWithHalos.push(userControlledCoinTerm);
          coinTermsWithHalos.push(mostOverlappingLikeCoinTerm);
        } else if (joinableFreeCoinTerm) {
          // this coin term is positioned such that it could join a free coin term, so add a hint
          neededExpressionHints.push(new ExpressionHint(joinableFreeCoinTerm, userControlledCoinTerm));
        }

        // update hover info for each expression with respect to this coin term
        this.expressions.forEach(expression => {
          if (expression === expressionOverWhichCoinTermIsHovering) {
            expression.addHoveringCoinTerm(userControlledCoinTerm);
          }
        });
      });

      // update the expression hints for single coins that could combine into expressions
      if (neededExpressionHints.length > 0) {
        // remove any expression hints that are no longer needed
        this.expressionHints.forEach(existingExpressionHint => {
          let matchFound = false;
          neededExpressionHints.forEach(neededExpressionHint => {
            if (neededExpressionHint.equals(existingExpressionHint)) {
              matchFound = true;
            }
          });
          if (!matchFound) {
            this.removeExpressionHint(existingExpressionHint);
          }
        });

        // add any needed expression hints that are not yet on the list
        neededExpressionHints.forEach(neededExpressionHint => {
          let matchFound = false;
          this.expressionHints.forEach(existingExpressionHint => {
            if (existingExpressionHint.equals(neededExpressionHint)) {
              matchFound = true;
            }
          });
          if (!matchFound) {
            this.expressionHints.add(neededExpressionHint);
          }
        });
      } else {
        this.expressionHints.forEach(existingExpressionHint => {
          this.removeExpressionHint(existingExpressionHint);
        });
      }

      // update hover info for each collection area
      this.collectionAreas.forEach(collectionArea => {
        collectionArea.haloActiveProperty.set(collectionAreasWhoseHalosShouldBeActive.indexOf(collectionArea) >= 0);
      });

      // step the expressions
      this.expressions.forEach(expression => {
        expression.step(dt);
      });
    } else {
      // The stepping behavior is significantly different - basically much simpler - when an expression is being
      // edited.  The individual expressions are not stepped at all to avoid activating halos, updating layouts, and
      // so forth.  Interaction between coin terms and expressions is not tested.  Only overlap between two like
      // coins is tested so that their halos can be activated.

      // get a list of all user controlled coins, max of one coin on mouse-based systems, any number on touch devices
      userControlledCoinTerms = _.filter(this.coinTerms, coinTerm => coinTerm.userControlledProperty.get());

      // check for overlap between coins that can combine
      userControlledCoinTerms.forEach(userControlledCoinTerm => {
        const overlappingCoinTerm = this.getOverlappingLikeCoinTermWithinExpression(userControlledCoinTerm, this.expressionBeingEditedProperty.get());
        if (overlappingCoinTerm) {
          // these coin terms can be combined, so they should have their halos activated
          coinTermsWithHalos.push(userControlledCoinTerm);
          coinTermsWithHalos.push(overlappingCoinTerm);
        }
      });
    }

    // go through all coin terms and update the state of their combine halos
    this.coinTerms.forEach(coinTerm => {
      coinTerm.combineHaloActiveProperty.set(coinTermsWithHalos.indexOf(coinTerm) !== -1);
    });
  }

  // @public
  addCoinTerm(coinTerm) {
    this.coinTerms.add(coinTerm);
    this.updateCoinTermCounts(coinTerm.typeID);
    phet.log && phet.log(`added ${coinTerm.id}, composition = [${coinTerm.composition}]`);
  }

  // @public
  removeCoinTerm(coinTerm, animate) {
    // remove the coin term from any expressions
    this.expressions.forEach(expression => {
      if (expression.containsCoinTerm(coinTerm)) {
        expression.removeCoinTerm(coinTerm);
      }
    });
    if (animate) {
      // send the coin term back to its origin - the final steps of its removal will take place when it gets there
      coinTerm.returnToOrigin();
    } else {
      phet.log && phet.log(`removed ${coinTerm.id}`);
      this.coinTerms.remove(coinTerm);
      this.updateCoinTermCounts(coinTerm.typeID);
    }
  }

  /**
   * get a property that represents the count in the model of coin terms of the given type and min decomposition
   * @param {CoinTermTypeID} coinTermTypeID
   * @param {number} minimumDecomposition - miniumum amount into which the coin term can be decomposed
   * @param {boolean} createIfUndefined
   * @public
   */
  getCoinTermCountProperty(coinTermTypeID, minimumDecomposition, createIfUndefined) {
    assert && assert(this.coinTermCounts.hasOwnProperty(coinTermTypeID), 'unrecognized coin term type ID');
    assert && assert(minimumDecomposition !== 0, 'minimumDecomposition cannot be 0');

    // Calculate the corresponding index into the data structure - this is necessary in order to support negative
    // minimum decomposition values, e.g. -3X.
    const countPropertyIndex = minimumDecomposition + EESharedConstants.MAX_NON_DECOMPOSABLE_AMOUNT;

    // get the property or, if specified, create it
    let coinTermCountProperty = this.coinTermCounts[coinTermTypeID][countPropertyIndex].countProperty;
    if (coinTermCountProperty === null && createIfUndefined) {
      // the requested count property does not yet exist - create and add it
      coinTermCountProperty = new Property(0);
      coinTermCountProperty.set(this.coinTermCounts[coinTermTypeID][countPropertyIndex].count);
      this.coinTermCounts[coinTermTypeID][countPropertyIndex].countProperty = coinTermCountProperty;
    }
    return coinTermCountProperty;
  }

  /**
   * stop editing the expression that is currently selected for edit, does nothing if no expression selected
   * @public
   */
  stopEditingExpression() {
    const expressionBeingEdited = this.expressionBeingEditedProperty.get();
    expressionBeingEdited.inEditModeProperty.set(false);

    // Handle the special cases where one or zero coin terms remain after combining terms, which is no longer
    // considered an expression.
    if (expressionBeingEdited.coinTerms.length <= 1) {
      expressionBeingEdited.breakApart();
    }
    this.expressionBeingEditedProperty.set(null);
  }

  // @private - update the count properties for the specified coin term type
  updateCoinTermCounts(coinTermTypeID) {
    // zero the non-property version of the counts
    this.coinTermCounts[coinTermTypeID].forEach(countObject => {
      countObject.count = 0;
    });

    // loop through the current set of coin terms and update counts for the specified coin term type
    this.coinTerms.forEach(coinTerm => {
      if (coinTerm.typeID === coinTermTypeID) {
        coinTerm.composition.forEach(minDecomposition => {
          this.coinTermCounts[coinTermTypeID][minDecomposition + EESharedConstants.MAX_NON_DECOMPOSABLE_AMOUNT].count++;
        });
      }
    });

    // update any count properties that exist
    this.coinTermCounts[coinTermTypeID].forEach(countObject => {
      if (countObject.countProperty) {
        countObject.countProperty.set(countObject.count);
      }
    });
  }

  // @public - remove the specified expression
  removeExpression(expression) {
    const coinTermsToRemove = expression.removeAllCoinTerms();
    coinTermsToRemove.forEach(coinTerm => {
      this.removeCoinTerm(coinTerm, true);
    });
    this.expressions.remove(expression);
    phet.log && phet.log(`removed ${expression.id}`);
  }

  // @private, remove an expression hint
  removeExpressionHint(expressionHint) {
    expressionHint.clear();
    this.expressionHints.remove(expressionHint);
  }

  /**
   * get the expression that overlaps the most with the provided coin term, null if no overlap exists, user controlled
   * expressions are excluded
   * @param {CoinTerm} coinTerm
   * @private
   */
  getExpressionMostOverlappingWithCoinTerm(coinTerm) {
    let maxOverlap = 0;
    let mostOverlappingExpression = null;

    // check each expression against the coin term to see which has max overlap
    this.expressions.forEach(expression => {
      if (!expression.userControlledProperty.get() &&
      // exclude expressions that are being moved by a user
      !expression.inProgressAnimationProperty.get() &&
      // exclude expressions that are animating to a destination
      !expression.collectedProperty.get() &&
      // exclude expression that are in a collection area
      expression.getCoinTermJoinZoneOverlap(coinTerm) > maxOverlap) {
        mostOverlappingExpression = expression;
        maxOverlap = expression.getCoinTermJoinZoneOverlap(coinTerm);
      }
    });
    return mostOverlappingExpression;
  }

  /**
   * get the free coin term (i.e. one that is not in an expression) that overlaps the most with the provided
   * expression, null if no overlapping coin terms exist
   * @param {Expression} expression
   * @returns {CoinTerm}
   * @private
   */
  getFreeCoinTermMostOverlappingWithExpression(expression) {
    let maxOverlap = 0;
    let mostOverlappingFreeCoinTerm = null;
    this.coinTerms.forEach(coinTerm => {
      // make sure the coin term is eligible and then compare the amount of overlap to what was previously seen
      if (!coinTerm.userControlledProperty.get() &&
      // exclude user controlled coin terms
      coinTerm.expressionProperty.get() === null &&
      // exclude coin terms already in or bound for an expression
      !coinTerm.collectedProperty.get() &&
      // exclude coin terms in a collection
      !coinTerm.isFadingOut() &&
      // exclude fading coin terms
      expression.getCoinTermJoinZoneOverlap(coinTerm) > maxOverlap) {
        maxOverlap = expression.getCoinTermJoinZoneOverlap(coinTerm);
        mostOverlappingFreeCoinTerm = coinTerm;
      }
    });
    return mostOverlappingFreeCoinTerm;
  }

  /**
   * get the expression that overlaps the most with the provided expression, null if no overlap exists, user
   * controlled expressions are excluded
   * @param {Expression} thisExpression
   * @private
   */
  getExpressionMostOverlappingWithExpression(thisExpression) {
    let maxOverlap = 0;
    let mostOverlappingExpression = null;

    // test each other expression for eligibility and overlap
    this.expressions.forEach(thatExpression => {
      // make sure the expression is eligible for consideration, then determine if it is the most overlapping
      if (thatExpression !== thisExpression && !thatExpression.userControlledProperty.get() &&
      // exclude expressions that are being moved by a user
      !thatExpression.inProgressAnimationProperty.get() &&
      // exclude expressions that are moving somewhere
      !thatExpression.collectedProperty.get() &&
      // exclude expressions that are in a collection area
      thisExpression.getOverlap(thatExpression) > maxOverlap) {
        mostOverlappingExpression = thatExpression;
        maxOverlap = thisExpression.getOverlap(thatExpression);
      }
    });
    return mostOverlappingExpression;
  }

  /**
   * Get the next position where a retrieved coin term (i.e. one that ended up out of bounds) can be placed.
   * @returns {Vector2}
   * @private
   */
  getNextOpenRetrievalSpot() {
    const position = new Vector2(0, 0);
    let row = 0;
    let column = 0;
    let openPositionFound = false;
    while (!openPositionFound) {
      position.x = RETRIEVED_COIN_TERM_FIRST_POSITION.x + column * RETRIEVED_COIN_TERMS_X_SPACING;
      position.y = RETRIEVED_COIN_TERM_FIRST_POSITION.y + row * RETRIEVED_COIN_TERMS_Y_SPACING;
      let closeCoinTerm = false;
      for (let i = 0; i < this.coinTerms.length; i++) {
        if (this.coinTerms.get(i).destinationProperty.get().distance(position) < MIN_RETRIEVAL_PLACEMENT_DISTANCE) {
          closeCoinTerm = true;
          break;
        }
      }
      if (closeCoinTerm) {
        // move to next position
        column++;
        if (column >= NUM_RETRIEVED_COIN_TERM_COLUMNS) {
          row++;
          column = 0;
        }
      } else {
        openPositionFound = true;
      }
    }
    return position;
  }

  /**
   * find a position where the provided expression won't overlap with others - this is only approximate, and doesn't
   * work perfectly in situations where there are lots of expressions in the play area
   * @returns {Vector2}
   * @private
   */
  getOpenExpressionPlacementPosition(expression) {
    // variables that controls the search grid, empirically determined
    const minX = 170;
    const minY = 30;
    let xPos = minX;
    let yPos = minY;
    const xIncrement = 30;
    const yIncrement = 30;

    // variables used in the loop to test if a position is available
    const position = new Vector2(xPos, minY);
    let openPositionFound = false;
    const proposedBounds = new Bounds2(0, 0, 0, 0);

    // loop, searching for open positions
    while (this.retrievalBounds.containsPoint(position) && !openPositionFound) {
      // calculate the bounds for the expression at this position
      proposedBounds.setMinMax(xPos, yPos, xPos + expression.widthProperty.get(), yPos + expression.heightProperty.get());
      let overlapFound = false;
      for (let i = 0; i < this.expressions.length && !overlapFound; i++) {
        if (this.expressions.get(i).getBounds().intersectsBounds(proposedBounds)) {
          overlapFound = true;
        }
      }
      if (!overlapFound) {
        // this position works
        openPositionFound = true;
      } else {
        // move to the next grid position
        yPos += yIncrement;
        if (yPos > this.retrievalBounds.maxY) {
          yPos = minY;
          xPos += xIncrement;
          if (xPos > this.retrievalBounds.maxX) {
            // we're out of space, fall out of the loop
            break;
          }
        }
        position.setXY(xPos, yPos);
      }
    }
    if (!openPositionFound) {
      // the screen was too full and we couldn't find a spot, so choose something at random
      position.setXY(minX + dotRandom.nextDouble() * (this.retrievalBounds.width - expression.widthProperty.get() - minX), minY + dotRandom.nextDouble() * (this.retrievalBounds.height - expression.widthProperty.get() - minY));
    }
    return position;
  }

  /**
   * get a reference to the collection area that most overlaps with the provided expression, null if no overlap exists
   * @param {Expression} expression
   * @private
   */
  getMostOverlappingCollectionAreaForExpression(expression) {
    let maxOverlap = 0;
    let mostOverlappingCollectionArea = null;
    this.collectionAreas.forEach(collectionArea => {
      if (expression.getOverlap(collectionArea) > maxOverlap) {
        mostOverlappingCollectionArea = collectionArea;
        maxOverlap = expression.getOverlap(collectionArea);
      }
    });
    return mostOverlappingCollectionArea;
  }

  /**
   * get a reference to the collection area that most overlaps with the provided coin term, null if no overlap exists
   * @param {CoinTerm} coinTerm
   * @private
   */
  getMostOverlappingCollectionAreaForCoinTerm(coinTerm) {
    let maxOverlap = 0;
    let mostOverlappingCollectionArea = null;
    this.collectionAreas.forEach(collectionArea => {
      const coinTermBounds = coinTerm.getViewBounds();
      const collectionAreaBounds = collectionArea.bounds;
      const xOverlap = Math.max(0, Math.min(coinTermBounds.maxX, collectionAreaBounds.maxX) - Math.max(coinTermBounds.minX, collectionAreaBounds.minX));
      const yOverlap = Math.max(0, Math.min(coinTermBounds.maxY, collectionAreaBounds.maxY) - Math.max(coinTermBounds.minY, collectionAreaBounds.minY));
      const totalOverlap = xOverlap * yOverlap;
      if (totalOverlap > maxOverlap) {
        maxOverlap = totalOverlap;
        mostOverlappingCollectionArea = collectionArea;
      }
    });
    return mostOverlappingCollectionArea;
  }

  /**
   * handler for when a coin term is added to the model, hooks up a bunch of listeners
   * @param addedCoinTerm
   * @private
   */
  coinTermAddedListener(addedCoinTerm) {
    const self = this;

    // Add a listener that will potentially combine this coin term with expressions or other coin terms based on
    // where it is released.
    function coinTermUserControlledListener(userControlled) {
      if (!userControlled) {
        // Set a bunch of variables related to the current state of this coin term.  It's not really necessary to set
        // them all every time, but it avoids a deeply nested if-else structure.
        const releasedOverCreatorBox = addedCoinTerm.getViewBounds().intersectsBounds(self.creatorBoxBounds);
        const expressionBeingEdited = self.expressionBeingEditedProperty.get();
        const mostOverlappingCollectionArea = self.getMostOverlappingCollectionAreaForCoinTerm(addedCoinTerm);
        const mostOverlappingExpression = self.getExpressionMostOverlappingWithCoinTerm(addedCoinTerm);
        const mostOverlappingLikeCoinTerm = self.getMostOverlappingLikeCoinTerm(addedCoinTerm);
        const joinableFreeCoinTerm = self.checkForJoinableFreeCoinTerm(addedCoinTerm);
        if (expressionBeingEdited && expressionBeingEdited.coinTerms.includes(addedCoinTerm)) {
          // An expression is being edited, so a released coin term could be either moved to a new position within an
          // expression or combined with another coin term in the expression.

          // determine if the coin term was dropped while overlapping a coin term of the same type
          const overlappingLikeCoinTerm = self.getOverlappingLikeCoinTermWithinExpression(addedCoinTerm, expressionBeingEdited);
          if (overlappingLikeCoinTerm) {
            // combine the dropped coin term with the one with which it overlaps
            overlappingLikeCoinTerm.absorb(addedCoinTerm, self.partialCancellationEnabled);
            phet.log && phet.log(`${overlappingLikeCoinTerm.id} absorbed ${addedCoinTerm.id}, ${overlappingLikeCoinTerm.id} composition = [${overlappingLikeCoinTerm.composition}]`);
            self.removeCoinTerm(addedCoinTerm, false);
          } else {
            // the coin term has been dropped at some potentially new position withing the expression
            expressionBeingEdited.reintegrateCoinTerm(addedCoinTerm);
          }
        } else if (releasedOverCreatorBox) {
          // the user has put this coin term back in the creator box, so remove it
          self.removeCoinTerm(addedCoinTerm, true);
        } else if (mostOverlappingCollectionArea) {
          // The coin term was released over a collection area (this only occurs on game screens).  Notify the
          // collection area so that it can either collect or reject it.
          mostOverlappingCollectionArea.collectOrRejectCoinTerm(addedCoinTerm);
        } else if (mostOverlappingExpression) {
          // the user is adding the coin term to an expression
          mostOverlappingExpression.addCoinTerm(addedCoinTerm);
          phet.log && phet.log(`added ${addedCoinTerm.id} to ${mostOverlappingExpression.id}`);
        } else if (mostOverlappingLikeCoinTerm) {
          // The coin term was released over a coin term of the same type, so combine the two coin terms into a single
          // one with a higher count value.
          addedCoinTerm.destinationReachedEmitter.addListener(function destinationReachedListener() {
            mostOverlappingLikeCoinTerm.absorb(addedCoinTerm, self.partialCancellationEnabled);
            phet.log && phet.log(`${mostOverlappingLikeCoinTerm.id} absorbed ${addedCoinTerm.id}, ${mostOverlappingLikeCoinTerm.id} composition = [${mostOverlappingLikeCoinTerm.composition}]`);
            self.removeCoinTerm(addedCoinTerm, false);
            addedCoinTerm.destinationReachedEmitter.removeListener(destinationReachedListener);
          });
          addedCoinTerm.travelToDestination(mostOverlappingLikeCoinTerm.positionProperty.get());
        } else if (joinableFreeCoinTerm) {
          // The coin term was released in a place where it could join another free coin term.
          let expressionHintToRemove;
          self.expressionHints.forEach(expressionHint => {
            if (expressionHint.containsCoinTerm(addedCoinTerm) && expressionHint.containsCoinTerm(joinableFreeCoinTerm)) {
              expressionHintToRemove = expressionHint;
            }
          });
          if (expressionHintToRemove) {
            self.removeExpressionHint(expressionHintToRemove);
          }

          // create the next expression with these coin terms
          self.expressions.push(new Expression(joinableFreeCoinTerm, addedCoinTerm, self.simplifyNegativesProperty));
        }
      }
    }
    addedCoinTerm.userControlledProperty.lazyLink(coinTermUserControlledListener);

    // add a listener that will handle requests to break apart the coin term
    function coinTermBreakApartListener() {
      if (addedCoinTerm.composition.length < 2) {
        // bail if the coin term can't be decomposed
        return;
      }
      const extractedCoinTerms = addedCoinTerm.extractConstituentCoinTerms();
      const relativeViewBounds = addedCoinTerm.localViewBoundsProperty.get();
      let pointToDistributeAround = addedCoinTerm.destinationProperty.get();

      // If the total combined coin count was even, shift the distribution point a bit so that the coins end up being
      // distributed around the centerX position.
      if (extractedCoinTerms.length % 2 === 1) {
        pointToDistributeAround = pointToDistributeAround.plusXY(-relativeViewBounds.width / 2 - BREAK_APART_SPACING / 2, 0);

        // set the parent coin position to the distribution point if it is in bounds
        if (self.retrievalBounds.containsPoint(pointToDistributeAround)) {
          addedCoinTerm.travelToDestination(pointToDistributeAround);
        } else {
          addedCoinTerm.travelToDestination(self.getNextOpenRetrievalSpot());
        }
      }

      // add the extracted coin terms to the model
      const interCoinTermDistance = relativeViewBounds.width + BREAK_APART_SPACING;
      let nextLeftX = pointToDistributeAround.x - interCoinTermDistance;
      let nextRightX = pointToDistributeAround.x + interCoinTermDistance;
      extractedCoinTerms.forEach((extractedCoinTerm, index) => {
        let destination;
        self.addCoinTerm(extractedCoinTerm);
        if (index % 2 === 0) {
          destination = new Vector2(nextRightX, pointToDistributeAround.y);
          nextRightX += interCoinTermDistance;
        } else {
          destination = new Vector2(nextLeftX, pointToDistributeAround.y);
          nextLeftX -= interCoinTermDistance;
        }

        // if the destination is outside of the allowed bounds, change it to be in bounds
        if (!self.retrievalBounds.containsPoint(destination)) {
          destination = self.getNextOpenRetrievalSpot();
        }

        // initiate the animation
        extractedCoinTerm.travelToDestination(destination);
      });
    }
    addedCoinTerm.breakApartEmitter.addListener(coinTermBreakApartListener);

    // add a listener that will remove this coin if and when it returns to its original position
    function coinTermReturnedToOriginListener() {
      self.removeCoinTerm(addedCoinTerm, false);
    }
    addedCoinTerm.returnedToOriginEmitter.addListener(coinTermReturnedToOriginListener);

    // monitor the existence strength of this coin term
    function coinTermExistenceStrengthListener(existenceStrength) {
      if (existenceStrength <= 0) {
        // the existence strength has gone to zero, remove this from the model
        self.removeCoinTerm(addedCoinTerm, false);
        if (self.expressionBeingEditedProperty.get()) {
          if (self.expressionBeingEditedProperty.get().coinTerms.length === 0) {
            // the removal of the coin term caused the expression being edited to be empty, so drop out of edit mode
            self.stopEditingExpression();
          }
        }
      }
    }
    addedCoinTerm.existenceStrengthProperty.link(coinTermExistenceStrengthListener);

    // clean up the listeners added above if and when this coin term is removed from the model
    this.coinTerms.addItemRemovedListener(function coinTermRemovalListener(removedCoinTerm) {
      if (removedCoinTerm === addedCoinTerm) {
        addedCoinTerm.userControlledProperty.unlink(coinTermUserControlledListener);
        addedCoinTerm.breakApartEmitter.removeListener(coinTermBreakApartListener);
        addedCoinTerm.returnedToOriginEmitter.removeListener(coinTermReturnedToOriginListener);
        addedCoinTerm.existenceStrengthProperty.unlink(coinTermExistenceStrengthListener);
        self.coinTerms.removeItemRemovedListener(coinTermRemovalListener);
      }
    });
  }

  /**
   * handle the addition of an expresion to the model
   * @param {Expression} addedExpression
   * @private
   */
  expressionAddedListener(addedExpression) {
    const self = this;

    // add a listener for when the expression is released, which may cause it to be combined with another expression
    function expressionUserControlledListener(userControlled) {
      if (!userControlled) {
        // Set a bunch of variables related to the current state of this expression.  It's not really necessary to set
        // them all every time, but it avoids a deeply nested if-else structure.
        const releasedOverCreatorBox = addedExpression.getBounds().intersectsBounds(self.creatorBoxBounds);
        const mostOverlappingCollectionArea = self.getMostOverlappingCollectionAreaForExpression(addedExpression);
        const mostOverlappingExpression = self.getExpressionMostOverlappingWithExpression(addedExpression);
        const numOverlappingCoinTerms = addedExpression.hoveringCoinTerms.length;

        // state checking
        assert && assert(numOverlappingCoinTerms === 0 || numOverlappingCoinTerms === 1, `max of one overlapping free coin term when expression is released, seeing ${numOverlappingCoinTerms}`);
        if (releasedOverCreatorBox) {
          // the expression was released over the creator box, so it and the coin terms should be "put away"
          self.removeExpression(addedExpression);
        } else if (mostOverlappingCollectionArea) {
          // The expression was released in a position that at least partially overlaps a collection area.  The
          // collection area must decide whether to collect or reject the expression.
          mostOverlappingCollectionArea.collectOrRejectExpression(addedExpression);
        } else if (mostOverlappingExpression) {
          // The expression was released in a place where it at least partially overlaps another expression, so the
          // two expressions should be joined into one.  The first step is to remove the expression from the list of
          // those hovering.
          mostOverlappingExpression.removeHoveringExpression(addedExpression);

          // send the combining expression to the right side of receiving expression
          const destinationForCombine = mostOverlappingExpression.getUpperRightCorner();
          addedExpression.travelToDestination(destinationForCombine);

          // Listen for when the expression is in place and, when it is, transfer its coin terms to the receiving
          // expression.
          addedExpression.destinationReachedEmitter.addListener(function destinationReachedListener() {
            // destination reached, combine with other expression, but ONLY if it hasn't moved or been removed
            if (mostOverlappingExpression.getUpperRightCorner().equals(destinationForCombine) && self.expressions.includes(mostOverlappingExpression)) {
              const coinTermsToBeMoved = addedExpression.removeAllCoinTerms();
              self.expressions.remove(addedExpression);
              coinTermsToBeMoved.forEach(coinTerm => {
                phet.log && phet.log(`moving ${coinTerm.id} from ${addedExpression.id} to ${mostOverlappingExpression.id}`);
                mostOverlappingExpression.addCoinTerm(coinTerm);
              });
            } else {
              // The destination was reached, but the expression that this one was joining has moved, so the wedding
              // is off.  If this one is now out of bounds, move it to a reachable position.
              if (!self.retrievalBounds.intersectsBounds(addedExpression.getBounds())) {
                addedExpression.travelToDestination(self.getOpenExpressionPlacementPosition(addedExpression));
              }
            }
            addedExpression.destinationReachedEmitter.removeListener(destinationReachedListener);
          });
        } else if (numOverlappingCoinTerms === 1) {
          // the expression was released over a free coin term, so have that free coin term join the expression
          const coinTermToAddToExpression = addedExpression.hoveringCoinTerms[0];
          coinTermToAddToExpression.expressionProperty.set(addedExpression); // prevents interaction during animation
          if (addedExpression.rightHintActiveProperty.get()) {
            // move to the left side of the coin term
            addedExpression.travelToDestination(coinTermToAddToExpression.positionProperty.get().plusXY(-addedExpression.widthProperty.get() - addedExpression.rightHintWidthProperty.get() / 2, -addedExpression.heightProperty.get() / 2));
          } else {
            assert && assert(addedExpression.leftHintActiveProperty.get(), 'at least one hint should be active if there is a hovering coin term');

            // move to the right side of the coin term
            addedExpression.travelToDestination(coinTermToAddToExpression.positionProperty.get().plusXY(addedExpression.leftHintWidthProperty.get() / 2, -addedExpression.heightProperty.get() / 2));
          }
          addedExpression.destinationReachedEmitter.addListener(function addCoinTermAfterAnimation() {
            addedExpression.addCoinTerm(coinTermToAddToExpression);
            addedExpression.destinationReachedEmitter.removeListener(addCoinTermAfterAnimation);
          });
        }
      }
    }
    addedExpression.userControlledProperty.lazyLink(expressionUserControlledListener);

    // add a listener that will handle requests to break apart this expression
    function expressionBreakApartListener() {
      // keep a reference to the center for when we spread out the coin terms
      const expressionCenterX = addedExpression.getBounds().centerX;

      // remove the coin terms from the expression and the expression from the model
      const newlyFreedCoinTerms = addedExpression.removeAllCoinTerms();
      self.expressions.remove(addedExpression);

      // spread the released coin terms out horizontally
      newlyFreedCoinTerms.forEach(newlyFreedCoinTerm => {
        // calculate a destination that will cause the coin terms to spread out from the expression center
        const horizontalDistanceFromExpressionCenter = newlyFreedCoinTerm.positionProperty.get().x - expressionCenterX;
        let coinTermDestination = new Vector2(newlyFreedCoinTerm.positionProperty.get().x + horizontalDistanceFromExpressionCenter * 0.15,
        // spread factor empirically determined
        newlyFreedCoinTerm.positionProperty.get().y);

        // if the destination is outside of the allowed bounds, change it to be in bounds
        if (!self.retrievalBounds.containsPoint(coinTermDestination)) {
          coinTermDestination = self.getNextOpenRetrievalSpot();
        }

        // initiate the animation
        newlyFreedCoinTerm.travelToDestination(coinTermDestination);
      });
    }
    addedExpression.breakApartEmitter.addListener(expressionBreakApartListener);

    // add a listener that will handle requests to edit this expression
    function editModeListener(inEditMode) {
      if (inEditMode) {
        self.expressionBeingEditedProperty.set(addedExpression);
      }
    }
    addedExpression.inEditModeProperty.link(editModeListener);

    // remove the listeners when this expression is removed
    this.expressions.addItemRemovedListener(function expressionRemovedListener(removedExpression) {
      if (removedExpression === addedExpression) {
        addedExpression.dispose();
        addedExpression.userControlledProperty.unlink(expressionUserControlledListener);
        addedExpression.breakApartEmitter.removeListener(expressionBreakApartListener);
        addedExpression.inEditModeProperty.unlink(editModeListener);
        self.expressions.removeItemRemovedListener(expressionRemovedListener);
      }
    });
  }

  /**
   * @public
   */
  reset() {
    // reset any collection areas that have been created
    this.collectionAreas.forEach(collectionArea => {
      collectionArea.reset();
    });
    this.expressions.clear();
    this.coinTerms.clear();
    this.viewModeProperty.reset();
    this.showCoinValuesProperty.reset();
    this.showVariableValuesProperty.reset();
    this.showAllCoefficientsProperty.reset();
    this.xTermValueProperty.reset();
    this.yTermValueProperty.reset();
    this.zTermValueProperty.reset();
    this.totalValueProperty.reset();
    this.expressionBeingEditedProperty.reset();
    this.simplifyNegativesProperty.reset();
    _.values(this.coinTermCounts).forEach(coinTermCountArray => {
      coinTermCountArray.forEach(coinTermCountObject => {
        coinTermCountObject.count = 0;
        coinTermCountObject.countProperty && coinTermCountObject.countProperty.reset();
      });
    });
  }

  /**
   * test if coinTermB is in the "expression combine zone" of coinTermA
   * @param {CoinTerm} coinTermA
   * @param {CoinTerm} coinTermB
   * @returns {boolean}
   * @private
   */
  isCoinTermInExpressionCombineZone(coinTermA, coinTermB) {
    // Make the combine zone wider, but vertically shorter, than the actual bounds, as this gives the most desirable
    // behavior.  The multiplier for the height was empirically determined.
    const extendedTargetCoinTermBounds = coinTermA.getViewBounds().dilatedXY(coinTermA.localViewBoundsProperty.get().width, -coinTermA.localViewBoundsProperty.get().height * 0.25);
    return extendedTargetCoinTermBounds.intersectsBounds(coinTermB.getViewBounds());
  }

  /**
   * returns true if coin term is currently part of an expression
   * @param {CoinTerm} coinTerm
   * @returns {boolean}
   * @public
   */
  isCoinTermInExpression(coinTerm) {
    for (let i = 0; i < this.expressions.length; i++) {
      if (this.expressions.get(i).containsCoinTerm(coinTerm)) {
        return true;
      }
    }
    return false;
  }

  /**
   * Check for coin terms that are not already in expressions that are positioned such that they could combine with
   * the provided coin into a new expression.  If more than one possibility exists, the closest is returned.  If none
   * are found, null is returned.
   * @param {CoinTerm} thisCoinTerm
   * @returns {CoinTerm|null}
   * @private
   */
  checkForJoinableFreeCoinTerm(thisCoinTerm) {
    let joinableFreeCoinTerm = null;
    this.coinTerms.forEach(thatCoinTerm => {
      // Okay, this is one nasty looking 'if' clause, but the basic idea is that first a bunch of conditions are
      // checked that would exclude the provided coin terms from joining, then it checks to see if the coin term is
      // in the 'join zone', and then checks that it's closer than any previously found joinable coin term.
      if (thatCoinTerm !== thisCoinTerm &&
      // exclude thisCoinTerm
      !thatCoinTerm.userControlledProperty.get() &&
      // exclude coin terms that are user controlled
      thatCoinTerm.expressionProperty.get() === null &&
      // exclude coin terms that are in or are joining expressions
      !thatCoinTerm.collectedProperty.get() &&
      // exclude coin terms that are in a collection
      !thatCoinTerm.inProgressAnimationProperty.get() &&
      // exclude coin terms that are moving
      this.isCoinTermInExpressionCombineZone(thatCoinTerm, thisCoinTerm) && (
      // in the 'combine zone'
      !joinableFreeCoinTerm || joinableFreeCoinTerm.positionProperty.get().distance(thatCoinTerm) < joinableFreeCoinTerm.positionProperty.get().distance(thisCoinTerm))) {
        joinableFreeCoinTerm = thatCoinTerm;
      }
    });
    return joinableFreeCoinTerm;
  }

  /**
   * get the amount of overlap given two coin terms by comparing position and coin radius
   * @param {CoinTerm} coinTermA
   * @param {CoinTerm} coinTermB
   * @returns {number}
   * @private
   */
  getCoinOverlapAmount(coinTermA, coinTermB) {
    const distanceBetweenCenters = coinTermA.positionProperty.get().distance(coinTermB.positionProperty.get());
    return Math.max(coinTermA.coinRadius + coinTermB.coinRadius - distanceBetweenCenters, 0);
  }

  /**
   * get the amount of overlap between the view representations of two coin terms
   * @param {CoinTerm} coinTermA
   * @param {CoinTerm} coinTermB
   * @returns {number} amount of overlap, which is essentially an area value in view coordinates
   * @private
   */
  getViewBoundsOverlapAmount(coinTermA, coinTermB) {
    let overlap = 0;
    if (coinTermA.getViewBounds().intersectsBounds(coinTermB.getViewBounds())) {
      const intersection = coinTermA.getViewBounds().intersection(coinTermB.getViewBounds());
      overlap = intersection.width * intersection.height;
    }
    return overlap;
  }

  /**
   * get the coin term that overlaps the most with the provided coin term, is of the same type, is not user
   * controlled, and is not already in an expression
   * @param {CoinTerm} thisCoinTerm
   * @returns {CoinTerm}
   * @private
   */
  getMostOverlappingLikeCoinTerm(thisCoinTerm) {
    assert && assert(this.coinTerms.includes(thisCoinTerm), 'overlap requested for something that is not in model');
    let mostOverlappingLikeCoinTerm = null;
    let maxOverlapAmount = 0;
    this.coinTerms.forEach(thatCoinTerm => {
      // test that the coin term is eligible for consideration first
      if (thatCoinTerm.isEligibleToCombineWith(thisCoinTerm) && !this.isCoinTermInExpression(thatCoinTerm)) {
        // calculate and compare the relative overlap amounts, done a bit differently in the different view modes
        let overlapAmount;
        if (this.viewModeProperty.get() === ViewMode.COINS) {
          overlapAmount = this.getCoinOverlapAmount(thisCoinTerm, thatCoinTerm);
        } else {
          overlapAmount = this.getViewBoundsOverlapAmount(thisCoinTerm, thatCoinTerm);
        }
        if (overlapAmount > maxOverlapAmount) {
          maxOverlapAmount = overlapAmount;
          mostOverlappingLikeCoinTerm = thatCoinTerm;
        }
      }
    });
    return mostOverlappingLikeCoinTerm;
  }

  /**
   * @param {CoinTerm} coinTerm
   * @param {Expression} expression
   * @returns {CoinTerm|null}
   * @private
   */
  getOverlappingLikeCoinTermWithinExpression(coinTerm, expression) {
    let overlappingCoinTerm = null;
    for (let i = 0; i < expression.coinTerms.length; i++) {
      const potentiallyOverlappingCoinTerm = expression.coinTerms.get(i);
      if (potentiallyOverlappingCoinTerm.isEligibleToCombineWith(coinTerm)) {
        let overlapAmount = 0;
        if (this.viewModeProperty.get() === ViewMode.COINS) {
          overlapAmount = this.getCoinOverlapAmount(coinTerm, potentiallyOverlappingCoinTerm);
        } else {
          overlapAmount = this.getViewBoundsOverlapAmount(coinTerm, potentiallyOverlappingCoinTerm);
        }
        if (overlapAmount > 0) {
          overlappingCoinTerm = potentiallyOverlappingCoinTerm;
          // since this is an expression, there should be a max of one overlapping coin term, so we can bail here
          break;
        }
      }
    }
    return overlappingCoinTerm;
  }

  /**
   * @param {Bounds2} bounds
   * @public
   */
  setRetrievalBounds(bounds) {
    assert && assert(this.retrievalBounds === Bounds2.EVERYTHING, 'coin term bounds should only be set once');
    this.retrievalBounds = bounds;
  }

  /**
   * returns true is any expression or coin term is currently user controlled, helpful in preventing multi-touch
   * issues
   * @returns {boolean}
   * @public
   */
  isAnythingUserControlled() {
    let somethingIsUserControlled = false;
    let i;
    for (i = 0; i < this.coinTerms.length && !somethingIsUserControlled; i++) {
      if (this.coinTerms.get(i).userControlledProperty.get()) {
        somethingIsUserControlled = true;
      }
    }
    for (i = 0; i < this.expressions.length && !somethingIsUserControlled; i++) {
      if (this.expressions.get(i).userControlledProperty.get()) {
        somethingIsUserControlled = true;
      }
    }
    return somethingIsUserControlled;
  }
}
expressionExchange.register('ExpressionManipulationModel', ExpressionManipulationModel);
export default ExpressionManipulationModel;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJjcmVhdGVPYnNlcnZhYmxlQXJyYXkiLCJNdWx0aWxpbmsiLCJQcm9wZXJ0eSIsIlN0cmluZ1Byb3BlcnR5IiwiQm91bmRzMiIsImRvdFJhbmRvbSIsIlZlY3RvcjIiLCJtZXJnZSIsImV4cHJlc3Npb25FeGNoYW5nZSIsIkVFU2hhcmVkQ29uc3RhbnRzIiwiQWxsb3dlZFJlcHJlc2VudGF0aW9ucyIsIkNvaW5UZXJtVHlwZUlEIiwiVmlld01vZGUiLCJDb2luVGVybUZhY3RvcnkiLCJFeHByZXNzaW9uIiwiRXhwcmVzc2lvbkhpbnQiLCJCUkVBS19BUEFSVF9TUEFDSU5HIiwiUkVUUklFVkVEX0NPSU5fVEVSTVNfWF9TUEFDSU5HIiwiUkVUUklFVkVEX0NPSU5fVEVSTVNfWV9TUEFDSU5HIiwiUkVUUklFVkVEX0NPSU5fVEVSTV9GSVJTVF9QT1NJVElPTiIsIk5VTV9SRVRSSUVWRURfQ09JTl9URVJNX0NPTFVNTlMiLCJNSU5fUkVUUklFVkFMX1BMQUNFTUVOVF9ESVNUQU5DRSIsIkV4cHJlc3Npb25NYW5pcHVsYXRpb25Nb2RlbCIsImNvbnN0cnVjdG9yIiwib3B0aW9ucyIsImFsbG93ZWRSZXByZXNlbnRhdGlvbnMiLCJDT0lOU19BTkRfVkFSSUFCTEVTIiwicGFydGlhbENhbmNlbGxhdGlvbkVuYWJsZWQiLCJzaW1wbGlmeU5lZ2F0aXZlc0RlZmF1bHQiLCJpbml0aWFsVmlld01vZGUiLCJWQVJJQUJMRVNfT05MWSIsIlZBUklBQkxFUyIsIkNPSU5TIiwidmlld01vZGVQcm9wZXJ0eSIsInNob3dDb2luVmFsdWVzUHJvcGVydHkiLCJzaG93VmFyaWFibGVWYWx1ZXNQcm9wZXJ0eSIsInNob3dBbGxDb2VmZmljaWVudHNQcm9wZXJ0eSIsInhUZXJtVmFsdWVQcm9wZXJ0eSIsInlUZXJtVmFsdWVQcm9wZXJ0eSIsInpUZXJtVmFsdWVQcm9wZXJ0eSIsInRvdGFsVmFsdWVQcm9wZXJ0eSIsImV4cHJlc3Npb25CZWluZ0VkaXRlZFByb3BlcnR5Iiwic2ltcGxpZnlOZWdhdGl2ZXNQcm9wZXJ0eSIsImNvaW5UZXJtRmFjdG9yeSIsImNvaW5UZXJtcyIsImV4cHJlc3Npb25zIiwiZXhwcmVzc2lvbkhpbnRzIiwicmV0cmlldmFsQm91bmRzIiwiRVZFUllUSElORyIsImNvbGxlY3Rpb25BcmVhcyIsImNvaW5UZXJtQ291bnRzIiwiY291bnRPYmplY3RzUGVyQ29pblRlcm1UeXBlIiwiTUFYX05PTl9ERUNPTVBPU0FCTEVfQU1PVU5UIiwiXyIsImtleXMiLCJmb3JFYWNoIiwiY29pblRlcm1UeXBlIiwiQXJyYXkiLCJ0aW1lcyIsImluZGV4IiwiY291bnQiLCJjb3VudFByb3BlcnR5IiwiY3JlYXRvckJveEJvdW5kcyIsIk5PVEhJTkciLCJsaW5rIiwibmV3Vmlld01vZGUiLCJvbGRWaWV3TW9kZSIsInJlc2V0IiwibXVsdGlsaW5rIiwibGVuZ3RoUHJvcGVydHkiLCJ0b3RhbCIsImNvaW5UZXJtIiwidmFsdWVQcm9wZXJ0eSIsInZhbHVlIiwidG90YWxDb3VudFByb3BlcnR5IiwiZ2V0Iiwic2V0IiwiYWRkSXRlbUFkZGVkTGlzdGVuZXIiLCJjb2luVGVybUFkZGVkTGlzdGVuZXIiLCJiaW5kIiwiZXhwcmVzc2lvbkFkZGVkTGlzdGVuZXIiLCJzdGVwIiwiZHQiLCJ1c2VyQ29udHJvbGxlZENvaW5UZXJtcyIsImNvaW5UZXJtc1dpdGhIYWxvcyIsImV4cHJlc3Npb24iLCJjbGVhckhvdmVyaW5nQ29pblRlcm1zIiwiY2xlYXJIb3ZlcmluZ0V4cHJlc3Npb25zIiwidXNlckNvbnRyb2xsZWRFeHByZXNzaW9ucyIsImZpbHRlciIsInVzZXJDb250cm9sbGVkUHJvcGVydHkiLCJjb2xsZWN0aW9uQXJlYXNXaG9zZUhhbG9zU2hvdWxkQmVBY3RpdmUiLCJ1c2VyQ29udHJvbGxlZEV4cHJlc3Npb24iLCJleHByZXNzaW9uSXNPdmVyQ3JlYXRvckJveCIsImdldEJvdW5kcyIsImludGVyc2VjdHNCb3VuZHMiLCJtb3N0T3ZlcmxhcHBpbmdDb2xsZWN0aW9uQXJlYSIsImdldE1vc3RPdmVybGFwcGluZ0NvbGxlY3Rpb25BcmVhRm9yRXhwcmVzc2lvbiIsIm1vc3RPdmVybGFwcGluZ0V4cHJlc3Npb24iLCJnZXRFeHByZXNzaW9uTW9zdE92ZXJsYXBwaW5nV2l0aEV4cHJlc3Npb24iLCJtb3N0T3ZlcmxhcHBpbmdDb2luVGVybSIsImdldEZyZWVDb2luVGVybU1vc3RPdmVybGFwcGluZ1dpdGhFeHByZXNzaW9uIiwiZXhwcmVzc2lvbk92ZXJXaGljaFRoaXNFeHByZXNzaW9uSXNIb3ZlcmluZyIsImNvaW5UZXJtT3ZlcldoaWNoVGhpc0V4cHJlc3Npb25Jc0hvdmVyaW5nIiwiY29sbGVjdGVkSXRlbVByb3BlcnR5IiwicHVzaCIsImFkZEhvdmVyaW5nRXhwcmVzc2lvbiIsImFkZEhvdmVyaW5nQ29pblRlcm0iLCJjb2luIiwibmVlZGVkRXhwcmVzc2lvbkhpbnRzIiwidXNlckNvbnRyb2xsZWRDb2luVGVybSIsImNvaW5UZXJtSXNPdmVyQ3JlYXRvckJveCIsImdldFZpZXdCb3VuZHMiLCJnZXRNb3N0T3ZlcmxhcHBpbmdDb2xsZWN0aW9uQXJlYUZvckNvaW5UZXJtIiwiZ2V0RXhwcmVzc2lvbk1vc3RPdmVybGFwcGluZ1dpdGhDb2luVGVybSIsIm1vc3RPdmVybGFwcGluZ0xpa2VDb2luVGVybSIsImdldE1vc3RPdmVybGFwcGluZ0xpa2VDb2luVGVybSIsImpvaW5hYmxlRnJlZUNvaW5UZXJtIiwiY2hlY2tGb3JKb2luYWJsZUZyZWVDb2luVGVybSIsImV4cHJlc3Npb25PdmVyV2hpY2hDb2luVGVybUlzSG92ZXJpbmciLCJsZW5ndGgiLCJleGlzdGluZ0V4cHJlc3Npb25IaW50IiwibWF0Y2hGb3VuZCIsIm5lZWRlZEV4cHJlc3Npb25IaW50IiwiZXF1YWxzIiwicmVtb3ZlRXhwcmVzc2lvbkhpbnQiLCJhZGQiLCJjb2xsZWN0aW9uQXJlYSIsImhhbG9BY3RpdmVQcm9wZXJ0eSIsImluZGV4T2YiLCJvdmVybGFwcGluZ0NvaW5UZXJtIiwiZ2V0T3ZlcmxhcHBpbmdMaWtlQ29pblRlcm1XaXRoaW5FeHByZXNzaW9uIiwiY29tYmluZUhhbG9BY3RpdmVQcm9wZXJ0eSIsImFkZENvaW5UZXJtIiwidXBkYXRlQ29pblRlcm1Db3VudHMiLCJ0eXBlSUQiLCJwaGV0IiwibG9nIiwiaWQiLCJjb21wb3NpdGlvbiIsInJlbW92ZUNvaW5UZXJtIiwiYW5pbWF0ZSIsImNvbnRhaW5zQ29pblRlcm0iLCJyZXR1cm5Ub09yaWdpbiIsInJlbW92ZSIsImdldENvaW5UZXJtQ291bnRQcm9wZXJ0eSIsImNvaW5UZXJtVHlwZUlEIiwibWluaW11bURlY29tcG9zaXRpb24iLCJjcmVhdGVJZlVuZGVmaW5lZCIsImFzc2VydCIsImhhc093blByb3BlcnR5IiwiY291bnRQcm9wZXJ0eUluZGV4IiwiY29pblRlcm1Db3VudFByb3BlcnR5Iiwic3RvcEVkaXRpbmdFeHByZXNzaW9uIiwiZXhwcmVzc2lvbkJlaW5nRWRpdGVkIiwiaW5FZGl0TW9kZVByb3BlcnR5IiwiYnJlYWtBcGFydCIsImNvdW50T2JqZWN0IiwibWluRGVjb21wb3NpdGlvbiIsInJlbW92ZUV4cHJlc3Npb24iLCJjb2luVGVybXNUb1JlbW92ZSIsInJlbW92ZUFsbENvaW5UZXJtcyIsImV4cHJlc3Npb25IaW50IiwiY2xlYXIiLCJtYXhPdmVybGFwIiwiaW5Qcm9ncmVzc0FuaW1hdGlvblByb3BlcnR5IiwiY29sbGVjdGVkUHJvcGVydHkiLCJnZXRDb2luVGVybUpvaW5ab25lT3ZlcmxhcCIsIm1vc3RPdmVybGFwcGluZ0ZyZWVDb2luVGVybSIsImV4cHJlc3Npb25Qcm9wZXJ0eSIsImlzRmFkaW5nT3V0IiwidGhpc0V4cHJlc3Npb24iLCJ0aGF0RXhwcmVzc2lvbiIsImdldE92ZXJsYXAiLCJnZXROZXh0T3BlblJldHJpZXZhbFNwb3QiLCJwb3NpdGlvbiIsInJvdyIsImNvbHVtbiIsIm9wZW5Qb3NpdGlvbkZvdW5kIiwieCIsInkiLCJjbG9zZUNvaW5UZXJtIiwiaSIsImRlc3RpbmF0aW9uUHJvcGVydHkiLCJkaXN0YW5jZSIsImdldE9wZW5FeHByZXNzaW9uUGxhY2VtZW50UG9zaXRpb24iLCJtaW5YIiwibWluWSIsInhQb3MiLCJ5UG9zIiwieEluY3JlbWVudCIsInlJbmNyZW1lbnQiLCJwcm9wb3NlZEJvdW5kcyIsImNvbnRhaW5zUG9pbnQiLCJzZXRNaW5NYXgiLCJ3aWR0aFByb3BlcnR5IiwiaGVpZ2h0UHJvcGVydHkiLCJvdmVybGFwRm91bmQiLCJtYXhZIiwibWF4WCIsInNldFhZIiwibmV4dERvdWJsZSIsIndpZHRoIiwiaGVpZ2h0IiwiY29pblRlcm1Cb3VuZHMiLCJjb2xsZWN0aW9uQXJlYUJvdW5kcyIsImJvdW5kcyIsInhPdmVybGFwIiwiTWF0aCIsIm1heCIsIm1pbiIsInlPdmVybGFwIiwidG90YWxPdmVybGFwIiwiYWRkZWRDb2luVGVybSIsInNlbGYiLCJjb2luVGVybVVzZXJDb250cm9sbGVkTGlzdGVuZXIiLCJ1c2VyQ29udHJvbGxlZCIsInJlbGVhc2VkT3ZlckNyZWF0b3JCb3giLCJpbmNsdWRlcyIsIm92ZXJsYXBwaW5nTGlrZUNvaW5UZXJtIiwiYWJzb3JiIiwicmVpbnRlZ3JhdGVDb2luVGVybSIsImNvbGxlY3RPclJlamVjdENvaW5UZXJtIiwiZGVzdGluYXRpb25SZWFjaGVkRW1pdHRlciIsImFkZExpc3RlbmVyIiwiZGVzdGluYXRpb25SZWFjaGVkTGlzdGVuZXIiLCJyZW1vdmVMaXN0ZW5lciIsInRyYXZlbFRvRGVzdGluYXRpb24iLCJwb3NpdGlvblByb3BlcnR5IiwiZXhwcmVzc2lvbkhpbnRUb1JlbW92ZSIsImxhenlMaW5rIiwiY29pblRlcm1CcmVha0FwYXJ0TGlzdGVuZXIiLCJleHRyYWN0ZWRDb2luVGVybXMiLCJleHRyYWN0Q29uc3RpdHVlbnRDb2luVGVybXMiLCJyZWxhdGl2ZVZpZXdCb3VuZHMiLCJsb2NhbFZpZXdCb3VuZHNQcm9wZXJ0eSIsInBvaW50VG9EaXN0cmlidXRlQXJvdW5kIiwicGx1c1hZIiwiaW50ZXJDb2luVGVybURpc3RhbmNlIiwibmV4dExlZnRYIiwibmV4dFJpZ2h0WCIsImV4dHJhY3RlZENvaW5UZXJtIiwiZGVzdGluYXRpb24iLCJicmVha0FwYXJ0RW1pdHRlciIsImNvaW5UZXJtUmV0dXJuZWRUb09yaWdpbkxpc3RlbmVyIiwicmV0dXJuZWRUb09yaWdpbkVtaXR0ZXIiLCJjb2luVGVybUV4aXN0ZW5jZVN0cmVuZ3RoTGlzdGVuZXIiLCJleGlzdGVuY2VTdHJlbmd0aCIsImV4aXN0ZW5jZVN0cmVuZ3RoUHJvcGVydHkiLCJhZGRJdGVtUmVtb3ZlZExpc3RlbmVyIiwiY29pblRlcm1SZW1vdmFsTGlzdGVuZXIiLCJyZW1vdmVkQ29pblRlcm0iLCJ1bmxpbmsiLCJyZW1vdmVJdGVtUmVtb3ZlZExpc3RlbmVyIiwiYWRkZWRFeHByZXNzaW9uIiwiZXhwcmVzc2lvblVzZXJDb250cm9sbGVkTGlzdGVuZXIiLCJudW1PdmVybGFwcGluZ0NvaW5UZXJtcyIsImhvdmVyaW5nQ29pblRlcm1zIiwiY29sbGVjdE9yUmVqZWN0RXhwcmVzc2lvbiIsInJlbW92ZUhvdmVyaW5nRXhwcmVzc2lvbiIsImRlc3RpbmF0aW9uRm9yQ29tYmluZSIsImdldFVwcGVyUmlnaHRDb3JuZXIiLCJjb2luVGVybXNUb0JlTW92ZWQiLCJjb2luVGVybVRvQWRkVG9FeHByZXNzaW9uIiwicmlnaHRIaW50QWN0aXZlUHJvcGVydHkiLCJyaWdodEhpbnRXaWR0aFByb3BlcnR5IiwibGVmdEhpbnRBY3RpdmVQcm9wZXJ0eSIsImxlZnRIaW50V2lkdGhQcm9wZXJ0eSIsImFkZENvaW5UZXJtQWZ0ZXJBbmltYXRpb24iLCJleHByZXNzaW9uQnJlYWtBcGFydExpc3RlbmVyIiwiZXhwcmVzc2lvbkNlbnRlclgiLCJjZW50ZXJYIiwibmV3bHlGcmVlZENvaW5UZXJtcyIsIm5ld2x5RnJlZWRDb2luVGVybSIsImhvcml6b250YWxEaXN0YW5jZUZyb21FeHByZXNzaW9uQ2VudGVyIiwiY29pblRlcm1EZXN0aW5hdGlvbiIsImVkaXRNb2RlTGlzdGVuZXIiLCJpbkVkaXRNb2RlIiwiZXhwcmVzc2lvblJlbW92ZWRMaXN0ZW5lciIsInJlbW92ZWRFeHByZXNzaW9uIiwiZGlzcG9zZSIsInZhbHVlcyIsImNvaW5UZXJtQ291bnRBcnJheSIsImNvaW5UZXJtQ291bnRPYmplY3QiLCJpc0NvaW5UZXJtSW5FeHByZXNzaW9uQ29tYmluZVpvbmUiLCJjb2luVGVybUEiLCJjb2luVGVybUIiLCJleHRlbmRlZFRhcmdldENvaW5UZXJtQm91bmRzIiwiZGlsYXRlZFhZIiwiaXNDb2luVGVybUluRXhwcmVzc2lvbiIsInRoaXNDb2luVGVybSIsInRoYXRDb2luVGVybSIsImdldENvaW5PdmVybGFwQW1vdW50IiwiZGlzdGFuY2VCZXR3ZWVuQ2VudGVycyIsImNvaW5SYWRpdXMiLCJnZXRWaWV3Qm91bmRzT3ZlcmxhcEFtb3VudCIsIm92ZXJsYXAiLCJpbnRlcnNlY3Rpb24iLCJtYXhPdmVybGFwQW1vdW50IiwiaXNFbGlnaWJsZVRvQ29tYmluZVdpdGgiLCJvdmVybGFwQW1vdW50IiwicG90ZW50aWFsbHlPdmVybGFwcGluZ0NvaW5UZXJtIiwic2V0UmV0cmlldmFsQm91bmRzIiwiaXNBbnl0aGluZ1VzZXJDb250cm9sbGVkIiwic29tZXRoaW5nSXNVc2VyQ29udHJvbGxlZCIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiRXhwcmVzc2lvbk1hbmlwdWxhdGlvbk1vZGVsLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE1LTIwMjIsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIEEgbW9kZWwgdGhhdCBhbGxvd3MgdXNlcnMgdG8gbW92ZSBjb2luIHRlcm1zIGFyb3VuZCwgY29tYmluZSB0aGVtIGludG8gZXhwcmVzc2lvbnMsIGVkaXQgdGhlIGV4cHJlc3Npb25zLCBjaGFuZ2UgdGhlXHJcbiAqIHZhbHVlcyBvZiB0aGUgdW5kZXJseWluZyB2YXJpYWJsZXMsIGFuZCB0cmFjayBkaWZmZXJlbnQgdmlldyBtb2Rlcy4gIFRoaXMgaXMgdGhlIG1haW4gbW9kZWwgdHlwZSB1c2VkIGluIGFsbCBvZiB0aGVcclxuICogZXhwbG9yZSBzY3JlZW5zIGFuZCBmb3IgZWFjaCBvZiB0aGUgZ2FtZSBjaGFsbGVuZ2VzLiAgT3B0aW9ucyBhcmUgdXNlZCB0byBzdXBwb3J0IHRoZSBkaWZmZXJlbnQgcmVzdHJpY3Rpb25zIGZvclxyXG4gKiBlYWNoIHNjcmVlbi5cclxuICpcclxuICogQGF1dGhvciBKb2huIEJsYW5jb1xyXG4gKi9cclxuXHJcbmltcG9ydCBjcmVhdGVPYnNlcnZhYmxlQXJyYXkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9jcmVhdGVPYnNlcnZhYmxlQXJyYXkuanMnO1xyXG5pbXBvcnQgTXVsdGlsaW5rIGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvTXVsdGlsaW5rLmpzJztcclxuaW1wb3J0IFByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgU3RyaW5nUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9TdHJpbmdQcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBCb3VuZHMyIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9Cb3VuZHMyLmpzJztcclxuaW1wb3J0IGRvdFJhbmRvbSBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvZG90UmFuZG9tLmpzJztcclxuaW1wb3J0IFZlY3RvcjIgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL1ZlY3RvcjIuanMnO1xyXG5pbXBvcnQgbWVyZ2UgZnJvbSAnLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL21lcmdlLmpzJztcclxuaW1wb3J0IGV4cHJlc3Npb25FeGNoYW5nZSBmcm9tICcuLi8uLi9leHByZXNzaW9uRXhjaGFuZ2UuanMnO1xyXG5pbXBvcnQgRUVTaGFyZWRDb25zdGFudHMgZnJvbSAnLi4vRUVTaGFyZWRDb25zdGFudHMuanMnO1xyXG5pbXBvcnQgQWxsb3dlZFJlcHJlc2VudGF0aW9ucyBmcm9tICcuLi9lbnVtL0FsbG93ZWRSZXByZXNlbnRhdGlvbnMuanMnO1xyXG5pbXBvcnQgQ29pblRlcm1UeXBlSUQgZnJvbSAnLi4vZW51bS9Db2luVGVybVR5cGVJRC5qcyc7XHJcbmltcG9ydCBWaWV3TW9kZSBmcm9tICcuLi9lbnVtL1ZpZXdNb2RlLmpzJztcclxuaW1wb3J0IENvaW5UZXJtRmFjdG9yeSBmcm9tICcuL0NvaW5UZXJtRmFjdG9yeS5qcyc7XHJcbmltcG9ydCBFeHByZXNzaW9uIGZyb20gJy4vRXhwcmVzc2lvbi5qcyc7XHJcbmltcG9ydCBFeHByZXNzaW9uSGludCBmcm9tICcuL0V4cHJlc3Npb25IaW50LmpzJztcclxuXHJcbi8vIGNvbnN0YW50c1xyXG5jb25zdCBCUkVBS19BUEFSVF9TUEFDSU5HID0gMTA7XHJcbmNvbnN0IFJFVFJJRVZFRF9DT0lOX1RFUk1TX1hfU1BBQ0lORyA9IDEwMDtcclxuY29uc3QgUkVUUklFVkVEX0NPSU5fVEVSTVNfWV9TUEFDSU5HID0gNjA7XHJcbmNvbnN0IFJFVFJJRVZFRF9DT0lOX1RFUk1fRklSU1RfUE9TSVRJT04gPSBuZXcgVmVjdG9yMiggMjUwLCA1MCApOyAvLyB1cHBlciBsZWZ0LCBkb2Vzbid0IG92ZXJsYXAgd2l0aCBjb250cm9sIHBhbmVsc1xyXG5jb25zdCBOVU1fUkVUUklFVkVEX0NPSU5fVEVSTV9DT0xVTU5TID0gNjtcclxuY29uc3QgTUlOX1JFVFJJRVZBTF9QTEFDRU1FTlRfRElTVEFOQ0UgPSAzMDsgLy8gZW1waXJpY2FsbHkgZGV0ZXJtaW5lZFxyXG5cclxuY2xhc3MgRXhwcmVzc2lvbk1hbmlwdWxhdGlvbk1vZGVsIHtcclxuXHJcbiAgLyoqXHJcbiAgICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25zXVxyXG4gICAqL1xyXG4gIGNvbnN0cnVjdG9yKCBvcHRpb25zICkge1xyXG5cclxuICAgIG9wdGlvbnMgPSBtZXJnZSgge1xyXG5cclxuICAgICAgLy8gZGVmaW5lcyB3aGV0aGVyIHRvIHByZXNlbnQganVzdCBjb2lucywganVzdCB2YXJpYWJsZXMsIG9yIGJvdGggdG8gdGhlIHVzZXJcclxuICAgICAgYWxsb3dlZFJlcHJlc2VudGF0aW9uczogQWxsb3dlZFJlcHJlc2VudGF0aW9ucy5DT0lOU19BTkRfVkFSSUFCTEVTLFxyXG5cclxuICAgICAgLy8gZmxhZyB0aGF0IGNvbnRyb2xzIGhvdyBjYW5jZWxsYXRpb24gaXMgaGFuZGxlZCBpbiBjYXNlcyB3aGVyZSBjb2luIHRlcm1zIGRvbid0IGNvbXBsZXRlbHkgY2FuY2VsIGVhY2ggb3RoZXIgb3V0XHJcbiAgICAgIHBhcnRpYWxDYW5jZWxsYXRpb25FbmFibGVkOiB0cnVlLFxyXG5cclxuICAgICAgLy8gZmxhZyB0aGF0IGNvbnRyb2xzIHdoZXRoZXIgdGhlICdzaW1wbGlmeSBuZWdhdGl2ZXMnIHNldHRpbmcgaXMgb24gb3Igb2ZmIGJ5IGRlZmF1bHRcclxuICAgICAgc2ltcGxpZnlOZWdhdGl2ZXNEZWZhdWx0OiBmYWxzZVxyXG5cclxuICAgIH0sIG9wdGlvbnMgKTtcclxuXHJcbiAgICBjb25zdCBpbml0aWFsVmlld01vZGUgPSBvcHRpb25zLmFsbG93ZWRSZXByZXNlbnRhdGlvbnMgPT09IEFsbG93ZWRSZXByZXNlbnRhdGlvbnMuVkFSSUFCTEVTX09OTFkgP1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgVmlld01vZGUuVkFSSUFCTEVTIDogVmlld01vZGUuQ09JTlM7XHJcblxyXG4gICAgLy8gQHB1YmxpYyB7UHJvcGVydHkuPFZpZXdNb2RlPn1cclxuICAgIHRoaXMudmlld01vZGVQcm9wZXJ0eSA9IG5ldyBTdHJpbmdQcm9wZXJ0eSggaW5pdGlhbFZpZXdNb2RlICk7XHJcblxyXG4gICAgLy8gQHB1YmxpYyB7UHJvcGVydHkuPGJvb2xlYW4+fVxyXG4gICAgdGhpcy5zaG93Q29pblZhbHVlc1Byb3BlcnR5ID0gbmV3IFByb3BlcnR5KCBmYWxzZSApO1xyXG4gICAgdGhpcy5zaG93VmFyaWFibGVWYWx1ZXNQcm9wZXJ0eSA9IG5ldyBQcm9wZXJ0eSggZmFsc2UgKTtcclxuICAgIHRoaXMuc2hvd0FsbENvZWZmaWNpZW50c1Byb3BlcnR5ID0gbmV3IFByb3BlcnR5KCBmYWxzZSApO1xyXG5cclxuICAgIC8vIEBwdWJsaWMge1Byb3BlcnR5LjxudW1iZXI+fVxyXG4gICAgdGhpcy54VGVybVZhbHVlUHJvcGVydHkgPSBuZXcgUHJvcGVydHkoIDIgKTtcclxuICAgIHRoaXMueVRlcm1WYWx1ZVByb3BlcnR5ID0gbmV3IFByb3BlcnR5KCA1ICk7XHJcbiAgICB0aGlzLnpUZXJtVmFsdWVQcm9wZXJ0eSA9IG5ldyBQcm9wZXJ0eSggMTAgKTtcclxuXHJcbiAgICAvLyBAcHVibGljIChyZWFkLW9ubHkpIHtQcm9wZXJ0eS48bnVtYmVyPn1cclxuICAgIHRoaXMudG90YWxWYWx1ZVByb3BlcnR5ID0gbmV3IFByb3BlcnR5KCAwICk7XHJcblxyXG4gICAgLy8gQHB1YmxpYyAocmVhZC1vbmx5KSB7UHJvcGVydHkuPEV4cHJlc3Npb24+fSAtIG51bGwgd2hlbiBubyBleHByZXNzaW9uIGlzIGJlaW5nIGVkaXRlZFxyXG4gICAgdGhpcy5leHByZXNzaW9uQmVpbmdFZGl0ZWRQcm9wZXJ0eSA9IG5ldyBQcm9wZXJ0eSggbnVsbCApO1xyXG5cclxuICAgIC8vIEBwdWJsaWMge1Byb3BlcnR5Ljxib29sZWFuPn1cclxuICAgIHRoaXMuc2ltcGxpZnlOZWdhdGl2ZXNQcm9wZXJ0eSA9IG5ldyBQcm9wZXJ0eSggb3B0aW9ucy5zaW1wbGlmeU5lZ2F0aXZlc0RlZmF1bHQgKTtcclxuXHJcblxyXG4gICAgLy8gQHB1YmxpYyAocmVhZC1vbmx5KSB7Q29pblRlcm1GYWN0b3J5fSAtIGZhY3RvcnkgdXNlZCB0byBjcmVhdGUgY29pbiB0ZXJtc1xyXG4gICAgdGhpcy5jb2luVGVybUZhY3RvcnkgPSBuZXcgQ29pblRlcm1GYWN0b3J5KCB0aGlzLnhUZXJtVmFsdWVQcm9wZXJ0eSwgdGhpcy55VGVybVZhbHVlUHJvcGVydHksIHRoaXMuelRlcm1WYWx1ZVByb3BlcnR5ICk7XHJcblxyXG4gICAgLy8gQHB1YmxpYyAocmVhZC1vbmx5KSB7QWxsb3dlZFJlcHJlc2VudGF0aW9uc30gLSBvcHRpb25zIHRoYXQgY29udHJvbCB3aGF0IGlzIGF2YWlsYWJsZSB0byB0aGUgdXNlciB0byBtYW5pcHVsYXRlXHJcbiAgICB0aGlzLmFsbG93ZWRSZXByZXNlbnRhdGlvbnMgPSBvcHRpb25zLmFsbG93ZWRSZXByZXNlbnRhdGlvbnM7XHJcblxyXG4gICAgLy8gQHB1YmxpYyAocmVhZC9saXN0ZW4tb25seSkge09ic2VydmFibGVBcnJheURlZi48Q29pblRlcm0+fSAtIGxpc3Qgb2YgYWxsIGNvaW4gdGVybXMgaW4gdGhlIG1vZGVsXHJcbiAgICB0aGlzLmNvaW5UZXJtcyA9IGNyZWF0ZU9ic2VydmFibGVBcnJheSgpO1xyXG5cclxuICAgIC8vIEBwdWJsaWMgKHJlYWQvbGlzdGVuLW9ubHkpIHtPYnNlcnZhYmxlQXJyYXlEZWYuPEV4cHJlc3Npb24+fSAtIGxpc3Qgb2YgZXhwcmVzc2lvbnMgaW4gdGhlIG1vZGVsXHJcbiAgICB0aGlzLmV4cHJlc3Npb25zID0gY3JlYXRlT2JzZXJ2YWJsZUFycmF5KCk7XHJcblxyXG4gICAgLy8gQHB1YmxpYyAocmVhZC9saXN0ZW4tb25seSkge09ic2VydmFibGVBcnJheURlZi48RXhwcmVzc2lvbkhpbnR9IC0gbGlzdCBvZiBleHByZXNzaW9uIGhpbnRzIGluIHRoZSBtb2RlbFxyXG4gICAgdGhpcy5leHByZXNzaW9uSGludHMgPSBjcmVhdGVPYnNlcnZhYmxlQXJyYXkoKTtcclxuXHJcbiAgICAvLyBAcHVibGljIChyZWFkLW9ubHkpIHtCb3VuZHMyfSAtIGNvaW4gdGVybXMgYW5kIGV4cHJlc3Npb24gdGhhdCBlbmQgdXAgb3V0c2lkZSB0aGVzZSBib3VuZHMgYXJlIG1vdmVkIGJhY2sgaW5zaWRlXHJcbiAgICB0aGlzLnJldHJpZXZhbEJvdW5kcyA9IEJvdW5kczIuRVZFUllUSElORztcclxuXHJcbiAgICAvLyBAcHVibGljIChyZWFkLW9ubHkpIHtBcnJheS48RUVDb2xsZWN0aW9uQXJlYT59IC0gYXJlYXMgd2hlcmUgZXhwcmVzc2lvbnMgb3IgY29pbiB0ZXJtcyBjYW4gYmUgY29sbGVjdGVkLCB1c2VkXHJcbiAgICAvLyBvbmx5IGluIGdhbWVcclxuICAgIHRoaXMuY29sbGVjdGlvbkFyZWFzID0gW107XHJcblxyXG4gICAgLypcclxuICAgICAqIEBwcml2YXRlLCB3aXRoIHNvbWUgZWxlbWVudHMgYWNjZXNzaWJsZSB2aWEgbWV0aG9kcyBkZWZpbmUgYmVsb3cgLSBUaGlzIGlzIGEgcG9wdWxhdGVkIGRhdGEgc3RydWN0dXJlIHRoYXRcclxuICAgICAqIGNvbnRhaW5zIGNvdW50cyBmb3IgdGhlIHZhcmlvdXMgcG9zc2libGUgY29tYmluYXRpb25zIG9mIGNvaW4gdGVybSB0eXBlcyBhbmQgbWluaW11bSBkZWNvbXBvc2l0aW9uLiAgRm9yXHJcbiAgICAgKiBpbnN0YW5jZSwgaXQga2VlcHMgdHJhY2sgb2YgdGhlIG51bWJlciBvZiAyWCB2YWx1ZXMgdGhhdCBjYW4ndCBiZSBmdXJ0aGVyIGRlY29tcG9zZWQuXHJcbiAgICAgKiB7Q29pblRlcm1UeXBlSUR9ID0+IHtBcnJheS48eyBjb3VudDoge251bWJlcn0sIGNvdW50UHJvcGVydHk6IHtQcm9wZXJ0eS48bnVtYmVyPnxudWxsfSB9Pn1cclxuICAgICAqXHJcbiAgICAgKiBUaGlzIGlzIHN0cnVjdHVyZWQgYXMgYW4gb2JqZWN0IHdpdGggZWFjaCBvZiB0aGUgcG9zc2libGUgY29pbiB0ZXJtIHR5cGVzIGFzIHRoZSBrZXlzLiAgRWFjaCBvZiB0aGUgdmFsdWVzIGlzXHJcbiAgICAgKiBhbiBhcnJheSB0aGF0IGlzIGluZGV4ZWQgYnkgdGhlIG1pbmltdW0gZGVjb21wb3NpYmlsaXR5LCBidXQgaXMgb2Zmc2V0IHRvIGFjY291bnQgZm9yIHRoZSBmYWN0IHRoYXQgdGhlIHZhbHVlc1xyXG4gICAgICogY2FuIGJlIG5lZ2F0aXZlLCBzdWNoIGFzIGZvciB0aGUgbnVtYmVyIG9mIGluc3RhbmNlcyBvZiAtMnguICBFYWNoIGVsZW1lbnQgb2YgdGhlIGFycmF5IGlzIGFuIG9iamVjdCB0aGF0IGhhc1xyXG4gICAgICogYSBjb3VudCB2YWx1ZSBhbmQgYSBjb3VudCBwcm9wZXJ0eS4gIFRoZSBjb3VudHMgYXJlIHVwZGF0ZWQgYW55IHRpbWUgYSBjb2luIHRlcm0gaXMgYWRkZWQgb3IgcmVtb3ZlZC4gIFRoZSBjb3VudFxyXG4gICAgICogcHJvcGVydGllcyBhcmUgY3JlYXRlZCBsYXppbHkgd2hlbiByZXF1ZXN0ZWQgdmlhIG1ldGhvZHMgZGVmaW5lZCBiZWxvdywgYW5kIGFyZSB1cGRhdGVkIGF0IHRoZSBzYW1lIHRpbWUgYXMgdGhlXHJcbiAgICAgKiBjb3VudHMgaWYgdGhleSBleGlzdC5cclxuICAgICAqL1xyXG4gICAgdGhpcy5jb2luVGVybUNvdW50cyA9IHt9O1xyXG4gICAgY29uc3QgY291bnRPYmplY3RzUGVyQ29pblRlcm1UeXBlID0gRUVTaGFyZWRDb25zdGFudHMuTUFYX05PTl9ERUNPTVBPU0FCTEVfQU1PVU5UICogMiArIDE7XHJcbiAgICBfLmtleXMoIENvaW5UZXJtVHlwZUlEICkuZm9yRWFjaCggY29pblRlcm1UeXBlID0+IHtcclxuICAgICAgdGhpcy5jb2luVGVybUNvdW50c1sgY29pblRlcm1UeXBlIF0gPSBuZXcgQXJyYXkoIGNvdW50T2JqZWN0c1BlckNvaW5UZXJtVHlwZSApO1xyXG4gICAgICBfLnRpbWVzKCBjb3VudE9iamVjdHNQZXJDb2luVGVybVR5cGUsIGluZGV4ID0+IHtcclxuICAgICAgICB0aGlzLmNvaW5UZXJtQ291bnRzWyBjb2luVGVybVR5cGUgXVsgaW5kZXggXSA9IHsgY291bnQ6IDAsIGNvdW50UHJvcGVydHk6IG51bGwgfTtcclxuICAgICAgfSApO1xyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIEBwdWJsaWMge0BCb3VuZHMyfSAtIHNob3VsZCBiZSBzZXQgYnkgdmlldywgZ2VuZXJhbGx5IGp1c3Qgb25jZS4gIFVzZWQgdG8gZGV0ZXJtaW5lIHdoZW4gdG8gcmVtb3ZlIGEgY29pbiB0ZXJtXHJcbiAgICAvLyBiZWNhdXNlIHRoZSB1c2VyIGhhcyBlc3NlbnRpYWxseSBwdXQgaXQgYXdheVxyXG4gICAgdGhpcy5jcmVhdG9yQm94Qm91bmRzID0gQm91bmRzMi5OT1RISU5HO1xyXG5cclxuICAgIC8vIEBwcml2YXRlIHtib29sZWFufSAtIG1ha2UgdGhpcyBvcHRpb24gYXZhaWxhYmxlIHRvIG1ldGhvZHNcclxuICAgIHRoaXMucGFydGlhbENhbmNlbGxhdGlvbkVuYWJsZWQgPSBvcHRpb25zLnBhcnRpYWxDYW5jZWxsYXRpb25FbmFibGVkO1xyXG5cclxuICAgIC8vIGFkZCBhIGxpc3RlbmVyIHRoYXQgcmVzZXRzIHRoZSBjb2luIHRlcm0gdmFsdWVzIHdoZW4gdGhlIHZpZXcgbW9kZSBzd2l0Y2hlcyBmcm9tIHZhcmlhYmxlcyB0byBjb2luc1xyXG4gICAgdGhpcy52aWV3TW9kZVByb3BlcnR5LmxpbmsoICggbmV3Vmlld01vZGUsIG9sZFZpZXdNb2RlICkgPT4ge1xyXG4gICAgICBpZiAoIG5ld1ZpZXdNb2RlID09PSBWaWV3TW9kZS5DT0lOUyAmJiBvbGRWaWV3TW9kZSA9PT0gVmlld01vZGUuVkFSSUFCTEVTICkge1xyXG4gICAgICAgIHRoaXMueFRlcm1WYWx1ZVByb3BlcnR5LnJlc2V0KCk7XHJcbiAgICAgICAgdGhpcy55VGVybVZhbHVlUHJvcGVydHkucmVzZXQoKTtcclxuICAgICAgICB0aGlzLnpUZXJtVmFsdWVQcm9wZXJ0eS5yZXNldCgpO1xyXG4gICAgICB9XHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gYWRkIGEgbGlzdGVuZXIgdGhhdCB1cGRhdGVzIHRoZSB0b3RhbCB3aGVuZXZlciBvbmUgb2YgdGhlIHRlcm0gdmFsdWUgcHJvcGVydGllcyBjaGFuZ2VcclxuICAgIE11bHRpbGluay5tdWx0aWxpbmsoXHJcbiAgICAgIFsgdGhpcy54VGVybVZhbHVlUHJvcGVydHksIHRoaXMueVRlcm1WYWx1ZVByb3BlcnR5LCB0aGlzLnpUZXJtVmFsdWVQcm9wZXJ0eSwgdGhpcy5jb2luVGVybXMubGVuZ3RoUHJvcGVydHkgXSxcclxuICAgICAgKCkgPT4ge1xyXG4gICAgICAgIGxldCB0b3RhbCA9IDA7XHJcbiAgICAgICAgdGhpcy5jb2luVGVybXMuZm9yRWFjaCggY29pblRlcm0gPT4ge1xyXG4gICAgICAgICAgdG90YWwgKz0gY29pblRlcm0udmFsdWVQcm9wZXJ0eS52YWx1ZSAqIGNvaW5UZXJtLnRvdGFsQ291bnRQcm9wZXJ0eS5nZXQoKTtcclxuICAgICAgICB9ICk7XHJcbiAgICAgICAgdGhpcy50b3RhbFZhbHVlUHJvcGVydHkuc2V0KCB0b3RhbCApO1xyXG4gICAgICB9XHJcbiAgICApO1xyXG5cclxuICAgIC8vIGFkZCBhIGxpc3RlbmVyIHRoYXQgaGFuZGxlcyB0aGUgYWRkaXRpb24gb2YgY29pbiB0ZXJtc1xyXG4gICAgdGhpcy5jb2luVGVybXMuYWRkSXRlbUFkZGVkTGlzdGVuZXIoIHRoaXMuY29pblRlcm1BZGRlZExpc3RlbmVyLmJpbmQoIHRoaXMgKSApO1xyXG5cclxuICAgIC8vIGFkZCBhIGxpc3RlbmVyIHRoYXQgaGFuZGxlcyB0aGUgYWRkaXRpb24gb2YgYW4gZXhwcmVzc2lvblxyXG4gICAgdGhpcy5leHByZXNzaW9ucy5hZGRJdGVtQWRkZWRMaXN0ZW5lciggdGhpcy5leHByZXNzaW9uQWRkZWRMaXN0ZW5lci5iaW5kKCB0aGlzICkgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIG1haW4gc3RlcCBmdW5jdGlvbiBmb3IgdGhpcyBtb2RlbCwgc2hvdWxkIG9ubHkgYmUgY2FsbGVkIGJ5IHRoZSBmcmFtZXdvcmtcclxuICAgKiBAcGFyYW0ge251bWJlcn0gZHRcclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgc3RlcCggZHQgKSB7XHJcblxyXG4gICAgbGV0IHVzZXJDb250cm9sbGVkQ29pblRlcm1zO1xyXG4gICAgY29uc3QgY29pblRlcm1zV2l0aEhhbG9zID0gW107XHJcblxyXG4gICAgLy8gc3RlcCBhbGwgdGhlIGNvaW4gdGVybXNcclxuICAgIHRoaXMuY29pblRlcm1zLmZvckVhY2goIGNvaW5UZXJtID0+IHsgY29pblRlcm0uc3RlcCggZHQgKTsgfSApO1xyXG5cclxuICAgIC8vIFVwZGF0ZSB0aGUgc3RhdGUgb2YgdGhlIGhpbnRzIGFuZCBoYWxvcy4gIFRoaXMgaGFzIHRvIGJlIGRvbmUgaW4gdGhlIHN0ZXAgZnVuY3Rpb24gcmF0aGVyIHRoYW4gaW4gdGhlXHJcbiAgICAvLyBldmVudCBsaXN0ZW5lcnMsIHdoZXJlIG11Y2ggb2YgdGhlIG90aGVyIGFjdGlvbiBvY2N1cnMsIGJlY2F1c2UgdGhlIGNvZGUgbmVlZHMgdG8gZmlndXJlIG91dCB3aGljaCBoaW50cyBhbmRcclxuICAgIC8vIGhhbG9zIHNob3VsZCBiZSBhY3RpdmF0ZWQgYW5kIGRlYWN0aXZhdGVkIGJhc2VkIG9uIHRoZSBwb3NpdGlvbnMgb2YgYWxsIGNvaW4gdGVybXMgYW5kIGV4cHJlc3Npb25zLlxyXG4gICAgaWYgKCAhdGhpcy5leHByZXNzaW9uQmVpbmdFZGl0ZWRQcm9wZXJ0eS5nZXQoKSApIHtcclxuXHJcbiAgICAgIC8vIGNsZWFyIHRoZSBob3ZlcmluZyBsaXN0cyBmb3IgYWxsIGV4cHJlc3Npb25zIC0gdGhleSB3aWxsIHRoZW4gYmUgdXBkYXRlZCBiZWxvd1xyXG4gICAgICB0aGlzLmV4cHJlc3Npb25zLmZvckVhY2goIGV4cHJlc3Npb24gPT4ge1xyXG4gICAgICAgIGV4cHJlc3Npb24uY2xlYXJIb3ZlcmluZ0NvaW5UZXJtcygpO1xyXG4gICAgICAgIGV4cHJlc3Npb24uY2xlYXJIb3ZlcmluZ0V4cHJlc3Npb25zKCk7XHJcbiAgICAgIH0gKTtcclxuXHJcbiAgICAgIC8vIGdldCBhIGxpc3Qgb2YgdXNlciBjb250cm9sbGVkIGV4cHJlc3Npb25zLCBtYXggb2Ygb25lIG9uIG1vdXNlIGJhc2VkIHN5c3RlbXMsIGFueSBudW1iZXIgb24gdG91Y2ggZGV2aWNlc1xyXG4gICAgICBjb25zdCB1c2VyQ29udHJvbGxlZEV4cHJlc3Npb25zID0gXy5maWx0ZXIoIHRoaXMuZXhwcmVzc2lvbnMsIGV4cHJlc3Npb24gPT4gZXhwcmVzc2lvbi51c2VyQ29udHJvbGxlZFByb3BlcnR5LmdldCgpICk7XHJcblxyXG4gICAgICBjb25zdCBjb2xsZWN0aW9uQXJlYXNXaG9zZUhhbG9zU2hvdWxkQmVBY3RpdmUgPSBbXTtcclxuXHJcbiAgICAgIC8vIFVwZGF0ZSBoaW50cyBmb3IgZXhwcmVzc2lvbnMgYW5kIGNvbGxlY3Rpb24gYXJlYXMuXHJcbiAgICAgIHVzZXJDb250cm9sbGVkRXhwcmVzc2lvbnMuZm9yRWFjaCggdXNlckNvbnRyb2xsZWRFeHByZXNzaW9uID0+IHtcclxuXHJcbiAgICAgICAgY29uc3QgZXhwcmVzc2lvbklzT3ZlckNyZWF0b3JCb3ggPSB1c2VyQ29udHJvbGxlZEV4cHJlc3Npb24uZ2V0Qm91bmRzKCkuaW50ZXJzZWN0c0JvdW5kcyggdGhpcy5jcmVhdG9yQm94Qm91bmRzICk7XHJcbiAgICAgICAgY29uc3QgbW9zdE92ZXJsYXBwaW5nQ29sbGVjdGlvbkFyZWEgPSB0aGlzLmdldE1vc3RPdmVybGFwcGluZ0NvbGxlY3Rpb25BcmVhRm9yRXhwcmVzc2lvbiggdXNlckNvbnRyb2xsZWRFeHByZXNzaW9uICk7XHJcbiAgICAgICAgY29uc3QgbW9zdE92ZXJsYXBwaW5nRXhwcmVzc2lvbiA9IHRoaXMuZ2V0RXhwcmVzc2lvbk1vc3RPdmVybGFwcGluZ1dpdGhFeHByZXNzaW9uKCB1c2VyQ29udHJvbGxlZEV4cHJlc3Npb24gKTtcclxuICAgICAgICBjb25zdCBtb3N0T3ZlcmxhcHBpbmdDb2luVGVybSA9IHRoaXMuZ2V0RnJlZUNvaW5UZXJtTW9zdE92ZXJsYXBwaW5nV2l0aEV4cHJlc3Npb24oIHVzZXJDb250cm9sbGVkRXhwcmVzc2lvbiApO1xyXG4gICAgICAgIGxldCBleHByZXNzaW9uT3ZlcldoaWNoVGhpc0V4cHJlc3Npb25Jc0hvdmVyaW5nID0gbnVsbDtcclxuICAgICAgICBsZXQgY29pblRlcm1PdmVyV2hpY2hUaGlzRXhwcmVzc2lvbklzSG92ZXJpbmcgPSBudWxsO1xyXG5cclxuICAgICAgICBpZiAoIGV4cHJlc3Npb25Jc092ZXJDcmVhdG9yQm94ICkge1xyXG4gICAgICAgICAgLy8gVGhlIGV4cHJlc3Npb24gaXMgYXQgbGVhc3QgcGFydGlhbGx5IG92ZXIgdGhlIGNyZWF0b3IgYm94LCB3aGljaCB0YWtlcyBwcmVjZWRlbmNlIG92ZXIgZXZlcnl0aGluZyBlbHNlLFxyXG4gICAgICAgICAgLy8gc28gZG9uJ3QgYWN0aXZhdGUgYW55IGhpbnRzIG9yIGhhbG9zLlxyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIGlmICggbW9zdE92ZXJsYXBwaW5nQ29sbGVjdGlvbkFyZWEgKSB7XHJcblxyXG4gICAgICAgICAgLy8gYWN0aXZhdGUgdGhlIGhhbG8gaWYgdGhlIGNvbGxlY3Rpb24gYXJlYSBpcyBlbXB0eVxyXG4gICAgICAgICAgaWYgKCBtb3N0T3ZlcmxhcHBpbmdDb2xsZWN0aW9uQXJlYS5jb2xsZWN0ZWRJdGVtUHJvcGVydHkuZ2V0KCkgPT09IG51bGwgKSB7XHJcbiAgICAgICAgICAgIGNvbGxlY3Rpb25BcmVhc1dob3NlSGFsb3NTaG91bGRCZUFjdGl2ZS5wdXNoKCBtb3N0T3ZlcmxhcHBpbmdDb2xsZWN0aW9uQXJlYSApO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIGlmICggbW9zdE92ZXJsYXBwaW5nRXhwcmVzc2lvbiApIHtcclxuICAgICAgICAgIGV4cHJlc3Npb25PdmVyV2hpY2hUaGlzRXhwcmVzc2lvbklzSG92ZXJpbmcgPSBtb3N0T3ZlcmxhcHBpbmdFeHByZXNzaW9uO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIGlmICggbW9zdE92ZXJsYXBwaW5nQ29pblRlcm0gKSB7XHJcbiAgICAgICAgICBjb2luVGVybU92ZXJXaGljaFRoaXNFeHByZXNzaW9uSXNIb3ZlcmluZyA9IG1vc3RPdmVybGFwcGluZ0NvaW5UZXJtO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gdXBkYXRlIGhvdmVyIGluZm8gZm9yIGVhY2ggb2YgdGhlIG90aGVyIGV4cHJlc3Npb25zIHdpdGggcmVzcGVjdCB0byB0aGlzIG9uZVxyXG4gICAgICAgIHRoaXMuZXhwcmVzc2lvbnMuZm9yRWFjaCggZXhwcmVzc2lvbiA9PiB7XHJcblxyXG4gICAgICAgICAgaWYgKCBleHByZXNzaW9uID09PSB1c2VyQ29udHJvbGxlZEV4cHJlc3Npb24gKSB7XHJcbiAgICAgICAgICAgIC8vIHNraXAgc2VsZlxyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgaWYgKCBleHByZXNzaW9uID09PSBleHByZXNzaW9uT3ZlcldoaWNoVGhpc0V4cHJlc3Npb25Jc0hvdmVyaW5nICkge1xyXG4gICAgICAgICAgICBleHByZXNzaW9uLmFkZEhvdmVyaW5nRXhwcmVzc2lvbiggdXNlckNvbnRyb2xsZWRFeHByZXNzaW9uICk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSApO1xyXG5cclxuICAgICAgICAvLyB1cGRhdGUgb3ZlcmxhcCBpbmZvIHdpdGggcmVzcGVjdCB0byBmcmVlIGNvaW4gdGVybXNcclxuICAgICAgICB1c2VyQ29udHJvbGxlZEV4cHJlc3Npb24uY2xlYXJIb3ZlcmluZ0NvaW5UZXJtcygpO1xyXG4gICAgICAgIGlmICggY29pblRlcm1PdmVyV2hpY2hUaGlzRXhwcmVzc2lvbklzSG92ZXJpbmcgKSB7XHJcblxyXG4gICAgICAgICAgLy8gdGhlcmUgY2FuIG9ubHkgYmUgb25lIG1vc3Qgb3ZlcmxhcHBpbmcgY29pbiB0ZXJtLCBzbyBvdXQgd2l0aCB0aGUgb2xkLCBpbiB3aXRoIHRoZSBuZXdcclxuICAgICAgICAgIHVzZXJDb250cm9sbGVkRXhwcmVzc2lvbi5hZGRIb3ZlcmluZ0NvaW5UZXJtKCBtb3N0T3ZlcmxhcHBpbmdDb2luVGVybSApO1xyXG4gICAgICAgIH1cclxuICAgICAgfSApO1xyXG5cclxuICAgICAgLy8gZ2V0IGEgbGlzdCBvZiBhbGwgdXNlciBjb250cm9sbGVkIGNvaW4gdGVybXMsIG1heCBvZiBvbmUgY29pbiBvbiBtb3VzZS1iYXNlZCBzeXN0ZW1zLCBhbnkgbnVtYmVyIG9uIHRvdWNoIGRldmljZXNcclxuICAgICAgdXNlckNvbnRyb2xsZWRDb2luVGVybXMgPSBfLmZpbHRlciggdGhpcy5jb2luVGVybXMsIGNvaW4gPT4gY29pbi51c2VyQ29udHJvbGxlZFByb3BlcnR5LmdldCgpICk7XHJcblxyXG4gICAgICAvLyBjaGVjayBlYWNoIHVzZXItY29udHJvbGxlZCBjb2luIHRlcm0gdG8gc2VlIGlmIGl0J3MgaW4gYSBwb3NpdGlvbiB0byBjb21iaW5lIHdpdGggYW4gZXhwcmVzc2lvbiBvciBhbm90aGVyXHJcbiAgICAgIC8vIGNvaW4gdGVybVxyXG4gICAgICBjb25zdCBuZWVkZWRFeHByZXNzaW9uSGludHMgPSBbXTtcclxuICAgICAgdXNlckNvbnRyb2xsZWRDb2luVGVybXMuZm9yRWFjaCggdXNlckNvbnRyb2xsZWRDb2luVGVybSA9PiB7XHJcblxyXG4gICAgICAgIGNvbnN0IGNvaW5UZXJtSXNPdmVyQ3JlYXRvckJveCA9IHVzZXJDb250cm9sbGVkQ29pblRlcm0uZ2V0Vmlld0JvdW5kcygpLmludGVyc2VjdHNCb3VuZHMoIHRoaXMuY3JlYXRvckJveEJvdW5kcyApO1xyXG4gICAgICAgIGNvbnN0IG1vc3RPdmVybGFwcGluZ0NvbGxlY3Rpb25BcmVhID0gdGhpcy5nZXRNb3N0T3ZlcmxhcHBpbmdDb2xsZWN0aW9uQXJlYUZvckNvaW5UZXJtKCB1c2VyQ29udHJvbGxlZENvaW5UZXJtICk7XHJcbiAgICAgICAgY29uc3QgbW9zdE92ZXJsYXBwaW5nRXhwcmVzc2lvbiA9IHRoaXMuZ2V0RXhwcmVzc2lvbk1vc3RPdmVybGFwcGluZ1dpdGhDb2luVGVybSggdXNlckNvbnRyb2xsZWRDb2luVGVybSApO1xyXG4gICAgICAgIGNvbnN0IG1vc3RPdmVybGFwcGluZ0xpa2VDb2luVGVybSA9IHRoaXMuZ2V0TW9zdE92ZXJsYXBwaW5nTGlrZUNvaW5UZXJtKCB1c2VyQ29udHJvbGxlZENvaW5UZXJtICk7XHJcbiAgICAgICAgY29uc3Qgam9pbmFibGVGcmVlQ29pblRlcm0gPSB0aGlzLmNoZWNrRm9ySm9pbmFibGVGcmVlQ29pblRlcm0oIHVzZXJDb250cm9sbGVkQ29pblRlcm0gKTtcclxuICAgICAgICBsZXQgZXhwcmVzc2lvbk92ZXJXaGljaENvaW5UZXJtSXNIb3ZlcmluZyA9IG51bGw7XHJcblxyXG4gICAgICAgIGlmICggY29pblRlcm1Jc092ZXJDcmVhdG9yQm94ICkge1xyXG4gICAgICAgICAgLy8gVGhlIGNvaW4gdGVybSBpcyBvdmVyIHRoZSBjcmVhdG9yIGJveCwgd2hpY2ggdGFrZXMgcHJlY2VkZW5jZSBvdmVyIGV2ZXJ5dGhpbmcgZWxzZSwgc28gZG9uJ3QgYWN0aXZhdGUgYW55XHJcbiAgICAgICAgICAvLyBoaW50cyBvciBoYWxvcy5cclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSBpZiAoIG1vc3RPdmVybGFwcGluZ0NvbGxlY3Rpb25BcmVhICkge1xyXG5cclxuICAgICAgICAgIC8vIHRoZSBjb2luIHRlcm0gaXMgb3ZlciBhIGNvbGxlY3Rpb24gYXJlYSwgc28gYWN0aXZhdGUgdGhhdCBjb2xsZWN0aW9uIGFyZWEncyBoaW50IChpZiBpdCBpcyBlbXB0eSlcclxuICAgICAgICAgIGlmICggbW9zdE92ZXJsYXBwaW5nQ29sbGVjdGlvbkFyZWEuY29sbGVjdGVkSXRlbVByb3BlcnR5LmdldCgpID09PSBudWxsICkge1xyXG4gICAgICAgICAgICBjb2xsZWN0aW9uQXJlYXNXaG9zZUhhbG9zU2hvdWxkQmVBY3RpdmUucHVzaCggbW9zdE92ZXJsYXBwaW5nQ29sbGVjdGlvbkFyZWEgKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSBpZiAoIG1vc3RPdmVybGFwcGluZ0V4cHJlc3Npb24gKSB7XHJcblxyXG4gICAgICAgICAgLy8gdGhlIGNvaW4gdGVybSBpcyBvdmVyIGFuIGV4cHJlc3Npb24sIHNvIGFkZCB0aGlzIGNvaW4gdGVybSB0byB0aGUgbGlzdCBvZiB0aG9zZSBob3ZlcmluZ1xyXG4gICAgICAgICAgZXhwcmVzc2lvbk92ZXJXaGljaENvaW5UZXJtSXNIb3ZlcmluZyA9IG1vc3RPdmVybGFwcGluZ0V4cHJlc3Npb247XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgaWYgKCBtb3N0T3ZlcmxhcHBpbmdMaWtlQ29pblRlcm0gKSB7XHJcblxyXG4gICAgICAgICAgLy8gYWN0aXZhdGUgaGFsb3MgZm9yIG92ZXJsYXBwaW5nIGNvaW4gdGVybXNcclxuICAgICAgICAgIGNvaW5UZXJtc1dpdGhIYWxvcy5wdXNoKCB1c2VyQ29udHJvbGxlZENvaW5UZXJtICk7XHJcbiAgICAgICAgICBjb2luVGVybXNXaXRoSGFsb3MucHVzaCggbW9zdE92ZXJsYXBwaW5nTGlrZUNvaW5UZXJtICk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgaWYgKCBqb2luYWJsZUZyZWVDb2luVGVybSApIHtcclxuXHJcbiAgICAgICAgICAvLyB0aGlzIGNvaW4gdGVybSBpcyBwb3NpdGlvbmVkIHN1Y2ggdGhhdCBpdCBjb3VsZCBqb2luIGEgZnJlZSBjb2luIHRlcm0sIHNvIGFkZCBhIGhpbnRcclxuICAgICAgICAgIG5lZWRlZEV4cHJlc3Npb25IaW50cy5wdXNoKCBuZXcgRXhwcmVzc2lvbkhpbnQoIGpvaW5hYmxlRnJlZUNvaW5UZXJtLCB1c2VyQ29udHJvbGxlZENvaW5UZXJtICkgKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIHVwZGF0ZSBob3ZlciBpbmZvIGZvciBlYWNoIGV4cHJlc3Npb24gd2l0aCByZXNwZWN0IHRvIHRoaXMgY29pbiB0ZXJtXHJcbiAgICAgICAgdGhpcy5leHByZXNzaW9ucy5mb3JFYWNoKCBleHByZXNzaW9uID0+IHtcclxuICAgICAgICAgIGlmICggZXhwcmVzc2lvbiA9PT0gZXhwcmVzc2lvbk92ZXJXaGljaENvaW5UZXJtSXNIb3ZlcmluZyApIHtcclxuICAgICAgICAgICAgZXhwcmVzc2lvbi5hZGRIb3ZlcmluZ0NvaW5UZXJtKCB1c2VyQ29udHJvbGxlZENvaW5UZXJtICk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSApO1xyXG4gICAgICB9ICk7XHJcblxyXG4gICAgICAvLyB1cGRhdGUgdGhlIGV4cHJlc3Npb24gaGludHMgZm9yIHNpbmdsZSBjb2lucyB0aGF0IGNvdWxkIGNvbWJpbmUgaW50byBleHByZXNzaW9uc1xyXG4gICAgICBpZiAoIG5lZWRlZEV4cHJlc3Npb25IaW50cy5sZW5ndGggPiAwICkge1xyXG5cclxuICAgICAgICAvLyByZW1vdmUgYW55IGV4cHJlc3Npb24gaGludHMgdGhhdCBhcmUgbm8gbG9uZ2VyIG5lZWRlZFxyXG4gICAgICAgIHRoaXMuZXhwcmVzc2lvbkhpbnRzLmZvckVhY2goIGV4aXN0aW5nRXhwcmVzc2lvbkhpbnQgPT4ge1xyXG4gICAgICAgICAgbGV0IG1hdGNoRm91bmQgPSBmYWxzZTtcclxuICAgICAgICAgIG5lZWRlZEV4cHJlc3Npb25IaW50cy5mb3JFYWNoKCBuZWVkZWRFeHByZXNzaW9uSGludCA9PiB7XHJcbiAgICAgICAgICAgIGlmICggbmVlZGVkRXhwcmVzc2lvbkhpbnQuZXF1YWxzKCBleGlzdGluZ0V4cHJlc3Npb25IaW50ICkgKSB7XHJcbiAgICAgICAgICAgICAgbWF0Y2hGb3VuZCA9IHRydWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH0gKTtcclxuICAgICAgICAgIGlmICggIW1hdGNoRm91bmQgKSB7XHJcbiAgICAgICAgICAgIHRoaXMucmVtb3ZlRXhwcmVzc2lvbkhpbnQoIGV4aXN0aW5nRXhwcmVzc2lvbkhpbnQgKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9ICk7XHJcblxyXG4gICAgICAgIC8vIGFkZCBhbnkgbmVlZGVkIGV4cHJlc3Npb24gaGludHMgdGhhdCBhcmUgbm90IHlldCBvbiB0aGUgbGlzdFxyXG4gICAgICAgIG5lZWRlZEV4cHJlc3Npb25IaW50cy5mb3JFYWNoKCBuZWVkZWRFeHByZXNzaW9uSGludCA9PiB7XHJcbiAgICAgICAgICBsZXQgbWF0Y2hGb3VuZCA9IGZhbHNlO1xyXG4gICAgICAgICAgdGhpcy5leHByZXNzaW9uSGludHMuZm9yRWFjaCggZXhpc3RpbmdFeHByZXNzaW9uSGludCA9PiB7XHJcbiAgICAgICAgICAgIGlmICggZXhpc3RpbmdFeHByZXNzaW9uSGludC5lcXVhbHMoIG5lZWRlZEV4cHJlc3Npb25IaW50ICkgKSB7XHJcbiAgICAgICAgICAgICAgbWF0Y2hGb3VuZCA9IHRydWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH0gKTtcclxuICAgICAgICAgIGlmICggIW1hdGNoRm91bmQgKSB7XHJcbiAgICAgICAgICAgIHRoaXMuZXhwcmVzc2lvbkhpbnRzLmFkZCggbmVlZGVkRXhwcmVzc2lvbkhpbnQgKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9ICk7XHJcbiAgICAgIH1cclxuICAgICAgZWxzZSB7XHJcbiAgICAgICAgdGhpcy5leHByZXNzaW9uSGludHMuZm9yRWFjaCggZXhpc3RpbmdFeHByZXNzaW9uSGludCA9PiB7XHJcbiAgICAgICAgICB0aGlzLnJlbW92ZUV4cHJlc3Npb25IaW50KCBleGlzdGluZ0V4cHJlc3Npb25IaW50ICk7XHJcbiAgICAgICAgfSApO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyB1cGRhdGUgaG92ZXIgaW5mbyBmb3IgZWFjaCBjb2xsZWN0aW9uIGFyZWFcclxuICAgICAgdGhpcy5jb2xsZWN0aW9uQXJlYXMuZm9yRWFjaCggY29sbGVjdGlvbkFyZWEgPT4ge1xyXG4gICAgICAgIGNvbGxlY3Rpb25BcmVhLmhhbG9BY3RpdmVQcm9wZXJ0eS5zZXQoXHJcbiAgICAgICAgICBjb2xsZWN0aW9uQXJlYXNXaG9zZUhhbG9zU2hvdWxkQmVBY3RpdmUuaW5kZXhPZiggY29sbGVjdGlvbkFyZWEgKSA+PSAwXHJcbiAgICAgICAgKTtcclxuICAgICAgfSApO1xyXG5cclxuICAgICAgLy8gc3RlcCB0aGUgZXhwcmVzc2lvbnNcclxuICAgICAgdGhpcy5leHByZXNzaW9ucy5mb3JFYWNoKCBleHByZXNzaW9uID0+IHtcclxuICAgICAgICBleHByZXNzaW9uLnN0ZXAoIGR0ICk7XHJcbiAgICAgIH0gKTtcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICAvLyBUaGUgc3RlcHBpbmcgYmVoYXZpb3IgaXMgc2lnbmlmaWNhbnRseSBkaWZmZXJlbnQgLSBiYXNpY2FsbHkgbXVjaCBzaW1wbGVyIC0gd2hlbiBhbiBleHByZXNzaW9uIGlzIGJlaW5nXHJcbiAgICAgIC8vIGVkaXRlZC4gIFRoZSBpbmRpdmlkdWFsIGV4cHJlc3Npb25zIGFyZSBub3Qgc3RlcHBlZCBhdCBhbGwgdG8gYXZvaWQgYWN0aXZhdGluZyBoYWxvcywgdXBkYXRpbmcgbGF5b3V0cywgYW5kXHJcbiAgICAgIC8vIHNvIGZvcnRoLiAgSW50ZXJhY3Rpb24gYmV0d2VlbiBjb2luIHRlcm1zIGFuZCBleHByZXNzaW9ucyBpcyBub3QgdGVzdGVkLiAgT25seSBvdmVybGFwIGJldHdlZW4gdHdvIGxpa2VcclxuICAgICAgLy8gY29pbnMgaXMgdGVzdGVkIHNvIHRoYXQgdGhlaXIgaGFsb3MgY2FuIGJlIGFjdGl2YXRlZC5cclxuXHJcbiAgICAgIC8vIGdldCBhIGxpc3Qgb2YgYWxsIHVzZXIgY29udHJvbGxlZCBjb2lucywgbWF4IG9mIG9uZSBjb2luIG9uIG1vdXNlLWJhc2VkIHN5c3RlbXMsIGFueSBudW1iZXIgb24gdG91Y2ggZGV2aWNlc1xyXG4gICAgICB1c2VyQ29udHJvbGxlZENvaW5UZXJtcyA9IF8uZmlsdGVyKCB0aGlzLmNvaW5UZXJtcywgY29pblRlcm0gPT4gY29pblRlcm0udXNlckNvbnRyb2xsZWRQcm9wZXJ0eS5nZXQoKSApO1xyXG5cclxuICAgICAgLy8gY2hlY2sgZm9yIG92ZXJsYXAgYmV0d2VlbiBjb2lucyB0aGF0IGNhbiBjb21iaW5lXHJcbiAgICAgIHVzZXJDb250cm9sbGVkQ29pblRlcm1zLmZvckVhY2goIHVzZXJDb250cm9sbGVkQ29pblRlcm0gPT4ge1xyXG5cclxuICAgICAgICBjb25zdCBvdmVybGFwcGluZ0NvaW5UZXJtID0gdGhpcy5nZXRPdmVybGFwcGluZ0xpa2VDb2luVGVybVdpdGhpbkV4cHJlc3Npb24oXHJcbiAgICAgICAgICB1c2VyQ29udHJvbGxlZENvaW5UZXJtLFxyXG4gICAgICAgICAgdGhpcy5leHByZXNzaW9uQmVpbmdFZGl0ZWRQcm9wZXJ0eS5nZXQoKVxyXG4gICAgICAgICk7XHJcblxyXG4gICAgICAgIGlmICggb3ZlcmxhcHBpbmdDb2luVGVybSApIHtcclxuXHJcbiAgICAgICAgICAvLyB0aGVzZSBjb2luIHRlcm1zIGNhbiBiZSBjb21iaW5lZCwgc28gdGhleSBzaG91bGQgaGF2ZSB0aGVpciBoYWxvcyBhY3RpdmF0ZWRcclxuICAgICAgICAgIGNvaW5UZXJtc1dpdGhIYWxvcy5wdXNoKCB1c2VyQ29udHJvbGxlZENvaW5UZXJtICk7XHJcbiAgICAgICAgICBjb2luVGVybXNXaXRoSGFsb3MucHVzaCggb3ZlcmxhcHBpbmdDb2luVGVybSApO1xyXG4gICAgICAgIH1cclxuICAgICAgfSApO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIGdvIHRocm91Z2ggYWxsIGNvaW4gdGVybXMgYW5kIHVwZGF0ZSB0aGUgc3RhdGUgb2YgdGhlaXIgY29tYmluZSBoYWxvc1xyXG4gICAgdGhpcy5jb2luVGVybXMuZm9yRWFjaCggY29pblRlcm0gPT4ge1xyXG4gICAgICBjb2luVGVybS5jb21iaW5lSGFsb0FjdGl2ZVByb3BlcnR5LnNldCggY29pblRlcm1zV2l0aEhhbG9zLmluZGV4T2YoIGNvaW5UZXJtICkgIT09IC0xICk7XHJcbiAgICB9ICk7XHJcbiAgfVxyXG5cclxuICAvLyBAcHVibGljXHJcbiAgYWRkQ29pblRlcm0oIGNvaW5UZXJtICkge1xyXG4gICAgdGhpcy5jb2luVGVybXMuYWRkKCBjb2luVGVybSApO1xyXG4gICAgdGhpcy51cGRhdGVDb2luVGVybUNvdW50cyggY29pblRlcm0udHlwZUlEICk7XHJcbiAgICBwaGV0LmxvZyAmJiBwaGV0LmxvZyggYGFkZGVkICR7Y29pblRlcm0uaWR9LCBjb21wb3NpdGlvbiA9IFske2NvaW5UZXJtLmNvbXBvc2l0aW9ufV1gXHJcbiAgICApO1xyXG4gIH1cclxuXHJcbiAgLy8gQHB1YmxpY1xyXG4gIHJlbW92ZUNvaW5UZXJtKCBjb2luVGVybSwgYW5pbWF0ZSApIHtcclxuXHJcbiAgICAvLyByZW1vdmUgdGhlIGNvaW4gdGVybSBmcm9tIGFueSBleHByZXNzaW9uc1xyXG4gICAgdGhpcy5leHByZXNzaW9ucy5mb3JFYWNoKCBleHByZXNzaW9uID0+IHtcclxuICAgICAgaWYgKCBleHByZXNzaW9uLmNvbnRhaW5zQ29pblRlcm0oIGNvaW5UZXJtICkgKSB7XHJcbiAgICAgICAgZXhwcmVzc2lvbi5yZW1vdmVDb2luVGVybSggY29pblRlcm0gKTtcclxuICAgICAgfVxyXG4gICAgfSApO1xyXG5cclxuICAgIGlmICggYW5pbWF0ZSApIHtcclxuICAgICAgLy8gc2VuZCB0aGUgY29pbiB0ZXJtIGJhY2sgdG8gaXRzIG9yaWdpbiAtIHRoZSBmaW5hbCBzdGVwcyBvZiBpdHMgcmVtb3ZhbCB3aWxsIHRha2UgcGxhY2Ugd2hlbiBpdCBnZXRzIHRoZXJlXHJcbiAgICAgIGNvaW5UZXJtLnJldHVyblRvT3JpZ2luKCk7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgcGhldC5sb2cgJiYgcGhldC5sb2coIGByZW1vdmVkICR7Y29pblRlcm0uaWR9YCApO1xyXG4gICAgICB0aGlzLmNvaW5UZXJtcy5yZW1vdmUoIGNvaW5UZXJtICk7XHJcbiAgICAgIHRoaXMudXBkYXRlQ29pblRlcm1Db3VudHMoIGNvaW5UZXJtLnR5cGVJRCApO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogZ2V0IGEgcHJvcGVydHkgdGhhdCByZXByZXNlbnRzIHRoZSBjb3VudCBpbiB0aGUgbW9kZWwgb2YgY29pbiB0ZXJtcyBvZiB0aGUgZ2l2ZW4gdHlwZSBhbmQgbWluIGRlY29tcG9zaXRpb25cclxuICAgKiBAcGFyYW0ge0NvaW5UZXJtVHlwZUlEfSBjb2luVGVybVR5cGVJRFxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBtaW5pbXVtRGVjb21wb3NpdGlvbiAtIG1pbml1bXVtIGFtb3VudCBpbnRvIHdoaWNoIHRoZSBjb2luIHRlcm0gY2FuIGJlIGRlY29tcG9zZWRcclxuICAgKiBAcGFyYW0ge2Jvb2xlYW59IGNyZWF0ZUlmVW5kZWZpbmVkXHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIGdldENvaW5UZXJtQ291bnRQcm9wZXJ0eSggY29pblRlcm1UeXBlSUQsIG1pbmltdW1EZWNvbXBvc2l0aW9uLCBjcmVhdGVJZlVuZGVmaW5lZCApIHtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHRoaXMuY29pblRlcm1Db3VudHMuaGFzT3duUHJvcGVydHkoIGNvaW5UZXJtVHlwZUlEICksICd1bnJlY29nbml6ZWQgY29pbiB0ZXJtIHR5cGUgSUQnICk7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBtaW5pbXVtRGVjb21wb3NpdGlvbiAhPT0gMCwgJ21pbmltdW1EZWNvbXBvc2l0aW9uIGNhbm5vdCBiZSAwJyApO1xyXG5cclxuICAgIC8vIENhbGN1bGF0ZSB0aGUgY29ycmVzcG9uZGluZyBpbmRleCBpbnRvIHRoZSBkYXRhIHN0cnVjdHVyZSAtIHRoaXMgaXMgbmVjZXNzYXJ5IGluIG9yZGVyIHRvIHN1cHBvcnQgbmVnYXRpdmVcclxuICAgIC8vIG1pbmltdW0gZGVjb21wb3NpdGlvbiB2YWx1ZXMsIGUuZy4gLTNYLlxyXG4gICAgY29uc3QgY291bnRQcm9wZXJ0eUluZGV4ID0gbWluaW11bURlY29tcG9zaXRpb24gKyBFRVNoYXJlZENvbnN0YW50cy5NQVhfTk9OX0RFQ09NUE9TQUJMRV9BTU9VTlQ7XHJcblxyXG4gICAgLy8gZ2V0IHRoZSBwcm9wZXJ0eSBvciwgaWYgc3BlY2lmaWVkLCBjcmVhdGUgaXRcclxuICAgIGxldCBjb2luVGVybUNvdW50UHJvcGVydHkgPSB0aGlzLmNvaW5UZXJtQ291bnRzWyBjb2luVGVybVR5cGVJRCBdWyBjb3VudFByb3BlcnR5SW5kZXggXS5jb3VudFByb3BlcnR5O1xyXG4gICAgaWYgKCBjb2luVGVybUNvdW50UHJvcGVydHkgPT09IG51bGwgJiYgY3JlYXRlSWZVbmRlZmluZWQgKSB7XHJcblxyXG4gICAgICAvLyB0aGUgcmVxdWVzdGVkIGNvdW50IHByb3BlcnR5IGRvZXMgbm90IHlldCBleGlzdCAtIGNyZWF0ZSBhbmQgYWRkIGl0XHJcbiAgICAgIGNvaW5UZXJtQ291bnRQcm9wZXJ0eSA9IG5ldyBQcm9wZXJ0eSggMCApO1xyXG4gICAgICBjb2luVGVybUNvdW50UHJvcGVydHkuc2V0KCB0aGlzLmNvaW5UZXJtQ291bnRzWyBjb2luVGVybVR5cGVJRCBdWyBjb3VudFByb3BlcnR5SW5kZXggXS5jb3VudCApO1xyXG4gICAgICB0aGlzLmNvaW5UZXJtQ291bnRzWyBjb2luVGVybVR5cGVJRCBdWyBjb3VudFByb3BlcnR5SW5kZXggXS5jb3VudFByb3BlcnR5ID0gY29pblRlcm1Db3VudFByb3BlcnR5O1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBjb2luVGVybUNvdW50UHJvcGVydHk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBzdG9wIGVkaXRpbmcgdGhlIGV4cHJlc3Npb24gdGhhdCBpcyBjdXJyZW50bHkgc2VsZWN0ZWQgZm9yIGVkaXQsIGRvZXMgbm90aGluZyBpZiBubyBleHByZXNzaW9uIHNlbGVjdGVkXHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIHN0b3BFZGl0aW5nRXhwcmVzc2lvbigpIHtcclxuXHJcbiAgICBjb25zdCBleHByZXNzaW9uQmVpbmdFZGl0ZWQgPSB0aGlzLmV4cHJlc3Npb25CZWluZ0VkaXRlZFByb3BlcnR5LmdldCgpO1xyXG4gICAgZXhwcmVzc2lvbkJlaW5nRWRpdGVkLmluRWRpdE1vZGVQcm9wZXJ0eS5zZXQoIGZhbHNlICk7XHJcblxyXG4gICAgLy8gSGFuZGxlIHRoZSBzcGVjaWFsIGNhc2VzIHdoZXJlIG9uZSBvciB6ZXJvIGNvaW4gdGVybXMgcmVtYWluIGFmdGVyIGNvbWJpbmluZyB0ZXJtcywgd2hpY2ggaXMgbm8gbG9uZ2VyXHJcbiAgICAvLyBjb25zaWRlcmVkIGFuIGV4cHJlc3Npb24uXHJcbiAgICBpZiAoIGV4cHJlc3Npb25CZWluZ0VkaXRlZC5jb2luVGVybXMubGVuZ3RoIDw9IDEgKSB7XHJcbiAgICAgIGV4cHJlc3Npb25CZWluZ0VkaXRlZC5icmVha0FwYXJ0KCk7XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy5leHByZXNzaW9uQmVpbmdFZGl0ZWRQcm9wZXJ0eS5zZXQoIG51bGwgKTtcclxuICB9XHJcblxyXG4gIC8vIEBwcml2YXRlIC0gdXBkYXRlIHRoZSBjb3VudCBwcm9wZXJ0aWVzIGZvciB0aGUgc3BlY2lmaWVkIGNvaW4gdGVybSB0eXBlXHJcbiAgdXBkYXRlQ29pblRlcm1Db3VudHMoIGNvaW5UZXJtVHlwZUlEICkge1xyXG5cclxuICAgIC8vIHplcm8gdGhlIG5vbi1wcm9wZXJ0eSB2ZXJzaW9uIG9mIHRoZSBjb3VudHNcclxuICAgIHRoaXMuY29pblRlcm1Db3VudHNbIGNvaW5UZXJtVHlwZUlEIF0uZm9yRWFjaCggY291bnRPYmplY3QgPT4ge1xyXG4gICAgICBjb3VudE9iamVjdC5jb3VudCA9IDA7XHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gbG9vcCB0aHJvdWdoIHRoZSBjdXJyZW50IHNldCBvZiBjb2luIHRlcm1zIGFuZCB1cGRhdGUgY291bnRzIGZvciB0aGUgc3BlY2lmaWVkIGNvaW4gdGVybSB0eXBlXHJcbiAgICB0aGlzLmNvaW5UZXJtcy5mb3JFYWNoKCBjb2luVGVybSA9PiB7XHJcbiAgICAgIGlmICggY29pblRlcm0udHlwZUlEID09PSBjb2luVGVybVR5cGVJRCApIHtcclxuICAgICAgICBjb2luVGVybS5jb21wb3NpdGlvbi5mb3JFYWNoKCBtaW5EZWNvbXBvc2l0aW9uID0+IHtcclxuICAgICAgICAgIHRoaXMuY29pblRlcm1Db3VudHNbIGNvaW5UZXJtVHlwZUlEIF1bIG1pbkRlY29tcG9zaXRpb24gKyBFRVNoYXJlZENvbnN0YW50cy5NQVhfTk9OX0RFQ09NUE9TQUJMRV9BTU9VTlQgXS5jb3VudCsrO1xyXG4gICAgICAgIH0gKTtcclxuICAgICAgfVxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIHVwZGF0ZSBhbnkgY291bnQgcHJvcGVydGllcyB0aGF0IGV4aXN0XHJcbiAgICB0aGlzLmNvaW5UZXJtQ291bnRzWyBjb2luVGVybVR5cGVJRCBdLmZvckVhY2goIGNvdW50T2JqZWN0ID0+IHtcclxuICAgICAgaWYgKCBjb3VudE9iamVjdC5jb3VudFByb3BlcnR5ICkge1xyXG4gICAgICAgIGNvdW50T2JqZWN0LmNvdW50UHJvcGVydHkuc2V0KCBjb3VudE9iamVjdC5jb3VudCApO1xyXG4gICAgICB9XHJcbiAgICB9ICk7XHJcbiAgfVxyXG5cclxuICAvLyBAcHVibGljIC0gcmVtb3ZlIHRoZSBzcGVjaWZpZWQgZXhwcmVzc2lvblxyXG4gIHJlbW92ZUV4cHJlc3Npb24oIGV4cHJlc3Npb24gKSB7XHJcbiAgICBjb25zdCBjb2luVGVybXNUb1JlbW92ZSA9IGV4cHJlc3Npb24ucmVtb3ZlQWxsQ29pblRlcm1zKCk7XHJcbiAgICBjb2luVGVybXNUb1JlbW92ZS5mb3JFYWNoKCBjb2luVGVybSA9PiB7XHJcbiAgICAgIHRoaXMucmVtb3ZlQ29pblRlcm0oIGNvaW5UZXJtLCB0cnVlICk7XHJcbiAgICB9ICk7XHJcbiAgICB0aGlzLmV4cHJlc3Npb25zLnJlbW92ZSggZXhwcmVzc2lvbiApO1xyXG4gICAgcGhldC5sb2cgJiYgcGhldC5sb2coIGByZW1vdmVkICR7ZXhwcmVzc2lvbi5pZH1gICk7XHJcbiAgfVxyXG5cclxuICAvLyBAcHJpdmF0ZSwgcmVtb3ZlIGFuIGV4cHJlc3Npb24gaGludFxyXG4gIHJlbW92ZUV4cHJlc3Npb25IaW50KCBleHByZXNzaW9uSGludCApIHtcclxuICAgIGV4cHJlc3Npb25IaW50LmNsZWFyKCk7XHJcbiAgICB0aGlzLmV4cHJlc3Npb25IaW50cy5yZW1vdmUoIGV4cHJlc3Npb25IaW50ICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBnZXQgdGhlIGV4cHJlc3Npb24gdGhhdCBvdmVybGFwcyB0aGUgbW9zdCB3aXRoIHRoZSBwcm92aWRlZCBjb2luIHRlcm0sIG51bGwgaWYgbm8gb3ZlcmxhcCBleGlzdHMsIHVzZXIgY29udHJvbGxlZFxyXG4gICAqIGV4cHJlc3Npb25zIGFyZSBleGNsdWRlZFxyXG4gICAqIEBwYXJhbSB7Q29pblRlcm19IGNvaW5UZXJtXHJcbiAgICogQHByaXZhdGVcclxuICAgKi9cclxuICBnZXRFeHByZXNzaW9uTW9zdE92ZXJsYXBwaW5nV2l0aENvaW5UZXJtKCBjb2luVGVybSApIHtcclxuICAgIGxldCBtYXhPdmVybGFwID0gMDtcclxuICAgIGxldCBtb3N0T3ZlcmxhcHBpbmdFeHByZXNzaW9uID0gbnVsbDtcclxuXHJcbiAgICAvLyBjaGVjayBlYWNoIGV4cHJlc3Npb24gYWdhaW5zdCB0aGUgY29pbiB0ZXJtIHRvIHNlZSB3aGljaCBoYXMgbWF4IG92ZXJsYXBcclxuICAgIHRoaXMuZXhwcmVzc2lvbnMuZm9yRWFjaCggZXhwcmVzc2lvbiA9PiB7XHJcblxyXG4gICAgICBpZiAoICFleHByZXNzaW9uLnVzZXJDb250cm9sbGVkUHJvcGVydHkuZ2V0KCkgJiYgLy8gZXhjbHVkZSBleHByZXNzaW9ucyB0aGF0IGFyZSBiZWluZyBtb3ZlZCBieSBhIHVzZXJcclxuICAgICAgICAgICAhZXhwcmVzc2lvbi5pblByb2dyZXNzQW5pbWF0aW9uUHJvcGVydHkuZ2V0KCkgJiYgLy8gZXhjbHVkZSBleHByZXNzaW9ucyB0aGF0IGFyZSBhbmltYXRpbmcgdG8gYSBkZXN0aW5hdGlvblxyXG4gICAgICAgICAgICFleHByZXNzaW9uLmNvbGxlY3RlZFByb3BlcnR5LmdldCgpICYmIC8vIGV4Y2x1ZGUgZXhwcmVzc2lvbiB0aGF0IGFyZSBpbiBhIGNvbGxlY3Rpb24gYXJlYVxyXG4gICAgICAgICAgIGV4cHJlc3Npb24uZ2V0Q29pblRlcm1Kb2luWm9uZU92ZXJsYXAoIGNvaW5UZXJtICkgPiBtYXhPdmVybGFwICkge1xyXG5cclxuICAgICAgICBtb3N0T3ZlcmxhcHBpbmdFeHByZXNzaW9uID0gZXhwcmVzc2lvbjtcclxuICAgICAgICBtYXhPdmVybGFwID0gZXhwcmVzc2lvbi5nZXRDb2luVGVybUpvaW5ab25lT3ZlcmxhcCggY29pblRlcm0gKTtcclxuICAgICAgfVxyXG4gICAgfSApO1xyXG4gICAgcmV0dXJuIG1vc3RPdmVybGFwcGluZ0V4cHJlc3Npb247XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBnZXQgdGhlIGZyZWUgY29pbiB0ZXJtIChpLmUuIG9uZSB0aGF0IGlzIG5vdCBpbiBhbiBleHByZXNzaW9uKSB0aGF0IG92ZXJsYXBzIHRoZSBtb3N0IHdpdGggdGhlIHByb3ZpZGVkXHJcbiAgICogZXhwcmVzc2lvbiwgbnVsbCBpZiBubyBvdmVybGFwcGluZyBjb2luIHRlcm1zIGV4aXN0XHJcbiAgICogQHBhcmFtIHtFeHByZXNzaW9ufSBleHByZXNzaW9uXHJcbiAgICogQHJldHVybnMge0NvaW5UZXJtfVxyXG4gICAqIEBwcml2YXRlXHJcbiAgICovXHJcbiAgZ2V0RnJlZUNvaW5UZXJtTW9zdE92ZXJsYXBwaW5nV2l0aEV4cHJlc3Npb24oIGV4cHJlc3Npb24gKSB7XHJcbiAgICBsZXQgbWF4T3ZlcmxhcCA9IDA7XHJcbiAgICBsZXQgbW9zdE92ZXJsYXBwaW5nRnJlZUNvaW5UZXJtID0gbnVsbDtcclxuXHJcbiAgICB0aGlzLmNvaW5UZXJtcy5mb3JFYWNoKCBjb2luVGVybSA9PiB7XHJcblxyXG4gICAgICAvLyBtYWtlIHN1cmUgdGhlIGNvaW4gdGVybSBpcyBlbGlnaWJsZSBhbmQgdGhlbiBjb21wYXJlIHRoZSBhbW91bnQgb2Ygb3ZlcmxhcCB0byB3aGF0IHdhcyBwcmV2aW91c2x5IHNlZW5cclxuICAgICAgaWYgKCAhY29pblRlcm0udXNlckNvbnRyb2xsZWRQcm9wZXJ0eS5nZXQoKSAmJiAvLyBleGNsdWRlIHVzZXIgY29udHJvbGxlZCBjb2luIHRlcm1zXHJcbiAgICAgICAgICAgY29pblRlcm0uZXhwcmVzc2lvblByb3BlcnR5LmdldCgpID09PSBudWxsICYmIC8vIGV4Y2x1ZGUgY29pbiB0ZXJtcyBhbHJlYWR5IGluIG9yIGJvdW5kIGZvciBhbiBleHByZXNzaW9uXHJcbiAgICAgICAgICAgIWNvaW5UZXJtLmNvbGxlY3RlZFByb3BlcnR5LmdldCgpICYmIC8vIGV4Y2x1ZGUgY29pbiB0ZXJtcyBpbiBhIGNvbGxlY3Rpb25cclxuICAgICAgICAgICAhY29pblRlcm0uaXNGYWRpbmdPdXQoKSAmJiAvLyBleGNsdWRlIGZhZGluZyBjb2luIHRlcm1zXHJcbiAgICAgICAgICAgZXhwcmVzc2lvbi5nZXRDb2luVGVybUpvaW5ab25lT3ZlcmxhcCggY29pblRlcm0gKSA+IG1heE92ZXJsYXAgKSB7XHJcbiAgICAgICAgbWF4T3ZlcmxhcCA9IGV4cHJlc3Npb24uZ2V0Q29pblRlcm1Kb2luWm9uZU92ZXJsYXAoIGNvaW5UZXJtICk7XHJcbiAgICAgICAgbW9zdE92ZXJsYXBwaW5nRnJlZUNvaW5UZXJtID0gY29pblRlcm07XHJcbiAgICAgIH1cclxuICAgIH0gKTtcclxuICAgIHJldHVybiBtb3N0T3ZlcmxhcHBpbmdGcmVlQ29pblRlcm07XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBnZXQgdGhlIGV4cHJlc3Npb24gdGhhdCBvdmVybGFwcyB0aGUgbW9zdCB3aXRoIHRoZSBwcm92aWRlZCBleHByZXNzaW9uLCBudWxsIGlmIG5vIG92ZXJsYXAgZXhpc3RzLCB1c2VyXHJcbiAgICogY29udHJvbGxlZCBleHByZXNzaW9ucyBhcmUgZXhjbHVkZWRcclxuICAgKiBAcGFyYW0ge0V4cHJlc3Npb259IHRoaXNFeHByZXNzaW9uXHJcbiAgICogQHByaXZhdGVcclxuICAgKi9cclxuICBnZXRFeHByZXNzaW9uTW9zdE92ZXJsYXBwaW5nV2l0aEV4cHJlc3Npb24oIHRoaXNFeHByZXNzaW9uICkge1xyXG4gICAgbGV0IG1heE92ZXJsYXAgPSAwO1xyXG4gICAgbGV0IG1vc3RPdmVybGFwcGluZ0V4cHJlc3Npb24gPSBudWxsO1xyXG5cclxuICAgIC8vIHRlc3QgZWFjaCBvdGhlciBleHByZXNzaW9uIGZvciBlbGlnaWJpbGl0eSBhbmQgb3ZlcmxhcFxyXG4gICAgdGhpcy5leHByZXNzaW9ucy5mb3JFYWNoKCB0aGF0RXhwcmVzc2lvbiA9PiB7XHJcblxyXG4gICAgICAvLyBtYWtlIHN1cmUgdGhlIGV4cHJlc3Npb24gaXMgZWxpZ2libGUgZm9yIGNvbnNpZGVyYXRpb24sIHRoZW4gZGV0ZXJtaW5lIGlmIGl0IGlzIHRoZSBtb3N0IG92ZXJsYXBwaW5nXHJcbiAgICAgIGlmICggdGhhdEV4cHJlc3Npb24gIT09IHRoaXNFeHByZXNzaW9uICYmICF0aGF0RXhwcmVzc2lvbi51c2VyQ29udHJvbGxlZFByb3BlcnR5LmdldCgpICYmIC8vIGV4Y2x1ZGUgZXhwcmVzc2lvbnMgdGhhdCBhcmUgYmVpbmcgbW92ZWQgYnkgYSB1c2VyXHJcbiAgICAgICAgICAgIXRoYXRFeHByZXNzaW9uLmluUHJvZ3Jlc3NBbmltYXRpb25Qcm9wZXJ0eS5nZXQoKSAmJiAvLyBleGNsdWRlIGV4cHJlc3Npb25zIHRoYXQgYXJlIG1vdmluZyBzb21ld2hlcmVcclxuICAgICAgICAgICAhdGhhdEV4cHJlc3Npb24uY29sbGVjdGVkUHJvcGVydHkuZ2V0KCkgJiYgLy8gZXhjbHVkZSBleHByZXNzaW9ucyB0aGF0IGFyZSBpbiBhIGNvbGxlY3Rpb24gYXJlYVxyXG4gICAgICAgICAgIHRoaXNFeHByZXNzaW9uLmdldE92ZXJsYXAoIHRoYXRFeHByZXNzaW9uICkgPiBtYXhPdmVybGFwICkge1xyXG4gICAgICAgIG1vc3RPdmVybGFwcGluZ0V4cHJlc3Npb24gPSB0aGF0RXhwcmVzc2lvbjtcclxuICAgICAgICBtYXhPdmVybGFwID0gdGhpc0V4cHJlc3Npb24uZ2V0T3ZlcmxhcCggdGhhdEV4cHJlc3Npb24gKTtcclxuICAgICAgfVxyXG4gICAgfSApO1xyXG4gICAgcmV0dXJuIG1vc3RPdmVybGFwcGluZ0V4cHJlc3Npb247XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBHZXQgdGhlIG5leHQgcG9zaXRpb24gd2hlcmUgYSByZXRyaWV2ZWQgY29pbiB0ZXJtIChpLmUuIG9uZSB0aGF0IGVuZGVkIHVwIG91dCBvZiBib3VuZHMpIGNhbiBiZSBwbGFjZWQuXHJcbiAgICogQHJldHVybnMge1ZlY3RvcjJ9XHJcbiAgICogQHByaXZhdGVcclxuICAgKi9cclxuICBnZXROZXh0T3BlblJldHJpZXZhbFNwb3QoKSB7XHJcbiAgICBjb25zdCBwb3NpdGlvbiA9IG5ldyBWZWN0b3IyKCAwLCAwICk7XHJcbiAgICBsZXQgcm93ID0gMDtcclxuICAgIGxldCBjb2x1bW4gPSAwO1xyXG4gICAgbGV0IG9wZW5Qb3NpdGlvbkZvdW5kID0gZmFsc2U7XHJcbiAgICB3aGlsZSAoICFvcGVuUG9zaXRpb25Gb3VuZCApIHtcclxuICAgICAgcG9zaXRpb24ueCA9IFJFVFJJRVZFRF9DT0lOX1RFUk1fRklSU1RfUE9TSVRJT04ueCArIGNvbHVtbiAqIFJFVFJJRVZFRF9DT0lOX1RFUk1TX1hfU1BBQ0lORztcclxuICAgICAgcG9zaXRpb24ueSA9IFJFVFJJRVZFRF9DT0lOX1RFUk1fRklSU1RfUE9TSVRJT04ueSArIHJvdyAqIFJFVFJJRVZFRF9DT0lOX1RFUk1TX1lfU1BBQ0lORztcclxuICAgICAgbGV0IGNsb3NlQ29pblRlcm0gPSBmYWxzZTtcclxuICAgICAgZm9yICggbGV0IGkgPSAwOyBpIDwgdGhpcy5jb2luVGVybXMubGVuZ3RoOyBpKysgKSB7XHJcbiAgICAgICAgaWYgKCB0aGlzLmNvaW5UZXJtcy5nZXQoIGkgKS5kZXN0aW5hdGlvblByb3BlcnR5LmdldCgpLmRpc3RhbmNlKCBwb3NpdGlvbiApIDwgTUlOX1JFVFJJRVZBTF9QTEFDRU1FTlRfRElTVEFOQ0UgKSB7XHJcbiAgICAgICAgICBjbG9zZUNvaW5UZXJtID0gdHJ1ZTtcclxuICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgICBpZiAoIGNsb3NlQ29pblRlcm0gKSB7XHJcbiAgICAgICAgLy8gbW92ZSB0byBuZXh0IHBvc2l0aW9uXHJcbiAgICAgICAgY29sdW1uKys7XHJcbiAgICAgICAgaWYgKCBjb2x1bW4gPj0gTlVNX1JFVFJJRVZFRF9DT0lOX1RFUk1fQ09MVU1OUyApIHtcclxuICAgICAgICAgIHJvdysrO1xyXG4gICAgICAgICAgY29sdW1uID0gMDtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgICAgZWxzZSB7XHJcbiAgICAgICAgb3BlblBvc2l0aW9uRm91bmQgPSB0cnVlO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICByZXR1cm4gcG9zaXRpb247XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBmaW5kIGEgcG9zaXRpb24gd2hlcmUgdGhlIHByb3ZpZGVkIGV4cHJlc3Npb24gd29uJ3Qgb3ZlcmxhcCB3aXRoIG90aGVycyAtIHRoaXMgaXMgb25seSBhcHByb3hpbWF0ZSwgYW5kIGRvZXNuJ3RcclxuICAgKiB3b3JrIHBlcmZlY3RseSBpbiBzaXR1YXRpb25zIHdoZXJlIHRoZXJlIGFyZSBsb3RzIG9mIGV4cHJlc3Npb25zIGluIHRoZSBwbGF5IGFyZWFcclxuICAgKiBAcmV0dXJucyB7VmVjdG9yMn1cclxuICAgKiBAcHJpdmF0ZVxyXG4gICAqL1xyXG4gIGdldE9wZW5FeHByZXNzaW9uUGxhY2VtZW50UG9zaXRpb24oIGV4cHJlc3Npb24gKSB7XHJcblxyXG4gICAgLy8gdmFyaWFibGVzIHRoYXQgY29udHJvbHMgdGhlIHNlYXJjaCBncmlkLCBlbXBpcmljYWxseSBkZXRlcm1pbmVkXHJcbiAgICBjb25zdCBtaW5YID0gMTcwO1xyXG4gICAgY29uc3QgbWluWSA9IDMwO1xyXG4gICAgbGV0IHhQb3MgPSBtaW5YO1xyXG4gICAgbGV0IHlQb3MgPSBtaW5ZO1xyXG4gICAgY29uc3QgeEluY3JlbWVudCA9IDMwO1xyXG4gICAgY29uc3QgeUluY3JlbWVudCA9IDMwO1xyXG5cclxuICAgIC8vIHZhcmlhYmxlcyB1c2VkIGluIHRoZSBsb29wIHRvIHRlc3QgaWYgYSBwb3NpdGlvbiBpcyBhdmFpbGFibGVcclxuICAgIGNvbnN0IHBvc2l0aW9uID0gbmV3IFZlY3RvcjIoIHhQb3MsIG1pblkgKTtcclxuICAgIGxldCBvcGVuUG9zaXRpb25Gb3VuZCA9IGZhbHNlO1xyXG4gICAgY29uc3QgcHJvcG9zZWRCb3VuZHMgPSBuZXcgQm91bmRzMiggMCwgMCwgMCwgMCApO1xyXG5cclxuICAgIC8vIGxvb3AsIHNlYXJjaGluZyBmb3Igb3BlbiBwb3NpdGlvbnNcclxuICAgIHdoaWxlICggdGhpcy5yZXRyaWV2YWxCb3VuZHMuY29udGFpbnNQb2ludCggcG9zaXRpb24gKSAmJiAhb3BlblBvc2l0aW9uRm91bmQgKSB7XHJcblxyXG4gICAgICAvLyBjYWxjdWxhdGUgdGhlIGJvdW5kcyBmb3IgdGhlIGV4cHJlc3Npb24gYXQgdGhpcyBwb3NpdGlvblxyXG4gICAgICBwcm9wb3NlZEJvdW5kcy5zZXRNaW5NYXgoXHJcbiAgICAgICAgeFBvcyxcclxuICAgICAgICB5UG9zLFxyXG4gICAgICAgIHhQb3MgKyBleHByZXNzaW9uLndpZHRoUHJvcGVydHkuZ2V0KCksXHJcbiAgICAgICAgeVBvcyArIGV4cHJlc3Npb24uaGVpZ2h0UHJvcGVydHkuZ2V0KClcclxuICAgICAgKTtcclxuXHJcbiAgICAgIGxldCBvdmVybGFwRm91bmQgPSBmYWxzZTtcclxuICAgICAgZm9yICggbGV0IGkgPSAwOyBpIDwgdGhpcy5leHByZXNzaW9ucy5sZW5ndGggJiYgIW92ZXJsYXBGb3VuZDsgaSsrICkge1xyXG4gICAgICAgIGlmICggdGhpcy5leHByZXNzaW9ucy5nZXQoIGkgKS5nZXRCb3VuZHMoKS5pbnRlcnNlY3RzQm91bmRzKCBwcm9wb3NlZEJvdW5kcyApICkge1xyXG4gICAgICAgICAgb3ZlcmxhcEZvdW5kID0gdHJ1ZTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGlmICggIW92ZXJsYXBGb3VuZCApIHtcclxuXHJcbiAgICAgICAgLy8gdGhpcyBwb3NpdGlvbiB3b3Jrc1xyXG4gICAgICAgIG9wZW5Qb3NpdGlvbkZvdW5kID0gdHJ1ZTtcclxuICAgICAgfVxyXG4gICAgICBlbHNlIHtcclxuXHJcbiAgICAgICAgLy8gbW92ZSB0byB0aGUgbmV4dCBncmlkIHBvc2l0aW9uXHJcbiAgICAgICAgeVBvcyArPSB5SW5jcmVtZW50O1xyXG4gICAgICAgIGlmICggeVBvcyA+IHRoaXMucmV0cmlldmFsQm91bmRzLm1heFkgKSB7XHJcbiAgICAgICAgICB5UG9zID0gbWluWTtcclxuICAgICAgICAgIHhQb3MgKz0geEluY3JlbWVudDtcclxuICAgICAgICAgIGlmICggeFBvcyA+IHRoaXMucmV0cmlldmFsQm91bmRzLm1heFggKSB7XHJcblxyXG4gICAgICAgICAgICAvLyB3ZSdyZSBvdXQgb2Ygc3BhY2UsIGZhbGwgb3V0IG9mIHRoZSBsb29wXHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBwb3NpdGlvbi5zZXRYWSggeFBvcywgeVBvcyApO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKCAhb3BlblBvc2l0aW9uRm91bmQgKSB7XHJcblxyXG4gICAgICAvLyB0aGUgc2NyZWVuIHdhcyB0b28gZnVsbCBhbmQgd2UgY291bGRuJ3QgZmluZCBhIHNwb3QsIHNvIGNob29zZSBzb21ldGhpbmcgYXQgcmFuZG9tXHJcbiAgICAgIHBvc2l0aW9uLnNldFhZKFxyXG4gICAgICAgIG1pblggKyBkb3RSYW5kb20ubmV4dERvdWJsZSgpICogKCB0aGlzLnJldHJpZXZhbEJvdW5kcy53aWR0aCAtIGV4cHJlc3Npb24ud2lkdGhQcm9wZXJ0eS5nZXQoKSAtIG1pblggKSxcclxuICAgICAgICBtaW5ZICsgZG90UmFuZG9tLm5leHREb3VibGUoKSAqICggdGhpcy5yZXRyaWV2YWxCb3VuZHMuaGVpZ2h0IC0gZXhwcmVzc2lvbi53aWR0aFByb3BlcnR5LmdldCgpIC0gbWluWSApXHJcbiAgICAgICk7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHBvc2l0aW9uO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogZ2V0IGEgcmVmZXJlbmNlIHRvIHRoZSBjb2xsZWN0aW9uIGFyZWEgdGhhdCBtb3N0IG92ZXJsYXBzIHdpdGggdGhlIHByb3ZpZGVkIGV4cHJlc3Npb24sIG51bGwgaWYgbm8gb3ZlcmxhcCBleGlzdHNcclxuICAgKiBAcGFyYW0ge0V4cHJlc3Npb259IGV4cHJlc3Npb25cclxuICAgKiBAcHJpdmF0ZVxyXG4gICAqL1xyXG4gIGdldE1vc3RPdmVybGFwcGluZ0NvbGxlY3Rpb25BcmVhRm9yRXhwcmVzc2lvbiggZXhwcmVzc2lvbiApIHtcclxuICAgIGxldCBtYXhPdmVybGFwID0gMDtcclxuICAgIGxldCBtb3N0T3ZlcmxhcHBpbmdDb2xsZWN0aW9uQXJlYSA9IG51bGw7XHJcbiAgICB0aGlzLmNvbGxlY3Rpb25BcmVhcy5mb3JFYWNoKCBjb2xsZWN0aW9uQXJlYSA9PiB7XHJcbiAgICAgIGlmICggZXhwcmVzc2lvbi5nZXRPdmVybGFwKCBjb2xsZWN0aW9uQXJlYSApID4gbWF4T3ZlcmxhcCApIHtcclxuICAgICAgICBtb3N0T3ZlcmxhcHBpbmdDb2xsZWN0aW9uQXJlYSA9IGNvbGxlY3Rpb25BcmVhO1xyXG4gICAgICAgIG1heE92ZXJsYXAgPSBleHByZXNzaW9uLmdldE92ZXJsYXAoIGNvbGxlY3Rpb25BcmVhICk7XHJcbiAgICAgIH1cclxuICAgIH0gKTtcclxuICAgIHJldHVybiBtb3N0T3ZlcmxhcHBpbmdDb2xsZWN0aW9uQXJlYTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIGdldCBhIHJlZmVyZW5jZSB0byB0aGUgY29sbGVjdGlvbiBhcmVhIHRoYXQgbW9zdCBvdmVybGFwcyB3aXRoIHRoZSBwcm92aWRlZCBjb2luIHRlcm0sIG51bGwgaWYgbm8gb3ZlcmxhcCBleGlzdHNcclxuICAgKiBAcGFyYW0ge0NvaW5UZXJtfSBjb2luVGVybVxyXG4gICAqIEBwcml2YXRlXHJcbiAgICovXHJcbiAgZ2V0TW9zdE92ZXJsYXBwaW5nQ29sbGVjdGlvbkFyZWFGb3JDb2luVGVybSggY29pblRlcm0gKSB7XHJcbiAgICBsZXQgbWF4T3ZlcmxhcCA9IDA7XHJcbiAgICBsZXQgbW9zdE92ZXJsYXBwaW5nQ29sbGVjdGlvbkFyZWEgPSBudWxsO1xyXG4gICAgdGhpcy5jb2xsZWN0aW9uQXJlYXMuZm9yRWFjaCggY29sbGVjdGlvbkFyZWEgPT4ge1xyXG4gICAgICBjb25zdCBjb2luVGVybUJvdW5kcyA9IGNvaW5UZXJtLmdldFZpZXdCb3VuZHMoKTtcclxuICAgICAgY29uc3QgY29sbGVjdGlvbkFyZWFCb3VuZHMgPSBjb2xsZWN0aW9uQXJlYS5ib3VuZHM7XHJcbiAgICAgIGNvbnN0IHhPdmVybGFwID0gTWF0aC5tYXgoXHJcbiAgICAgICAgMCxcclxuICAgICAgICBNYXRoLm1pbiggY29pblRlcm1Cb3VuZHMubWF4WCwgY29sbGVjdGlvbkFyZWFCb3VuZHMubWF4WCApIC0gTWF0aC5tYXgoIGNvaW5UZXJtQm91bmRzLm1pblgsIGNvbGxlY3Rpb25BcmVhQm91bmRzLm1pblggKVxyXG4gICAgICApO1xyXG4gICAgICBjb25zdCB5T3ZlcmxhcCA9IE1hdGgubWF4KFxyXG4gICAgICAgIDAsXHJcbiAgICAgICAgTWF0aC5taW4oIGNvaW5UZXJtQm91bmRzLm1heFksIGNvbGxlY3Rpb25BcmVhQm91bmRzLm1heFkgKSAtIE1hdGgubWF4KCBjb2luVGVybUJvdW5kcy5taW5ZLCBjb2xsZWN0aW9uQXJlYUJvdW5kcy5taW5ZIClcclxuICAgICAgKTtcclxuICAgICAgY29uc3QgdG90YWxPdmVybGFwID0geE92ZXJsYXAgKiB5T3ZlcmxhcDtcclxuICAgICAgaWYgKCB0b3RhbE92ZXJsYXAgPiBtYXhPdmVybGFwICkge1xyXG4gICAgICAgIG1heE92ZXJsYXAgPSB0b3RhbE92ZXJsYXA7XHJcbiAgICAgICAgbW9zdE92ZXJsYXBwaW5nQ29sbGVjdGlvbkFyZWEgPSBjb2xsZWN0aW9uQXJlYTtcclxuICAgICAgfVxyXG4gICAgfSApO1xyXG4gICAgcmV0dXJuIG1vc3RPdmVybGFwcGluZ0NvbGxlY3Rpb25BcmVhO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogaGFuZGxlciBmb3Igd2hlbiBhIGNvaW4gdGVybSBpcyBhZGRlZCB0byB0aGUgbW9kZWwsIGhvb2tzIHVwIGEgYnVuY2ggb2YgbGlzdGVuZXJzXHJcbiAgICogQHBhcmFtIGFkZGVkQ29pblRlcm1cclxuICAgKiBAcHJpdmF0ZVxyXG4gICAqL1xyXG4gIGNvaW5UZXJtQWRkZWRMaXN0ZW5lciggYWRkZWRDb2luVGVybSApIHtcclxuXHJcbiAgICBjb25zdCBzZWxmID0gdGhpcztcclxuXHJcbiAgICAvLyBBZGQgYSBsaXN0ZW5lciB0aGF0IHdpbGwgcG90ZW50aWFsbHkgY29tYmluZSB0aGlzIGNvaW4gdGVybSB3aXRoIGV4cHJlc3Npb25zIG9yIG90aGVyIGNvaW4gdGVybXMgYmFzZWQgb25cclxuICAgIC8vIHdoZXJlIGl0IGlzIHJlbGVhc2VkLlxyXG4gICAgZnVuY3Rpb24gY29pblRlcm1Vc2VyQ29udHJvbGxlZExpc3RlbmVyKCB1c2VyQ29udHJvbGxlZCApIHtcclxuXHJcbiAgICAgIGlmICggIXVzZXJDb250cm9sbGVkICkge1xyXG5cclxuICAgICAgICAvLyBTZXQgYSBidW5jaCBvZiB2YXJpYWJsZXMgcmVsYXRlZCB0byB0aGUgY3VycmVudCBzdGF0ZSBvZiB0aGlzIGNvaW4gdGVybS4gIEl0J3Mgbm90IHJlYWxseSBuZWNlc3NhcnkgdG8gc2V0XHJcbiAgICAgICAgLy8gdGhlbSBhbGwgZXZlcnkgdGltZSwgYnV0IGl0IGF2b2lkcyBhIGRlZXBseSBuZXN0ZWQgaWYtZWxzZSBzdHJ1Y3R1cmUuXHJcbiAgICAgICAgY29uc3QgcmVsZWFzZWRPdmVyQ3JlYXRvckJveCA9IGFkZGVkQ29pblRlcm0uZ2V0Vmlld0JvdW5kcygpLmludGVyc2VjdHNCb3VuZHMoIHNlbGYuY3JlYXRvckJveEJvdW5kcyApO1xyXG4gICAgICAgIGNvbnN0IGV4cHJlc3Npb25CZWluZ0VkaXRlZCA9IHNlbGYuZXhwcmVzc2lvbkJlaW5nRWRpdGVkUHJvcGVydHkuZ2V0KCk7XHJcbiAgICAgICAgY29uc3QgbW9zdE92ZXJsYXBwaW5nQ29sbGVjdGlvbkFyZWEgPSBzZWxmLmdldE1vc3RPdmVybGFwcGluZ0NvbGxlY3Rpb25BcmVhRm9yQ29pblRlcm0oIGFkZGVkQ29pblRlcm0gKTtcclxuICAgICAgICBjb25zdCBtb3N0T3ZlcmxhcHBpbmdFeHByZXNzaW9uID0gc2VsZi5nZXRFeHByZXNzaW9uTW9zdE92ZXJsYXBwaW5nV2l0aENvaW5UZXJtKCBhZGRlZENvaW5UZXJtICk7XHJcbiAgICAgICAgY29uc3QgbW9zdE92ZXJsYXBwaW5nTGlrZUNvaW5UZXJtID0gc2VsZi5nZXRNb3N0T3ZlcmxhcHBpbmdMaWtlQ29pblRlcm0oIGFkZGVkQ29pblRlcm0gKTtcclxuICAgICAgICBjb25zdCBqb2luYWJsZUZyZWVDb2luVGVybSA9IHNlbGYuY2hlY2tGb3JKb2luYWJsZUZyZWVDb2luVGVybSggYWRkZWRDb2luVGVybSApO1xyXG5cclxuICAgICAgICBpZiAoIGV4cHJlc3Npb25CZWluZ0VkaXRlZCAmJiBleHByZXNzaW9uQmVpbmdFZGl0ZWQuY29pblRlcm1zLmluY2x1ZGVzKCBhZGRlZENvaW5UZXJtICkgKSB7XHJcblxyXG4gICAgICAgICAgLy8gQW4gZXhwcmVzc2lvbiBpcyBiZWluZyBlZGl0ZWQsIHNvIGEgcmVsZWFzZWQgY29pbiB0ZXJtIGNvdWxkIGJlIGVpdGhlciBtb3ZlZCB0byBhIG5ldyBwb3NpdGlvbiB3aXRoaW4gYW5cclxuICAgICAgICAgIC8vIGV4cHJlc3Npb24gb3IgY29tYmluZWQgd2l0aCBhbm90aGVyIGNvaW4gdGVybSBpbiB0aGUgZXhwcmVzc2lvbi5cclxuXHJcbiAgICAgICAgICAvLyBkZXRlcm1pbmUgaWYgdGhlIGNvaW4gdGVybSB3YXMgZHJvcHBlZCB3aGlsZSBvdmVybGFwcGluZyBhIGNvaW4gdGVybSBvZiB0aGUgc2FtZSB0eXBlXHJcbiAgICAgICAgICBjb25zdCBvdmVybGFwcGluZ0xpa2VDb2luVGVybSA9IHNlbGYuZ2V0T3ZlcmxhcHBpbmdMaWtlQ29pblRlcm1XaXRoaW5FeHByZXNzaW9uKFxyXG4gICAgICAgICAgICBhZGRlZENvaW5UZXJtLFxyXG4gICAgICAgICAgICBleHByZXNzaW9uQmVpbmdFZGl0ZWRcclxuICAgICAgICAgICk7XHJcblxyXG4gICAgICAgICAgaWYgKCBvdmVybGFwcGluZ0xpa2VDb2luVGVybSApIHtcclxuXHJcbiAgICAgICAgICAgIC8vIGNvbWJpbmUgdGhlIGRyb3BwZWQgY29pbiB0ZXJtIHdpdGggdGhlIG9uZSB3aXRoIHdoaWNoIGl0IG92ZXJsYXBzXHJcbiAgICAgICAgICAgIG92ZXJsYXBwaW5nTGlrZUNvaW5UZXJtLmFic29yYiggYWRkZWRDb2luVGVybSwgc2VsZi5wYXJ0aWFsQ2FuY2VsbGF0aW9uRW5hYmxlZCApO1xyXG4gICAgICAgICAgICBwaGV0LmxvZyAmJiBwaGV0LmxvZyhcclxuICAgICAgICAgICAgICBgJHtvdmVybGFwcGluZ0xpa2VDb2luVGVybS5pZH0gYWJzb3JiZWQgJHthZGRlZENvaW5UZXJtLmlkfSwgJHtvdmVybGFwcGluZ0xpa2VDb2luVGVybS5pZFxyXG4gICAgICAgICAgICAgIH0gY29tcG9zaXRpb24gPSBbJHtvdmVybGFwcGluZ0xpa2VDb2luVGVybS5jb21wb3NpdGlvbn1dYCApO1xyXG4gICAgICAgICAgICBzZWxmLnJlbW92ZUNvaW5UZXJtKCBhZGRlZENvaW5UZXJtLCBmYWxzZSApO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgZWxzZSB7XHJcblxyXG4gICAgICAgICAgICAvLyB0aGUgY29pbiB0ZXJtIGhhcyBiZWVuIGRyb3BwZWQgYXQgc29tZSBwb3RlbnRpYWxseSBuZXcgcG9zaXRpb24gd2l0aGluZyB0aGUgZXhwcmVzc2lvblxyXG4gICAgICAgICAgICBleHByZXNzaW9uQmVpbmdFZGl0ZWQucmVpbnRlZ3JhdGVDb2luVGVybSggYWRkZWRDb2luVGVybSApO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIGlmICggcmVsZWFzZWRPdmVyQ3JlYXRvckJveCApIHtcclxuXHJcbiAgICAgICAgICAvLyB0aGUgdXNlciBoYXMgcHV0IHRoaXMgY29pbiB0ZXJtIGJhY2sgaW4gdGhlIGNyZWF0b3IgYm94LCBzbyByZW1vdmUgaXRcclxuICAgICAgICAgIHNlbGYucmVtb3ZlQ29pblRlcm0oIGFkZGVkQ29pblRlcm0sIHRydWUgKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSBpZiAoIG1vc3RPdmVybGFwcGluZ0NvbGxlY3Rpb25BcmVhICkge1xyXG5cclxuICAgICAgICAgIC8vIFRoZSBjb2luIHRlcm0gd2FzIHJlbGVhc2VkIG92ZXIgYSBjb2xsZWN0aW9uIGFyZWEgKHRoaXMgb25seSBvY2N1cnMgb24gZ2FtZSBzY3JlZW5zKS4gIE5vdGlmeSB0aGVcclxuICAgICAgICAgIC8vIGNvbGxlY3Rpb24gYXJlYSBzbyB0aGF0IGl0IGNhbiBlaXRoZXIgY29sbGVjdCBvciByZWplY3QgaXQuXHJcbiAgICAgICAgICBtb3N0T3ZlcmxhcHBpbmdDb2xsZWN0aW9uQXJlYS5jb2xsZWN0T3JSZWplY3RDb2luVGVybSggYWRkZWRDb2luVGVybSApO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIGlmICggbW9zdE92ZXJsYXBwaW5nRXhwcmVzc2lvbiApIHtcclxuXHJcbiAgICAgICAgICAvLyB0aGUgdXNlciBpcyBhZGRpbmcgdGhlIGNvaW4gdGVybSB0byBhbiBleHByZXNzaW9uXHJcbiAgICAgICAgICBtb3N0T3ZlcmxhcHBpbmdFeHByZXNzaW9uLmFkZENvaW5UZXJtKCBhZGRlZENvaW5UZXJtICk7XHJcbiAgICAgICAgICBwaGV0LmxvZyAmJiBwaGV0LmxvZyggYGFkZGVkICR7YWRkZWRDb2luVGVybS5pZH0gdG8gJHttb3N0T3ZlcmxhcHBpbmdFeHByZXNzaW9uLmlkfWAgKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSBpZiAoIG1vc3RPdmVybGFwcGluZ0xpa2VDb2luVGVybSApIHtcclxuXHJcbiAgICAgICAgICAvLyBUaGUgY29pbiB0ZXJtIHdhcyByZWxlYXNlZCBvdmVyIGEgY29pbiB0ZXJtIG9mIHRoZSBzYW1lIHR5cGUsIHNvIGNvbWJpbmUgdGhlIHR3byBjb2luIHRlcm1zIGludG8gYSBzaW5nbGVcclxuICAgICAgICAgIC8vIG9uZSB3aXRoIGEgaGlnaGVyIGNvdW50IHZhbHVlLlxyXG4gICAgICAgICAgYWRkZWRDb2luVGVybS5kZXN0aW5hdGlvblJlYWNoZWRFbWl0dGVyLmFkZExpc3RlbmVyKCBmdW5jdGlvbiBkZXN0aW5hdGlvblJlYWNoZWRMaXN0ZW5lcigpIHtcclxuICAgICAgICAgICAgbW9zdE92ZXJsYXBwaW5nTGlrZUNvaW5UZXJtLmFic29yYiggYWRkZWRDb2luVGVybSwgc2VsZi5wYXJ0aWFsQ2FuY2VsbGF0aW9uRW5hYmxlZCApO1xyXG4gICAgICAgICAgICBwaGV0LmxvZyAmJiBwaGV0LmxvZyhcclxuICAgICAgICAgICAgICBgJHttb3N0T3ZlcmxhcHBpbmdMaWtlQ29pblRlcm0uaWR9IGFic29yYmVkICR7YWRkZWRDb2luVGVybS5pZH0sICR7XHJcbiAgICAgICAgICAgICAgICBtb3N0T3ZlcmxhcHBpbmdMaWtlQ29pblRlcm0uaWR9IGNvbXBvc2l0aW9uID0gWyR7XHJcbiAgICAgICAgICAgICAgICBtb3N0T3ZlcmxhcHBpbmdMaWtlQ29pblRlcm0uY29tcG9zaXRpb259XWAgKTtcclxuICAgICAgICAgICAgc2VsZi5yZW1vdmVDb2luVGVybSggYWRkZWRDb2luVGVybSwgZmFsc2UgKTtcclxuICAgICAgICAgICAgYWRkZWRDb2luVGVybS5kZXN0aW5hdGlvblJlYWNoZWRFbWl0dGVyLnJlbW92ZUxpc3RlbmVyKCBkZXN0aW5hdGlvblJlYWNoZWRMaXN0ZW5lciApO1xyXG4gICAgICAgICAgfSApO1xyXG4gICAgICAgICAgYWRkZWRDb2luVGVybS50cmF2ZWxUb0Rlc3RpbmF0aW9uKCBtb3N0T3ZlcmxhcHBpbmdMaWtlQ29pblRlcm0ucG9zaXRpb25Qcm9wZXJ0eS5nZXQoKSApO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIGlmICggam9pbmFibGVGcmVlQ29pblRlcm0gKSB7XHJcblxyXG4gICAgICAgICAgLy8gVGhlIGNvaW4gdGVybSB3YXMgcmVsZWFzZWQgaW4gYSBwbGFjZSB3aGVyZSBpdCBjb3VsZCBqb2luIGFub3RoZXIgZnJlZSBjb2luIHRlcm0uXHJcbiAgICAgICAgICBsZXQgZXhwcmVzc2lvbkhpbnRUb1JlbW92ZTtcclxuICAgICAgICAgIHNlbGYuZXhwcmVzc2lvbkhpbnRzLmZvckVhY2goIGV4cHJlc3Npb25IaW50ID0+IHtcclxuICAgICAgICAgICAgaWYgKCBleHByZXNzaW9uSGludC5jb250YWluc0NvaW5UZXJtKCBhZGRlZENvaW5UZXJtICkgJiYgZXhwcmVzc2lvbkhpbnQuY29udGFpbnNDb2luVGVybSggam9pbmFibGVGcmVlQ29pblRlcm0gKSApIHtcclxuICAgICAgICAgICAgICBleHByZXNzaW9uSGludFRvUmVtb3ZlID0gZXhwcmVzc2lvbkhpbnQ7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH0gKTtcclxuICAgICAgICAgIGlmICggZXhwcmVzc2lvbkhpbnRUb1JlbW92ZSApIHtcclxuICAgICAgICAgICAgc2VsZi5yZW1vdmVFeHByZXNzaW9uSGludCggZXhwcmVzc2lvbkhpbnRUb1JlbW92ZSApO1xyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICAgIC8vIGNyZWF0ZSB0aGUgbmV4dCBleHByZXNzaW9uIHdpdGggdGhlc2UgY29pbiB0ZXJtc1xyXG4gICAgICAgICAgc2VsZi5leHByZXNzaW9ucy5wdXNoKCBuZXcgRXhwcmVzc2lvbihcclxuICAgICAgICAgICAgam9pbmFibGVGcmVlQ29pblRlcm0sXHJcbiAgICAgICAgICAgIGFkZGVkQ29pblRlcm0sXHJcbiAgICAgICAgICAgIHNlbGYuc2ltcGxpZnlOZWdhdGl2ZXNQcm9wZXJ0eVxyXG4gICAgICAgICAgKSApO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGFkZGVkQ29pblRlcm0udXNlckNvbnRyb2xsZWRQcm9wZXJ0eS5sYXp5TGluayggY29pblRlcm1Vc2VyQ29udHJvbGxlZExpc3RlbmVyICk7XHJcblxyXG4gICAgLy8gYWRkIGEgbGlzdGVuZXIgdGhhdCB3aWxsIGhhbmRsZSByZXF1ZXN0cyB0byBicmVhayBhcGFydCB0aGUgY29pbiB0ZXJtXHJcbiAgICBmdW5jdGlvbiBjb2luVGVybUJyZWFrQXBhcnRMaXN0ZW5lcigpIHtcclxuXHJcbiAgICAgIGlmICggYWRkZWRDb2luVGVybS5jb21wb3NpdGlvbi5sZW5ndGggPCAyICkge1xyXG4gICAgICAgIC8vIGJhaWwgaWYgdGhlIGNvaW4gdGVybSBjYW4ndCBiZSBkZWNvbXBvc2VkXHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgICB9XHJcbiAgICAgIGNvbnN0IGV4dHJhY3RlZENvaW5UZXJtcyA9IGFkZGVkQ29pblRlcm0uZXh0cmFjdENvbnN0aXR1ZW50Q29pblRlcm1zKCk7XHJcbiAgICAgIGNvbnN0IHJlbGF0aXZlVmlld0JvdW5kcyA9IGFkZGVkQ29pblRlcm0ubG9jYWxWaWV3Qm91bmRzUHJvcGVydHkuZ2V0KCk7XHJcbiAgICAgIGxldCBwb2ludFRvRGlzdHJpYnV0ZUFyb3VuZCA9IGFkZGVkQ29pblRlcm0uZGVzdGluYXRpb25Qcm9wZXJ0eS5nZXQoKTtcclxuXHJcbiAgICAgIC8vIElmIHRoZSB0b3RhbCBjb21iaW5lZCBjb2luIGNvdW50IHdhcyBldmVuLCBzaGlmdCB0aGUgZGlzdHJpYnV0aW9uIHBvaW50IGEgYml0IHNvIHRoYXQgdGhlIGNvaW5zIGVuZCB1cCBiZWluZ1xyXG4gICAgICAvLyBkaXN0cmlidXRlZCBhcm91bmQgdGhlIGNlbnRlclggcG9zaXRpb24uXHJcbiAgICAgIGlmICggZXh0cmFjdGVkQ29pblRlcm1zLmxlbmd0aCAlIDIgPT09IDEgKSB7XHJcbiAgICAgICAgcG9pbnRUb0Rpc3RyaWJ1dGVBcm91bmQgPSBwb2ludFRvRGlzdHJpYnV0ZUFyb3VuZC5wbHVzWFkoXHJcbiAgICAgICAgICAtcmVsYXRpdmVWaWV3Qm91bmRzLndpZHRoIC8gMiAtIEJSRUFLX0FQQVJUX1NQQUNJTkcgLyAyLFxyXG4gICAgICAgICAgMFxyXG4gICAgICAgICk7XHJcblxyXG4gICAgICAgIC8vIHNldCB0aGUgcGFyZW50IGNvaW4gcG9zaXRpb24gdG8gdGhlIGRpc3RyaWJ1dGlvbiBwb2ludCBpZiBpdCBpcyBpbiBib3VuZHNcclxuICAgICAgICBpZiAoIHNlbGYucmV0cmlldmFsQm91bmRzLmNvbnRhaW5zUG9pbnQoIHBvaW50VG9EaXN0cmlidXRlQXJvdW5kICkgKSB7XHJcbiAgICAgICAgICBhZGRlZENvaW5UZXJtLnRyYXZlbFRvRGVzdGluYXRpb24oIHBvaW50VG9EaXN0cmlidXRlQXJvdW5kICk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgYWRkZWRDb2luVGVybS50cmF2ZWxUb0Rlc3RpbmF0aW9uKCBzZWxmLmdldE5leHRPcGVuUmV0cmlldmFsU3BvdCgpICk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBhZGQgdGhlIGV4dHJhY3RlZCBjb2luIHRlcm1zIHRvIHRoZSBtb2RlbFxyXG4gICAgICBjb25zdCBpbnRlckNvaW5UZXJtRGlzdGFuY2UgPSByZWxhdGl2ZVZpZXdCb3VuZHMud2lkdGggKyBCUkVBS19BUEFSVF9TUEFDSU5HO1xyXG4gICAgICBsZXQgbmV4dExlZnRYID0gcG9pbnRUb0Rpc3RyaWJ1dGVBcm91bmQueCAtIGludGVyQ29pblRlcm1EaXN0YW5jZTtcclxuICAgICAgbGV0IG5leHRSaWdodFggPSBwb2ludFRvRGlzdHJpYnV0ZUFyb3VuZC54ICsgaW50ZXJDb2luVGVybURpc3RhbmNlO1xyXG4gICAgICBleHRyYWN0ZWRDb2luVGVybXMuZm9yRWFjaCggKCBleHRyYWN0ZWRDb2luVGVybSwgaW5kZXggKSA9PiB7XHJcbiAgICAgICAgbGV0IGRlc3RpbmF0aW9uO1xyXG4gICAgICAgIHNlbGYuYWRkQ29pblRlcm0oIGV4dHJhY3RlZENvaW5UZXJtICk7XHJcbiAgICAgICAgaWYgKCBpbmRleCAlIDIgPT09IDAgKSB7XHJcbiAgICAgICAgICBkZXN0aW5hdGlvbiA9IG5ldyBWZWN0b3IyKCBuZXh0UmlnaHRYLCBwb2ludFRvRGlzdHJpYnV0ZUFyb3VuZC55ICk7XHJcbiAgICAgICAgICBuZXh0UmlnaHRYICs9IGludGVyQ29pblRlcm1EaXN0YW5jZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICBkZXN0aW5hdGlvbiA9IG5ldyBWZWN0b3IyKCBuZXh0TGVmdFgsIHBvaW50VG9EaXN0cmlidXRlQXJvdW5kLnkgKTtcclxuICAgICAgICAgIG5leHRMZWZ0WCAtPSBpbnRlckNvaW5UZXJtRGlzdGFuY2U7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBpZiB0aGUgZGVzdGluYXRpb24gaXMgb3V0c2lkZSBvZiB0aGUgYWxsb3dlZCBib3VuZHMsIGNoYW5nZSBpdCB0byBiZSBpbiBib3VuZHNcclxuICAgICAgICBpZiAoICFzZWxmLnJldHJpZXZhbEJvdW5kcy5jb250YWluc1BvaW50KCBkZXN0aW5hdGlvbiApICkge1xyXG4gICAgICAgICAgZGVzdGluYXRpb24gPSBzZWxmLmdldE5leHRPcGVuUmV0cmlldmFsU3BvdCgpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gaW5pdGlhdGUgdGhlIGFuaW1hdGlvblxyXG4gICAgICAgIGV4dHJhY3RlZENvaW5UZXJtLnRyYXZlbFRvRGVzdGluYXRpb24oIGRlc3RpbmF0aW9uICk7XHJcbiAgICAgIH0gKTtcclxuICAgIH1cclxuXHJcbiAgICBhZGRlZENvaW5UZXJtLmJyZWFrQXBhcnRFbWl0dGVyLmFkZExpc3RlbmVyKCBjb2luVGVybUJyZWFrQXBhcnRMaXN0ZW5lciApO1xyXG5cclxuICAgIC8vIGFkZCBhIGxpc3RlbmVyIHRoYXQgd2lsbCByZW1vdmUgdGhpcyBjb2luIGlmIGFuZCB3aGVuIGl0IHJldHVybnMgdG8gaXRzIG9yaWdpbmFsIHBvc2l0aW9uXHJcbiAgICBmdW5jdGlvbiBjb2luVGVybVJldHVybmVkVG9PcmlnaW5MaXN0ZW5lcigpIHtcclxuICAgICAgc2VsZi5yZW1vdmVDb2luVGVybSggYWRkZWRDb2luVGVybSwgZmFsc2UgKTtcclxuICAgIH1cclxuXHJcbiAgICBhZGRlZENvaW5UZXJtLnJldHVybmVkVG9PcmlnaW5FbWl0dGVyLmFkZExpc3RlbmVyKCBjb2luVGVybVJldHVybmVkVG9PcmlnaW5MaXN0ZW5lciApO1xyXG5cclxuICAgIC8vIG1vbml0b3IgdGhlIGV4aXN0ZW5jZSBzdHJlbmd0aCBvZiB0aGlzIGNvaW4gdGVybVxyXG4gICAgZnVuY3Rpb24gY29pblRlcm1FeGlzdGVuY2VTdHJlbmd0aExpc3RlbmVyKCBleGlzdGVuY2VTdHJlbmd0aCApIHtcclxuXHJcbiAgICAgIGlmICggZXhpc3RlbmNlU3RyZW5ndGggPD0gMCApIHtcclxuXHJcbiAgICAgICAgLy8gdGhlIGV4aXN0ZW5jZSBzdHJlbmd0aCBoYXMgZ29uZSB0byB6ZXJvLCByZW1vdmUgdGhpcyBmcm9tIHRoZSBtb2RlbFxyXG4gICAgICAgIHNlbGYucmVtb3ZlQ29pblRlcm0oIGFkZGVkQ29pblRlcm0sIGZhbHNlICk7XHJcblxyXG4gICAgICAgIGlmICggc2VsZi5leHByZXNzaW9uQmVpbmdFZGl0ZWRQcm9wZXJ0eS5nZXQoKSApIHtcclxuICAgICAgICAgIGlmICggc2VsZi5leHByZXNzaW9uQmVpbmdFZGl0ZWRQcm9wZXJ0eS5nZXQoKS5jb2luVGVybXMubGVuZ3RoID09PSAwICkge1xyXG5cclxuICAgICAgICAgICAgLy8gdGhlIHJlbW92YWwgb2YgdGhlIGNvaW4gdGVybSBjYXVzZWQgdGhlIGV4cHJlc3Npb24gYmVpbmcgZWRpdGVkIHRvIGJlIGVtcHR5LCBzbyBkcm9wIG91dCBvZiBlZGl0IG1vZGVcclxuICAgICAgICAgICAgc2VsZi5zdG9wRWRpdGluZ0V4cHJlc3Npb24oKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBhZGRlZENvaW5UZXJtLmV4aXN0ZW5jZVN0cmVuZ3RoUHJvcGVydHkubGluayggY29pblRlcm1FeGlzdGVuY2VTdHJlbmd0aExpc3RlbmVyICk7XHJcblxyXG4gICAgLy8gY2xlYW4gdXAgdGhlIGxpc3RlbmVycyBhZGRlZCBhYm92ZSBpZiBhbmQgd2hlbiB0aGlzIGNvaW4gdGVybSBpcyByZW1vdmVkIGZyb20gdGhlIG1vZGVsXHJcbiAgICB0aGlzLmNvaW5UZXJtcy5hZGRJdGVtUmVtb3ZlZExpc3RlbmVyKCBmdW5jdGlvbiBjb2luVGVybVJlbW92YWxMaXN0ZW5lciggcmVtb3ZlZENvaW5UZXJtICkge1xyXG4gICAgICBpZiAoIHJlbW92ZWRDb2luVGVybSA9PT0gYWRkZWRDb2luVGVybSApIHtcclxuICAgICAgICBhZGRlZENvaW5UZXJtLnVzZXJDb250cm9sbGVkUHJvcGVydHkudW5saW5rKCBjb2luVGVybVVzZXJDb250cm9sbGVkTGlzdGVuZXIgKTtcclxuICAgICAgICBhZGRlZENvaW5UZXJtLmJyZWFrQXBhcnRFbWl0dGVyLnJlbW92ZUxpc3RlbmVyKCBjb2luVGVybUJyZWFrQXBhcnRMaXN0ZW5lciApO1xyXG4gICAgICAgIGFkZGVkQ29pblRlcm0ucmV0dXJuZWRUb09yaWdpbkVtaXR0ZXIucmVtb3ZlTGlzdGVuZXIoIGNvaW5UZXJtUmV0dXJuZWRUb09yaWdpbkxpc3RlbmVyICk7XHJcbiAgICAgICAgYWRkZWRDb2luVGVybS5leGlzdGVuY2VTdHJlbmd0aFByb3BlcnR5LnVubGluayggY29pblRlcm1FeGlzdGVuY2VTdHJlbmd0aExpc3RlbmVyICk7XHJcbiAgICAgICAgc2VsZi5jb2luVGVybXMucmVtb3ZlSXRlbVJlbW92ZWRMaXN0ZW5lciggY29pblRlcm1SZW1vdmFsTGlzdGVuZXIgKTtcclxuICAgICAgfVxyXG4gICAgfSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogaGFuZGxlIHRoZSBhZGRpdGlvbiBvZiBhbiBleHByZXNpb24gdG8gdGhlIG1vZGVsXHJcbiAgICogQHBhcmFtIHtFeHByZXNzaW9ufSBhZGRlZEV4cHJlc3Npb25cclxuICAgKiBAcHJpdmF0ZVxyXG4gICAqL1xyXG4gIGV4cHJlc3Npb25BZGRlZExpc3RlbmVyKCBhZGRlZEV4cHJlc3Npb24gKSB7XHJcbiAgICBjb25zdCBzZWxmID0gdGhpcztcclxuXHJcbiAgICAvLyBhZGQgYSBsaXN0ZW5lciBmb3Igd2hlbiB0aGUgZXhwcmVzc2lvbiBpcyByZWxlYXNlZCwgd2hpY2ggbWF5IGNhdXNlIGl0IHRvIGJlIGNvbWJpbmVkIHdpdGggYW5vdGhlciBleHByZXNzaW9uXHJcbiAgICBmdW5jdGlvbiBleHByZXNzaW9uVXNlckNvbnRyb2xsZWRMaXN0ZW5lciggdXNlckNvbnRyb2xsZWQgKSB7XHJcblxyXG4gICAgICBpZiAoICF1c2VyQ29udHJvbGxlZCApIHtcclxuXHJcbiAgICAgICAgLy8gU2V0IGEgYnVuY2ggb2YgdmFyaWFibGVzIHJlbGF0ZWQgdG8gdGhlIGN1cnJlbnQgc3RhdGUgb2YgdGhpcyBleHByZXNzaW9uLiAgSXQncyBub3QgcmVhbGx5IG5lY2Vzc2FyeSB0byBzZXRcclxuICAgICAgICAvLyB0aGVtIGFsbCBldmVyeSB0aW1lLCBidXQgaXQgYXZvaWRzIGEgZGVlcGx5IG5lc3RlZCBpZi1lbHNlIHN0cnVjdHVyZS5cclxuICAgICAgICBjb25zdCByZWxlYXNlZE92ZXJDcmVhdG9yQm94ID0gYWRkZWRFeHByZXNzaW9uLmdldEJvdW5kcygpLmludGVyc2VjdHNCb3VuZHMoIHNlbGYuY3JlYXRvckJveEJvdW5kcyApO1xyXG4gICAgICAgIGNvbnN0IG1vc3RPdmVybGFwcGluZ0NvbGxlY3Rpb25BcmVhID0gc2VsZi5nZXRNb3N0T3ZlcmxhcHBpbmdDb2xsZWN0aW9uQXJlYUZvckV4cHJlc3Npb24oIGFkZGVkRXhwcmVzc2lvbiApO1xyXG4gICAgICAgIGNvbnN0IG1vc3RPdmVybGFwcGluZ0V4cHJlc3Npb24gPSBzZWxmLmdldEV4cHJlc3Npb25Nb3N0T3ZlcmxhcHBpbmdXaXRoRXhwcmVzc2lvbiggYWRkZWRFeHByZXNzaW9uICk7XHJcbiAgICAgICAgY29uc3QgbnVtT3ZlcmxhcHBpbmdDb2luVGVybXMgPSBhZGRlZEV4cHJlc3Npb24uaG92ZXJpbmdDb2luVGVybXMubGVuZ3RoO1xyXG5cclxuICAgICAgICAvLyBzdGF0ZSBjaGVja2luZ1xyXG4gICAgICAgIGFzc2VydCAmJiBhc3NlcnQoXHJcbiAgICAgICAgICBudW1PdmVybGFwcGluZ0NvaW5UZXJtcyA9PT0gMCB8fCBudW1PdmVybGFwcGluZ0NvaW5UZXJtcyA9PT0gMSxcclxuICAgICAgICAgIGBtYXggb2Ygb25lIG92ZXJsYXBwaW5nIGZyZWUgY29pbiB0ZXJtIHdoZW4gZXhwcmVzc2lvbiBpcyByZWxlYXNlZCwgc2VlaW5nICR7bnVtT3ZlcmxhcHBpbmdDb2luVGVybXN9YFxyXG4gICAgICAgICk7XHJcblxyXG4gICAgICAgIGlmICggcmVsZWFzZWRPdmVyQ3JlYXRvckJveCApIHtcclxuXHJcbiAgICAgICAgICAvLyB0aGUgZXhwcmVzc2lvbiB3YXMgcmVsZWFzZWQgb3ZlciB0aGUgY3JlYXRvciBib3gsIHNvIGl0IGFuZCB0aGUgY29pbiB0ZXJtcyBzaG91bGQgYmUgXCJwdXQgYXdheVwiXHJcbiAgICAgICAgICBzZWxmLnJlbW92ZUV4cHJlc3Npb24oIGFkZGVkRXhwcmVzc2lvbiApO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIGlmICggbW9zdE92ZXJsYXBwaW5nQ29sbGVjdGlvbkFyZWEgKSB7XHJcblxyXG4gICAgICAgICAgLy8gVGhlIGV4cHJlc3Npb24gd2FzIHJlbGVhc2VkIGluIGEgcG9zaXRpb24gdGhhdCBhdCBsZWFzdCBwYXJ0aWFsbHkgb3ZlcmxhcHMgYSBjb2xsZWN0aW9uIGFyZWEuICBUaGVcclxuICAgICAgICAgIC8vIGNvbGxlY3Rpb24gYXJlYSBtdXN0IGRlY2lkZSB3aGV0aGVyIHRvIGNvbGxlY3Qgb3IgcmVqZWN0IHRoZSBleHByZXNzaW9uLlxyXG4gICAgICAgICAgbW9zdE92ZXJsYXBwaW5nQ29sbGVjdGlvbkFyZWEuY29sbGVjdE9yUmVqZWN0RXhwcmVzc2lvbiggYWRkZWRFeHByZXNzaW9uICk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgaWYgKCBtb3N0T3ZlcmxhcHBpbmdFeHByZXNzaW9uICkge1xyXG5cclxuICAgICAgICAgIC8vIFRoZSBleHByZXNzaW9uIHdhcyByZWxlYXNlZCBpbiBhIHBsYWNlIHdoZXJlIGl0IGF0IGxlYXN0IHBhcnRpYWxseSBvdmVybGFwcyBhbm90aGVyIGV4cHJlc3Npb24sIHNvIHRoZVxyXG4gICAgICAgICAgLy8gdHdvIGV4cHJlc3Npb25zIHNob3VsZCBiZSBqb2luZWQgaW50byBvbmUuICBUaGUgZmlyc3Qgc3RlcCBpcyB0byByZW1vdmUgdGhlIGV4cHJlc3Npb24gZnJvbSB0aGUgbGlzdCBvZlxyXG4gICAgICAgICAgLy8gdGhvc2UgaG92ZXJpbmcuXHJcbiAgICAgICAgICBtb3N0T3ZlcmxhcHBpbmdFeHByZXNzaW9uLnJlbW92ZUhvdmVyaW5nRXhwcmVzc2lvbiggYWRkZWRFeHByZXNzaW9uICk7XHJcblxyXG4gICAgICAgICAgLy8gc2VuZCB0aGUgY29tYmluaW5nIGV4cHJlc3Npb24gdG8gdGhlIHJpZ2h0IHNpZGUgb2YgcmVjZWl2aW5nIGV4cHJlc3Npb25cclxuICAgICAgICAgIGNvbnN0IGRlc3RpbmF0aW9uRm9yQ29tYmluZSA9IG1vc3RPdmVybGFwcGluZ0V4cHJlc3Npb24uZ2V0VXBwZXJSaWdodENvcm5lcigpO1xyXG4gICAgICAgICAgYWRkZWRFeHByZXNzaW9uLnRyYXZlbFRvRGVzdGluYXRpb24oIGRlc3RpbmF0aW9uRm9yQ29tYmluZSApO1xyXG5cclxuICAgICAgICAgIC8vIExpc3RlbiBmb3Igd2hlbiB0aGUgZXhwcmVzc2lvbiBpcyBpbiBwbGFjZSBhbmQsIHdoZW4gaXQgaXMsIHRyYW5zZmVyIGl0cyBjb2luIHRlcm1zIHRvIHRoZSByZWNlaXZpbmdcclxuICAgICAgICAgIC8vIGV4cHJlc3Npb24uXHJcbiAgICAgICAgICBhZGRlZEV4cHJlc3Npb24uZGVzdGluYXRpb25SZWFjaGVkRW1pdHRlci5hZGRMaXN0ZW5lciggZnVuY3Rpb24gZGVzdGluYXRpb25SZWFjaGVkTGlzdGVuZXIoKSB7XHJcblxyXG4gICAgICAgICAgICAvLyBkZXN0aW5hdGlvbiByZWFjaGVkLCBjb21iaW5lIHdpdGggb3RoZXIgZXhwcmVzc2lvbiwgYnV0IE9OTFkgaWYgaXQgaGFzbid0IG1vdmVkIG9yIGJlZW4gcmVtb3ZlZFxyXG4gICAgICAgICAgICBpZiAoIG1vc3RPdmVybGFwcGluZ0V4cHJlc3Npb24uZ2V0VXBwZXJSaWdodENvcm5lcigpLmVxdWFscyggZGVzdGluYXRpb25Gb3JDb21iaW5lICkgJiZcclxuICAgICAgICAgICAgICAgICBzZWxmLmV4cHJlc3Npb25zLmluY2x1ZGVzKCBtb3N0T3ZlcmxhcHBpbmdFeHByZXNzaW9uICkgKSB7XHJcblxyXG4gICAgICAgICAgICAgIGNvbnN0IGNvaW5UZXJtc1RvQmVNb3ZlZCA9IGFkZGVkRXhwcmVzc2lvbi5yZW1vdmVBbGxDb2luVGVybXMoKTtcclxuICAgICAgICAgICAgICBzZWxmLmV4cHJlc3Npb25zLnJlbW92ZSggYWRkZWRFeHByZXNzaW9uICk7XHJcbiAgICAgICAgICAgICAgY29pblRlcm1zVG9CZU1vdmVkLmZvckVhY2goIGNvaW5UZXJtID0+IHtcclxuICAgICAgICAgICAgICAgIHBoZXQubG9nICYmIHBoZXQubG9nKCBgbW92aW5nICR7Y29pblRlcm0uaWRcclxuICAgICAgICAgICAgICAgIH0gZnJvbSAke2FkZGVkRXhwcmVzc2lvbi5pZFxyXG4gICAgICAgICAgICAgICAgfSB0byAke21vc3RPdmVybGFwcGluZ0V4cHJlc3Npb24uaWR9YCApO1xyXG4gICAgICAgICAgICAgICAgbW9zdE92ZXJsYXBwaW5nRXhwcmVzc2lvbi5hZGRDb2luVGVybSggY29pblRlcm0gKTtcclxuICAgICAgICAgICAgICB9ICk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSB7XHJcblxyXG4gICAgICAgICAgICAgIC8vIFRoZSBkZXN0aW5hdGlvbiB3YXMgcmVhY2hlZCwgYnV0IHRoZSBleHByZXNzaW9uIHRoYXQgdGhpcyBvbmUgd2FzIGpvaW5pbmcgaGFzIG1vdmVkLCBzbyB0aGUgd2VkZGluZ1xyXG4gICAgICAgICAgICAgIC8vIGlzIG9mZi4gIElmIHRoaXMgb25lIGlzIG5vdyBvdXQgb2YgYm91bmRzLCBtb3ZlIGl0IHRvIGEgcmVhY2hhYmxlIHBvc2l0aW9uLlxyXG4gICAgICAgICAgICAgIGlmICggIXNlbGYucmV0cmlldmFsQm91bmRzLmludGVyc2VjdHNCb3VuZHMoIGFkZGVkRXhwcmVzc2lvbi5nZXRCb3VuZHMoKSApICkge1xyXG4gICAgICAgICAgICAgICAgYWRkZWRFeHByZXNzaW9uLnRyYXZlbFRvRGVzdGluYXRpb24oIHNlbGYuZ2V0T3BlbkV4cHJlc3Npb25QbGFjZW1lbnRQb3NpdGlvbiggYWRkZWRFeHByZXNzaW9uICkgKTtcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgYWRkZWRFeHByZXNzaW9uLmRlc3RpbmF0aW9uUmVhY2hlZEVtaXR0ZXIucmVtb3ZlTGlzdGVuZXIoIGRlc3RpbmF0aW9uUmVhY2hlZExpc3RlbmVyICk7XHJcbiAgICAgICAgICB9ICk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgaWYgKCBudW1PdmVybGFwcGluZ0NvaW5UZXJtcyA9PT0gMSApIHtcclxuXHJcbiAgICAgICAgICAvLyB0aGUgZXhwcmVzc2lvbiB3YXMgcmVsZWFzZWQgb3ZlciBhIGZyZWUgY29pbiB0ZXJtLCBzbyBoYXZlIHRoYXQgZnJlZSBjb2luIHRlcm0gam9pbiB0aGUgZXhwcmVzc2lvblxyXG4gICAgICAgICAgY29uc3QgY29pblRlcm1Ub0FkZFRvRXhwcmVzc2lvbiA9IGFkZGVkRXhwcmVzc2lvbi5ob3ZlcmluZ0NvaW5UZXJtc1sgMCBdO1xyXG4gICAgICAgICAgY29pblRlcm1Ub0FkZFRvRXhwcmVzc2lvbi5leHByZXNzaW9uUHJvcGVydHkuc2V0KCBhZGRlZEV4cHJlc3Npb24gKTsgLy8gcHJldmVudHMgaW50ZXJhY3Rpb24gZHVyaW5nIGFuaW1hdGlvblxyXG4gICAgICAgICAgaWYgKCBhZGRlZEV4cHJlc3Npb24ucmlnaHRIaW50QWN0aXZlUHJvcGVydHkuZ2V0KCkgKSB7XHJcblxyXG4gICAgICAgICAgICAvLyBtb3ZlIHRvIHRoZSBsZWZ0IHNpZGUgb2YgdGhlIGNvaW4gdGVybVxyXG4gICAgICAgICAgICBhZGRlZEV4cHJlc3Npb24udHJhdmVsVG9EZXN0aW5hdGlvbihcclxuICAgICAgICAgICAgICBjb2luVGVybVRvQWRkVG9FeHByZXNzaW9uLnBvc2l0aW9uUHJvcGVydHkuZ2V0KCkucGx1c1hZKFxyXG4gICAgICAgICAgICAgICAgLWFkZGVkRXhwcmVzc2lvbi53aWR0aFByb3BlcnR5LmdldCgpIC0gYWRkZWRFeHByZXNzaW9uLnJpZ2h0SGludFdpZHRoUHJvcGVydHkuZ2V0KCkgLyAyLFxyXG4gICAgICAgICAgICAgICAgLWFkZGVkRXhwcmVzc2lvbi5oZWlnaHRQcm9wZXJ0eS5nZXQoKSAvIDJcclxuICAgICAgICAgICAgICApXHJcbiAgICAgICAgICAgICk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBlbHNlIHtcclxuXHJcbiAgICAgICAgICAgIGFzc2VydCAmJiBhc3NlcnQoXHJcbiAgICAgICAgICAgICAgYWRkZWRFeHByZXNzaW9uLmxlZnRIaW50QWN0aXZlUHJvcGVydHkuZ2V0KCksXHJcbiAgICAgICAgICAgICAgJ2F0IGxlYXN0IG9uZSBoaW50IHNob3VsZCBiZSBhY3RpdmUgaWYgdGhlcmUgaXMgYSBob3ZlcmluZyBjb2luIHRlcm0nXHJcbiAgICAgICAgICAgICk7XHJcblxyXG4gICAgICAgICAgICAvLyBtb3ZlIHRvIHRoZSByaWdodCBzaWRlIG9mIHRoZSBjb2luIHRlcm1cclxuICAgICAgICAgICAgYWRkZWRFeHByZXNzaW9uLnRyYXZlbFRvRGVzdGluYXRpb24oXHJcbiAgICAgICAgICAgICAgY29pblRlcm1Ub0FkZFRvRXhwcmVzc2lvbi5wb3NpdGlvblByb3BlcnR5LmdldCgpLnBsdXNYWShcclxuICAgICAgICAgICAgICAgIGFkZGVkRXhwcmVzc2lvbi5sZWZ0SGludFdpZHRoUHJvcGVydHkuZ2V0KCkgLyAyLFxyXG4gICAgICAgICAgICAgICAgLWFkZGVkRXhwcmVzc2lvbi5oZWlnaHRQcm9wZXJ0eS5nZXQoKSAvIDJcclxuICAgICAgICAgICAgICApXHJcbiAgICAgICAgICAgICk7XHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgYWRkZWRFeHByZXNzaW9uLmRlc3RpbmF0aW9uUmVhY2hlZEVtaXR0ZXIuYWRkTGlzdGVuZXIoIGZ1bmN0aW9uIGFkZENvaW5UZXJtQWZ0ZXJBbmltYXRpb24oKSB7XHJcbiAgICAgICAgICAgIGFkZGVkRXhwcmVzc2lvbi5hZGRDb2luVGVybSggY29pblRlcm1Ub0FkZFRvRXhwcmVzc2lvbiApO1xyXG4gICAgICAgICAgICBhZGRlZEV4cHJlc3Npb24uZGVzdGluYXRpb25SZWFjaGVkRW1pdHRlci5yZW1vdmVMaXN0ZW5lciggYWRkQ29pblRlcm1BZnRlckFuaW1hdGlvbiApO1xyXG4gICAgICAgICAgfSApO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGFkZGVkRXhwcmVzc2lvbi51c2VyQ29udHJvbGxlZFByb3BlcnR5LmxhenlMaW5rKCBleHByZXNzaW9uVXNlckNvbnRyb2xsZWRMaXN0ZW5lciApO1xyXG5cclxuICAgIC8vIGFkZCBhIGxpc3RlbmVyIHRoYXQgd2lsbCBoYW5kbGUgcmVxdWVzdHMgdG8gYnJlYWsgYXBhcnQgdGhpcyBleHByZXNzaW9uXHJcbiAgICBmdW5jdGlvbiBleHByZXNzaW9uQnJlYWtBcGFydExpc3RlbmVyKCkge1xyXG5cclxuICAgICAgLy8ga2VlcCBhIHJlZmVyZW5jZSB0byB0aGUgY2VudGVyIGZvciB3aGVuIHdlIHNwcmVhZCBvdXQgdGhlIGNvaW4gdGVybXNcclxuICAgICAgY29uc3QgZXhwcmVzc2lvbkNlbnRlclggPSBhZGRlZEV4cHJlc3Npb24uZ2V0Qm91bmRzKCkuY2VudGVyWDtcclxuXHJcbiAgICAgIC8vIHJlbW92ZSB0aGUgY29pbiB0ZXJtcyBmcm9tIHRoZSBleHByZXNzaW9uIGFuZCB0aGUgZXhwcmVzc2lvbiBmcm9tIHRoZSBtb2RlbFxyXG4gICAgICBjb25zdCBuZXdseUZyZWVkQ29pblRlcm1zID0gYWRkZWRFeHByZXNzaW9uLnJlbW92ZUFsbENvaW5UZXJtcygpO1xyXG4gICAgICBzZWxmLmV4cHJlc3Npb25zLnJlbW92ZSggYWRkZWRFeHByZXNzaW9uICk7XHJcblxyXG4gICAgICAvLyBzcHJlYWQgdGhlIHJlbGVhc2VkIGNvaW4gdGVybXMgb3V0IGhvcml6b250YWxseVxyXG4gICAgICBuZXdseUZyZWVkQ29pblRlcm1zLmZvckVhY2goIG5ld2x5RnJlZWRDb2luVGVybSA9PiB7XHJcblxyXG4gICAgICAgIC8vIGNhbGN1bGF0ZSBhIGRlc3RpbmF0aW9uIHRoYXQgd2lsbCBjYXVzZSB0aGUgY29pbiB0ZXJtcyB0byBzcHJlYWQgb3V0IGZyb20gdGhlIGV4cHJlc3Npb24gY2VudGVyXHJcbiAgICAgICAgY29uc3QgaG9yaXpvbnRhbERpc3RhbmNlRnJvbUV4cHJlc3Npb25DZW50ZXIgPSBuZXdseUZyZWVkQ29pblRlcm0ucG9zaXRpb25Qcm9wZXJ0eS5nZXQoKS54IC0gZXhwcmVzc2lvbkNlbnRlclg7XHJcbiAgICAgICAgbGV0IGNvaW5UZXJtRGVzdGluYXRpb24gPSBuZXcgVmVjdG9yMihcclxuICAgICAgICAgIG5ld2x5RnJlZWRDb2luVGVybS5wb3NpdGlvblByb3BlcnR5LmdldCgpLnggKyBob3Jpem9udGFsRGlzdGFuY2VGcm9tRXhwcmVzc2lvbkNlbnRlciAqIDAuMTUsIC8vIHNwcmVhZCBmYWN0b3IgZW1waXJpY2FsbHkgZGV0ZXJtaW5lZFxyXG4gICAgICAgICAgbmV3bHlGcmVlZENvaW5UZXJtLnBvc2l0aW9uUHJvcGVydHkuZ2V0KCkueVxyXG4gICAgICAgICk7XHJcblxyXG4gICAgICAgIC8vIGlmIHRoZSBkZXN0aW5hdGlvbiBpcyBvdXRzaWRlIG9mIHRoZSBhbGxvd2VkIGJvdW5kcywgY2hhbmdlIGl0IHRvIGJlIGluIGJvdW5kc1xyXG4gICAgICAgIGlmICggIXNlbGYucmV0cmlldmFsQm91bmRzLmNvbnRhaW5zUG9pbnQoIGNvaW5UZXJtRGVzdGluYXRpb24gKSApIHtcclxuICAgICAgICAgIGNvaW5UZXJtRGVzdGluYXRpb24gPSBzZWxmLmdldE5leHRPcGVuUmV0cmlldmFsU3BvdCgpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gaW5pdGlhdGUgdGhlIGFuaW1hdGlvblxyXG4gICAgICAgIG5ld2x5RnJlZWRDb2luVGVybS50cmF2ZWxUb0Rlc3RpbmF0aW9uKCBjb2luVGVybURlc3RpbmF0aW9uICk7XHJcbiAgICAgIH0gKTtcclxuICAgIH1cclxuXHJcbiAgICBhZGRlZEV4cHJlc3Npb24uYnJlYWtBcGFydEVtaXR0ZXIuYWRkTGlzdGVuZXIoIGV4cHJlc3Npb25CcmVha0FwYXJ0TGlzdGVuZXIgKTtcclxuXHJcbiAgICAvLyBhZGQgYSBsaXN0ZW5lciB0aGF0IHdpbGwgaGFuZGxlIHJlcXVlc3RzIHRvIGVkaXQgdGhpcyBleHByZXNzaW9uXHJcbiAgICBmdW5jdGlvbiBlZGl0TW9kZUxpc3RlbmVyKCBpbkVkaXRNb2RlICkge1xyXG4gICAgICBpZiAoIGluRWRpdE1vZGUgKSB7XHJcbiAgICAgICAgc2VsZi5leHByZXNzaW9uQmVpbmdFZGl0ZWRQcm9wZXJ0eS5zZXQoIGFkZGVkRXhwcmVzc2lvbiApO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgYWRkZWRFeHByZXNzaW9uLmluRWRpdE1vZGVQcm9wZXJ0eS5saW5rKCBlZGl0TW9kZUxpc3RlbmVyICk7XHJcblxyXG4gICAgLy8gcmVtb3ZlIHRoZSBsaXN0ZW5lcnMgd2hlbiB0aGlzIGV4cHJlc3Npb24gaXMgcmVtb3ZlZFxyXG4gICAgdGhpcy5leHByZXNzaW9ucy5hZGRJdGVtUmVtb3ZlZExpc3RlbmVyKCBmdW5jdGlvbiBleHByZXNzaW9uUmVtb3ZlZExpc3RlbmVyKCByZW1vdmVkRXhwcmVzc2lvbiApIHtcclxuICAgICAgaWYgKCByZW1vdmVkRXhwcmVzc2lvbiA9PT0gYWRkZWRFeHByZXNzaW9uICkge1xyXG4gICAgICAgIGFkZGVkRXhwcmVzc2lvbi5kaXNwb3NlKCk7XHJcbiAgICAgICAgYWRkZWRFeHByZXNzaW9uLnVzZXJDb250cm9sbGVkUHJvcGVydHkudW5saW5rKCBleHByZXNzaW9uVXNlckNvbnRyb2xsZWRMaXN0ZW5lciApO1xyXG4gICAgICAgIGFkZGVkRXhwcmVzc2lvbi5icmVha0FwYXJ0RW1pdHRlci5yZW1vdmVMaXN0ZW5lciggZXhwcmVzc2lvbkJyZWFrQXBhcnRMaXN0ZW5lciApO1xyXG4gICAgICAgIGFkZGVkRXhwcmVzc2lvbi5pbkVkaXRNb2RlUHJvcGVydHkudW5saW5rKCBlZGl0TW9kZUxpc3RlbmVyICk7XHJcbiAgICAgICAgc2VsZi5leHByZXNzaW9ucy5yZW1vdmVJdGVtUmVtb3ZlZExpc3RlbmVyKCBleHByZXNzaW9uUmVtb3ZlZExpc3RlbmVyICk7XHJcbiAgICAgIH1cclxuICAgIH0gKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICByZXNldCgpIHtcclxuXHJcbiAgICAvLyByZXNldCBhbnkgY29sbGVjdGlvbiBhcmVhcyB0aGF0IGhhdmUgYmVlbiBjcmVhdGVkXHJcbiAgICB0aGlzLmNvbGxlY3Rpb25BcmVhcy5mb3JFYWNoKCBjb2xsZWN0aW9uQXJlYSA9PiB7XHJcbiAgICAgIGNvbGxlY3Rpb25BcmVhLnJlc2V0KCk7XHJcbiAgICB9ICk7XHJcblxyXG4gICAgdGhpcy5leHByZXNzaW9ucy5jbGVhcigpO1xyXG4gICAgdGhpcy5jb2luVGVybXMuY2xlYXIoKTtcclxuICAgIHRoaXMudmlld01vZGVQcm9wZXJ0eS5yZXNldCgpO1xyXG4gICAgdGhpcy5zaG93Q29pblZhbHVlc1Byb3BlcnR5LnJlc2V0KCk7XHJcbiAgICB0aGlzLnNob3dWYXJpYWJsZVZhbHVlc1Byb3BlcnR5LnJlc2V0KCk7XHJcbiAgICB0aGlzLnNob3dBbGxDb2VmZmljaWVudHNQcm9wZXJ0eS5yZXNldCgpO1xyXG4gICAgdGhpcy54VGVybVZhbHVlUHJvcGVydHkucmVzZXQoKTtcclxuICAgIHRoaXMueVRlcm1WYWx1ZVByb3BlcnR5LnJlc2V0KCk7XHJcbiAgICB0aGlzLnpUZXJtVmFsdWVQcm9wZXJ0eS5yZXNldCgpO1xyXG4gICAgdGhpcy50b3RhbFZhbHVlUHJvcGVydHkucmVzZXQoKTtcclxuICAgIHRoaXMuZXhwcmVzc2lvbkJlaW5nRWRpdGVkUHJvcGVydHkucmVzZXQoKTtcclxuICAgIHRoaXMuc2ltcGxpZnlOZWdhdGl2ZXNQcm9wZXJ0eS5yZXNldCgpO1xyXG4gICAgXy52YWx1ZXMoIHRoaXMuY29pblRlcm1Db3VudHMgKS5mb3JFYWNoKCBjb2luVGVybUNvdW50QXJyYXkgPT4ge1xyXG4gICAgICBjb2luVGVybUNvdW50QXJyYXkuZm9yRWFjaCggY29pblRlcm1Db3VudE9iamVjdCA9PiB7XHJcbiAgICAgICAgY29pblRlcm1Db3VudE9iamVjdC5jb3VudCA9IDA7XHJcbiAgICAgICAgY29pblRlcm1Db3VudE9iamVjdC5jb3VudFByb3BlcnR5ICYmIGNvaW5UZXJtQ291bnRPYmplY3QuY291bnRQcm9wZXJ0eS5yZXNldCgpO1xyXG4gICAgICB9ICk7XHJcbiAgICB9ICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiB0ZXN0IGlmIGNvaW5UZXJtQiBpcyBpbiB0aGUgXCJleHByZXNzaW9uIGNvbWJpbmUgem9uZVwiIG9mIGNvaW5UZXJtQVxyXG4gICAqIEBwYXJhbSB7Q29pblRlcm19IGNvaW5UZXJtQVxyXG4gICAqIEBwYXJhbSB7Q29pblRlcm19IGNvaW5UZXJtQlxyXG4gICAqIEByZXR1cm5zIHtib29sZWFufVxyXG4gICAqIEBwcml2YXRlXHJcbiAgICovXHJcbiAgaXNDb2luVGVybUluRXhwcmVzc2lvbkNvbWJpbmVab25lKCBjb2luVGVybUEsIGNvaW5UZXJtQiApIHtcclxuXHJcbiAgICAvLyBNYWtlIHRoZSBjb21iaW5lIHpvbmUgd2lkZXIsIGJ1dCB2ZXJ0aWNhbGx5IHNob3J0ZXIsIHRoYW4gdGhlIGFjdHVhbCBib3VuZHMsIGFzIHRoaXMgZ2l2ZXMgdGhlIG1vc3QgZGVzaXJhYmxlXHJcbiAgICAvLyBiZWhhdmlvci4gIFRoZSBtdWx0aXBsaWVyIGZvciB0aGUgaGVpZ2h0IHdhcyBlbXBpcmljYWxseSBkZXRlcm1pbmVkLlxyXG4gICAgY29uc3QgZXh0ZW5kZWRUYXJnZXRDb2luVGVybUJvdW5kcyA9IGNvaW5UZXJtQS5nZXRWaWV3Qm91bmRzKCkuZGlsYXRlZFhZKFxyXG4gICAgICBjb2luVGVybUEubG9jYWxWaWV3Qm91bmRzUHJvcGVydHkuZ2V0KCkud2lkdGgsXHJcbiAgICAgIC1jb2luVGVybUEubG9jYWxWaWV3Qm91bmRzUHJvcGVydHkuZ2V0KCkuaGVpZ2h0ICogMC4yNVxyXG4gICAgKTtcclxuXHJcbiAgICByZXR1cm4gZXh0ZW5kZWRUYXJnZXRDb2luVGVybUJvdW5kcy5pbnRlcnNlY3RzQm91bmRzKCBjb2luVGVybUIuZ2V0Vmlld0JvdW5kcygpICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiByZXR1cm5zIHRydWUgaWYgY29pbiB0ZXJtIGlzIGN1cnJlbnRseSBwYXJ0IG9mIGFuIGV4cHJlc3Npb25cclxuICAgKiBAcGFyYW0ge0NvaW5UZXJtfSBjb2luVGVybVxyXG4gICAqIEByZXR1cm5zIHtib29sZWFufVxyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICBpc0NvaW5UZXJtSW5FeHByZXNzaW9uKCBjb2luVGVybSApIHtcclxuICAgIGZvciAoIGxldCBpID0gMDsgaSA8IHRoaXMuZXhwcmVzc2lvbnMubGVuZ3RoOyBpKysgKSB7XHJcbiAgICAgIGlmICggdGhpcy5leHByZXNzaW9ucy5nZXQoIGkgKS5jb250YWluc0NvaW5UZXJtKCBjb2luVGVybSApICkge1xyXG4gICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICByZXR1cm4gZmFsc2U7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBDaGVjayBmb3IgY29pbiB0ZXJtcyB0aGF0IGFyZSBub3QgYWxyZWFkeSBpbiBleHByZXNzaW9ucyB0aGF0IGFyZSBwb3NpdGlvbmVkIHN1Y2ggdGhhdCB0aGV5IGNvdWxkIGNvbWJpbmUgd2l0aFxyXG4gICAqIHRoZSBwcm92aWRlZCBjb2luIGludG8gYSBuZXcgZXhwcmVzc2lvbi4gIElmIG1vcmUgdGhhbiBvbmUgcG9zc2liaWxpdHkgZXhpc3RzLCB0aGUgY2xvc2VzdCBpcyByZXR1cm5lZC4gIElmIG5vbmVcclxuICAgKiBhcmUgZm91bmQsIG51bGwgaXMgcmV0dXJuZWQuXHJcbiAgICogQHBhcmFtIHtDb2luVGVybX0gdGhpc0NvaW5UZXJtXHJcbiAgICogQHJldHVybnMge0NvaW5UZXJtfG51bGx9XHJcbiAgICogQHByaXZhdGVcclxuICAgKi9cclxuICBjaGVja0ZvckpvaW5hYmxlRnJlZUNvaW5UZXJtKCB0aGlzQ29pblRlcm0gKSB7XHJcblxyXG4gICAgbGV0IGpvaW5hYmxlRnJlZUNvaW5UZXJtID0gbnVsbDtcclxuICAgIHRoaXMuY29pblRlcm1zLmZvckVhY2goIHRoYXRDb2luVGVybSA9PiB7XHJcblxyXG4gICAgICAvLyBPa2F5LCB0aGlzIGlzIG9uZSBuYXN0eSBsb29raW5nICdpZicgY2xhdXNlLCBidXQgdGhlIGJhc2ljIGlkZWEgaXMgdGhhdCBmaXJzdCBhIGJ1bmNoIG9mIGNvbmRpdGlvbnMgYXJlXHJcbiAgICAgIC8vIGNoZWNrZWQgdGhhdCB3b3VsZCBleGNsdWRlIHRoZSBwcm92aWRlZCBjb2luIHRlcm1zIGZyb20gam9pbmluZywgdGhlbiBpdCBjaGVja3MgdG8gc2VlIGlmIHRoZSBjb2luIHRlcm0gaXNcclxuICAgICAgLy8gaW4gdGhlICdqb2luIHpvbmUnLCBhbmQgdGhlbiBjaGVja3MgdGhhdCBpdCdzIGNsb3NlciB0aGFuIGFueSBwcmV2aW91c2x5IGZvdW5kIGpvaW5hYmxlIGNvaW4gdGVybS5cclxuICAgICAgaWYgKCB0aGF0Q29pblRlcm0gIT09IHRoaXNDb2luVGVybSAmJiAvLyBleGNsdWRlIHRoaXNDb2luVGVybVxyXG4gICAgICAgICAgICF0aGF0Q29pblRlcm0udXNlckNvbnRyb2xsZWRQcm9wZXJ0eS5nZXQoKSAmJiAvLyBleGNsdWRlIGNvaW4gdGVybXMgdGhhdCBhcmUgdXNlciBjb250cm9sbGVkXHJcbiAgICAgICAgICAgdGhhdENvaW5UZXJtLmV4cHJlc3Npb25Qcm9wZXJ0eS5nZXQoKSA9PT0gbnVsbCAmJiAvLyBleGNsdWRlIGNvaW4gdGVybXMgdGhhdCBhcmUgaW4gb3IgYXJlIGpvaW5pbmcgZXhwcmVzc2lvbnNcclxuICAgICAgICAgICAhdGhhdENvaW5UZXJtLmNvbGxlY3RlZFByb3BlcnR5LmdldCgpICYmIC8vIGV4Y2x1ZGUgY29pbiB0ZXJtcyB0aGF0IGFyZSBpbiBhIGNvbGxlY3Rpb25cclxuICAgICAgICAgICAhdGhhdENvaW5UZXJtLmluUHJvZ3Jlc3NBbmltYXRpb25Qcm9wZXJ0eS5nZXQoKSAmJiAvLyBleGNsdWRlIGNvaW4gdGVybXMgdGhhdCBhcmUgbW92aW5nXHJcbiAgICAgICAgICAgdGhpcy5pc0NvaW5UZXJtSW5FeHByZXNzaW9uQ29tYmluZVpvbmUoIHRoYXRDb2luVGVybSwgdGhpc0NvaW5UZXJtICkgJiYgLy8gaW4gdGhlICdjb21iaW5lIHpvbmUnXHJcbiAgICAgICAgICAgKCAham9pbmFibGVGcmVlQ29pblRlcm0gfHxcclxuICAgICAgICAgICAgICggam9pbmFibGVGcmVlQ29pblRlcm0ucG9zaXRpb25Qcm9wZXJ0eS5nZXQoKS5kaXN0YW5jZSggdGhhdENvaW5UZXJtICkgPFxyXG4gICAgICAgICAgICAgICBqb2luYWJsZUZyZWVDb2luVGVybS5wb3NpdGlvblByb3BlcnR5LmdldCgpLmRpc3RhbmNlKCB0aGlzQ29pblRlcm0gKSApICkgKSB7XHJcblxyXG4gICAgICAgIGpvaW5hYmxlRnJlZUNvaW5UZXJtID0gdGhhdENvaW5UZXJtO1xyXG4gICAgICB9XHJcbiAgICB9ICk7XHJcblxyXG4gICAgcmV0dXJuIGpvaW5hYmxlRnJlZUNvaW5UZXJtO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogZ2V0IHRoZSBhbW91bnQgb2Ygb3ZlcmxhcCBnaXZlbiB0d28gY29pbiB0ZXJtcyBieSBjb21wYXJpbmcgcG9zaXRpb24gYW5kIGNvaW4gcmFkaXVzXHJcbiAgICogQHBhcmFtIHtDb2luVGVybX0gY29pblRlcm1BXHJcbiAgICogQHBhcmFtIHtDb2luVGVybX0gY29pblRlcm1CXHJcbiAgICogQHJldHVybnMge251bWJlcn1cclxuICAgKiBAcHJpdmF0ZVxyXG4gICAqL1xyXG4gIGdldENvaW5PdmVybGFwQW1vdW50KCBjb2luVGVybUEsIGNvaW5UZXJtQiApIHtcclxuICAgIGNvbnN0IGRpc3RhbmNlQmV0d2VlbkNlbnRlcnMgPSBjb2luVGVybUEucG9zaXRpb25Qcm9wZXJ0eS5nZXQoKS5kaXN0YW5jZSggY29pblRlcm1CLnBvc2l0aW9uUHJvcGVydHkuZ2V0KCkgKTtcclxuICAgIHJldHVybiBNYXRoLm1heCggKCBjb2luVGVybUEuY29pblJhZGl1cyArIGNvaW5UZXJtQi5jb2luUmFkaXVzICkgLSBkaXN0YW5jZUJldHdlZW5DZW50ZXJzLCAwICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBnZXQgdGhlIGFtb3VudCBvZiBvdmVybGFwIGJldHdlZW4gdGhlIHZpZXcgcmVwcmVzZW50YXRpb25zIG9mIHR3byBjb2luIHRlcm1zXHJcbiAgICogQHBhcmFtIHtDb2luVGVybX0gY29pblRlcm1BXHJcbiAgICogQHBhcmFtIHtDb2luVGVybX0gY29pblRlcm1CXHJcbiAgICogQHJldHVybnMge251bWJlcn0gYW1vdW50IG9mIG92ZXJsYXAsIHdoaWNoIGlzIGVzc2VudGlhbGx5IGFuIGFyZWEgdmFsdWUgaW4gdmlldyBjb29yZGluYXRlc1xyXG4gICAqIEBwcml2YXRlXHJcbiAgICovXHJcbiAgZ2V0Vmlld0JvdW5kc092ZXJsYXBBbW91bnQoIGNvaW5UZXJtQSwgY29pblRlcm1CICkge1xyXG4gICAgbGV0IG92ZXJsYXAgPSAwO1xyXG5cclxuICAgIGlmICggY29pblRlcm1BLmdldFZpZXdCb3VuZHMoKS5pbnRlcnNlY3RzQm91bmRzKCBjb2luVGVybUIuZ2V0Vmlld0JvdW5kcygpICkgKSB7XHJcbiAgICAgIGNvbnN0IGludGVyc2VjdGlvbiA9IGNvaW5UZXJtQS5nZXRWaWV3Qm91bmRzKCkuaW50ZXJzZWN0aW9uKCBjb2luVGVybUIuZ2V0Vmlld0JvdW5kcygpICk7XHJcbiAgICAgIG92ZXJsYXAgPSBpbnRlcnNlY3Rpb24ud2lkdGggKiBpbnRlcnNlY3Rpb24uaGVpZ2h0O1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIG92ZXJsYXA7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBnZXQgdGhlIGNvaW4gdGVybSB0aGF0IG92ZXJsYXBzIHRoZSBtb3N0IHdpdGggdGhlIHByb3ZpZGVkIGNvaW4gdGVybSwgaXMgb2YgdGhlIHNhbWUgdHlwZSwgaXMgbm90IHVzZXJcclxuICAgKiBjb250cm9sbGVkLCBhbmQgaXMgbm90IGFscmVhZHkgaW4gYW4gZXhwcmVzc2lvblxyXG4gICAqIEBwYXJhbSB7Q29pblRlcm19IHRoaXNDb2luVGVybVxyXG4gICAqIEByZXR1cm5zIHtDb2luVGVybX1cclxuICAgKiBAcHJpdmF0ZVxyXG4gICAqL1xyXG4gIGdldE1vc3RPdmVybGFwcGluZ0xpa2VDb2luVGVybSggdGhpc0NvaW5UZXJtICkge1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdGhpcy5jb2luVGVybXMuaW5jbHVkZXMoIHRoaXNDb2luVGVybSApLCAnb3ZlcmxhcCByZXF1ZXN0ZWQgZm9yIHNvbWV0aGluZyB0aGF0IGlzIG5vdCBpbiBtb2RlbCcgKTtcclxuICAgIGxldCBtb3N0T3ZlcmxhcHBpbmdMaWtlQ29pblRlcm0gPSBudWxsO1xyXG4gICAgbGV0IG1heE92ZXJsYXBBbW91bnQgPSAwO1xyXG5cclxuICAgIHRoaXMuY29pblRlcm1zLmZvckVhY2goIHRoYXRDb2luVGVybSA9PiB7XHJcblxyXG4gICAgICAvLyB0ZXN0IHRoYXQgdGhlIGNvaW4gdGVybSBpcyBlbGlnaWJsZSBmb3IgY29uc2lkZXJhdGlvbiBmaXJzdFxyXG4gICAgICBpZiAoIHRoYXRDb2luVGVybS5pc0VsaWdpYmxlVG9Db21iaW5lV2l0aCggdGhpc0NvaW5UZXJtICkgJiYgIXRoaXMuaXNDb2luVGVybUluRXhwcmVzc2lvbiggdGhhdENvaW5UZXJtICkgKSB7XHJcblxyXG4gICAgICAgIC8vIGNhbGN1bGF0ZSBhbmQgY29tcGFyZSB0aGUgcmVsYXRpdmUgb3ZlcmxhcCBhbW91bnRzLCBkb25lIGEgYml0IGRpZmZlcmVudGx5IGluIHRoZSBkaWZmZXJlbnQgdmlldyBtb2Rlc1xyXG4gICAgICAgIGxldCBvdmVybGFwQW1vdW50O1xyXG4gICAgICAgIGlmICggdGhpcy52aWV3TW9kZVByb3BlcnR5LmdldCgpID09PSBWaWV3TW9kZS5DT0lOUyApIHtcclxuICAgICAgICAgIG92ZXJsYXBBbW91bnQgPSB0aGlzLmdldENvaW5PdmVybGFwQW1vdW50KCB0aGlzQ29pblRlcm0sIHRoYXRDb2luVGVybSApO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgIG92ZXJsYXBBbW91bnQgPSB0aGlzLmdldFZpZXdCb3VuZHNPdmVybGFwQW1vdW50KCB0aGlzQ29pblRlcm0sIHRoYXRDb2luVGVybSApO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKCBvdmVybGFwQW1vdW50ID4gbWF4T3ZlcmxhcEFtb3VudCApIHtcclxuICAgICAgICAgIG1heE92ZXJsYXBBbW91bnQgPSBvdmVybGFwQW1vdW50O1xyXG4gICAgICAgICAgbW9zdE92ZXJsYXBwaW5nTGlrZUNvaW5UZXJtID0gdGhhdENvaW5UZXJtO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfSApO1xyXG4gICAgcmV0dXJuIG1vc3RPdmVybGFwcGluZ0xpa2VDb2luVGVybTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwYXJhbSB7Q29pblRlcm19IGNvaW5UZXJtXHJcbiAgICogQHBhcmFtIHtFeHByZXNzaW9ufSBleHByZXNzaW9uXHJcbiAgICogQHJldHVybnMge0NvaW5UZXJtfG51bGx9XHJcbiAgICogQHByaXZhdGVcclxuICAgKi9cclxuICBnZXRPdmVybGFwcGluZ0xpa2VDb2luVGVybVdpdGhpbkV4cHJlc3Npb24oIGNvaW5UZXJtLCBleHByZXNzaW9uICkge1xyXG5cclxuICAgIGxldCBvdmVybGFwcGluZ0NvaW5UZXJtID0gbnVsbDtcclxuXHJcbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCBleHByZXNzaW9uLmNvaW5UZXJtcy5sZW5ndGg7IGkrKyApIHtcclxuICAgICAgY29uc3QgcG90ZW50aWFsbHlPdmVybGFwcGluZ0NvaW5UZXJtID0gZXhwcmVzc2lvbi5jb2luVGVybXMuZ2V0KCBpICk7XHJcbiAgICAgIGlmICggcG90ZW50aWFsbHlPdmVybGFwcGluZ0NvaW5UZXJtLmlzRWxpZ2libGVUb0NvbWJpbmVXaXRoKCBjb2luVGVybSApICkge1xyXG4gICAgICAgIGxldCBvdmVybGFwQW1vdW50ID0gMDtcclxuICAgICAgICBpZiAoIHRoaXMudmlld01vZGVQcm9wZXJ0eS5nZXQoKSA9PT0gVmlld01vZGUuQ09JTlMgKSB7XHJcbiAgICAgICAgICBvdmVybGFwQW1vdW50ID0gdGhpcy5nZXRDb2luT3ZlcmxhcEFtb3VudCggY29pblRlcm0sIHBvdGVudGlhbGx5T3ZlcmxhcHBpbmdDb2luVGVybSApO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgIG92ZXJsYXBBbW91bnQgPSB0aGlzLmdldFZpZXdCb3VuZHNPdmVybGFwQW1vdW50KCBjb2luVGVybSwgcG90ZW50aWFsbHlPdmVybGFwcGluZ0NvaW5UZXJtICk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICggb3ZlcmxhcEFtb3VudCA+IDAgKSB7XHJcbiAgICAgICAgICBvdmVybGFwcGluZ0NvaW5UZXJtID0gcG90ZW50aWFsbHlPdmVybGFwcGluZ0NvaW5UZXJtO1xyXG4gICAgICAgICAgLy8gc2luY2UgdGhpcyBpcyBhbiBleHByZXNzaW9uLCB0aGVyZSBzaG91bGQgYmUgYSBtYXggb2Ygb25lIG92ZXJsYXBwaW5nIGNvaW4gdGVybSwgc28gd2UgY2FuIGJhaWwgaGVyZVxyXG4gICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICByZXR1cm4gb3ZlcmxhcHBpbmdDb2luVGVybTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwYXJhbSB7Qm91bmRzMn0gYm91bmRzXHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIHNldFJldHJpZXZhbEJvdW5kcyggYm91bmRzICkge1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdGhpcy5yZXRyaWV2YWxCb3VuZHMgPT09IEJvdW5kczIuRVZFUllUSElORywgJ2NvaW4gdGVybSBib3VuZHMgc2hvdWxkIG9ubHkgYmUgc2V0IG9uY2UnICk7XHJcbiAgICB0aGlzLnJldHJpZXZhbEJvdW5kcyA9IGJvdW5kcztcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIHJldHVybnMgdHJ1ZSBpcyBhbnkgZXhwcmVzc2lvbiBvciBjb2luIHRlcm0gaXMgY3VycmVudGx5IHVzZXIgY29udHJvbGxlZCwgaGVscGZ1bCBpbiBwcmV2ZW50aW5nIG11bHRpLXRvdWNoXHJcbiAgICogaXNzdWVzXHJcbiAgICogQHJldHVybnMge2Jvb2xlYW59XHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIGlzQW55dGhpbmdVc2VyQ29udHJvbGxlZCgpIHtcclxuICAgIGxldCBzb21ldGhpbmdJc1VzZXJDb250cm9sbGVkID0gZmFsc2U7XHJcbiAgICBsZXQgaTtcclxuICAgIGZvciAoIGkgPSAwOyBpIDwgdGhpcy5jb2luVGVybXMubGVuZ3RoICYmICFzb21ldGhpbmdJc1VzZXJDb250cm9sbGVkOyBpKysgKSB7XHJcbiAgICAgIGlmICggdGhpcy5jb2luVGVybXMuZ2V0KCBpICkudXNlckNvbnRyb2xsZWRQcm9wZXJ0eS5nZXQoKSApIHtcclxuICAgICAgICBzb21ldGhpbmdJc1VzZXJDb250cm9sbGVkID0gdHJ1ZTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgZm9yICggaSA9IDA7IGkgPCB0aGlzLmV4cHJlc3Npb25zLmxlbmd0aCAmJiAhc29tZXRoaW5nSXNVc2VyQ29udHJvbGxlZDsgaSsrICkge1xyXG4gICAgICBpZiAoIHRoaXMuZXhwcmVzc2lvbnMuZ2V0KCBpICkudXNlckNvbnRyb2xsZWRQcm9wZXJ0eS5nZXQoKSApIHtcclxuICAgICAgICBzb21ldGhpbmdJc1VzZXJDb250cm9sbGVkID0gdHJ1ZTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIHNvbWV0aGluZ0lzVXNlckNvbnRyb2xsZWQ7XHJcbiAgfVxyXG59XHJcblxyXG5leHByZXNzaW9uRXhjaGFuZ2UucmVnaXN0ZXIoICdFeHByZXNzaW9uTWFuaXB1bGF0aW9uTW9kZWwnLCBFeHByZXNzaW9uTWFuaXB1bGF0aW9uTW9kZWwgKTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IEV4cHJlc3Npb25NYW5pcHVsYXRpb25Nb2RlbDtcclxuIl0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLHFCQUFxQixNQUFNLDhDQUE4QztBQUNoRixPQUFPQyxTQUFTLE1BQU0sa0NBQWtDO0FBQ3hELE9BQU9DLFFBQVEsTUFBTSxpQ0FBaUM7QUFDdEQsT0FBT0MsY0FBYyxNQUFNLHVDQUF1QztBQUNsRSxPQUFPQyxPQUFPLE1BQU0sK0JBQStCO0FBQ25ELE9BQU9DLFNBQVMsTUFBTSxpQ0FBaUM7QUFDdkQsT0FBT0MsT0FBTyxNQUFNLCtCQUErQjtBQUNuRCxPQUFPQyxLQUFLLE1BQU0sbUNBQW1DO0FBQ3JELE9BQU9DLGtCQUFrQixNQUFNLDZCQUE2QjtBQUM1RCxPQUFPQyxpQkFBaUIsTUFBTSx5QkFBeUI7QUFDdkQsT0FBT0Msc0JBQXNCLE1BQU0sbUNBQW1DO0FBQ3RFLE9BQU9DLGNBQWMsTUFBTSwyQkFBMkI7QUFDdEQsT0FBT0MsUUFBUSxNQUFNLHFCQUFxQjtBQUMxQyxPQUFPQyxlQUFlLE1BQU0sc0JBQXNCO0FBQ2xELE9BQU9DLFVBQVUsTUFBTSxpQkFBaUI7QUFDeEMsT0FBT0MsY0FBYyxNQUFNLHFCQUFxQjs7QUFFaEQ7QUFDQSxNQUFNQyxtQkFBbUIsR0FBRyxFQUFFO0FBQzlCLE1BQU1DLDhCQUE4QixHQUFHLEdBQUc7QUFDMUMsTUFBTUMsOEJBQThCLEdBQUcsRUFBRTtBQUN6QyxNQUFNQyxrQ0FBa0MsR0FBRyxJQUFJYixPQUFPLENBQUUsR0FBRyxFQUFFLEVBQUcsQ0FBQyxDQUFDLENBQUM7QUFDbkUsTUFBTWMsK0JBQStCLEdBQUcsQ0FBQztBQUN6QyxNQUFNQyxnQ0FBZ0MsR0FBRyxFQUFFLENBQUMsQ0FBQzs7QUFFN0MsTUFBTUMsMkJB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