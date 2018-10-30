/**
 * @author alteredq / http://alteredqualia.com/
 */

export default function loadEffectComposer(threeInstance: Object): typeof Promise {
	return new Promise((resolve, reject) => {
		threeInstance.EffectComposer = function ( renderer, renderTarget ) {

			this.renderer = renderer;

			if ( renderTarget === undefined ) {

				var parameters = {
					minFilter: threeInstance.LinearFilter,
					magFilter: threeInstance.LinearFilter,
					format: threeInstance.RGBAFormat,
					stencilBuffer: false
				};
				var size = renderer.getSize();
				renderTarget = new threeInstance.WebGLRenderTarget( size.width, size.height, parameters );
				renderTarget.texture.name = "EffectComposer.rt1";
			}

			this.renderTarget1 = renderTarget;
			this.renderTarget2 = renderTarget.clone();
			this.renderTarget2.texture.name = "EffectComposer.rt2";

			this.writeBuffer = this.renderTarget1;
			this.readBuffer = this.renderTarget2;

			this.passes = [];
			if ( threeInstance.CopyShader === undefined ) {
				reject();
				console.error( "THREE.EffectComposer relies on threeInstance.CopyShader" );
			}

			this.copyPass = new threeInstance.ShaderPass( threeInstance.CopyShader );

		};

		Object.assign( threeInstance.EffectComposer.prototype, {

			swapBuffers: function() {

				var tmp = this.readBuffer;
				this.readBuffer = this.writeBuffer;
				this.writeBuffer = tmp;

			},

			addPass: function ( pass ) {

				this.passes.push( pass );

				var size = this.renderer.getSize();
				pass.setSize( size.width, size.height );

			},

			insertPass: function ( pass, index ) {

				this.passes.splice( index, 0, pass );

			},

			render: function ( delta ) {

				var maskActive = false;

				var pass, i, il = this.passes.length;

				for ( i = 0; i < il; i ++ ) {

					pass = this.passes[ i ];

					if ( pass.enabled === false ) continue;

					pass.render( this.renderer, this.writeBuffer, this.readBuffer, delta, maskActive );

					if ( pass.needsSwap ) {

						if ( maskActive ) {

							var context = this.renderer.context;

							context.stencilFunc( context.NOTEQUAL, 1, 0xffffffff );

							this.copyPass.render( this.renderer, this.writeBuffer, this.readBuffer, delta );

							context.stencilFunc( context.EQUAL, 1, 0xffffffff );

						}

						this.swapBuffers();

					}

					if ( threeInstance.MaskPass !== undefined ) {

						if ( pass instanceof threeInstance.MaskPass ) {

							maskActive = true;

						} else if ( pass instanceof threeInstance.ClearMaskPass ) {

							maskActive = false;

						}

					}

				}

			},

			reset: function ( renderTarget ) {

				if ( renderTarget === undefined ) {

					var size = this.renderer.getSize();

					renderTarget = this.renderTarget1.clone();
					renderTarget.setSize( size.width, size.height );

				}

				this.renderTarget1.dispose();
				this.renderTarget2.dispose();
				this.renderTarget1 = renderTarget;
				this.renderTarget2 = renderTarget.clone();

				this.writeBuffer = this.renderTarget1;
				this.readBuffer = this.renderTarget2;

			},

			setSize: function ( width, height ) {

				this.renderTarget1.setSize( width, height );
				this.renderTarget2.setSize( width, height );

				for ( var i = 0; i < this.passes.length; i ++ ) {

					this.passes[i].setSize( width, height );

				}

			}

		} );


		threeInstance.Pass = function () {

			// if set to true, the pass is processed by the composer
			this.enabled = true;

			// if set to true, the pass indicates to swap read and write buffer after rendering
			this.needsSwap = true;

			// if set to true, the pass clears its buffer before rendering
			this.clear = false;

			// if set to true, the result of the pass is rendered to screen
			this.renderToScreen = false;

		};

		Object.assign( threeInstance.Pass.prototype, {

			setSize: function( width, height ) {},

			render: function ( renderer, writeBuffer, readBuffer, delta, maskActive ) {

				console.error( "threeInstance.Pass: .render() must be implemented in derived pass." );

			}

		} );
		resolve(threeInstance);
	});
}
