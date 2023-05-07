## Implementation notes for least-squares-regression

For this simulation, multiple dataSets are defined in DataSet. The bounds of the graph in the model
is defined a square with sides equal to one located at the origin. All the calculations involving
dataSets uses renormalized (x,y) dataPoints there x and y ranges from 0 to 1. As a result, we use
a single modelViewTransform for the Graph and GraphNode for all dataSets. This leads to several simplifications:

1. the range for the sliders remain constants throughout the simulations since their range is given in terms of
the bounds of the graph.

2. the calculations for the position the bounds of the square residuals are greatly simplified since the x and
using y directions scale is a similar way.

3. the positioning of the dataPoints with respect to the bucket is simplified.

4. the barometer chart showing the sum of the squared residual uses a single rescaling factor throughout the
simulation to go form the model to the view.

There are two complications that arise from using a modelViewTransform with a unit square for the graph.
The calculation of the slope and the intercept are given in terms of this reference frame. In Graph,
a multiplicative factor is given to rescale the slope and intercept in the proper units of the dataSet.
This can be used to display the appropriate slope and intercept in the control panel. It is worth noting in passing
that the pearson correlation coefficient is invariant under rescaling. The graph axes, ticks, labels, and grid are
laid out separately and use a modelViewTransform that reflects the range (unrenormalized) of the X and Y dataSet.

The dataPoints are stored in an observable array that control the coming and going of data Points. The view is
responsible for the visual aspects of the dataPoints. Since the dataPoints may be user controlled, a second array,
dataPointsOnGraph, is defined and contains all the dataPoints that are overlapping with the graph. All statistical
properties, including residuals, are based on the dataPoints contained in dataPointsOnGraph. The model contains
two additional Observable Arrays, myLineResiduals, and bestFitLineResiduals. There is not necessarily a one to
one correspondence between the number of dataPoints on graph and the number of residuals. Special care must
be taken when only one dataPoint is on the graph. All the logic for the residuals is handled in the graph model.
The ResidualLineAndSquareNode merely handles the view for a line residual and a squared residual.

The slider for the slope does not control the slope directly since it is not a friendly user interaction.
Instead the slider property for the slope is the angle of the slope. Mathematically. there is a one-to-one correspondence
between the two variables.


