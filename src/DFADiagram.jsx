import React from 'react';

const DFADiagram = ({ dfa }) => {
  const centerX = 400;
  const centerY = 300;
  const radius = 200;

  const statePositions = {};
  dfa.states.forEach((state, index) => {
    const angle = (index / dfa.states.length) * 2 * Math.PI;
    statePositions[state] = {
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle),
    };
  });

  const allTransitions = [];
  Object.entries(dfa.transitions).forEach(([fromState, transitions]) => {
    Object.entries(transitions).forEach(([symbol, toState]) => {
      allTransitions.push({ fromState, toState, symbol });
    });
  });

  const getControlPoint = (from, to, index, total) => {
    const midX = (from.x + to.x) / 2;
    const midY = (from.y + to.y) / 2;
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const normalX = -dy;
    const normalY = dx;
    const length = Math.sqrt(normalX * normalX + normalY * normalY);
    const scale = 50 + (index - total / 2) * 20;

    return {
      x: midX + (normalX / length) * scale,
      y: midY + (normalY / length) * scale,
    };
  };

  const transitionGroups = {};
  allTransitions.forEach(trans => {
    const key = `${trans.fromState}-${trans.toState}`;
    if (!transitionGroups[key]) {
      transitionGroups[key] = [];
    }
    transitionGroups[key].push(trans);
  });

  return (
    <div className="relative bg-white rounded-lg shadow-lg p-6 overflow-auto">
      <svg width="800" height="600" viewBox="0 0 800 600" className="w-full h-auto">
       
        <defs>
          <marker
            id="arrowhead"
            markerWidth="10"
            markerHeight="7"
            refX="9"
            refY="3.5"
            orient="auto"
          >
            <polygon points="0 0, 10 3.5, 0 7" fill="#4F46E5" />
          </marker>
        </defs>

        
        {Object.entries(transitionGroups).map(([key, transGroup]) => {
          const fromState = transGroup[0].fromState;
          const toState = transGroup[0].toState;
          const from = statePositions[fromState];
          const to = statePositions[toState];

        
          if (fromState === toState) {
            const loopRadius = 30;
            return (
              <g key={key}>
                <path
                  d={`
                    M ${from.x} ${from.y - 25}
                    a ${loopRadius} ${loopRadius} 0 1 1 ${loopRadius * 2} 0
                    a ${loopRadius} ${loopRadius} 0 1 1 -${loopRadius * 2} 0
                  `}
                  fill="none"
                  stroke="#4F46E5"
                  strokeWidth="2"
                  markerEnd="url(#arrowhead)"
                />
                <text 
                  x={from.x + loopRadius}
                  y={from.y - loopRadius - 10}
                  className="text-sm font-medium fill-gray-700"
                >
                  {transGroup.map(t => t.symbol).join(',')}
                </text>
              </g>
            );
          }

          
          return transGroup.map((transition, index) => {
            const total = transGroup.length;
            const control = getControlPoint(from, to, index, total);
            return (
              <g key={`${key}-${index}`}>
                <path
                  d={`M ${from.x} ${from.y} Q ${control.x} ${control.y}, ${to.x} ${to.y}`}
                  fill="none"
                  stroke="#4F46E5"
                  strokeWidth="2"
                  markerEnd="url(#arrowhead)"
                />
                <text 
                  x={control.x}
                  y={control.y - 5}
                  className="text-sm font-medium fill-gray-700"
                >
                  {transition.symbol}
                </text>
              </g>
            );
          });
        })}

        
        {dfa.states.map(state => {
          const isStart = state === dfa.start_state;
          const isFinal = dfa.final_states.includes(state);
          const { x, y } = statePositions[state];

          return (
            <g key={state}>
              {isStart && (
                <line 
                  x1={x - 60} 
                  y1={y} 
                  x2={x - 30} 
                  y2={y} 
                  stroke="#4F46E5" 
                  strokeWidth="2" 
                  markerEnd="url(#arrowhead)"
                />
              )}

              <circle
                cx={x}
                cy={y}
                r={isFinal ? 28 : 25}
                fill="white"
                stroke="#4F46E5"
                strokeWidth="2"
              />

              {isFinal && (
                <circle
                  cx={x}
                  cy={y}
                  r={25}
                  fill="none"
                  stroke="#4F46E5"
                  strokeWidth="2"
                />
              )}

              <text
                x={x}
                y={y}
                textAnchor="middle"
                dominantBaseline="middle"
                className="font-bold fill-gray-800"
              >
                {state}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};

export default DFADiagram;
