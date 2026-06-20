# Commit Conventions

## Creating Commits

Use the `/commit` command to create commits. It will:
1. Analyze staged and unstaged changes
2. Review recent commits to infer the repository's commit style
3. Create a commit following the existing convention

## Usage

```
/commit
```

The command automatically stages relevant changes and creates a commit message that matches the repository's style.

## Manual Commits

If committing manually, follow the existing commit message style in the repository by reviewing recent commits:
```bash
git log --oneline -10
```
