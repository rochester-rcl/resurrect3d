/* @flow */

import loadCopyShader from './shaders/CopyShader';
import loadBokehShader from './shaders/BokehShader';
import loadBrightnessContrastShader from './shaders/BrightnessContrastShader';
import loadConvolutionShader from './shaders/ConvolutionShader';
import loadSSAOShader from './shaders/SSAOShader';
import loadEffectComposer from './postprocessing/EffectComposer';
import loadShaderPass from './postprocessing/ShaderPass';
import loadRenderPass from './postprocessing/RenderPass';
import loadBokehPass from './postprocessing/BokehPass';
import loadBloomPass from './postprocessing/BloomPass';
import { loadMaskPass, loadClearMaskPass } from './postprocessing/MaskPass';

export default function loadPostProcessor(threeInstance: Object): typeof Promise {
  const shaders = [
    loadCopyShader(threeInstance),
    loadBokehShader(threeInstance),
    loadBrightnessContrastShader(threeInstance),
    loadConvolutionShader(threeInstance),
    loadSSAOShader(threeInstance),
  ];
  const tasks = [
    loadEffectComposer(threeInstance),
    loadShaderPass(threeInstance),
    loadRenderPass(threeInstance),
    loadBokehPass(threeInstance),
    loadBloomPass(threeInstance),
    loadMaskPass(threeInstance),
    loadClearMaskPass(threeInstance)
  ];
  return Promise.all(shaders).then(() => { return Promise.all(tasks) });
}
