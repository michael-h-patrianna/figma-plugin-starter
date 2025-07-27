import { getErrors, getInfos, getWarnings } from '@main/errors';
import { Issue } from '@main/types';
import { BORDER_RADIUS } from '@shared/constants';
import { useTheme } from '@ui/contexts/ThemeContext';

export function NotificationBanner({ issues }: { issues: Issue[] }) {
  const { colors } = useTheme();

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
      borderRadius: BORDER_RADIUS,
      padding: 16,
      marginBottom: 16
    }}>
      <div style={{
        color: errors.length > 0
          ? colors.error
          : warnings.length > 0
            ? colors.warning
            : colors.info,
        fontWeight: 600,
        marginBottom: 12,
        fontSize: 14
      }}>
        {errors.length > 0 ? 'Issues Found' : warnings.length > 0 ? 'Warnings' : 'Information'} ({issues.length})
      </div>

      {errors.length > 0 && (
        <div style={{ marginBottom: (warnings.length > 0 || infos.length > 0) ? 12 : 0 }}>
          <div style={{
            color: colors.error,
            fontWeight: 600,
            marginBottom: 8,
            fontSize: 13
          }}>
            ❌ {errors.length} Error{errors.length > 1 ? 's' : ''}:
          </div>
          {errors.map((issue: Issue, index: number) => (
            <div key={issue.code + (issue.nodeId || index)} style={{
              color: colors.textColor,
              fontSize: 12,
              marginBottom: 4,
              paddingLeft: 12
            }}>
              {index + 1}. {issue.message}
            </div>
          ))}
        </div>
      )}

      {warnings.length > 0 && (
        <div style={{ marginBottom: infos.length > 0 ? 12 : 0 }}>
          <div style={{
            color: colors.warning,
            fontWeight: 600,
            marginBottom: 8,
            fontSize: 13
          }}>
            ⚠️ {warnings.length} Warning{warnings.length > 1 ? 's' : ''}:
          </div>
          {warnings.map((issue: Issue, index: number) => (
            <div key={issue.code + (issue.nodeId || index)} style={{
              color: colors.textColor,
              fontSize: 12,
              marginBottom: 4,
              paddingLeft: 12
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
            marginBottom: 8,
            fontSize: 13
          }}>
            ℹ️ {infos.length} Info{infos.length > 1 ? 's' : ''}:
          </div>
          {infos.map((issue: Issue, index: number) => (
            <div key={issue.code + (issue.nodeId || index)} style={{
              color: colors.textColor,
              fontSize: 12,
              marginBottom: 4,
              paddingLeft: 12
            }}>
              {index + 1}. {issue.message}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
