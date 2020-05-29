import { css } from "@emotion/core";
import * as React from "react";
import * as ts from "typescript";
import NodeButton from "./ui/NodeButton";
import { getNodeName } from "./Utils";
import styled from "@emotion/styled";

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
      <NodeButton onClick={() => onNodeSelect(current)} key={i}>
        {ts.SyntaxKind[current.kind]}
      </NodeButton>
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

function renderBody(node: ts.Node, onNodeSelect: (node: ts.Node) => void) {
  const children = [];
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
      key === "transformFlags"
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
                    onClick={() => onNodeSelect(childValue)}
                    css={ChildNodeName}
                  >
                    {ts.SyntaxKind[childValue.kind]}
                  </NodeButton>
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
            <NodeButton onClick={() => onNodeSelect(value)} css={ChildNodeName}>
              {ts.SyntaxKind[value.kind]}
            </NodeButton>
          </div>
        </ChildRow>
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
      {childNodes.length > 0 ? (
        <div
          css={css`
            margin-top: var(--line-height);
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
  const nodeNameText = getNodeName(node);
  return (
    <div
      css={css`
        border-top: 1px solid #e0e0e0;
        font-family: SF Mono;
        font-size: var(--font-size-default);
        padding: 16px;
        box-sizing: border-box;
        flex-basis: 50%;
        overflow-y: auto;
      `}
    >
      <NodeBreadcrumbs node={node} onNodeSelect={onNodeSelect} />
      <div
        css={css`
          font-size: 24px;
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
      {renderBody(node, onNodeSelect)}
    </div>
  );
}
