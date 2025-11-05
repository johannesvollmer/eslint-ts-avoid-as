import { ESLintUtils, TSESTree } from '@typescript-eslint/utils';

type MessageIds = 'avoidAsWithLiteral';

export const avoidAs = ESLintUtils.RuleCreator(
  (name) => `https://github.com/johannesvollmer/eslint-ts-avoid-as#${name}`
)<[], MessageIds>({
  name: 'avoid-as',
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Disallow using `as` for type assertions on literals; use `satisfies` instead',
    },
    messages: {
      avoidAsWithLiteral: 'Avoid using `as` for type assertions on literals. Use `satisfies` instead.',
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    return {
      TSAsExpression(node: TSESTree.TSAsExpression) {
        // Check if the expression being cast is a literal (object, array, string, number, etc.)
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
  },
});

export default avoidAs;
