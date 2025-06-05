#  Regex to DFA Converter

A web-based tool that transforms regular expressions into deterministic finite automata (DFA), visualizing the process step-by-step. Built with React.js and Vite for a fast and interactive user experience.

---

## 🧠 Features

- **Regex Parsing:** Supports standard operators like * (Kleene star), | (union), and concatenation
- **Syntax Tree Generation:** Constructs a syntax tree from the input regular expression
- **DFA Construction:** Converts the syntax tree directly into a DFA without intermediate NFA steps
- **Interactive Visualization:** Displays the DFA graphically, allowing users to trace transitions 
- **Real-time Feedback:** Updates the DFA visualization as the user modifies the regular expression  

---

## 🛠️ Installation & Setup

1. **Clone this repository:**

   ```bash
   git clone https://github.com/IrfanSaeednarejo/regexToDFA.git
   cd regexToDFA

2. **Install dependencies:**

   ```bash
   npm install
   # or
   yarn install

3. **Running the Application**

   ```bash
   npm run dev
   # or
   yarn dev

# Open your browser and navigate to http://localhost:5173 to view the application.

## 📖 Usage

- **Input:** Enter a regular expression in the provided input field.

- **Visualization:** The application will parse the expression, generate the corresponding DFA, and display it graphically.

- **Interaction:** Hover over states and transitions to view details. Modify the regular expression to see real-time updates.


