# App Card Border Radius Implementation

## Changes Overview
- **LeftSidebar.tsx**:
  - Replaced "Full Rounded Icons" toggle with "App Card Radius" selector.
  - Options: 'Small', 'Medium', 'Full'.
  - Updated `LeftSidebarProps` interface.
- **page.tsx**:
  - Replaced `fullRoundedIconsEnabled` state with `appCardBorderRadius` ('small' | 'medium' | 'full').
  - Updated `SortableLinkCard` and `HaliteCard` to use the new prop for styling.
  - Implemented migration logic to respect previous `fullRoundedIconsEnabled` setting.
  - Updated localStorage saving/loading.

## Migration Logic
- On load, checks for `fullRoundedIconsEnabled` in localStorage.
- If true, sets `appCardBorderRadius` to 'full'.
- Otherwise, loads `appCardBorderRadius` (defaulting to 'medium').

## Styling Mapping
- **Small**: `rounded-lg`
- **Medium**: `rounded-2xl`
- **Full**: `rounded-full`
