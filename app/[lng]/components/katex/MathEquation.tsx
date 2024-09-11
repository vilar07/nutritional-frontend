import React from 'react';
import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';

interface MathEquationProps {
  equation: string;
  inline?: boolean;
}

const MathEquation: React.FC<MathEquationProps> = ({ equation, inline = false }) => {
  return inline ? <InlineMath math={equation} /> : <BlockMath math={equation} />;
};

export default MathEquation;