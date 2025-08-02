---
description: AI rules derived by SpecStory from the project AI interaction history
globs: *
---

<headers/>

## PROJECT DOCUMENTATION & CONTEXT SYSTEM

*   All code must be documented using TSDoc.
*   Focus on creating simple user stories with detailed acceptance criteria.
*   The PRD document should contain the following sections in order:
    1.  Introduction
    2.  Core Features
    3.  Plugin-Specific Functionality
    4.  UI Component Categories
    5.  Architectural Requirements
    6.  Success Criteria
    7.  Out of Scope
    8.  Technical Constraints
    9.  Implementation Gap Analysis
    10. Conclusion

## WORKFLOW & RELEASE RULES

*   Tasks should be broken down into manageable units and organized into "completed" and "todo" sections.
*   Tasks should have priority levels: HIGH, MEDIUM, and LOW.
*   The tasks.md file should serve as a practical project management tool to track progress and assign tasks.
*   Quality assurance checklists should be created before completion.
*   When completing tasks from `tasks.md`, the AI should focus on the task at hand and avoid generating extensive summaries or logs unless specifically requested. Just do it.

## DEBUGGING

## TECH STACK

*   TypeScript
*   TSDoc
*   @testing-library/preact (for UI component testing)
*   jsdom (testing environment)
*   Jest (testing framework)