import { Scene, MeshBuilder, StandardMaterial, Color3, Vector3, PhysicsAggregate, PhysicsShapeType, DirectionalLight, ShadowGenerator, Texture, PhysicsShapeMesh, PhysicsBody, PhysicsMotionType, HemisphericLight, CubeTexture, Mesh, VertexData, TransformNode, RawTexture, TextureFormat, Engine, ITextureCreationOptions, CopyTextureToTexture, Matrix, EquiRectangularCubeTexture, SceneLoader } from "@babylonjs/core";
import { GamePhysics } from "../gamephysics";
import { GBMap, GBObject, GBSolid, GBFace, GBVertex, GBTextureAsset, GBEntity, GBLight, GBObjectTypes, GBAsset } from "./gbformat";

export class GrayboxMap
{
    private scene: Scene;
    private physics: GamePhysics;
    private gbmap!: GBMap;
    private lightmapTexture!: Texture;
    private materials: Map<string, StandardMaterial> = new Map();
    private readonly WorldScale: number = 0.0254;

    constructor( scene: Scene, physics: GamePhysics )
    {
        this.scene = scene;
        this.physics = physics;
        this.createSunLight();
        this.loadMap();
    }

    private createSunLight(): void
    {
        const light = new HemisphericLight( "hemisphericLight", new Vector3( -1, -2, -1 ), this.scene );
        light.shadowEnabled = false;
        light.groundColor = new Color3( 1, 1, 1 );
    }

    private async loadMap(): Promise<void>
    {
        try
        {
            this.gbmap = await GBMap.FromFile( "assets/maps/test.graybox" );
            this.createMap();
        } catch ( error )
        {
            console.error( "Error loading map:", error );
        }
    }

    private createMap(): void
    {
        if ( !this.gbmap || !this.gbmap.World )
        {
            console.error( "GBMap not loaded or World not defined" );
            return;
        }

        this.loadLightmaps();
        this.loadSkybox();
        this.convertObject( this.gbmap.World );
    }

    private loadLightmaps(): void
    {
        if ( this.gbmap.LightmapData?.Lightmaps?.length > 0 )
        {
            var lm = this.gbmap.LightmapData.Lightmaps[ 0 ];
            const tex = RawTexture.CreateRGBTexture( null, lm.Width, lm.Height, this.scene, false, false, Texture.LINEAR_LINEAR, Engine.TEXTURETYPE_FLOAT );
            this.lightmapTexture = tex;
            this.lightmapTexture.coordinatesIndex = 1;
            this.lightmapTexture.wrapU = Texture.CLAMP_ADDRESSMODE;
            this.lightmapTexture.wrapV = Texture.CLAMP_ADDRESSMODE;
            this.lightmapTexture.gammaSpace = false;
            tex.update( lm.Data );
        }
    }

    private loadSkybox(): void
    {
        if ( this.gbmap.EnvironmentData?.Skybox )
        {
            const asset = this.gbmap.Assets.find( a => a.RelativePath === this.gbmap.EnvironmentData.Skybox );
            if ( !asset ) return;

            const skyTexture = new Texture(
                "data:image/png;base64," + asset.GBTextureAsset.Data,
                this.scene,
                false, // No mipmap
                false  // Don't invert Y-axis
            );

            // Load the skybox mesh
            SceneLoader.ImportMesh( "", "/assets/models/", "skycube.glb", this.scene, ( meshes ) =>
            {
                if ( meshes.length > 0 )
                {
                    // why does my glb have two meshes? it's just a single cube in blender.
                    for ( let i = 0; i < meshes.length; i++ )
                    {
                        const skyboxMesh = meshes[ i ];
                        skyboxMesh.scaling = new Vector3( 50, 50, 50 ); // Scale up the mesh

                        // Create and setup the skybox material
                        const skyboxMaterial = new StandardMaterial( "skyboxMaterial", this.scene );
                        skyboxMaterial.backFaceCulling = false;
                        skyboxMaterial.diffuseTexture = skyTexture;
                        skyboxMaterial.diffuseTexture.hasAlpha = false;
                        skyboxMaterial.useAlphaFromDiffuseTexture = false;
                        skyboxMaterial.disableLighting = true;
                        skyboxMaterial.emissiveColor = new Color3( 1, 1, 1 ); // Full brightness
                        skyboxMaterial.specularColor = new Color3( 0, 0, 0 );

                        // Apply the material to the skybox mesh
                        skyboxMesh.material = skyboxMaterial;

                        // Ensure the skybox is always centered on the camera
                        skyboxMesh.infiniteDistance = true;
                    }
                }
            } );
        }
    }

    private convertObject( obj: GBObject ): TransformNode
    {
        const name = obj.Name || obj.constructor.name;
        let node: TransformNode;

        switch ( obj.Type )
        {
            case GBObjectTypes.Solid:
                node = this.convertSolid( obj as GBSolid );
                break;
            case GBObjectTypes.Entity:
                node = this.convertEntity( obj as GBEntity );
                break;
            case GBObjectTypes.Light:
                node = this.convertLight( obj as GBLight );
                break;
            default:
                console.warn( `Unknown object type: ${ obj.Type }. Creating generic TransformNode.` );
                node = new TransformNode( name, this.scene );
        }

        if ( obj.Children && Array.isArray( obj.Children ) )
        {
            obj.Children.forEach( child =>
            {
                const childNode = this.convertObject( child );
                childNode.parent = node;
            } );
        }

        return node;
    }

