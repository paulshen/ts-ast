import { css } from "@emotion/core";
import styled from "@emotion/styled";
import * as React from "react";
import * as ts from "typescript";
import { pathToString, useExpandStore } from "./state/ExpandStore";
import { useSelectionStore } from "./state/SelectionStore";
import NodeButton from "./ui/NodeButton";
import { getNodeName, isLandmarkNode, isParentNode } from "./Utils";

const Styles = {
  treeNode: css`
    color: #808080;
  `,
  treeNodeName: css`
    position: relative;
  `,
  treeNodePathSelected: css`
    border: 1px solid var(--purple);
    margin: -1px;
  `,
  treeNodeSelected: css`
    background-color: #ae6ab4;
  `,
  treeNodeHover: css`
    background-color: #ae6ab440;
  `,
  nodeName: css`
    margin-left: 8px;
  `,
};
const Pointer = styled.div`
  position: absolute;
  right: 100%;
  margin-right: 4px;
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
  path,
  onNodeSelect,
}: {
  node: ts.Node;
  path: Array<number>;
  onNodeSelect: (node: ts.Node) => void;
}) {
  const expanded = useExpandStore(({ expanded }) =>
    expanded.has(pathToString(path))
  );
  const setExpanded = useExpandStore(({ setExpanded }) => setExpanded);
  const children: Array<React.ReactNode> = [];
  let i = 0;
  node.forEachChild((childNode) => {
    children.push(
      <TreeNode
        node={childNode}
        path={[...path, i]}
        onNodeSelect={onNodeSelect}
        key={i}
      />
    );
    i++;
  });
  const nodeNameText = getNodeName(node);
  const isSelected = useSelectionStore((state) => state.selectedNode === node);
  const isHover = useSelectionStore((state) => state.hoverNode === node);
  const childIsHover = useSelectionStore(
    ({ hoverNode }) => hoverNode !== undefined && isParentNode(hoverNode, node)
  );
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
      {isSelected ? (
        <Pointer>→</Pointer>
      ) : isPathSelected ? (
        <Pointer>↓</Pointer>
      ) : null}
      <div
        css={css(
          Styles.treeNodeName,
          isHover ? Styles.treeNodeHover : undefined,
          isSelected ? Styles.treeNodeSelected : undefined
        )}
        ref={anchorRef}
      >
        {!ts.isSourceFile(node) && children.length > 0 ? (
          <button
            onClick={() => {
              setExpanded(path, !expanded);
            }}
            css={css`
              background-color: transparent;
              border: 0;
              color: var(--light);
              padding: 0 4px;
              position: absolute;
              right: 100%;
            `}
          >
            {expanded ? "-" : "+"}
          </button>
        ) : null}
        <NodeButton
          node={node}
          onNodeSelect={onNodeSelect}
          css={css`
            color: ${isSelected ? "var(--white)" : "var(--gray)"};
          `}
        />
        {nodeNameText !== undefined ? (
          <span
            css={css(
              Styles.nodeName,
              css`
                color: ${isSelected
                  ? "var(--white)"
                  : isLandmarkNodeValue
                  ? "var(--dark)"
                  : "var(--gray)"};
                font-weight: ${isLandmarkNodeValue ? 600 : 400};
              `
            )}
          >
            {nodeNameText}
          </span>
        ) : null}
        {node.symbol !== undefined ? <SymbolMarker /> : null}
      </div>
      {(expanded || childIsHover || isPathSelected) && children.length > 0 ? (
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
