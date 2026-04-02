export type IssueSeverity = "low" | "medium" | "high";

export type RiskLevel = "low" | "medium" | "high" | "critical";

export type TechStack = "javascript" | "typescript" | "react" | "nodejs";

export type FindingIssue = {
  code: string;
  title: string;
  detail: string;
  severity: IssueSeverity;
  recommendation: string;
};

export type FileFinding = {
  filePath: string;
  fileSizeBytes: number;
  lineCount: number;
  functionCount: number;
  dependencyCount: number;
  complexity: number;
  loopCount: number;
  branchCount: number;
  maxNestingDepth: number;
  issues: FindingIssue[];
  riskLevel: RiskLevel;
};

export type TopIssue = FindingIssue & {
  filePath: string;
  riskLevel: RiskLevel;
};

export type SummaryMetrics = {
  filesDiscovered: number;
  filesAnalyzed: number;
  filesSkipped: number;
  parseErrors: number;
  totalFileSizeBytes: number;
  totalLines: number;
  totalFunctions: number;
  totalDependencies: number;
  totalComplexity: number;
  totalLoops: number;
  totalBranches: number;
  averageComplexity: number;
  maxNestingDepth: number;
  riskDistribution: Record<RiskLevel, number>;
};

export type ScoreBreakdown = {
  maintainability: number;
  reliability: number;
  modularity: number;
  resilience: number;
};

export type AuditScore = {
  value: number;
  grade: "A" | "B" | "C" | "D" | "F";
  breakdown: ScoreBreakdown;
  rationale: string[];
};

export type AuditRunResult = {
  reportId?: string;
  repoName: string;
  repoUrl: string;
  techStack: TechStack[];
  summaryMetrics: SummaryMetrics;
  fileFindings: FileFinding[];
  topIssues: TopIssue[];
  score: AuditScore;
  aiReport: string | null;
  warnings: string[];
  createdAt?: string;
};

export type UnsupportedRepoErrorResponse = {
  success: false;
  error: "UNSUPPORTED_REPO";
  message: string;
};

export type AuditApiErrorCode =
  | "DISABLED"
  | "CLONE_TIMEOUT"
  | "FEEDBACK_FAILED"
  | "INVALID_INPUT"
  | "NOT_FOUND"
  | "NETWORK_ERROR"
  | "RATE_LIMITED"
  | "REPO_TOO_LARGE"
  | "SCAN_FAILED"
  | "SERVER_ERROR"
  | "UNSUPPORTED_REPO";

export type AuditApiErrorResponse = {
  success: false;
  error: AuditApiErrorCode;
  message: string;
};

export type ApiSuccessResponse<T> = {
  success: true;
  data: T;
};

export type ReportListItem = {
  id: string;
  repoName: string;
  repoUrl: string;
  score: number;
  scoreGrade: AuditScore["grade"];
  topIssueCount: number;
  createdAt: string;
};
