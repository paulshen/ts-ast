import React from "react";
import { css } from "@emotion/core";
import MonacoEditor from "react-monaco-editor";
import * as ts from "typescript";

function Editor({
  code,
  onChange,
}: {
  code: string;
  onChange: (code: string) => void;
}) {
  return (
    <MonacoEditor
      language="typescript"
      theme="vs-dark"
      value={code}
      options={{}}
      onChange={(newValue) => {
        onChange(newValue);
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
  );
}

const SourceFile = React.memo(
  ({ sourceFile }: { sourceFile: ts.SourceFile }) => {
    return (
      <div>
        <div>{sourceFile.fileName}</div>
      </div>
    );
  }
);

function Output({ code }: { code: string }) {
  const sourceFile = React.useMemo(
    () => ts.createSourceFile("index.ts", code, ts.ScriptTarget.Latest),
    [code]
  );
  return (
    <div
      css={css`
        font-family: SF Mono;
        white-space: pre;
      `}
    >
      <SourceFile sourceFile={sourceFile} />
    </div>
  );
}

function App() {
  const [code, setCode] = React.useState("");
  return (
    <div
      css={css`
        display: flex;
      `}
    >
      <div
        css={css`
          width: 50vw;
          height: 100vh;
        `}
      >
        <Editor code={code} onChange={setCode} />
      </div>
      <div
        css={css`
          width: 50vw;
        `}
      >
        <Output code={code} />
      </div>
    </div>
  );
}

export default App;
