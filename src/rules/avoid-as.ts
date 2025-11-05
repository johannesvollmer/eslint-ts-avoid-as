import { ESLintUtils, TSESTree } from '@typescript-eslint/utils';
import * as ts from 'typescript';

type MessageIds = 'avoidAsWithLiteral' | 'incompatibleTypeAssertion';

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
      incompatibleTypeAssertion: 'Type assertion is invalid: the literal type cannot be assigned to the target type.',
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    const services = ESLintUtils.getParserServices(context);
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

          // Get the type of the expression and the target type
          const expressionType = checker.getTypeAtLocation(tsExpressionNode);
          const targetType = checker.getTypeFromTypeNode(tsTypeAnnotation as ts.TypeNode);

          // Check if the expression type is assignable to the target type
          const isAssignable = checker.isTypeAssignableTo(expressionType, targetType);

          if (!isAssignable) {
            // Report as a problem if types are incompatible
            context.report({
              node,
              messageId: 'incompatibleTypeAssertion',
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
