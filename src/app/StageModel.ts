export interface StageModel {
    height: number;
    width: number;
    layers: StageLayerModel[];
    properties: StageProperties[];
    // skip propertyDict here, don't need easy access to properties
    tileheight: number;
    tilewidth: number;
    // TODO: Tileset
    filename: string;
    // raw: string; // raw json, probably won't need
    changeFlag: string; // VALUES: new, deleted
}

// One stage model can have many layers (e.g. collision layer, object layer)
export interface StageLayerModel {
    data: number[];
    name: string;
    // TODO: TiledObjects
    height: number;
    width: number;
}

// User defined properties of a stage (e.g. name: CameraZoom, type: float, value: 20.0)
export interface StageProperties {
    name: string;
    type: string;
    value: string;
}