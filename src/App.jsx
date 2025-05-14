import React, { useState } from 'react';
import DFADiagram from './DFADiagram';
import { regexToDFA } from './regexToDFA';

function App() {
  const [regex, setRegex] = useState('a(b|c)*d'); 
  const [dfaData, setDfaData] = useState(null);
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    try {
      const dfa = regexToDFA(regex);
      setDfaData(dfa);
      setError('');
    } catch (err) {
      setError(err.message);
      setDfaData(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-600 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-center text-green-600 mb-8">Regex to DFA Converter</h1>
        
        <div className="bg-gray-800 rounded-lg shadow-md p-6 mb-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="regex" className="block text-sm font-medium text-white mb-1">
                Regular Expression
              </label>
              <input
                type="text"
                id="regex"
                value={regex}
                onChange={(e) => setRegex(e.target.value)}
                className="w-full px-4 py-2 border text-white border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Try: a(b|c)*d"
                required
              />
              <div className="mt-2 text-sm text-white">
                <p className="font-medium">Supported examples:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li><button type="button" onClick={() => setRegex('a(b|c)*d')} className="text-green-600 hover:underline">a(b|c)*d</button> - a followed by any number of b or c, ending with d</li>
                  <li><button type="button" onClick={() => setRegex('(a|b)*abb')} className="text-green-600 hover:underline">(a|b)*abb</button> - any string ending with abb</li>
                </ul>
              </div>
            </div>
            
            <button
              type="submit"
              className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
            >
              Convert to DFA
            </button>
          </form>
          
          {error && (
            <div className="mt-4 p-4 bg-red-50 border-l-4 border-red-500 text-red-700">
              <p>{error}</p>
              <p className="mt-2 text-sm">Try one of the example patterns above.</p>
            </div>
          )}
        </div>
        
        {dfaData && (
          <div className="bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">DFA Visualization</h2>
            <DFADiagram dfa={dfaData} />
            
            <div className="mt-6 bg-gray-50 p-4 rounded-md">
              <h3 className="text-lg font-medium text-gray-800 mb-2">DFA Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-gray-700">States</h4>
                  <p className="text-gray-600">{dfaData.states.join(', ')}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-700">Alphabet</h4>
                  <p className="text-gray-600">{dfaData.alphabet.join(', ')}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-700">Start State</h4>
                  <p className="text-gray-600">{dfaData.start_state}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-700">Final States</h4>
                  <p className="text-gray-600">{dfaData.final_states.join(', ')}</p>
                </div>
              </div>
            </div>
          </div>
        )}
        
      </div>
    </div>
  );
}

export default App;