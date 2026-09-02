import { describe, expect, it } from "vitest";
import {
  getActiveGraphPathIds,
  getAccessScopeCopy,
  getDependencyStatusCopy,
  getScoreHeading,
} from "./App";
import { getAccessPaths, membershipGraph } from "./domain";

describe("dependency ownership copy", () => {
  it("uses proposed language before confirmation and durable language after it", () => {
    const proposed = getDependencyStatusCopy(false, { removed: 3, preserved: 1 });
    const confirmed = getDependencyStatusCopy(true, { removed: 3, preserved: 1 });

    expect(proposed.title).toContain("would move");
    expect(proposed.detail).toContain("would remove 3 grants");
    expect(proposed.detail).toContain("reassign 1 shared dependency");
    expect(proposed.title).not.toContain("owns");
    expect(confirmed.title).toContain("owns rollback");
    expect(confirmed.detail).toContain("now has 0");
    expect(confirmed.detail).toContain("3 grants were removed");
    expect(confirmed.detail).toContain("1 required rollback capability");
  });

  it("reserves proposed score wording for pre-confirmation state", () => {
    expect(getScoreHeading(false)).toBe("Before → proposed");
    expect(getScoreHeading(true)).toBe("Original → current result");
    expect(getScoreHeading(true)).not.toContain("proposed");
  });

  it("derives access headings and descriptions from current topology", () => {
    const initial = getAccessScopeCopy(
      getAccessPaths(),
      true,
      false,
      { removed: 0, preserved: 0 },
    );
    const changedGraph = {
      ...membershipGraph,
      "Platform Contributors": ["Release Observers"],
    };
    const changed = getAccessScopeCopy(
      getAccessPaths(changedGraph),
      true,
      false,
      { removed: 3, preserved: 1 },
    );

    expect(initial.heading).toBe("4 effective paths. 6 sensitive grants.");
    expect(changed.heading).toBe("3 effective paths. 4 sensitive grants.");
    expect(changed.description).toContain("3 current paths");
    expect(changed.description).toContain("4 sensitive capability grants");
    expect(changed.description).not.toContain("Four paths");
    const activeIds = getActiveGraphPathIds(getAccessPaths(changedGraph));
    expect(activeIds.has("path_nested_group")).toBe(false);
    expect(activeIds.has("path_direct_role")).toBe(true);
    expect(activeIds.has("path_api_token")).toBe(true);
    expect(activeIds.has("path_project_membership")).toBe(true);
  });
});
