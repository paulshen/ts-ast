import { css } from "@emotion/core";
import * as monacoEditor from "monaco-editor/esm/vs/editor/editor.api";
import React from "react";
import MonacoEditor from "react-monaco-editor";
import * as ts from "typescript";
import NodeDetails from "./NodeDetails";
import { TreeNode } from "./Tree";
import { getNodeForPosition, throttle } from "./Utils";
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
      options={{
        minimap: {
          enabled: false,
        },
      }}
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

const Output = React.memo(
  ({
    sourceFile,
    typeChecker,
    editorRef,
  }: {
    sourceFile: ts.SourceFile;
    typeChecker: ts.TypeChecker;
    editorRef: React.RefObject<
      monacoEditor.editor.IStandaloneCodeEditor | undefined
    >;
  }) => {
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
            flex-grow: 1;
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
);

function throttleEnd(fn: (...args: Array<any>) => void, ms: number) {
  let timeout: NodeJS.Timeout | undefined;
  return (...args: Array<any>) => {
    if (timeout !== undefined) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(() => {
      fn(...args);
      timeout = undefined;
    }, ms);
  };
}

function EditorResizer({
  editorWidthRef,
  setEditorWidth,
}: {
  editorWidthRef: React.RefObject<number>;
  setEditorWidth: (width: number) => void;
}) {
  const onMouseMoveRef = React.useRef<(event: MouseEvent) => void>();
  const onMouseUpRef = React.useRef<(event: MouseEvent) => void>();
  const onMouseDown = (e: React.MouseEvent) => {
    const startX = e.pageX;
    const startWidthPx = (editorWidthRef.current! / 100) * window.innerWidth;
    onMouseMoveRef.current = (e: MouseEvent) => {
      const deltaX = e.pageX - startX;
      const widthPx = startWidthPx + deltaX;
      const newWidth = (widthPx / window.innerWidth) * 100;
      setEditorWidth(newWidth);
    };
    onMouseUpRef.current = (e: MouseEvent) => {
      window.removeEventListener("mousemove", onMouseMoveRef.current!);
      window.removeEventListener("mouseup", onMouseUpRef.current!);
      onMouseMoveRef.current = undefined;
      onMouseUpRef.current = undefined;
    };
    window.addEventListener("mousemove", onMouseMoveRef.current);
    window.addEventListener("mouseup", onMouseUpRef.current);
  };
  React.useEffect(() => {
    return () => {
      if (onMouseMoveRef.current !== undefined) {
        window.removeEventListener("mousemove", onMouseMoveRef.current!);
      }
      if (onMouseUpRef.current !== undefined) {
        window.removeEventListener("mouseup", onMouseUpRef.current!);
      }
    };
  }, []);
  return (
    <div
      css={css`
        position: absolute;
        top: 0;
        left: 0;
        width: 8px;
        bottom: 0;
        cursor: ew-resize;
      `}
      onMouseDown={onMouseDown}
    ></div>
  );
}

function App() {
  const [code, setCode] = React.useState(
    () => localStorage.getItem("code") ?? ""
  );
  const editorWidthRef = React.useRef(50);
  const editorDivRef = React.useRef<HTMLDivElement>(null);
  const editorRef = React.useRef<monacoEditor.editor.IStandaloneCodeEditor>();
  const editorLayout = React.useMemo(
    () =>
      throttle(() => {
        editorRef.current?.layout();
      }, 100),
    []
  );
  const setEditorWidth = (editorWidth: number) => {
    editorWidthRef.current = editorWidth;
    const editorDiv = editorDivRef.current;
    if (editorDiv !== null) {
      editorDiv.style.width = `${editorWidth}%`;
      editorDiv.style.minWidth = `${editorWidth}%`;
      editorLayout();
    }
  };
  const [{ sourceFile, typeChecker }, updateProgram] = React.useState(() =>
    createProgram(code)
  );
  const updateProgramThrottled = React.useMemo(
    () =>
      throttleEnd((code) => {
        updateProgram(createProgram(code));
      }, 500),
    []
  );
  React.useEffect(() => {
    updateProgramThrottled(code);
  }, [updateProgramThrottled, code]);
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
          width: 50%;
          min-width: 50%;
        `}
        ref={editorDivRef}
      >
        <Editor code={code} editorRef={editorRef} onChange={setCode} />
      </div>
      <div
        css={css`
          flex-grow: 1;
          overflow: auto;
          position: relative;
        `}
      >
        <Output
          sourceFile={sourceFile}
          typeChecker={typeChecker}
          editorRef={editorRef}
        />
        <EditorResizer
          editorWidthRef={editorWidthRef}
          setEditorWidth={setEditorWidth}
        />
      </div>
    </div>
  );
}

export default App;
