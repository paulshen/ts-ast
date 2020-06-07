import { css } from "@emotion/core";
import styled from "@emotion/styled";
import * as React from "react";

const TypeLabel = styled.label`
  background-color: var(--white);
  font-size: 10px;
  padding: 0 4px;
  position: absolute;
  left: 4px;
  top: -8px;
`;

export default function DetailBox({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div
      css={css`
        border-top: 1px solid var(--very-light);
        margin: 12px -8px 8px;
        padding: 7px;
        position: relative;
      `}
    >
      <TypeLabel>{label}</TypeLabel>
      {children}
    </div>
  );
}
