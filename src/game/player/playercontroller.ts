import { Scene, UniversalCamera, Vector3, BoundingBox, Engine } from "@babylonjs/core";
import { GamePhysics, TraceResult } from "../gamephysics";
import { GameLoop } from "../gameloop";
import { ClientInput, InputAction, UserCommand } from "./clientinput";

export class PlayerController
{
    private scene: Scene;
    private camera!: UniversalCamera;
    private moveSpeed: number = 7.365;
    private jumpForce: number = 7.15;
    private gravity: number = 20.32;
    private playerHeight: number = 1.8288;
    private playerRadius: number = 0.8128 / 2;
    private eyeHeight: number = 1.6256;
    private acceleration: number = .254;
    private airAcceleration: number = 38.1;
    private friction: number = .1016;
    private stopSpeed: number = 1.905;
    private airCap: number = 0.762;
    private maxVelocity: number = 88.9;
    private physics: GamePhysics;

    private previousPosition: Vector3;
    public position: Vector3;
    public velocity: Vector3 = Vector3.Zero();
    private grounded: boolean = false;
    private surfing: boolean = false;
    private isDucking: boolean = false;
    private input: ClientInput;
    private cmd: UserCommand = new UserCommand();
    private currentEyeAngles: Vector3 = new Vector3();

    constructor( scene: Scene, physics: GamePhysics, startPosition: Vector3 )
    {
        this.scene = scene;
        this.physics = physics;
        this.position = startPosition;
        this.previousPosition = startPosition.clone();
        this.input = new ClientInput( this.scene );
        this.setupPlayer();
        this.setupInputs();

        this.scene.onBeforeRenderObservable.add( () =>
        {
            const deltaTime = this.scene.getEngine().getDeltaTime() / 1000;
            this.input.update( deltaTime );
            //this.cmd = this.input.tick(deltaTime);

            // Use command to update game state, player position, etc.
            // You can also access the current eye angles at any time:
            this.currentEyeAngles = this.input.eyeAngles;
        } );
    }

    private setupPlayer(): void
    {
        this.camera = new UniversalCamera( "PlayerCamera", this.position.add( new Vector3( 0, this.eyeHeight, 0 ) ), this.scene );
        this.camera.inputs.clear();
        //this.camera = new FirstPersonCamera("MainCamera", this.position.add(new Vector3(0, this.eyeHeight, 0)), this.scene);
        this.camera.attachControl( this.scene.getEngine().getRenderingCanvas(), true );
        this.camera.inertia = 0;
        this.camera.minZ = 0.01;
    }

    public update( deltaTime: number ): void
    {
        // Interpolate camera position
        const alpha = GameLoop.Alpha;
        const interpolatedPosition = Vector3.Lerp( this.previousPosition, this.position, alpha );
        this.camera.position = interpolatedPosition.add( new Vector3( 0, this.eyeHeight, 0 ) );
        this.camera.rotation = this.currentEyeAngles;

        this.input.update( deltaTime );
    }

    public tick( deltaTime: number ): void
    {
        this.cmd = this.input.tick( deltaTime );
        this.previousPosition.copyFrom( this.position );

        this.applyGravity( deltaTime );
        this.checkGrounded();
        this.checkJump();

        const inputVector = this.getInputVector();
        const wishSpeed = this.moveSpeed;
        const wishDir = inputVector.clone().normalize();

        if ( this.grounded )
        {
            this.velocity = this.groundAccelerate( this.velocity, wishDir, wishSpeed, this.acceleration, 1.0 );
            this.velocity = this.applyFriction( this.velocity );
        } else
        {
            this.velocity = this.airAccelerate( this.velocity, wishDir, wishSpeed, this.airAcceleration, this.airCap );
        }

        this.clampVelocity( this.maxVelocity );

        this.moveWithCollision( deltaTime );
    }

