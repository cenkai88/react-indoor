import FrameBucket from './Frame/FrameBucket';
import RoomBucket from './Room/RoomBucket';
// import CircleBucket from './CircleBucket';
import IconBucket from './Icon/IconBucket';
// import ConnectionBucket from './ConnectionBucket';
import HeatmapBucket from './Heatmap/HeatmapBucket';
import LineBucket from './Line/LineBucket';
// import ModelBucket from './ModelBucket';
// import TrackBucket from './TrackBucket';
// import PictureBucket from './PictureBucket';


export default class BucketFactor {
    calculate(data) {
        let bucket;
        if (data.type === 'frame') {
            bucket = new FrameBucket(data);
        }
        else if (data.type === 'room') {
            bucket = new RoomBucket(data);
        }
        // else if (data.type === 'circle') {
        //     bucket = new CircleBucket(data);
        // }
        else if (data.type === 'icon') {
            bucket = new IconBucket(data);
        }
        // else if (data.type === 'connection') {
        //     bucket = new ConnectionBucket(data);
        // }
        else if (data.type === 'heatmap') {
            bucket = new HeatmapBucket(data);
        }
        else if (data.type === 'line') {
            bucket = new LineBucket(data);
        }
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