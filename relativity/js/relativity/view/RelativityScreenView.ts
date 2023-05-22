// Copyright 2023, University of Colorado Boulder

/**
 * TODO Describe this class and its responsibilities.
 *
 * @author Zijian Wang
 */

import ScreenView, {ScreenViewOptions} from '../../../../joist/js/ScreenView.js';
import ResetAllButton from '../../../../scenery-phet/js/buttons/ResetAllButton.js';
import RelativityConstants from '../../common/RelativityConstants.js';
import relativity from '../../relativity.js';
import RelativityModel from '../model/RelativityModel.js';
import optionize from '../../../../phet-core/js/optionize.js';
import PlaneView from "./PlaneView.js";
import {Rectangle, Node, Text} from "../../../../scenery/js/imports.js";
import XAxisView from "./XAxisView.js";
import ControlPanelView from "./ControlPanelView.js";
import Matrix3 from "../../../../dot/js/Matrix3.js";
import EarthView from "./EarthView.js";
import LorentzPanelView from "./LorentzPanel.js";
import HintPanelView from "./HintPanelView.js";

type SelfOptions = {
    //TODO add options that are specific to RelativityScreenView here
};

type RelativityScreenViewOptions = SelfOptions & ScreenViewOptions;

export default class RelativityScreenView extends ScreenView {
    private readonly controlPanel: ControlPanelView;

    private nodeA: Node = new Node();
    private nodeB: Node = new Node();
    private matA = new Matrix3();
    private matB = new Matrix3();

    private tA: Text[] = [];
    private tB: Text[] = [];
    private tSpace_shuttle = 0
    private tEarth = 0
    private vScala = 30;
    private unitSpace = 80
    private planeView = new PlaneView()
    private earthView = new EarthView()
    private x0=0
    private y0=0
    private distance = 0

    public constructor(model: RelativityModel, providedOptions: RelativityScreenViewOptions) {

        const options = optionize<RelativityScreenViewOptions, SelfOptions, ScreenViewOptions>()({
            //TODO add default values for optional SelfOptions here
            //TODO add default values for optional ScreenViewOptions here
        }, providedOptions);

        super(options);
        this.x0 = this.layoutBounds.centerX
        this.y0 = this.layoutBounds.centerY

        const TIME_FONT = 16;
        this.addChild(new Rectangle(1, 1, this.layoutBounds.width, this.layoutBounds.height, {fill: 'rgb( 222, 222, 222 )'})) //test layout

        this.nodeA.addChild(this.planeView);
        this.nodeB.addChild(this.earthView);

        //add Watch A
        for (let i = -5; i <= 5; i += 1) {
            const t = new Text("0.00", {centerX: i * this.unitSpace, centerY: -4 * TIME_FONT, fontSize: TIME_FONT});
            this.tA.push(t);
            this.nodeA.addChild(t)
            this.nodeA.addChild(new Text(i, {
                centerX: i * this.unitSpace,
                centerY: 20,
                fontSize: TIME_FONT
            }));
        }
        this.nodeA.addChild(new Text("t' /s =", {
            right: -5 * this.unitSpace - 24,
            centerY: -4 * TIME_FONT,
            fontSize: TIME_FONT
        }))
        this.nodeA.addChild(new Text("x' /ls =", {
            right: -5 * this.unitSpace - 24,
            centerY: 20,
            fontSize: TIME_FONT
        }))

        //add Watch B
        for (let i = -5; i <= 5; i += 1) {
            const t = new Text("0.00", {centerX: i * this.unitSpace, centerY: 3 * TIME_FONT, fontSize: TIME_FONT});
            this.tB.push(t)
            this.nodeB.addChild(t)
            this.nodeB.addChild(new Text(i, {
                centerX: i * this.unitSpace,
                centerY: -20,
                fontSize: TIME_FONT
            }));
        }
        this.nodeB.addChild(new Text("t /s =", {
            right: -5 * this.unitSpace - 24,
            centerY: 3 * TIME_FONT,
            fontSize: TIME_FONT
        }))
        this.nodeB.addChild(new Text("x /ls =", {
            right: -5 * this.unitSpace - 24,
            centerY: -20,
            fontSize: TIME_FONT
        }))

        //add Coord
        this.nodeA.addChild(new XAxisView("x'", "y'", -5, 5, 0, 0.5, this.unitSpace))
        this.nodeB.addChild(new XAxisView("x", "y", -5, 5, 0, 0.5, this.unitSpace))

        this.addChild(this.nodeA);
        this.addChild(this.nodeB);

        this.controlPanel = new ControlPanelView({
            right: 2 * this.x0 - RelativityConstants.SCREEN_VIEW_X_MARGIN - 255,
            bottom: 2 * this.y0 - RelativityConstants.SCREEN_VIEW_Y_MARGIN - 104,
            //maxWidth: 200,
        });
        this.addChild(this.controlPanel)

        let lorentzPanel = new LorentzPanelView({
            right: 2 * this.x0 - RelativityConstants.SCREEN_VIEW_X_MARGIN - 58,
            bottom: 2 * this.y0 - RelativityConstants.SCREEN_VIEW_Y_MARGIN,
            //maxWidth: 200,
        });
        this.addChild(lorentzPanel)

        let hintPanel = new HintPanelView({
            left: 20 ,
            bottom: 2 * this.y0 - RelativityConstants.SCREEN_VIEW_Y_MARGIN,
            //maxWidth: 580,
        });
        this.addChild(hintPanel)

        const resetAllButton = new ResetAllButton({
            listener: () => {
                this.interruptSubtreeInput(); // cancel interactions that may be in progress
                model.reset();
                this.reset();
            },
            right: 2 * this.x0 - RelativityConstants.SCREEN_VIEW_X_MARGIN,
            bottom: 2 * this.y0 - RelativityConstants.SCREEN_VIEW_Y_MARGIN,
            tandem: options.tandem.createTandem('resetAllButton')
        });
        this.addChild(resetAllButton);

        this.reset()
    }