    private applyGravity( deltaTime: number ): void
    {
        if ( !this.grounded )
        {
            this.velocity.y -= this.gravity * deltaTime;
        }
    }

    private checkGrounded(): void
    {
        this.surfing = false;

        if ( this.velocity.y > 160 )
        {
            this.grounded = false;
            return;
        }

        const groundCheckDistance = 0.0508;
        const result = this.traceBoundingBox( this.position, this.position.add( new Vector3( 0, -groundCheckDistance, 0 ) ) );

        this.grounded = result.hit && result.normal.y >= 0.7 && this.velocity.y < ( 200 * .0254 );

        if ( this.grounded )
        {
            if ( result.normal.y < 1 )
            {
                this.velocity = this.clipVelocity( this.velocity, result.normal, 1.0 );
            } else
            {
                this.velocity.y = 0;
            }
            this.position.y = result.position.y + .0254;
        } else if ( result.hit && result.normal.y < 0.7 )
        {
            this.velocity = this.clipVelocity( this.velocity, result.normal, 1.0 );
            this.surfing = true;
        }
    }

    private checkJump(): void
    {
        if ( this.grounded && this.cmd.isDown( InputAction.Jump ) )
        {
            this.velocity.y += this.jumpForce;
            this.grounded = false;
        }
    }

    private setupInputs(): void
    {
        // this.scene.onKeyboardObservable.add((kbInfo) => {
        //     const key = kbInfo.event.code;
        //     const isDown = kbInfo.type === 1;

        //     switch (key) {
        //         case "KeyW": this.moveDirection.z = isDown ? 1 : 0; break;
        //         case "KeyS": this.moveDirection.z = isDown ? -1 : 0; break;
        //         case "KeyA": this.moveDirection.x = isDown ? -1 : 0; break;
        //         case "KeyD": this.moveDirection.x = isDown ? 1 : 0; break;
        //         case "Space": this.isJumpRequested = isDown; break;
        //     }
        // });
    }

    private getInputVector(): Vector3
    {
        const forward = this.camera.getDirection( Vector3.Forward() );
        const right = this.camera.getDirection( Vector3.Right() );
        forward.y = 0;
        right.y = 0;
        forward.normalize();
        right.normalize();

        var fwdMove = 0;
        var rightMove = 0;

        if ( this.cmd.isDown( InputAction.Forward ) ) fwdMove = 1;
        if ( this.cmd.isDown( InputAction.Back ) ) fwdMove = -1;
        if ( this.cmd.isDown( InputAction.Left ) ) rightMove = -1;
        if ( this.cmd.isDown( InputAction.Right ) ) rightMove = 1;

        const inputVelocity = forward.scale( fwdMove ).add( right.scale( rightMove ) );

        if ( inputVelocity.length() > 1 )
        {
            inputVelocity.normalize().scaleInPlace( this.moveSpeed );
        } else
        {
            inputVelocity.scaleInPlace( this.moveSpeed );
        }

        return inputVelocity;
    }

    private groundAccelerate( input: Vector3, wishDir: Vector3, wishSpeed: number, accel: number, surfaceFriction: number ): Vector3
    {
        const currentSpeed = Vector3.Dot( input, wishDir );
        const addSpeed = wishSpeed - currentSpeed;
        if ( addSpeed <= 0 )
        {
            return input.clone();
        }
        let accelSpeed = accel * wishSpeed * surfaceFriction;
        if ( accelSpeed > addSpeed )
        {
            accelSpeed = addSpeed;
        }
        return input.add( wishDir.scale( accelSpeed ) );
    }

    private airAccelerate( input: Vector3, wishDir: Vector3, wishSpeed: number, accel: number, airCap: number ): Vector3
    {
        wishDir.normalize();
        const wishSpd = Math.min( wishSpeed, airCap );
        const currentSpeed = Vector3.Dot( input, wishDir );
        const addSpeed = wishSpd - currentSpeed;
        if ( addSpeed <= 0 )
        {
            return input.clone();
        }
        let accelSpeed = accel * wishSpeed;
        accelSpeed = Math.min( accelSpeed, addSpeed );
        return input.add( wishDir.scale( accelSpeed ) );
    }

