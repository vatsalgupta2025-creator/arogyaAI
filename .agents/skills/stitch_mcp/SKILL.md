---
name: Stitch MCP Integration
description: Instructions and guidelines for interacting with the Stitch MCP server to design and generate user interfaces.
---

# Stitch MCP Integration Skill

You (Antigravity) have access to the Stitch MCP server, which provides a powerful set of tools for generating and editing UI screens using sophisticated generative AI models.

## Available Tools
The Stitch MCP exposes the following capabilities:
- `mcp_StitchMCP_list_projects`: Lists available projects you can access.
- `mcp_StitchMCP_create_project`: Creates a new UI design project.
- `mcp_StitchMCP_get_project`: Gets details about a specific project.
- `mcp_StitchMCP_list_screens`: Lists all screens within a chosen project.
- `mcp_StitchMCP_get_screen`: Retrieves the specific details of a screen.
- `mcp_StitchMCP_generate_screen_from_text`: Uses a text prompt to generate a brand new screen.
- `mcp_StitchMCP_edit_screens`: Edits an *existing* screen using a text prompt.
- `mcp_StitchMCP_generate_variants`: Generates variations of a screen based on a prompt.

## Execution Workflow
When the USER asks you to design, mock up, or generate a user interface (or specifically requests using Stitch), follow these steps to integrate the tools effectively:

1. **Initialize Context**: Use `mcp_StitchMCP_list_projects` to determine if a relevant project exists for the current conversation. If not, use `mcp_StitchMCP_create_project` with a descriptive title to create a new workspace.
2. **Generate Screen**: Execute `mcp_StitchMCP_generate_screen_from_text` using the new Project ID. Your `prompt` argument should be extremely detailed, encapsulating everything the user wants regarding layout, typography, colors, and functionality.
3. **Handle Suggestions**: If the generation output contains follow-up suggestions instead of code, present them to the user or autonomously accept one by calling `generate_screen_from_text` again with that suggestion as the new prompt.
4. **Retrieve Results**: The generation process is async and may take a few minutes. If a tool call fails due to a timeout/connection error, the background process usually succeeds. Wait patiently, then use `mcp_StitchMCP_get_screen` or `mcp_StitchMCP_list_screens` to fetch the completed result.
5. **Iterative Refinement**: If the generated screen needs adjustments, use `mcp_StitchMCP_edit_screens` with the specific screen IDs and a prompt describing the changes (e.g., "Change the primary color to amber").

**Important Limitation:** Keep in mind that generating screens can take several minutes. Communicate this delay clearly to the USER when you begin a generation step.
