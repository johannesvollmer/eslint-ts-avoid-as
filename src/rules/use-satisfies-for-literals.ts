import { ESLintUtils, TSESTree, TSESLint } from '@typescript-eslint/utils';
import * as ts from 'typescript';
import { hasMissingRequiredProperties } from './utils';

type MessageIds = 'useSatisfiesForLiterals' | 'requiresTypeInformation';

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

export const useSatisfiesForLiterals = ESLintUtils.RuleCreator(
  (name) => `https://github.com/johannesvollmer/eslint-ts-avoid-as#${name}`
)<[], MessageIds>({
  name: 'use-satisfies-for-literals',
  meta: {
    type: 'problem',
    docs: {
      description: 'Warn about using `as` for type assertions on compatible literal types; use `satisfies` instead',
    },
    messages: {
      useSatisfiesForLiterals: 'Avoid using `as` for type assertions on literals. Use `satisfies` instead.',
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
      const missingProperties = isAssignable && hasMissingRequiredProperties(node, expressionType, targetType);

      // Don't suggest `satisfies` if properties are missing (let literal-type-mismatch handle it)
      if (isAssignable && !missingProperties) {
        context.report({
          node,
          messageId: 'useSatisfiesForLiterals',
          fix: createFix(node, context),
        });
      }
    };

    return {
      TSAsExpression: handleAsExpression,
    };
  },
});

export default useSatisfiesForLiterals;
