/**

@file Marker

*/

import IconLayer from '../layers/Icon/IconLayer';
import Point from '../geometry/Point';

export default class Marker {
    constructor(options, floorId) {
        this._options = options;
        this._layer = new IconLayer(Marker.getLayoutFromOptions(options));
        if (this._options.draggable) this._layer.on('mousedown', this._onmousedown.bind(this));
        const { x, y } = this._options;
        // TODO
        if (x !== undefined && y !== undefined) {
            this.setPosition(floorId, { x, y });
        }
    }
    setProperties(properties) {
        this._properties = properties;
    }
    getProperties() {
        return this._properties;
    }
    getLayer() {
        return this._layer;
    }
    setIgnoreMultiFade(flag) {
        this._layer.setIgnoreMultiFade(flag);
    }
    getIgnoreMultiFade() {
        return this._layer.getIgnoreMultiFade();
    }
    setLayout(options) {
        this._options = options;
        this._layer.setLayout(Marker.getLayoutFromOptions(options));
    }
    setAlwaysShow(alwaysShow) {
        this._layer.setAlwaysShow(alwaysShow);
        this._mapView && this._mapView.updateLayer(this._layer);
    }
    getAlwaysShow() {
        return this._layer.getAlwaysShow();
    }
    setPosition(floorId, coordinate) {
        this._layer.setFloorId(floorId);
        this._coordinate = new Point(coordinate.x, coordinate.y);
        if (!this._mapView) return;
        this._layer.setFeatures([{
            type: 'Feature',
            geometry: {
                type: 'Point',
                coordinates: [coordinate.x, coordinate.y],
            },
            properties: {},
        }]);
        this._mapView.updateLayer(this._layer);
    }
    getPosition() {
        const floorId = this._layer.getFloorId();
        if (floorId && this._coordinate) {
            return {
                floorId: floorId,
                coordinate: this._coordinate && this._coordinate.clone(),
            };
        }
    }
    on(type, listener) {
        this._layer.on(type, listener);
    }
    once(type, listener) {
        this._layer.once(type, listener);
    }
    off(type, listener) {
        this._layer.off(type, listener);
    }
    addTo(mapView) {
        if (this._mapView) return;
        this._mapView = mapView;
        this._mapView.addLayer(this._layer);
        const floorId = this._layer.getFloorId();
        if (floorId && this._coordinate) {
            this.setPosition(floorId, this._coordinate);
        }
    }
    remove() {
        if (!this._mapView) return;
        this._layer.off('mousedown', this._onmousedown.bind(this));
        this._mapView.removeLayer(this._layer);
        delete this._mapView;
    }
    _onmousedown({ e }) {
        e.cancel();
        const originEvent = e.getOriginEvent();
        if (originEvent.which !== 1 || !this._mapView)
            return;
        this._startWorld = e.getWorld();
        this._mapView.gestureManager.disableDrag();
        this._mapView.on('mousemove', this._onmousemove.bind(this));
        this._mapView.on('mouseup', this._onmouseup.bind(this));
        this._mapView.on('mouseleave', this._onmouseup.bind(this));
        this._layer.fire('dragstart', e);
        this._startFrameUpdate();
    }
    _onmousemove(e) {
        this._dragEvent = e;
    }
    _onmouseup(e) {
        this._stopFrameUpdate();
        if (!this._mapView || !this._startWorld) return;
        this._mapView.gestureManager.enableDrag();
        delete this._startWorld;
        this._mapView.off('mousemove', this._onmousemove);
        this._mapView.off('mouseup', this._onmouseup);
        this._mapView.off('mouseleave', this._onmouseup);
        this._layer.fire('dragend', e);
    }
    _startFrameUpdate() {
        if (this._updateTimer) return;
        this._frameUpdate();
    }
    _frameUpdate() {
        if (this._startWorld && this._dragEvent) {
            const delta = this._dragEvent.world.clone().subtract(this._startWorld);
            const floorId = this._layer.getFloorId();
            if (this._coordinate && floorId) {
                this.setPosition(floorId, this._coordinate.clone().add(delta));
            }
            this._startWorld = this._dragEvent.world;
            this._layer.fire('drag', this._dragEvent.bind(this));
        }
        this._updateTimer = requestAnimationFrame(this._frameUpdate.bind(this));
    }
    _stopFrameUpdate() {
        if (this._updateTimer) {
            cancelAnimationFrame(this._updateTimer);
            delete this._updateTimer;
        }
        delete this._dragEvent;
    }
    static getLayoutFromOptions(options) {
        const layout = { ...options };
        delete layout.draggable;
        return layout;
    }
}