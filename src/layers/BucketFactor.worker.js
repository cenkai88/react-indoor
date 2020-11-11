import BucketFactor from "./BucketFactor";
import Collision from "./Collision";

let collision;
onmessage = function(t) {
    const { data } = t;
    const { type, view, viewMatrix, projectionMatrix, zoom, z, center, onePixelToWorld, isForce, list } = data;
    if (type === 'collision') {
        const params = {
            view,
            viewMatrix,
            projectionMatrix,
            zoom,
            z,
            center,
            onePixelToWorld,
        };
        if (collision) {
            collision.updateOptions(params);
        } else {
            collision = new Collision(params);
        }
        const i = { type: "collisionResult", ...collision.calculate(list), isForce };
        postMessage(i);
    } else {
        const result = (new BucketFactor).calculate(data);
        if (result) postMessage(result)
    }
}
