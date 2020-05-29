import * as React from "react";
import * as ts from "typescript";
import { css } from "@emotion/core";

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

export function TreeNode({
  node,
  selectedNode,
  onNodeSelect,
}: {
  node: ts.Node;
  selectedNode: ts.Node | undefined;
  onNodeSelect: (node: ts.Node) => void;
}) {
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
  const nodeNameText: string | undefined = (node as any).name?.text;
  return (
    <div css={Styles.treeNode}>
      <div onClick={() => onNodeSelect(node)}>
        {node === selectedNode ? (
          <div
            css={css`
              position: absolute;
              right: 100%;
              top: 0;
            `}
          >
            →
          </div>
        ) : null}
        {ts.SyntaxKind[node.kind]}
        {nodeNameText !== undefined ? (
          <span css={Styles.nodeName}>{nodeNameText}</span>
        ) : null}
      </div>
      {children.length > 0 ? (
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
