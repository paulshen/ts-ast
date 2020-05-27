import React from "react";
import MonacoEditor from "react-monaco-editor";

function App() {
  const [code, setCode] = React.useState("");
  return (
    <div style={{ height: "100vh", width: "80vw" }}>
      <MonacoEditor
        language="typescript"
        theme="vs-dark"
        value={code}
        options={{}}
        onChange={(newValue) => {
          setCode(newValue);
        }}
        editorWillMount={(monaco) => {
          monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
            target: monaco.languages.typescript.ScriptTarget.ESNext,
            allowNonTsExtensions: true,
          });
        }}
        editorDidMount={(editor) => {
          editor.focus();
        }}
      />
    </div>
  );
}

export default App;
