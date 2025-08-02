/**
 * @jest-environment jsdom
 */

import {
  ProgressModalService,
  progressModalState,
  showProgressModal,
  updateProgressModal,
  hideProgressModal,
  hideAllProgressModals,
  getProgressModal,
  getAllProgressModals
} from '@ui/services/progressModal';

describe('ProgressModal Service', () => {
  beforeEach(() => {
    // Clear all modals before each test
    hideAllProgressModals();
  });

  describe('Basic Modal Management', () => {
    it('should show a progress modal and return an ID', () => {
      const id = showProgressModal({
        title: 'Test Modal',
        description: 'Test description'
      });

      expect(id).toBeDefined();
      expect(typeof id).toBe('string');
      expect(id.length).toBeGreaterThan(0);

      const state = progressModalState.value;
      expect(state.modals.size).toBe(1);
      expect(state.modals.has(id)).toBe(true);
    });

    it('should create modal with correct properties', () => {
      const id = showProgressModal({
        title: 'Test Modal',
        description: 'Test description',
        initialProgress: 25,
        showCloseButton: true
      });

      const modal = getProgressModal(id);
      expect(modal).toBeDefined();
      expect(modal!.title).toBe('Test Modal');
      expect(modal!.description).toBe('Test description');
      expect(modal!.progress).toBe(25);
      expect(modal!.showCloseButton).toBe(true);
      expect(modal!.isVisible).toBe(true);
    });

    it('should assign proper z-index for layering', () => {
      const id1 = showProgressModal({ title: 'Modal 1' });
      const id2 = showProgressModal({ title: 'Modal 2' });
      const id3 = showProgressModal({ title: 'Modal 3' });

      const modal1 = getProgressModal(id1);
      const modal2 = getProgressModal(id2);
      const modal3 = getProgressModal(id3);

      expect(modal1!.zIndex).toBe(10000);
      expect(modal2!.zIndex).toBe(10001);
      expect(modal3!.zIndex).toBe(10002);
    });

    it('should hide a specific modal', () => {
      const id = showProgressModal({ title: 'Test Modal' });
      expect(progressModalState.value.modals.size).toBe(1);

      hideProgressModal(id);
      expect(progressModalState.value.modals.size).toBe(0);
      expect(getProgressModal(id)).toBeUndefined();
    });

    it('should call onClose callback when hiding modal', () => {
      const onClose = jest.fn();
      const id = showProgressModal({
        title: 'Test Modal',
        onClose
      });

      hideProgressModal(id);
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('should hide all modals', () => {
      const id1 = showProgressModal({ title: 'Modal 1' });
      const id2 = showProgressModal({ title: 'Modal 2' });
      const id3 = showProgressModal({ title: 'Modal 3' });

      expect(progressModalState.value.modals.size).toBe(3);

      hideAllProgressModals();
      expect(progressModalState.value.modals.size).toBe(0);
      expect(getProgressModal(id1)).toBeUndefined();
      expect(getProgressModal(id2)).toBeUndefined();
      expect(getProgressModal(id3)).toBeUndefined();
    });
  });

  describe('Progress Updates', () => {
    it('should update modal progress', () => {
      const id = showProgressModal({
        title: 'Test Modal',
        initialProgress: 0
      });

      updateProgressModal(id, 50);
      const modal = getProgressModal(id);
      expect(modal!.progress).toBe(50);
    });

    it('should clamp progress values to 0-100 range', () => {
      const id = showProgressModal({
        title: 'Test Modal',
        initialProgress: 50
      });

      updateProgressModal(id, -10);
      expect(getProgressModal(id)!.progress).toBe(0);

      updateProgressModal(id, 150);
      expect(getProgressModal(id)!.progress).toBe(100);
    });

    it('should update other properties along with progress', () => {
      const id = showProgressModal({
        title: 'Test Modal',
        description: 'Original description'
      });

      updateProgressModal(id, 75, {
        title: 'Updated Title',
        description: 'Updated description',
        showCloseButton: true
      });

      const modal = getProgressModal(id);
      expect(modal!.progress).toBe(75);
      expect(modal!.title).toBe('Updated Title');
      expect(modal!.description).toBe('Updated description');
      expect(modal!.showCloseButton).toBe(true);
    });

    it('should handle updating non-existent modal gracefully', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      
      updateProgressModal('non-existent-id', 50);
      
      expect(consoleSpy).toHaveBeenCalledWith(
        'Progress modal with ID "non-existent-id" not found'
      );
      
      consoleSpy.mockRestore();
    });
  });

  describe('Service Convenience Methods', () => {
    it('should create simple modal', () => {
      const id = ProgressModalService.simple('Simple Modal', 'Simple description');
      const modal = getProgressModal(id);

      expect(modal!.title).toBe('Simple Modal');
      expect(modal!.description).toBe('Simple description');
      expect(modal!.showCloseButton).toBe(false);
    });

    it('should create closeable modal', () => {
      const onClose = jest.fn();
      const id = ProgressModalService.closeable('Closeable Modal', 'Closeable description', onClose);
      const modal = getProgressModal(id);

      expect(modal!.title).toBe('Closeable Modal');
      expect(modal!.description).toBe('Closeable description');
      expect(modal!.showCloseButton).toBe(true);
      expect(modal!.dismissOnClickOutside).toBe(true);
      expect(modal!.onClose).toBe(onClose);
    });

    it('should create modal with initial progress', () => {
      const id = ProgressModalService.withProgress('Progress Modal', 30, 'With progress');
      const modal = getProgressModal(id);

      expect(modal!.title).toBe('Progress Modal');
      expect(modal!.progress).toBe(30);
      expect(modal!.description).toBe('With progress');
    });

    it('should get all active modals', () => {
      const id1 = ProgressModalService.simple('Modal 1');
      const id2 = ProgressModalService.simple('Modal 2');
      const id3 = ProgressModalService.simple('Modal 3');

      const allModals = getAllProgressModals();
      expect(allModals).toHaveLength(3);
      
      const titles = allModals.map(modal => modal.title);
      expect(titles).toContain('Modal 1');
      expect(titles).toContain('Modal 2');
      expect(titles).toContain('Modal 3');
    });

    it('should simulate progress', async () => {
      const id = ProgressModalService.simple('Simulation Test');
      const onComplete = jest.fn();

      // Start simulation
      const simulationPromise = ProgressModalService.simulate(id, 100, onComplete);

      // Check initial state
      expect(getProgressModal(id)!.progress).toBe(0);

      // Wait for simulation to complete
      await simulationPromise;

      // Check final state
      expect(getProgressModal(id)!.progress).toBe(100);
      expect(onComplete).toHaveBeenCalledTimes(1);
    });
  });

  describe('Error Handling', () => {
    it('should handle errors in onClose callback gracefully', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      const onClose = jest.fn(() => {
        throw new Error('Test error');
      });

      const id = showProgressModal({
        title: 'Test Modal',
        onClose
      });

      hideProgressModal(id);

      expect(onClose).toHaveBeenCalledTimes(1);
      expect(consoleSpy).toHaveBeenCalledWith(
        'Error in progress modal onClose callback:',
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });

    it('should handle hiding non-existent modal gracefully', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      
      hideProgressModal('non-existent-id');
      
      expect(consoleSpy).toHaveBeenCalledWith(
        'Progress modal with ID "non-existent-id" not found'
      );
      
      consoleSpy.mockRestore();
    });

    it('should handle errors in onClose during hideAll gracefully', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      const onClose1 = jest.fn();
      const onClose2 = jest.fn(() => {
        throw new Error('Test error');
      });

      showProgressModal({ title: 'Modal 1', onClose: onClose1 });
      showProgressModal({ title: 'Modal 2', onClose: onClose2 });

      hideAllProgressModals();

      expect(onClose1).toHaveBeenCalledTimes(1);
      expect(onClose2).toHaveBeenCalledTimes(1);
      expect(consoleSpy).toHaveBeenCalledWith(
        'Error in progress modal onClose callback:',
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });
  });

  describe('State Management', () => {
    it('should provide current state', () => {
      const id1 = showProgressModal({ title: 'Modal 1' });
      const id2 = showProgressModal({ title: 'Modal 2' });

      const state = ProgressModalService.getState();
      expect(state.modals.size).toBe(2);
      expect(state.modals.has(id1)).toBe(true);
      expect(state.modals.has(id2)).toBe(true);
    });

    it('should maintain separate modal instances', () => {
      const id1 = showProgressModal({
        title: 'Modal 1',
        initialProgress: 25
      });
      const id2 = showProgressModal({
        title: 'Modal 2',
        initialProgress: 75
      });

      const modal1 = getProgressModal(id1);
      const modal2 = getProgressModal(id2);

      expect(modal1!.title).toBe('Modal 1');
      expect(modal1!.progress).toBe(25);
      expect(modal2!.title).toBe('Modal 2');
      expect(modal2!.progress).toBe(75);

      // Update one modal
      updateProgressModal(id1, 50);

      // Check that only the updated modal changed
      expect(getProgressModal(id1)!.progress).toBe(50);
      expect(getProgressModal(id2)!.progress).toBe(75);
    });
  });
});
