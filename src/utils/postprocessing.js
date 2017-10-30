/* @flow */

import loadCopyShader from './shaders/CopyShader';
import loadBokehShader from './shaders/BokehShader';
import loadEDLShader from './shaders/EDLShader';
import loadLuminosityHighPassShader from './shaders/LuminosityHighPassShader';
import loadHorizontalBlurShader from './shaders/HorizontalBlurShader';
import loadBrightnessContrastShader from './shaders/BrightnessContrastShader';
import loadConvolutionShader from './shaders/ConvolutionShader';
import loadSSAOShader from './shaders/SSAOShader';
import loadEffectComposer from './postprocessing/EffectComposer';
import loadShaderPass from './postprocessing/ShaderPass';
import loadRenderPass from './postprocessing/RenderPass';
import loadBokehPass from './postprocessing/BokehPass';
import loadBloomPass from './postprocessing/BloomPass';
import loadUnrealBloomPass from './postprocessing/UnrealBloomPass';
import loadTexturePass from './postprocessing/TexturePass';
import { loadMaskPass, loadClearMaskPass } from './postprocessing/MaskPass';

export default function loadPostProcessor(threeInstance: Object): Promise<*> {
  const shaders = [
    loadCopyShader(threeInstance),
    loadBokehShader(threeInstance),
    loadBrightnessContrastShader(threeInstance),
    loadConvolutionShader(threeInstance),
    loadHorizontalBlurShader(threeInstance),
    loadLuminosityHighPassShader(threeInstance),
    loadEDLShader(threeInstance),
  ];
  const tasks = [
    loadEffectComposer(threeInstance),
    loadShaderPass(threeInstance),
    loadRenderPass(threeInstance),
    loadTexturePass(threeInstance),
    loadBokehPass(threeInstance),
    loadBloomPass(threeInstance),
    loadUnrealBloomPass(threeInstance),
    loadMaskPass(threeInstance),
    loadClearMaskPass(threeInstance)
  ];
  return Promise.all(shaders).then(() => { return Promise.all(tasks) });
}
