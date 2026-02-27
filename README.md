# StackAudit AI

StackAudit is an AI-assisted code audit platform designed to review source code quality using real software engineering metrics instead of relying purely on LLM output.

Traditional AI code review tools directly send raw code to an AI model, which often produces hallucinated or unreliable feedback.

StackAudit solves this by introducing a two-layer architecture:

1) Static Analysis Engine → produces factual metrics  
2) AI Explanation Layer → explains the metrics in natural language

The platform parses JavaScript/TypeScript into an Abstract Syntax Tree (AST), computes engineering quality scores, stores analysis history, and generates a professional technical review report.

This makes the feedback measurable, repeatable, and suitable for real development workflows.
## Key Features

- AST-based static code analysis (Babel parser)
- Cyclomatic complexity calculation
- Maintainability score evaluation
- Production risk scoring
- PostgreSQL report persistence
- Historical report tracking
- Graceful degradation when AI service fails
- Optional AI technical explanation layer
## System Architecture

User Code Input
        ↓
Next.js API Endpoint
        ↓
AST Parser & Traversal
        ↓
Metrics & Scoring Engine
        ↓
PostgreSQL Database (Prisma)
        ↓
AI Explanation Layer (Optional)
        ↓
JSON Report Response


## Why StackAudit?

Most AI code review tools rely entirely on LLM reasoning, which can produce inconsistent or hallucinated feedback.

StackAudit separates responsibilities:

Static Analyzer → provides deterministic facts  
AI Layer → provides readable explanations

This hybrid architecture makes feedback reliable while still user-friendly.
