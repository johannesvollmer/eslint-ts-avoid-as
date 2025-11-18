import avoidAs from './rules/avoid-as';
import useSatisfiesForLiterals from './rules/use-satisfies-for-literals';
import literalTypeMismatch from './rules/literal-type-mismatch';

export const rules = {
  'avoid-as': avoidAs, // Keep for backwards compatibility (deprecated)
  'use-satisfies-for-literals': useSatisfiesForLiterals,
  'literal-type-mismatch': literalTypeMismatch,
};

export default {
  rules,
};
