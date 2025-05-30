# Mermaid Diagram Guidelines

## Common Mermaid Syntax Patterns

1. Basic Flowchart (Most Common)
```mermaid
flowchart TD
    A[Start] --> B[Process]
    B --> C{Decision}
    C -->|Yes| D[Result_1]
    C -->|No| E[Result_2]
```

2. Linear Process Flow (Use when showing steps)
```mermaid
flowchart LR
    Input[Step_1] --> Process[Step_2] --> Output[Step_3]
```

3. Hierarchical Structure (Use for classifications)
```mermaid
graph TD
    Root[Main] --> B[Category_1]
    Root --> C[Category_2]
    B --> D[Sub_1]
    B --> E[Sub_2]
```

4. Mindmap (Use for conceptual relationships)
```mermaid
mindmap
  root((Central Topic))
    Topic A
      Subtopic A1
      Subtopic A2
    Topic B
      Subtopic B1
      Subtopic B2
```

## Mindmap Rules (Important to Avoid Errors)
- A mindmap must have exactly ONE root node
- Indent child topics with 2 spaces to show hierarchy
- Each line of text is a node
- Node shapes:
  - `root((text))` for circular root nodes
  - `id[text]` for rectangular nodes
  - Simple text for default nodes
- Common error: Multiple root nodes - ensure all topics are properly indented under the single root

## Key Rules for Error-Free Diagrams
- Use TD (top-down) or LR (left-right) for clear direction
- Always connect nodes with --> arrows
- Avoid spaces in node names - use underscores
- Use proper brackets: [] for process, {} for decisions
- Keep connections logical and clearly defined
- Test complex diagrams in parts first

## For Complex Diagrams
1. Start with basic structure
2. Add connections step by step
3. Verify syntax at each major addition
4. Keep node names short but descriptive
5. Use consistent naming conventions

## Common Node Shapes
- `[]` Rectangle (default, for processes)
- `{}` Diamond (for decisions)
- `()` Circle (for start/end points)
- `[[]]` Double rectangle (for databases)
- `(())` Double circle (for special points)

## Error Prevention Checklist
- Confirm all nodes are properly connected
- Verify all node names are unique and valid
- Check bracket pairs are matching
- Ensure arrow directions are consistent
- Validate diagram flows logically
- Keep diagram complexity manageable