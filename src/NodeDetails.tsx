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
        buttonStyle
        key={i}
      />
    );
    if (current.kind !== ts.SyntaxKind.SourceFile) {
      children.unshift(<span key={`${i}-`}>{" > "}</span>);
    }
    iter = iter.parent;
    i++;
  }
  return (
    <div
      css={css`
        margin-bottom: var(--line-height);
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
`;
const ChildProperty = styled.div`
  color: #808080;
  display: flex;
  align-items: center;
  min-width: 128px;
`;
const ChildNodeName = css`
  padding: 3px 6px;
  margin: 2px 0;
  border: 1px solid var(--gray);
  border-radius: 4px;
`;
const ChildLine = styled.div`
  background-color: #e0e0e0;
  height: 1px;
  flex-grow: 1;
  min-width: 8px;
  margin-left: 4px;
`;
function ChildPropertyLine({ index }: { index: number }) {
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
      {index !== 0 ? (
        <div
          css={css`
            position: absolute;
            width: 1px;
            height: 100%;
            background-color: #e0e0e0;
            left: 0;
            top: -13px;
          `}
        />
      ) : null}
    </div>
  );
}
function ChildValueLine({ index }: { index: number }) {
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
      {index !== 0 ? (
        <div
          css={css`
            position: absolute;
            width: 1px;
            height: 100%;
            background-color: #e0e0e0;
            left: 0;
            top: -13px;
          `}
        />
      ) : null}
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
        right: 0;
        height: 8px;
        cursor: ns-resize;
      `}
      onMouseDown={onMouseDown}
    ></div>
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
    </div>
  );
}

function DefaultBody({
  node,
  onNodeSelect,
}: {
  node: ts.Node;
  onNodeSelect: (node: ts.Node) => void;
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
          <ChildPropertyLine index={childNodes.length} />
          <ChildProperty>
            {key}
            <ChildLine />
          </ChildProperty>
          <div>
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
            {value.length === 0 ? (
              <div
                css={css`
                  display: flex;
                `}
              >
                <ChildValueLine index={0} />
                []
              </div>
            ) : null}
          </div>
        </ChildRow>
      );
    } else if (typeof value === "object") {
      childNodes.push(
        <ChildRow key={key}>
          <ChildPropertyLine index={childNodes.length} />
          <ChildProperty>
            {key}
            <ChildLine />
          </ChildProperty>
          <div
            css={css`
              display: flex;
            `}
          >
            <ChildValueLine index={0} />
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
            <div
              css={css`
                ${ChildNodeName}
                color: var(--dark);
              `}
            >
              {ts.SyntaxKind[node.kind]}
            </div>
            <ChildLine />
          </ChildProperty>
          <div>{childNodes}</div>
        </div>
      ) : null}
      <PropertyTable
        data={[
          ["Kind", node.kind],
          ["Position", `${node.pos}-${node.end}`],
        ]}
      />
      {nonChildProperties.length > 0 ? (
        <div
          css={css`
            margin-bottom: var(--line-height);
          `}
        >
          {nonChildProperties}
        </div>
      ) : null}
      <DetailBox label="Flags">
        <PropertyTable
          // @ts-ignore
          data={[
            [
              "Flags",

              <div>
                {getTsFlags(ts.NodeFlags, node.flags).map((flag) => (
                  // @ts-ignore
                  <div key={flag}>{ts.NodeFlags[flag]}</div>
                ))}
              </div>,
            ],
            (node as any).modifierFlagsCache !== undefined
              ? ([
                  "Modifier Cache",
                  <div>
                    {getTsFlags(
                      ts.ModifierFlags,
                      (node as any).modifierFlagsCache
                    ).map((flag) => (
                      // @ts-ignore
                      <div key={flag}>{ts.ModifierFlags[flag]}</div>
                    ))}
                  </div>,
                ] as [string, React.ReactNode])
              : undefined,
            (node as any).transformFlags !== undefined
              ? ([
                  "Transform",
                  <div>
                    {
                      // @ts-ignore
                      getTsFlags(
                        ts.TransformFlags,
                        (node as any).transformFlags
                      ).map((flag) => (
                        // @ts-ignore
                        <div key={flag}>{ts.TransformFlags[flag]}</div>
                      ))
                    }
                  </div>,
                ] as [string, React.ReactNode])
              : undefined,
          ].filter((x) => x !== undefined)}
        />
      </DetailBox>
    </div>
  );
}

export default function NodeDetails({
  typeChecker,
  onNodeSelect,
}: {
  typeChecker: ts.TypeChecker;
  onNodeSelect: (node: ts.Node) => void;
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
        border-top: 1px solid #e0e0e0;
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
          <DefaultBody node={node} onNodeSelect={onNodeSelect} />
        ) : tab === 1 ? (
          <NodeRaw node={node} />
        ) : tab === 2 ? (
          <NodeTypeChecker
            node={node}
            onNodeSelect={onNodeSelect}
            typeChecker={typeChecker}
          />
        ) : null}
      </div>
      <Tabs selectedTab={tab} onSelect={setTab} />
      <Resizer heightRef={heightRef} setHeight={setHeight} />
    </div>
  );
}
