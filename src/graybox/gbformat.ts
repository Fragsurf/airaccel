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

export enum GBAssetTypes {
    Default,
    Texture,
    Material
}

type SubtypePropertyNames<T> = {
    [K in keyof T]: T[K] extends { Type: any } ? K : never
}[keyof T];

function isObject(value: unknown): value is Record<string, any> {
    return typeof value === 'object' && value !== null;
}

function mergeSubtypes<T extends Record<string, any>>(obj: T): T {
    const result = { ...obj };

    // Find the subtype property (assuming there's only one)
    const subtypeKey = Object.keys(result).find(key => 
        isObject(result[key]) && 'Type' in result[key]
    ) as SubtypePropertyNames<T> | undefined;

    if (subtypeKey) {
        // Merge the subtype's properties into the main object
        Object.assign(result, result[subtypeKey]);
        // Remove the subtype property
        delete result[subtypeKey];
    }

    // Recursively merge subtypes for all array properties
    Object.keys(result).forEach(key => {
        const value = result[key];
        if (Array.isArray(value)) {
            (result as any)[key] = value.map((item: unknown) => 
                isObject(item) ? mergeSubtypes(item) : item
            );
        }
    });

    return result;
}

// Classes
export class GBMap {
    Name: string = '';
    LightmapData: GBLightmapData = new GBLightmapData();
    World: GBObject = new GBObject();
    Assets: GBAsset[] = [];
    EnvironmentData: GBEnvironmentData = new GBEnvironmentData();

    static async FromFile(fileName: string): Promise<GBMap> {
        try {
            const compressedData = await this.readFile(fileName);
            const decompressedData = pako.inflate(compressedData);
            const root = await protobuf.load('assets/data/gb.proto');
            const GBMapMessage = root.lookupType('Graybox.Format.GBMap');
            const message = GBMapMessage.decode(decompressedData);

            // Convert to plain object, preserving enum values as numbers
            const object = GBMapMessage.toObject(message, {
                longs: String,
                enums: Number,
                bytes: String,
                objects: true,  // Include this to preserve object structure
            });

            var map = object as GBMap;
            map.World = mergeSubtypes(map.World);
            //map.Assets = map.Assets.map(item => mergeSubtypes(item));

            return map;
        } catch (error) {
            console.error("Error loading GBMap:", error);
            throw error;
        }
    }

    private static async readFile(fileName: string): Promise<Uint8Array> {
        const response = await fetch(fileName);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const arrayBuffer = await response.arrayBuffer();
        return new Uint8Array(arrayBuffer);
    }
}

export class GBAsset {
    Type: GBAssetTypes = GBAssetTypes.Default;
    RelativePath: string = '';
    // 'm dumb and never actually serialized a asset type key in graybox format..
    GBTextureAsset!: GBTextureAsset;
    GBMaterialAsset!: GBMaterialAsset;
}

export class GBTextureAsset extends GBAsset {
    constructor() {
        super();
        this.Type = GBAssetTypes.Texture;
    }
    Width: number = 0;
    Height: number = 0;
    Data: Uint8Array = new Uint8Array();
    Transparent: boolean = false;
}

export class GBMaterialAsset extends GBAsset {
    constructor() {
        super();
        this.Type = GBAssetTypes.Material;
    }
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
