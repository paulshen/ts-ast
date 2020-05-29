import * as React from "react";
import * as ts from "typescript";
import { css } from "@emotion/core";

function VariableDeclaration({ node }: { node: ts.VariableDeclaration }) {
  const nodeName = node.name;
  if (ts.isIdentifier(nodeName)) {
    return <div>{nodeName.text}</div>;
  }
  return <div>{node.name}</div>;
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

function renderBody(node: ts.Node, onNodeSelect: (node: ts.Node) => void) {
  if (ts.isVariableDeclaration(node)) {
    return <VariableDeclaration node={node} />;
  }
  const children = [];
  for (let key in node) {
    // @ts-ignore
    const value = node[key];
    if (typeof value === "function") {
      continue;
    } else if (Array.isArray(value)) {
      children.push(
        <React.Fragment key={key}>
          <div>{key}</div>
          <div
            css={css`
              padding-left: 16px;
            `}
          >
            {value.map((childValue, i) => {
              return (
                <div key={i} onClick={() => onNodeSelect(childValue)}>
                  {ts.SyntaxKind[childValue.kind]}
                </div>
              );
            })}
          </div>
        </React.Fragment>
      );
    } else if (typeof value === "object") {
      children.push(
        <div key={key}>
          <div>{key}</div>
          <div
            css={css`
              padding-left: 16px;
            `}
            onClick={() => onNodeSelect(value)}
          >
            {ts.SyntaxKind[value.kind]}
          </div>
        </div>
      );
    } else {
      children.push(
        <div key={key}>
          {key}: {stringify(value)}
        </div>
      );
    }
  }
  return <div>{children}</div>;
}

export default function NodeDetails({
  node,
  onNodeSelect,
}: {
  node: ts.Node;
  onNodeSelect: (node: ts.Node) => void;
}) {
  return (
    <div
      css={css`
        border-top: 1px solid #f0f0f0;
        font-family: SF Mono;
        font-size: 14px;
        padding: 16px;
        box-sizing: border-box;
        flex-basis: 50%;
      `}
    >
      <div>{ts.SyntaxKind[node.kind]}</div>
      {renderBody(node, onNodeSelect)}
    </div>
  );
}
