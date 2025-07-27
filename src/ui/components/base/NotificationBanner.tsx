import { getErrors, getInfos, getWarnings } from '@main/errors';
import { Issue } from '@main/types';
import { useTheme } from '@ui/contexts/ThemeContext';

export function NotificationBanner({ issues }: { issues: Issue[] }) {
  const { colors, spacing, typography, borderRadius } = useTheme();

  if (!issues || issues.length === 0) return null;

  const errors = getErrors(issues);
  const warnings = getWarnings(issues);
  const infos = getInfos(issues);

  return (
    <div style={{
      background: errors.length > 0
        ? 'rgba(231, 76, 60, 0.1)'
        : warnings.length > 0
          ? 'rgba(243, 156, 18, 0.1)'
          : 'rgba(52, 152, 219, 0.1)',
      border: `1px solid ${errors.length > 0
        ? 'rgba(231, 76, 60, 0.3)'
        : warnings.length > 0
          ? 'rgba(243, 156, 18, 0.3)'
          : 'rgba(52, 152, 219, 0.3)'}`,
      borderRadius: borderRadius.default,
      padding: spacing.md,
      marginBottom: spacing.md
    }}>
      <div style={{
        color: errors.length > 0
          ? colors.error
          : warnings.length > 0
            ? colors.warning
            : colors.info,
        fontWeight: 600,
        marginBottom: spacing.md,
        fontSize: typography.body
      }}>
        {errors.length > 0 ? 'Issues Found' : warnings.length > 0 ? 'Warnings' : 'Information'} ({issues.length})
      </div>

      {errors.length > 0 && (
        <div style={{ marginBottom: (warnings.length > 0 || infos.length > 0) ? spacing.md : 0 }}>
          <div style={{
            color: colors.error,
            fontWeight: 600,
            marginBottom: spacing.sm,
            fontSize: typography.bodySmall
          }}>
            ❌ {errors.length} Error{errors.length > 1 ? 's' : ''}:
          </div>
          {errors.map((issue: Issue, index: number) => (
            <div key={issue.code + (issue.nodeId || index)} style={{
              color: colors.textColor,
              fontSize: typography.caption,
              marginBottom: 4,
              paddingLeft: spacing.md
            }}>
              {index + 1}. {issue.message}
            </div>
          ))}
        </div>
      )}

      {warnings.length > 0 && (
        <div style={{ marginBottom: infos.length > 0 ? spacing.md : 0 }}>
          <div style={{
            color: colors.warning,
            fontWeight: 600,
            marginBottom: spacing.sm,
            fontSize: typography.bodySmall
          }}>
            ⚠️ {warnings.length} Warning{warnings.length > 1 ? 's' : ''}:
          </div>
          {warnings.map((issue: Issue, index: number) => (
            <div key={issue.code + (issue.nodeId || index)} style={{
              color: colors.textColor,
              fontSize: typography.caption,
              marginBottom: 4,
              paddingLeft: spacing.md
            }}>
              {index + 1}. {issue.message}
            </div>
          ))}
        </div>
      )}

      {infos.length > 0 && (
        <div>
          <div style={{
            color: colors.info,
            fontWeight: 600,
            marginBottom: spacing.sm,
            fontSize: typography.bodySmall
          }}>
            ℹ️ {infos.length} Info{infos.length > 1 ? 's' : ''}:
          </div>
          {infos.map((issue: Issue, index: number) => (
            <div key={issue.code + (issue.nodeId || index)} style={{
              color: colors.textColor,
              fontSize: typography.caption,
              marginBottom: 4,
              paddingLeft: spacing.md
            }}>
              {index + 1}. {issue.message}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