    private applyFriction( input: Vector3 ): Vector3
    {
        const speed = this.velocity.length();

        if ( speed < 0.001 )
        {
            input = new Vector3();
            return input;
        }

        let drop = 0;

        // apply ground friction
        if ( this.grounded )
        {
            const friction = this.friction * 1.0;

            // Calculate control
            const control = speed < this.stopSpeed ? this.stopSpeed : speed;

            // Add the amount to the drop amount
            drop += control * friction;
        }

        // scale the velocity
        var newspeed = speed - drop;
        if ( newspeed < 0 )
            newspeed = 0;

        if ( newspeed != speed )
        {
            newspeed /= speed;
            input.scaleInPlace( newspeed );
        }

        // For compatibility with Source engine's outWishVel calculation:
        // this.outWishVel.subtractInPlace(this.velocity.scale(1 - newspeed / speed));

        return input;
    }

    private clampVelocity( range: number ): void
    {
        const length = this.velocity.length();
        if ( length > range )
        {
            this.velocity.scaleInPlace( range / length );
        }
    }

    private moveWithCollision( deltaTime: number ): void
    {
        const originalVelocity = this.velocity.clone();
        const primalVelocity = this.velocity.clone();
        let timeLeft = deltaTime;
        let planes: Vector3[] = [];
        let numbumps = 4;
        let allFraction = 0;
        const MAX_CLIP_PLANES = 5;

        for ( let bumpCount = 0; bumpCount < numbumps && timeLeft > 0; bumpCount++ )
        {
            if ( this.velocity.lengthSquared() === 0 )
            {
                break;
            }

            const end = this.position.add( this.velocity.scale( timeLeft ) );
            const trace = this.traceBoundingBox( this.position, end );
            const traceDir = end.subtract( this.position );

            allFraction += trace.fraction;

            if ( trace.startedSolid )
            {
                this.velocity.setAll( 0 );
                return;
            }

            if ( trace.fraction > 0 ) 
            {
                if ( numbumps > 0 && trace.fraction == 1 )
                {
                    var stuck = this.traceBoundingBox( end, end );
                    if ( stuck.startedSolid || stuck.fraction != 1 )
                    {
                        console.error( "PLAYER WILL GET STUCK!!" );
                        this.velocity.setAll( 0 );
                        break;
                    }
                }
                // Actually covered some distance
                this.position.addInPlace( traceDir.scale( trace.fraction ) );
                if ( trace.hit )
                {
                    this.position.addInPlace( trace.normal.scale( .001 ) );
                }
                originalVelocity.copyFrom( this.velocity );
                planes = [];
            }

            if ( trace.fraction == 1 )
            {
                break; // Moved the entire distance
            }

            timeLeft -= timeLeft * trace.fraction;

            if ( planes.length >= MAX_CLIP_PLANES )
            {
                // This shouldn't really happen
                this.velocity.setAll( 0 );
                break;
            }

            planes.push( trace.normal );

            var i = 0;
            var j = 0;
            var newVelocity = new Vector3();
            var numplanes = planes.length;

            // Modify velocity so it parallels all of the clip planes
            if ( numplanes == 1 && !this.grounded )
            {
                for ( i = 0; i < numplanes; i++ )
                {
                    if ( planes[ i ].y > 0.7 )
                    {
                        newVelocity = this.clipVelocity( originalVelocity, planes[ i ], 1 );
                        originalVelocity.copyFrom( newVelocity );
                    }
                    else
                    {
                        //ClipVelocity( original_velocity, planes[i], new_velocity, 1.0 + sv_bounce.GetFloat() * (1 - player->m_surfaceFriction) );
                        newVelocity = this.clipVelocity( originalVelocity, planes[ i ], 1 );
                    }
                }
                this.velocity.copyFrom( newVelocity );
                originalVelocity.copyFrom( newVelocity );
            }
            else 
            {
                for ( i = 0; i < numplanes; i++ )
                {
                    this.velocity = this.clipVelocity( originalVelocity, planes[ i ], 1.0 );
                    for ( j = 0; j < numplanes; j++ )
                        if ( j != i )
                        {
                            if ( Vector3.Dot( this.velocity, planes[ j ] ) < 0 )
                                break;
                        }
                    if ( j == numplanes )
                        break;
                }

                // Did we go all the way through plane set
                if ( i != numplanes )
                { // go along this plane
                    // pmove.velocity is set in clipping call, no need to set again.
                    ;
                }
                else 
                { // go along the crease
                    if ( numplanes != 2 )
                    {
                        this.velocity.setAll( 0 );
                        break;
                    }
                    var dir = Vector3.Cross( planes[ 0 ], planes[ 1 ] );
                    dir.normalize();
                    var d = dir.dot( this.velocity );
                    this.velocity = dir.scale( d );
                }

                var d = this.velocity.dot( primalVelocity );
                if ( d <= 0 )
                {
                    this.velocity.setAll( 0 );
                    break;
                }
            }
        }

        if ( allFraction == 0 )
        {
            this.velocity.setAll( 0 );
        }
    }

