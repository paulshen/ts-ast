import { css } from "@emotion/core";
import * as React from "react";
import * as ts from "typescript";
import { getTsFlags } from "./Utils";
import styled from "@emotion/styled";

const TypeLabel = styled.label`
  background-color: var(--white);
  font-size: 10px;
  padding: 0 4px;
  position: absolute;
  left: 4px;
  top: -8px;
`;

export default function NodeType({
  typeChecker,
  node,
  nodeType,
}: {
  typeChecker: ts.TypeChecker;
  node: ts.Node;
  nodeType: ts.Type;
}) {
  return (
    <div
      css={css`
        border: 1px solid var(--very-light);
        border-radius: 4px;
        margin: 12px -8px 8px;
        padding: 7px;
        position: relative;
      `}
    >
      <TypeLabel>Type</TypeLabel>
      <div
        css={css`
          font-weight: 600;
        `}
      >
        {typeChecker.typeToString(nodeType, node)}
      </div>
      <div>
        {"Flags = "}
        {getTsFlags(ts.TypeFlags, nodeType.flags)
          // @ts-ignore
          .map((flag) => ts.TypeFlags[flag])
          .join(" | ")}
      </div>
    </div>
  );
}
