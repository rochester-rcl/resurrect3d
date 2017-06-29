/* @flow */

import loadCopyShader from './shaders/CopyShader';
import loadBokehShader from './shaders/BokehShader';
import loadBrightnessContrastShader from './shaders/BrightnessContrastShader';
import loadEffectComposer from './postprocessing/EffectComposer';
import loadShaderPass from './postprocessing/ShaderPass';
import loadRenderPass from './postprocessing/RenderPass';
import loadBokehPass from './postprocessing/BokehPass';

export default function loadPostProcessor(threeInstance: Object): typeof Promise {
  const shaders = [
    loadCopyShader(threeInstance),
    loadBokehShader(threeInstance),
    loadBrightnessContrastShader(threeInstance),
  ];
  const tasks = [
    loadEffectComposer(threeInstance),
    loadShaderPass(threeInstance),
    loadRenderPass(threeInstance),
    loadBokehPass(threeInstance),
  ];
  return Promise.all(shaders).then(() => { return Promise.all(tasks) });
}
