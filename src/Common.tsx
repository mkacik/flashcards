import React from "react";

export function TopRightButton(
  {onClick, imageUrl, size}:
  {onClick: () => void, imageUrl: string, size: number},
): React.ReactNode {
  return (
    <div className="top-right-button-box" onClick={onClick}>
      <img alt="button" src={imageUrl} width={size} height={size} />
    </div>
  );
}
