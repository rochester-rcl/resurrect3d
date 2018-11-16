/* @flow */

import loadCopyShader from './shaders/CopyShader';
import loadBokehShader from './shaders/BokehShader';
import loadEDLShader from './shaders/EDLShader';
import loadChromaKeyShader from './shaders/ChromaKeyShader';
import loadSSAOShader from './shaders/SSAOShader';
import loadLuminosityHighPassShader from './shaders/LuminosityHighPassShader';
import loadBlurShader from './shaders/BlurShader';
import loadVignetteShader from './shaders/VignetteShader';
import loadBrightnessContrastShader from './shaders/BrightnessContrastShader';
import loadConvolutionShader from './shaders/ConvolutionShader';
import loadAdditiveBlendShader from './shaders/AdditiveBlendShader';
import loadEffectComposer from './postprocessing/EffectComposer';
import loadShaderPass from './postprocessing/ShaderPass';
import loadRenderPass from './postprocessing/RenderPass';
import loadBokehPass from './postprocessing/BokehPass';
import loadSSAOPass from './postprocessing/SSAOPass';
import loadGaussianPass from './postprocessing/GaussianPass';
import loadVignettePass from './postprocessing/VignettePass';
import loadEDLPass from './postprocessing/EDLPass';
import loadChromaKeyPass from './postprocessing/ChromaKeyPass';
import loadUnrealBloomPass from './postprocessing/UnrealBloomPass';
import loadTexturePass from './postprocessing/TexturePass';
import loadAdditiveBlendPass from './postprocessing/AdditiveBlendPass';
import { loadMaskPass, loadClearMaskPass } from './postprocessing/MaskPass';

export default function loadPostProcessor(threeInstance: Object): Promise<*> {
  const shaders = [
    loadCopyShader(threeInstance),
    loadBokehShader(threeInstance),
    loadBrightnessContrastShader(threeInstance),
    loadConvolutionShader(threeInstance),
    loadBlurShader(threeInstance),
    loadLuminosityHighPassShader(threeInstance),
    loadSSAOShader(threeInstance),
    loadEDLShader(threeInstance),
    loadChromaKeyShader(threeInstance),
    loadVignetteShader(threeInstance),
    loadAdditiveBlendShader(threeInstance),
  ];
  const tasks = [
    loadEffectComposer(threeInstance),
    loadShaderPass(threeInstance),
    loadRenderPass(threeInstance),
    loadTexturePass(threeInstance),
    loadEDLPass(threeInstance),
    loadChromaKeyPass(threeInstance),
    loadVignettePass(threeInstance),
    loadSSAOPass(threeInstance),
    loadGaussianPass(threeInstance),
    loadBokehPass(threeInstance),
    loadUnrealBloomPass(threeInstance),
    loadMaskPass(threeInstance),
    loadClearMaskPass(threeInstance),
    loadAdditiveBlendPass(threeInstance),
  ];
  return Promise.all(shaders).then(() => { return Promise.all(tasks) });
}
