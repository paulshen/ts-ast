import { css } from "@emotion/core";
import * as monacoEditor from "monaco-editor/esm/vs/editor/editor.api";
import React from "react";
import MonacoEditor from "react-monaco-editor";
import * as ts from "typescript";
import NodeDetails from "./NodeDetails";
import { TreeNode } from "./Tree";

function Editor({
  code,
  onChange,
}: {
  code: string;
  onChange: (code: string) => void;
}) {
  const editorRef = React.useRef<monacoEditor.editor.IStandaloneCodeEditor>();
  React.useEffect(() => {
    const onResize = () => {
      editorRef.current?.layout();
    };
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
    };
  });
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
          jsx: monaco.languages.typescript.JsxEmit.Preserve,
        });
      }}
      editorDidMount={(editor) => {
        editor.focus();
        editorRef.current = editor;
      }}
    />
  );
}

const SourceFile = React.memo(
  ({
    sourceFile,
    selectedNode,
    onNodeSelect,
  }: {
    sourceFile: ts.SourceFile;
    selectedNode: ts.Node | undefined;
    onNodeSelect: (node: ts.Node) => void;
  }) => {
    return (
      <div>
        <div>{sourceFile.fileName}</div>
        <TreeNode
          node={sourceFile}
          selectedNode={selectedNode}
          onNodeSelect={onNodeSelect}
        />
      </div>
    );
  }
);

function Output({ code }: { code: string }) {
  const sourceFile = React.useMemo(
    () => ts.createSourceFile("index.tsx", code, ts.ScriptTarget.Latest),
    [code]
  );
  const [selectedNode, setSelectedNode] = React.useState<ts.Node>();
  const onNodeSelect = (node: ts.Node) => {
    // @ts-ignore
    window.$node = node;
    setSelectedNode(node);
  };
  return (
    <div
      css={css`
        display: flex;
        flex-direction: column;
        height: 100%;
      `}
    >
      <div
        css={css`
          font-family: SF Mono;
          font-size: 14px;
          white-space: pre;
          height: ${selectedNode !== undefined ? 50 : 100}%;
          overflow-y: auto;
        `}
      >
        <SourceFile
          sourceFile={sourceFile}
          selectedNode={selectedNode}
          onNodeSelect={onNodeSelect}
        />
      </div>
      {selectedNode !== undefined ? (
        <NodeDetails node={selectedNode} onNodeSelect={onNodeSelect} />
      ) : null}
    </div>
  );
}

function App() {
  const [code, setCode] = React.useState("");
  return (
    <div
      css={css`
        display: flex;
        height: 100vh;
        overflow: hidden;
      `}
    >
      <div
        css={css`
          width: 50vw;
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
