import { css } from "@emotion/core";
import * as React from "react";
import * as ts from "typescript";
import DetailBox from "./ui/DetailBox";
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
    <DetailBox label="Type">
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
    </DetailBox>
  );
}
