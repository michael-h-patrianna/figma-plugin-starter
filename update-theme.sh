#!/bin/bash

# Script to update components to use theme system instead of hardcoded values

echo "Updating components to use theme system..."

# Files that need BORDER_RADIUS imports removed and theme updates
components=(
  "src/ui/components/base/ProgressBar.tsx"
  "src/ui/components/base/InfoBox.tsx"
  "src/ui/components/base/ErrorBoundary.tsx"
  "src/ui/components/base/NotificationBanner.tsx"
  "src/ui/components/base/Input.tsx"
  "src/ui/components/base/Accordion.tsx"
  "src/ui/components/base/Alert.tsx"
  "src/ui/components/base/Dropdown.tsx"
  "src/ui/components/base/Toast.tsx"
  "src/ui/components/base/Textbox.tsx"
  "src/ui/components/base/Checkbox.tsx"
  "src/ui/components/base/MessageBox.tsx"
)

echo "Components to update: ${#components[@]}"

for component in "${components[@]}"; do
  if [ -f "$component" ]; then
    echo "Processing $component..."
  else
    echo "Warning: $component not found"
  fi
done

echo "Done!"
