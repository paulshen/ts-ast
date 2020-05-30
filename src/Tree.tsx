import { css } from "@emotion/core";
import styled from "@emotion/styled";
import * as React from "react";
import * as ts from "typescript";
import NodeButton from "./ui/NodeButton";
import { getNodeName, isLandmarkNode } from "./Utils";

const Styles = {
  treeNode: css`
    color: #808080;
    position: relative;
  `,
  nodeName: css`
    background-color: #f0f0f0;
    color: #000000;
    margin-left: 8px;
  `,
};
const Pointer = styled.div`
  position: absolute;
  right: 100%;
  top: 0;
`;
function SymbolMarker() {
  return (
    <div
      css={css`
        color: var(--light);
        position: absolute;
        right: 0;
        top: 0;
      `}
    >
      Symbol
    </div>
  );
}

export function TreeNode({
  node,
  selectedNode,
  onNodeSelect,
}: {
  node: ts.Node;
  selectedNode: ts.Node | undefined;
  onNodeSelect: (node: ts.Node) => void;
}) {
  const [expanded, setExpanded] = React.useState(true);
  const children: Array<React.ReactNode> = [];
  let i = 0;
  node.forEachChild((childNode) => {
    children.push(
      <TreeNode
        node={childNode}
        selectedNode={selectedNode}
        onNodeSelect={onNodeSelect}
        key={i}
      />
    );
    i++;
  });
  const nodeNameText = getNodeName(node);
  const isSelected = node === selectedNode;
  const anchorRef = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    if (isSelected) {
      // @ts-ignore
      anchorRef.current?.scrollIntoViewIfNeeded();
    }
  }, [isSelected]);
  const isLandmarkNodeValue = isLandmarkNode(node);
  return (
    <div css={Styles.treeNode}>
      {isSelected ? <Pointer>→</Pointer> : null}
      <div ref={anchorRef}>
        <NodeButton
          onClick={() => onNodeSelect(node)}
          css={css`
            color: ${isLandmarkNodeValue ? "var(--dark)" : "var(--gray)"};
            font-weight: ${isLandmarkNodeValue ? 600 : 400};
          `}
        >
          {ts.SyntaxKind[node.kind]}
        </NodeButton>
        {nodeNameText !== undefined ? (
          <span css={Styles.nodeName}>{nodeNameText}</span>
        ) : null}
        {node.symbol !== undefined ? <SymbolMarker /> : null}
        {children.length > 0 ? (
          <button
            onClick={() => {
              setExpanded((expanded) => !expanded);
            }}
            css={css`
              background-color: transparent;
              border: 0;
              color: #e0e0e0;
              font-family: SF Mono;
              font-size: 14px;
              padding: 0 4px;
            `}
          >
            {expanded ? "-" : "+"}
          </button>
        ) : null}
      </div>
      {expanded && children.length > 0 ? (
        <div
          css={css`
            padding-left: 16px;
          `}
        >
          {children}
        </div>
      ) : null}
    </div>
  );
}
