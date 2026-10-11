# Fieldwork
A game of discovering safe ground while marking hidden mines.

## Language
**Field**: The rectangular collection of cells in one game. _Avoid_: map.
**Reveal**: Uncovering a cell; a safe empty cell also uncovers connected empty ground and its numbered boundary.
**Flag**: A player's claim that a covered cell contains a mine. A flag can be wrong.
**Chord**: Revealing unflagged neighbors of an uncovered number when the number of adjacent flags matches it.
**Safe opening**: The first revealed cell and its neighbors contain no mines. This does not guarantee a field solvable without guessing.
**Clear**: A win in which every safe cell has been revealed. Flagging every mine is not required.
**Best time**: The shortest completed clear time for a difficulty, measured in active session time.
