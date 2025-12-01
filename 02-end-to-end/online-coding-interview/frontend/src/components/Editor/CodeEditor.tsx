import { useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { Language } from '../../types';

interface CodeEditorProps {
  code: string;
  language: Language;
  onChange: (code: string) => void;
}

// Map our language IDs to Monaco language IDs
const MONACO_LANGUAGE_MAP: Record<Language, string> = {
  javascript: 'javascript',
  python: 'python',
  csharp: 'csharp',
  go: 'go',
  java: 'java',
  sql: 'sql',
};

// Default code templates
const CODE_TEMPLATES: Record<Language, string> = {
  javascript: `// JavaScript - Runs in Web Worker
console.log("Hello, World!");

// You can use modern ES features
const greet = (name) => \`Hello, \${name}!\`;
console.log(greet("Candidate"));

// Arrays and objects work great
const numbers = [1, 2, 3, 4, 5];
console.log("Sum:", numbers.reduce((a, b) => a + b, 0));
`,
  python: `# Python - Runs via Pyodide (WASM)
print("Hello, World!")

# Standard Python features work
def greet(name):
    return f"Hello, {name}!"

print(greet("Candidate"))

# Lists and comprehensions
numbers = [1, 2, 3, 4, 5]
print("Sum:", sum(numbers))
print("Squares:", [x**2 for x in numbers])
`,
  csharp: `// C# - Would run via Blazor WASM
using System;

class Program
{
    static void Main()
    {
        Console.WriteLine("Hello, World!");
        
        string name = "Candidate";
        Console.WriteLine($"Hello, {name}!");
        
        int[] numbers = { 1, 2, 3, 4, 5 };
        Console.WriteLine($"Sum: {numbers.Sum()}");
    }
}
`,
  go: `// Go - Would run via TinyGo WASM
package main

import "fmt"

func main() {
    fmt.Println("Hello, World!")
    
    name := "Candidate"
    fmt.Printf("Hello, %s!\\n", name)
    
    numbers := []int{1, 2, 3, 4, 5}
    sum := 0
    for _, n := range numbers {
        sum += n
    }
    fmt.Println("Sum:", sum)
}
`,
  java: `// Java - Would run via CheerpJ WASM
public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
        
        String name = "Candidate";
        System.out.println("Hello, " + name + "!");
        
        int[] numbers = {1, 2, 3, 4, 5};
        int sum = 0;
        for (int n : numbers) {
            sum += n;
        }
        System.out.println("Sum: " + sum);
    }
}
`,
  sql: `-- SQL (PostgreSQL) - Syntax highlighting only
-- This language is for demonstrating SQL queries
-- Code execution is not supported

-- Create a sample table
CREATE TABLE employees (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    department VARCHAR(50),
    salary DECIMAL(10, 2),
    hire_date DATE
);

-- Insert sample data
INSERT INTO employees (name, department, salary, hire_date)
VALUES 
    ('John Doe', 'Engineering', 95000.00, '2023-01-15'),
    ('Jane Smith', 'Marketing', 75000.00, '2023-03-20'),
    ('Bob Johnson', 'Engineering', 105000.00, '2022-11-10');

-- Query with aggregation
SELECT 
    department,
    COUNT(*) as employee_count,
    AVG(salary) as avg_salary,
    MAX(salary) as max_salary
FROM employees
GROUP BY department
ORDER BY avg_salary DESC;
`,
};

export default function CodeEditor({ code, language, onChange }: CodeEditorProps) {
  const handleEditorChange = (value: string | undefined) => {
    onChange(value || '');
  };

  // Initialize store with template if code is empty, or when language changes
  useEffect(() => {
    if (CODE_TEMPLATES[language]) {
      // Only load template on initial mount if code is empty
      if (!code) {
        onChange(CODE_TEMPLATES[language]);
      }
    }
  }, []); // Run only on mount
  
  // When language changes, load the new template
  useEffect(() => {
    if (CODE_TEMPLATES[language]) {
      onChange(CODE_TEMPLATES[language]);
    }
  }, [language]); // Run when language changes

  // Use template if code is empty
  const displayCode = code || CODE_TEMPLATES[language] || '';

  return (
    <div className="flex-1 min-h-0">
      <Editor
        height="100%"
        language={MONACO_LANGUAGE_MAP[language]}
        value={displayCode}
        onChange={handleEditorChange}
        theme="vs-dark"
        options={{
          minimap: { enabled: true },
          fontSize: 14,
          lineNumbers: 'on',
          roundedSelection: true,
          scrollBeyondLastLine: false,
          wordWrap: 'on',
          automaticLayout: true,
          tabSize: 2,
          insertSpaces: true,
          folding: true,
          renderLineHighlight: 'all',
          cursorBlinking: 'smooth',
          cursorSmoothCaretAnimation: 'on',
          smoothScrolling: true,
        }}
      />
    </div>
  );
}
