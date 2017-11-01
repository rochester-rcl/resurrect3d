/* @flow */

import loadCopyShader from './shaders/CopyShader';
import loadBokehShader from './shaders/BokehShader';
import loadEDLShader from './shaders/EDLShader';
import loadSSAOShader from './shaders/SSAOShader';
import loadLuminosityHighPassShader from './shaders/LuminosityHighPassShader';
import loadHorizontalBlurShader from './shaders/HorizontalBlurShader';
import loadBrightnessContrastShader from './shaders/BrightnessContrastShader';
import loadConvolutionShader from './shaders/ConvolutionShader';
import loadEffectComposer from './postprocessing/EffectComposer';
import loadShaderPass from './postprocessing/ShaderPass';
import loadRenderPass from './postprocessing/RenderPass';
import loadBokehPass from './postprocessing/BokehPass';
import loadSSAOPass from './postprocessing/SSAOPass';
import loadEDLPass from './postprocessing/EDLPass';
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
    loadSSAOShader(threeInstance),
    loadEDLShader(threeInstance),
  ];
  const tasks = [
    loadEffectComposer(threeInstance),
    loadShaderPass(threeInstance),
    loadRenderPass(threeInstance),
    loadTexturePass(threeInstance),
    loadEDLPass(threeInstance),
    loadSSAOPass(threeInstance),
    loadBokehPass(threeInstance),
    loadUnrealBloomPass(threeInstance),
    loadMaskPass(threeInstance),
    loadClearMaskPass(threeInstance)
  ];
  return Promise.all(shaders).then(() => { return Promise.all(tasks) });
}