    private stepClimbing( originalVelocity: Vector3 ): void
    {
        const STEP_HEIGHT = 0.2; // Maximum step height the player can climb

        // Check if there's an obstacle in front of us
        const forwardStep = this.position.add( originalVelocity.normalize().scale( this.playerRadius + 0.1 ) );
        const downStep = forwardStep.add( new Vector3( 0, -STEP_HEIGHT, 0 ) );

        const trace = this.traceBoundingBox( forwardStep, downStep );

        if ( trace.hit && trace.distance < STEP_HEIGHT )
        {
            // There's a step, try to step up
            const upPosition = this.position.add( new Vector3( 0, STEP_HEIGHT, 0 ) );
            const forwardUpPosition = upPosition.add( originalVelocity.normalize().scale( this.playerRadius + 0.1 ) );

            const upTrace = this.traceBoundingBox( upPosition, forwardUpPosition );

            if ( !upTrace.hit )
            {
                // We can step up, adjust the position
                this.position.y += STEP_HEIGHT - trace.distance;
                this.velocity.y = 0; // Reset vertical velocity after stepping
            }
        }
    }

    private clipVelocity( inVelocity: Vector3, normal: Vector3, overbounce: number ): Vector3
    {
        let backoff: number;
        let change: Vector3 = new Vector3();
        let angle: number;
        let blocked: number;

        angle = normal.y; // Using y instead of z as BabylonJS uses Y-up
        blocked = 0x00;   // Assume unblocked.
        if ( angle > 0 )    // If the plane that is blocking us has a positive y component, then assume it's a floor.
            blocked |= 0x01;
        if ( angle === 0 )  // If the plane has no Y, it is vertical (wall/step)
            blocked |= 0x02;

        // Determine how far along plane to slide based on incoming direction.
        backoff = Vector3.Dot( inVelocity, normal ) * overbounce;
        change = normal.scale( backoff );

        let outVelocity = inVelocity.subtract( change );

        // Iterate once to make sure we aren't still moving through the plane
        let adjust = Vector3.Dot( outVelocity, normal );
        if ( adjust < 0.0 )
        {
            outVelocity = outVelocity.subtract( normal.scale( adjust ) );
        }

        return outVelocity;
    }

    public traceBoundingBox( start: Vector3, end: Vector3, scale: number = 1 ): TraceResult
    {
        const result = this.physics.traceCylinder( new Vector3(), new Vector3( 0, this.playerHeight, 0 ), this.playerRadius * scale, start, end );

        return result;
    }

}