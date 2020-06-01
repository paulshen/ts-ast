import { css } from "@emotion/core";
import * as React from "react";
import * as ts from "typescript";
import NodeButton from "./ui/NodeButton";

export default function NodeSymbol({
  typeChecker,
  node,
  nodeSymbol,
  onNodeSelect,
}: {
  typeChecker: ts.TypeChecker;
  node: ts.Node;
  nodeSymbol: ts.Symbol;
  onNodeSelect: (node: ts.Node) => void;
}) {
  // @ts-ignore
  window.$symbol = nodeSymbol;
  return (
    <div>
      <div
        css={css`
          font-weight: 600;
        `}
      >
        {"Symbol "}
      </div>
      {nodeSymbol.valueDeclaration !== undefined ? (
        <div>
          <NodeButton
            onClick={() => onNodeSelect(nodeSymbol.valueDeclaration)}
            buttonStyle
          >
            {ts.SyntaxKind[nodeSymbol.valueDeclaration.kind]}
          </NodeButton>
        </div>
      ) : null}
    </div>
  );
}
