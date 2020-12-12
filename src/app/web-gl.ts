import { mat4 } from 'gl-matrix';

export class WebGL {
    context: WebGL2RenderingContext;
    projection: mat4;
    program: WebGLProgram;
    programInfo: ShaderProgramInfo

    public clear() {
        // Set clear colour to black, fully opaque
        this.context.clearColor(0.0, 0.0, 0.0, 1.0);
        // Clear everything
        this.context.clearDepth(1.0);
        // Enable depth testing
        this.context.enable(this.context.DEPTH_TEST);
        // Near things obscure far things
        this.context.depthFunc(this.context.LEQUAL);
        // Clear the colour as well as the depth buffer.
        this.context.clear(this.context.COLOR_BUFFER_BIT | this.context.DEPTH_BUFFER_BIT);
    }

    public changeSize(canvas: HTMLCanvasElement) {
        this.context.canvas.width = canvas.clientWidth;
        this.context.canvas.height = canvas.clientHeight;
        this.context.viewport(0, 0, canvas.clientWidth, canvas.clientHeight);
    }

    public createBuffer(data: number[]): WebGLBuffer {
        const buffer = this.context.createBuffer();
        this.context.bindBuffer(this.context.ARRAY_BUFFER, buffer);
        this.context.bufferData(this.context.ARRAY_BUFFER, new Float32Array(data), this.context.STATIC_DRAW);
        return buffer;
    }
}

export class WebGLBuilder {

    constructor(canvas: HTMLCanvasElement) {
        this._context = canvas.getContext('webgl2');
        this._context.canvas.width = canvas.clientWidth;
        this._context.canvas.height = canvas.clientHeight;
        this._context.viewport(0, 0, canvas.clientWidth, canvas.clientHeight);
    }

    private _context: WebGL2RenderingContext;
    private _projection: mat4;
    private _shaders: WebGLShader[] = [];

    public withProjection(fov: number, nearClipPlane: number, farClipPlane: number): WebGLBuilder {
        this._projection = mat4.create();
        const aspect = this._context.canvas.width / this._context.canvas.height;
        mat4.perspective(this._projection, fov, aspect, nearClipPlane, farClipPlane);
        return this;
    }

    public withShader(type: ShaderType, source: string): WebGLBuilder {
        const typeNum = type == ShaderType.Vertex ? this._context.VERTEX_SHADER : this._context.FRAGMENT_SHADER;
        const shader = this._context.createShader(typeNum);
        this._context.shaderSource(shader, source);
        this._context.compileShader(shader);
        this._shaders.push(shader);
        return this;
    }

    public build(): WebGL {
        const program = this.buildProgram();
        const webGl = new WebGL();
        webGl.context = this._context;
        webGl.projection = this._projection;
        webGl.program = program;
        webGl.programInfo = this.buildProgramInfo(program);
        return webGl;
    }

    private buildProgram(): WebGLProgram {
        const shaderProgram = this._context.createProgram();
        for (var shader of this._shaders) this._context.attachShader(shaderProgram, shader);
        this._context.linkProgram(shaderProgram);
        return shaderProgram;
    }

    private buildProgramInfo(program: WebGLProgram): ShaderProgramInfo {
        return {
            shaderProgram: program,
            vertexPosition: this._context.getAttribLocation(program, 'aVertexPosition'),
            // vertexColor: this._context.getAttribLocation(program, 'aVertexColor'),
            projectionMatrix: this._context.getUniformLocation(program, 'uProjectionMatrix'),
            modelViewMatrix: this._context.getUniformLocation(program, 'uModelViewMatrix')
        } as ShaderProgramInfo;
    }
}

export enum ShaderType { Vertex, Fragment }


export class ShaderProgramInfo {
    shaderProgram: WebGLProgram;
    vertexPosition: number;
    vertexColor: number;
    projectionMatrix: WebGLUniformLocation;
    modelViewMatrix: WebGLUniformLocation;
}