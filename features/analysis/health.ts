import type { GitHubIssue, GitHubPull } from '@/types/github';
import type { IssuePrHealth } from '@/types/analysis';
import { median } from './helpers';

const HOUR = 3_600_000;

function hoursBetween(start: string, end: string): number {
  return (new Date(end).getTime() - new Date(start).getTime()) / HOUR;
}

export function computeIssuePrHealth(
  pulls: GitHubPull[],
  issues: GitHubIssue[],
): IssuePrHealth {
  const mergedPrList = pulls.filter((p) => p.merged_at);
  const closedPrs = pulls.filter((p) => p.state === 'closed').length;
  const mergeDurations = mergedPrList
    .map((p) => hoursBetween(p.created_at, p.merged_at!))
    .filter((h) => h >= 0);

  const closedIssueList = issues.filter((i) => i.state === 'closed' && i.closed_at);
  const closedIssues = issues.filter((i) => i.state === 'closed').length;
  const openIssues = issues.filter((i) => i.state === 'open').length;
  const closeDurations = closedIssueList
    .map((i) => hoursBetween(i.created_at, i.closed_at!))
    .filter((h) => h >= 0);

  return {
    prsConsidered: pulls.length,
    mergedPrs: mergedPrList.length,
    closedPrs,
    prMergeRate: closedPrs > 0 ? mergedPrList.length / closedPrs : null,
    medianMergeHours: median(mergeDurations),

    issuesConsidered: issues.length,
    closedIssues,
    openIssues,
    issueCloseRate: issues.length > 0 ? closedIssues / issues.length : null,
    medianCloseHours: median(closeDurations),
  };
}
