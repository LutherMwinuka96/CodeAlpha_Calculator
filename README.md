# CodeAlpha Calculator

## Project Overview

CodeAlpha Calculator is a polished, responsive calculator built with plain HTML, CSS, and JavaScript. It pairs familiar arithmetic controls with live results, keyboard input, saved calculation history, memory keys, and a persistent light/dark theme.

**This project was developed as part of CodeAlpha Task 2.**

## Features

- Addition, subtraction, multiplication, division, percentages, decimals, and sign toggle
- Live result preview and friendly division-by-zero handling
- Calculation history saved locally, with one-click result reuse
- MC, MR, M+, and M− memory functions
- Light and dark themes, with the selected theme remembered
- Keyboard controls and accessible focus indicators
- Responsive layout for desktop, tablet, and mobile screens
- No frameworks, build step, or third-party runtime dependencies

## Technologies Used

- HTML5
- CSS3 (Grid, Flexbox, custom properties)
- Vanilla JavaScript
- LocalStorage

## Calculator Operations

Use the number keys to enter a value, select an operation, enter the next value, then press `=`. The preview updates as the second value is entered. `%` converts the current value to a percentage (divides it by 100).

## Keyboard Shortcuts

| Key | Action |
| --- | --- |
| `0`–`9` | Enter a digit |
| `+`, `-`, `*`, `/` | Select an operation |
| `%` | Convert current value to a percentage |
| `.` | Enter a decimal point |
| `Enter` or `=` | Calculate |
| `Backspace` | Delete the last character |
| `Escape` | Clear the calculator |

## Project Structure

```text
CodeAlpha_Calculator/
├── index.html
├── css/
│   └── style.css
├── js/
│   └── script.js
├── assets/
│   └── icons/
└── README.md
```

## Installation

Download or clone this repository. No package installation is required.

## How to Run

Open `index.html` in a modern browser. For local web-server use, serve the project directory with any static HTTP server.

## Responsive Design

The calculator adapts from a two-column desktop workspace to a single-column mobile layout. Its controls retain comfortable tap areas, and long display values truncate cleanly instead of creating horizontal page scrolling.

## Screenshots

Screenshots can be captured from the running application for desktop and mobile portfolio previews.

## Future Improvements

- Optional scientific operations
- Export or share calculation history
- Configurable precision and number formatting

## Author

CodeAlpha Task 2 contributor.
