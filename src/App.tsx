import { css } from "@emotion/core";
import * as monacoEditor from "monaco-editor/esm/vs/editor/editor.api";
import React from "react";
import MonacoEditor from "react-monaco-editor";
import * as ts from "typescript";
import NodeDetails from "./NodeDetails";
import { TreeNode } from "./Tree";

function Editor({
  code,
  editorRef,
  onChange,
}: {
  code: string;
  editorRef: { current: monacoEditor.editor.IStandaloneCodeEditor | undefined };
  onChange: (code: string) => void;
}) {
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

function Output({
  sourceFile,
  editorRef,
}: {
  sourceFile: ts.SourceFile;
  editorRef: React.RefObject<
    monacoEditor.editor.IStandaloneCodeEditor | undefined
  >;
}) {
  const [selectedNode, setSelectedNode] = React.useState<ts.Node>();
  const onNodeSelect = (node: ts.Node) => {
    // @ts-ignore
    window.$node = node;
    setSelectedNode(node);
    if (editorRef.current !== undefined) {
      const start = ts.getLineAndCharacterOfPosition(
        sourceFile,
        node.getStart(sourceFile)
      );
      const end = ts.getLineAndCharacterOfPosition(sourceFile, node.end);
      editorRef.current?.setSelection(
        new monacoEditor.Selection(
          start.line + 1,
          start.character + 1,
          end.line + 1,
          end.character + 1
        )
      );
    }
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
          padding: 16px;
          box-sizing: border-box;
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
  const editorRef = React.useRef<monacoEditor.editor.IStandaloneCodeEditor>();
  const sourceFile = React.useMemo(
    () => ts.createSourceFile("index.tsx", code, ts.ScriptTarget.Latest),
    [code]
  );
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
        <Editor code={code} editorRef={editorRef} onChange={setCode} />
      </div>
      <div
        css={css`
          width: 50vw;
        `}
      >
        <Output sourceFile={sourceFile} editorRef={editorRef} />
      </div>
    </div>
  );
}

export default App;
