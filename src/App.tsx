import { css } from "@emotion/core";
import * as monacoEditor from "monaco-editor/esm/vs/editor/editor.api";
import React from "react";
import MonacoEditor from "react-monaco-editor";
import * as ts from "typescript";
import { createProgram } from "./Compiler";
import NodeDetails from "./NodeDetails";
import { useExpandStore } from "./state/ExpandStore";
import { useSelectionStore } from "./state/SelectionStore";
import { TreeNode } from "./Tree";
import { getNodeForPosition, throttle } from "./Utils";

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
      <div
        css={css`
          position: relative;
        `}
      >
        <div>{sourceFile.fileName}</div>
        <TreeNode node={sourceFile} path={[0]} onNodeSelect={onNodeSelect} />
      </div>
    );
  }
);

const Output = React.memo(
  ({
    sourceFile,
    typeChecker,
    editorRef,
    setCode,
  }: {
    sourceFile: ts.SourceFile;
    typeChecker: ts.TypeChecker;
    editorRef: React.RefObject<
      monacoEditor.editor.IStandaloneCodeEditor | undefined
    >;
    setCode: (code: string) => void;
  }) => {
    const selectNode = useSelectionStore((state) => state.setSelectedNode);
    const selectedNode = useSelectionStore((state) => state.selectedNode);
    const selectedNodeRef = React.useRef(selectedNode);
    React.useEffect(() => {
      selectedNodeRef.current = selectedNode;
    });
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
    React.useEffect(() => {
      const onKeyDown = (e: KeyboardEvent) => {
        const selectedNode = selectedNodeRef.current;
        if (
          document.activeElement === document.body &&
          selectedNode !== undefined
        ) {
          switch (e.key) {
            case "ArrowLeft":
              if (selectedNode.parent !== undefined) {
                onNodeSelect(selectedNode.parent);
              }
              break;
            case "ArrowRight": {
              let isFirstChild = true;
              selectedNode.forEachChild((childNode) => {
                if (isFirstChild) {
                  onNodeSelect(childNode);
                  isFirstChild = false;
                }
              });
              break;
            }
            case "ArrowDown": {
              const parentNode = selectedNode.parent;
              if (parentNode !== undefined) {
                let takeNextNode = false;
                parentNode.forEachChild((childNode) => {
                  if (takeNextNode) {
                    onNodeSelect(childNode);
                    takeNextNode = false;
                  }
                  if (childNode === selectedNode) {
                    takeNextNode = true;
                  }
                });
              }
              break;
            }
            case "ArrowUp": {
              const parentNode = selectedNode.parent;
              if (parentNode !== undefined) {
                let prevNode: ts.Node | undefined;
                parentNode.forEachChild((childNode) => {
                  if (childNode === selectedNode && prevNode !== undefined) {
                    onNodeSelect(prevNode);
                  } else {
                    prevNode = childNode;
                  }
                });
              }
              break;
            }
          }
        }
      };
      window.addEventListener("keydown", onKeyDown);
      return () => window.removeEventListener("keydown", onKeyDown);
    }, []);

    return (
      <div
        css={css`
          display: flex;
          flex-direction: column;
          font-family: SF Mono, Inconsolata, "Courier New", Courier, monospace;
          font-size: var(--font-size-default);
          height: 100%;
          button {
            font-family: SF Mono, Inconsolata, "Courier New", Courier, monospace;
            font-size: var(--font-size-default);
          }
        `}
      >
        <div
          css={css`
            white-space: pre;
            flex-grow: 1;
            padding: 16px;
            box-sizing: border-box;
            overflow-y: auto;
          `}
        >
          <SourceFile sourceFile={sourceFile} onNodeSelect={onNodeSelect} />
        </div>
        {selectedNode !== undefined ? (
          <NodeDetails
            typeChecker={typeChecker}
            onNodeSelect={onNodeSelect}
            sourceFile={sourceFile}
            setCode={setCode}
            key={selectedNode.pos + selectedNode.kind}
          />
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
    document.body.style.userSelect = "none";
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
      document.body.style.userSelect = "auto";
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

const EXAMPLE_CODE = `class Person {
  protected name: string;
  protected constructor(theName: string) { this.name = theName; }
}

class Employee extends Person {
  private department: string;

  constructor(name: string, department: string) {
      super(name);
      this.department = department;
  }
}

export const susie = new Employee("Susie", "Sales");
`;

function App() {
  const [code, setCode] = React.useState(
    () => localStorage.getItem("code") ?? EXAMPLE_CODE
  );
  const collapseAll = useExpandStore((state) => state.collapseAll);
  const editorWidthRef = React.useRef(50);
  const editorDivRef = React.useRef<HTMLDivElement>(null);
  const editorRef = React.useRef<monacoEditor.editor.IStandaloneCodeEditor>();
  const editorLayout = React.useMemo(
    () =>
      throttle(() => {
        editorRef.current?.layout();
      }, 50),
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
    collapseAll();
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
          setCode={setCode}
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
