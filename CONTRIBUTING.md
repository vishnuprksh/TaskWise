# Contributing to TaskWise

Thank you for your interest in contributing to TaskWise! This document provides guidelines for contributing to the project.

## Development Setup

1. **Fork and clone the repository**
   ```bash
   git clone https://github.com/your-username/TaskWise.git
   cd TaskWise
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

## Code Organization

### File Structure
- **Frontend code**: `public/js/`
  - `modules/`: Core application modules
  - `services/`: External service integrations
  - `utils/`: Utility functions
- **Backend code**: `src/`
- **Documentation**: `docs/`
- **Debug tools**: `public/debug/`

### Coding Standards

1. **JavaScript**
   - Use ES6+ features
   - Follow consistent naming conventions
   - Add JSDoc comments for public methods
   - Use meaningful variable and function names

2. **HTML/CSS**
   - Use semantic HTML elements
   - Follow BEM methodology for CSS classes
   - Ensure responsive design
   - Test accessibility

3. **Git Workflow**
   - Use descriptive commit messages
   - Create feature branches for new work
   - Keep commits focused and atomic
   - Rebase before submitting pull requests

## Testing

1. **Manual Testing**
   - Use debug tools in `public/debug/`
   - Test on multiple browsers
   - Verify PWA functionality

2. **Automated Testing**
   ```bash
   npm test
   npm run lint
   ```

## Pull Request Process

1. **Before submitting**
   - Run `npm run tidy` to clean up code
   - Ensure all tests pass
   - Update documentation if needed

2. **Pull Request Guidelines**
   - Provide clear description of changes
   - Include screenshots for UI changes
   - Reference related issues
   - Keep PRs focused and small

## Bug Reports

When reporting bugs, please include:
- Steps to reproduce
- Expected vs actual behavior
- Browser and OS information
- Console errors (if any)

## Feature Requests

For new features:
- Check existing issues first
- Provide clear use case
- Consider implementation complexity
- Be open to discussion

## Questions?

Feel free to open an issue for any questions about contributing!
