# Contributing to Web App Security Simulation

Thank you for your interest in contributing to this educational security project! This guide will help you get started with contributing to the Insecure Wallet Flow Playground.

## 🎯 Project Goals

This project aims to:
- Demonstrate common web application vulnerabilities
- Provide hands-on security education
- Show proper remediation techniques
- Maintain realistic, exploitable examples
- Follow responsible disclosure principles

## 🤝 How to Contribute

### Types of Contributions Welcome

1. **New Vulnerabilities**
   - Additional OWASP Top 10 vulnerabilities
   - Real-world attack scenarios
   - Advanced exploitation techniques

2. **Security Improvements**
   - Enhanced remediation strategies
   - Better security controls
   - Performance optimizations

3. **Documentation**
   - Improved explanations
   - Additional examples
   - Translation to other languages

4. **Testing & Tools**
   - Automated testing scripts
   - Integration with security tools
   - CI/CD improvements

5. **Frontend Enhancements**
   - Better user interface
   - Mobile responsiveness
   - Accessibility improvements

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- Git
- Basic understanding of web security
- Familiarity with JavaScript/Node.js

### Development Setup

1. **Fork the Repository**
```bash
# Fork on GitHub, then clone your fork
git clone https://github.com/YOUR_USERNAME/insecure-wallet-app.git
cd insecure-wallet-app
```

2. **Install Dependencies**
```bash
npm install
```

3. **Create a Branch**
```bash
git checkout -b feature/your-feature-name
# or
git checkout -b vulnerability/new-vulnerability-name
# or
git checkout -b fix/security-improvement
```

4. **Test Your Changes**
```bash
# Test insecure version
npm start

# Test secure version
node server-secure.js
```

## 📝 Contribution Guidelines

### Adding New Vulnerabilities

When adding a new vulnerability:

1. **Research the Vulnerability**
   - Understand the OWASP category
   - Research real-world examples
   - Identify common exploitation methods

2. **Implement in Insecure Version**
   - Add vulnerable code to `server.js`
   - Ensure it's easily exploitable
   - Make it realistic and educational

3. **Document the Vulnerability**
   - Add to `VULNERABILITIES.md`
   - Include exploitation steps
   - Provide code examples

4. **Create Tests**
   - Add to built-in testing panel
   - Include curl examples
   - Document expected behavior

5. **Implement the Fix**
   - Add secure implementation to `server-secure.js`
   - Document the remediation in `SECURITY_REMEDIATION.md`
   - Explain the security principles applied

### Code Style Guidelines

#### JavaScript Style
```javascript
// Use const/let instead of var
const express = require('express');
let users = [];

// Use descriptive variable names
const authenticateToken = (req, res, next) => {
    // Implementation
};

// Add comments for security-relevant code
// VULNERABILITY: Weak JWT secret (easily guessable)
const JWT_SECRET = 'secret123';

// SECURITY FIX: Strong JWT secret
const JWT_SECRET = crypto.randomBytes(64).toString('hex');
```

#### Documentation Style
- Use clear, concise language
- Include code examples
- Provide step-by-step instructions
- Mark security issues clearly
- Include impact assessments

### Commit Message Format

Use conventional commit format:

```
type(scope): description

[optional body]

[optional footer]
```

**Types:**
- `feat`: New feature or vulnerability
- `fix`: Security fix or bug fix
- `docs`: Documentation changes
- `test`: Adding or updating tests
- `refactor`: Code refactoring
- `style`: Code style changes

**Examples:**
```
feat(auth): add SQL injection vulnerability to login endpoint

Implements a basic SQL injection vulnerability in the login
endpoint to demonstrate improper input validation.

Closes #123

fix(auth): implement proper input sanitization

Adds parameterized queries and input validation to prevent
SQL injection attacks in the secure version.

docs(readme): update installation instructions

Clarifies Node.js version requirements and adds troubleshooting
section for common installation issues.
```

## 🧪 Testing Guidelines

### Manual Testing
1. Test both insecure and secure versions
2. Verify vulnerabilities are exploitable
3. Confirm fixes prevent exploitation
4. Test edge cases and error conditions

### Automated Testing
```bash
# Run existing tests (when available)
npm test

# Test API endpoints
curl -X POST http://localhost:3000/api/login \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"test"}'
```

### Security Testing
- Use built-in vulnerability testing panel
- Test with security tools (Burp Suite, OWASP ZAP)
- Verify proper error handling
- Check for information disclosure

## 📋 Pull Request Process

### Before Submitting
- [ ] Code follows style guidelines
- [ ] All tests pass
- [ ] Documentation is updated
- [ ] Vulnerabilities are properly documented
- [ ] Security fixes are implemented in secure version

### Pull Request Template
```markdown
## Description
Brief description of changes

## Type of Change
- [ ] New vulnerability
- [ ] Security fix
- [ ] Documentation update
- [ ] Bug fix
- [ ] Feature enhancement

## Testing
- [ ] Tested insecure version
- [ ] Tested secure version
- [ ] Manual exploitation confirmed
- [ ] Security fix verified

## Documentation
- [ ] Updated VULNERABILITIES.md
- [ ] Updated SECURITY_REMEDIATION.md
- [ ] Updated README.md if needed
- [ ] Added code comments

## Checklist
- [ ] Code follows project style
- [ ] Self-review completed
- [ ] No sensitive information committed
- [ ] Educational value maintained
```

### Review Process
1. **Automated Checks**: CI/CD pipeline runs
2. **Security Review**: Maintainers verify security aspects
3. **Educational Review**: Ensure educational value
4. **Code Review**: Check code quality and style
5. **Testing**: Verify functionality and exploitability

## 🛡️ Security Considerations

### Responsible Development
- Never commit real secrets or credentials
- Ensure vulnerabilities are educational, not malicious
- Document all security implications
- Follow responsible disclosure principles

### What NOT to Include
- Real production vulnerabilities without permission
- Malicious code or backdoors
- Personal information or credentials
- Copyrighted code without permission

## 📚 Resources

### Security Learning Resources
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [OWASP Testing Guide](https://owasp.org/www-project-web-security-testing-guide/)
- [PortSwigger Web Security Academy](https://portswigger.net/web-security)
- [SANS Secure Coding Practices](https://www.sans.org/white-papers/2172/)

### Development Resources
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [Express.js Security](https://expressjs.com/en/advanced/best-practice-security.html)
- [JWT Security Best Practices](https://auth0.com/blog/a-look-at-the-latest-draft-for-jwt-bcp/)

## 🏷️ Issue Labels

When creating issues, use appropriate labels:

- `vulnerability`: New vulnerability to implement
- `security-fix`: Security improvement needed
- `documentation`: Documentation updates
- `enhancement`: Feature improvements
- `bug`: Bug fixes
- `good-first-issue`: Good for newcomers
- `help-wanted`: Extra attention needed

## 💬 Communication

### Getting Help
- Create an issue for questions
- Check existing issues and documentation
- Join discussions in pull requests

### Reporting Security Issues
For actual security vulnerabilities in the project infrastructure (not educational vulnerabilities):
- Email maintainers privately
- Do not create public issues
- Follow responsible disclosure

## 🎉 Recognition

Contributors will be recognized in:
- README.md contributors section
- Release notes
- Project documentation

## 📄 License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for helping make web security education better! 🔒

