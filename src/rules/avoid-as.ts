import { ESLintUtils, TSESTree, TSESLint } from '@typescript-eslint/utils';
import * as ts from 'typescript';

type MessageIds = 'avoidAsWithLiteral' | 'incompatibleTypeAssertion' | 'requiresTypeInformation';

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

const createFix = (node: TSESTree.TSAsExpression, context: TSESLint.RuleContext<MessageIds, []>) => {
  return (fixer: TSESLint.RuleFixer) => {
    const asToken = context.sourceCode.getTokenAfter(node.expression, {
      includeComments: false,
    });
    if (asToken && asToken.value === 'as') {
      return fixer.replaceText(asToken, 'satisfies');
    }
    return null;
  };
};

export const avoidAs = ESLintUtils.RuleCreator(
  (name) => `https://github.com/johannesvollmer/eslint-ts-avoid-as#${name}`
)<[], MessageIds>({
  name: 'ts-avoid-as',
  meta: {
    type: 'problem',
    docs: {
      description: 'Warn about using `as` for type assertions on literals; use `satisfies` instead',
    },
    messages: {
      avoidAsWithLiteral: 'Avoid using `as` for type assertions on literals. Use `satisfies` instead.',
      incompatibleTypeAssertion: 'This literal does not match the declared type. Use the `satisfies` keyword instead of `as` to enable type checking.',
      requiresTypeInformation: 'Checking type assignability requires full type information. Ensure you are using @typescript-eslint/parser with project configuration.',
    },
    schema: [],
    fixable: 'code',
  },
  defaultOptions: [],
  create(context) {
    const services = ESLintUtils.getParserServices(context, true);
    
    const handleAsExpression = (node: TSESTree.TSAsExpression) => {
      if (isConstAssertion(node) || !isLiteralExpression(node.expression)) {
        return;
      }

      if (!services.program) {
        context.report({
          node,
          messageId: 'requiresTypeInformation',
          fix: createFix(node, context),
        });
        return;
      }

      const checker = services.program.getTypeChecker();
      const tsExpressionNode = services.esTreeNodeToTSNodeMap.get(node.expression);
      const tsTypeAnnotation = services.esTreeNodeToTSNodeMap.get(node.typeAnnotation);

      if (!tsExpressionNode || !tsTypeAnnotation || !ts.isTypeNode(tsTypeAnnotation)) {
        context.report({
          node,
          messageId: 'requiresTypeInformation',
          fix: createFix(node, context),
        });
        return;
      }

      const expressionType = checker.getTypeAtLocation(tsExpressionNode);
      const targetType = checker.getTypeFromTypeNode(tsTypeAnnotation);
      const isAssignable = checker.isTypeAssignableTo(expressionType, targetType);

      if (!isAssignable) {
        context.report({
          node,
          messageId: 'incompatibleTypeAssertion',
        });
      } else {
        context.report({
          node,
          messageId: 'avoidAsWithLiteral',
          fix: createFix(node, context),
        });
      }
    };

    return {
      TSAsExpression: handleAsExpression,
    };
  },
});

export default avoidAs;
