/**
 * @author alteredq / http://alteredqualia.com/
 */

export function loadMaskPass(threeInstance: Object): typeof Promise {
	return new Promise((resolve, reject) => {
		threeInstance.MaskPass = function ( scene, camera ) {

			threeInstance.Pass.call( this );

			this.scene = scene;
			this.camera = camera;

			this.clear = true;
			this.needsSwap = false;

			this.inverse = false;

		};

		threeInstance.MaskPass.prototype = Object.assign( Object.create( threeInstance.Pass.prototype ), {

			constructor: threeInstance.MaskPass,

			render: function ( renderer, writeBuffer, readBuffer, delta, maskActive ) {

				var context = renderer.context;
				var state = renderer.state;

				// don't update color or depth

				state.buffers.color.setMask( false );
				state.buffers.depth.setMask( false );

				// lock buffers

				state.buffers.color.setLocked( true );
				state.buffers.depth.setLocked( true );

				// set up stencil

				var writeValue, clearValue;

				if ( this.inverse ) {

					writeValue = 0;
					clearValue = 1;

				} else {

					writeValue = 1;
					clearValue = 0;

				}

				state.buffers.stencil.setTest( true );
				state.buffers.stencil.setOp( context.REPLACE, context.REPLACE, context.REPLACE );
				state.buffers.stencil.setFunc( context.ALWAYS, writeValue, 0xffffffff );
				state.buffers.stencil.setClear( clearValue );

				// draw into the stencil buffer

				renderer.render( this.scene, this.camera, readBuffer, this.clear );
				renderer.render( this.scene, this.camera, writeBuffer, this.clear );

				// unlock color and depth buffer for subsequent rendering

				state.buffers.color.setLocked( false );
				state.buffers.depth.setLocked( false );

				// only render where stencil is set to 1

				state.buffers.stencil.setFunc( context.EQUAL, 1, 0xffffffff );  // draw if == 1
				state.buffers.stencil.setOp( context.KEEP, context.KEEP, context.KEEP );

			}

		} );
		resolve(threeInstance);
	});
}


export function loadClearMaskPass(threeInstance: Object): typeof Promise {
	return new Promise((resolve, reject) => {
		threeInstance.ClearMaskPass = function () {

			threeInstance.Pass.call( this );

			this.needsSwap = false;

		};

		threeInstance.ClearMaskPass.prototype = Object.create( threeInstance.Pass.prototype );

		Object.assign( threeInstance.ClearMaskPass.prototype, {

			render: function ( renderer, writeBuffer, readBuffer, delta, maskActive ) {

				renderer.state.buffers.stencil.setTest( false );

			}

		} );
		resolve(threeInstance);
	});

}
