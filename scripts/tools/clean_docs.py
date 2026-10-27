import os
import shutil
import difflib
import sys

def clean_content(content: str) -> str:
    """
    Strictly cleans the content:
    - Removes Byte Order Marks (BOM).
    - Normalizes line endings to LF (\n).
    - Removes all control characters except \n and \t.
    - Keeps only Printable ASCII and valid Japanese/multi-byte characters.
    """
    # Remove BOM
    if content.startswith('\ufeff'):
        content = content[1:]
    
    # Normalize line endings
    content = content.replace('\r\n', '\n').replace('\r', '\n')
    
    cleaned = []
    removed_count = 0
    
    for char in content:
        char_code = ord(char)
        
        # 1. Keep Newlines and Tabs
        if char == '\n' or char == '\t':
            cleaned.append(char)
        # 2. Keep Printable ASCII (32-126)
        elif 32 <= char_code <= 126:
            cleaned.append(char)
        # 3. Keep valid Non-ASCII (Japanese, etc.)
        # This excludes the 0-31 range (Control codes), 127 (DEL), and 160 (Non-breaking space)
        elif char_code > 127 and char_code != 160:
            cleaned.append(char)
        else:
            # Reject everything else (including \r, \f, \v, and the "junk" bytes)
            removed_count += 1
            
    return "".join(cleaned), removed_count

def main():
    if len(sys.argv) < 2:
        print("Usage: python clean_docs.py <file_path>")
        sys.exit(1)
    
    file_path = sys.argv[1]
    if not os.path.exists(file_path):
        print(f"Error: File {file_path} not found.")
        sys.exit(1)

    # 1. Create Backup
    backup_path = file_path + ".bak"
    shutil.copy2(file_path, backup_path)
    print(f"Backup created at: {backup_path}")

    # 2. Read file
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            original_content = f.read()
    except UnicodeDecodeError:
        with open(file_path, 'r', encoding='latin-1') as f:
            original_content = f.read()
            print("Warning: File read as Latin-1 due to encoding issues.")

    # --- DEBUGGING SECTION ---
    print("\n--- File Content Debug ---")
    # Print first 50 characters and their codes
    preview_len = min(len(original_content), 50)
    preview = original_content[:preview_len]
    for i, char in enumerate(preview):
        print(f"{i}: {repr(char)} (ord: {ord(char)})")
    print("--------------------------\n")

    # 3. Clean
    cleaned_content, removed = clean_content(original_content)

    # 4. Results
    if original_content == cleaned_content:
        print("The file is already clean. No changes were made.")
    else:
        print(f"Cleaning complete. Removed {removed} problematic characters.")
        # Show Diff
        diff = difflib.unified_diff(
            original_content.splitlines(keepends=True),
            cleaned_content.splitlines(keepends=True),
            fromfile='Original',
            tofile='Cleaned',
            full=True
        )
        
        diff_list = list(diff)
        if diff_list:
            print('\n'.join(diff_list))
            # Write clean version
            with open(file_path, 'w', encoding='utf-8', newline='\n') as f:
                f.write(cleaned_content)
            print(f"Success: Cleaned version saved to {file_path}")
        else:
            print("No differences were found in the content.")

if __name__ == "__main__":
    main()
