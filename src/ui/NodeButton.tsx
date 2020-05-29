import { css } from "@emotion/core";
import * as React from "react";

export default function NodeButton({
  children,
  onClick,
  className,
}: {
  children: React.ReactNode;
  onClick: () => void;
  className?: string;
}) {
  return (
    <button
      onClick={onClick}
      css={css`
        background-color: transparent;
        padding: 0;
        border: 0;
        cursor: pointer;
        margin: 0;
        font-family: SF Mono;
        font-size: 14px;
        outline-style: none;
        &:hover {
          text-decoration: underline;
        }
      `}
      className={className}
    >
      {children}
    </button>
  );
}
