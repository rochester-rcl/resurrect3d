'use strict';

/**
 * Screen-space ambient occlusion pass.
 *
 * Has the following parameters
 *  - radius
 *  	- Ambient occlusion shadow radius (numeric value).
 *  - onlyAO
 *  	- Display only ambient occlusion result (boolean value).
 *  - aoClamp
 *  	- Ambient occlusion clamp (numeric value).
 *  - lumInfluence
 *  	- Pixel luminosity influence in AO calculation (numeric value).
 *
 * To output to screen set renderToScreens true
 *
 * @author alteredq / http://alteredqualia.com/
 * @author tentone
 * @class SSAOPass
 */


export default function loadSSAOPass(threeInstance: Object): Promise {
  return new Promise((resolve, reject) => {

    threeInstance.SSAOPass = function ( scene, camera, width, height ) {

    	if ( threeInstance.SSAOShader === undefined) {

    		console.warn( 'threeInstance.SSAOPass depends on threeInstance.SSAOShader' );
    		return new threeInstance.ShaderPass();

    	}

    	threeInstance.ShaderPass.call( this, threeInstance.SSAOShader );

    	this.width = ( width !== undefined ) ? width : 512;
    	this.height = ( height !== undefined ) ? height : 256;

    	this.renderToScreen = false;

    	this.camera2 = camera;
    	this.scene2 = scene;

    	//Depth material
    	this.depthMaterial = new threeInstance.MeshDepthMaterial();
    	this.depthMaterial.depthPacking = threeInstance.RGBADepthPacking;
    	this.depthMaterial.blending = threeInstance.NoBlending;

    	//Depth render target
    	this.depthRenderTarget = new threeInstance.WebGLRenderTarget( this.width, this.height, {
        minFilter: threeInstance.LinearFilter,
        magFilter: threeInstance.LinearFilter,
        format: threeInstance.RGBAFormat,
      });
    	//this.depthRenderTarget.texture.name = 'SSAOShader.rt';

    	//Shader uniforms
    	this.uniforms[ 'tDepth' ].value = this.depthRenderTarget.texture;
    	this.uniforms[ 'size' ].value.set( this.width, this.height );
    	this.uniforms[ 'cameraNear' ].value = this.camera2.near;
    	this.uniforms[ 'cameraFar' ].value = this.camera2.far;

    	this.uniforms[ 'radius' ].value = 5.0;
    	this.uniforms[ 'onlyAO' ].value = false;
    	this.uniforms[ 'aoClamp' ].value = 0.25;
    	this.uniforms[ 'lumInfluence' ].value = 0.2;

    	//Setters and getters for uniforms
    	var self = this;
    	Object.defineProperties(this, {

    		radius: {
    			get: function() { return this.uniforms[ 'radius' ].value; },
    			set: function( value ) { this.uniforms[ 'radius' ].value = value; }
    		},

    		onlyAO: {
    			get: function() { return this.uniforms[ 'onlyAO' ].value; },
    			set: function( value ) { this.uniforms[ 'onlyAO' ].value = value; }
    		},

    		aoClamp: {
    			get: function() { return this.uniforms[ 'aoClamp' ].value; },
    			set: function( value ) { this.uniforms[ 'aoClamp' ].value = value; }
    		},

    		lumInfluence: {
    			get: function() { return this.uniforms[ 'lumInfluence' ].value; },
    			set: function( value ) { this.uniforms[ 'lumInfluence' ].value = value; }
    		},

    	});
    }

    threeInstance.SSAOPass.prototype = Object.create( threeInstance.ShaderPass.prototype );

    /**
     * Render using this pass.
     *
     * @method render
     * @param {WebGLRenderer} renderer
     * @param {WebGLRenderTarget} writeBuffer Buffer to write output.
     * @param {WebGLRenderTarget} readBuffer Input buffer.
     * @param {Number} delta Delta time in milliseconds.
     * @param {Boolean} maskActive Not used in this pass.
     */
    threeInstance.SSAOPass.prototype.render = function( renderer, writeBuffer, readBuffer, delta, maskActive ) {

    	//Render depth into depthRenderTarget
    	this.scene2.overrideMaterial = this.depthMaterial;

    	renderer.render( this.scene2, this.camera2, this.depthRenderTarget, true );

    	this.scene2.overrideMaterial = null;


    	//SSAO shaderPass
    	threeInstance.ShaderPass.prototype.render.call( this, renderer, writeBuffer, readBuffer, delta, maskActive );

    };

    /**
     * Change scene to be renderer by this render pass.
     *
     * @method setScene
     * @param {Scene} scene
     */
    threeInstance.SSAOPass.prototype.setScene = function(scene) {

    	this.scene2 = scene;

    };

    /**
     * Set camera used by this render pass.
     *
     * @method setCamera
     * @param {Camera} camera
     */
    threeInstance.SSAOPass.prototype.setCamera = function( camera ) {

    	this.camera2 = camera;

    	this.uniforms[ 'cameraNear' ].value = this.camera2.near;
    	this.uniforms[ 'cameraFar' ].value = this.camera2.far;

    };

    /**
     * Set resolution of this render pass.
     *
     * @method setSize
     * @param {Number} width
     * @param {Number} height
     */
    threeInstance.SSAOPass.prototype.setSize = function( width, height ) {

    	this.width = width;
    	this.height = height;

    	this.uniforms[ 'size' ].value.set( this.width, this.height );
    	this.depthRenderTarget.setSize( this.width, this.height );

    };
    resolve(threeInstance);
  });
}
