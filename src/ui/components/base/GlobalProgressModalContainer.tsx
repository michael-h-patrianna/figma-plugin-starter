/**
 * Global Progress Modal Container
 *
 * This component renders all active progress modals from the progress modal service.
 * It should be included once at the app level to handle all progress modals globally.
 */

import { ProgressModal } from '@ui/components/base/ProgressModal';
import { hideProgressModal, progressModalState } from '@ui/services/progressModal';

/**
 * Container component that renders all active progress modals.
 *
 * This component automatically subscribes to the progress modal service
 * and renders all active modals with proper layering and positioning.
 */
export function GlobalProgressModalContainer() {
  const state = progressModalState.value;
  const modals = Array.from(state.modals.values());

  // Sort modals by z-index to ensure proper rendering order
  const sortedModals = modals.sort((a, b) => a.zIndex - b.zIndex);

  return (
    <>
      {sortedModals.map(modal => (
        <ProgressModal
          key={modal.id}
          isVisible={modal.isVisible}
          progress={modal.progress}
          title={modal.title}
          description={modal.description}
          showCloseButton={modal.showCloseButton}
          onClose={() => hideProgressModal(modal.id)}
          zIndex={modal.zIndex}
        />
      ))}
    </>
  );
}
