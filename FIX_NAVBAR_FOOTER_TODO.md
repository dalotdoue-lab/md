# Fix Duplicate Navbar/Footer - TODO List

## Task
Fix the UI bug where clicking Client Portal button displays two Navbars and two Footers.

## Plan
1. [ ] Update `_app.js` - render Navbar, Component, Footer directly (not via Layout)
2. [ ] Update `login.js` - remove Navbar/Footer imports and usage
3. [ ] Update `register.js` - remove Navbar/Footer imports and usage
4. [ ] Update `client-portal.js` - remove explicit Layout wrapper
5. [ ] Verify frontend builds successfully

## Changes Summary
- **Global layout**: `_app.js` will handle Navbar and Footer globally
- **Pages affected**: login.js, register.js, client-portal.js
- **Result**: Only ONE Navbar and ONE Footer will render on all pages


