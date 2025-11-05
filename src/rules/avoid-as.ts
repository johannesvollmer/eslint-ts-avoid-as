import { ESLintUtils, TSESTree } from '@typescript-eslint/utils';
import * as ts from 'typescript';

type MessageIds = 'avoidAsWithLiteral' | 'incompatibleTypeAssertion' | 'requiresTypeInformation';

export const avoidAs = ESLintUtils.RuleCreator(
  (name) => `https://github.com/johannesvollmer/eslint-ts-avoid-as#${name}`
)<[], MessageIds>({
  name: 'avoid-as',
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow using `as` for type assertions on literals; use `satisfies` instead',
    },
    messages: {
      avoidAsWithLiteral: 'Avoid using `as` for type assertions on literals. Use `satisfies` instead.',
      incompatibleTypeAssertion: 'Type assertion is invalid: Type \'{{sourceType}}\' is not assignable to type \'{{targetType}}\'.',
      requiresTypeInformation: 'Checking type assignability requires full type information. Ensure you are using @typescript-eslint/parser with project configuration.',
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    const services = ESLintUtils.getParserServices(context, true);
    
    // Check if full type information is available
    if (!services.program) {
      // If no type information is available, we can only detect literal assertions
      // but cannot check type assignability
      return {
        TSAsExpression(node: TSESTree.TSAsExpression) {
          // Check if the expression being cast is a literal
          if (
            node.expression.type === 'ObjectExpression' ||
            node.expression.type === 'ArrayExpression' ||
            node.expression.type === 'Literal'
          ) {
            context.report({
              node,
              messageId: 'avoidAsWithLiteral',
            });
          }
        },
      };
    }

    const checker = services.program.getTypeChecker();

    return {
      TSAsExpression(node: TSESTree.TSAsExpression) {
        // Check if the expression being cast is a literal (object, array, string, number, etc.)
        if (
          node.expression.type === 'ObjectExpression' ||
          node.expression.type === 'ArrayExpression' ||
          node.expression.type === 'Literal'
        ) {
          // Get TypeScript nodes for type checking
          const tsExpressionNode = services.esTreeNodeToTSNodeMap.get(node.expression);
          const tsTypeAnnotation = services.esTreeNodeToTSNodeMap.get(node.typeAnnotation);

          // Ensure we have valid TypeScript nodes
          if (!tsExpressionNode || !tsTypeAnnotation || !ts.isTypeNode(tsTypeAnnotation)) {
            // Fall back to the original behavior if we can't perform type checking
            context.report({
              node,
              messageId: 'avoidAsWithLiteral',
            });
            return;
          }

          // Get the type of the expression and the target type
          const expressionType = checker.getTypeAtLocation(tsExpressionNode);
          const targetType = checker.getTypeFromTypeNode(tsTypeAnnotation);

          // Check if the expression type is assignable to the target type
          const isAssignable = checker.isTypeAssignableTo(expressionType, targetType);

          if (!isAssignable) {
            // Get type strings for the error message
            const sourceTypeString = checker.typeToString(expressionType);
            const targetTypeString = checker.typeToString(targetType);
            
            // Report as a problem if types are incompatible
            context.report({
              node,
              messageId: 'incompatibleTypeAssertion',
              data: {
                sourceType: sourceTypeString,
                targetType: targetTypeString,
              },
            });
          } else {
            // Report as a suggestion to use satisfies instead
            context.report({
              node,
              messageId: 'avoidAsWithLiteral',
            });
          }
        }
      },
    };
  },
});

export default avoidAs;
