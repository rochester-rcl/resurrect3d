/**
 * @author alteredq / http://alteredqualia.com/
 */

export default function loadBloomPass(threeInstance: Object): typeof Promise {
	return new Promise((resolve, reject) => {
		threeInstance.BloomPass = function ( strength, kernelSize, sigma, resolution ) {

    	threeInstance.Pass.call( this );

    	strength = ( strength !== undefined ) ? strength : 1;
    	kernelSize = ( kernelSize !== undefined ) ? kernelSize : 25;
    	sigma = ( sigma !== undefined ) ? sigma : 4.0;
    	resolution = ( resolution !== undefined ) ? resolution : 256;

    	// render targets

    	var pars = { minFilter: threeInstance.LinearFilter, magFilter: threeInstance.LinearFilter, format: threeInstance.RGBAFormat };

    	this.renderTargetX = new threeInstance.WebGLRenderTarget( resolution, resolution, pars );
    	this.renderTargetX.texture.name = "BloomPass.x";
    	this.renderTargetY = new threeInstance.WebGLRenderTarget( resolution, resolution, pars );
    	this.renderTargetY.texture.name = "BloomPass.y";

    	// copy material

    	if ( threeInstance.CopyShader === undefined )
    		console.error( "threeInstance.BloomPass relies on threeInstance.CopyShader" );

    	var copyShader = threeInstance.CopyShader;

    	this.copyUniforms = threeInstance.UniformsUtils.clone( copyShader.uniforms );

    	this.copyUniforms[ "opacity" ].value = strength;

    	this.materialCopy = new threeInstance.ShaderMaterial( {

    		uniforms: this.copyUniforms,
    		vertexShader: copyShader.vertexShader,
    		fragmentShader: copyShader.fragmentShader,
    		blending: threeInstance.AdditiveBlending,
    		transparent: true

    	} );

    	// convolution material

    	if ( threeInstance.ConvolutionShader === undefined )
    		console.error( "threeInstance.BloomPass relies on threeInstance.ConvolutionShader" );

    	var convolutionShader = threeInstance.ConvolutionShader;

    	this.convolutionUniforms = threeInstance.UniformsUtils.clone( convolutionShader.uniforms );

    	this.convolutionUniforms[ "uImageIncrement" ].value = threeInstance.BloomPass.blurX;
    	this.convolutionUniforms[ "cKernel" ].value = threeInstance.ConvolutionShader.buildKernel( sigma );

    	this.materialConvolution = new threeInstance.ShaderMaterial( {

    		uniforms: this.convolutionUniforms,
    		vertexShader:  convolutionShader.vertexShader,
    		fragmentShader: convolutionShader.fragmentShader,
    		defines: {
    			"KERNEL_SIZE_FLOAT": kernelSize.toFixed( 1 ),
    			"KERNEL_SIZE_INT": kernelSize.toFixed( 0 )
    		}

    	} );

    	this.needsSwap = false;

    	this.camera = new threeInstance.OrthographicCamera( - 1, 1, 1, - 1, 0, 1 );
    	this.scene  = new threeInstance.Scene();

    	this.quad = new threeInstance.Mesh( new threeInstance.PlaneBufferGeometry( 2, 2 ), null );
    	this.quad.frustumCulled = false; // Avoid getting clipped
    	this.scene.add( this.quad );

    };

    threeInstance.BloomPass.prototype = Object.assign( Object.create( threeInstance.Pass.prototype ), {

    	constructor: threeInstance.BloomPass,

    	render: function ( renderer, writeBuffer, readBuffer, delta, maskActive ) {

    		if ( maskActive ) renderer.context.disable( renderer.context.STENCIL_TEST );

    		// Render quad with blured scene into texture (convolution pass 1)

    		this.quad.material = this.materialConvolution;

    		this.convolutionUniforms[ "tDiffuse" ].value = readBuffer.texture;
    		this.convolutionUniforms[ "uImageIncrement" ].value = threeInstance.BloomPass.blurX;

    		renderer.render( this.scene, this.camera, this.renderTargetX, true );


    		// Render quad with blured scene into texture (convolution pass 2)

    		this.convolutionUniforms[ "tDiffuse" ].value = this.renderTargetX.texture;
    		this.convolutionUniforms[ "uImageIncrement" ].value = threeInstance.BloomPass.blurY;

    		renderer.render( this.scene, this.camera, this.renderTargetY, true );

    		// Render original scene with superimposed blur to texture

    		this.quad.material = this.materialCopy;

    		this.copyUniforms[ "tDiffuse" ].value = this.renderTargetY.texture;

    		if ( maskActive ) renderer.context.enable( renderer.context.STENCIL_TEST );

    		renderer.render( this.scene, this.camera, readBuffer, this.clear );

    	}

    } );

    threeInstance.BloomPass.blurX = new threeInstance.Vector2( 0.001953125, 0.0 );
    threeInstance.BloomPass.blurY = new threeInstance.Vector2( 0.0, 0.001953125 );

    resolve(threeInstance);
  });
}
