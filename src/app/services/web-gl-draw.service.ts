import { transformAll } from '@angular/compiler/src/render3/r3_ast';
import { Injectable } from '@angular/core';
import { mat4, ReadonlyVec3 } from 'gl-matrix';
import { WebGL } from '../web-gl';

@Injectable({
  providedIn: 'root'
})
export class WebGlDrawService {

  constructor() { }

  public triangleStrip(webGL: WebGL, positionBuffer: WebGLBuffer, rotation: number, rotateAbout: ReadonlyVec3, translate: ReadonlyVec3, scale: ReadonlyVec3) {
    const gl = webGL.context;
    const programInfo = webGL.programInfo;
    const projectionMatrix = webGL.projection;
    // Set the drawing position to the "identity" point, which is
    // the center of the scene.
    const modelViewMatrix = mat4.create();

    // Now move the drawing position a bit to where we want to
    // start drawing the square.

    mat4.translate(modelViewMatrix,     // destination matrix
      modelViewMatrix,     // matrix to translate
      [0.0, 0.0, -1.0]);  // amount to translate

    mat4.scale(modelViewMatrix, modelViewMatrix, scale);
    mat4.translate(modelViewMatrix, modelViewMatrix, translate);


    // Tell WebGL how to pull out the positions from the position
    // buffer into the vertexPosition attribute.
    {
      const numComponents = 2;  // pull out 2 values per iteration
      const type = gl.FLOAT;    // the data in the buffer is 32bit floats
      const normalize = false;  // don't normalize
      const stride = 0;         // how many bytes to get from one set of values to the next
      // 0 = use type and numComponents above
      const offset = 0;         // how many bytes inside the buffer to start from
      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
      gl.vertexAttribPointer(
        programInfo.vertexPosition,
        numComponents,
        type,
        normalize,
        stride,
        offset);
      gl.enableVertexAttribArray(programInfo.vertexPosition);
    }

    mat4.rotate(modelViewMatrix,  // destination matrix
      modelViewMatrix,  // matrix to rotate
      rotation,   // amount to rotate in radians
      rotateAbout);       // axis to rotate around

    // Tell WebGL to use our program when drawing

    gl.useProgram(programInfo.shaderProgram);

    // Set the shader uniforms

    gl.uniformMatrix4fv(
      programInfo.projectionMatrix,
      false,
      projectionMatrix);
    gl.uniformMatrix4fv(
      programInfo.modelViewMatrix,
      false,
      modelViewMatrix);

    {
      const offset = 0;
      const vertexCount = 4;
      gl.drawArrays(gl.TRIANGLE_STRIP, offset, vertexCount);
    }
  }
}
