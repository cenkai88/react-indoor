export default class AbstractBucket {
    constructor(data) {
        this._geometryInfo = [];
        this._features = data.features;
        this._id = data.id;
        this._offset = data.offset;
        this._layout = data.layout;
        this._type = data.type;
        this._taskId = data.taskId;
    }
    getDrawInfo() {
        return {
            id: this._id,
            info: this._geometryInfo,
            type: this._type,
            taskId: this._taskId,
        };
    }
}
