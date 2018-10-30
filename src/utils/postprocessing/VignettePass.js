/**
 * Vignette Shader Pass + 2 pass gaussian
 */

export default function loadVignettePass(threeInstance: Object): typeof Promise {
	return new Promise((resolve, reject) => {
		threeInstance.VignettePass = function (resolution: threeInstance.Vector2, strength: Number, color: threeInstance.Color) {

            threeInstance.Pass.call(this);

            if ( threeInstance.VignetteShader === undefined ) {
							let msg = "THREE.VignettePass relies on THREE.VignetteShader";
      				console.error(msg);
							reject(msg);
      			}

            if ( threeInstance.HorizontalBlurShader === undefined || threeInstance.VerticalBlurShader === undefined ) {
							let msg = "THREE.VignettePass relies on THREE.HorizontalBlurShader and THREE.VerticalBlurShader!"
      				console.error(msg);
							reject(msg);
      			}

            this.uniforms = threeInstance.UniformsUtils.clone(threeInstance.VignetteShader.uniforms);

      			this.renderToScreen = false;

            // Horizontal Blur
            this.horizontalBlurUniforms = threeInstance.UniformsUtils.clone(threeInstance.HorizontalBlurShader.uniforms);

            this.horizontalBlurMaterial = new threeInstance.ShaderMaterial({
      				uniforms: this.horizontalBlurUniforms,
      				vertexShader: threeInstance.HorizontalBlurShader.vertexShader,
      				fragmentShader: threeInstance.HorizontalBlurShader.fragmentShader,
      			});

            // Vertical Blur
            this.verticalBlurUniforms = threeInstance.UniformsUtils.clone(threeInstance.VerticalBlurShader.uniforms);

            this.verticalBlurMaterial = new threeInstance.ShaderMaterial({
      				uniforms: this.verticalBlurUniforms,
      				vertexShader: threeInstance.VerticalBlurShader.vertexShader,
      				fragmentShader: threeInstance.VerticalBlurShader.fragmentShader,
      			});

            // Vignette Shader

            this.vignetteMaterial = new threeInstance.ShaderMaterial({
              uniforms: this.uniforms,
              vertexShader: threeInstance.VignetteShader.vertexShader,
              fragmentShader: threeInstance.VignetteShader.fragmentShader,
            });

            let rtResolution = resolution ? resolution : new threeInstance.Vector2(window.innerWidth, window.innerHeight);

            let rtParams = { minFilter: threeInstance.LinearFilter, magFilter: threeInstance.LinearFilter, format: threeInstance.RGBAFormat }
            this.pass1RenderTarget = new threeInstance.WebGLRenderTarget(window.innerWidth, window.innerHeight, rtParams);
            this.pass2RenderTarget = new threeInstance.WebGLRenderTarget(window.innerWidth, window.innerHeight, rtParams);

      			this.uniforms["strength"].value = strength ? strength : 0.5;
            this.uniforms["resolution"].value = rtResolution;
            this.uniforms["color"].value = color ? color : new threeInstance.Color(0.5);

            this.horizontalBlurUniforms["h"].value = 2 / (rtResolution.x / 2);
            this.verticalBlurUniforms["v"].value = 2 / (rtResolution.y / 2);

            this.camera = new threeInstance.OrthographicCamera( - 1, 1, 1, - 1, 0, 1 );
	          this.scene  = new threeInstance.Scene();

	          this.quad = new threeInstance.Mesh( new threeInstance.PlaneBufferGeometry( 2, 2 ), null );
	          this.quad.frustumCulled = false; // Avoid getting clipped
	          this.scene.add( this.quad );

      		};

      		threeInstance.VignettePass.prototype = Object.assign( Object.create( threeInstance.Pass.prototype ), {

      			constructor: threeInstance.VignettePass,

      			render: function ( renderer, writeBuffer, readBuffer, delta, maskActive ) {
              // pass 1
              this.horizontalBlurUniforms["tDiffuse"].value = readBuffer.texture;
              this.quad.material = this.horizontalBlurMaterial;
      	      renderer.render(this.scene, this.camera, this.pass1RenderTarget, true);
              // pass 2
              this.verticalBlurUniforms["tDiffuse"].value = this.pass1RenderTarget.texture;
              this.quad.material = this.verticalBlurMaterial;
              renderer.render(this.scene, this.camera, this.pass2RenderTarget, true);
              // pass 3
              this.uniforms["tDiffuse"].value = this.pass2RenderTarget.texture;
              this.quad.material = this.vignetteMaterial;

              if (this.renderToScreen) {
                renderer.render(this.scene, this.camera);
              } else {
                renderer.render(this.scene, this.camera, writeBuffer, this.clear);
              }
            },
      		});
      		resolve(threeInstance);
      	});
  }
