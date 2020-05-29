import * as React from "react";
import * as ts from "typescript";
import { css } from "@emotion/core";
import NodeButton from "./ui/NodeButton";

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

function PropertyTable({ data }: { data: Array<[string, React.ReactNode]> }) {
  return (
    <div
      css={css`
        display: flex;
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

function renderBody(node: ts.Node, onNodeSelect: (node: ts.Node) => void) {
  if (ts.isVariableDeclaration(node)) {
    return <VariableDeclaration node={node} />;
  }
  const children = [];
  for (let key in node) {
    // @ts-ignore
    const value = node[key];
    if (
      key === "kind" ||
      key === "pos" ||
      key === "end" ||
      key === "flags" ||
      key === "modifierFlagsCache" ||
      key === "transformFlags"
    ) {
      continue;
    } else if (typeof value === "function") {
      continue;
    } else if (Array.isArray(value)) {
      children.push(
        <React.Fragment key={key}>
          <div
            css={css`
              color: #808080;
            `}
          >
            {key}
          </div>
          <div
            css={css`
              padding-left: 16px;
            `}
          >
            {value.map((childValue, i) => {
              return (
                <div key={i}>
                  <NodeButton onClick={() => onNodeSelect(childValue)}>
                    {ts.SyntaxKind[childValue.kind]}
                  </NodeButton>
                </div>
              );
            })}
          </div>
        </React.Fragment>
      );
    } else if (typeof value === "object") {
      children.push(
        <div key={key}>
          <div
            css={css`
              color: #808080;
            `}
          >
            {key}{" "}
            <NodeButton onClick={() => onNodeSelect(value)}>
              {ts.SyntaxKind[value.kind]}
            </NodeButton>
          </div>
        </div>
      );
    } else {
      children.push(
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
      <PropertyTable
        data={[
          ["Kind", node.kind],
          ["Position", `${node.pos}-${node.end}`],
        ]}
      />
      <PropertyTable
        // @ts-ignore
        data={[
          ["Flags", node.flags],
          (node as any).modifierFlagsCache !== undefined
            ? (["Modifier Cache", (node as any).modifierFlagsCache] as [
                string,
                React.ReactNode
              ])
            : undefined,
          (node as any).transformFlags !== undefined
            ? (["Transform", (node as any).transformFlags] as [
                string,
                React.ReactNode
              ])
            : undefined,
        ].filter((x) => x !== undefined)}
      />
      {children}
    </div>
  );
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
        overflow-y: auto;
      `}
    >
      <div>{ts.SyntaxKind[node.kind]}</div>
      {renderBody(node, onNodeSelect)}
    </div>
  );
}
