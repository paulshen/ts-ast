import { css } from "@emotion/core";
import * as React from "react";
import * as ts from "typescript";
import NodeButton from "./ui/NodeButton";
import styled from "@emotion/styled";

const TypeLabel = styled.label`
  background-color: var(--white);
  font-size: 10px;
  padding: 0 4px;
  position: absolute;
  left: 4px;
  top: -8px;
`;

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
    <div
      css={css`
        border: 1px solid var(--very-light);
        border-radius: 4px;
        margin: 12px -8px 8px;
        padding: 7px;
        position: relative;
      `}
    >
      <TypeLabel>Scope</TypeLabel>
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
    </div>
  );
}
