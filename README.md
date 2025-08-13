# Web App Security Simulation - Insecure Wallet Flow Playground

![Security Badge](https://img.shields.io/badge/Security-Educational%20Purpose-red)
![Node.js](https://img.shields.io/badge/Node.js-v20.18.0-green)
![Express](https://img.shields.io/badge/Express-v5.1.0-blue)
![License](https://img.shields.io/badge/License-MIT-yellow)

## ⚠️ SECURITY WARNING

**This application contains intentional security vulnerabilities for educational purposes only. DO NOT deploy this application in a production environment or expose it to the internet without proper security controls.**

---

## Project Overview

This project is a comprehensive web application security simulation that demonstrates common OWASP Top 10 vulnerabilities and their remediation strategies. It consists of two versions:

1. **Insecure Version** (`server.js`) - Contains intentional vulnerabilities for demonstration
2. **Secure Version** (`server-secure.js`) - Implements proper security controls and remediation

### Educational Objectives

- Demonstrate real-world web application vulnerabilities
- Provide hands-on experience with penetration testing
- Show proper security remediation techniques
- Illustrate OWASP Top 10 vulnerabilities in practice
- Teach secure coding practices

---

##  Architecture

### Backend

- **Framework:** Node.js with Express.js
- **Authentication:** JWT (JSON Web Tokens)
- **Data Storage:** In-memory (for simplicity)
- **Security:** Intentional vulnerabilities vs. secure implementation

### Frontend

- **Technology:** HTML5, CSS3, JavaScript (Vanilla)
- **Design:** Responsive, modern UI with gradient backgrounds
- **Features:** Real-time vulnerability testing panel

---

## Implemented Vulnerabilities (Insecure Version)

### 1. Insecure Direct Object References (IDOR)

- **OWASP Category:** A01:2021 - Broken Access Control
- **Description:** Users can access other users' data by manipulating user ID parameters
- **Endpoints Affected:** `/api/user/:userId`, `/api/balance/:userId`, `/api/transactions/:userId`

### 2. Broken Authentication

- **OWASP Category:** A07:2021 - Identification and Authentication Failures
- **Issues:** 
  - Weak JWT secret ("secret123")
  - No token expiration
  - No rate limiting
  - Weak password requirements

### 3. Missing Authorization Controls

- **OWASP Category:** A01:2021 - Broken Access Control
- **Description:** Admin endpoints accessible to any authenticated user
- **Endpoints Affected:** `/api/admin/users`, `/api/admin/modify-balance`

### 4. Information Disclosure

- **OWASP Category:** A09:2021 - Security Logging and Monitoring Failures
- **Issues:**
  - Detailed error messages
  - Sensitive data in API responses
  - Internal system information exposure

### 5. Weak Session Management

- **Issues:**
  - No session invalidation on logout
  - Persistent tokens
  - No timeout mechanisms

---

## Security Fixes (Secure Version)

### Authentication & Authorization

-   Strong JWT secrets with `crypto.randomBytes()`
-   Token expiration (1 hour)
-   Token invalidation on logout
-   Role-based access control (RBAC)
-   Proper authorization checks for all endpoints

### Input Validation & Security

-   Strong password requirements
-   Input sanitization and validation
-   Rate limiting (5 attempts per 15 minutes)
-   Request payload size limits
-   Email format validation

### Error Handling & Information Security

-   Generic error messages
-   Data minimization in responses
-   Centralized error handling
-   Audit logging for admin actions

---

## 🚀 Quick Start

### Prerequisites

- Node.js (v18+ recommended)
- npm or yarn package manager

### Installation

1. **Clone the repository:**

    ```bash
    git clone <repository-url>
    cd insecure-wallet-app
    ```

2. **Install dependencies:**

    ```bash
    npm install
    ```

3. **Run the insecure version:**

    ```bash
    npm start
    # or
    node server.js
    ```
    Access at: [http://localhost:3000](http://localhost:3000)

4. **Run the secure version:**

    ```bash
    node server-secure.js
    ```
    Access at: [http://localhost:3001](http://localhost:3001)

### Default Credentials

**Insecure Version:**
- Admin: `admin` / `admin123`

**Secure Version:**
- Admin: `admin` / `SecureAdmin123!`

---

## Testing Vulnerabilities

### Built-in Testing Panel

The application includes a red "Vulnerability Testing" button that provides automated tests for:
- IDOR vulnerabilities
- Authentication bypass attempts
- Admin access control testing

### Manual Testing with curl

#### Test IDOR Vulnerability

```bash
# Login as regular user
curl -X POST http://localhost:3000/api/login \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"123"}'

# Access admin user data (should fail in secure version)
curl -X GET http://localhost:3000/api/user/[ADMIN_ID] \
  -H "Authorization: Bearer [TOKEN]"
```

#### Test Admin Access Bypass

```bash
# Access admin endpoint as regular user (should fail in secure version)
curl -X GET http://localhost:3000/api/admin/users \
  -H "Authorization: Bearer [REGULAR_USER_TOKEN]"
```

---

## Project Structure

```
insecure-wallet-app/
├── server.js                    # Insecure version with vulnerabilities
├── server-secure.js             # Secure version with fixes
├── package.json                 # Node.js dependencies
├── public/                      # Frontend files
│   ├── index.html               # Main HTML file
│   ├── styles.css               # CSS styling
│   └── script.js                # Frontend JavaScript
├── VULNERABILITIES.md           # Detailed vulnerability documentation
├── SECURITY_REMEDIATION.md      # Security fixes documentation
├── penetration_testing.md       # Penetration testing report
├── project_plan.md              # Project architecture and planning
└── README.md                    # This file
```

---

## Documentation

- **[VULNERABILITIES.md](VULNERABILITIES.md)** - Detailed vulnerability descriptions and exploitation methods
- **[SECURITY_REMEDIATION.md](SECURITY_REMEDIATION.md)** - Complete security fixes and remediation strategies
- **[penetration_testing.md](penetration_testing.md)** - Penetration testing methodology and results
- **[project_plan.md](project_plan.md)** - Project architecture and implementation plan

---

## Learning Path

### For Beginners

1. Start with the insecure version
2. Explore the application functionality
3. Use the built-in vulnerability testing panel
4. Read the vulnerability documentation
5. Compare with the secure version

### For Advanced Users

1. Perform manual penetration testing
2. Use tools like Burp Suite or OWASP ZAP
3. Analyze the source code differences
4. Implement additional security measures
5. Create custom exploit scripts

---

## Development

### Adding New Vulnerabilities

1. Identify the vulnerability type
2. Implement in the insecure version
3. Document the vulnerability
4. Create tests for exploitation
5. Implement the fix in the secure version

### Running in Development

```bash
# Install nodemon for auto-restart
npm install -g nodemon

# Run with auto-restart
nodemon server.js
```

---

## 🔧 API Endpoints

### Authentication

- `POST /api/register` - User registration
- `POST /api/login` - User login
- `POST /api/logout` - User logout (secure version only)

### User Management

- `GET /api/user/:userId` - Get user profile
- `GET /api/balance/:userId` - Get user balance
- `GET /api/users` - Get users list (for dropdown)

### Transactions

- `POST /api/send` - Send money
- `GET /api/transactions/:userId` - Get transaction history

### Admin (Secure version requires admin role)

- `GET /api/admin/users` - Get all users
- `POST /api/admin/modify-balance` - Modify user balance

### Utility

- `GET /api/health` - Health check (secure version only)

---

## Common Vulnerabilities Demonstrated

| Vulnerability           | OWASP 2021 | Severity | Exploitable |
|------------------------|------------|----------|-------------|
| IDOR                   | A01        | High     | yes        |
| Broken Authentication  | A07        | High     | yes        |
| Missing Authorization  | A01        | High     | yes        |
| Information Disclosure | A09        | Medium   | yes        |
| Weak Session Management| A07        | Medium   | yes        |

---

## Use Cases

### Educational Institutions

- Cybersecurity courses
- Web application security labs
- Penetration testing training
- Secure coding workshops

### Security Professionals

- Training junior developers
- Demonstrating vulnerabilities to stakeholders
- Testing security tools
- Creating custom training scenarios

### Developers

- Learning secure coding practices
- Understanding common vulnerabilities
- Testing security implementations
- Code review training

---

## Contributing

Contributions are welcome! Please read our contributing guidelines:

1. Fork the repository
2. Create a feature branch
3. Add vulnerabilities or security fixes
4. Update documentation
5. Submit a pull request

### Areas for Contribution

- Additional OWASP Top 10 vulnerabilities
- More sophisticated attack scenarios
- Enhanced testing tools
- Better documentation
- Frontend improvements

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## ⚖ Legal Disclaimer

This software is provided for educational purposes only. The authors and contributors are not responsible for any misuse of this software. Users must ensure they have proper authorization before testing or using this application in any environment.

---

## Acknowledgments

- OWASP Foundation for security guidelines
- Node.js and Express.js communities
- Security researchers and educators
- Open source security tools

---

## Support

For questions, issues, or contributions:

- Create an issue on GitHub
- Review the documentation
- Check existing issues and discussions

---

**Remember: This is an educational tool. Always practice responsible disclosure and ethical hacking principles.**
