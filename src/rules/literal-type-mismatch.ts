import { ESLintUtils, TSESTree, TSESLint } from '@typescript-eslint/utils';
import * as ts from 'typescript';

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

      // For object literals, check if all required properties are present
      // This catches cases like `{} as RequiredInterface` which TypeScript allows
      // with `as` but would reject with `satisfies`
      let hasMissingProperties = false;
      if (node.expression.type === 'ObjectExpression' && isAssignable) {
        const targetProperties = targetType.getProperties();
        const expressionProperties = expressionType.getProperties();
        
        for (const targetProp of targetProperties) {
          const isOptional = (targetProp.flags & ts.SymbolFlags.Optional) !== 0;
          if (!isOptional) {
            const hasProp = expressionProperties.some(p => p.name === targetProp.name);
            if (!hasProp) {
              hasMissingProperties = true;
              break;
            }
          }
        }
      }

      if (!isAssignable || hasMissingProperties) {
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
