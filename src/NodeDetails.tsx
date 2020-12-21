import { css } from "@emotion/core";
import styled from "@emotion/styled";
import * as React from "react";
import * as ts from "typescript";
import NodeRaw from "./NodeRaw";
import NodeTypeChecker from "./NodeTypeChecker";
import { useSelectionStore } from "./state/SelectionStore";
import DetailBox from "./ui/DetailBox";
import NodeButton from "./ui/NodeButton";
import { getNodeName, getTsFlags } from "./Utils";

const Styles = {
  breadcrumbButton: css`
    &:hover {
      text-decoration: underline;
    }
  `,
  tabButton: (isSelected: boolean) => css`
    background-color: transparent;
    border: 0;
    border-right: 1px solid var(--very-light);
    font-weight: ${isSelected ? 600 : 400};
    padding: 4px;
  `,
};

function NodeBreadcrumbs({
  node,
  onNodeSelect,
}: {
  node: ts.Node;
  onNodeSelect: (node: ts.Node) => void;
}) {
  const children = [];
  let iter = node;
  let i = 0;
  while (iter !== undefined) {
    const current = iter;
    children.unshift(
      <NodeButton
        node={current}
        onNodeSelect={onNodeSelect}
        css={Styles.breadcrumbButton}
        key={i}
      />
    );
    if (current.kind !== ts.SyntaxKind.SourceFile) {
      children.unshift(<span key={`${i}-`}>{" → "}</span>);
    }
    iter = iter.parent;
    i++;
  }
  return (
    <div
      css={css`
        margin-bottom: 8px;
      `}
    >
      {children}
    </div>
  );
}

function stringify(value: any) {
  switch (typeof value) {
    case "function":
      return value.toString().match(/function[^(]*\([^)]*\)/)[0];
    case "object":
      return value ? JSON.stringify(value, stringify) : "null";
    case "undefined":
      return (
        <span
          css={css`
            color: #b0b0b0;
          `}
        >
          undefined
        </span>
      );
    case "number":
      return Number.isNaN(value) ? "NaN" : String(value);
    default:
      return JSON.stringify(value);
  }
}

function PropertyTable({ data }: { data: Array<[string, React.ReactNode]> }) {
  return (
    <div
      css={css`
        display: flex;
        margin-bottom: var(--line-height);
      `}
    >
      {data.map(([key, value]) => (
        <div
          css={css`
            padding-right: 8px;
          `}
          key={key}
        >
          <div
            css={css`
              font-weight: 600;
              white-space: nowrap;
            `}
          >
            {key}
          </div>
          <div>{value}</div>
        </div>
      ))}
    </div>
  );
}

const ChildRow = styled.div`
  display: flex;
  align-items: center;
  min-height: 28px;
`;
const ChildProperty = styled.div`
  color: #808080;
  display: flex;
  align-items: center;
  flex-shrink: 0;
  min-width: 128px;
`;
const ChildNodeName = css`
  padding: 3px 6px;
  margin: 2px 0;
  border: 1px solid #ae6ab4;
  color: #ae6ab4;
  border-radius: 4px;
  cursor: pointer;
  :hover {
    background-color: #ae6ab4;
    color: var(--white);
  }
`;
const ChildLine = styled.div`
  background-color: #e0e0e0;
  height: 1px;
  flex-grow: 1;
  min-width: 8px;
  margin-left: 4px;
`;
const NumChildContext = React.createContext(1);
function ChildValueLine({ index }: { index: number }) {
  const numChild = React.useContext(NumChildContext);
  return (
    <div
      css={css`
        display: flex;
        align-items: center;
        position: relative;
        align-self: stretch;
        margin-right: 4px;
      `}
    >
      <div
        css={css`
          background-color: #e0e0e0;
          height: 1px;
          width: 16px;
        `}
      />
      <div
        css={css`
          position: absolute;
          width: 1px;
          background-color: #e0e0e0;
          left: 0;
          top: ${index === 0 ? "50%" : 0};
          bottom: ${index === numChild - 1 ? "50%" : 0};
        `}
      />
    </div>
  );
}
function ChildSingleValueLine() {
  return (
    <div
      css={css`
        display: flex;
        align-items: center;
        position: relative;
        align-self: stretch;
        margin-right: 4px;
      `}
    >
      <div
        css={css`
          background-color: #e0e0e0;
          height: 1px;
          width: 16px;
        `}
      />
    </div>
  );
}

