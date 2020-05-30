import { css } from "@emotion/core";
import * as React from "react";
import * as ts from "typescript";
import { getTsFlags } from "./Utils";

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
    <div>
      <div
        css={css`
          font-weight: 600;
        `}
      >
        {"Type "}
        {typeChecker.typeToString(nodeType, node)}
      </div>
      <div>Flags {nodeType.flags}</div>
      <div>
        {getTsFlags(ts.TypeFlags, nodeType.flags)
          // @ts-ignore
          .map((flag) => ts.TypeFlags[flag])
          .join(" | ")}
      </div>
    </div>
  );
}
