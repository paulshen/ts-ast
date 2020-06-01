import { css } from "@emotion/core";
import * as React from "react";
import * as ts from "typescript";
import { useSelectionStore } from "../state/SelectionStore";

const Styles = {
  button: css`
    padding: 3px 6px;
    margin: 2px 0;
    border: 1px solid var(--gray);
    border-radius: 4px;
  `,
};

export default function NodeButton({
  node,
  onNodeSelect,
  buttonStyle = false,
  className,
}: {
  node: ts.Node;
  onNodeSelect: (node: ts.Node) => void;
  buttonStyle?: boolean;
  className?: string;
}) {
  const setHoverNode = useSelectionStore((state) => state.setHoverNode);
  return (
    <button
      onClick={() => onNodeSelect(node)}
      onMouseEnter={() => setHoverNode(node)}
      onMouseLeave={() => setHoverNode(undefined)}
      css={css(
        css`
          background-color: transparent;
          padding: 0;
          border: 0;
          cursor: pointer;
          margin: 0;
          font-family: SF Mono;
          font-size: 14px;
          outline-style: none;
        `,
        buttonStyle ? Styles.button : undefined
      )}
      className={className}
    >
      {ts.SyntaxKind[node.kind]}
    </button>
  );
}
