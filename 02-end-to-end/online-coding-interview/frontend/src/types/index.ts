export type Language = 'javascript' | 'python' | 'csharp' | 'go' | 'java';

export interface Session {
  id: string;
  title: string;
  language: Language;
  code: string;
  created_at: string;
  expires_at: string | null;
  is_protected: boolean;
  is_active: boolean;
  share_url: string;
}

export interface SessionCreate {
  title: string;
  language?: Language;
  initial_code?: string;
  expires_in_hours?: number;
  password?: string;
}

export interface Participant {
  id: string;
  name: string;
  color: string;
  cursor_position?: {
    line: number;
    column: number;
  } | null;
  joined_at: string;
}

export interface LanguageInfo {
  id: Language;
  name: string;
  version: string;
  execution_mode: string;
  runtime: string;
  file_extension: string;
  monaco_language: string;
}

export interface ExecutionResult {
  stdout: string;
  stderr: string;
  exitCode: number;
  executionTimeMs: number;
}

export interface CursorPosition {
  line: number;
  column: number;
}

export interface Selection {
  startLine: number;
  startColumn: number;
  endLine: number;
  endColumn: number;
}