    /**
     * Resets the view.
     */
    public reset(): void {
        //TODO
        this.controlPanel.isPlaying.value = false
        this.matA.setArray([1, 0, 0, 0, 1, 0, this.x0, this.y0 - this.unitSpace * 2.5, 1])
        this.matB.setArray([1, 0, 0, 0, 1, 0, this.x0, this.y0 - this.unitSpace * 1.5, 1])

        this.nodeA.setMatrix(this.matA)
        this.nodeB.setMatrix(this.matB)

        this.distance = 0
        this.tSpace_shuttle = 0
        this.tEarth = 0
    }

    /**
     * Steps the view.
     * @param dt - time step, in seconds
     */
    public override step(dt: number): void {
        let one_over_gamma = Math.sqrt(1 - this.controlPanel.velocity ** 2)

        if (this.controlPanel.velocity < 0 && this.planeView.isRight || this.controlPanel.velocity >= 0 && !this.planeView.isRight) {
            this.planeView.flip()
        }
        if (this.controlPanel.isPlaying.value) {

            if (this.controlPanel.aChecked.value) {
                this.tSpace_shuttle += one_over_gamma * dt / (this.unitSpace / this.vScala);
                this.tEarth += dt / (this.unitSpace / this.vScala);
                this.distance += this.vScala * dt * this.controlPanel.velocity
            } else {
                this.tSpace_shuttle += dt / (this.unitSpace / this.vScala);
                this.tEarth += dt / (this.unitSpace / this.vScala) / one_over_gamma;
                this.distance += this.vScala * dt * this.controlPanel.velocity / one_over_gamma
            }
        }

        if (this.controlPanel.aChecked.value) {
            this.matA.set00(one_over_gamma)
            this.matB.set00(1)
            this.matA.set02(this.x0 + this.distance);
            this.matB.set02(this.x0)
            this.nodeA.setMatrix(this.matA)
            this.nodeB.setMatrix(this.matB)
            for(let i =0; i<this.tA.length; i++){
                let tt = this.tSpace_shuttle - (i - 5) * this.controlPanel.velocity
                this.tA[i].setString(tt.toFixed(3));
                this.tB[i].setString(this.tEarth.toFixed(3));
            }
        } else {
            this.matA.set00(1)
            this.matB.set00(one_over_gamma)
            this.matA.set02(this.x0);
            this.matB.set02(this.x0 - one_over_gamma * this.distance)
            this.nodeA.setMatrix(this.matA)
            this.nodeB.setMatrix(this.matB)
            for(let i =0; i<this.tB.length; i++){
                let tt = this.tEarth + (i - this.distance/this.unitSpace - 5) * this.controlPanel.velocity
                this.tA[i].setString(this.tSpace_shuttle.toFixed(3));
                this.tB[i].setString(tt.toFixed(3));
            }
        }
        this.controlPanel.space_shuttle_t_ = this.tSpace_shuttle
        this.controlPanel.space_shuttle_t = this.tEarth
        this.controlPanel.space_shuttle_x = this.distance / this.unitSpace
        this.controlPanel.setText();
    }
}

relativity.register('RelativityScreenView', RelativityScreenView);