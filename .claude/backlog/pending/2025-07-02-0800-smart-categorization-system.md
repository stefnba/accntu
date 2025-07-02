# Smart Transaction Categorization System

## Objectives

Implement an intelligent categorization system that automatically suggests categories and labels for imported transactions based on transaction descriptions, merchants, amounts, and historical patterns. This will significantly reduce manual categorization effort for users while maintaining accuracy and user control.

## Development Plan

### Phase 1: Core Infrastructure
1. **Create categorization feature structure**
   - `src/features/categorization/`
   - Database schemas for rules and suggestions
   - API endpoints for rule management

2. **Database Schema Updates**
   - `src/features/categorization/server/db/schema.ts`
     - `categorizationRule` table: user rules with patterns and conditions
     - `suggestionHistory` table: track suggestion accuracy
     - `merchantPattern` table: common merchant name variations
   - Add indexes for pattern matching performance

### Phase 2: Rule Engine
3. **Rule Management System**
   - `src/features/categorization/server/services/rule-engine.ts`
   - Pattern matching algorithms (substring, regex, fuzzy matching)
   - Confidence scoring system
   - Fallback mechanisms for unknown transactions

4. **Suggestion API**
   - `src/features/categorization/server/endpoints/suggestions.ts`
   - Real-time categorization during import
   - Batch re-categorization for existing transactions
   - User feedback integration for learning

### Phase 3: User Interface
5. **Rule Management UI**
   - `src/features/categorization/components/RuleManager.tsx`
   - Create/edit categorization rules
   - Test rules against historical data
   - Import/export rule sets

6. **Import Integration**
   - Modify `src/features/transaction/components/TransactionImportWizard.tsx`
   - Add categorization step with suggestions
   - Bulk accept/reject suggestions
   - Real-time preview as rules are applied

### Phase 4: Machine Learning Enhancement
7. **Pattern Learning**
   - `src/features/categorization/server/services/pattern-learner.ts`
   - Analyze user correction patterns
   - Automatically generate rule suggestions
   - Confidence scoring based on historical accuracy

8. **Smart Merchant Recognition**
   - Merchant name normalization
   - Chain recognition (e.g., "STARBUCKS #123" → "Starbucks")
   - Location-aware categorization

### File Structure Changes
```
src/features/categorization/
├── server/
│   ├── db/
│   │   ├── schema.ts
│   │   ├── queries/
│   │   │   ├── rules.ts
│   │   │   ├── suggestions.ts
│   │   │   └── merchants.ts
│   │   └── services/
│   │       ├── rule-engine.ts
│   │       ├── pattern-learner.ts
│   │       └── merchant-matcher.ts
│   └── endpoints/
│       ├── rules.ts
│       ├── suggestions.ts
│       └── index.ts
├── components/
│   ├── RuleManager.tsx
│   ├── SuggestionCard.tsx
│   ├── RuleEditor.tsx
│   └── CategoryPreview.tsx
├── api/
│   ├── rules.ts
│   ├── suggestions.ts
│   └── index.ts
├── schemas/
│   ├── rules.ts
│   ├── suggestions.ts
│   └── index.ts
└── hooks/
    ├── useRuleManager.ts
    └── useCategorization.ts
```

## Alternatives Considered

### 1. External ML Service Integration
**Pros**: 
- Pre-trained models with broader data
- No need to build ML infrastructure
- Potentially higher accuracy

**Cons**: 
- External dependencies and costs
- Data privacy concerns
- Less customization for user-specific patterns
- API rate limits and latency

### 2. Simple Keyword-Based Rules Only
**Pros**: 
- Easier to implement and understand
- Fast performance
- Full user control

**Cons**: 
- Limited accuracy with complex merchant names
- Requires extensive manual rule creation
- No learning capability
- Poor handling of merchant name variations

### 3. Full Machine Learning with TensorFlow.js
**Pros**: 
- Advanced pattern recognition
- Continuous learning
- High accuracy potential

**Cons**: 
- Complex implementation
- Large bundle size
- Browser performance impact
- Requires significant training data

**Chosen Approach: Hybrid Rule Engine with Pattern Learning**
This approach balances accuracy, performance, and user control by:
- Starting with user-defined rules for immediate value
- Adding pattern recognition for merchant variations
- Implementing lightweight learning from user corrections
- Maintaining privacy by keeping all processing local
- Providing transparent, explainable suggestions

## Progress

*Empty - ready for implementation*