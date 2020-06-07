import { css } from "@emotion/core";
import * as React from "react";
import * as ts from "typescript";
import DetailBox from "./ui/DetailBox";
import NodeButton from "./ui/NodeButton";

export default function NodeScope({
  typeChecker,
  node,
  onNodeSelect,
}: {
  typeChecker: ts.TypeChecker;
  node: ts.Node;
  onNodeSelect: (node: ts.Node) => void;
}) {
  const symbols = typeChecker.getSymbolsInScope(
    node,
    ts.SymbolFlags.FunctionScopedVariable |
      ts.SymbolFlags.BlockScopedVariable |
      ts.SymbolFlags.Property |
      ts.SymbolFlags.EnumMember |
      ts.SymbolFlags.Function |
      ts.SymbolFlags.Class |
      ts.SymbolFlags.Interface
  );
  return (
    <DetailBox label="Scope">
      <div>
        {symbols.map((symbol, i) => {
          if (symbol.valueDeclaration !== undefined) {
            return (
              <NodeButton
                node={symbol.valueDeclaration}
                onNodeSelect={onNodeSelect}
                customLabel={symbol.name}
                buttonStyle
                css={css`
                  margin-right: 8px;
                `}
                key={i}
              />
            );
          }
          return null;
        })}
      </div>
    </DetailBox>
  );
}
