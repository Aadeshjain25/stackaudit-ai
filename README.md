# StackAudit AI

StackAudit is an AI-assisted code audit platform designed to review source code quality using real software engineering metrics instead of relying purely on LLM output.

Traditional AI code review tools directly send raw code to an AI model, which often produces hallucinated or unreliable feedback.

StackAudit solves this by introducing a two-layer architecture:

1) Static Analysis Engine → produces factual metrics  
2) AI Explanation Layer → explains the metrics in natural language

The platform parses JavaScript/TypeScript into an Abstract Syntax Tree (AST), computes engineering quality scores, stores analysis history, and generates a professional technical review report.

This makes the feedback measurable, repeatable, and suitable for real development workflows.
