import { css } from "@emotion/core";
import * as React from "react";
import * as ts from "typescript";
import styled from "@emotion/styled";

function stringify(value: any) {
  switch (typeof value) {
    case "function":
      return "Function";
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

const LabelButton = styled.button`
  background-color: transparent;
  border: 0;
  color: var(--gray);
  cursor: pointer;
  padding: 0;
  text-decoration: underline;
`;

function ChildValue({ label, value }: { label: string; value: any }) {
  const [expanded, setExpanded] = React.useState(false);
  if (Array.isArray(value)) {
    return (
      <div>
        <LabelButton
          onClick={() => {
            setExpanded((expanded) => !expanded);
          }}
        >
          {label}
        </LabelButton>
        {": "}
        {value.length === 0 ? (
          <span>[]</span>
        ) : expanded ? (
          <>
            <span>[</span>
            <div
              css={css`
                padding-left: 16px;
              `}
            >
              {value.map((element, i) => (
                <ChildValue label={`${i}`} value={element} key={i} />
              ))}
            </div>
            <span>]</span>
          </>
        ) : (
          <span
            onClick={() => setExpanded(true)}
            css={css`
              cursor: pointer;
            `}
          >
            [..]
          </span>
        )}
      </div>
    );
  }
  if (typeof value === "object") {
    return (
      <div>
        <LabelButton
          onClick={() => {
            setExpanded((expanded) => !expanded);
          }}
        >
          {label}
        </LabelButton>
        {": "}
        {expanded ? (
          <>
            <span>{"{"}</span>
            <div
              css={css`
                padding-left: 16px;
              `}
            >
              {Object.keys(value).map((key) => (
                <ChildValue label={key} value={value[key]} key={key} />
              ))}
            </div>
            <div>{"}"}</div>
          </>
        ) : (
          <span
            onClick={() => setExpanded(true)}
            css={css`
              cursor: pointer;
            `}
          >
            {"{..}"}
          </span>
        )}
      </div>
    );
  }
  return (
    <div>
      <span
        css={css`
          color: var(--gray);
        `}
      >
        {label}:{" "}
      </span>
      {stringify(value)}
    </div>
  );
}

function Item({ node }: { node: ts.Node }) {
  const children: Array<React.ReactNode> = [];
  Object.keys(node).forEach((key, i) => {
    children.push(
      <ChildValue label={key} value={(node as any)[key]} key={key} />
    );
  });
  return (
    <>
      <span>{"{"}</span>
      <div
        css={css`
          padding-left: 16px;
        `}
      >
        {children}
      </div>
      <div>{"}"}</div>
    </>
  );
}

export default function NodeRaw({ node }: { node: ts.Node }) {
  return (
    <div>
      <Item node={node} />
    </div>
  );
}
