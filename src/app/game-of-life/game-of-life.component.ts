import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import vshadersource from '../shaders/shader.vert';
import fshadersource from '../shaders/shader.frag';
import { ShaderType, WebGL, WebGLBuilder } from '../web-gl';
import { WebGlDrawService } from '../services/web-gl-draw.service';
import { Color, GridDrawOptions, GridDrawService, GridSquare } from '../services/grid-draw.service';

@Component({
  selector: 'app-game-of-life',
  templateUrl: './game-of-life.component.html',
  styleUrls: ['./game-of-life.component.scss']
})
export class GameOfLifeComponent implements OnInit, AfterViewInit {

  @ViewChild('canvas') canvas: ElementRef;

  private _webGL: WebGL;
  private _grid: boolean[][] = [];
  private _height: number;
  private _width: number;

  constructor(private _glDraw: WebGlDrawService, private _gridDraw: GridDrawService) { }

  ngOnInit(): void {

  }

  ngAfterViewInit() {
    this._height = ~~(this.canvas.nativeElement.clientHeight / 4);
    this._width = ~~(this.canvas.nativeElement.clientWidth / 4);
    for (var r = 0; r < this._height; r++) {
      let row = [];
      for (var c = 0; c < this._width; c++) {
         row.push(~~Math.tan(c/r) % 2 == 0);
      }
      this._grid.push(row);
    }

    const builder = new WebGLBuilder(this.canvas.nativeElement);
    const fov = 45 * Math.PI / 180;   // in radians

    this._webGL = builder
      .withProjection(fov, 0.1, 1)
      .withShader(ShaderType.Vertex, vshadersource)
      .withShader(ShaderType.Fragment, fshadersource)
      .build();

    let rotation = 0;
    let lastRender = 0;

    let renderFn = (renderTime: number) => {
      renderTime *= 0.001;
      const delta = renderTime - lastRender;
      rotation += delta;
      lastRender = renderTime;

      this.iterate();
      this.drawScene();

      requestAnimationFrame((t) => renderFn(t));
    };
    requestAnimationFrame((t) => renderFn(t));
  }

  iterate() {
    let next: boolean[][] = [];

    for (var r = 0; r < this._height; r++) {
      let row = [];
      for (var c = 0; c < this._width; c++) {
         const neighbors = this.neighbors(r, c);
         if (this._grid[r][c]) {
           row.push(neighbors == 2 || neighbors == 3);
         } else {
           row.push(neighbors == 3);
         }
      }
      next.push(row);
    }

    this._grid = next;
  }

  neighbors(r: number, c: number): number {
    let count = 0;

    var left = c - 1; if (left < 0) left = this._height - 1;
    var right = c + 1; if (right >= this._width) right = 0;
    var up = r - 1; if (up < 0) up = this._height - 1;
    var down = r + 1; if (down >= this._width) down = 0;

    if (this._grid[up][left]) count++;
    if (this._grid[up][c]) count++;
    if (this._grid[up][right]) count++;
    if (this._grid[r][right]) count++;
    if (this._grid[down][right]) count++;
    if (this._grid[down][c]) count++;
    if (this._grid[down][left]) count++;
    if (this._grid[r][left]) count++;

    return count;
  }

  drawScene() {
    this._webGL.clear();
    const options = {
      w: 1, h: 1,
      panX: 0, panY: 0,
      zoom: 1,
      color: { r: 1, g: 1, b: 1, a: 1 } as Color
    } as GridDrawOptions;

    let squares = [];

    for (var r = 0; r < this._height; r++) {
      for (var c = 0; c < this._width; c++) {
        if (this._grid[r][c]) {
          squares.push({
            y: r - this._height / 2,
            x: c - this._width / 2, 
          });
        }
      }
    }

    this._gridDraw.drawSquares(this._webGL, options, squares);
  }
}

export class ShaderProgramInfo {
  shaderProgram: WebGLProgram;
  vertexPosition: number;
  vertexColor: number;
  projectionMatrix: WebGLUniformLocation;
  modelViewMatrix: WebGLUniformLocation;

  public static create(context: WebGL2RenderingContext, program: WebGLProgram): ShaderProgramInfo {
    return {
      shaderProgram: program,
      vertexPosition: context.getAttribLocation(program, 'aVertexPosition'),
      vertexColor: context.getAttribLocation(program, 'aVertexColor'),
      projectionMatrix: context.getUniformLocation(program, 'uProjectionMatrix'),
      modelViewMatrix: context.getUniformLocation(program, 'uModelViewMatrix')
    } as ShaderProgramInfo;
  }
}