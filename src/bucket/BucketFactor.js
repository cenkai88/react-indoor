import FillBucket from './FillBucket';
// import FillExtrusionBucket from './FillExtrusionBucket';
// import CircleBucket from './CircleBucket';
// import SymbolBucket from './SymbolBucket';
// import ConnectionBucket from './ConnectionBucket';
// import HeatmapBucket from './HeatmapBucket';
// import LineBucket from './LineBucket';
// import ModelBucket from './ModelBucket';
// import TrackBucket from './TrackBucket';
// import PictureBucket from './PictureBucket';

export default class BucketFactor {
    calculate(data) {
        let bucket;
        if (data.type === 'fill') {
            bucket = new FillBucket(data);
        }
        // else if (data.type === 'fillExtrusion') {
        //     bucket = new FillExtrusionBucket(data);
        // }
        // else if (data.type === 'circle') {
        //     bucket = new CircleBucket(data);
        // }
        // else if (data.type === 'symbol') {
        //     bucket = new SymbolBucket(data);
        // }
        // else if (data.type === 'connection') {
        //     bucket = new ConnectionBucket(data);
        // }
        // else if (data.type === 'heatmap') {
        //     bucket = new HeatmapBucket(data);
        // }
        // else if (data.type === 'line') {
        //     bucket = new LineBucket(data);
        // }
        // else if (data.type === 'model') {
        //     bucket = new ModelBucket(data);
        // }
        // else if (data.type === 'track') {
        //     bucket = new TrackBucket(data);
        // }
        // else if (data.type === 'picture') {
        //     bucket = new PictureBucket(data);
        // }
        if (bucket) {
            bucket.init();
            return bucket.getDrawInfo();
        }
    }
}
