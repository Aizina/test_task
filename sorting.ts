type Tube = string[];
type State = Tube[];

function sorting(state: (string | number)[][], V: number): number[][] {
  const workingState: State = state.map(tube => tube.map(String));
  const migrations: number[][] = [];
  const visited = new Set<string>();

  function serialize(state: State): string {
    return state.map(tube => tube.join(",")).join("|");
  }

  function isSorted(state: State): boolean {
    return state.every(
      tube => tube.length === 0 || (tube.length === V && tube.every(ball => ball === tube[0]))
    );
  }

  function getMoves(state: State): [number, number][] {
    const moves: [number, number][] = [];
    for (let from = 0; from < state.length; from++) {
      if (state[from].length === 0) continue;
      const ball = state[from][state[from].length - 1];
      for (let to = 0; to < state.length; to++) {
        if (from === to || state[to].length >= V) continue;
        if (state[to].length === 0 || state[to][state[to].length - 1] === ball) {
          moves.push([from, to]);
        }
      }
      
    }
    return moves;
  }

  function cloneState(state: State): State {
    return state.map(tube => [...tube]);
  }

  function dfs(state: State): boolean {
    const key = serialize(state);
    if (visited.has(key)) return false;
    visited.add(key);
    if (isSorted(state)) return true;

    for (const [from, to] of getMoves(state)) {
      const nextState = cloneState(state);
      const ball = nextState[from].pop()!;
      nextState[to].push(ball);

      migrations.push([from, to]);
      if (dfs(nextState)) return true;
      migrations.pop();
    }

    return false;
  }

  dfs(workingState);
  return migrations;
}


const testState: State = [
  ["1", "2", "3", "4"],
  ["5", "6", "7", "8"],
  ["9", "10", "1", "2"],
  ["3", "4", "5", "6"],
  ["7", "8", "9", "10"],
  ["1", "2", "3", "4"],
  ["5", "6", "7", "8"],
  ["9", "10", "1", "2"],
  ["3", "4", "5", "6"],
  ["7", "8", "9", "10"],
  [],
  []
];

const V = 4;
const result = sorting(testState, V);

console.log("Migrations:", result);

let finalState: State = testState.map(tube => [...tube]);
for (const [from, to] of result) {
  const ball = finalState[from].pop();
  if (ball) finalState[to].push(ball);
}

console.log("Final State:", finalState);
