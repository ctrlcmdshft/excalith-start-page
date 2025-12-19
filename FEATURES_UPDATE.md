# New Features Added

This document describes the new features added to the Excalith Start Page.

## Features Implemented

### 1. Enhanced Tab Completion 🎯

**What it does:**

-   Tab completion now works for built-in commands, search shortcuts, theme names, and link names
-   More intelligent auto-complete suggestions
-   Supports complex commands like `config theme <theme-name>`

**How to use:**

-   Start typing any command or link name
-   Press `→` to complete the suggestion
-   Press `TAB` to cycle through multiple matches

**Commands included:**

-   All built-in commands: `list`, `help`, `fetch`, `shortcuts`, `themes`, `config`, `lock`
-   Config sub-commands: `config help`, `config edit`, `config reset`, `config theme`, `config import`
-   All theme names for quick switching
-   Search shortcuts (g, d, gh, s, r, w, etc.)
-   All your bookmark link names

---

### 2. Keyboard Shortcuts Panel 📋

**What it does:**

-   Visual overlay showing all available keyboard shortcuts
-   Categorized sections (Navigation, Commands, Built-in Commands, Search Shortcuts)
-   Always up-to-date with your configured search shortcuts

**How to use:**

-   Type `shortcuts` in the prompt and press Enter
-   Press `ESC` to close the panel
-   Scroll to see all available shortcuts

**Categories shown:**

-   **Navigation**: TAB, SHIFT+TAB, arrow keys, ESC
-   **Commands**: ENTER, CTRL+ENTER, CTRL+C
-   **Built-in Commands**: All available commands with descriptions
-   **Search Shortcuts**: Your custom search aliases

---

### 3. Theme Previewer 🎨

**What it does:**

-   Visual theme selector with live previews
-   Filter themes by dark/light or search by name
-   See color swatches and sample terminal output before applying
-   Hover to preview, click to select, click again to apply

**How to use:**

1. Type `themes` in the prompt and press Enter
2. **Filter options:**
    - "All Themes" - Show all 19 themes
    - "Dark" - Show only dark themes
    - "Light" - Show only light themes
3. **Search:** Type in the search box to filter by name
4. **Preview:** Hover over a theme card to see it highlighted
5. **Apply:** Click a theme to select it, then click "Apply Theme" button
6. Press `ESC` to close

**Features:**

-   Color swatches showing all theme colors (red, green, yellow, blue, magenta, cyan)
-   Sample terminal prompt in each theme's colors
-   Visual indicator showing your current theme (green checkmark)
-   Light/dark detection and filtering
-   Search by theme name
-   Shows count of visible themes

**Available themes (19 total):**

-   bushido
-   catppuccin-frappe, catppuccin-latte, catppuccin-macchiato, catppuccin-mocha
-   default
-   dracula
-   everforest-dark
-   gruvbox-material-dark, gruvbox-material-light
-   hacker
-   horizon-dark, horizon-light
-   monokai
-   nord
-   onedark
-   synthwave
-   tokyonight
-   verdant

---

## Implementation Details

### Files Created:

-   `src/components/KeyboardShortcuts.js` - Keyboard shortcuts panel component
-   `src/components/ThemePreviewer.js` - Theme previewer component

### Files Modified:

-   `src/components/Terminal.js` - Added handlers for new commands
-   `src/components/Search.js` - Enhanced tab completion with commands
-   `src/components/Help.js` - Updated help text with new commands
-   `src/utils/command.js` - Registered new commands

### New Commands:

-   `shortcuts` - Opens the keyboard shortcuts panel
-   `themes` - Opens the theme previewer

---

## Testing

To test the new features:

1. Start the dev server:

    ```bash
    npm run dev
    ```

2. Open http://localhost:3000

3. Test each feature:

    - **Tab completion**: Type `con` and see suggestions for `config` commands
    - **Shortcuts panel**: Type `shortcuts` and press Enter
    - **Theme previewer**: Type `themes` and press Enter

4. Try the theme previewer:
    - Filter by dark/light
    - Search for "dracula" or "nord"
    - Hover over themes to preview
    - Apply a theme and see it change immediately

---

## Future Enhancements

Potential improvements based on the initial feature brainstorm:

### High Priority:

-   **Command History** - Arrow up/down to navigate previous commands
-   **Bookmarks Categories/Tags** - Filter links by categories
-   **Weather Widget** - Add weather to fetch command
-   **Quick Notes** - Simple note-taking feature

### Medium Priority:

-   **Timer/Pomodoro** - Productivity timer
-   **To-Do List** - Task management
-   **Cloud Sync** - Sync settings via GitHub Gist
-   **Import Browser Bookmarks** - Import from browser export files

### Nice to Have:

-   **RSS Feed Reader** - Show latest updates
-   **Statistics Dashboard** - Usage tracking
-   **Custom Aliases** - User-defined command shortcuts
-   **Dynamic Themes** - Time-based theme switching

---

## Contributing

If you want to add more features:

1. Work on the `dev` branch
2. Test thoroughly before merging to `main`
3. Update this document with new features
4. Follow the existing code style

---

## Version Info

-   **Date Added**: December 18, 2025
-   **Base Version**: 3.1.5
-   **Status**: ✅ Fully functional
