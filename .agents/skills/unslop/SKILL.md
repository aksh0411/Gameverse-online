---
name: unslop
description: Eliminates AI bloat, over-engineering, redundant comments, speculative abstractions, defensive clutter, and robotic copy from code and documentation. Trigger with /unslop or whenever code needs radical simplification and de-slopification.
---

# /unslop Protocol: AI De-Slopification & Code Purity Engine

## 1. Mission
AI assistants routinely generate "slop": excessive ceremony, speculative abstractions, defensive over-nesting, robotic conversational boilerplate, and redundant comments explaining what line 2 already makes obvious.

The `/unslop` protocol radically strips away all AI-generated bloat to leave only lean, idiomatic, high-signal, production-grade code and human prose.

---

## 2. The Four Pillars of Slop

### Pillar I: Comment Slop (The Obvious Explainer)
* **Rule**: If the code already tells you *what* it is doing, a comment explaining it is slop.
* **Banned Comments**:
  * `// Initialize variables`
  * `// Fetch data from API`
  * `// Handle error`
  * `// Check if user exists`
  * `// Return response`
  * `// Constructor`
  * `// Helper function to format date`
* **Allowed Comments**: Only non-obvious *why* — weird browser quirks, performance compromises, upstream API bugs, hardware workarounds, or critical security requirements.

### Pillar II: Architecture Slop (Premature Generalization & Ceremony)
* **Rule**: Write concrete code first. Do not introduce abstractions for hypothetical future features.
* **Banned Patterns**:
  * Creating an interface, factory, adapter, provider, and strategy pattern for a single utility function.
  * Creating `BaseManagerServiceHandler` hierarchies.
  * Adding 10 optional config flags that no one asked for.
  * Premature micro-optimizations that double complexity for 0.001ms gain.
  * Splitting a 15-line function across 4 files and 3 layers of indirection.
* **The Rule of Three**: Do not abstract until you have duplicated logic in at least 3 distinct places. Inline single-use helpers.

### Pillar III: Defensive Slop (Paranoid Nesting & Swallow-Catching)
* **Rule**: Validate at the perimeter (schemas/types), trust inside core logic, and fail fast.
* **Banned Patterns**:
  * 6-level deep optional chaining and fallback soup: `a?.b?.c?.d ?? fallback ?? 'default'` when types guarantee `a.b` exists.
  * Wrapping every single expression in empty `try...catch` blocks that just log `console.error(e)`.
  * Pointless type assertions (`as unknown as string`) to mask bad types.
  * Dummy mocks and defensive checks against impossibilities.

### Pillar IV: Copywriting & Prose Slop (Robotic AI Hallmarks)
* **Banned Words & Clichés**:
  * Words: `delve`, `testament`, `tapestry`, `seamless`, `elevate`, `leverage`, `cutting-edge`, `game-changer`, `robust`, `crucial`, `pivotal`, `beacon`, `foster`, `empower`, `revolutionize`, `meticulous`.
  * Conversational Filler:
    * "Certainly! I'd be happy to help you with that."
    * "In this guide, we will explore..."
    * "It's important to keep in mind that..."
    * "In conclusion / In summary..."
  * Sycophancy & Hedging:
    * "Great question!", "You are totally right!", "I apologize for the oversight."

---

## 3. Before vs. After Examples

### Example 1: Function Implementation

```typescript
// ❌ SLOP (Overengineered, redundant comments, paranoid nesting)
/**
 * Helper function to retrieve the user's active profile status
 * @param userObj - The user data object to process
 * @returns The resolved status string or null
 */
export async function getUserProfileStatus(userObj: any): Promise<string | null> {
  // Check if user object is defined and valid
  if (!userObj || typeof userObj !== 'object') {
    console.error('Invalid user object provided');
    return null;
  }

  try {
    // Extract the profile from the user object
    const profile = userObj?.profile;
    // Check if profile has status property
    if (profile && profile?.status !== undefined) {
      // Normalize and return the status
      return String(profile.status).trim().toLowerCase();
    }
    // Return default status fallback
    return 'offline';
  } catch (error) {
    // Catch any unexpected exceptions
    console.error('An error occurred while getting status:', error);
    return null;
  }
}

// ✅ UNSLOPPED (Direct, typed, zero ceremony)
export function getUserStatus(user: User): string {
  return user.profile?.status?.toLowerCase() ?? 'offline';
}
```

### Example 2: Component Structure

```tsx
// ❌ SLOP (Generic styling cliché, unnecessary wrapper divs, redundant prop explosion)
export const FeatureCard = ({ title, subtitle, icon, onClick, variant = 'primary', isVisible = true }) => {
  if (!isVisible) return null;
  return (
    <div className="bg-gradient-to-r from-purple-500 to-indigo-600 p-[1px] rounded-2xl shadow-xl hover:scale-105 transition-all duration-300">
      <div className="bg-gray-900 p-6 rounded-2xl h-full flex flex-col justify-between items-start">
        <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center mb-4">
          {icon}
        </div>
        <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
        <p className="text-gray-400 text-sm leading-relaxed">{subtitle}</p>
        <button onClick={onClick} className="mt-4 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors">
          Learn More &rarr;
        </button>
      </div>
    </div>
  );
};

// ✅ UNSLOPPED (Semantic, purposeful contrast, clean tokens, no wrapper-in-wrapper)
export function FeatureCard({ title, description, icon, onSelect }: FeatureCardProps) {
  return (
    <div className="rounded-xl border border-white/10 bg-slate-900/60 p-6 backdrop-blur">
      <div className="text-cyan-400">{icon}</div>
      <h3 className="mt-4 text-lg font-semibold text-white">{title}</h3>
      <p className="mt-1 text-sm text-slate-400">{description}</p>
      {onSelect && (
        <button onClick={onSelect} className="mt-5 text-xs font-semibold text-cyan-400 hover:underline">
          View details &rarr;
        </button>
      )}
    </div>
  );
}
```

---

## 4. Execution Workflow When /unslop is Called

Whenever the user runs `/unslop [file/snippet/concept]` or requests de-slopification:

1. **Scan**:
   - Count lines of code vs. actual business logic.
   - Flag trivial comments, defensive over-nesting, empty error wraps, and excessive abstractions.
   - Flag robotic AI copy and buzzwords.
2. **Strip**:
   - Delete all comments stating what code does.
   - Delete unused wrapper layers, interfaces used only once, and unused variables.
   - Flatten nested ternary operators and unnecessary conditional waterfalls.
   - Replace bloated third-party calls with native language features where straightforward.
3. **Refactor**:
   - Ensure names reflect exact domain concepts (`gameId` instead of `selectedItemDataKey`).
   - Standardize error boundaries (bubble up or handle at boundary, never silently swallow).
4. **Report**:
   - Show the unslopped result directly.
   - Provide a quick, 2-bullet summary of reductions (e.g., `-42 lines removed`, `eliminated redundant defensive nesting and 7 obvious comments`).
