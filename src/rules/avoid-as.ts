import { ESLintUtils, TSESTree } from '@typescript-eslint/utils';

type MessageIds = 'avoidAsWithObjectLiteral';

export const avoidAs = ESLintUtils.RuleCreator(
  (name) => `https://github.com/johannesvollmer/eslint-ts-avoid-as#${name}`
)<[], MessageIds>({
  name: 'avoid-as',
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Disallow using `as` for type assertions on object literals; use `satisfies` instead',
    },
    messages: {
      avoidAsWithObjectLiteral: 'Avoid using `as` for type assertions on object literals. Use `satisfies` instead.',
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    return {
      TSAsExpression(node: TSESTree.TSAsExpression) {
        // Check if the expression being cast is an object literal
        if (node.expression.type === 'ObjectExpression') {
          context.report({
            node,
            messageId: 'avoidAsWithObjectLiteral',
          });
        }
      },
    };
  },
});

export default avoidAs;
