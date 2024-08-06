/**
  1. Board
  2. Pieces
    Movement
    Rotation
    Colision (board edge and other pieces)
    Stick
  3. Engine (game logic)
    Tick
    Clear lines
    Game over
  4. Input
  5. Rendering
*/

import { useEffect, useState } from "react";

type Piece = {
  x: number;
  y: number;
  shape: number[][];
};

type Board = number[][];
type Move = {
  dx?: number;
  dy?: number;
  rotate?: boolean;
  shape?: any;
};
type Place = { remove?: Boolean; stick?: Boolean };

const BOARD_X = 10;
const BOARD_Y = 20;

const SHAPES = [
  [[1, 1, 1, 1]],
  [
    [1, 1],
    [1, 1],
  ],
  [
    [1, 1, 1],
    [0, 1, 0],
  ],
];

const INITIAL_PIECE: Piece = {
  x: 0,
  y: 0,
  shape: SHAPES[0],
};

class Tetris {
  board: Board;
  piece: Piece;
  constructor() {
    this.piece = INITIAL_PIECE;
    this.board = Array(BOARD_Y)
      .fill("")
      .map(() => Array(BOARD_X).fill(0));
    this.generatePiece();
  }

  generatePiece() {
    const shape = SHAPES[Math.floor(Math.random() * SHAPES.length)];
    this.piece = {
      x: BOARD_X / 2,
      y: 0,
      shape,
    };
    this.place({});
  }

  place({ remove = false, stick = false }: Place) {
    if (this.piece) {
      const { shape } = this.piece as Piece;
      for (let y = 0; y < shape.length; y++) {
        for (let x = 0; x < shape[0].length; x++) {
          if (shape[y][x]) {
            const newY = this.piece.y + y;
            const newX = this.piece.x + x;
            this.board[newY][newX] = remove ? 0 : stick ? 2 : shape[y][x];
          }
        }
      }
    }
  }

  check({ dx = 0, dy = 0, shape = this.piece.shape }: Move) {
    for (let y = 0; y < shape.length; y++) {
      for (let x = 0; x < shape[0].length; x++) {
        const newY = this.piece.y + y + dy;
        const newX = this.piece.x + x + dx;

        // checks left and right edges
        if (newX < 0 || newX >= BOARD_X) {
          return false;
        }
        // checks up and bottom edges
        if (newY >= BOARD_Y) {
          return false;
        }
        // checks colission with other pieces
        if (this.board[newY][newX] === 2) return false;
      }
    }
    return true;
  }

  // When pieces connect, clear bottom pieces, the lines
  clearLines() {
    this.board.forEach((row, i) => {
      if (row.every((cell) => cell === 2)) {
        this.board.splice(i, 1);
        this.board.unshift(Array(BOARD_X).fill(0));
      }
    });
  }

  rotateShape() {
    const { shape } = this.piece;
    const rotateShape = Array(shape[0].length)
      .fill("")
      .map(() => Array(shape.length).fill(0));
    for (let y = 0; y < shape.length; y++) {
      for (let x = 0; x < shape[0].length; x++) {
        if (shape[y][x]) {
          rotateShape[x][shape[0].length - y - 1] = shape[y][x];
        }
      }
    }
    return rotateShape;
  }

  move({ dx = 0, dy = 0, rotate = false }: Move) {
    const shape = rotate ? this.rotateShape() : this.piece.shape;
    const valid = this.check({ dx, dy, shape });

    if (!valid && dy) {
      this.place({ stick: true });
      this.clearLines();
      this.generatePiece();
      return;
    }

    if (!valid) return;

    this.place({ remove: true });
    this.piece.x += dx;
    this.piece.y += dy;
    this.piece.shape = shape;
    this.place({});
  }
}

const tetris = new Tetris();

export default function App() {
  const [_, render] = useState({});
  useEffect(() => {
    const keyDownHandler = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        tetris.move({ dy: 1 });
      }
      if (e.key === "ArrowRight") {
        tetris.move({ dx: 1 });
      }
      if (e.key === "ArrowUp") {
        tetris.move({ rotate: true });
      }
      if (e.key === "ArrowLeft") {
        tetris.move({ dx: -1 });
      }
      // This is a hack to force render
      render({});
    };
    document.addEventListener("keydown", keyDownHandler);
    return () => document.removeEventListener("keydown", keyDownHandler);
  });
  return (
    <div className="bg-slate-200 flex flex-col justify-center items-center p-20 h-screen gap-10">
      <h1 className="font-semibold text-4xl">Tetris challenge</h1>
      {/* BOARD */}
      <div className="flex flex-col justify-center items-center">
        {/* MAP ROW IN X */}
        {tetris.board.map((row, i) => (
          <div key={i} className="flex justify-center items-center flex-row">
            {/* MAP COL IN Y */}
            {row.map((cell, j) => (
              <div
                key={j}
                className={`border-slate-400 border p-6 ${
                  cell === 1
                    ? "bg-gray-800"
                    : cell === 2
                    ? "bg-red-500"
                    : "bg-slate-200"
                }`}
              ></div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
