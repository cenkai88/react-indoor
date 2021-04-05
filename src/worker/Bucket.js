import FrameBucket from '../layers/Frame/FrameBucket';
import RoomBucket from '../layers/Room/RoomBucket';
import IconBucket from '../layers/Icon/IconBucket';
import HeatmapBucket from '../layers/Heatmap/HeatmapBucket';
import LineBucket from '../layers/Line/LineBucket';
import PolygonBucket from '../layers/Polygon/PolygonBucket';


export default class BucketFactor {
    calculate(data) {
        let bucket;
        if (data.type === 'frame') {
            bucket = new FrameBucket(data);
        }
        else if (data.type === 'room') {
            bucket = new RoomBucket(data);
        }
        else if (data.type === 'icon') {
            bucket = new IconBucket(data);
        }
        else if (data.type === 'heatmap') {
            bucket = new HeatmapBucket(data);
        }
        else if (data.type === 'line') {
            bucket = new LineBucket(data);
        }
        else if (data.type === 'polygon') {
            bucket = new PolygonBucket(data);
        }
        if (bucket) {
            bucket.init();
            return bucket.getDrawInfo();
        }
    }
}