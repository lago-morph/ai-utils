# Process Comments Command

## Usage
```
/process-comment [document-name]
```

## Description
This command processes special comment lines that start with "#C" in the specified document and creates an interactive workflow to handle the requested changes.

## Implementation

When this command is executed:

1. **Read the specified document**
   - Load the file content from the provided document-name
   - If no document name provided, prompt user to specify one

2. **Find the first "#C" comment line**
   - Scan through the document line by line
   - Locate the first line that starts with "#C"
   - Extract the full comment text (everything after "#C")

3. **Create interactive prompt**
   - Use the comment text as the foundation for a new prompt
   - Append clarifying question instructions
   - Append requirement to restate understanding and list files before changes

4. **Process with safeguards**
   - Ask user clarifying questions about the comment request
   - Restate final understanding back to user
   - List all files that will be modified
   - Wait for explicit user approval before making changes

5. **Execute and cleanup**
   - Make the requested document changes
   - Remove the processed "#C" comment line from source document
   - Log session activity if logging is enabled

## Example Usage

If a document contains:
```
#C Update the user authentication section to include two-factor authentication requirements
```

The command would:
1. Extract this comment
2. Ask clarifying questions about 2FA requirements
3. Confirm understanding and list files to change
4. Make the updates after approval
5. Remove the "#C" line

## Safety Features
- No changes made without explicit user approval
- Comment line preserved until changes are successfully completed
- All file modifications are listed before execution
- Session logging captures comment location and context