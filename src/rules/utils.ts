import { TSESTree } from '@typescript-eslint/utils';
import * as ts from 'typescript';

/**
 * Checks if all required properties of the target type are present in the expression type.
 * This mimics the stricter checking that `satisfies` does compared to `as` assertions.
 * 
 * TypeScript's `isTypeAssignableTo` is permissive for type assertions and allows
 * empty objects to be assigned to interfaces with required properties.
 * The `satisfies` operator, however, performs stricter checking and validates
 * that all required properties are present.
 * 
 * @param node - The AST node of the expression being checked
 * @param expressionType - The type of the literal expression
 * @param targetType - The type being asserted to
 * @returns true if any required properties are missing, false otherwise
 */
export function hasMissingRequiredProperties(
  node: TSESTree.TSAsExpression,
  expressionType: ts.Type,
  targetType: ts.Type
): boolean {
  // Only check object literals
  if (node.expression.type !== 'ObjectExpression') {
    return false;
  }

  const targetProperties = targetType.getProperties();
  const expressionProperties = expressionType.getProperties();
  
  for (const targetProp of targetProperties) {
    // Check if the property is optional using the TypeScript SymbolFlags
    const isOptional = (targetProp.flags & ts.SymbolFlags.Optional) !== 0;
    
    if (!isOptional) {
      // Check if the required property exists in the expression
      const hasProp = expressionProperties.some(p => p.name === targetProp.name);
      if (!hasProp) {
        return true;
      }
    }
  }

  return false;
}
