import { css } from "@emotion/core";
import * as monacoEditor from "monaco-editor/esm/vs/editor/editor.api";
import React from "react";
import MonacoEditor from "react-monaco-editor";
import * as ts from "typescript";
import NodeDetails from "./NodeDetails";
import { TreeNode } from "./Tree";
import { getNodeForPosition } from "./Utils";
import { createProgram } from "./Compiler";
import { useSelectionStore } from "./state/SelectionStore";

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
    onNodeSelect,
  }: {
    sourceFile: ts.SourceFile;
    onNodeSelect: (node: ts.Node) => void;
  }) => {
    return (
      <div>
        <div>{sourceFile.fileName}</div>
        <TreeNode node={sourceFile} onNodeSelect={onNodeSelect} />
      </div>
    );
  }
);

function Output({
  sourceFile,
  typeChecker,
  editorRef,
}: {
  sourceFile: ts.SourceFile;
  typeChecker: ts.TypeChecker;
  editorRef: React.RefObject<
    monacoEditor.editor.IStandaloneCodeEditor | undefined
  >;
}) {
  const selectNode = useSelectionStore((state) => state.setSelectedNode);
  const hasSelectedNode = useSelectionStore(
    (state) => state.selectedNode !== undefined
  );
  const deltaDecorationsRef = React.useRef<Array<string>>([]);
  const onNodeSelect = (node: ts.Node) => {
    // @ts-ignore
    window.$node = node;
    selectNode(node);
    if (editorRef.current !== undefined) {
      const start = ts.getLineAndCharacterOfPosition(
        sourceFile,
        node.getStart(sourceFile)
      );
      const end = ts.getLineAndCharacterOfPosition(sourceFile, node.end);
      const selection = new monacoEditor.Selection(
        start.line + 1,
        start.character + 1,
        end.line + 1,
        end.character + 1
      );
      const editor = editorRef.current;
      if (editor) {
        editor.setSelection(selection);
        deltaDecorationsRef.current = editor.deltaDecorations(
          deltaDecorationsRef.current,
          [{ range: selection, options: { className: "selected-text" } }]
        );
        editor.revealRangeInCenterIfOutsideViewport(selection);
      }
    }
  };
  const sourceFileRef = React.useRef(sourceFile);
  React.useEffect(() => {
    sourceFileRef.current = sourceFile;
    selectNode(undefined);
    const editor = editorRef.current;
    if (editor) {
      deltaDecorationsRef.current = editor.deltaDecorations(
        deltaDecorationsRef.current,
        []
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sourceFile]);
  React.useEffect(() => {
    const editor = editorRef.current;
    if (editor != null) {
      const d = editor.onDidChangeCursorPosition((e) => {
        if (e.source === "api") {
          return;
        }
        const editorModel = editor.getModel();
        if (editorModel === null) {
          return;
        }
        const position = editorModel.getOffsetAt(e.position);
        const node = getNodeForPosition(sourceFileRef.current, position);
        if (node !== undefined) {
          selectNode(node);
          deltaDecorationsRef.current = editor.deltaDecorations(
            deltaDecorationsRef.current,
            []
          );
        }
      });
      return () => d.dispose();
    }
  });

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
          font-size: var(--font-size-default);
          white-space: pre;
          height: ${hasSelectedNode ? 50 : 100}%;
          padding: 16px;
          box-sizing: border-box;
          overflow-y: auto;
        `}
      >
        <SourceFile sourceFile={sourceFile} onNodeSelect={onNodeSelect} />
      </div>
      {hasSelectedNode ? (
        <NodeDetails typeChecker={typeChecker} onNodeSelect={onNodeSelect} />
      ) : null}
    </div>
  );
}

function App() {
  const [code, setCode] = React.useState(
    () => localStorage.getItem("code") ?? ""
  );
  const editorRef = React.useRef<monacoEditor.editor.IStandaloneCodeEditor>();
  const { sourceFile, typeChecker } = React.useMemo(() => createProgram(code), [
    code,
  ]);
  // @ts-ignore
  window.$typeChecker = typeChecker;
  React.useEffect(() => {
    localStorage.setItem("code", code);
  }, [code]);
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
        <Output
          sourceFile={sourceFile}
          typeChecker={typeChecker}
          editorRef={editorRef}
        />
      </div>
    </div>
  );
}

export default App;
