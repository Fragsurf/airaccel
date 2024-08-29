import { Scene, Vector3, BoundingBox, Ray, HavokPlugin, AbstractMesh, PhysicsShapeBox, Quaternion, ShapeCastResult, PhysicsBody, PhysicsShape, PhysicsMotionType, Mesh, PhysicsShapeMesh, IRaycastQuery, PhysicsShapeCylinder } from "@babylonjs/core";
import { IPhysicsShapeCastQuery } from "@babylonjs/core/Physics/physicsShapeCastQuery";
import "@babylonjs/havok";

export class TraceResult
{
    public hit: boolean;
    public position: Vector3;
    public normal: Vector3;
    public distance: number;
    public fraction: number;
    public startedSolid: boolean;
    public body?: PhysicsBody;

    constructor( hit: boolean, position: Vector3, normal: Vector3, distance: number, fraction: number, body?: PhysicsBody )
    {
        this.hit = hit;
        this.position = position;
        this.normal = normal;
        this.distance = distance;
        this.fraction = fraction;
        this.body = body;
        this.startedSolid = fraction < 0 && hit;
    }

    public static createNoHit( endpos: Vector3 = new Vector3() ): TraceResult
    {
        return new TraceResult( false, endpos, new Vector3(), 0, 1 );
    }
}

export class GamePhysics
{
    private scene: Scene;
    private havokPlugin: HavokPlugin;

    constructor( scene: Scene )
    {
        this.scene = scene;
        this.havokPlugin = this.scene.getPhysicsEngine()?.getPhysicsPlugin() as HavokPlugin;

        if ( !this.havokPlugin )
        {
            throw new Error( "HavokPlugin is not initialized in the scene." );
        }
    }

    public addBody( body: PhysicsBody ): void
    {
        this.havokPlugin.initBody( body, PhysicsMotionType.STATIC, new Vector3(), Quaternion.Identity() );
    }

    public addStaticMesh( mesh: Mesh ): void
    {
        var body = new PhysicsBody( mesh, PhysicsMotionType.STATIC, true, this.scene );
        body.shape = new PhysicsShapeMesh( mesh, this.scene );
        this.addBody( body );
    }

    public traceCylinder( bottom: Vector3, top: Vector3, radius: number, start: Vector3, end: Vector3 ): TraceResult 
    {
        var cylinderShape = new PhysicsShapeCylinder( bottom, top, radius, this.scene );
        const query: IPhysicsShapeCastQuery = {
            shape: cylinderShape,
            rotation: Quaternion.Identity(),
            startPosition: start,
            endPosition: end,
            shouldHitTriggers: false,
        };

        const inputShapeResult = new ShapeCastResult();
        const hitShapeResult = new ShapeCastResult();

        this.havokPlugin.shapeCast( query, inputShapeResult, hitShapeResult );

        cylinderShape.dispose();

        if ( !hitShapeResult.hasHit )
        {
            return TraceResult.createNoHit( end );
        }

        const traceDist = Vector3.Distance( start, end );

        return new TraceResult(
            hitShapeResult.hasHit,
            hitShapeResult.hitPoint,
            hitShapeResult.hitNormal,
            hitShapeResult.hitFraction * traceDist,
            hitShapeResult.hitFraction,
            hitShapeResult.body
        );
    }

    public traceBox( box: BoundingBox, start: Vector3, end: Vector3 ): TraceResult
    {
        const boxShape = new PhysicsShapeBox( Vector3.Zero(), Quaternion.Identity(), box.extendSize, this.scene );
        const query: IPhysicsShapeCastQuery = {
            shape: boxShape,
            rotation: Quaternion.Identity(),
            startPosition: start,
            endPosition: end,
            shouldHitTriggers: false,
        };

        const inputShapeResult = new ShapeCastResult();
        const hitShapeResult = new ShapeCastResult();

        this.havokPlugin.shapeCast( query, inputShapeResult, hitShapeResult );

        boxShape.dispose();

        if ( !hitShapeResult.hasHit )
        {
            return TraceResult.createNoHit();
        }

        const traceDist = Vector3.Distance( start, end );

        return new TraceResult(
            hitShapeResult.hasHit,
            hitShapeResult.hitPoint,
            hitShapeResult.hitNormal,
            hitShapeResult.hitFraction * traceDist,
            hitShapeResult.hitFraction,
            hitShapeResult.body
        );
    }

    public TraceSphere( center: Vector3, radius: number, direction: Vector3, distance: number ): TraceResult
    {
        // Implementation pending
        return TraceResult.createNoHit();
    }

    public Raycast( origin: Vector3, direction: Vector3, distance: number ): TraceResult
    {
        const ray = new Ray( origin, direction, distance );
        const pickInfo = this.scene.pickWithRay( ray );

        if ( pickInfo && pickInfo.hit )
        {
            return new TraceResult(
                true,
                pickInfo.pickedPoint || new Vector3(),
                pickInfo.getNormal() || new Vector3(),
                pickInfo.distance,
                0,
                undefined
            );
        }

        return TraceResult.createNoHit();
    }
}