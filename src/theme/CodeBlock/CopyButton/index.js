import React from 'react';
import CopyButton from '@theme-original/CodeBlock/CopyButton';

function trimCode(code) {
  let lines = code.split("\n")
  return lines.map((line) => {
    if (line.length > 2 && line.substring(0, 2) === '$ ') {
      return line.substring(2)
    }
    return line
  }).join("\n")
}

// Update the CopyButton to remove the '$ ' from the code
export default function CopyButtonWrapper(props) {
  const updatedProps = { ...props };
  if (updatedProps?.code?.length > 2) {
    updatedProps.code = trimCode(updatedProps.code)
  }
  return (
    <>
      <CopyButton {...updatedProps} />
    </>
  );
}
