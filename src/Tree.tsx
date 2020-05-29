import * as React from "react";
import * as ts from "typescript";
import { css } from "@emotion/core";

const Styles = {
  treeNode: css`
    color: #808080;
  `,
  nodeName: css`
    color: #000000;
    margin-left: 8px;
  `,
};

export function TreeNode({ node }: { node: ts.Node }) {
  const children: Array<React.ReactNode> = [];
  let i = 0;
  node.forEachChild((childNode) => {
    children.push(<TreeNode node={childNode} key={i} />);
    i++;
  });
  const nodeNameText: string | undefined = (node as any).name?.text;
  return (
    <div css={Styles.treeNode}>
      <div>
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