function Resizer({
  heightRef,
  setHeight,
}: {
  heightRef: React.RefObject<number>;
  setHeight: (height: number) => void;
}) {
  const onMouseMoveRef = React.useRef<(event: MouseEvent) => void>();
  const onMouseUpRef = React.useRef<(event: MouseEvent) => void>();
  const onMouseDown = (e: React.MouseEvent) => {
    const startY = e.pageY;
    const startHeightPx = (heightRef.current! / 100) * window.innerHeight;
    document.body.style.userSelect = "none";
    onMouseMoveRef.current = (e: MouseEvent) => {
      const deltaY = startY - e.pageY;
      const heightPx = startHeightPx + deltaY;
      const newHeight = (heightPx / window.innerHeight) * 100;
      setHeight(newHeight);
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
        top: -5px;
        left: 0;
        right: 0;
        height: 8px;
        cursor: ns-resize;
        --resizer-color: var(--very-light);
        :hover {
          --resizer-color: var(--light);
        }
      `}
      onMouseDown={onMouseDown}
    >
      <div
        css={css`
          height: 2px;
          background-color: var(--resizer-color);
          margin-top: 4px;
        `}
      />
    </div>
  );
}

function Tabs({
  selectedTab,
  onSelect,
}: {
  selectedTab: number;
  onSelect: (tab: number) => void;
}) {
  return (
    <div
      css={css`
        border-top: 1px solid var(--very-light);
        display: flex;
      `}
    >
      <button
        onClick={() => onSelect(0)}
        css={Styles.tabButton(selectedTab === 0)}
      >
        Default
      </button>
      <button
        onClick={() => onSelect(1)}
        css={Styles.tabButton(selectedTab === 1)}
      >
        Raw
      </button>
      <button
        onClick={() => onSelect(2)}
        css={Styles.tabButton(selectedTab === 2)}
      >
        TypeChecker
      </button>
      <button
        onClick={() => onSelect(3)}
        css={Styles.tabButton(selectedTab === 3)}
      >
        Text
      </button>
    </div>
  );
}

function DefaultBody({
  node,
  onNodeSelect,
  sourceFile,
  setCode,
}: {
  node: ts.Node;
  onNodeSelect: (node: ts.Node) => void;
  sourceFile: ts.SourceFile;
  setCode: (code: string) => void;
}) {
  const nonChildProperties = [];
  const childNodes = [];
  for (let key in node) {
    // @ts-ignore
    const value = node[key];
    if (
      key === "kind" ||
      key === "pos" ||
      key === "end" ||
      key === "parent" ||
      key === "flags" ||
      key === "modifierFlagsCache" ||
      key === "transformFlags" ||
      key === "original" ||
      key === "symbol" ||
      key === "locals" ||
      key === "nextContainer" ||
      key === "localSymbol" ||
      key === "flowNode" ||
      key === "emitNode" ||
      key === "contextualType" ||
      key === "inferenceContext" ||
      key === "endFlowNode" ||
      key === "returnFlowNode" ||
      key === "lineMap"
    ) {
      continue;
    } else if (typeof value === "function") {
      continue;
    } else if (Array.isArray(value)) {
      childNodes.push(
        <ChildRow key={key}>
          <ChildValueLine index={childNodes.length} />
          <ChildProperty>
            {key}
            <ChildLine />
          </ChildProperty>
          <div>
            <NumChildContext.Provider value={value.length}>
              {value.map((childValue, i) => {
                return (
                  <div
                    css={css`
                      display: flex;
                    `}
                    key={i}
                  >
                    <ChildValueLine index={i} />
                    <NodeButton
                      node={childValue}
                      onNodeSelect={onNodeSelect}
                      buttonStyle
                    />
                  </div>
                );
              })}
            </NumChildContext.Provider>
            {value.length === 0 ? (
              <div
                css={css`
                  display: flex;
                `}
              >
                <ChildSingleValueLine />
                []
              </div>
            ) : null}
          </div>
        </ChildRow>
      );
    } else if (typeof value === "object") {
      childNodes.push(
        <ChildRow key={key}>
          <ChildValueLine index={childNodes.length} />
          <ChildProperty>
            {key}
            <ChildLine />
          </ChildProperty>
          <div
            css={css`
              display: flex;
            `}
          >
            <ChildSingleValueLine />
            <NodeButton node={value} onNodeSelect={onNodeSelect} buttonStyle />
          </div>
        </ChildRow>
      );
    } else {
      nonChildProperties.push(
        <div key={key}>
          <span
            css={css`
              color: #808080;
            `}
          >
            {key}
            {": "}
          </span>
          {stringify(value)}
        </div>
      );
    }
  }

  const flagsData = [
    (() => {
      const flags = getTsFlags(ts.NodeFlags, node.flags);
      if (flags.length === 0) {
        return;
      }
      return [
        "Flags",
        <div>
          {flags.map((flag) => (
            // @ts-ignore
            <div key={flag}>{ts.NodeFlags[flag]}</div>
          ))}
        </div>,
      ];
    })(),
    (() => {
      if ((node as any).modifierFlagsCache === undefined) {
        return;
      }
      const flags = getTsFlags(
        ts.ModifierFlags,
        (node as any).modifierFlagsCache
      );
      if (flags.length === 0) {
        return;
      }
      return [
        "Modifier Cache",
        <div>
          {flags.map((flag) => (
            // @ts-ignore
            <div key={flag}>{ts.ModifierFlags[flag]}</div>
          ))}
        </div>,
      ];
    })(),
    (() => {
      if ((node as any).transformFlags === undefined) {
        return;
      }
      const flags = getTsFlags(ts.TransformFlags, (node as any).transformFlags);
      if (flags.length === 0) {
        return;
      }
      return [
        "Transform",
        <div>
          {flags.map((flag) => (
            // @ts-ignore
            <div key={flag}>{ts.TransformFlags[flag]}</div>
          ))}
        </div>,
      ];
    })(),
  ].filter((x) => x !== undefined);

  return (
    <div>
      {childNodes.length > 0 ? (
        <div
          css={css`
            margin: var(--line-height) 0;
            display: flex;
          `}
        >
          <ChildProperty>
            <div css={ChildNodeName}>{ts.SyntaxKind[node.kind]}</div>
            <ChildLine />
          </ChildProperty>
          <div>
            <NumChildContext.Provider value={childNodes.length}>
              {childNodes}
            </NumChildContext.Provider>
          </div>
        </div>
      ) : null}
      {nonChildProperties.length > 0 ? (
        <div
          css={css`
            margin-bottom: var(--line-height);
          `}
        >
          {nonChildProperties}
        </div>
      ) : null}
      <PropertyTable
        data={[
          ["Kind", node.kind],
          ["Position", `${node.pos}-${node.end}`],
        ]}
      />
      {flagsData.length > 0 ? (
        <DetailBox label="Flags">
          <PropertyTable
            // @ts-ignore
            data={flagsData}
          />
        </DetailBox>
      ) : null}
    </div>
  );
}

function NodeText({ node }: { node: ts.Node }) {
  return (
    <div
      css={css`
        white-space: pre;
        overflow: auto;
      `}
    >
      {node.getText()}
    </div>
  );
}

export default function NodeDetails({
  typeChecker,
  onNodeSelect,
  sourceFile,
  setCode,
}: {
  typeChecker: ts.TypeChecker;
  onNodeSelect: (node: ts.Node) => void;
  sourceFile: ts.SourceFile;
  setCode: (code: string) => void;
}) {
  const [tab, setTab] = React.useState(0);
  const heightRef = React.useRef(50);
  const heightDivRef = React.useRef<HTMLDivElement>(null);
  const setHeight = (height: number) => {
    heightRef.current = height;
    const heightDiv = heightDivRef.current;
    if (heightDiv !== null) {
      heightDiv.style.height = `${height}%`;
      heightDiv.style.minHeight = `${height}%`;
    }
  };

  const node = useSelectionStore((state) => state.selectedNode);
  if (node === undefined) {
    throw new Error();
  }
  const nodeNameText = getNodeName(node);
  return (
    <div
      css={css`
        display: flex;
        flex-direction: column;
        height: 50%;
        min-height: 50%;
        position: relative;
      `}
      ref={heightDivRef}
    >
      <div
        css={css`
          flex-grow: 1;
          overflow-y: auto;
          padding: 8px 16px 16px;
        `}
      >
        <NodeBreadcrumbs node={node} onNodeSelect={onNodeSelect} />
        <div
          css={css`
            font-size: 20px;
            font-weight: 600;
            margin-bottom: var(--line-height);
          `}
        >
          {ts.SyntaxKind[node.kind]}
          {nodeNameText !== undefined ? (
            <span
              css={css`
                background-color: #e0e0e0;
                color: var(--dark);
                margin-left: 8px;
              `}
            >
              {nodeNameText}
            </span>
          ) : null}
        </div>
        {tab === 0 ? (
          <DefaultBody
            node={node}
            onNodeSelect={onNodeSelect}
            sourceFile={sourceFile}
            setCode={setCode}
          />
        ) : tab === 1 ? (
          <NodeRaw node={node} />
        ) : tab === 2 ? (
          <NodeTypeChecker
            node={node}
            onNodeSelect={onNodeSelect}
            typeChecker={typeChecker}
          />
        ) : tab === 3 ? (
          <NodeText node={node} />
        ) : null}
      </div>
      <Tabs selectedTab={tab} onSelect={setTab} />
      <Resizer heightRef={heightRef} setHeight={setHeight} />
    </div>
  );
}
