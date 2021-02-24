import BucketFactor from "./Bucket";
import Collision from "./Collision";

let collision;
onmessage = function (t) {
    const { data } = t;
    const { type, view, viewMatrix, projectionMatrix, zoom, z, center, onePixelToWorld, isForce, list, taskId, id } = data;
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
        const result = { type: "collisionResult", id, taskId, ...collision.calculate(list), isForce };
        postMessage(result);
    } else {
        const result = (new BucketFactor).calculate(data);
        if (result) postMessage(result)
    }
}
