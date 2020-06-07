import { css } from "@emotion/core";
import styled from "@emotion/styled";
import * as React from "react";
import * as ts from "typescript";
import NodeButton from "./ui/NodeButton";
import { getNodeName, isLandmarkNode } from "./Utils";
import { useSelectionStore } from "./state/SelectionStore";

const Styles = {
  treeNode: css`
    color: #808080;
    position: relative;
  `,
  treeNodePathSelected: css`
    border: 1px solid var(--purple);
    margin: -1px;
  `,
  treeNodeSelected: css`
    background-color: #ae6ab420;
  `,
  treeNodeHover: css`
    background-color: #ae6ab440;
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
  color: var(--purple);
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
  onNodeSelect,
}: {
  node: ts.Node;
  onNodeSelect: (node: ts.Node) => void;
}) {
  const [expanded, setExpanded] = React.useState(true);
  const children: Array<React.ReactNode> = [];
  let i = 0;
  node.forEachChild((childNode) => {
    children.push(
      <TreeNode node={childNode} onNodeSelect={onNodeSelect} key={i} />
    );
    i++;
  });
  const nodeNameText = getNodeName(node);
  const isSelected = useSelectionStore((state) => state.selectedNode === node);
  const isHover = useSelectionStore((state) => state.hoverNode === node);
  const isPathSelected = useSelectionStore(
    (state) =>
      state.selectedPath !== undefined && state.selectedPath.includes(node)
  );
  const anchorRef = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    if (isSelected) {
      // @ts-ignore
      anchorRef.current?.scrollIntoViewIfNeeded();
    }
  }, [isSelected]);
  const isLandmarkNodeValue = isLandmarkNode(node);
  return (
    <div
      css={css(
        Styles.treeNode,
        isPathSelected ? Styles.treeNodePathSelected : undefined
      )}
    >
      {isSelected ? <Pointer>→</Pointer> : null}
      <div
        css={css(
          isSelected ? Styles.treeNodeSelected : undefined,
          isHover ? Styles.treeNodeHover : undefined
        )}
        ref={anchorRef}
      >
        <NodeButton
          node={node}
          onNodeSelect={onNodeSelect}
          css={css`
            color: ${isLandmarkNodeValue ? "var(--dark)" : "var(--gray)"};
            font-weight: ${isLandmarkNodeValue ? 600 : 400};
          `}
        />
        {nodeNameText !== undefined ? (
          <span css={css(Styles.nodeName)}>{nodeNameText}</span>
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
