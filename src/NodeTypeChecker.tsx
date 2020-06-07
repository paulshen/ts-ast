import { css } from "@emotion/core";
import * as React from "react";
import * as ts from "typescript";
import DetailBox from "./ui/DetailBox";
import NodeButton from "./ui/NodeButton";
import { getTsFlags } from "./Utils";

function NodeType({
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

function NodeSymbol({
  nodeSymbol,
  onNodeSelect,
}: {
  nodeSymbol: ts.Symbol;
  onNodeSelect: (node: ts.Node) => void;
}) {
  // @ts-ignore
  window.$symbol = nodeSymbol;
  return (
    <DetailBox label="Symbol Declaration">
      {nodeSymbol.valueDeclaration !== undefined ? (
        <div>
          <NodeButton
            node={nodeSymbol.valueDeclaration}
            onNodeSelect={onNodeSelect}
            buttonStyle
          />
        </div>
      ) : null}
    </DetailBox>
  );
}

function NodeScope({
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

export default function NodeTypeChecker({
  node,
  onNodeSelect,
  typeChecker,
}: {
  node: ts.Node;
  onNodeSelect: (node: ts.Node) => void;
  typeChecker: ts.TypeChecker;
}) {
  const nodeType = React.useMemo(() => {
    if (node.parent === undefined) {
      return undefined;
    }
    return typeChecker.getTypeAtLocation(node);
  }, [typeChecker, node]);
  const nodeSymbol = React.useMemo(
    () => typeChecker.getSymbolAtLocation(node),
    [typeChecker, node]
  );

  return (
    <div>
      {nodeType !== undefined ? (
        <NodeType typeChecker={typeChecker} node={node} nodeType={nodeType} />
      ) : null}
      {nodeSymbol !== undefined ? (
        <NodeSymbol nodeSymbol={nodeSymbol} onNodeSelect={onNodeSelect} />
      ) : null}
      <NodeScope
        typeChecker={typeChecker}
        node={node}
        onNodeSelect={onNodeSelect}
      />
    </div>
  );
}
