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
  customLabel,
  className,
}: {
  node: ts.Node;
  onNodeSelect: (node: ts.Node) => void;
  buttonStyle?: boolean;
  customLabel?: string;
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
          outline-style: none;
        `,
        buttonStyle ? Styles.button : undefined
      )}
      className={className}
    >
      {customLabel !== undefined ? customLabel : ts.SyntaxKind[node.kind]}
    </button>
  );
}
