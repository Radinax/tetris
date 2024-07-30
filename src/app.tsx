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

// 25:31
import { useEffect, useState } from "react";

type Piece = {
  x: number;
  y: number;
  shape: number[][];
};

type Board = number[][];
type Move = {
  dx: number;
  dy: number;
};
type Place = { remove: Boolean; stick?: Boolean };

const BOARD_X = 10;
const BOARD_Y = 20;

const SHAPES = [[[1, 1, 1, 1]]];

class Tetris {
  board: Board;
  piece: Piece | null;
  constructor() {
    this.piece = null;
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
    this.place({ remove: false });
  }

  place({ remove = false, stick = false }: Place) {
    const piece = this.piece;
    if (piece) {
      const { shape } = piece;
      for (let y = 0; y < shape.length; y++) {
        for (let x = 0; x < shape[0].length; x++) {
          const newY = piece.y + y;
          const newX = piece.x + x;
          this.board[newY][newX] = remove ? 0 : stick ? 2 : shape[y][x];
        }
      }
    }
  }

  check({ dx, dy }: Move) {
    const piece = this.piece;
    if (piece) {
      const { shape } = piece;
      for (let y = 0; y < shape.length; y++) {
        for (let x = 0; x < shape[0].length; x++) {
          const newY = piece.y + y + dy;
          const newX = piece.x + x + dx;

          // checks left and right edges
          if (newX < 0 || newX >= BOARD_X) {
            return false;
          }
          // checks up and bottom edges
          if (newY >= BOARD_Y) {
            return false;
          }
        }
        return true;
      }
    }
  }

  move({ dx, dy }: Move) {
    /**
     * check if can move
     * if invalid x -> do nothing
     * if invalid y -> stick piece and generate new piece
     * if valid
     *  remove piece
     *  add to new place
     *
     */
    const valid = this.check({ dx, dy });

    if (!valid && dy) {
      this.place({ stick: true, remove: false });
      this.generatePiece();
      return;
    }
    if (!valid) return;

    this.place({ remove: true });
    console.log({ dx, dy, piece: this.piece });
    if (this.piece) {
      this.piece.x += dx;
      this.piece.y += dy;
      this.place({ remove: false });
    }
  }
}

const tetris = new Tetris();

export default function App() {
  const [_, render] = useState({});
  useEffect(() => {
    const keyDownHandler = (e: KeyboardEvent) => {
      console.log("key", e);
      if (e.key === "ArrowDown") {
        tetris.move({ dy: 1, dx: 0 });
      }
      if (e.key === "ArrowRight") {
        tetris.move({ dy: 0, dx: 1 });
      }
      if (e.key === "ArrowUp") {
        tetris.move({ dy: -1, dx: 0 });
      }
      if (e.key === "ArrowLeft") {
        tetris.move({ dy: 0, dx: -1 });
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
