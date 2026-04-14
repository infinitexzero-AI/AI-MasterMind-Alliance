
import sys

def count_tokens(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    stack = []
    lines = content.split('\n')
    for i, line in enumerate(lines):
        for char in line:
            if char in '({[':
                stack.append((char, i+1))
            elif char in ')}]':
                if not stack:
                    print(f"Unexpected {char} at line {i+1}")
                    continue
                top, line_num = stack.pop()
                if (top == '(' and char != ')') or \
                   (top == '{' and char != '}') or \
                   (top == '[' and char != ']'):
                    print(f"Mismatch: {top} at line {line_num} closed by {char} at line {i+1}")
    
    for char, line_num in stack:
        print(f"Unclosed {char} from line {line_num}")

if __name__ == "__main__":
    count_tokens(sys.argv[1])
