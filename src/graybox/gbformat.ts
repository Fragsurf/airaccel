import * as fs from 'fs';
import * as path from 'path';
import * as protobuf from 'protobufjs';
import * as pako from 'pako';

// Enums
export enum GBObjectTypes {
    Default,
    Solid,
    Entity,
    World,
    Group,
    Light
}

export enum GBLightTypes {
    Point,
    Directional
}

// Classes
export class GBMap {
    Name: string = '';
    LightmapData: GBLightmapData = new GBLightmapData();
    World: GBObject = new GBObject();
    Assets: GBAsset[] = [];
    EnvironmentData: GBEnvironmentData = new GBEnvironmentData();

    static async FromFile(fileName: string): Promise<GBMap> {
        const filePath = path.join('public', 'assets', 'maps', fileName);

        // Read the file
        const compressedData = await fs.promises.readFile(filePath);

        // Decompress the data
        const decompressedData = pako.inflate(compressedData);

        // Load the Protocol Buffers schema
        const root = await protobuf.load('path/to/your/schema.proto');

        // Get the GBMap message type
        const GBMapMessage = root.lookupType('Graybox.Format.GBMap');

        // Decode the message
        const message = GBMapMessage.decode(decompressedData);

        // Convert to plain object
        const object = GBMapMessage.toObject(message, {
            longs: String,
            enums: String,
            bytes: String,
        });

        // Create and return a new GBMap instance
        return this.fromObject(object);
    }

    private static fromObject(obj: any): GBMap {
        const map = new GBMap();
        Object.assign(map, obj);
        // You might need to do some additional processing here,
        // especially for nested objects and arrays
        return map;
    }

    static ToFile(map: GBMap): ArrayBuffer {
        // Implement serialization logic here
        // This would involve converting the map to a byte array and compressing it
        throw new Error("Method not implemented.");
    }
}

export class GBAsset {
    RelativePath: string = '';
}

export class GBTextureAsset extends GBAsset {
    Width: number = 0;
    Height: number = 0;
    Data: Uint8Array = new Uint8Array();
    Transparent: boolean = false;
}

export class GBMaterialAsset extends GBAsset {
    Properties: { [key: string]: string } = {};
}

export class GBLightmapData {
    Lightmaps: GBLightmap[] = [];
}

export class GBEnvironmentData {
    FogEnabled: boolean = false;
    FogColor: GBVec4 = new GBVec4();
    FogDensity: number = 0;
    AmbientColor: GBVec4 = new GBVec4();
    Skybox: string = '';
    SkyColor: GBVec4 = new GBVec4();
}

export class GBLightmap {
    Width: number = 0;
    Height: number = 0;
    Data: Float32Array = new Float32Array();
    DirectionalData: Float32Array = new Float32Array();
    ShadowMaskData: Float32Array = new Float32Array();
    DirectionalSize: GBVec2 = new GBVec2();
    ShadowMaskSize: GBVec2 = new GBVec2();
}

export class GBObject {
    Type: GBObjectTypes = GBObjectTypes.Default;
    Name: string = '';
    ID: number = 0;
    Children: GBObject[] = [];
}

export class GBWorld extends GBObject {
    constructor() {
        super();
        this.Type = GBObjectTypes.World;
    }
}

export class GBGroup extends GBObject {
    constructor() {
        super();
        this.Type = GBObjectTypes.Group;
    }
}

export class GBSolid extends GBObject {
    Faces: GBFace[] = [];

    constructor() {
        super();
        this.Type = GBObjectTypes.Solid;
    }
}

export class GBEntity extends GBObject {
    ClassName: string = '';
    Properties: { [key: string]: string } = {};

    constructor() {
        super();
        this.Type = GBObjectTypes.Entity;
    }
}

export class GBLight extends GBObject {
    LightInfo: GBLightInfo = new GBLightInfo();

    constructor() {
        super();
        this.Type = GBObjectTypes.Light;
    }
}

export class GBTextureReference {
    AssetPath: string = '';
    UAxis: GBVec3 = new GBVec3();
    VAxis: GBVec3 = new GBVec3();
    ShiftScale: GBVec4 = new GBVec4();
    Rotation: number = 0;
}

export class GBFace {
    ID: number = 0;
    Color: GBVec4 = new GBVec4();
    Normal: GBVec3 = new GBVec3();
    Texture: GBTextureReference = new GBTextureReference();
    Vertices: GBVertex[] = [];
}

export class GBVertex {
    Position: GBVec3 = new GBVec3();
    UV0: GBVec2 = new GBVec2();
    UV1: GBVec2 = new GBVec2();
}

export class GBVec2 {
    constructor(public X: number = 0, public Y: number = 0) {}
}

export class GBVec3 {
    constructor(public X: number = 0, public Y: number = 0, public Z: number = 0) {}
}

export class GBVec4 {
    constructor(public X: number = 0, public Y: number = 0, public Z: number = 0, public W: number = 0) {}
}

export class GBLightInfo {
    Position: GBVec3 = new GBVec3();
    Direction: GBVec3 = new GBVec3();
    Range: number = 0;
    Intensity: number = 0;
    Color: GBVec4 = new GBVec4();
    Type: GBLightTypes = GBLightTypes.Point;
}
