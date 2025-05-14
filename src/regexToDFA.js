// src/regexToDFA.js

// Helper function to get unique elements from array
function unique(array) {
    return [...new Set(array)];
  }
  
  // NFA state class with unique IDs
  class NFAState {
    static idCounter = 0;
    
    constructor() {
      this.id = NFAState.idCounter++;
      this.transitions = {};
      this.epsilonTransitions = [];
      this.isAccepting = false;
    }
  
    addTransition(symbol, state) {
      if (!this.transitions[symbol]) {
        this.transitions[symbol] = [];
      }
      this.transitions[symbol].push(state);
    }
  
    addEpsilonTransition(state) {
      this.epsilonTransitions.push(state);
    }
  
    // Serialize without circular references
    toJSON() {
      return {
        id: this.id,
        isAccepting: this.isAccepting,
        transitions: Object.keys(this.transitions).reduce((acc, symbol) => {
          acc[symbol] = this.transitions[symbol].map(s => s.id);
          return acc;
        }, {}),
        epsilonTransitions: this.epsilonTransitions.map(s => s.id)
      };
    }
  }
  
  // NFA class
  class NFA {
    constructor(startState, acceptState) {
      this.startState = startState;
      this.acceptState = acceptState;
    }
  
    // Get all states reachable via epsilon transitions
    static epsilonClosure(states) {
      const stack = [...states];
      const closure = new Set(states);
  
      while (stack.length > 0) {
        const state = stack.pop();
        for (const nextState of state.epsilonTransitions) {
          if (!closure.has(nextState)) {
            closure.add(nextState);
            stack.push(nextState);
          }
        }
      }
  
      return Array.from(closure);
    }
  
    // Get all states reachable via symbol from given states
    static move(states, symbol) {
      const newStates = [];
      for (const state of states) {
        if (state.transitions[symbol]) {
          newStates.push(...state.transitions[symbol]);
        }
      }
      return this.epsilonClosure(newStates);
    }
  }
  
  // Convert infix regex to postfix notation with explicit concatenation
  function regexToPostfix(regex) {
    const output = [];
    const operators = [];
    let prevWasLiteral = false;
  
    const precedence = {
      '|': 1,
      '·': 2, // Concatenation
      '?': 3,
      '*': 3,
      '+': 3
    };
  
    for (let i = 0; i < regex.length; i++) {
      const c = regex[i];
  
      if (c === '\\') { // Handle escape characters
        i++;
        if (i < regex.length) {
          output.push(regex[i]);
          prevWasLiteral = true;
        }
        continue;
      }
  
      if (c === '(') {
        if (prevWasLiteral) {
          operators.push('·');
        }
        operators.push(c);
        prevWasLiteral = false;
      } else if (c === ')') {
        while (operators.length > 0 && operators[operators.length - 1] !== '(') {
          output.push(operators.pop());
        }
        operators.pop(); // Remove '('
        prevWasLiteral = true;
      } else if (c in precedence) {
        if (c === '|' && prevWasLiteral) {
          // Insert concatenation before alternation
          while (operators.length > 0 && operators[operators.length - 1] === '·') {
            output.push(operators.pop());
          }
        }
        while (
          operators.length > 0 &&
          operators[operators.length - 1] !== '(' &&
          precedence[operators[operators.length - 1]] >= precedence[c]
        ) {
          output.push(operators.pop());
        }
        operators.push(c);
        prevWasLiteral = false;
      } else {
        if (prevWasLiteral) {
          while (operators.length > 0 && operators[operators.length - 1] === '·') {
            output.push(operators.pop());
          }
          operators.push('·');
        }
        output.push(c);
        prevWasLiteral = true;
      }
    }
  
    while (operators.length > 0) {
      output.push(operators.pop());
    }
  
    return output.join('');
  }
  
  // Convert postfix regex to NFA using Thompson's construction
  function postfixToNFA(postfix) {
    const stack = [];
  
    for (const c of postfix) {
      if (c === '·') { // Concatenation
        const nfa2 = stack.pop();
        const nfa1 = stack.pop();
        nfa1.acceptState.addEpsilonTransition(nfa2.startState);
        nfa1.acceptState.isAccepting = false;
        stack.push(new NFA(nfa1.startState, nfa2.acceptState));
      } else if (c === '|') { // Alternation
        const nfa2 = stack.pop();
        const nfa1 = stack.pop();
        const startState = new NFAState();
        const acceptState = new NFAState();
        startState.addEpsilonTransition(nfa1.startState);
        startState.addEpsilonTransition(nfa2.startState);
        nfa1.acceptState.addEpsilonTransition(acceptState);
        nfa2.acceptState.addEpsilonTransition(acceptState);
        nfa1.acceptState.isAccepting = false;
        nfa2.acceptState.isAccepting = false;
        acceptState.isAccepting = true;
        stack.push(new NFA(startState, acceptState));
      } else if (c === '*') { // Kleene star
        const nfa = stack.pop();
        const startState = new NFAState();
        const acceptState = new NFAState();
        startState.addEpsilonTransition(nfa.startState);
        startState.addEpsilonTransition(acceptState);
        nfa.acceptState.addEpsilonTransition(nfa.startState);
        nfa.acceptState.addEpsilonTransition(acceptState);
        nfa.acceptState.isAccepting = false;
        acceptState.isAccepting = true;
        stack.push(new NFA(startState, acceptState));
      } else if (c === '+') { // One or more
        const nfa = stack.pop();
        const startState = new NFAState();
        const acceptState = new NFAState();
        startState.addEpsilonTransition(nfa.startState);
        nfa.acceptState.addEpsilonTransition(nfa.startState);
        nfa.acceptState.addEpsilonTransition(acceptState);
        nfa.acceptState.isAccepting = false;
        acceptState.isAccepting = true;
        stack.push(new NFA(startState, acceptState));
      } else if (c === '?') { // Zero or one
        const nfa = stack.pop();
        const startState = new NFAState();
        const acceptState = new NFAState();
        startState.addEpsilonTransition(nfa.startState);
        startState.addEpsilonTransition(acceptState);
        nfa.acceptState.addEpsilonTransition(acceptState);
        nfa.acceptState.isAccepting = false;
        acceptState.isAccepting = true;
        stack.push(new NFA(startState, acceptState));
      } else { // Literal character
        const startState = new NFAState();
        const acceptState = new NFAState();
        startState.addTransition(c, acceptState);
        acceptState.isAccepting = true;
        stack.push(new NFA(startState, acceptState));
      }
    }
  
    return stack.pop();
  }
  
  // Convert NFA to DFA using subset construction
  function nfaToDFA(nfa) {
    const alphabet = [];
    const stateMap = new Map();
    const dfaStates = [];
    const dfaTransitions = {};
    const dfaFinalStates = [];
  
    // Extract alphabet from NFA transitions
    const nfaStates = getAllStates(nfa.startState);
    for (const state of nfaStates) {
      for (const symbol in state.transitions) {
        if (symbol !== 'ε' && !alphabet.includes(symbol)) {
          alphabet.push(symbol);
        }
      }
    }
  
    // Initial state is epsilon-closure of NFA's start state
    const initialState = NFA.epsilonClosure([nfa.startState]);
    const initialStateKey = JSON.stringify(initialState.map(s => s.id));
    stateMap.set(initialStateKey, `q${stateMap.size}`);
    dfaStates.push(`q${stateMap.size - 1}`);
  
    const queue = [initialState];
  
    while (queue.length > 0) {
      const currentStateSet = queue.shift();
      const currentStateKey = JSON.stringify(currentStateSet.map(s => s.id));
      const currentStateName = stateMap.get(currentStateKey);
  
      // Check if this DFA state should be accepting
      if (currentStateSet.some(state => state.isAccepting)) {
        dfaFinalStates.push(currentStateName);
      }
  
      // Initialize transitions for this state
      dfaTransitions[currentStateName] = {};
  
      // Compute transitions for each symbol
      for (const symbol of alphabet) {
        const nextStateSet = NFA.move(currentStateSet, symbol);
        const nextStateKey = JSON.stringify(nextStateSet.map(s => s.id));
  
        if (nextStateSet.length === 0) continue;
  
        if (!stateMap.has(nextStateKey)) {
          stateMap.set(nextStateKey, `q${stateMap.size}`);
          dfaStates.push(`q${stateMap.size - 1}`);
          queue.push(nextStateSet);
        }
  
        const nextStateName = stateMap.get(nextStateKey);
        dfaTransitions[currentStateName][symbol] = nextStateName;
      }
    }
  
    // Add trap state for missing transitions
    const trapState = 'qtrap';
    let hasTrapState = false;
  
    for (const state of dfaStates) {
      for (const symbol of alphabet) {
        if (!dfaTransitions[state][symbol]) {
          if (!hasTrapState) {
            dfaStates.push(trapState);
            dfaTransitions[trapState] = {};
            for (const sym of alphabet) {
              dfaTransitions[trapState][sym] = trapState;
            }
            hasTrapState = true;
          }
          dfaTransitions[state][symbol] = trapState;
        }
      }
    }
  
    return {
      states: dfaStates,
      alphabet,
      start_state: stateMap.get(JSON.stringify(initialState.map(s => s.id))),
      final_states: dfaFinalStates,
      transitions: dfaTransitions
    };
  }
  
  // Helper function to get all NFA states
  function getAllStates(startState) {
    const visited = new Set();
    const stack = [startState];
    visited.add(startState);
  
    while (stack.length > 0) {
      const state = stack.pop();
      
      // Process epsilon transitions
      for (const nextState of state.epsilonTransitions) {
        if (!visited.has(nextState)) {
          visited.add(nextState);
          stack.push(nextState);
        }
      }
      
      // Process symbol transitions
      for (const symbol in state.transitions) {
        for (const nextState of state.transitions[symbol]) {
          if (!visited.has(nextState)) {
            visited.add(nextState);
            stack.push(nextState);
          }
        }
      }
    }
  
    return Array.from(visited);
  }
  
  // Main conversion function
  export function regexToDFA(regex) {
    if (!regex || typeof regex !== 'string') {
      throw new Error('Invalid regular expression');
    }
  
    try {
      // Reset static ID counter
      NFAState.idCounter = 0;
  
      // Handle empty regex
      if (regex === '') {
        return {
          states: ['q0'],
          alphabet: [],
          start_state: 'q0',
          final_states: ['q0'],
          transitions: {}
        };
      }
  
      // Convert to postfix notation
      const postfix = regexToPostfix(regex);
      
      // Convert to NFA
      const nfa = postfixToNFA(postfix);
      
      // Convert to DFA
      const dfa = nfaToDFA(nfa);
      
      return dfa;
    } catch (error) {
      throw new Error(`Invalid regular expression: ${error.message}`);
    }
  }