    private convertEntity( entity: GBEntity ): TransformNode
    {
        return new TransformNode( entity.Name || "GBEntity", this.scene );
    }

    private convertLight( light: GBLight ): TransformNode
    {
        console.log( "Light conversion not yet implemented" );
        return new TransformNode( light.Name || "GBLight", this.scene );
    }

    private convertSolid( solid: GBSolid ): Mesh
    {
        const mesh = new Mesh( solid.Name || "GBSolid", this.scene );

        if ( !solid.Faces || !Array.isArray( solid.Faces ) || solid.Faces.length === 0 )
        {
            console.warn( `Solid ${ solid.Name || "unnamed" } has no faces. Creating empty mesh.` );
            return mesh;
        }

        const faceGroups = this.groupFacesByMaterial( solid.Faces );

        faceGroups.forEach( ( faces, materialPath ) =>
        {
            const subMesh = new Mesh( "SubMesh", this.scene, mesh );
            const subVertexData = new VertexData();
            const subPositions: number[] = [];
            const subIndices: number[] = [];
            const subUvs: number[] = [];
            const subUv2s: number[] = [];
            const subNormals: number[] = [];

            let vertexIndex = 0;

            faces.forEach( face =>
            {
                if ( face.Vertices.length < 3 ) return;

                const faceNormal = this.convertToUnitySpace( face.Normal );

                for ( let i = 1; i < face.Vertices.length - 1; i++ )
                {
                    // Reverse the order of vertices: [0, i+1, i] instead of [0, i, i+1]
                    [ 0, i + 1, i ].forEach( j =>
                    {
                        const vertex = face.Vertices[ j ];
                        const position = this.convertToUnitySpace( vertex.Position, true );
                        subPositions.push( ...position.asArray() );
                        subUvs.push( vertex.UV0.X, vertex.UV0.Y );
                        subUv2s.push( vertex.UV1.X, vertex.UV1.Y );
                        subNormals.push( ...faceNormal.asArray() );
                        subIndices.push( vertexIndex++ );
                    } );
                }
            } );

            VertexData.ComputeNormals( subPositions, subIndices, subNormals );

            subVertexData.positions = subPositions;
            subVertexData.indices = subIndices;
            subVertexData.uvs = subUvs;
            subVertexData.uvs2 = subUv2s;
            subVertexData.normals = subNormals;
            subVertexData.applyToMesh( subMesh );

            subMesh.material = this.getMaterial( materialPath );
            subMesh.parent = mesh;
            subMesh.checkCollisions = true;
            try
            {
                this.physics.addStaticMesh( subMesh );
            }
            catch { }
        } );

        return mesh;
    }

    private groupFacesByMaterial( faces: GBFace[] ): Map<string, GBFace[]>
    {
        const groups = new Map<string, GBFace[]>();
        faces.forEach( face =>
        {
            const materialPath = face.Texture.AssetPath;
            if ( !groups.has( materialPath ) )
            {
                groups.set( materialPath, [] );
            }
            groups.get( materialPath )!.push( face );
        } );
        return groups;
    }

    private getMaterial( assetPath: string ): StandardMaterial
    {
        if ( !this.materials.has( assetPath ) )
        {
            const material = new StandardMaterial( assetPath, this.scene );
            const texture = this.getTexture( assetPath );
            if ( texture )
            {
                material.diffuseTexture = texture;
            }
            if ( this.lightmapTexture )
            {
                material.lightmapTexture = this.lightmapTexture;
                material.useLightmapAsShadowmap = true;
            }
            material.specularColor = new Color3( 0, 0, 0 ); // Remove specularity
            this.materials.set( assetPath, material );
        }
        return this.materials.get( assetPath )!;
    }

    private getTexture( assetPath: string ): Texture | null
    {
        if ( !this.gbmap || !Array.isArray( this.gbmap.Assets ) )
        {
            console.error( "GBMap or Assets not properly loaded" );
            return null;
        }

        const asset = this.gbmap.Assets.find( a => a.RelativePath === assetPath );
        if ( !asset?.GBTextureAsset || !asset.GBTextureAsset.Data )
        {
            console.warn( `Texture asset not found or invalid: ${ assetPath }` );
            return null;
        }

        // wish I could do this but I can't figure out how to
        // purely convert gbformat to typeshit
        //return RawTexture.CreateRGBATexture( asset.GBTextureAsset.Data, asset.GBTextureAsset.Width, asset.GBTextureAsset.Height, this.scene, false, false, Texture.BILINEAR_SAMPLINGMODE, Engine.TEXTURETYPE_UNSIGNED_BYTE );

        const texture = new Texture(
            "data:image/png;base64," + asset.GBTextureAsset.Data,
            this.scene,
            false, //nomipmap
            false //invertY 
        );

        return texture;
    }

    private convertToUnitySpace( gbVector: { X: number, Y: number, Z: number }, scale: boolean = false ): Vector3
    {
        return new Vector3(
            -gbVector.Y,
            gbVector.Z,
            gbVector.X
        ).scale( scale ? this.WorldScale : 1 );
    }
}