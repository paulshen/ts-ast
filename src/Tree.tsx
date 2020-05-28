import * as React from "react";
import * as ts from "typescript";
import { css } from "@emotion/core";

function VariableDeclarationListNode({
  node,
}: {
  node: ts.VariableDeclarationList;
}) {
  return (
    <div>
      <div>
        {`<Variable>`}
        {(node.flags & ts.NodeFlags.Const) !== 0 ? " Const" : null}
        {(node.flags & ts.NodeFlags.Let) !== 0 ? " Let" : null}
      </div>
      <div
        css={css`
          padding-left: 16px;
        `}
      >
        {node.declarations.map((declaration, i) => (
          <VariableDeclarationNode node={declaration} key={i} />
        ))}
      </div>
    </div>
  );
}

function VariableDeclarationNode({ node }: { node: ts.VariableDeclaration }) {
  return (
    <div>
      {(node.name as ts.Identifier).text}
      {node.initializer ? <TreeNode node={node.initializer} /> : null}
    </div>
  );
}

function FunctionDeclarationNode({ node }: { node: ts.FunctionDeclaration }) {
  return (
    <div>
      <div>
        {`<Function>`}
        {node.name ? <span> {node.name.text}</span> : null}
      </div>
      <div
        css={css`
          padding-left: 16px;
        `}
      >
        <div>
          Parameters (
          {node.parameters
            .map((parameter, i) => (parameter.name as ts.Identifier).text)
            .join(", ")}
          )
        </div>
        {node.body !== undefined ? <TreeNode node={node.body} /> : null}
      </div>
    </div>
  );
}

function ClassDeclarationNode({ node }: { node: ts.ClassDeclaration }) {
  return (
    <div>
      <div>
        {`<Class>`}
        {node.name ? <span> {node.name.text}</span> : null}
      </div>
      <div
        css={css`
          padding-left: 16px;
        `}
      >
        {node.members.map((member, i) => (
          <TreeNode node={member} key={i} />
        ))}
      </div>
    </div>
  );
}

export function TreeNode({ node }: { node: ts.Node }) {
  if (ts.isVariableDeclarationList(node)) {
    return <VariableDeclarationListNode node={node} />;
  }
  if (ts.isVariableDeclaration(node)) {
    return <VariableDeclarationNode node={node} />;
  }
  if (ts.isFunctionDeclaration(node)) {
    return <FunctionDeclarationNode node={node} />;
  }
  if (ts.isClassDeclaration(node)) {
    return <ClassDeclarationNode node={node} />;
  }

  const children: Array<React.ReactNode> = [];
  let i = 0;
  node.forEachChild((childNode) => {
    children.push(<TreeNode node={childNode} key={i} />);
    i++;
  });
  return (
    <div>
      <div>{ts.SyntaxKind[node.kind]}</div>
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
