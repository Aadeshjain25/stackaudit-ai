## Project Overview

StackAudit is a developer tool that automatically audits source code quality.

Instead of directly sending raw code to an AI model, the system first performs static code analysis using Abstract Syntax Tree (AST) parsing. It calculates real engineering metrics such as cyclomatic complexity, maintainability score, and production risk score.

These metrics are then optionally interpreted by an AI model to generate a human-readable technical review.

The goal of StackAudit is to make AI-generated feedback reliable by combining deterministic code analysis with natural-language reasoning.

This approach prevents hallucinated feedback and makes the platform suitable for real development workflows.
