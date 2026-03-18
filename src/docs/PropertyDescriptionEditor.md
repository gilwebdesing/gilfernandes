# Property Description Editor Component

The `PropertyDescriptionEditor` is a rich text editor built using `react-quill`. It is designed to provide a secure, SEO-friendly, and easy-to-use interface for brokers to add property descriptions with proper formatting.

## Features

- **Semantic HTML**: Generates clean HTML tags like `<h2>`, `<h3>`, `<ul>`, `<li>`, `<strong>` which are beneficial for SEO.
- **Restricted Toolbar**: Limits options to only those necessary for structured content (Headings, Bold, Lists), preventing messy formatting.
- **Security**: React Quill sanitizes input to prevent XSS attacks (no script tags allowed).
- **Responsive Design**: Adapts to mobile and desktop screens.
- **Fixed Height**: Ensures a consistent editing experience with scrollable content area.

## Props

| Prop | Type | Description |
|------|------|-------------|
| `value` | `string` | The HTML content string to display in the editor. |
| `onChange` | `function` | Callback function receiving the new HTML content string. |
| `placeholder` | `string` | Optional placeholder text when the editor is empty. |

## Usage Example