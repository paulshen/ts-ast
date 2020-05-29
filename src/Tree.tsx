import { css } from "@emotion/core";
import styled from "@emotion/styled";
import * as React from "react";
import * as ts from "typescript";
import NodeButton from "./ui/NodeButton";
import { getNodeName } from "./Utils";

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
  const nodeNameText = getNodeName(node);
  return (
    <div css={Styles.treeNode}>
      {node === selectedNode ? <Pointer>→</Pointer> : null}
      <NodeButton onClick={() => onNodeSelect(node)}>
        {ts.SyntaxKind[node.kind]}
      </NodeButton>
      {nodeNameText !== undefined ? (
        <span css={Styles.nodeName}>{nodeNameText}</span>
      ) : null}
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
