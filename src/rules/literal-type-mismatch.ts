import { ESLintUtils, TSESTree, TSESLint } from '@typescript-eslint/utils';
import * as ts from 'typescript';
import { hasMissingRequiredProperties } from './utils';

type MessageIds = 'literalTypeMismatch' | 'requiresTypeInformation';

const isConstAssertion = (node: TSESTree.TSAsExpression): boolean => {
  return (
    node.typeAnnotation.type === 'TSTypeReference' &&
    node.typeAnnotation.typeName.type === 'Identifier' &&
    node.typeAnnotation.typeName.name === 'const'
  );
};

const isLiteralExpression = (node: TSESTree.Expression): boolean => {
  return (
    node.type === 'ObjectExpression' ||
    node.type === 'ArrayExpression' ||
    node.type === 'Literal'
  );
};

export const literalTypeMismatch = ESLintUtils.RuleCreator(
  (name) => `https://github.com/johannesvollmer/eslint-ts-avoid-as#${name}`
)<[], MessageIds>({
  name: 'literal-type-mismatch',
  meta: {
    type: 'problem',
    docs: {
      description: 'Error when literal values are asserted to incompatible types using `as`',
    },
    messages: {
      literalTypeMismatch: 'This literal does not match the declared type. Use the `satisfies` keyword instead of `as` to enable type checking.',
      requiresTypeInformation: 'Checking type assignability requires full type information. Ensure you are using @typescript-eslint/parser with project configuration.',
    },
    schema: [],
    fixable: undefined,
  },
  defaultOptions: [],
  create(context) {
    const services = ESLintUtils.getParserServices(context, true);
    
    const handleAsExpression = (node: TSESTree.TSAsExpression) => {
      // Skip if filename contains .test. (test files)
      const filename = context.filename || context.getFilename();
      if (filename.includes('.test.')) {
        return;
      }
      
      if (isConstAssertion(node) || !isLiteralExpression(node.expression)) {
        return;
      }

      if (!services.program) {
        return;
      }

      const checker = services.program.getTypeChecker();
      const tsExpressionNode = services.esTreeNodeToTSNodeMap.get(node.expression);
      const tsTypeAnnotation = services.esTreeNodeToTSNodeMap.get(node.typeAnnotation);

      if (!tsExpressionNode || !tsTypeAnnotation || !ts.isTypeNode(tsTypeAnnotation)) {
        return;
      }

      const expressionType = checker.getTypeAtLocation(tsExpressionNode);
      const targetType = checker.getTypeFromTypeNode(tsTypeAnnotation);
      const isAssignable = checker.isTypeAssignableTo(expressionType, targetType);
      const missingProperties = isAssignable && hasMissingRequiredProperties(node, expressionType, targetType);

      if (!isAssignable || missingProperties) {
        context.report({
          node,
          messageId: 'literalTypeMismatch',
        });
      }
    };

    return {
      TSAsExpression: handleAsExpression,
    };
  },
});

export default literalTypeMismatch;
