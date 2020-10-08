/**
    * @file 
    * 用progress和_duration计算percent，逐步过渡属性，模拟类似transition的效果。独立于具体的属性，通过update事件去更新属性。
主要用于用户交互后画面的平移、旋转等 

*/

import Base from '../base/Base'
import timgingFns from '../utils/timgingFns';

export default class Transitor extends Base {
    /**
     * Create a Transitor.
     * @return {Transitor} The Transitor.
     */
    constructor() {
        super();
        this._current = {};
        this._startTimestamp = 0;
        this._duration = 0;
        this._progress = 0;
        this._timingF = timgingFns.linear;
    }
    /**
     * Initiate the Transitor by setting start and end value and transition duration in ms.
     * @param {number} start - The start value.
     * @param {number} end - The end value.
     * @param {number} duration - Transition duration in ms.
     * @return {Transitor} The Transitor.
     */
    init(start, end, duration) {
        this.stop(true);
        this._start = { num: start };
        this._end = { num: end };
        this._duration = duration;
        return this;
    }
    /**
     * Start the transition, no need to call play any more.
     */
    start() {
        if (this._timer) return;
        this.fire('start');
        this._current = { ...this._start };
        this.play();
        return this;
    }
    /**
     * Update the process of tranistion, fire 'update' event and be called recursively with `requestAnimationFrame`.
     * @private
     */
    _updateFrame() {
        if (!this._start || !this._end) return;
        this._progress = (performance.now() - this._startTimestamp) / this._duration;
        if (this._progress >= 1) {
            this._current = { ...this._end };
            this.fire('update', this._current);
            this._complete();
        } else {
            this._timer = requestAnimationFrame(this._updateFrame.bind(this));
            const percent = this._timingF(this._progress);
            for (const key in this._current) {
                const step = this._end[key] - this._start[key];
                this._current[key] = this._start[key] + step * percent;
            }
            this.fire('update', this._current);
        }
    }
    /**
     * Pause the transition.
     */
    pause() {
        this._stopFrameUpdate();
    }
    /**
     * Play the transition.
     */
    play() {
        if (this._timer || !this._current || this._progress >= 1) return;
        if (this._duration <= 0) {
            this._current = { ...this._end };
            this.fire('update', this._current);
            this._complete();
        } else {
            this._startTimestamp = performance.now() - this._progress * this._duration;
            this._timer = requestAnimationFrame(this._updateFrame.bind(this));
        }
    }
    /**
     * Stop the transition.
     * @param {boolean} ignoreEvent - Stopping firing 'stop' event.
     */
    stop(ignoreEvent) {
        this._stopFrameUpdate();
        this.clearListeners();
        if (!ignoreEvent) this.fire('stop');
    }
    _complete() {
        this._stopFrameUpdate();
        this.fire('complete', this._current);
    }
    _stopFrameUpdate() {
        this._startTimestamp = 0;
        if (this._timer) {
            cancelAnimationFrame(this._timer);
            delete this._timer;
        }
    }
    /**
     * Setting the transition timing function.
     * @param {string} timingFn - see TimingFns for enum, default as linear
     * @return {Transitor} The Transitor.
     */
    setTimingFn(timingFn = 'linear') {
        this._timingF = timgingFns[timingFn];
        return this;
    };
}
