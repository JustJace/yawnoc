import { Injectable } from '@angular/core';
import { WebGL } from '../web-gl';
import { WebGlDrawService } from './web-gl-draw.service';

@Injectable({
  providedIn: 'root'
})
export class GridDrawService {

  private _positionBuffer: WebGLBuffer;

  constructor(private _glDraw: WebGlDrawService) { 

  }

  initBuffers(webGl: WebGL) {
    this._positionBuffer = webGl.createBuffer([
      -1.0, -1.0,
       1.0, -1.0,
      -1.0,  1.0,
       1.0,  1.0
    ]);
  }

  drawSquares(webGl: WebGL, options: GridDrawOptions, squares: GridSquare[]) {
    for (let square of squares) this.drawSquare(webGl, options, square);
  }

  drawSquare(webGl: WebGL, options: GridDrawOptions, square: GridSquare) {
    if (!this._positionBuffer) this.initBuffers(webGl);

    this._glDraw.triangleStrip(webGl, this._positionBuffer, 0, [0,0,0], [square.x ,square.y, 0], [0.001, 0.001, 1]);
  }
}

export interface GridDrawOptions {
  zoom: number;
  panX: number;
  panY: number;
  w: number;
  h: number;
  color: Color;
}

export interface GridSquare {
  x: number;
  y: number;
}

export interface Color {
  r: number;
  b: number;
  g: number;
  a: number;
}